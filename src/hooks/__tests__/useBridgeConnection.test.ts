// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useBridgeConnection } from "../useBridgeConnection";
import type { BackendPayload } from "../../../extension/backend/types";
import type { TreeNode } from "@/types";

type PortMessageListener = (message: unknown) => void;
type PortDisconnectListener = () => void;
type RuntimeMessageListener = (
  message: unknown,
  sender: chrome.runtime.MessageSender,
) => void;

type FakePort = {
  port: chrome.runtime.Port;
  name: string;
  postedMessages: unknown[];
  disconnectedByPanel: boolean;
  receive: (message: unknown) => void;
  dropFromBackground: () => void;
  failNextPost: () => void;
};

function createFakeChrome(tabId = 42) {
  const ports: FakePort[] = [];
  const runtimeMessageListeners = new Set<RuntimeMessageListener>();
  let extensionId: string | undefined = "test-extension-id";

  const createPort = (name: string): FakePort => {
    const messageListeners = new Set<PortMessageListener>();
    const disconnectListeners = new Set<PortDisconnectListener>();
    const postedMessages: unknown[] = [];
    let disconnectedByPanel = false;
    let failNextPostMessage = false;

    const port = {
      name,
      postMessage: (message: unknown) => {
        if (!extensionId) {
          throw new Error("Extension context invalidated.");
        }
        if (failNextPostMessage) {
          failNextPostMessage = false;
          throw new Error("Attempting to use a disconnected port object");
        }
        postedMessages.push(message);
      },
      disconnect: () => {
        disconnectedByPanel = true;
      },
      onMessage: {
        addListener: (listener: PortMessageListener) => {
          messageListeners.add(listener);
        },
        removeListener: (listener: PortMessageListener) => {
          messageListeners.delete(listener);
        },
      },
      onDisconnect: {
        addListener: (listener: PortDisconnectListener) => {
          disconnectListeners.add(listener);
        },
        removeListener: (listener: PortDisconnectListener) => {
          disconnectListeners.delete(listener);
        },
      },
    } as unknown as chrome.runtime.Port;

    const fakePort: FakePort = {
      port,
      name,
      postedMessages,
      get disconnectedByPanel() {
        return disconnectedByPanel;
      },
      receive: (message: unknown) => {
        for (const listener of [...messageListeners]) {
          listener(message);
        }
      },
      dropFromBackground: () => {
        for (const listener of [...disconnectListeners]) {
          listener();
        }
      },
      failNextPost: () => {
        failNextPostMessage = true;
      },
    };

    ports.push(fakePort);
    return fakePort;
  };

  const chromeMock = {
    devtools: {
      inspectedWindow: { tabId },
    },
    runtime: {
      get id() {
        return extensionId;
      },
      connect: (connectInfo?: chrome.runtime.ConnectInfo) => {
        if (!extensionId) {
          throw new Error("Extension context invalidated.");
        }
        return createPort(connectInfo?.name ?? "").port;
      },
      onMessage: {
        addListener: (listener: RuntimeMessageListener) => {
          runtimeMessageListeners.add(listener);
        },
        removeListener: (listener: RuntimeMessageListener) => {
          runtimeMessageListeners.delete(listener);
        },
      },
    },
  };

  const sendBackendPayload = (fakePort: FakePort, payload: BackendPayload) => {
    fakePort.receive({ source: "react-map-backend", payload });
  };

  const sendPageLoad = (senderTabId = tabId) => {
    for (const listener of [...runtimeMessageListeners]) {
      listener(
        {
          source: "react-map-content-script",
          payload: { mode: "page-load" },
        },
        { tab: { id: senderTabId } } as chrome.runtime.MessageSender,
      );
    }
  };

  const invalidateExtension = () => {
    extensionId = undefined;
    const latest = ports.at(-1);
    if (latest && !latest.disconnectedByPanel) {
      latest.dropFromBackground();
    }
  };

  return {
    chromeMock,
    ports,
    sendBackendPayload,
    sendPageLoad,
    invalidateExtension,
  };
}

const initialTree: TreeNode = {
  name: "App",
  instanceId: 1,
  children: [{ name: "Counter", instanceId: 2 }],
};

const updatedTree: TreeNode = {
  name: "App",
  instanceId: 1,
  children: [
    { name: "Counter", instanceId: 2 },
    { name: "Footer", instanceId: 3 },
  ],
};

const counterDetailsV1: TreeNode = {
  name: "Counter",
  instanceId: 2,
  props: { count: 1 },
  state: null,
};

const counterDetailsV2: TreeNode = {
  name: "Counter",
  instanceId: 2,
  props: { count: 2 },
  state: null,
};

describe("useBridgeConnection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("reconnects after an unexpected disconnect so the tree and selected node details keep updating", () => {
    const fake = createFakeChrome();
    vi.stubGlobal("chrome", fake.chromeMock);

    const { result } = renderHook(() => useBridgeConnection());

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(fake.ports).toHaveLength(1);
    const firstPort = fake.ports[0];

    act(() => {
      fake.sendBackendPayload(firstPort, {
        mode: "tree-minimal",
        tree: initialTree as never,
      });
      result.current.handleSelectNode({ instanceId: 2, name: "Counter" });
      fake.sendBackendPayload(firstPort, {
        mode: "node-detail",
        instanceId: 2,
        node: counterDetailsV1 as never,
      });
    });

    expect(result.current.status).toBe("success");
    expect(result.current.selection).toEqual({
      status: "live",
      instanceId: 2,
      name: "Counter",
      details: counterDetailsV1,
    });

    // Background script stops after idle timeout.
    act(() => {
      firstPort.dropFromBackground();
      vi.advanceTimersByTime(1000);
    });

    expect(fake.ports).toHaveLength(2);
    const reconnectedPort = fake.ports[1];
    expect(reconnectedPort.postedMessages).toEqual([
      { source: "react-map-panel", payload: "init" },
    ]);

    act(() => {
      fake.sendBackendPayload(reconnectedPort, {
        mode: "tree-minimal",
        tree: updatedTree as never,
      });
      fake.sendBackendPayload(reconnectedPort, {
        mode: "node-detail",
        instanceId: 2,
        node: counterDetailsV2 as never,
      });
    });

    expect(result.current.currentFiberTree).toEqual(updatedTree);
    expect(result.current.selection).toEqual({
      status: "live",
      instanceId: 2,
      name: "Counter",
      details: counterDetailsV2,
    });
  });

  it("keeps the tree, selected node, and collapsed branches visible during reconnection and on a quiet page", () => {
    const fake = createFakeChrome();
    vi.stubGlobal("chrome", fake.chromeMock);

    const { result } = renderHook(() => useBridgeConnection());

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const firstPort = fake.ports[0];
    expect(firstPort.postedMessages).toEqual([
      { source: "react-map-panel", payload: "init" },
      { source: "react-map-panel", payload: { type: "panel-close" } },
    ]);

    act(() => {
      fake.sendBackendPayload(firstPort, {
        mode: "tree-minimal",
        tree: initialTree as never,
      });
      result.current.handleToggleBranch(1);
      result.current.handleSelectNode({ instanceId: 2, name: "Counter" });
      fake.sendBackendPayload(firstPort, {
        mode: "node-detail",
        instanceId: 2,
        node: counterDetailsV1 as never,
      });
    });

    // Drop the port and stay quiet well past CONNECTION_TIMEOUT_MS.
    act(() => {
      firstPort.dropFromBackground();
    });

    expect(result.current.status).toBe("success");
    expect(result.current.currentFiberTree).toEqual(initialTree);
    expect(result.current.selection).toEqual({
      status: "live",
      instanceId: 2,
      name: "Counter",
      details: counterDetailsV1,
    });
    expect([...result.current.collapsedBranches]).toEqual([1]);

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(fake.ports).toHaveLength(2);
    // Reconnection must not send panel-close.
    expect(fake.ports[1].postedMessages).toEqual([
      { source: "react-map-panel", payload: "init" },
    ]);
    expect(result.current.status).toBe("success");
    expect(result.current.currentFiberTree).toEqual(initialTree);
    expect(result.current.selection).toEqual({
      status: "live",
      instanceId: 2,
      name: "Counter",
      details: counterDetailsV1,
    });
    expect([...result.current.collapsedBranches]).toEqual([1]);
  });

  it("shows the new tree on a page reload after reconnection with no false no-react message", () => {
    const fake = createFakeChrome();
    vi.stubGlobal("chrome", fake.chromeMock);

    const { result } = renderHook(() => useBridgeConnection());

    act(() => {
      vi.advanceTimersByTime(0);
    });

    act(() => {
      fake.sendBackendPayload(fake.ports[0], {
        mode: "tree-minimal",
        tree: initialTree as never,
      });
    });

    act(() => {
      fake.ports[0].dropFromBackground();
      vi.advanceTimersByTime(1000);
    });

    expect(fake.ports).toHaveLength(2);

    act(() => {
      fake.sendPageLoad();
    });

    expect(result.current.status).toBe("loading");
    expect(result.current.currentFiberTree).toBeNull();

    act(() => {
      fake.sendBackendPayload(fake.ports[1], {
        mode: "tree-minimal",
        tree: updatedTree as never,
      });
      vi.advanceTimersByTime(10_000);
    });

    expect(result.current.status).toBe("success");
    expect(result.current.currentFiberTree).toEqual(updatedTree);
  });

  it("disconnects the reconnected port and cancels pending reconnects when the panel closes", () => {
    const fake = createFakeChrome();
    vi.stubGlobal("chrome", fake.chromeMock);

    const { unmount } = renderHook(() => useBridgeConnection());

    act(() => {
      vi.advanceTimersByTime(0);
    });

    act(() => {
      fake.ports[0].dropFromBackground();
      vi.advanceTimersByTime(1000);
    });

    expect(fake.ports).toHaveLength(2);
    expect(fake.ports[1].disconnectedByPanel).toBe(false);

    unmount();

    expect(fake.ports[1].disconnectedByPanel).toBe(true);

    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(fake.ports).toHaveLength(2);
  });

  it("keeps only one active connection and ignores messages from replaced ports", () => {
    const fake = createFakeChrome();
    vi.stubGlobal("chrome", fake.chromeMock);

    const { result } = renderHook(() => useBridgeConnection());

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const firstPort = fake.ports[0];

    act(() => {
      fake.sendBackendPayload(firstPort, {
        mode: "tree-minimal",
        tree: initialTree as never,
      });
    });

    // Drop the first port, then manually retry before the reconnect timer fires.
    act(() => {
      firstPort.dropFromBackground();
      result.current.handleRetry();
      vi.advanceTimersByTime(1000);
    });

    // Only one new port was created (pending reconnect was cancelled).
    expect(fake.ports).toHaveLength(2);
    const secondPort = fake.ports[1];

    act(() => {
      fake.sendBackendPayload(secondPort, {
        mode: "tree-minimal",
        tree: updatedTree as never,
      });
    });

    // A stray message on the old port must not overwrite the current tree.
    act(() => {
      fake.sendBackendPayload(firstPort, {
        mode: "tree-minimal",
        tree: initialTree as never,
      });
    });

    expect(result.current.currentFiberTree).toEqual(updatedTree);
  });

  it("stops reconnecting and shows a clear message when the extension is reloaded", () => {
    const fake = createFakeChrome();
    vi.stubGlobal("chrome", fake.chromeMock);

    const { result } = renderHook(() => useBridgeConnection());

    act(() => {
      vi.advanceTimersByTime(0);
    });

    act(() => {
      fake.sendBackendPayload(fake.ports[0], {
        mode: "tree-minimal",
        tree: initialTree as never,
      });
    });

    act(() => {
      fake.invalidateExtension();
      vi.advanceTimersByTime(60_000);
    });

    expect(fake.ports).toHaveLength(1);
    expect(result.current.status).toBe("extension-reloaded");
    expect(result.current.statusMessage).toMatch(/reloaded/i);
  });

  it("stops reconnecting and shows a clear message if connect throws during reconnect", () => {
    const fake = createFakeChrome();
    vi.stubGlobal("chrome", fake.chromeMock);

    const { result } = renderHook(() => useBridgeConnection());

    act(() => {
      vi.advanceTimersByTime(0);
    });

    act(() => {
      fake.sendBackendPayload(fake.ports[0], {
        mode: "tree-minimal",
        tree: initialTree as never,
      });
    });

    // Disconnect happens first, then extension is invalidated before reconnect runs.
    act(() => {
      fake.ports[0].dropFromBackground();
      fake.invalidateExtension();
      vi.advanceTimersByTime(1000);
    });

    expect(fake.ports).toHaveLength(1);
    expect(result.current.status).toBe("extension-reloaded");
    expect(result.current.statusMessage).toMatch(/reloaded/i);
  });

  it("keeps reconnecting across repeated idle disconnects on a quiet page", () => {
    const fake = createFakeChrome();
    vi.stubGlobal("chrome", fake.chromeMock);

    const { result } = renderHook(() => useBridgeConnection());

    act(() => {
      vi.advanceTimersByTime(0);
    });

    act(() => {
      fake.sendBackendPayload(fake.ports[0], {
        mode: "tree-minimal",
        tree: initialTree as never,
      });
    });

    for (let i = 0; i < 3; i++) {
      act(() => {
        fake.ports[i].dropFromBackground();
        vi.advanceTimersByTime(30_000);
      });
    }

    expect(fake.ports).toHaveLength(4);
    expect(result.current.status).toBe("success");
    expect(result.current.currentFiberTree).toEqual(initialTree);

    act(() => {
      fake.sendBackendPayload(fake.ports[3], {
        mode: "tree-minimal",
        tree: updatedTree as never,
      });
    });

    expect(result.current.currentFiberTree).toEqual(updatedTree);
  });

  it("does not misclassify a disconnected-port postMessage race as an extension reload", () => {
    const fake = createFakeChrome();
    vi.stubGlobal("chrome", fake.chromeMock);

    const { result } = renderHook(() => useBridgeConnection());

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const firstPort = fake.ports[0];

    act(() => {
      fake.sendBackendPayload(firstPort, {
        mode: "tree-minimal",
        tree: initialTree as never,
      });
    });

    // Simulate selecting a node right as the worker drops, before onDisconnect fires.
    firstPort.failNextPost();
    act(() => {
      result.current.handleSelectNode({ instanceId: 2, name: "Counter" });
    });

    expect(result.current.status).toBe("success");

    act(() => {
      firstPort.dropFromBackground();
      vi.advanceTimersByTime(1000);
    });

    expect(fake.ports).toHaveLength(2);
    expect(result.current.status).toBe("success");
  });
});

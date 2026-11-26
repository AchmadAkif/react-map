import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  type RefObject,
} from "react";
import type {
  BackendPayload,
  Message,
  PanelCommand,
} from "../../extension/backend/types";
import {
  nextCollapsedBranches,
  nextSelection,
  NOTHING_COLLAPSED,
  NOTHING_SELECTED,
  type BranchId,
} from "@/utils";
import type { NodeRef, TreeNode } from "@/types";

export type PanelStatus =
  | "success"
  | "loading"
  | "error"
  | "no-react"
  | "extension-reloaded";

const CONNECTION_TIMEOUT_MS = 5000;
const RECONNECT_DELAY_MS = 100;

const WAITING_MESSAGE = "Waiting for a React tree from the inspected page.";
const NO_REACT_MESSAGE =
  "No React tree has been captured yet. React-Map reads the tree from React's commit hook, so trigger a React render if needed, then retry.";
const EXTENSION_RELOADED_MESSAGE =
  "The React-Map extension was reloaded. Close and reopen DevTools to reconnect.";

const inspectedTabId = () => chrome.devtools.inspectedWindow.tabId;
const isExtensionContextInvalidated = () => !chrome.runtime?.id;
const isInvalidatedError = (error: unknown) =>
  isExtensionContextInvalidated() ||
  (error instanceof Error && /extension context invalidated/i.test(error.message));

const clearTimer = (timerRef: RefObject<number | null>) => {
  if (timerRef.current !== null) {
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }
};

type ActivePort = {
  port: chrome.runtime.Port;
  cleanup: () => void;
};

export function useBridgeConnection() {
  const activePortRef = useRef<ActivePort | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const bootstrapTimerRef = useRef<number | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const connectRef = useRef<(options?: { isReconnect?: boolean }) => void>(
    () => {},
  );

  const [currentFiberTree, setCurrentFiberTree] = useState<TreeNode | null>(
    null,
  );
  const [selection, dispatchSelection] = useReducer(
    nextSelection,
    NOTHING_SELECTED,
  );
  const [collapsedBranches, dispatchCollapse] = useReducer(
    nextCollapsedBranches,
    NOTHING_COLLAPSED,
  );
  const [status, setStatus] = useState<PanelStatus>("loading");
  const [statusMessage, setStatusMessage] = useState(WAITING_MESSAGE);

  const detachActivePort = useCallback((disconnect: boolean) => {
    const active = activePortRef.current;
    if (!active) return;
    activePortRef.current = null;
    active.cleanup();
    if (disconnect) {
      active.port.disconnect();
    }
  }, []);

  const markExtensionReloaded = useCallback(() => {
    clearTimer(reconnectTimerRef);
    clearTimer(timeoutRef);
    detachActivePort(false);
    setCurrentFiberTree(null);
    setStatus("extension-reloaded");
    setStatusMessage(EXTENSION_RELOADED_MESSAGE);
  }, [detachActivePort]);

  const scheduleReconnect = useCallback(() => {
    clearTimer(reconnectTimerRef);
    reconnectTimerRef.current = window.setTimeout(() => {
      reconnectTimerRef.current = null;
      connectRef.current({ isReconnect: true });
    }, RECONNECT_DELAY_MS);
  }, []);

  const connectToBridge = useCallback(
    ({ isReconnect = false }: { isReconnect?: boolean } = {}) => {
      clearTimer(reconnectTimerRef);

      if (isExtensionContextInvalidated()) {
        markExtensionReloaded();
        return;
      }

      if (!isReconnect) {
        clearTimer(timeoutRef);
        setStatus("loading");
        setStatusMessage(WAITING_MESSAGE);
      }

      let createdPort: chrome.runtime.Port;
      try {
        createdPort = chrome.runtime.connect({
          name: inspectedTabId().toString(),
        });
      } catch (error) {
        if (isInvalidatedError(error)) {
          markExtensionReloaded();
        } else {
          scheduleReconnect();
        }
        return;
      }

      const onMessageListener = (message: Message) => {
        if (activePortRef.current?.port !== createdPort) return;

        if (
          message.source === "react-map-backend" &&
          typeof message.payload !== "string"
        ) {
          const payload = message.payload as unknown as BackendPayload;
          if (payload.mode === "node-detail") {
            dispatchSelection({
              type: "details-received",
              instanceId: payload.instanceId,
              details: payload.node as unknown as TreeNode | null,
            });
            return;
          }

          if (payload.mode !== "tree-minimal") return;

          clearTimer(timeoutRef);

          const tree = payload.tree as unknown as TreeNode | null;
          dispatchCollapse({ type: "tree-received", tree });

          if (tree) {
            setCurrentFiberTree(tree);
            setStatus("success");
            setStatusMessage("");
          } else {
            setCurrentFiberTree(null);
            setStatus("no-react");
            setStatusMessage(NO_REACT_MESSAGE);
          }
        }
      };

      const cleanup = () => {
        createdPort.onMessage.removeListener(onMessageListener);
        createdPort.onDisconnect.removeListener(onDisconnectListener);
      };

      const onDisconnectListener = () => {
        cleanup();
        if (activePortRef.current?.port !== createdPort) return;
        activePortRef.current = null;

        if (isExtensionContextInvalidated()) {
          markExtensionReloaded();
          return;
        }

        dispatchSelection({ type: "unexpected-disconnect" });
        scheduleReconnect();
      };

      createdPort.onMessage.addListener(onMessageListener);
      // Only fires when the other side drops the connection.
      createdPort.onDisconnect.addListener(onDisconnectListener);

      const previousActive = activePortRef.current;
      activePortRef.current = { port: createdPort, cleanup };

      try {
        createdPort.postMessage({
          source: "react-map-panel",
          payload: "init",
        });
      } catch (error) {
        cleanup();
        activePortRef.current = null;
        previousActive?.cleanup();
        previousActive?.port.disconnect();
        if (isInvalidatedError(error)) {
          markExtensionReloaded();
        } else {
          scheduleReconnect();
        }
        return;
      }

      if (!isReconnect) {
        timeoutRef.current = window.setTimeout(() => {
          setCurrentFiberTree(null);
          setStatus("error");
          setStatusMessage(
            "Timed out waiting for the inspected page to respond. React DevTools may be missing, the page may not use React, or the bridge may be blocked.",
          );
        }, CONNECTION_TIMEOUT_MS);
      }

      // Only after the new port took over, or it would count as a panel close.
      previousActive?.cleanup();
      previousActive?.port.disconnect();
    },
    [markExtensionReloaded, scheduleReconnect],
  );

  useEffect(() => {
    connectRef.current = connectToBridge;
  }, [connectToBridge]);

  const sendCommand = useCallback(
    (command: PanelCommand) => {
      if (isExtensionContextInvalidated()) {
        markExtensionReloaded();
        return;
      }

      try {
        activePortRef.current?.port.postMessage({
          source: "react-map-panel",
          payload: command,
        });
      } catch (error) {
        if (isInvalidatedError(error)) {
          markExtensionReloaded();
        }
      }
    },
    [markExtensionReloaded],
  );

  const handleSelectNode = useCallback(
    ({ instanceId, name }: NodeRef) => {
      dispatchSelection({ type: "select", instanceId, name });
      sendCommand({ type: "select-node", instanceId });
    },
    [sendCommand],
  );

  const handleDeselectNode = useCallback(() => {
    dispatchSelection({ type: "deselect" });
    sendCommand({ type: "deselect-node" });
  }, [sendCommand]);

  const handleToggleBranch = useCallback((instanceId: BranchId) => {
    dispatchCollapse({ type: "toggle", instanceId });
  }, []);

  // Listens outside the port, so a reload is noticed after a disconnect too.
  useEffect(() => {
    const onPageLoad = (
      message: Message | undefined,
      sender: chrome.runtime.MessageSender,
    ) => {
      if (
        message?.source !== "react-map-content-script" ||
        sender.tab?.id !== inspectedTabId()
      ) {
        return;
      }

      const payload = message.payload as unknown as BackendPayload;
      if (payload.mode !== "page-load") return;

      // The old tree goes too: its instance IDs mean nothing to the new page.
      dispatchSelection({ type: "page-reload" });
      dispatchCollapse({ type: "page-reload" });
      setCurrentFiberTree(null);
      setStatus("loading");
      setStatusMessage(WAITING_MESSAGE);

      clearTimer(timeoutRef);
      // Stays connected, so a page that is slow to render still shows up.
      timeoutRef.current = window.setTimeout(() => {
        setStatus("no-react");
        setStatusMessage(NO_REACT_MESSAGE);
      }, CONNECTION_TIMEOUT_MS);
    };

    chrome.runtime.onMessage.addListener(onPageLoad);
    return () => chrome.runtime.onMessage.removeListener(onPageLoad);
  }, []);

  useEffect(() => {
    bootstrapTimerRef.current = window.setTimeout(() => {
      connectToBridge();
      // A panel that closed while disconnected could not tell the page.
      sendCommand({ type: "panel-close" });
    }, 0);

    return () => {
      clearTimer(bootstrapTimerRef);
      clearTimer(reconnectTimerRef);
      clearTimer(timeoutRef);
      detachActivePort(true);
      dispatchSelection({ type: "panel-close" });
    };
  }, [connectToBridge, detachActivePort, sendCommand]);

  const handleRetry = useCallback(() => {
    setCurrentFiberTree(null);
    connectToBridge();
  }, [connectToBridge]);

  return {
    currentFiberTree,
    collapsedBranches,
    selection,
    status,
    statusMessage,
    handleToggleBranch,
    handleSelectNode,
    handleDeselectNode,
    handleRetry,
  };
}

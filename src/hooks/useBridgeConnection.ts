import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type {
  BackendPayload,
  Message,
  PanelCommand,
} from "../../extension/backend/types";
import { nextSelection, NOTHING_SELECTED } from "@/utils";
import type { NodeRef, TreeNode } from "@/types";

export type PanelStatus = "success" | "loading" | "error" | "no-react";

const CONNECTION_TIMEOUT_MS = 5000;

const WAITING_MESSAGE = "Waiting for a React tree from the inspected page.";
const NO_REACT_MESSAGE =
  "No React tree has been captured yet. React-Map reads the tree from React's commit hook, so trigger a React render if needed, then retry.";

const inspectedTabId = () => chrome.devtools.inspectedWindow.tabId;

export function useBridgeConnection() {
  const portRef = useRef<chrome.runtime.Port | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const bootstrapTimerRef = useRef<number | null>(null);

  const [currentFiberTree, setCurrentFiberTree] = useState<TreeNode | null>(
    null,
  );
  const [selection, dispatchSelection] = useReducer(
    nextSelection,
    NOTHING_SELECTED,
  );
  const [status, setStatus] = useState<PanelStatus>("loading");
  const [statusMessage, setStatusMessage] = useState(WAITING_MESSAGE);

  const clearConnectionTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const connectToBridge = useCallback(() => {
    clearConnectionTimeout();

    setStatus("loading");
    setStatusMessage(WAITING_MESSAGE);

    const createdPort = chrome.runtime.connect({
      name: inspectedTabId().toString(),
    });

    const onMessageListener = (message: Message) => {
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

        clearConnectionTimeout();

        if (payload.tree) {
          setCurrentFiberTree(payload.tree as unknown as TreeNode);
          setStatus("success");
          setStatusMessage("");
        } else {
          setCurrentFiberTree(null);
          setStatus("no-react");
          setStatusMessage(NO_REACT_MESSAGE);
        }
      }
    };

    createdPort.onMessage.addListener(onMessageListener);
    // Only fires when the other side drops the connection.
    createdPort.onDisconnect.addListener(() => {
      if (portRef.current !== createdPort) return;
      portRef.current = null;
      dispatchSelection({ type: "unexpected-disconnect" });
    });
    createdPort.postMessage({
      source: "react-map-panel",
      payload: "init",
    });

    timeoutRef.current = window.setTimeout(() => {
      setCurrentFiberTree(null);
      setStatus("error");
      setStatusMessage(
        "Timed out waiting for the inspected page to respond. React DevTools may be missing, the page may not use React, or the bridge may be blocked.",
      );
    }, CONNECTION_TIMEOUT_MS);

    // Only after the new port took over, or it would count as a panel close.
    portRef.current?.disconnect();
    portRef.current = createdPort;
  }, [clearConnectionTimeout]);

  const sendCommand = useCallback((command: PanelCommand) => {
    portRef.current?.postMessage({
      source: "react-map-panel",
      payload: command,
    });
  }, []);

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
      setCurrentFiberTree(null);
      setStatus("loading");
      setStatusMessage(WAITING_MESSAGE);

      clearConnectionTimeout();
      // Stays connected, so a page that is slow to render still shows up.
      timeoutRef.current = window.setTimeout(() => {
        setStatus("no-react");
        setStatusMessage(NO_REACT_MESSAGE);
      }, CONNECTION_TIMEOUT_MS);
    };

    chrome.runtime.onMessage.addListener(onPageLoad);
    return () => chrome.runtime.onMessage.removeListener(onPageLoad);
  }, [clearConnectionTimeout]);

  useEffect(() => {
    bootstrapTimerRef.current = window.setTimeout(() => {
      connectToBridge();
      // A panel that closed while disconnected could not tell the page.
      sendCommand({ type: "panel-close" });
    }, 0);

    return () => {
      if (bootstrapTimerRef.current !== null) {
        window.clearTimeout(bootstrapTimerRef.current);
        bootstrapTimerRef.current = null;
      }
      clearConnectionTimeout();
      if (portRef.current) {
        portRef.current.disconnect();
        portRef.current = null;
      }
      dispatchSelection({ type: "panel-close" });
    };
  }, [clearConnectionTimeout, connectToBridge, sendCommand]);

  const handleRetry = useCallback(() => {
    setCurrentFiberTree(null);
    connectToBridge();
  }, [connectToBridge]);

  return {
    currentFiberTree,
    selection,
    status,
    statusMessage,
    handleSelectNode,
    handleDeselectNode,
    handleRetry,
  };
}

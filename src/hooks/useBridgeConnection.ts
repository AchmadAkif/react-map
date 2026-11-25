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
  const [statusMessage, setStatusMessage] = useState(
    "Waiting for a React tree from the inspected page.",
  );

  const clearConnectionTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const connectToBridge = useCallback(() => {
    clearConnectionTimeout();

    if (portRef.current) {
      portRef.current.disconnect();
      portRef.current = null;
    }

    setStatus("loading");
    setStatusMessage("Waiting for a React tree from the inspected page.");

    const createdPort = chrome.runtime.connect({
      name: chrome.devtools.inspectedWindow.tabId.toString(),
    });

    const onMessageListener = (message: Message) => {
      if (
        message.source === "react-map-backend" &&
        typeof message.payload !== "string"
      ) {
        clearConnectionTimeout();

        const payload = message.payload as unknown as BackendPayload;
        if (payload.mode === "node-detail") {
          dispatchSelection({
            type: "details-received",
            instanceId: payload.instanceId,
            details: payload.node as unknown as TreeNode | null,
          });
          return;
        }

        if (payload.tree) {
          setCurrentFiberTree(payload.tree as unknown as TreeNode);
          setStatus("success");
          setStatusMessage("");
        } else {
          setCurrentFiberTree(null);
          setStatus("no-react");
          setStatusMessage(
            "No React tree has been captured yet. React-Map reads the tree from React's commit hook, so trigger a React render if needed, then retry.",
          );
        }
      }
    };

    createdPort.onMessage.addListener(onMessageListener);
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
      createdPort.disconnect();
    }, CONNECTION_TIMEOUT_MS);

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

  useEffect(() => {
    bootstrapTimerRef.current = window.setTimeout(() => {
      connectToBridge();
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
    };
  }, [clearConnectionTimeout, connectToBridge]);

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

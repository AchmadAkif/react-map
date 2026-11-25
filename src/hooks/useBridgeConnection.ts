import { useCallback, useEffect, useRef, useState } from "react";
import type { BridgeSnapshot, Message } from "../../extension/backend/types";
import type { TreeNode } from "@/types";

export type PanelStatus = "success" | "loading" | "error" | "no-react";

const CONNECTION_TIMEOUT_MS = 5000;

export function useBridgeConnection() {
  const portRef = useRef<chrome.runtime.Port | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const bootstrapTimerRef = useRef<number | null>(null);

  const [currentFiberTree, setCurrentFiberTree] = useState<TreeNode | null>(
    null,
  );
  const [nodeDetailCache, setNodeDetailCache] = useState<
    Record<string, TreeNode>
  >({});
  const [selectedNodeData, setSelectedNodeData] = useState<TreeNode | null>(
    null,
  );
  const [selectedNodePath, setSelectedNodePath] = useState<string | null>(null);
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

        const fiberSnapshot = message.payload as unknown as BridgeSnapshot;
        if (fiberSnapshot.tree) {
          setCurrentFiberTree(fiberSnapshot.tree as unknown as TreeNode);
          setStatus("success");
          setStatusMessage("");
        }

        const nextSelectedNodePath = fiberSnapshot.selectedNodePath;
        if (typeof nextSelectedNodePath === "string") {
          const selectedNode = fiberSnapshot.selectedNode;
          if (selectedNode) {
            setNodeDetailCache((prev) => ({
              ...prev,
              [nextSelectedNodePath]: selectedNode as unknown as TreeNode,
            }));
            setSelectedNodeData(selectedNode as unknown as TreeNode);
          } else {
            setSelectedNodeData(null);
          }

          setSelectedNodePath(nextSelectedNodePath);
        } else if (fiberSnapshot.tree) {
          setSelectedNodeData((prev) => prev);
          setSelectedNodePath((prev) => prev);
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

  const handleSelectedNodeChange = useCallback(
    (nodePath: string | null) => {
      if (!portRef.current) {
        return;
      }

      if (nodePath === null) {
        setSelectedNodeData(null);
        setSelectedNodePath(null);
      } else {
        setSelectedNodePath(nodePath);
        setSelectedNodeData(nodeDetailCache[nodePath] ?? null);
      }

      portRef.current.postMessage({
        source: "react-map-panel",
        payload:
          nodePath === null
            ? {
                type: "deselect-node",
              }
            : {
                type: "select-node",
                nodePath,
              },
      });
    },
    [nodeDetailCache],
  );

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
    selectedNodeData,
    selectedNodePath,
    status,
    statusMessage,
    handleSelectedNodeChange,
    handleRetry,
  };
}

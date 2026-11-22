import { useCallback, useEffect, useRef, useState } from "react";
import type { BridgeSnapshot, Message } from "../../extension/backend/types";
import type { TreeNode } from "@/types";

export type PanelStatus = "success" | "loading" | "error" | "no-react";

const CONNECTION_TIMEOUT_MS = 5000;

export function useBridgeConnection() {
  const portRef = useRef<chrome.runtime.Port | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const bootstrapTimerRef = useRef<number | null>(null);

  const [currentFiberTree, setCurrentFiberTree] = useState<TreeNode | null>(null);
  const [nodeDetailCache, setNodeDetailCache] = useState<Record<string, TreeNode>>({});
  const [lockedNodeData, setLockedNodeData] = useState<TreeNode | null>(null);
  const [lockedNodePath, setLockedNodePath] = useState<string | null>(null);
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

        const nextLockedNodePath = fiberSnapshot.lockedNodePath;
        if (typeof nextLockedNodePath === "string") {
          const lockedNode = fiberSnapshot.lockedNode;
          if (lockedNode) {
            setNodeDetailCache((prev) => ({
              ...prev,
              [nextLockedNodePath]: lockedNode as unknown as TreeNode,
            }));
            setLockedNodeData(lockedNode as unknown as TreeNode);
          } else {
            setLockedNodeData(null);
          }

          setLockedNodePath(nextLockedNodePath);
        } else if (fiberSnapshot.tree) {
          setLockedNodeData((prev) => prev);
          setLockedNodePath((prev) => prev);
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

  const handleLockNodeChange = useCallback(
    (nodePath: string | null) => {
      if (!portRef.current) {
        return;
      }

      if (nodePath === null) {
        setLockedNodeData(null);
        setLockedNodePath(null);
      } else {
        setLockedNodePath(nodePath);
        setLockedNodeData(nodeDetailCache[nodePath] ?? null);
      }

      portRef.current.postMessage({
        source: "react-map-panel",
        payload:
          nodePath === null
            ? {
                type: "unlock-node",
              }
            : {
                type: "lock-node",
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
    lockedNodeData,
    lockedNodePath,
    status,
    statusMessage,
    handleLockNodeChange,
    handleRetry,
  };
}

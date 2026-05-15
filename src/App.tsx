import { useCallback, useEffect, useRef, useState } from "react";
import { MainContainer } from "./containers";
import ErrorPage from "./containers/Error/Error.container";
import { Spinner } from "./components/ui/spinner";

import type { Message } from "../extension/backend/types";
import type { RawNodeDatum } from "react-d3-tree";

type PanelStatus = "success" | "loading" | "error" | "no-react";

const CONNECTION_TIMEOUT_MS = 5000;

function App() {
  const portRef = useRef<chrome.runtime.Port | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const bootstrapTimerRef = useRef<number | null>(null);
  const [currentFiberTree, setCurrentFiberTree] = useState<RawNodeDatum | null>(
    null,
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

        const fiberTree = message.payload;
        if (fiberTree) {
          setCurrentFiberTree(fiberTree);
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

  const handleRetry = () => {
    setCurrentFiberTree(null);
    connectToBridge();
  };

  if (status === "success" && currentFiberTree) {
    return <MainContainer data={currentFiberTree} />;
  } else if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  } else if (status === "error" || status === "no-react") {
    return (
      <ErrorPage
        title={
          status === "no-react" ? "No React tree captured" : "Connection failed"
        }
        message={statusMessage}
        actionLabel="Retry"
        onAction={handleRetry}
      />
    );
  }
}

export default App;

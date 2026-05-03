import { useEffect, useRef, useState } from "react";
import { MainContainer, ErrorPage } from "./containers";
import { Spinner } from "./components/ui/spinner";

import type { Message } from "../extension/backend/types";
import type { RawNodeDatum } from "react-d3-tree";

function App() {
  const portRef = useRef<chrome.runtime.Port | null>(null);
  const [currentFiberTree, setCurrentFiberTree] = useState<RawNodeDatum | null>(
    null,
  );
  const [status, setStatus] = useState<"success" | "loading" | "error">(
    "loading",
  );

  useEffect(() => {
    // Create connection with background-service on mount
    const createdPort = chrome.runtime.connect({
      name: chrome.devtools.inspectedWindow.tabId.toString(),
    });

    createdPort.postMessage({
      source: "react-map-panel",
      payload: "init",
    });

    const onMessageListener = (message: Message) => {
      if (
        message.source === "react-map-backend" &&
        typeof message.payload !== "string"
      ) {
        const fiberTree = message.payload;
        if (fiberTree) {
          setCurrentFiberTree(fiberTree);
          setStatus("success");
        } else {
          setStatus("error");
        }
      }
    };

    createdPort.onMessage.addListener(onMessageListener);
    portRef.current = createdPort;

    return () => {
      createdPort.disconnect();
      if (portRef.current === createdPort) {
        portRef.current = null;
      }
    };
  }, []);

  if (status === "success" && currentFiberTree) {
    return <MainContainer data={currentFiberTree} />;
  } else if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  } else if (status === "error") {
    return <ErrorPage />;
  }
}

export default App;

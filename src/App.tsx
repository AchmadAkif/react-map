import { useEffect, useRef, useState } from "react";
import { MainContainer } from "./containers";

import type { Message } from "../extension/backend/types";
import type { RawNodeDatum } from "react-d3-tree";

function App() {
  const portRef = useRef<chrome.runtime.Port | null>(null);
  const [currentFiberTree, setCurrentFiberTree] = useState<RawNodeDatum | null>(
    null,
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
        setCurrentFiberTree(fiberTree);
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

  if (typeof currentFiberTree === "object" && currentFiberTree !== null) {
    return <MainContainer data={currentFiberTree} />;
  }
  /**
   * TODO
   * @see https://github.com/AchmadAkif/react-map/issues/16
   */
  return (
    <>
      <h2>
        Cannot render react component tree. Triggering a setState() usually
        fixes this.
      </h2>
      <p>Note: React-Sight works best on local projects with React v16+</p>
    </>
  );
}

export default App;

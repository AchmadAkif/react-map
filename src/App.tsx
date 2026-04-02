import { useEffect, useRef, useState } from "react";
import type { Message, MessagePayload } from "../extension/backend/types";
import "./App.css";

function App() {
  const portRef = useRef<chrome.runtime.Port | null>(null);
  const [currentFiberTree, setCurrentFiberTree] =
    useState<MessagePayload | null>(null);

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
        console.log(message);
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
    return <h1>{currentFiberTree.name}</h1>;
  }

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

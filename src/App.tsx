import { useEffect, useRef } from "react";
import type { Message } from "../extension/backend/types";
import "./App.css";

function App() {
  const portRef = useRef<chrome.runtime.Port | null>(null);

  const handleClick = () => {
    const currentPort = portRef.current;
    currentPort?.postMessage({
      source: "react-map-panel",
      payload: `Hi! from tab id ${chrome.devtools.inspectedWindow.tabId}`,
    });
  };

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
      if (message.source === "react-map-backend") {
        console.log(message);
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

  return <button onClick={handleClick}>Say Hi!</button>;
}

export default App;

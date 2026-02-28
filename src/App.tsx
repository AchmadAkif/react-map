import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [port, setPort] = useState<chrome.runtime.Port | null>(null);
  const [tabId, setTabId] = useState<number | null>(null);

  useEffect(() => {
    // Connect to the background script
    const runtimePort = chrome.runtime.connect({ name: "react-map-panel" });
    setPort(runtimePort);

    // Get the inspected tab ID
    const inspectedTabId = chrome.devtools.inspectedWindow.tabId;
    setTabId(inspectedTabId);

    // Send initial message
    runtimePort.postMessage({
      type: "panel-init",
      tabId: inspectedTabId,
    });

    // Listen for messages
    runtimePort.onMessage.addListener((message) => {
      console.log("Message received in React app:", message);
      // Handle messages from background/content scripts here
    });

    // Cleanup on unmount
    return () => {
      runtimePort.disconnect();
    };
  }, []);

  return (
    <>
      <h1>React-Map DevTools</h1>
      <p>Connected to tab: {tabId}</p>
      <p>Status: {port ? "Connected" : "Disconnected"}</p>
    </>
  );
}

export default App;

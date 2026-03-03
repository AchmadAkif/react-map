import { useEffect, useRef } from "react";
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
    portRef.current = createdPort;
  }, []);

  return <button onClick={handleClick}>Say Hi!</button>;
}

export default App;

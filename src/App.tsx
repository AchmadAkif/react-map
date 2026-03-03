import { useEffect, useRef } from "react";
import "./App.css";

function App() {
  const portRef = useRef<chrome.runtime.Port | null>(null);

  const handleClick = () => {
    console.log(portRef);
  };

  useEffect(() => {
    // Create connection with background.ts on mount
    const createdPort = chrome.runtime.connect({ name: "react-map-panel" });
    createdPort.postMessage({
      tabId: chrome.devtools.inspectedWindow.tabId,
      type: "init",
    });
    portRef.current = createdPort;
  }, []);

  return <button onClick={handleClick}>Say Hi!</button>;
}

export default App;

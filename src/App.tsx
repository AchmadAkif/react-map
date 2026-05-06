import { useEffect, useRef, useState } from "react";
import { MainContainer, ErrorPage } from "./containers";
import { Spinner } from "./components/ui/spinner";

import type {
  ComponentStateUpdatePayload,
  Message,
} from "../extension/backend/types";
import type { RawNodeDatum } from "react-d3-tree";

function App() {
  const portRef = useRef<chrome.runtime.Port | null>(null);
  const [currentFiberTree, setCurrentFiberTree] = useState<RawNodeDatum | null>(
    null,
  );
  const [status, setStatus] = useState<"success" | "loading" | "error">(
    "loading",
  );
  const [componentUpdate, setComponentUpdate] =
    useState<ComponentStateUpdatePayload | null>(null);

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
      if (message.source !== "react-map-backend") {
        return;
      }

      if (typeof message.payload === "object" && message.payload !== null) {
        if ("type" in message.payload) {
          if (message.payload.type === "component-state-updated") {
            setComponentUpdate(message.payload);
          }
          return;
        }

        const fiberTree = message.payload as RawNodeDatum;
        setCurrentFiberTree(fiberTree);
        setStatus("success");
        return;
      }

      if (typeof message.payload === "string") {
        setStatus("error");
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
    return (
      <MainContainer
        data={currentFiberTree}
        componentUpdate={componentUpdate}
      />
    );
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

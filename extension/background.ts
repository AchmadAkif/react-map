import type { Message, Port } from "./backend/types";

const isReactMapDebugMode =
  import.meta.env.VITE_REACT_MAP_DEBUG_MODE === "true";

const handleConnection = (port: Port) => {
  if (isReactMapDebugMode) {
    console.log("Connection attempt received, port name:", port.name);
    if (port.name === "react-map-frontend") {
      console.log("connection established");
    }
  }

  port.onMessage.addListener((msg) => {
    console.log(msg);
  });
};

const handleMessage = (
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: object) => void,
) => {
  /**
   * Only accept messages that we know are ours. Note that this is not foolproof
   * and the page can easily spoof messages if it wants to.
   */
  if (
    typeof message !== "object" ||
    message === null ||
    message.source !== "react-map-extension"
  ) {
    return;
  }

  if (isReactMapDebugMode)
    console.log(
      `[React-Map] : received data from extension ID: ${sender.id}`,
      message,
    );

  // This response is only to prevent "The message port closed before a response was received" console warnings
  sendResponse({ status: 200, message: "message received" });
};

chrome.runtime.onConnect.addListener(handleConnection);
chrome.runtime.onMessage.addListener(handleMessage);

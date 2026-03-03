import type { Message, Port } from "./backend/types";

/**
 * Map of active port connections indexed by tab ID.
 * @type {Record<number, Port>}
 */
const connections: Record<number, Port> = {};

/**
 * List of allowed message sources that are permitted to communicate with the background script.
 * @type {string[]}
 */
const allowedMsgSources = ["react-map-extension", "react-map-panel"];

const handleConnection = (port: Port) => {
  const portMessageListener = (message: Message) => {
    console.log(message);
  };

  const portDisconnectListener = () => {
    port.onMessage.removeListener(portMessageListener);
  };

  port.onMessage.addListener(portMessageListener);
  port.onDisconnect.addListener(portDisconnectListener);

  connections[Number(port.name)] = port;
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
    !allowedMsgSources.includes(message.source)
  ) {
    return;
  }

  console.log(`received message from ${sender.tab?.id}: `, message);

  // This response is only to prevent "The message port closed before a response was received" console warnings
  sendResponse({ status: 200, message: "message received" });
};

chrome.runtime.onConnect.addListener(handleConnection);
chrome.runtime.onMessage.addListener(handleMessage);

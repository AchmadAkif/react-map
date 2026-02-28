import type { Message, Port } from "./backend/types";

/**
 * Maps panel instances to their associated tab IDs for managing multiple panel connections per tab.
 * @type {Record<number, Port>}
 */
const connections: Record<number, Port> = {};

const handleConnection = (port: Port) => {
  const connectionListener = (message: { tabId?: number; type?: string }) => {
    // Store the connection based on tabId
    if (message.tabId) {
      connections[message.tabId] = port;
      console.log(`Panel connected for tab ${message.tabId}`);
    }

    // Forward messages to content script if needed
    if (message.type === "panel-init" && message.tabId) {
      chrome.tabs.sendMessage(message.tabId, {
        type: "devtools-ready",
        source: "react-map-extension",
      });
    }
  };

  port.onMessage.addListener(connectionListener);

  port.onDisconnect.addListener(() => {
    port.onMessage.removeListener(connectionListener);
    // Remove connection when port disconnects
    Object.keys(connections).forEach((tabId) => {
      if (connections[Number(tabId)] === port) {
        delete connections[Number(tabId)];
        console.log(`Panel disconnected for tab ${tabId}`);
      }
    });
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

  console.log(`received message from ${sender.tab?.id}: `, message);

  // Forward message to the devtools panel for this tab
  const tabId = sender.tab?.id;
  if (tabId && connections[tabId]) {
    connections[tabId].postMessage(message);
  }

  // This response is only to prevent "The message port closed before a response was received" console warnings
  sendResponse({ status: 200, message: "message received" });
};

chrome.runtime.onConnect.addListener(handleConnection);
chrome.runtime.onMessage.addListener(handleMessage);

import type { Message } from "./backend/types";

/**
 * Map of active port connections indexed by tab ID.
 * @type {Record<number, chrome.runtime.Port>}
 */
const connections: Record<number, chrome.runtime.Port> = {};

/**
 * List of allowed message sources that are permitted to communicate with the background script.
 * @type {string[]}
 */
const allowedMsgSources = ["react-map-extension"];

const handleConnection = (port: chrome.runtime.Port) => {
  const tabId = Number(port.name);

  const portMessageListener = (message: Message) => {
    if (message.source === "react-map-panel" && message.payload === "init") {
      connections[tabId] = port;
      console.log(`tab ${tabId} connected`, message);

      return;
    }
    console.log(message.payload);
  };

  const portDisconnectListener = () => {
    port.onMessage.removeListener(portMessageListener);
    delete connections[tabId];
    console.log(`tab ${tabId} disconnected`);
  };

  port.onMessage.addListener(portMessageListener);
  port.onDisconnect.addListener(portDisconnectListener);
};

const handleMessage = (
  message: Message,
  sender: chrome.runtime.MessageSender,
) => {
  const senderTabId = sender.tab?.id;
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

  if (
    message.source === "react-map-extension" &&
    senderTabId !== undefined &&
    senderTabId in connections
  ) {
    const currentFiberNode = message;
    connections[senderTabId].postMessage({
      source: "react-map-backend",
      payload: currentFiberNode,
    });

    return;
  }

  /**
   * No response is sent because there are currently no sendMessage callers expecting one.
   * For more context on related console warnings, refer to this GitHub issue:
   * @see {@link https://github.com/mozilla/webextension-polyfill/issues/130#issue-333539552}
   */

  return;
};

chrome.runtime.onConnect.addListener(handleConnection);
chrome.runtime.onMessage.addListener(handleMessage);

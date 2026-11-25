import type {
  BackendPayload,
  BridgeSnapshot,
  Message,
  PanelCommand,
} from "./backend/types";

/**
 * Map of active port connections indexed by tab ID.
 * @type {Record<number, chrome.runtime.Port>}
 */
const connections: Record<number, chrome.runtime.Port> = {};
const cache: Record<number, BridgeSnapshot> = {};
/**
 * List of allowed message sources that are permitted to communicate with the background script.
 * @type {string[]}
 */
const allowedMsgSources = ["react-map-content-script"];

const postToPanel = (port: chrome.runtime.Port, payload: BackendPayload) => {
  port.postMessage({ source: "react-map-backend", payload });
};

const sendToPage = (tabId: number, payload: Message["payload"] | PanelCommand) => {
  chrome.tabs.sendMessage(tabId, { source: "react-map-panel", payload }, () => {
    if (chrome.runtime.lastError) {
      return;
    }
  });
};

const handleConnection = (port: chrome.runtime.Port) => {
  const tabId = Number(port.name);

  const portMessageListener = (message: Message) => {
    if (message.source === "react-map-panel" && message.payload === "init") {
      connections[tabId] = port;
      console.log(`tab ${tabId} connected`, message);

      const cachedPayload = cache[tabId];
      if (cachedPayload !== undefined) {
        const { tree, selectedNode, selectedInstanceId } = cachedPayload;
        postToPanel(port, { mode: "tree-minimal", tree });
        postToPanel(port, {
          mode: "node-detail",
          node: selectedNode,
          instanceId: selectedInstanceId,
        });
      }

      return;
    }

    if (message.source === "react-map-panel" && message.payload !== "init") {
      sendToPage(tabId, message.payload);
      return;
    }

    console.log(message.payload);
  };

  const portDisconnectListener = () => {
    port.onMessage.removeListener(portMessageListener);
    // A retry replaces the port before dropping the old one.
    if (connections[tabId] !== port) return;

    // An unexpected disconnect is this worker stopping, which never gets here,
    // so the panel was closed. The panel cannot say so itself: Chrome does not
    // deliver messages it posts while closing.
    delete connections[tabId];
    if (cache[tabId]) {
      cache[tabId] = {
        ...cache[tabId],
        selectedNode: null,
        selectedInstanceId: null,
      };
    }
    sendToPage(tabId, { type: "panel-close" });
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

  console.log(
    "msg received from content-script by extension background and cached",
    message,
    cache,
  );
  /**
   * Only accept messages that we know are ours. Note that this is not foolproof
   * and the page can easily spoof messages if it wants to.
   */
  if (
    typeof message !== "object" ||
    !message ||
    !allowedMsgSources.includes(message.source)
  ) {
    return;
  }

  if (
    message.source === "react-map-content-script" &&
    senderTabId !== undefined
  ) {
    const payload = message.payload as unknown as BackendPayload;

    if (payload.mode === "page-load") {
      // The panel receives this message itself.
      delete cache[senderTabId];
      return;
    }

    const existingSnapshot = cache[senderTabId] ?? {
      tree: null,
      selectedNode: null,
      selectedInstanceId: null,
    };

    if (payload.mode === "tree-minimal") {
      cache[senderTabId] = {
        tree: payload.tree,
        selectedNode: existingSnapshot.selectedNode,
        selectedInstanceId: existingSnapshot.selectedInstanceId,
      };
    } else {
      cache[senderTabId] = {
        ...existingSnapshot,
        selectedNode: payload.node,
        selectedInstanceId: payload.instanceId,
      };
    }

    if (senderTabId in connections) {
      // Forward only what changed: resending the tree with every detail would
      // reset the drawn tree, and resending cached details could be stale.
      postToPanel(connections[senderTabId], payload);
      return;
    }
    return;
  }

  /**
   * No response is sent because there are currently no sendMessage callers expecting one.
   * For more context on related console warnings, refer to this GitHub issue:
   * @see {@link https://github.com/mozilla/webextension-polyfill/issues/130#issue-333539552}
   */

  return;
};

chrome.runtime.onMessage.addListener(handleMessage);
chrome.runtime.onConnect.addListener(handleConnection);

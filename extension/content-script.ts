function injectScript(file: string, node: string) {
  const targetElement = document.getElementsByTagName(node)[0];
  const scriptElement = document.createElement("script");

  scriptElement.setAttribute("type", "text/javascript");
  scriptElement.setAttribute("src", file);

  if (!targetElement) {
    return;
  }

  targetElement.appendChild(scriptElement);
}

// setTimeout(() => {
//   injectScript(chrome.runtime.getURL("/installHook.js"), "body");
// }, 5000);

// Use MutationObserver instead of setTimeout for reliable hook injection
function injectWhenNodeAvailable(file: string, node: string) {
  const existingTarget = document.getElementsByTagName(node)[0];
  if (existingTarget) {
    injectScript(file, node);
    return;
  }

  const observer = new MutationObserver(() => {
    const target = document.getElementsByTagName(node)[0];
    if (target) {
      observer.disconnect();
      injectScript(file, node);
    }
  });

  const root = document.documentElement || document;
  observer.observe(root, {
    childList: true,
    subtree: true,
  });
}

// Listen message from user app(webpage context) *installHook.ts*
window.addEventListener("message", (e) => {
  const message = e.data;
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

  // Pass message to background
  chrome.runtime.sendMessage(message);
});

injectWhenNodeAvailable(chrome.runtime.getURL("/installHook.js"), "body");

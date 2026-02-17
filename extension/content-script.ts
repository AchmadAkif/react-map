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

injectWhenNodeAvailable(chrome.runtime.getURL("/installHook.js"), "body");

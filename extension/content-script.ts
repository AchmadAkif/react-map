function injectScript(file: string, node: string) {
  const targetElement = document.getElementsByTagName(node)[0];
  const scriptElement = document.createElement("script");

  scriptElement.setAttribute("type", "text/javascript");
  scriptElement.setAttribute("src", file);
  targetElement.appendChild(scriptElement);
}

setTimeout(() => {
  injectScript(chrome.runtime.getURL("/installHook.js"), "body");
}, 5000);

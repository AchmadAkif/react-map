chrome.devtools.panels.create("React-Map", "", "index.html", (panel) => {
  // Create connection when panel is created
  let port: chrome.runtime.Port | null = null;

  panel.onShown.addListener(() => {
    // Establish connection when panel is shown
    if (!port) {
      port = chrome.runtime.connect({ name: "react-map-frontend" });
      port.postMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        type: "init",
      });
    }
  });

  panel.onHidden.addListener(() => {
    // Optional: handle when panel is hidden
  });
});

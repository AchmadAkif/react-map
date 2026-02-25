chrome.devtools.panels.create("React-Map", "", "index.html", () => {
  const port = chrome.runtime.connect({ name: "react-map-frontend" });
  port.postMessage({
    source: "react-map-extension",
    payload: { message: "react-map-extension" },
  });
});

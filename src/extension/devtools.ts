chrome.devtools.panels.create(
  "React-Map",
  "MyPanelIcon.png",
  "index.html",
  function (panel) {
    console.log("panel created", panel);
  },
);

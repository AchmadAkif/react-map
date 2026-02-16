const __isReactMapDebugMode = true;

// eslint-disable-next-line no-prototype-builtins
const hasReactDevtoolsInstalled = window.hasOwnProperty(
  "__REACT_DEVTOOLS_GLOBAL_HOOK__",
);

if (!hasReactDevtoolsInstalled) {
  console.warn(
    "[React-Map]: React Map requires React Dev Tools to be installed.",
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reactInstances = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers;
const instance = reactInstances.get(1);
const instanceVersion = instance.version;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const devtoolsHook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;

let __ReactMapFiberDOM;

// Begin monkey-patch
(function installHook() {
  if (!hasReactDevtoolsInstalled) {
    console.error(
      "[React-Map] Error: React Devtools needs to be installed first before using this extension.",
    );
    return;
  }

  if (instance && instanceVersion) {
    if (__isReactMapDebugMode)
      console.log("[React-Map] React version: ", instanceVersion);

    const __original_onCommitFiberRootFn = devtoolsHook.onCommitFiberRoot;

    devtoolsHook.onCommitFiberRoot = function onCommitFiberRoot(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...args: any[]
    ) {
      __ReactMapFiberDOM = args[1];

      if (__isReactMapDebugMode)
        console.log("[React-Map] DOM : ", __ReactMapFiberDOM);

      return __original_onCommitFiberRootFn(...args);
    };
  }
})();

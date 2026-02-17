const isReactMapDebugMode = true;

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
const devtoolsGlobalHook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
const reactInstances = devtoolsGlobalHook?.renderers;
const instance = reactInstances?.get?.(1);
const instanceVersion = instance?.version;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const devtoolsHook = devtoolsGlobalHook;

let ReactMapFiberDOM;

// Begin monkey-patch
(function installHook() {
  if (!hasReactDevtoolsInstalled || !devtoolsGlobalHook) {
    console.error(
      "[React-Map] Error: React Devtools needs to be installed first before using this extension.",
    );
    return;
  }

  if (instance && instanceVersion) {
    if (isReactMapDebugMode)
      console.log("[React-Map] React version: ", instanceVersion);

    const __original_onCommitFiberRootFn = devtoolsHook.onCommitFiberRoot;

    devtoolsHook.onCommitFiberRoot = function onCommitFiberRoot(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...args: any[]
    ) {
      ReactMapFiberDOM = args[1];

      if (isReactMapDebugMode)
        console.log("[React-Map] DOM : ", ReactMapFiberDOM);

      return __original_onCommitFiberRootFn(...args);
    };
  }
})();

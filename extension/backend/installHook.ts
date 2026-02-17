/* eslint-disable @typescript-eslint/no-explicit-any */
const isReactMapDebugMode = true;

const hasReactDevtoolsInstalled = Object.hasOwn(
  window,
  "__REACT_DEVTOOLS_GLOBAL_HOOK__",
);

if (!hasReactDevtoolsInstalled) {
  console.warn(
    "[React-Map]: React Map requires React Dev Tools to be installed.",
  );
}

const devtoolsGlobalHook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
const reactInstances = devtoolsGlobalHook?.renderers;
const instance = reactInstances?.get?.(1);
const instanceVersion = instance?.version;
const devtoolsHook = devtoolsGlobalHook;

let ReactMapFiberDOM;

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

    /* 
      Begin monkey-patch react devtools onCommitFiberRoot function.
      onCommitFiberRoot function will run every component changes, a state updates, or the app first loads.
    */
    devtoolsHook.onCommitFiberRoot = function onCommitFiberRoot(
      rendererID: number,
      // The FiberRoot object provided by React DevTools' onCommitFiberRoot hook.
      root: any,
      ...rest: any[]
    ) {
      ReactMapFiberDOM = root;

      if (isReactMapDebugMode)
        console.log("[React-Map] DOM : ", ReactMapFiberDOM);

      return __original_onCommitFiberRootFn(rendererID, root, ...rest);
    };
  }
})();

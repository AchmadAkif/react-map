/* eslint-disable @typescript-eslint/no-explicit-any */
import { traverseFiber } from "./fiberCrawler";
import type { FiberRoot } from "./reactInternal.types";

const isReactMapDebugMode = import.meta.env.VITE_REACT_MAP_DEBUG_MODE;

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

    // Begin monkey-patch react devtools onCommitFiberRoot function.
    // onCommitFiberRoot function will run every component changes, a state updates, or the app first loads.
    devtoolsHook.onCommitFiberRoot = function onCommitFiberRoot(
      rendererID: number,
      root: any,
      ...rest: any[]
    ) {
      const ReactMapFiberDOM: FiberRoot = root;

      try {
        const currentRenderedNode = ReactMapFiberDOM.current;
        const serializedNode = traverseFiber(currentRenderedNode);
        if (isReactMapDebugMode) console.log(serializedNode);
      } catch (error) {
        console.error("[React Map] Error: ", error);
        return;
      }

      return __original_onCommitFiberRootFn(rendererID, root, ...rest);
    };
  }
})();

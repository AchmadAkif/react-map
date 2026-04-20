/* eslint-disable @typescript-eslint/no-explicit-any */
import { traverseFiber } from "./fiberCrawler";
import type { FiberRoot } from "./reactInternal.types";

const isReactMapDebugMode =
  import.meta.env.VITE_REACT_MAP_DEBUG_MODE === "true";

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

const debounce = (callback: (...args: any[]) => void, wait: number) => {
  let timeoutId: number | null = null;

  return (...args: any[]) => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, wait);
  };
};

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

    // Debounce fiber traversal to improve performance
    const debouncedFiberTraversal = debounce((root: FiberRoot) => {
      try {
        const currentRenderedNode = root.current;
        const serializedNode = traverseFiber(currentRenderedNode);
        // Send data to content-script
        window.postMessage(
          {
            source: "react-map-installHook",
            payload: serializedNode,
          },
          window.location.origin,
        );
      } catch (error) {
        console.error("[React-Map] Error: ", error);
        return;
      }
    }, 500);

    // Begin monkey-patch react devtools onCommitFiberRoot function.
    // onCommitFiberRoot function will run every component changes, a state updates, or the app first loads.
    devtoolsHook.onCommitFiberRoot = function onCommitFiberRoot(
      rendererID: number,
      root: any,
      ...rest: any[]
    ) {
      debouncedFiberTraversal(root);
      return __original_onCommitFiberRootFn(rendererID, root, ...rest);
    };
  }
})();

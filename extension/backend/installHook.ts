import { debounce } from "./utils";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const devtoolsGlobalHook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
const reactInstances = devtoolsGlobalHook?.renderers;
const instance = reactInstances?.get?.(1);
const instanceVersion = instance?.version;

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

    const __original_onCommitFiberRootFn = devtoolsGlobalHook.onCommitFiberRoot;

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

    // Check for already mounted fiber roots in case we missed the first onCommitFiberRoot execution on initial load
    if (devtoolsGlobalHook.getFiberRoots) {
      const roots = devtoolsGlobalHook.getFiberRoots(1);
      roots.forEach((root: FiberRoot) => debouncedFiberTraversal(root));
    }

    // Begin monkey-patch react devtools onCommitFiberRoot function.
    // onCommitFiberRoot function will run every component changes, a state updates, or the app first loads.
    devtoolsGlobalHook.onCommitFiberRoot = function onCommitFiberRoot(
      rendererID: number,
      root: FiberRoot,
      ...rest: unknown[]
    ) {
      debouncedFiberTraversal(root);
      return __original_onCommitFiberRootFn(rendererID, root, ...rest);
    };
  }
})();

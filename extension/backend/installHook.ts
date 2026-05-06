import { debounce, getComponentHooks, getComponentProps } from "./utils";
import { findFiberByPath, traverseFiber } from "./fiberCrawler";
import type { FiberRoot } from "./reactInternal.types";
import type { InspectCommandPayload } from "./types";

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

let latestRoot: FiberRoot | null = null;
let inspectedPath: number[] | null = null;

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

    const sendInspectedComponentUpdate = () => {
      if (!latestRoot || !inspectedPath) {
        return;
      }

      const fiber = findFiberByPath(latestRoot.current, inspectedPath);
      if (!fiber) {
        return;
      }

      window.postMessage(
        {
          source: "react-map-installHook",
          payload: {
            type: "component-state-updated",
            path: inspectedPath,
            state: getComponentHooks(fiber),
            props: getComponentProps(fiber),
          },
        },
        window.location.origin,
      );
    };

    const debouncedComponentUpdate = debounce(
      sendInspectedComponentUpdate,
      150,
    );

    // Debounce fiber traversal to improve performance
    const debouncedFiberTraversal = debounce((root: FiberRoot) => {
      try {
        const currentRenderedNode = root.current;
        const serializedNode = traverseFiber(currentRenderedNode);
        latestRoot = root;
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

    if (typeof devtoolsGlobalHook.on === "function") {
      devtoolsGlobalHook.on("operations", () => {
        debouncedComponentUpdate();
      });
    }
  }
})();

window.addEventListener("message", (event) => {
  const message = event.data;
  if (message?.source !== "react-map-panel") {
    return;
  }

  const payload = message.payload as InspectCommandPayload | undefined;
  if (!payload || typeof payload !== "object") {
    return;
  }

  if (payload.type === "inspect-component") {
    inspectedPath = payload.path;
    return;
  }

  if (payload.type === "stop-inspecting") {
    inspectedPath = null;
  }
});

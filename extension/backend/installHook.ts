import { debounce } from "./utils";
import {
  findFiberByNodePath,
  serializeNodeDetail,
  traverseFiberMinimal,
} from "./fiberCrawler";
import type { FiberRoot } from "./reactInternal.types";
import type {
  BackendPayload,
  NodeDetailSnapshotMessage,
  TreeMinimalSnapshotMessage,
} from "./types";

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
let latestCommittedRoot: FiberRoot | null = null;
let activeLockedNodePath: string | null = null;

const postSnapshot = (payload: BackendPayload) => {
  window.postMessage(
    {
      source: "react-map-installHook",
      payload,
    },
    window.location.origin,
  );
};

const sendTreeSnapshot = (root: FiberRoot) => {
  const serializedNode = traverseFiberMinimal(root.current);

  postSnapshot({
    mode: "tree-minimal",
    tree: serializedNode,
  } satisfies TreeMinimalSnapshotMessage);
};

const sendLockedNodeSnapshot = (root: FiberRoot, nodePath: string) => {
  const lockedFiberNode = findFiberByNodePath(root.current, nodePath);
  const serializedNode = serializeNodeDetail(lockedFiberNode, nodePath);

  postSnapshot({
    mode: "node-detail",
    node: serializedNode,
    nodePath,
  } satisfies NodeDetailSnapshotMessage);
};

window.addEventListener("message", (event) => {
  const message = event.data;

  if (
    typeof message !== "object" ||
    message === null ||
    message.source !== "react-map-panel"
  ) {
    return;
  }

  if (message.payload === "init") {
    if (latestCommittedRoot) {
      if (activeLockedNodePath) {
        sendLockedNodeSnapshot(latestCommittedRoot, activeLockedNodePath);
      } else {
        sendTreeSnapshot(latestCommittedRoot);
      }
    }

    return;
  }

  if (message.payload.type === "lock-node") {
    activeLockedNodePath = message.payload.nodePath;

    if (latestCommittedRoot && activeLockedNodePath) {
      sendLockedNodeSnapshot(latestCommittedRoot, activeLockedNodePath);
    }

    return;
  }

  if (message.payload.type === "unlock-node") {
    activeLockedNodePath = null;

    postSnapshot({
      mode: "node-detail",
      node: null,
      nodePath: null,
    } satisfies NodeDetailSnapshotMessage);
  }
});

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
        latestCommittedRoot = root;

        sendTreeSnapshot(root);

        if (activeLockedNodePath) {
          sendLockedNodeSnapshot(root, activeLockedNodePath);
        }
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
      latestCommittedRoot = root;
      debouncedFiberTraversal(root);
      return __original_onCommitFiberRootFn(rendererID, root, ...rest);
    };
  }
})();

import type { Fiber } from "./reactInternal.types";
import type { componentHook } from "../types";

export const getMetadataLabel = (tag: number): string => {
  switch (tag) {
    case 0:
      return "FunctionComponent";
    case 1:
      return "ClassComponent";
    case 3:
      return "Root";
    case 4:
      return "HostPortal";
    case 5:
      return "HostComponent";
    case 6:
      return "Text";
    case 7:
      return "Fragment";
    case 8:
      return "Mode";
    case 9:
      return "ContextConsumer";
    case 10:
      return "ContextProvider";
    case 11:
      return "ForwardRef";
    case 12:
      return "Profiler";
    case 13:
      return "SuspenseComponent";
    case 14:
      return "MemoComponent";
    case 15:
      return "SimpleMemoComponent";
    case 16:
      return "LazyComponent";
    case 17:
      return "IncompleteClassComponent ";
    case 18:
      return "DehydratedFragment";
    case 19:
      return "SuspenseListComponent";
    case 21:
      return "ScopeComponent";
    case 22:
      return "OffscreenComponent";
    case 23:
      return "LegacyHiddenComponent";
    case 24:
      return "CacheComponent";
    case 25:
      return "TracingMarkerComponent";
    case 26:
      return "HostHoistable";
    case 27:
      return "HostSingleton";
    case 28:
      return "IncompleteFunctionComponent";
    case 29:
      return "Throw";
    case 30:
      return "ViewTransitionComponent";
    case 31:
      return "ActivityComponent";

    default:
      return "";
  }
};

export const getComponentName = (node: Fiber): string => {
  if (node.tag === 10) {
    const component = node.type?._context?.displayName || "Context";
    return component + ".Provider";
  }

  const component =
    node.type?.displayName ||
    node.type?.name ||
    node.type?.render?.name ||
    node.elementType?.name ||
    node.elementType?.render?.name ||
    (typeof node.type === "string" ? node.type : undefined) ||
    (typeof node.elementType === "string" ? node.elementType : undefined) ||
    "Anonymous";

  return component;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleHookValue = (val: any, hookType?: string): any => {
  if (val === null || val === undefined) return val;

  if (hookType === "State") {
    if (val instanceof Node) {
      const tagName = (val as HTMLElement).tagName?.toLowerCase() || "node";
      const id = (val as HTMLElement).id ? `#${(val as HTMLElement).id}` : "";
      return `<${tagName}${id}>`;
    }

    if (typeof val === "function") {
      return "ƒ()";
    }

    if (typeof val === "object") {
      // If it's a React Element (circular and complex)
      if (val.$$typeof) return "[React Element]";

      try {
        // If it's a simple object/array, try a shallow clone
        // This is a "smoke test" for the bridge
        if (Array.isArray(val)) {
          return val.map((item) => handleHookValue(item, hookType));
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sanitizedObj: any = {};
        for (const key in val) {
          // Only grab own properties to avoid prototype pollution
          if (Object.prototype.hasOwnProperty.call(val, key)) {
            sanitizedObj[key] = handleHookValue(val[key], hookType);
          }
        }
        return sanitizedObj;
      } catch (e) {
        console.error(e);
        return "[Complex/Circular Object]";
      }
    }

    return val;
  }

  if (hookType === "Effect") return "() => {}";
  if (hookType === "Ref") return "() => {}";

  if (hookType === "Memo") return hookType;
};

export const getComponentHooks = (node: Fiber): componentHook[] | null => {
  const hooks = [];
  let currentMemoizedState = node.memoizedState;

  if (!currentMemoizedState) {
    return null;
  }

  let type = "State";
  while (currentMemoizedState) {
    if (
      currentMemoizedState.queue &&
      typeof currentMemoizedState.queue.dispatch === "function"
    ) {
      type = "State";
    } else if (
      currentMemoizedState.memoizedState &&
      typeof currentMemoizedState.memoizedState === "object" &&
      ["tag", "create", "destroy"].every(
        (key) => key in currentMemoizedState.memoizedState,
      )
    ) {
      type = "Effect";
    } else if (
      currentMemoizedState.memoizedState &&
      typeof currentMemoizedState.memoizedState === "object" &&
      Object.keys(currentMemoizedState.memoizedState).length === 1 &&
      Object.hasOwn(currentMemoizedState.memoizedState, "current")
    ) {
      type = "Ref";
    } else if (
      Array.isArray(currentMemoizedState.memoizedState) &&
      currentMemoizedState.memoizedState.length > 0
    ) {
      type = "Memo";
    }

    hooks.push({
      index: hooks.length,
      type: type,
      value: handleHookValue(currentMemoizedState.memoizedState, type),
    });

    currentMemoizedState = currentMemoizedState.next;
  }

  return hooks;
};

/**
 * FIXME: This function is not perfect. It returns a hardcoded value for functions, null, undefined, and objects.
 * This is to prevent a data clone error when sending the data to the DevTools panel.
 * A better solution would be to serialize the props in a way that can be safely cloned.
 *
 * @see https://github.com/AchmadAkif/react-map/issues/27
 */
export const getComponentProps = (node: Fiber): object | null => {
  const props: Record<string, unknown> = {};

  if (!node.memoizedProps) {
    return null;
  }

  for (const key in node.memoizedProps) {
    const value = node.memoizedProps[key];

    if (typeof value === "function") {
      props[key] = "f()";
    } else if (value === null) {
      props[key] = "null";
    } else if (value === undefined) {
      props[key] = "undefined";
    } else if (typeof value === "object") {
      props[key] = "{...}";
    } else {
      props[key] = value;
    }
  }

  return props;
};

export const getIsComponentDOM = (node: Fiber): boolean | null => {
  if (node.type) {
    if (node.type.name) {
      return false;
    }
    return true;
  }

  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = (callback: (...args: any[]) => void, wait: number) => {
  let timeoutId: number | null = null;

  return (...args: unknown[]) => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, wait);
  };
};

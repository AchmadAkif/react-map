import type { Fiber } from "./reactInternal.types";

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

export const getComponentState = (node: Fiber): object | null => {
  if (node.memoizedState) {
    return node.memoizedState;
  }

  return null;
};

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

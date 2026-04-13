import type { Fiber } from "./reactInternal.types";

export const getComponentName = (node: Fiber): string => {
  const handleForwardRefNode = (node: Fiber): string => {
    if (node.tag === 11) {
      if (node.type?.displayName) return node.type.displayName;

      const renderFunc = node.type?.render || node.elementType?.render;
      if (renderFunc?.name) {
        return renderFunc.name;
      }
    }
    return "ForwardRef";
  };

  switch (node.tag) {
    case 3:
      return "Root";
    case 7:
      return "Fragment";
    case 8:
      return "Mode";
    case 9:
      return "ContextConsumer";
    case 10:
      return "ContextProvider";
    case 11:
      return handleForwardRefNode(node);
    case 14:
      return "MemoComponent";

    default:
      return (
        node.type?.name ||
        node.elementType?.name ||
        (typeof node.type === "string" ? node.type : null) ||
        `Anonymous Component tag:${node.tag}`
      );
  }
};

export const getComponentState = (node: Fiber): object | null => {
  if (node.memoizedState) {
    return node.memoizedState;
  }

  return null;
};

export const getComponentProps = (node: Fiber): object | null => {
  if (node.memoizedProps) {
    return node.memoizedProps;
  }

  return null;
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

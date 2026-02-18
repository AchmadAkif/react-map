import type { Fiber } from "./reactInternal.types";
import type { SerializableFiberNode } from "./types";

export const traverseFiber = (node: Fiber): SerializableFiberNode | null => {
  if (!node) return null;

  const serializedNode: SerializableFiberNode = {
    name: getComponentName(node),
    children: [],
  };

  let child = node.child;
  while (child) {
    const serializedChild = traverseFiber(child);
    if (serializedChild) {
      serializedNode.children.push(serializedChild);
    }
    child = child.sibling;
  }

  return serializedNode;
};

const getComponentName = (node: Fiber): string => {
  return (
    node.type?.name ||
    node.elementType?.name ||
    (typeof node.type === "string" ? node.type : "Anonymous Component") ||
    (typeof node.elementType === "string"
      ? node.elementType
      : "Anonymous Component")
  );
};

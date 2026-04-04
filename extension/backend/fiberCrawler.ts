import type { Fiber } from "./reactInternal.types";
import type { RawNodeDatum } from "react-d3-tree";

/**
 * Recursively traverses a React Fiber tree and converts it into a serializable structure.
 *
 * @param node - The Fiber node to traverse, or null if no node exists.
 * @returns A serialized representation of the Fiber node and its children, or null if the input node is null.
 *
 * @example
 * ```typescript
 * const fiberRoot = // ... get fiber node from React component
 * const serialized = traverseFiber(fiberRoot);
 * ```
 */
export const traverseFiber = (node: Fiber | null): RawNodeDatum | null => {
  if (!node) return null;

  const serializedNode: RawNodeDatum = {
    name: getComponentName(node),
    children: [],
  };

  let child = node.child;
  while (child) {
    const serializedChild = traverseFiber(child);
    if (serializedChild) {
      const children =
        serializedNode.children ?? (serializedNode.children = []);
      children.push(serializedChild);
    }
    child = child.sibling;
  }

  return serializedNode;
};

const getComponentName = (node: Fiber): string => {
  return (
    node.type?.name ||
    node.elementType?.name ||
    (typeof node.type === "string" ? node.type : null) ||
    (typeof node.elementType === "string" ? node.elementType : null) ||
    "Anonymous Component"
  );
};

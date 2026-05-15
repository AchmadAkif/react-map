import * as utils from "./utils";

import type { Fiber } from "./reactInternal.types";
import type { SerializedFiberNode } from "./types";

const buildNodePath = (parentPath: string, childIndex: number) => {
  if (!parentPath) {
    return `${childIndex}`;
  }

  return `${parentPath}/${childIndex}`;
};

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
export const traverseFiber = (
  node: Fiber | null,
  nodePath = "",
): SerializedFiberNode | null => {
  if (!node) return null;

  // Skip Root and Mode nodes, but traverse their children
  if (node.tag === 3 || node.tag === 8) {
    let child = node.child;
    while (child) {
      const treeChild = traverseFiber(child, nodePath);
      if (treeChild) {
        return treeChild; // Return the first valid child
      }
      child = child.sibling;
    }
    return null;
  }

  const treeData: SerializedFiberNode = {
    name: utils.getComponentName(node),
    attributes: {
      nodeType: utils.getMetadataLabel(node.tag),
    },
    children: [],
    isDOM: node.tag === 5,
    state: utils.getComponentHooks(node),
    props: utils.getComponentProps(node),
    nodePath,
  };

  let serializedChildIndex = 0;
  let child = node.child;
  while (child) {
    // Skip raw text nodes inside HTML
    if (node.tag === 5 && child.tag === 6) {
      child = child.sibling;
      continue;
    }
    const childPath = buildNodePath(nodePath, serializedChildIndex);
    const treeChild = traverseFiber(child, childPath);
    if (treeChild) {
      const children = treeData.children ?? (treeData.children = []);
      children.push(treeChild);
      serializedChildIndex += 1;
    }
    child = child.sibling;
  }

  return treeData;
};

export const findFiberByNodePath = (
  node: Fiber | null,
  targetPath: string,
  currentPath = "",
): Fiber | null => {
  if (!node) return null;

  if (node.tag === 3 || node.tag === 8) {
    let child = node.child;
    while (child) {
      const found = findFiberByNodePath(child, targetPath, currentPath);
      if (found) {
        return found;
      }
      child = child.sibling;
    }
    return null;
  }

  if (currentPath === targetPath) {
    return node;
  }

  let serializedChildIndex = 0;
  let child = node.child;
  while (child) {
    if (node.tag === 5 && child.tag === 6) {
      child = child.sibling;
      continue;
    }

    const childPath = buildNodePath(currentPath, serializedChildIndex);
    const found = findFiberByNodePath(child, targetPath, childPath);
    if (found) {
      return found;
    }

    serializedChildIndex += 1;
    child = child.sibling;
  }

  return null;
};

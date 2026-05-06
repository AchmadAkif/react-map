import * as utils from "./utils";

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

  // Skip Root and Mode nodes, but traverse their children
  if (node.tag === 3 || node.tag === 8) {
    let child = node.child;
    while (child) {
      const treeChild = traverseFiber(child);
      if (treeChild) {
        return treeChild; // Return the first valid child
      }
      child = child.sibling;
    }
    return null;
  }

  const treeData: RawNodeDatum = {
    name: utils.getComponentName(node),
    attributes: {
      nodeType: utils.getMetadataLabel(node.tag),
    },
    children: [],
    isDOM: node.tag === 5,
    state: utils.getComponentHooks(node),
    props: utils.getComponentProps(node),
  };

  let child = node.child;
  while (child) {
    // Skip raw text nodes inside HTML
    if (node.tag === 5 && child.tag === 6) {
      child = child.sibling;
      continue;
    }
    const treeChild = traverseFiber(child);
    if (treeChild) {
      const children = treeData.children ?? (treeData.children = []);
      children.push(treeChild);
    }
    child = child.sibling;
  }

  return treeData;
};

const getFirstRenderableFiber = (node: Fiber | null): Fiber | null => {
  if (!node) return null;

  if (node.tag === 3 || node.tag === 8) {
    let child = node.child;
    while (child) {
      const renderable = getFirstRenderableFiber(child);
      if (renderable) {
        return renderable;
      }
      child = child.sibling;
    }
    return null;
  }

  return node;
};

const getRenderableChildren = (node: Fiber): Fiber[] => {
  const children: Fiber[] = [];
  let child = node.child;

  while (child) {
    if (node.tag === 5 && child.tag === 6) {
      child = child.sibling;
      continue;
    }

    const renderable = getFirstRenderableFiber(child);
    if (renderable) {
      children.push(renderable);
    }

    child = child.sibling;
  }

  return children;
};

export const findFiberByPath = (
  root: Fiber | null,
  path: number[],
): Fiber | null => {
  const start = getFirstRenderableFiber(root);
  if (!start) return null;

  let current = start;
  for (const index of path) {
    const children = getRenderableChildren(current);
    if (index < 0 || index >= children.length) {
      return null;
    }
    current = children[index];
  }

  return current;
};

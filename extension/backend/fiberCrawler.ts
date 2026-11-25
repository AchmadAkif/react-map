import * as utils from "./utils";
import { WorkTag, type Fiber } from "./reactInternal.types";
import type { MinimalFiberNode, NodeDetails, SerializedFiberNode } from "./types";

export interface TraverseOptions {
  includeDetails?: boolean;
}

export const buildNodePath = (
  parentPath: string,
  childIndex: number,
): string => {
  return parentPath ? `${parentPath}/${childIndex}` : `${childIndex}`;
};

/**
 * Checks if a fiber node represents a transparent container that should not
 * be rendered in the tree (HostRoot and Mode / StrictMode).
 */
const isTransparentNode = (node: Fiber): boolean => {
  return node.tag === WorkTag.HostRoot || node.tag === WorkTag.Mode;
};

/**
 * Reads the details that suit the kind of node. A detail that does not apply
 * is left out, while one that applies but is empty is null.
 */
const getNodeDetails = (node: Fiber): NodeDetails => {
  // React keeps a text node's text in place of its props object.
  if (node.tag === WorkTag.HostText) return { text: node.memoizedProps };

  const props = utils.getComponentProps(node);

  switch (node.tag) {
    case WorkTag.ClassComponent:
    case WorkTag.IncompleteClassComponent:
      return { classState: utils.getClassState(node), props };

    case WorkTag.HostComponent:
    case WorkTag.HostHoistable:
    case WorkTag.HostSingleton:
      return { props };

    default:
      return { state: utils.getComponentHooks(node), props };
  }
};

/**
 * Recursively collects visible children from a fiber node.
 * Transparent nodes (HostRoot and Mode) are skipped and their children are flattened.
 */
const collectChildren = (
  parentFiber: Fiber,
  parentPath: string,
  options: TraverseOptions,
  isParentDOM: boolean,
): SerializedFiberNode[] => {
  const result: SerializedFiberNode[] = [];
  let serializedChildIndex = 0;
  let child = parentFiber.child;

  while (child) {
    // Skip raw text nodes inside HTML host elements
    if (isParentDOM && child.tag === WorkTag.HostText) {
      child = child.sibling;
      continue;
    }

    if (isTransparentNode(child)) {
      // Collect children from the transparent wrapper node
      let transparentChild = child.child;
      while (transparentChild) {
        if (isTransparentNode(transparentChild)) {
          // If nested transparent node, recurse
          const nested = collectChildren(
            transparentChild,
            parentPath,
            options,
            isParentDOM,
          );
          for (const item of nested) {
            result.push({
              ...item,
              nodePath: buildNodePath(parentPath, serializedChildIndex),
            });
            serializedChildIndex += 1;
          }
        } else {
          const childPath = buildNodePath(parentPath, serializedChildIndex);
          const treeChild = traverseFiber(transparentChild, childPath, options);
          if (treeChild) {
            result.push(treeChild);
            serializedChildIndex += 1;
          }
        }
        transparentChild = transparentChild.sibling;
      }
    } else {
      const childPath = buildNodePath(parentPath, serializedChildIndex);
      const treeChild = traverseFiber(child, childPath, options);
      if (treeChild) {
        result.push(treeChild);
        serializedChildIndex += 1;
      }
    }

    child = child.sibling;
  }

  return result;
};

/**
 * Recursively traverses a React Fiber tree and converts it into a serializable structure.
 * Supports minimal mode (for full-tree broadcast) or detailed mode (with state & props).
 *
 * @param node - The Fiber node to traverse.
 * @param nodePath - The hierarchical path string representing this node's location.
 * @param options - Traversal options (e.g. whether to include state & props).
 * @returns A serialized representation of the Fiber node and its children, or null.
 */
export const traverseFiber = (
  node: Fiber | null,
  nodePath = "",
  options: TraverseOptions = {},
): SerializedFiberNode | null => {
  if (!node) return null;

  // If the root node passed in is transparent (HostRoot or Mode), traverse to its first valid tree node
  if (isTransparentNode(node)) {
    let child = node.child;
    while (child) {
      const treeChild = traverseFiber(child, nodePath, options);
      if (treeChild) return treeChild;
      child = child.sibling;
    }
    return null;
  }

  const isDOM = node.tag === WorkTag.HostComponent;

  const treeData: SerializedFiberNode = {
    name: utils.getComponentName(node),
    attributes: {
      nodeType: utils.getMetadataLabel(node.tag),
    },
    children: [],
    isDOM,
    nodePath,
    ...(options.includeDetails && getNodeDetails(node)),
  };

  const children = collectChildren(node, nodePath, options, isDOM);
  if (children.length > 0) {
    treeData.children = children;
  }

  return treeData;
};

/**
 * Traverses fiber tree in minimal mode (omits props and state to reduce snapshot size).
 */
export const traverseFiberMinimal = (
  node: Fiber | null,
  nodePath = "",
): MinimalFiberNode | null => {
  return traverseFiber(node, nodePath, {
    includeDetails: false,
  }) as MinimalFiberNode | null;
};

/**
 * Serializes the details of the selected fiber node.
 */
export const serializeNodeDetail = (
  node: Fiber | null,
  nodePath: string,
): SerializedFiberNode | null => {
  if (!node) return null;

  return {
    name: utils.getComponentName(node),
    attributes: {
      nodeType: utils.getMetadataLabel(node.tag),
    },
    isDOM: node.tag === WorkTag.HostComponent,
    ...getNodeDetails(node),
    nodePath,
  };
};

/**
 * Finds a Fiber node by its exact hierarchical nodePath using prefix-pruned tree descent.
 */
export const findFiberByNodePath = (
  node: Fiber | null,
  targetPath: string,
  currentPath = "",
): Fiber | null => {
  if (!node) return null;

  if (isTransparentNode(node)) {
    let child = node.child;
    while (child) {
      const found = findFiberByNodePath(child, targetPath, currentPath);
      if (found) return found;
      child = child.sibling;
    }
    return null;
  }

  if (currentPath === targetPath) {
    return node;
  }

  const isDOM = node.tag === WorkTag.HostComponent;
  let serializedChildIndex = 0;
  let child = node.child;

  while (child) {
    if (isDOM && child.tag === WorkTag.HostText) {
      child = child.sibling;
      continue;
    }

    if (isTransparentNode(child)) {
      let transparentChild = child.child;
      while (transparentChild) {
        const childPath = buildNodePath(currentPath, serializedChildIndex);
        if (targetPath === childPath || targetPath.startsWith(childPath + "/")) {
          const found = findFiberByNodePath(
            transparentChild,
            targetPath,
            childPath,
          );
          if (found) return found;
        }
        serializedChildIndex += 1;
        transparentChild = transparentChild.sibling;
      }
    } else {
      const childPath = buildNodePath(currentPath, serializedChildIndex);
      if (targetPath === childPath || targetPath.startsWith(childPath + "/")) {
        const found = findFiberByNodePath(child, targetPath, childPath);
        if (found) return found;
      }
      serializedChildIndex += 1;
    }

    child = child.sibling;
  }

  return null;
};

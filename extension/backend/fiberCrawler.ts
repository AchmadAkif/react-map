import * as utils from "./utils";
import { getInstanceId, readInstanceId } from "./instanceId";
import { WorkTag, type Fiber } from "./reactInternal.types";
import type { MinimalFiberNode, NodeDetails, SerializedFiberNode } from "./types";

export interface TraverseOptions {
  includeDetails?: boolean;
}

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
  options: TraverseOptions,
  isParentDOM: boolean,
): SerializedFiberNode[] => {
  const result: SerializedFiberNode[] = [];
  let child = parentFiber.child;

  while (child) {
    if (isTransparentNode(child)) {
      result.push(...collectChildren(child, options, isParentDOM));
    } else if (!(isParentDOM && child.tag === WorkTag.HostText)) {
      // Raw text nodes inside HTML host elements are skipped
      const treeChild = traverseFiber(child, options);
      if (treeChild) result.push(treeChild);
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
 * @param options - Traversal options (e.g. whether to include state & props).
 * @returns A serialized representation of the Fiber node and its children, or null.
 */
export const traverseFiber = (
  node: Fiber | null,
  options: TraverseOptions = {},
): SerializedFiberNode | null => {
  if (!node) return null;

  // If the root node passed in is transparent (HostRoot or Mode), traverse to its first valid tree node
  if (isTransparentNode(node)) {
    let child = node.child;
    while (child) {
      const treeChild = traverseFiber(child, options);
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
    instanceId: getInstanceId(node),
    ...(options.includeDetails && getNodeDetails(node)),
  };

  const children = collectChildren(node, options, isDOM);
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
): MinimalFiberNode | null => {
  return traverseFiber(node, {
    includeDetails: false,
  }) as MinimalFiberNode | null;
};

/**
 * Serializes the details of the selected fiber node.
 */
export const serializeNodeDetail = (
  node: Fiber | null,
): SerializedFiberNode | null => {
  if (!node) return null;

  return {
    name: utils.getComponentName(node),
    attributes: {
      nodeType: utils.getMetadataLabel(node.tag),
    },
    isDOM: node.tag === WorkTag.HostComponent,
    ...getNodeDetails(node),
    instanceId: getInstanceId(node),
  };
};

/**
 * Finds the mounted fiber of a component instance by its ID. Returns null once
 * the instance has unmounted.
 */
export const findFiberByInstanceId = (
  node: Fiber | null,
  instanceId: number,
): Fiber | null => {
  if (!node) return null;
  if (readInstanceId(node) === instanceId) return node;

  let child = node.child;
  while (child) {
    const found = findFiberByInstanceId(child, instanceId);
    if (found) return found;
    child = child.sibling;
  }

  return null;
};

import type { TreeNodeDatum } from "react-d3-tree";
import type { NodeRef, TreeNode } from "../types";

export const findNodeById = (
  id: string,
  treeData: TreeNodeDatum[],
): TreeNodeDatum | null => {
  if (!treeData || treeData.length === 0) {
    return null;
  }

  const root = treeData[0];

  const traverse = (node: TreeNodeDatum): TreeNodeDatum | null => {
    if (node.__rd3t.id === id) {
      return node;
    }

    if (node.children) {
      for (const child of node.children) {
        const found = traverse(child);
        if (found) {
          return found;
        }
      }
    }

    return null;
  };

  return traverse(root);
};

/**
 * Lists the nodes that search can choose. The artificial "Filtered Tree" root
 * has no instance ID, so it is left out.
 */
export const listSelectableNodes = (node: TreeNode | null): NodeRef[] => {
  if (!node) return [];

  const { name, instanceId, children = [] } = node;
  const descendants = children.flatMap(listSelectableNodes);

  return instanceId === undefined
    ? descendants
    : [{ name, instanceId }, ...descendants];
};

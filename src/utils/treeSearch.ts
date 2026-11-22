import type { TreeNodeDatum } from "react-d3-tree";
import type { TreeNode } from "../types";

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

export const findNodeByPath = (
  nodePath: string,
  treeData: TreeNode[] | null,
): TreeNode | null => {
  if (!treeData || treeData.length === 0) {
    return null;
  }

  const traverse = (node: TreeNode): TreeNode | null => {
    if (node.nodePath === nodePath) {
      return node;
    }

    for (const child of node.children ?? []) {
      const found = traverse(child);
      if (found) {
        return found;
      }
    }

    return null;
  };

  for (const root of treeData) {
    const found = traverse(root);
    if (found) {
      return found;
    }
  }

  return null;
};

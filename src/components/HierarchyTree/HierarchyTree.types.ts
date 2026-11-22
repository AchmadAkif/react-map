import type { Ref } from "react";
import type { Tree } from "react-d3-tree";
import type { NodeSpacing, RenderedNode, TreeFilters, TreeNode } from "../../types";

export interface HierarchyTreeProps {
  treeRef: Ref<Tree>;
  data: TreeNode | null;
  treeOrientation: "vertical" | "horizontal";
  nodeSize: NodeSpacing;
  handleOnNodeHover?: (node: TreeNode) => void;
  treeFilters: TreeFilters;
  onRenderedTreeData: (data: RenderedNode[]) => void;
  selectedNode: RenderedNode | null;
}

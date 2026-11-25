import type { Ref } from "react";
import type { Tree } from "react-d3-tree";
import type { NodeRef, NodeSpacing, RenderedNode, TreeFilters, TreeNode } from "../../types";

export interface HierarchyTreeProps {
  treeRef: Ref<Tree>;
  data: TreeNode | null;
  treeOrientation: "vertical" | "horizontal";
  nodeSize: NodeSpacing;
  treeFilters: TreeFilters;
  onRenderedTreeData: (data: RenderedNode[]) => void;
  searchedNode: RenderedNode | null;
  selectedNodePath: string | null;
  onSelectNode: (node: NodeRef) => void;
}

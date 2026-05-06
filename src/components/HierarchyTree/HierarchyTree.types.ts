import type { Ref } from "react";
import type { RawNodeDatum, TreeNodeDatum, Tree } from "react-d3-tree";
import type { NodeSpacing, renderedNode, TreeFilters } from "../../types";

export interface HierarchyTreeProps {
  treeRef: Ref<Tree>;
  data: RawNodeDatum | null;
  treeOrientation: "vertical" | "horizontal";
  nodeSize: NodeSpacing;
  handleOnNodeHover?: (node: TreeNodeDatum | null) => void;
  treeFilters: TreeFilters;
  onRenderedTreeData: (data: renderedNode[]) => void;
  selectedNode: renderedNode | null;
}

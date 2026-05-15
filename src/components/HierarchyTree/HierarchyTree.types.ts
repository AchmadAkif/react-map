import type { Ref } from "react";
import type { RawNodeDatum, TreeNodeDatum, Tree } from "react-d3-tree";
import type { NodeSpacing, RenderedNode, TreeFilters } from "../../types";

export interface HierarchyTreeProps {
  treeRef: Ref<Tree>;
  data: RawNodeDatum | null;
  treeOrientation: "vertical" | "horizontal";
  nodeSize: NodeSpacing;
  handleOnNodeHover?: (node: TreeNodeDatum) => void;
  treeFilters: TreeFilters;
  onRenderedTreeData: (data: RenderedNode[]) => void;
  selectedNode: RenderedNode | null;
}

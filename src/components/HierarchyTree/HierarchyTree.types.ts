import type { RawNodeDatum, TreeNodeDatum } from "react-d3-tree";
import type { NodeSpacing, renderedNode, TreeFilters } from "../../types";

export interface HierarchyTreeProps {
  data: RawNodeDatum | null;
  treeOrientation: "vertical" | "horizontal";
  nodeSize: NodeSpacing;
  handleOnNodeHover?: (node: TreeNodeDatum) => void;
  treeFilters: TreeFilters;
  onRenderedTreeData: (data: renderedNode[]) => void;
}

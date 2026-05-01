import type { RawNodeDatum, TreeNodeDatum } from "react-d3-tree";
import type { NodeSpacing } from "../../types";

export interface HierarchyTreeProps {
  data: RawNodeDatum | null;
  treeOrientation: "vertical" | "horizontal";
  nodeSize: NodeSpacing;
  handleOnNodeHover?: (node: TreeNodeDatum) => void;
}

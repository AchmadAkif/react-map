import type { TreeNodeDatum } from "react-d3-tree";
import type { TreeOrientation, NodeSpacing } from "../../types";

export interface SidebarProps {
  treeOrientation: TreeOrientation;
  onSetOrientation: (orientation: TreeOrientation) => void;
  nodeSpacing: NodeSpacing;
  onNodeSpacingChange: (value: number, axis: "x" | "y") => void;
  hoveredNode?: TreeNodeDatum | null;
}

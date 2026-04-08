import type { RawNodeDatum } from "react-d3-tree";

import type { NodeSpacing } from "../../types";

export interface HierarchyTreeProps {
  data: RawNodeDatum;
  treeOrientation: "vertical" | "horizontal";
  nodeSize: NodeSpacing;
}

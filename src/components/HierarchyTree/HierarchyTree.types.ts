import type { RawNodeDatum } from "react-d3-tree";

import type { NodeSpacing } from "../../types";

export interface HierarchyTreeProps {
  data: RawNodeDatum | undefined;
  treeOrientation: "vertical" | "horizontal";
  nodeSize: NodeSpacing;
}

import type { RawNodeDatum } from "react-d3-tree";

export interface HierarchyTreeProps {
  data: RawNodeDatum | undefined;
  treeOrientation: "vertical" | "horizontal";
}

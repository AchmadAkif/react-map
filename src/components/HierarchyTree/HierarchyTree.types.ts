import type { RawNodeDatum } from "react-d3-tree";

export interface HierarchyTreeProps {
  data: RawNodeDatum | RawNodeDatum[] | undefined;
}

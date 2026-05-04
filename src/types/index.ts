import type { HierarchyPointNode } from "d3-hierarchy";
import type { TreeNodeDatum } from "react-d3-tree";

export type TreeOrientation = "vertical" | "horizontal";
export type NodeSpacing = { x: number; y: number };
export type TreeFilters = {
  hideRouterComponent: boolean;
  hideDomComponent: boolean;
  hideReduxComponent: boolean;
};
export type renderedNode = HierarchyPointNode<TreeNodeDatum>;

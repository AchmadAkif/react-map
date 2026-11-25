import type { InspectableNode, NodeSpacing, TreeFilters, TreeOrientation } from "../../types";

export interface SidebarProps {
  treeOrientation: TreeOrientation;
  onSetOrientation: (orientation: TreeOrientation) => void;
  nodeSpacing: NodeSpacing;
  onNodeSpacingChange: (value: number, axis: "x" | "y") => void;
  selectedNode?: InspectableNode;
  selectedNodeUnmounted?: boolean;
  selectedNodePath: string | null;
  onSelectedNodeChange: (nodePath: string | null) => void;
  treeFilters: TreeFilters;
  onFilterChange: (filterName: keyof TreeFilters, value: boolean) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  selectedValue: string;
  onSelectedValueChange: (value: string) => void;
  renderedNodeData: { value: string; label: string }[];
}

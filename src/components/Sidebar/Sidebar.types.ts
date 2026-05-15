import type { TreeFilters, TreeOrientation, NodeSpacing } from "../../types";
import type { InspectableNode } from "../../types";

export interface SidebarProps {
  treeOrientation: TreeOrientation;
  onSetOrientation: (orientation: TreeOrientation) => void;
  nodeSpacing: NodeSpacing;
  onNodeSpacingChange: (value: number, axis: "x" | "y") => void;
  hoveredNode?: InspectableNode;
  lockedNodeUnavailable?: boolean;
  lockedNodePath: string | null;
  onLockNodeChange: (nodePath: string | null) => void;
  treeFilters: TreeFilters;
  onFilterChange: (filterName: keyof TreeFilters, value: boolean) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  selectedValue: string;
  onSelectedValueChange: (value: string) => void;
  renderedNodeData: { value: string; label: string }[];
}

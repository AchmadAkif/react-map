import type { Selection } from "../../utils";
import type { NodeRef, NodeSpacing, TreeFilters, TreeOrientation } from "../../types";

export interface SidebarProps {
  treeOrientation: TreeOrientation;
  onSetOrientation: (orientation: TreeOrientation) => void;
  nodeSpacing: NodeSpacing;
  onNodeSpacingChange: (value: number, axis: "x" | "y") => void;
  selection: Selection;
  isSelectionHidden: boolean;
  onDeselectNode: () => void;
  treeFilters: TreeFilters;
  onFilterChange: (filterName: keyof TreeFilters, value: boolean) => void;
  searchableNodes: NodeRef[];
  selectedInstanceId: number | null;
  onChooseSearchResult: (node: NodeRef) => void;
}

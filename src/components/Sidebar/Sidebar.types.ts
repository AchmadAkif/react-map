import type { Selection } from "../../utils";
import type { NodeSpacing, TreeFilters, TreeOrientation } from "../../types";

export interface SidebarProps {
  treeOrientation: TreeOrientation;
  onSetOrientation: (orientation: TreeOrientation) => void;
  nodeSpacing: NodeSpacing;
  onNodeSpacingChange: (value: number, axis: "x" | "y") => void;
  selection: Selection;
  onDeselectNode: () => void;
  treeFilters: TreeFilters;
  onFilterChange: (filterName: keyof TreeFilters, value: boolean) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  selectedValue: string;
  onSelectedValueChange: (value: string) => void;
  renderedNodeData: { value: string; label: string }[];
}

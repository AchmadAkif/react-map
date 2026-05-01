import type { TreeFilters } from "../../types";

export interface FilterPreferenceProps {
  treeFilters: TreeFilters;
  handleFilterChange: (filterName: keyof TreeFilters, value: boolean) => void;
}

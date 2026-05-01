import { CheckboxGroup } from "@radix-ui/themes";

import type { FilterPreferenceProps } from "./FilterPreference.types";

const FilterPreference = ({
  treeFilters,
  handleFilterChange,
}: FilterPreferenceProps) => {
  const selectedValues = [
    treeFilters.hideRouterComponent ? "hideRouterComponent" : null,
    treeFilters.hideDomComponent ? "hideDomComponent" : null,
    treeFilters.hideReduxComponent ? "hideReduxComponent" : null,
  ].filter((value): value is string => value !== null);

  return (
    <CheckboxGroup.Root
      value={selectedValues}
      onValueChange={(values) => {
        const valueSet = new Set(values);
        handleFilterChange(
          "hideRouterComponent",
          valueSet.has("hideRouterComponent"),
        );
        handleFilterChange(
          "hideDomComponent",
          valueSet.has("hideDomComponent"),
        );
        handleFilterChange(
          "hideReduxComponent",
          valueSet.has("hideReduxComponent"),
        );
      }}
    >
      <CheckboxGroup.Item
        value="hideRouterComponent"
        className="flex items-center gap-2 py-1 text-sm"
      >
        Hide Router Component
      </CheckboxGroup.Item>
      <CheckboxGroup.Item
        value="hideDomComponent"
        className="flex items-center gap-2 py-1 text-sm"
      >
        Hide DOM Component
      </CheckboxGroup.Item>
      <CheckboxGroup.Item
        value="hideReduxComponent"
        className="flex items-center gap-2 py-1 text-sm"
      >
        Hide Redux Component
      </CheckboxGroup.Item>
    </CheckboxGroup.Root>
  );
};

export default FilterPreference;

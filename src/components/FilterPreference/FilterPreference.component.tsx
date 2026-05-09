import { Checkbox } from "../ui/checkbox";

import type { FilterPreferenceProps } from "./FilterPreference.types";

const FilterPreference = ({
  treeFilters,
  handleFilterChange,
}: FilterPreferenceProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 py-1 text-sm">
        <Checkbox
          id="hideRouterComponent"
          checked={treeFilters.hideRouterComponent}
          onCheckedChange={(checked) =>
            handleFilterChange("hideRouterComponent", !!checked)
          }
        />
        <label htmlFor="hideRouterComponent">Hide Router Component</label>
      </div>
      <div className="flex items-center gap-2 py-1 text-sm">
        <Checkbox
          id="hideDomComponent"
          checked={treeFilters.hideDomComponent}
          onCheckedChange={(checked) =>
            handleFilterChange("hideDomComponent", !!checked)
          }
        />
        <label htmlFor="hideDomComponent">Hide DOM Component</label>
      </div>
      <div className="flex items-center gap-2 py-1 text-sm">
        <Checkbox
          id="hideReduxComponent"
          checked={treeFilters.hideReduxComponent}
          onCheckedChange={(checked) =>
            handleFilterChange("hideReduxComponent", !!checked)
          }
        />
        <label htmlFor="hideReduxComponent">Hide Redux Component</label>
      </div>
    </div>
  );
};

export default FilterPreference;

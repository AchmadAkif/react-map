import type { FilterPreferenceProps } from "./FilterPreference.types";

const FilterPreference = ({
  treeFilters,
  handleFilterChange,
}: FilterPreferenceProps) => {
  return (
    <div>
      {" "}
      <label className="flex items-center gap-2 py-1 text-sm">
        <input
          type="checkbox"
          checked={treeFilters.hideRouterComponent}
          onChange={(event) =>
            handleFilterChange(
              "hideRouterComponent",
              event.currentTarget.checked,
            )
          }
        />
        Hide Router Component
      </label>
      <label className="flex items-center gap-2 py-1 text-sm">
        <input
          type="checkbox"
          checked={treeFilters.hideDomComponent}
          onChange={(event) =>
            handleFilterChange("hideDomComponent", event.currentTarget.checked)
          }
        />
        Hide DOM Component
      </label>
      <label className="flex items-center gap-2 py-1 text-sm">
        <input
          type="checkbox"
          checked={treeFilters.hideReduxComponent}
          onChange={(event) =>
            handleFilterChange(
              "hideReduxComponent",
              event.currentTarget.checked,
            )
          }
        />
        Hide Redux Component
      </label>
    </div>
  );
};

export default FilterPreference;

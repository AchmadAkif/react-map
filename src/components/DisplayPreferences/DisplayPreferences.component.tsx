import { OrientationPreference } from "../OrientationPreference";
import { FilterPreference } from "../FilterPreference";
import { SpacingPreference } from "../SpacingPreference";

import type { OrientationPreferenceProps } from "../OrientationPreference/OrientationPreference.types";
import type { FilterPreferenceProps } from "../FilterPreference/FilterPreference.types";
import type { SpacingPreferenceProps } from "../SpacingPreference/SpacingPreference.types";

type DisplayPreferencesProps = OrientationPreferenceProps &
  FilterPreferenceProps &
  SpacingPreferenceProps;

const DisplayPreferences = ({
  treeOrientation,
  treeFilters,
  nodeSpacing,
  handleSetOrientation,
  handleNodeSpacingChange,
  handleFilterChange,
}: DisplayPreferencesProps) => {
  return (
    <div>
      <div className="flex gap-3">
        <OrientationPreference
          handleSetOrientation={handleSetOrientation}
          treeOrientation={treeOrientation}
        />
        <FilterPreference
          treeFilters={treeFilters}
          handleFilterChange={handleFilterChange}
        />
      </div>
      <SpacingPreference
        nodeSpacing={nodeSpacing}
        handleNodeSpacingChange={handleNodeSpacingChange}
      />
    </div>
  );
};

export default DisplayPreferences;

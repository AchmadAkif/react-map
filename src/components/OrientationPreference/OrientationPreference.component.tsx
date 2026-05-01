import type { OrientationPreferenceProps } from "./OrientationPreference.types";
import { Select } from "../RadixUI";

const OrientationPreference = ({
  treeOrientation,
  handleSetOrientation,
}: OrientationPreferenceProps) => {
  return (
    <div>
      <p>TreeOrientation</p>
      <Select
        value={treeOrientation}
        onValueChange={handleSetOrientation}
        options={["Vertical", "Horizontal"]}
      />
    </div>
  );
};

export default OrientationPreference;

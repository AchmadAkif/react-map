import type { TreeOrientation } from "../../types";

export interface OrientationPreferenceProps {
  treeOrientation: TreeOrientation;
  handleSetOrientation: (orientation: TreeOrientation) => void;
}

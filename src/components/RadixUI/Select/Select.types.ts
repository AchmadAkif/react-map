import type { TreeOrientation } from "../../../types";

export interface SelectProps {
  options: string[];
  value: TreeOrientation;
  onValueChange: (orientation: TreeOrientation) => void;
}

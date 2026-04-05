import type { TreeOrientation } from "../../types";

export interface SelectProps {
  options: string[];
  defaultValue: TreeOrientation;
  onValueChange: (orientation: TreeOrientation) => void;
}

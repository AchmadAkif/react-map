import type { TreeOrientation } from "../../types";

export interface SidebarProps {
  treeOrientation: TreeOrientation;
  onSetOrientation: (orientation: TreeOrientation) => void;
}

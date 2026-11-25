import type { TreeNode } from "../../types";
import type { Selection } from "../../utils";

export interface ComponentDetailsProps {
  selection: Selection;
  isHidden: boolean;
  onDeselectNode: () => void;
}

export interface NodeDetailsProps {
  details: TreeNode;
}

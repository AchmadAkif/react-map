import type { TreeNode } from "../../types";
import type { Selection } from "../../utils";

export interface ComponentDetailsProps {
  selection: Selection;
  onDeselectNode: () => void;
}

export interface LiveDetailsProps {
  details: TreeNode;
}

import type { CustomNodeElementProps } from "react-d3-tree";
import type { NodeRef, TreeOrientation } from "@/types";
import type { BranchId } from "@/utils";

export interface TreeNodeElementProps extends Pick<
  CustomNodeElementProps,
  "nodeDatum"
> {
  orientation: TreeOrientation;
  selectedInstanceId: number | null;
  onToggleBranch: (instanceId: BranchId) => void;
  onSelectNode: (node: NodeRef) => void;
  onSelectedNodeDrawnChange: (isDrawn: boolean) => void;
}

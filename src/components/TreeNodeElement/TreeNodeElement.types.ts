import type { CustomNodeElementProps } from "react-d3-tree";
import type { NodeRef, TreeOrientation } from "@/types";

export interface TreeNodeElementProps extends Pick<
  CustomNodeElementProps,
  "nodeDatum" | "toggleNode"
> {
  orientation: TreeOrientation;
  selectedNodePath: string | null;
  onSelectNode: (node: NodeRef) => void;
}

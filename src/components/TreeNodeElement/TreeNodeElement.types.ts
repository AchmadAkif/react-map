import type { CustomNodeElementProps } from "react-d3-tree";
import type { TreeOrientation } from "@/types";

export interface TreeNodeElementProps extends Pick<
  CustomNodeElementProps,
  "nodeDatum" | "toggleNode" | "onNodeMouseOver"
> {
  orientation: TreeOrientation;
}

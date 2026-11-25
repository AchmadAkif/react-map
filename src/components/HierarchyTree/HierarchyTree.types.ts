import type { RefObject } from "react";
import type { Tree } from "react-d3-tree";
import type { NodeRef, NodeSpacing, TreeNode } from "../../types";

export interface HierarchyTreeProps {
  treeRef: RefObject<Tree | null>;
  data: TreeNode | null;
  treeOrientation: "vertical" | "horizontal";
  nodeSize: NodeSpacing;
  selectedInstanceId: number | null;
  onSelectNode: (node: NodeRef) => void;
  onSelectedNodeDrawnChange: (isDrawn: boolean) => void;
}

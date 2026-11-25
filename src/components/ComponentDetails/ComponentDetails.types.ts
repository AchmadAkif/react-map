import type { InspectableNode } from "../../types";

export interface ComponentDetailsProps {
  selectedNode: InspectableNode;
  selectedNodeUnmounted?: boolean;
  selectedNodePath: string | null;
  onSelectedNodeChange: (nodePath: string | null) => void;
}

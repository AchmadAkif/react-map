import type { InspectableNode } from "../../types";

export interface ComponentDetailsProps {
  hoveredNode: InspectableNode;
  lockedNodeUnavailable?: boolean;
  lockedNodePath: string | null;
  onLockNodeChange: (nodePath: string | null) => void;
}

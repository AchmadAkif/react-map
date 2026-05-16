import { PinIcon } from "lucide-react";

import { Separator } from "../ui/separator";
import { Toggle } from "../ui/toggle";

import { StatePanel } from "../StatePanel";
import { PropsPanel } from "../PropsPanel";

import type { InspectableNode } from "../../types";

const ComponentDetails = ({
  hoveredNode,
  lockedNodeUnavailable,
  lockedNodePath,
  onLockNodeChange,
}: {
  hoveredNode: InspectableNode;
  lockedNodeUnavailable?: boolean;
  lockedNodePath: string | null;
  onLockNodeChange: (nodePath: string | null) => void;
}) => {
  const isLocked = lockedNodePath !== null;
  const hoverNodePath = hoveredNode?.nodePath ?? null;
  const canLockHoveredNode = !isLocked && hoverNodePath !== null;

  const handleLockToggle = () => {
    if (isLocked) {
      onLockNodeChange(null);
      return;
    }

    if (hoverNodePath) {
      onLockNodeChange(hoverNodePath);
    }
  };

  return (
    <div className="flex flex-col">
      {lockedNodeUnavailable ? (
        <p className="mx-2 mb-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400">
          Locked node is no longer present in the current React tree. Keep the
          lock if it may reappear, or unlock and select another node.
        </p>
      ) : null}
      <div className="flex items-start justify-between gap-3 px-4 pb-2">
        {hoveredNode?.name ? (
          <p className="font-bold text-blue-500">{hoveredNode.name}</p>
        ) : (
          <p className="font-bold text-slate-500 dark:text-slate-400">
            No node selected
          </p>
        )}
        <Toggle
          aria-label="Toggle bookmark"
          size="sm"
          variant="outline"
          onClick={handleLockToggle}
          disabled={!isLocked && !canLockHoveredNode}
        >
          <PinIcon className="group-data-[state=on]/toggle:fill-foreground" />
          {isLocked ? "Unpin" : "Pin this node for live updates"}
        </Toggle>
      </div>
      <p className="px-4 pb-2 text-xs text-slate-500 dark:text-slate-400">
        {isLocked
          ? "Live updates are enabled for the pinned node."
          : "State and props load only after you pin a node."}
      </p>

      {isLocked && !lockedNodeUnavailable ? (
        <>
          <Separator className="mb-2" />
          <StatePanel hoveredNode={hoveredNode} />
          <Separator className="my-2" />
          <PropsPanel hoveredNode={hoveredNode} />
        </>
      ) : null}
    </div>
  );
};

export default ComponentDetails;

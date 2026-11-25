import { PinIcon } from "lucide-react";
import { Separator } from "../ui/separator";
import { Toggle } from "../ui/toggle";
import { StatePanel } from "../StatePanel";
import { PropsPanel } from "../PropsPanel";
import type { ComponentDetailsProps } from "./ComponentDetails.types";

export const ComponentDetails = ({
  selectedNode,
  selectedNodeUnmounted,
  selectedNodePath,
  onSelectedNodeChange,
}: ComponentDetailsProps) => {
  const hasSelectedNode = selectedNodePath !== null;
  const inspectedNodePath = selectedNode?.nodePath ?? null;
  const canSelectNode = !hasSelectedNode && inspectedNodePath !== null;

  const handleSelectionToggle = () => {
    if (hasSelectedNode) {
      onSelectedNodeChange(null);
      return;
    }

    if (inspectedNodePath) {
      onSelectedNodeChange(inspectedNodePath);
    }
  };

  return (
    <div className="flex flex-col">
      {selectedNodeUnmounted ? (
        <p className="mx-2 mb-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400">
          Locked node is no longer present in the current React tree. Keep the
          lock if it may reappear, or unlock and select another node.
        </p>
      ) : null}
      <div className="flex items-start justify-between gap-3 px-4 pb-2">
        {selectedNode?.name ? (
          <p className="font-bold text-blue-500">{selectedNode.name}</p>
        ) : (
          <p className="font-bold text-slate-500 dark:text-slate-400">
            No node selected
          </p>
        )}
        <Toggle
          aria-label={
            hasSelectedNode ? "Unpin node" : "Pin node for live updates"
          }
          size="sm"
          variant="outline"
          onClick={handleSelectionToggle}
          disabled={!hasSelectedNode && !canSelectNode}
        >
          <PinIcon className="group-data-[state=on]/toggle:fill-foreground" />
          {hasSelectedNode ? "Unpin" : "Pin this node for live updates"}
        </Toggle>
      </div>
      <p className="px-4 pb-2 text-xs text-slate-500 dark:text-slate-400">
        {hasSelectedNode
          ? "Live updates are enabled for the pinned node."
          : "State and props load only after you pin a node."}
      </p>

      {hasSelectedNode && !selectedNodeUnmounted ? (
        <>
          <Separator className="mb-2" />
          <StatePanel selectedNode={selectedNode} />
          <Separator className="my-2" />
          <PropsPanel selectedNode={selectedNode} />
        </>
      ) : null}
    </div>
  );
};

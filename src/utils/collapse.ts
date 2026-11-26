import type { TreeNode } from "../types";
import { listSelectableNodes } from "./treeSearch";

/** The artificial "Filtered Tree" root has no instance ID, so it is undefined. */
export type BranchId = TreeNode["instanceId"];

/** The branches the user has collapsed, whether or not they are drawn. */
export type CollapsedBranches = ReadonlySet<BranchId>;

export type CollapseEvent =
  | { type: "toggle"; instanceId: BranchId }
  // Takes the unfiltered tree, so that filtering a node out does not expand it.
  | { type: "tree-received"; tree: TreeNode | null }
  | { type: "page-reload" };

export const NOTHING_COLLAPSED: CollapsedBranches = new Set();

export const nextCollapsedBranches = (
  collapsed: CollapsedBranches,
  event: CollapseEvent,
): CollapsedBranches => {
  switch (event.type) {
    case "toggle": {
      const next = new Set(collapsed);
      if (!next.delete(event.instanceId)) next.add(event.instanceId);
      return next;
    }

    case "tree-received": {
      if (collapsed.size === 0) return collapsed;

      const mountedIds = new Set<BranchId>(
        listSelectableNodes(event.tree).map(({ instanceId }) => instanceId),
      );
      // The artificial root is never in the unfiltered tree.
      const kept = [...collapsed].filter(
        (id) => id === undefined || mountedIds.has(id),
      );

      return kept.length === collapsed.size ? collapsed : new Set(kept);
    }

    case "page-reload":
      return NOTHING_COLLAPSED;
  }
};

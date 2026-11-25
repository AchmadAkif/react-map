import type { NodeRef, TreeNode } from "../types";
import { listSelectableNodes } from "./treeSearch";

/** The selected node, if any, and what the panel shows for it. */
export type Selection =
  | { status: "none" }
  | ({ status: "loading" } & NodeRef)
  | ({ status: "live"; details: TreeNode } & NodeRef)
  // Holds the last details, or null if it unmounted before any arrived.
  | ({ status: "unmounted"; details: TreeNode | null } & NodeRef);

export type SelectionEvent =
  | ({ type: "select" } & NodeRef)
  | { type: "deselect" }
  | { type: "page-reload" }
  | { type: "panel-close" }
  | { type: "unexpected-disconnect" }
  | {
      type: "details-received";
      instanceId: number | null;
      details: TreeNode | null;
    };

export const NOTHING_SELECTED: Selection = { status: "none" };

export const nextSelection = (
  selection: Selection,
  event: SelectionEvent,
): Selection => {
  switch (event.type) {
    case "select": {
      const { instanceId, name } = event;
      const isAlreadySelected =
        selection.status !== "none" && selection.instanceId === instanceId;

      return isAlreadySelected ? selection : { status: "loading", instanceId, name };
    }

    case "deselect":
    case "page-reload":
    case "panel-close":
      return NOTHING_SELECTED;

    case "unexpected-disconnect":
      return selection;

    case "details-received": {
      if (
        selection.status === "none" ||
        selection.instanceId !== event.instanceId
      ) {
        return selection;
      }

      const { instanceId, name } = selection;
      const { details } = event;

      if (details) {
        return { status: "live", instanceId, name: details.name, details };
      }

      const lastDetails =
        selection.status === "loading" ? null : selection.details;

      return { status: "unmounted", instanceId, name, details: lastDetails };
    }
  }
};

/**
 * Whether the selected node is mounted but not drawn. While its details are
 * loading it may turn out to be unmounted, so it does not count as hidden. Nor
 * does a node missing from the unfiltered tree, because a node that unmounts
 * leaves the tree before its details say so.
 */
export const isSelectionHidden = (
  selection: Selection,
  unfilteredTree: TreeNode,
  isDrawn: boolean,
): boolean =>
  selection.status === "live" &&
  !isDrawn &&
  listSelectableNodes(unfilteredTree).some(
    ({ instanceId }) => instanceId === selection.instanceId,
  );

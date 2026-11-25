import type { NodeRef, TreeNode } from "../types";

/** The selected node, if any, and what the panel shows for it. */
export type Selection =
  | { status: "none" }
  | ({ status: "loading" } & NodeRef)
  | ({ status: "live"; details: TreeNode } & NodeRef)
  | ({ status: "unmounted" } & NodeRef);

export type SelectionEvent =
  | ({ type: "select" } & NodeRef)
  | { type: "deselect" }
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
      const isAlreadyShown =
        (selection.status === "loading" || selection.status === "live") &&
        selection.instanceId === instanceId;

      return isAlreadyShown ? selection : { status: "loading", instanceId, name };
    }

    case "deselect":
      return NOTHING_SELECTED;

    case "details-received": {
      if (
        selection.status === "none" ||
        selection.instanceId !== event.instanceId
      ) {
        return selection;
      }

      const { instanceId, name } = selection;
      const { details } = event;

      return details
        ? { status: "live", instanceId, name: details.name, details }
        : { status: "unmounted", instanceId, name };
    }
  }
};

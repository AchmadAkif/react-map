import type { NodeRef, TreeNode } from "../types";

/** The selected node, if any, and what the panel shows for it. */
export type Selection =
  | { status: "none" }
  | ({ status: "loading" } & NodeRef)
  | ({ status: "live"; details: TreeNode } & NodeRef)
  | ({ status: "missing" } & NodeRef);

export type SelectionEvent =
  | ({ type: "select" } & NodeRef)
  | { type: "deselect" }
  | {
      type: "details-received";
      nodePath: string | null;
      details: TreeNode | null;
    };

export const NOTHING_SELECTED: Selection = { status: "none" };

/**
 * Applies an event to the current selection. The root's path is an empty
 * string, so absence is always checked through `status` or `null`.
 */
export const nextSelection = (
  selection: Selection,
  event: SelectionEvent,
): Selection => {
  switch (event.type) {
    case "select": {
      const { nodePath, name } = event;
      const isAlreadyShown =
        (selection.status === "loading" || selection.status === "live") &&
        selection.nodePath === nodePath;

      return isAlreadyShown ? selection : { status: "loading", nodePath, name };
    }

    case "deselect":
      return NOTHING_SELECTED;

    case "details-received": {
      if (
        selection.status === "none" ||
        selection.nodePath !== event.nodePath
      ) {
        return selection;
      }

      const { nodePath, name } = selection;
      const { details } = event;

      return details
        ? { status: "live", nodePath, name: details.name, details }
        : { status: "missing", nodePath, name };
    }
  }
};

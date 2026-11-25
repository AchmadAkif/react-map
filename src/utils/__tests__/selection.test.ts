import { describe, it, expect } from "vitest";
import {
  isSelectionHidden,
  nextSelection,
  NOTHING_SELECTED,
  type Selection,
} from "../selection";
import type { TreeNode } from "@/types";

const counterDetails: TreeNode = {
  name: "Counter",
  instanceId: 1,
  props: { count: 1 },
  state: null,
};

const loadingCounter: Selection = {
  status: "loading",
  instanceId: 1,
  name: "Counter",
};

const liveCounter: Selection = {
  status: "live",
  instanceId: 1,
  name: "Counter",
  details: counterDetails,
};

const unmountedCounter: Selection = {
  status: "unmounted",
  instanceId: 1,
  name: "Counter",
  details: counterDetails,
};

const loadingRoot: Selection = {
  status: "loading",
  instanceId: 2,
  name: "App",
};

describe("selection rules", () => {
  describe("select", () => {
    it("shows the node's name as loading when a node is selected", () => {
      expect(
        nextSelection(NOTHING_SELECTED, {
          type: "select",
          instanceId: 1,
          name: "Counter",
        }),
      ).toEqual(loadingCounter);
    });

    it("selects the root", () => {
      expect(
        nextSelection(NOTHING_SELECTED, {
          type: "select",
          instanceId: 2,
          name: "App",
        }),
      ).toEqual(loadingRoot);
    });

    it("replaces the selection directly, without the previous details", () => {
      expect(
        nextSelection(liveCounter, {
          type: "select",
          instanceId: 3,
          name: "Header",
        }),
      ).toEqual({ status: "loading", instanceId: 3, name: "Header" });
    });

    it("keeps the selection and its details when the node is selected again", () => {
      expect(
        nextSelection(liveCounter, {
          type: "select",
          instanceId: 1,
          name: "Counter",
        }),
      ).toEqual(liveCounter);
    });

    // It can still be drawn until the next tree update.
    it("keeps the last details when an unmounted node is selected again", () => {
      expect(
        nextSelection(unmountedCounter, {
          type: "select",
          instanceId: 1,
          name: "Counter",
        }),
      ).toEqual(unmountedCounter);
    });
  });

  it("deselects", () => {
    expect(nextSelection(liveCounter, { type: "deselect" })).toEqual({
      status: "none",
    });
  });

  describe("details received", () => {
    it("shows the details once they load", () => {
      expect(
        nextSelection(loadingCounter, {
          type: "details-received",
          instanceId: 1,
          details: counterDetails,
        }),
      ).toEqual(liveCounter);
    });

    it("shows the details of the root", () => {
      const appDetails: TreeNode = { name: "App", instanceId: 2 };

      expect(
        nextSelection(loadingRoot, {
          type: "details-received",
          instanceId: 2,
          details: appDetails,
        }),
      ).toEqual({
        status: "live",
        instanceId: 2,
        name: "App",
        details: appDetails,
      });
    });

    it("replaces the shown details on a live update", () => {
      const updated: TreeNode = { ...counterDetails, props: { count: 2 } };

      expect(
        nextSelection(liveCounter, {
          type: "details-received",
          instanceId: 1,
          details: updated,
        }),
      ).toEqual({
        status: "live",
        instanceId: 1,
        name: "Counter",
        details: updated,
      });
    });

    it.each([
      ["another node", 3],
      ["the root", 2],
      ["no node", null],
    ])("ignores a stale response for %s", (_label, instanceId) => {
      expect(
        nextSelection(loadingCounter, {
          type: "details-received",
          instanceId,
          details: null,
        }),
      ).toEqual(loadingCounter);
    });

    it("ignores a response for no node while the root is selected", () => {
      expect(
        nextSelection(loadingRoot, {
          type: "details-received",
          instanceId: null,
          details: null,
        }),
      ).toEqual(loadingRoot);
    });

    it("ignores a late response after deselecting", () => {
      expect(
        nextSelection(NOTHING_SELECTED, {
          type: "details-received",
          instanceId: 1,
          details: counterDetails,
        }),
      ).toEqual({ status: "none" });
    });

    it("keeps the last details of a node that unmounts", () => {
      expect(
        nextSelection(liveCounter, {
          type: "details-received",
          instanceId: 1,
          details: null,
        }),
      ).toEqual(unmountedCounter);
    });

    it("keeps the last details while the node stays unmounted", () => {
      expect(
        nextSelection(unmountedCounter, {
          type: "details-received",
          instanceId: 1,
          details: null,
        }),
      ).toEqual(unmountedCounter);
    });

    it("marks a node that unmounts before its details arrive as unmounted", () => {
      expect(
        nextSelection(loadingCounter, {
          type: "details-received",
          instanceId: 1,
          details: null,
        }),
      ).toEqual({
        status: "unmounted",
        instanceId: 1,
        name: "Counter",
        details: null,
      });
    });
  });

  describe("unmounted", () => {
    it("is cleared by selecting another node", () => {
      expect(
        nextSelection(unmountedCounter, {
          type: "select",
          instanceId: 2,
          name: "App",
        }),
      ).toEqual(loadingRoot);
    });

    it("is cleared by deselecting", () => {
      expect(nextSelection(unmountedCounter, { type: "deselect" })).toEqual({
        status: "none",
      });
    });
  });

  const everySelection: [string, Selection][] = [
    ["no node", NOTHING_SELECTED],
    ["a node whose details are loading", loadingCounter],
    ["a live node", liveCounter],
    ["an unmounted node", unmountedCounter],
  ];

  describe("page reload", () => {
    it.each(everySelection)(
      "leaves nothing selected after %s",
      (_label, selection) => {
        expect(nextSelection(selection, { type: "page-reload" })).toEqual({
          status: "none",
        });
      },
    );

    it("ignores details from before the reload", () => {
      const reloaded = nextSelection(liveCounter, { type: "page-reload" });

      expect(
        nextSelection(reloaded, {
          type: "details-received",
          instanceId: 1,
          details: counterDetails,
        }),
      ).toEqual({ status: "none" });
    });

    it("does not carry details over to a node with the same ID", () => {
      const reloaded = nextSelection(liveCounter, { type: "page-reload" });

      expect(
        nextSelection(reloaded, { type: "select", instanceId: 1, name: "App" }),
      ).toEqual({ status: "loading", instanceId: 1, name: "App" });
    });
  });

  describe("panel close", () => {
    it.each(everySelection)(
      "leaves nothing selected after %s",
      (_label, selection) => {
        expect(nextSelection(selection, { type: "panel-close" })).toEqual({
          status: "none",
        });
      },
    );
  });

  describe("unexpected disconnect", () => {
    it.each(everySelection)("keeps %s", (_label, selection) => {
      expect(
        nextSelection(selection, { type: "unexpected-disconnect" }),
      ).toEqual(selection);
    });
  });

  describe("hidden", () => {
    const treeWithCounter: TreeNode = {
      name: "App",
      instanceId: 2,
      children: [{ name: "Counter", instanceId: 1 }],
    };
    const treeWithoutCounter: TreeNode = { name: "App", instanceId: 2 };

    it("is a mounted node that is not drawn", () => {
      expect(isSelectionHidden(liveCounter, treeWithCounter, false)).toBe(true);
    });

    it("ends when the node is drawn again", () => {
      expect(isSelectionHidden(liveCounter, treeWithCounter, true)).toBe(false);
    });

    it("keeps updating live", () => {
      const updated: TreeNode = { ...counterDetails, props: { count: 2 } };
      const selection = nextSelection(liveCounter, {
        type: "details-received",
        instanceId: 1,
        details: updated,
      });

      expect(selection).toMatchObject({ status: "live", details: updated });
      expect(isSelectionHidden(selection, treeWithCounter, false)).toBe(true);
    });

    it.each([
      ["an unmounted node", unmountedCounter, treeWithoutCounter],
      ["an unmounted node in an outdated tree", unmountedCounter, treeWithCounter],
      // The details saying it unmounted arrive after the tree.
      ["a node that just left the tree", liveCounter, treeWithoutCounter],
      ["a node whose details are loading", loadingCounter, treeWithCounter],
      ["no node", NOTHING_SELECTED, treeWithCounter],
    ])("is never %s", (_label, selection, tree) => {
      expect(isSelectionHidden(selection, tree, false)).toBe(false);
    });
  });
});

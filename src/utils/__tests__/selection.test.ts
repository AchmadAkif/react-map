import { describe, it, expect } from "vitest";
import { nextSelection, NOTHING_SELECTED, type Selection } from "../selection";
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

    it("loads again when an unmounted node is selected again", () => {
      expect(
        nextSelection(unmountedCounter, {
          type: "select",
          instanceId: 1,
          name: "Header",
        }),
      ).toEqual({ status: "loading", instanceId: 1, name: "Header" });
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

    it("marks a node that is no longer found as unmounted", () => {
      expect(
        nextSelection(liveCounter, {
          type: "details-received",
          instanceId: 1,
          details: null,
        }),
      ).toEqual(unmountedCounter);
    });
  });
});

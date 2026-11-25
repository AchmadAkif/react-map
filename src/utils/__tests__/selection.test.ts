import { describe, it, expect } from "vitest";
import { nextSelection, NOTHING_SELECTED, type Selection } from "../selection";
import type { TreeNode } from "@/types";

const counterDetails: TreeNode = {
  name: "Counter",
  nodePath: "0/1",
  props: { count: 1 },
  state: null,
};

const loadingCounter: Selection = {
  status: "loading",
  nodePath: "0/1",
  name: "Counter",
};

const liveCounter: Selection = {
  status: "live",
  nodePath: "0/1",
  name: "Counter",
  details: counterDetails,
};

const unmountedCounter: Selection = {
  status: "unmounted",
  nodePath: "0/1",
  name: "Counter",
};

const loadingRoot: Selection = {
  status: "loading",
  nodePath: "",
  name: "App",
};

describe("selection rules", () => {
  describe("select", () => {
    it("shows the node's name as loading when a node is selected", () => {
      expect(
        nextSelection(NOTHING_SELECTED, {
          type: "select",
          nodePath: "0/1",
          name: "Counter",
        }),
      ).toEqual(loadingCounter);
    });

    it("selects the root, whose path is an empty string", () => {
      expect(
        nextSelection(NOTHING_SELECTED, {
          type: "select",
          nodePath: "",
          name: "App",
        }),
      ).toEqual(loadingRoot);
    });

    it("replaces the selection directly, without the previous details", () => {
      expect(
        nextSelection(liveCounter, {
          type: "select",
          nodePath: "0/2",
          name: "Header",
        }),
      ).toEqual({ status: "loading", nodePath: "0/2", name: "Header" });
    });

    it("keeps the selection and its details when the node is selected again", () => {
      expect(
        nextSelection(liveCounter, {
          type: "select",
          nodePath: "0/1",
          name: "Counter",
        }),
      ).toEqual(liveCounter);
    });

    it("loads again when an unmounted node's path is selected again", () => {
      expect(
        nextSelection(unmountedCounter, {
          type: "select",
          nodePath: "0/1",
          name: "Header",
        }),
      ).toEqual({ status: "loading", nodePath: "0/1", name: "Header" });
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
          nodePath: "0/1",
          details: counterDetails,
        }),
      ).toEqual(liveCounter);
    });

    it("shows the details of the root", () => {
      const appDetails: TreeNode = { name: "App", nodePath: "" };

      expect(
        nextSelection(loadingRoot, {
          type: "details-received",
          nodePath: "",
          details: appDetails,
        }),
      ).toEqual({
        status: "live",
        nodePath: "",
        name: "App",
        details: appDetails,
      });
    });

    it("replaces the shown details on a live update", () => {
      const updated: TreeNode = { ...counterDetails, props: { count: 2 } };

      expect(
        nextSelection(liveCounter, {
          type: "details-received",
          nodePath: "0/1",
          details: updated,
        }),
      ).toEqual({
        status: "live",
        nodePath: "0/1",
        name: "Counter",
        details: updated,
      });
    });

    it.each([
      ["another node", "0/2"],
      ["the root", ""],
      ["no node", null],
    ])("ignores a stale response for %s", (_label, nodePath) => {
      expect(
        nextSelection(loadingCounter, {
          type: "details-received",
          nodePath,
          details: null,
        }),
      ).toEqual(loadingCounter);
    });

    it("ignores a response for no node while the root is selected", () => {
      expect(
        nextSelection(loadingRoot, {
          type: "details-received",
          nodePath: null,
          details: null,
        }),
      ).toEqual(loadingRoot);
    });

    it("ignores a late response after deselecting", () => {
      expect(
        nextSelection(NOTHING_SELECTED, {
          type: "details-received",
          nodePath: "0/1",
          details: counterDetails,
        }),
      ).toEqual({ status: "none" });
    });

    it("marks a node that is no longer found as unmounted", () => {
      expect(
        nextSelection(liveCounter, {
          type: "details-received",
          nodePath: "0/1",
          details: null,
        }),
      ).toEqual(unmountedCounter);
    });
  });
});

import { describe, it, expect } from "vitest";
import { toRawNodeDatum } from "../treeAdapter";
import { filterTreeData, NOTHING_COLLAPSED } from "@/utils";
import type { TreeNode } from "@/types";

const tree: TreeNode = {
  name: "App",
  instanceId: 1,
  children: [
    {
      name: "List",
      instanceId: 2,
      children: [{ name: "Item", instanceId: 3 }],
    },
    { name: "Footer", instanceId: 4 },
  ],
};

describe("toRawNodeDatum", () => {
  it("draws every node when nothing is collapsed", () => {
    expect(toRawNodeDatum(tree, NOTHING_COLLAPSED)).toMatchObject({
      name: "App",
      isCollapsed: false,
      children: [
        { name: "List", isCollapsed: false, children: [{ name: "Item" }] },
        { name: "Footer" },
      ],
    });
  });

  it("draws a collapsed branch without its children", () => {
    // Empty rather than missing children, so that it is still styled as a branch.
    expect(toRawNodeDatum(tree, new Set([2]))).toMatchObject({
      name: "App",
      isCollapsed: false,
      children: [
        { name: "List", isCollapsed: true, children: [] },
        { name: "Footer" },
      ],
    });
  });

  it("does not count a node without children as collapsed", () => {
    const drawn = toRawNodeDatum({ name: "List", instanceId: 2 }, new Set([2]));
    expect(drawn?.isCollapsed).toBe(false);
    expect(drawn?.children).toBeUndefined();
  });

  it("collapses the artificial root, which has no ID", () => {
    const filteredTree: TreeNode = { name: "Filtered Tree", children: [tree] };
    expect(toRawNodeDatum(filteredTree, new Set([undefined]))).toMatchObject({
      isCollapsed: true,
      children: [],
    });
  });

  it("keeps a branch collapsed when a filter changes and it is still drawn", () => {
    const page: TreeNode = {
      name: "main",
      instanceId: 9,
      isDOM: true,
      children: [tree],
    };
    const filters = {
      hideRouterComponent: false,
      hideDomComponent: false,
      hideReduxComponent: false,
    };
    const collapsed = new Set([1]);
    const collapsedApp = { name: "App", isCollapsed: true, children: [] };

    expect(
      toRawNodeDatum(filterTreeData(page, filters), collapsed),
    ).toMatchObject({ name: "main", children: [collapsedApp] });
    expect(
      toRawNodeDatum(
        filterTreeData(page, { ...filters, hideDomComponent: true }),
        collapsed,
      ),
    ).toMatchObject(collapsedApp);
  });
});

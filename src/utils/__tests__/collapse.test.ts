import { describe, it, expect } from "vitest";
import {
  nextCollapsedBranches,
  NOTHING_COLLAPSED,
  type CollapsedBranches,
} from "../collapse";
import type { TreeNode } from "@/types";

const leaf = (name: string, instanceId: number): TreeNode => ({
  name,
  instanceId,
});

const list = (children: TreeNode[]): TreeNode => ({
  name: "List",
  instanceId: 1,
  children,
});

const itemA: TreeNode = {
  name: "Item",
  instanceId: 2,
  children: [leaf("Label", 3)],
};

const itemB: TreeNode = {
  name: "Item",
  instanceId: 4,
  children: [leaf("Label", 5)],
};

const toggle = (collapsed: CollapsedBranches, instanceId?: number) =>
  nextCollapsedBranches(collapsed, { type: "toggle", instanceId });

const receiveTree = (collapsed: CollapsedBranches, tree: TreeNode | null) =>
  nextCollapsedBranches(collapsed, { type: "tree-received", tree });

describe("collapse rules", () => {
  it("starts with every branch expanded", () => {
    expect([...NOTHING_COLLAPSED]).toEqual([]);
  });

  it("collapses only the toggled branch", () => {
    expect([...toggle(NOTHING_COLLAPSED, 1)]).toEqual([1]);
  });

  it("collapses further branches without expanding the others", () => {
    expect([...toggle(new Set([2]), 4)]).toEqual([2, 4]);
  });

  it("expands a collapsed branch without expanding the others", () => {
    expect([...toggle(new Set([2, 4]), 2)]).toEqual([4]);
  });

  it("does not change the previous state", () => {
    const collapsed = new Set([2]);
    toggle(collapsed, 2);
    toggle(collapsed, 4);
    expect([...collapsed]).toEqual([2]);
  });

  it("keeps a branch collapsed through a tree update", () => {
    const collapsed = new Set([2]);
    expect(receiveTree(collapsed, list([itemA, itemB]))).toBe(collapsed);
  });

  it("keeps a branch collapsed when keyed siblings are reordered", () => {
    expect([...receiveTree(new Set([2]), list([itemB, itemA]))]).toEqual([2]);
  });

  it("keeps an expanded branch expanded through a tree update", () => {
    const expanded = toggle(new Set([2]), 2);
    expect([...receiveTree(expanded, list([itemA, itemB]))]).toEqual([]);
  });

  it("keeps a branch collapsed while it has no children", () => {
    const collapsed = receiveTree(new Set([2]), list([leaf("Item", 2)]));
    expect([...collapsed]).toEqual([2]);
  });

  it("drops unmounted branches and keeps the rest", () => {
    expect([...receiveTree(new Set([2, 4]), list([itemB]))]).toEqual([4]);
  });

  it("drops every component's branch when the tree is gone", () => {
    expect([...receiveTree(new Set([2, 4]), null)]).toEqual([]);
  });

  it("expands every branch on a page reload", () => {
    const collapsed = nextCollapsedBranches(new Set([2, undefined]), {
      type: "page-reload",
    });
    expect([...collapsed]).toEqual([]);
  });

  it("keeps the artificial root collapsed through a tree update", () => {
    const collapsed = toggle(NOTHING_COLLAPSED, undefined);
    expect([...receiveTree(collapsed, list([itemA]))]).toEqual([undefined]);
  });
});

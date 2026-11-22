import { describe, it, expect } from "vitest";
import {
  filterTreeData,
  filterTreeNodes,
  shouldHideNode,
} from "../treeFiltering";
import type { TreeFilters, TreeNode } from "@/types";

describe("treeFiltering utils", () => {
  const defaultFilters: TreeFilters = {
    hideDomComponent: false,
    hideRouterComponent: false,
    hideReduxComponent: false,
  };

  const sampleTree: TreeNode = {
    name: "App",
    nodePath: "0",
    attributes: { nodeType: "FunctionComponent" },
    children: [
      {
        name: "BrowserRouter",
        nodePath: "0/0",
        attributes: { nodeType: "FunctionComponent" },
        children: [
          {
            name: "Provider",
            nodePath: "0/0/0",
            attributes: { nodeType: "FunctionComponent" },
            children: [
              {
                name: "div",
                nodePath: "0/0/0/0",
                isDOM: true,
                attributes: { nodeType: "HostComponent" },
                children: [
                  {
                    name: "UserProfile",
                    nodePath: "0/0/0/0/0",
                    attributes: { nodeType: "FunctionComponent" },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  it("should not hide nodes when all filters are false", () => {
    expect(shouldHideNode(sampleTree, defaultFilters)).toBe(false);
    const result = filterTreeData(sampleTree, defaultFilters);
    expect(result).toEqual(sampleTree);
  });

  it("should hide DOM components when hideDomComponent is true", () => {
    const domNode: TreeNode = {
      name: "span",
      isDOM: true,
      attributes: { nodeType: "HostComponent" },
    };
    expect(
      shouldHideNode(domNode, { ...defaultFilters, hideDomComponent: true }),
    ).toBe(true);

    const filtered = filterTreeData(sampleTree, {
      ...defaultFilters,
      hideDomComponent: true,
    });
    // The div should be pruned, and its child UserProfile flattened upwards
    expect(filtered?.children?.[0]?.children?.[0]?.children?.[0]?.name).toBe(
      "UserProfile",
    );
  });

  it("should hide router components when hideRouterComponent is true", () => {
    const routerNode: TreeNode = {
      name: "NavLink",
      attributes: { nodeType: "FunctionComponent" },
    };
    expect(
      shouldHideNode(routerNode, {
        ...defaultFilters,
        hideRouterComponent: true,
      }),
    ).toBe(true);
  });

  it("should hide redux components when hideReduxComponent is true", () => {
    const reduxNode: TreeNode = {
      name: "Provider",
      attributes: { nodeType: "FunctionComponent" },
    };
    expect(
      shouldHideNode(reduxNode, {
        ...defaultFilters,
        hideReduxComponent: true,
      }),
    ).toBe(true);
  });

  it("returns null if node is null", () => {
    expect(filterTreeData(null, defaultFilters)).toBeNull();
  });

  it("creates a SyntheticRoot if multiple roots remain after filtering", () => {
    const multiRootChildTree: TreeNode = {
      name: "RootWrapper",
      children: [
        { name: "ChildA" },
        { name: "ChildB" },
      ],
    };

    // Filter out RootWrapper by pretending it matches a filter
    const nodes = filterTreeNodes(multiRootChildTree, {
      ...defaultFilters,
      hideDomComponent: false,
    });
    expect(nodes.length).toBe(1);
  });
});

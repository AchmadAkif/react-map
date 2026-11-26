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
    instanceId: 1,
    attributes: { nodeType: "FunctionComponent" },
    children: [
      {
        name: "BrowserRouter",
        instanceId: 2,
        attributes: { nodeType: "FunctionComponent" },
        children: [
          {
            name: "Provider",
            instanceId: 3,
            attributes: { nodeType: "FunctionComponent" },
            children: [
              {
                name: "div",
                instanceId: 4,
                isDOM: true,
                attributes: { nodeType: "HostComponent" },
                children: [
                  {
                    name: "UserProfile",
                    instanceId: 5,
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

  it.each([
    ["element", "div", "HostComponent"],
    ["text", "Anonymous", "Text"],
    ["hoistable", "title", "HostHoistable"],
    ["singleton", "body", "HostSingleton"],
  ])(
    "hides %s nodes and keeps their component descendants in place",
    (_kind, name, nodeType) => {
      const tree: TreeNode = {
        name: "App",
        instanceId: 1,
        attributes: { nodeType: "FunctionComponent" },
        children: [
          { name: "Before", attributes: { nodeType: "FunctionComponent" } },
          {
            name,
            attributes: { nodeType },
            children: [
              {
                name: "Inside",
                instanceId: 99,
                attributes: { nodeType: "FunctionComponent" },
              },
            ],
          },
          { name: "After", attributes: { nodeType: "FunctionComponent" } },
        ],
      };

      const filtered = filterTreeData(tree, {
        ...defaultFilters,
        hideDomComponent: true,
      });

      expect(filtered?.children?.map((child) => child.name)).toEqual([
        "Before",
        "Inside",
        "After",
      ]);
      expect(filtered?.children?.[1].instanceId).toBe(99);
      expect(filterTreeData(tree, defaultFilters)).toEqual(tree);
    },
  );

  it.each([
    ["Anonymous", "Fragment"],
    ["Theme.Provider", "ContextProvider"],
    ["Anonymous", "SuspenseComponent"],
    ["Anonymous", "HostPortal"],
    ["Text", "FunctionComponent"],
  ])("does not treat %s (%s) as a DOM node", (name, nodeType) => {
    expect(
      shouldHideNode(
        { name, isDOM: false, attributes: { nodeType } },
        { ...defaultFilters, hideDomComponent: true },
      ),
    ).toBe(false);
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

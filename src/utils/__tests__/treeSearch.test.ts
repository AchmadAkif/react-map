import { describe, it, expect } from "vitest";
import { findNodeById, findNodeByPath, listSelectableNodes } from "../treeSearch";
import type { TreeNode } from "@/types";
import type { TreeNodeDatum } from "react-d3-tree";

describe("treeSearch utils", () => {
  const treeData: TreeNode[] = [
    {
      name: "App",
      nodePath: "0",
      children: [
        {
          name: "Sidebar",
          nodePath: "0/0",
          children: [
            {
              name: "Button",
              nodePath: "0/0/0",
            },
          ],
        },
        {
          name: "Content",
          nodePath: "0/1",
        },
      ],
    },
  ];

  it("finds node by nodePath in TreeNode hierarchy", () => {
    const found = findNodeByPath("0/0/0", treeData);
    expect(found).not.toBeNull();
    expect(found?.name).toBe("Button");
  });

  it("returns null if nodePath does not exist", () => {
    const notFound = findNodeByPath("9/9/9", treeData);
    expect(notFound).toBeNull();
  });

  it("returns null if empty treeData passed to findNodeByPath", () => {
    expect(findNodeByPath("0", null)).toBeNull();
    expect(findNodeByPath("0", [])).toBeNull();
  });

  it("finds node by id using react-d3-tree TreeNodeDatum", () => {
    const d3Nodes: TreeNodeDatum[] = [
      {
        name: "Root",
        __rd3t: { id: "id-root", depth: 0, collapsed: false },
        children: [
          {
            name: "Child",
            __rd3t: { id: "id-child", depth: 1, collapsed: false },
          },
        ],
      },
    ];

    const found = findNodeById("id-child", d3Nodes);
    expect(found).not.toBeNull();
    expect(found?.name).toBe("Child");

    expect(findNodeById("missing", d3Nodes)).toBeNull();
    expect(findNodeById("missing", [])).toBeNull();
  });
});

describe("listSelectableNodes", () => {
  it("lists every node, including the root with its empty path", () => {
    expect(
      listSelectableNodes({
        name: "App",
        nodePath: "",
        children: [
          {
            name: "Sidebar",
            nodePath: "0",
            children: [{ name: "Button", nodePath: "0/0" }],
          },
          { name: "Content", nodePath: "1" },
        ],
      }),
    ).toEqual([
      { name: "App", nodePath: "" },
      { name: "Sidebar", nodePath: "0" },
      { name: "Button", nodePath: "0/0" },
      { name: "Content", nodePath: "1" },
    ]);
  });

  it("leaves out the artificial root but keeps its children", () => {
    expect(
      listSelectableNodes({
        name: "Filtered Tree",
        children: [
          { name: "Sidebar", nodePath: "0" },
          { name: "Content", nodePath: "1" },
        ],
      }),
    ).toEqual([
      { name: "Sidebar", nodePath: "0" },
      { name: "Content", nodePath: "1" },
    ]);
  });

  it("lists nothing when no tree is drawn", () => {
    expect(listSelectableNodes(null)).toEqual([]);
  });
});

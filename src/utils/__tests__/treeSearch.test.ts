import { describe, it, expect } from "vitest";
import { findNodeById, listSelectableNodes } from "../treeSearch";
import type { TreeNodeDatum } from "react-d3-tree";

describe("treeSearch utils", () => {
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
  it("lists every node, including the root", () => {
    expect(
      listSelectableNodes({
        name: "App",
        instanceId: 1,
        children: [
          {
            name: "Sidebar",
            instanceId: 2,
            children: [{ name: "Button", instanceId: 3 }],
          },
          { name: "Content", instanceId: 4 },
        ],
      }),
    ).toEqual([
      { name: "App", instanceId: 1 },
      { name: "Sidebar", instanceId: 2 },
      { name: "Button", instanceId: 3 },
      { name: "Content", instanceId: 4 },
    ]);
  });

  it("leaves out the artificial root but keeps its children", () => {
    expect(
      listSelectableNodes({
        name: "Filtered Tree",
        children: [
          { name: "Sidebar", instanceId: 2 },
          { name: "Content", instanceId: 4 },
        ],
      }),
    ).toEqual([
      { name: "Sidebar", instanceId: 2 },
      { name: "Content", instanceId: 4 },
    ]);
  });

  it("lists nothing when no tree is drawn", () => {
    expect(listSelectableNodes(null)).toEqual([]);
  });
});

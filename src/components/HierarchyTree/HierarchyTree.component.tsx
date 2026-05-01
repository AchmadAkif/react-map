import Tree from "react-d3-tree";

import type { HierarchyTreeProps } from "./HierarchyTree.types";

export default function HierarchyTree({
  data,
  treeOrientation,
  nodeSize,
  handleOnNodeHover,
}: HierarchyTreeProps) {
  if (!data) {
    return (
      <div
        id="treeWrapper"
        className="flex h-screen w-full items-center justify-center"
      >
        <p className="text-sm text-gray-500">
          No components match the selected filters.
        </p>
      </div>
    );
  }

  return (
    // `<Tree />` will fill width/height of its container; in this case `#treeWrapper`.
    <div id="treeWrapper" className="h-screen w-full">
      <Tree
        data={data}
        orientation={treeOrientation}
        nodeSize={nodeSize}
        onNodeMouseOver={(node) => {
          if (handleOnNodeHover) handleOnNodeHover(node.data);
        }}
      />
    </div>
  );
}

import Tree from "react-d3-tree";

import type { HierarchyTreeProps } from "./HierarchyTree.types";

export default function HierarchyTree({
  data,
  treeOrientation,
  nodeSize,
}: HierarchyTreeProps) {
  return (
    // `<Tree />` will fill width/height of its container; in this case `#treeWrapper`.
    <div id="treeWrapper" className="h-screen w-full">
      <Tree data={data} orientation={treeOrientation} nodeSize={nodeSize} />
    </div>
  );
}

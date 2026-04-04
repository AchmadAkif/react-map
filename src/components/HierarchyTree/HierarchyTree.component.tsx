import Tree from "react-d3-tree";

import type { HierarchyTreeProps } from "./HierarchyTree.types";

export default function HierarchyTree({ data }: HierarchyTreeProps) {
  return (
    // `<Tree />` will fill width/height of its container; in this case `#treeWrapper`.
    <div id="treeWrapper" style={{ height: "100vh" }}>
      <Tree data={data} />
    </div>
  );
}

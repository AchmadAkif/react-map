import { useState } from "react";
import { HierarchyTree, Sidebar } from "../../components";

import type { RawNodeDatum, TreeNodeDatum } from "react-d3-tree";
import type { TreeOrientation, NodeSpacing } from "../../types";

const Main = ({ data }: { data: RawNodeDatum }) => {
  const [treeOrientation, setTreeOrientation] =
    useState<TreeOrientation>("vertical");
  const [nodeSpacing, setNodeSpacing] = useState<NodeSpacing>({
    x: 200,
    y: 200,
  });

  const handleSetOrientation = (orientation: TreeOrientation) => {
    setTreeOrientation(orientation);
  };

  const handleNodeSpacingChange = (value: number, axis: "x" | "y") => {
    setNodeSpacing((prev) => ({ ...prev, [axis]: value }));
  };

  const handeOnNodeHover = (node: TreeNodeDatum) => {
    console.log(node);
  };

  return (
    <div className="flex">
      <Sidebar
        treeOrientation={treeOrientation}
        onSetOrientation={handleSetOrientation}
        nodeSpacing={nodeSpacing}
        onNodeSpacingChange={handleNodeSpacingChange}
      />
      <HierarchyTree
        data={data}
        treeOrientation={treeOrientation}
        nodeSize={nodeSpacing}
        handleOnNodeHover={handeOnNodeHover}
      />
    </div>
  );
};

export default Main;

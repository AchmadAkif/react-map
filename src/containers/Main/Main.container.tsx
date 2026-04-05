import { useState } from "react";
import { HierarchyTree, Sidebar } from "../../components";

import type { RawNodeDatum } from "react-d3-tree";
import type { TreeOrientation } from "../../types";

const Main = ({ data }: { data: RawNodeDatum }) => {
  const [treeOrientation, setTreeOrientation] =
    useState<TreeOrientation>("vertical");

  const handleSetOrientation = (orientation: TreeOrientation) => {
    setTreeOrientation(orientation);
  };

  return (
    <div className="flex">
      <Sidebar
        treeOrientation={treeOrientation}
        onSetOrientation={handleSetOrientation}
      />
      <HierarchyTree data={data} treeOrientation={treeOrientation} />
    </div>
  );
};

export default Main;

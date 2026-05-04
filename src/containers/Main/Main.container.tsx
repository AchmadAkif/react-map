import { useMemo, useState } from "react";
import { HierarchyTree, Sidebar } from "../../components";
import { filterTreeData } from "../../utils";

import type { RawNodeDatum, TreeNodeDatum } from "react-d3-tree";
import type { TreeFilters, TreeOrientation, NodeSpacing } from "../../types";

const Main = ({ data }: { data: RawNodeDatum }) => {
  const [treeOrientation, setTreeOrientation] =
    useState<TreeOrientation>("vertical");
  const [hoveredNode, setHoveredNode] = useState<TreeNodeDatum | null>(null);
  const [nodeSpacing, setNodeSpacing] = useState<NodeSpacing>({
    x: 200,
    y: 200,
  });
  const [treeFilters, setTreeFilters] = useState<TreeFilters>({
    hideRouterComponent: false,
    hideDomComponent: false,
    hideReduxComponent: false,
  });

  const filteredTreeData = useMemo(
    () => filterTreeData(data, treeFilters),
    [data, treeFilters],
  );

  const handleSetOrientation = (orientation: TreeOrientation) => {
    setTreeOrientation(orientation);
  };

  const handleNodeSpacingChange = (value: number, axis: "x" | "y") => {
    setNodeSpacing((prev) => ({ ...prev, [axis]: value }));
  };

  const handleFilterChange = (
    filterName: keyof TreeFilters,
    value: boolean,
  ) => {
    setTreeFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const handeOnNodeHover = (node: TreeNodeDatum) => {
    setHoveredNode(node);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <HierarchyTree
        data={filteredTreeData}
        treeOrientation={treeOrientation}
        nodeSize={nodeSpacing}
        handleOnNodeHover={handeOnNodeHover}
      />
      <Sidebar
        data={filterTreeData}
        treeOrientation={treeOrientation}
        onSetOrientation={handleSetOrientation}
        nodeSpacing={nodeSpacing}
        onNodeSpacingChange={handleNodeSpacingChange}
        hoveredNode={hoveredNode}
        treeFilters={treeFilters}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
};

export default Main;

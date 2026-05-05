import { useMemo, useState, useRef } from "react";
import type { RawNodeDatum, TreeNodeDatum } from "react-d3-tree";

import { HierarchyTree, Sidebar } from "../../components";
import { filterTreeData } from "../../utils";

import { Tree as TreeType } from "react-d3-tree";
import {
  type TreeFilters,
  type TreeOrientation,
  type NodeSpacing,
  type renderedNode,
} from "../../types";

const Main = ({ data }: { data: RawNodeDatum }) => {
  const treeRef = useRef<TreeType>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [selectedNode, setSelectedNode] = useState<renderedNode | null>(null);
  const [renderedTreeData, setRenderedTreeData] = useState<
    { value: string; label: string; nodePointer: renderedNode }[]
  >([]);
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

  const handleOnNodeHover = (node: TreeNodeDatum) => {
    setHoveredNode(node);
  };

  const handleRenderedTreeData = (data: renderedNode[]) => {
    const filterData = data.map((node) => {
      return {
        value: node.data.__rd3t.id,
        label: node.data.name,
        nodePointer: node,
      };
    });

    setRenderedTreeData(filterData);
  };

  const handleSelectedValueChange = (value: string) => {
    setSelectedValue(value);

    const selectedNode =
      renderedTreeData.find((node) => node.value === value)?.nodePointer ??
      null;
    setSelectedNode(selectedNode);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <HierarchyTree
        treeRef={treeRef}
        data={filteredTreeData}
        treeOrientation={treeOrientation}
        nodeSize={nodeSpacing}
        handleOnNodeHover={handleOnNodeHover}
        treeFilters={treeFilters}
        onRenderedTreeData={handleRenderedTreeData}
        selectedNode={selectedNode}
      />
      <Sidebar
        treeOrientation={treeOrientation}
        onSetOrientation={handleSetOrientation}
        nodeSpacing={nodeSpacing}
        onNodeSpacingChange={handleNodeSpacingChange}
        hoveredNode={hoveredNode}
        treeFilters={treeFilters}
        onFilterChange={handleFilterChange}
        searchValue={searchValue}
        onSearchValueChange={setSearchValue}
        selectedValue={selectedValue}
        onSelectedValueChange={handleSelectedValueChange}
        renderedTreeData={renderedTreeData}
      />
    </div>
  );
};

export default Main;

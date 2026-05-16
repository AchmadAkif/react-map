import { useMemo, useRef, useState } from "react";
import type { RawNodeDatum, TreeNodeDatum } from "react-d3-tree";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { HierarchyTree, Sidebar } from "../../components";
import { filterTreeData } from "../../utils";

import { Tree as TreeType } from "react-d3-tree";
import {
  type InspectableNode,
  type TreeFilters,
  type TreeOrientation,
  type NodeSpacing,
  type RenderedNode,
} from "../../types";

const Main = ({
  data,
  lockedNodeData,
  lockedNodePath,
  onLockNodeChange,
}: {
  data: RawNodeDatum;
  lockedNodeData?: InspectableNode;
  lockedNodePath?: string | null;
  onLockNodeChange: (nodePath: string | null) => void;
}) => {
  const treeRef = useRef<TreeType>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [renderedNodeData, setRenderedNodeData] = useState<
    { value: string; label: string; nodePointer: RenderedNode }[]
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

  const handleOnNodeClick = (node: RenderedNode) => {
    const nodePath = (node.data as { nodePath?: string }).nodePath;

    if (!nodePath) {
      return;
    }

    onLockNodeChange(lockedNodePath === nodePath ? null : nodePath);
    setSelectedValue(nodePath);
  };

  const handleRenderedTreeData = (data: RenderedNode[]) => {
    const filterData = data.map((node) => {
      return {
        value:
          (node.data as { nodePath?: string }).nodePath ?? node.data.__rd3t.id,
        label: node.data.name,
        nodePointer: node,
      };
    });

    setRenderedNodeData(filterData);
  };

  const handleSelectedValueChange = (value: string) => {
    setSelectedValue(value);
  };

  const selectedNode = useMemo(
    () =>
      renderedNodeData.find((node) => node.value === selectedValue)
        ?.nodePointer ?? null,
    [renderedNodeData, selectedValue],
  );

  const isLockActive = lockedNodePath !== null;
  const lockedNodeUnavailable = isLockActive && lockedNodeData === null;
  const activeNode = isLockActive ? lockedNodeData : hoveredNode;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize="50%">
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
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="50%">
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
            renderedNodeData={renderedNodeData}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Main;

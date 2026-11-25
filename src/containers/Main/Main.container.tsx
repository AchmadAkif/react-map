import { useMemo, useRef, useState } from "react";
import type { Tree as TreeType } from "react-d3-tree";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { HierarchyTree, Sidebar } from "@/components";
import { filterTreeData } from "@/utils";
import { useTreePreferences, useNodeSearch } from "@/hooks";
import type { InspectableNode, TreeNode } from "@/types";

export interface MainContainerProps {
  data: TreeNode;
  selectedNodeData?: InspectableNode;
  selectedNodePath?: string | null;
  onSelectedNodeChange: (nodePath: string | null) => void;
}

export const MainContainer = ({
  data,
  selectedNodeData,
  selectedNodePath,
  onSelectedNodeChange,
}: MainContainerProps) => {
  const treeRef = useRef<TreeType>(null);
  const [hoveredNode, setHoveredNode] = useState<TreeNode | null>(null);

  const {
    treeOrientation,
    nodeSpacing,
    treeFilters,
    handleSetOrientation,
    handleNodeSpacingChange,
    handleFilterChange,
  } = useTreePreferences();

  const {
    searchValue,
    setSearchValue,
    selectedValue,
    setSelectedValue,
    renderedNodeData,
    selectedNode,
    handleRenderedTreeData,
  } = useNodeSearch();

  const filteredTreeData = useMemo(
    () => filterTreeData(data, treeFilters),
    [data, treeFilters],
  );

  const handleOnNodeHover = (node: TreeNode) => {
    setHoveredNode(node);
  };

  const hasSelectedNode = typeof selectedNodePath === "string";
  const selectedNodeUnmounted = hasSelectedNode && selectedNodeData === null;
  const inspectedNode = hasSelectedNode ? selectedNodeData : hoveredNode;

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
            selectedNode={inspectedNode}
            selectedNodeUnmounted={selectedNodeUnmounted}
            selectedNodePath={selectedNodePath ?? null}
            onSelectedNodeChange={onSelectedNodeChange}
            treeFilters={treeFilters}
            onFilterChange={handleFilterChange}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            selectedValue={selectedValue}
            onSelectedValueChange={setSelectedValue}
            renderedNodeData={renderedNodeData}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

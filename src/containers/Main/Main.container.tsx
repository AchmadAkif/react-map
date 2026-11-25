import { useMemo, useRef } from "react";
import type { Tree as TreeType } from "react-d3-tree";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { HierarchyTree, Sidebar } from "@/components";
import { filterTreeData, type Selection } from "@/utils";
import {
  useDeselectOnEscape,
  useNodeSearch,
  useTreePreferences,
} from "@/hooks";
import type { NodeRef, TreeNode } from "@/types";

export interface MainContainerProps {
  data: TreeNode;
  selection: Selection;
  onSelectNode: (node: NodeRef) => void;
  onDeselectNode: () => void;
}

export const MainContainer = ({
  data,
  selection,
  onSelectNode,
  onDeselectNode,
}: MainContainerProps) => {
  const treeRef = useRef<TreeType>(null);

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
    selectedNode: searchedNode,
    handleRenderedTreeData,
  } = useNodeSearch();

  const filteredTreeData = useMemo(
    () => filterTreeData(data, treeFilters),
    [data, treeFilters],
  );

  const hasSelection = selection.status !== "none";
  useDeselectOnEscape(hasSelection, onDeselectNode);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize="50%">
          <HierarchyTree
            treeRef={treeRef}
            data={filteredTreeData}
            treeOrientation={treeOrientation}
            nodeSize={nodeSpacing}
            treeFilters={treeFilters}
            onRenderedTreeData={handleRenderedTreeData}
            searchedNode={searchedNode}
            selectedNodePath={hasSelection ? selection.nodePath : null}
            onSelectNode={onSelectNode}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="50%">
          <Sidebar
            treeOrientation={treeOrientation}
            onSetOrientation={handleSetOrientation}
            nodeSpacing={nodeSpacing}
            onNodeSpacingChange={handleNodeSpacingChange}
            selection={selection}
            onDeselectNode={onDeselectNode}
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

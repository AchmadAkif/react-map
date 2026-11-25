import { useMemo, useRef, useState } from "react";
import type { Tree as TreeType } from "react-d3-tree";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { HierarchyTree, Sidebar } from "@/components";
import {
  filterTreeData,
  isSelectionHidden,
  listSelectableNodes,
  type BranchId,
  type CollapsedBranches,
  type Selection,
} from "@/utils";
import { useDeselectOnEscape, useTreePreferences } from "@/hooks";
import type { NodeRef, TreeNode } from "@/types";

export interface MainContainerProps {
  data: TreeNode;
  collapsedBranches: CollapsedBranches;
  onToggleBranch: (instanceId: BranchId) => void;
  selection: Selection;
  onSelectNode: (node: NodeRef) => void;
  onDeselectNode: () => void;
}

export const MainContainer = ({
  data,
  collapsedBranches,
  onToggleBranch,
  selection,
  onSelectNode,
  onDeselectNode,
}: MainContainerProps) => {
  const treeRef = useRef<TreeType>(null);
  const [isSelectedNodeDrawn, setIsSelectedNodeDrawn] = useState(false);

  const {
    treeOrientation,
    nodeSpacing,
    treeFilters,
    handleSetOrientation,
    handleNodeSpacingChange,
    handleFilterChange,
  } = useTreePreferences();

  const filteredTreeData = useMemo(
    () => filterTreeData(data, treeFilters),
    [data, treeFilters],
  );

  const searchableNodes = useMemo(
    () => listSelectableNodes(filteredTreeData),
    [filteredTreeData],
  );

  const isHidden = useMemo(
    () => isSelectionHidden(selection, data, isSelectedNodeDrawn),
    [selection, data, isSelectedNodeDrawn],
  );

  const handleChooseSearchResult = (node: NodeRef) => {
    onSelectNode(node);

    // A result inside a collapsed branch is not drawn, so it stays uncentered.
    const tree = treeRef.current;
    const drawnNode = tree
      ?.generateTree()
      .nodes.find(({ data }) => data.instanceId === node.instanceId);
    if (drawnNode) tree?.centerNode(drawnNode);
  };

  const hasSelection = selection.status !== "none";
  const selectedInstanceId = hasSelection ? selection.instanceId : null;
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
            collapsedBranches={collapsedBranches}
            onToggleBranch={onToggleBranch}
            selectedInstanceId={selectedInstanceId}
            onSelectNode={onSelectNode}
            onSelectedNodeDrawnChange={setIsSelectedNodeDrawn}
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
            isSelectionHidden={isHidden}
            onDeselectNode={onDeselectNode}
            treeFilters={treeFilters}
            onFilterChange={handleFilterChange}
            searchableNodes={searchableNodes}
            selectedInstanceId={selectedInstanceId}
            onChooseSearchResult={handleChooseSearchResult}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

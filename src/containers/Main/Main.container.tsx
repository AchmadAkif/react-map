import { useMemo, useRef } from "react";
import type { Tree as TreeType } from "react-d3-tree";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { HierarchyTree, Sidebar } from "@/components";
import { filterTreeData, listSelectableNodes, type Selection } from "@/utils";
import { useDeselectOnEscape, useTreePreferences } from "@/hooks";
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

  const filteredTreeData = useMemo(
    () => filterTreeData(data, treeFilters),
    [data, treeFilters],
  );

  const searchableNodes = useMemo(
    () => listSelectableNodes(filteredTreeData),
    [filteredTreeData],
  );

  const handleChooseSearchResult = (node: NodeRef) => {
    onSelectNode(node);

    // A result inside a collapsed branch is not drawn, so it stays uncentered.
    const tree = treeRef.current;
    const drawnNode = tree
      ?.generateTree()
      .nodes.find(({ data }) => data.nodePath === node.nodePath);
    if (drawnNode) tree?.centerNode(drawnNode);
  };

  const hasSelection = selection.status !== "none";
  const selectedNodePath = hasSelection ? selection.nodePath : null;
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
            selectedNodePath={selectedNodePath}
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
            searchableNodes={searchableNodes}
            selectedNodePath={selectedNodePath}
            onChooseSearchResult={handleChooseSearchResult}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

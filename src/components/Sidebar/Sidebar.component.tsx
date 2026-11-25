import { Separator } from "../ui/separator";
import { ComponentDetails } from "../ComponentDetails";
import { SearchBar } from "../SearchBar";
import { PreferencesCollapsible } from "../PreferencesCollapsible";

import type { SidebarProps } from "./Sidebar.types";

export const Sidebar = ({
  treeOrientation,
  onSetOrientation,
  nodeSpacing,
  onNodeSpacingChange,
  selection,
  isSelectionHidden,
  onDeselectNode,
  treeFilters,
  onFilterChange,
  searchableNodes,
  selectedInstanceId,
  onChooseSearchResult,
}: SidebarProps) => {
  return (
    <div className="h-full overflow-y-auto py-3 shadow-md">
      <SearchBar
        nodes={searchableNodes}
        selectedInstanceId={selectedInstanceId}
        onChooseNode={onChooseSearchResult}
      />
      <Separator className="my-2" />
      <PreferencesCollapsible
        treeOrientation={treeOrientation}
        nodeSpacing={nodeSpacing}
        handleSetOrientation={onSetOrientation}
        handleNodeSpacingChange={onNodeSpacingChange}
        treeFilters={treeFilters}
        handleFilterChange={onFilterChange}
      />
      <Separator className="my-2" />
      <ComponentDetails
        selection={selection}
        isHidden={isSelectionHidden}
        onDeselectNode={onDeselectNode}
      />
    </div>
  );
};

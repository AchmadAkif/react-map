import { Separator } from "../ui/separator";
import { ComponentDetails } from "../ComponentDetails";
import { SearchBar } from "../SearchBar";
import { PreferencesCollapsible } from "../PreferencesCollapsible";

import type { SidebarProps } from "./Sidebar.types";

const Sidebar = ({
  treeOrientation,
  onSetOrientation,
  nodeSpacing,
  onNodeSpacingChange,
  hoveredNode,
  lockedNodeUnavailable,
  lockedNodePath,
  onLockNodeChange,
  treeFilters,
  onFilterChange,
  searchValue,
  onSearchValueChange,
  selectedValue,
  onSelectedValueChange,
  renderedNodeData,
}: SidebarProps) => {
  return (
    <div className="min-w-md h-full overflow-y-auto py-3 shadow-md">
      <SearchBar
        items={renderedNodeData}
        searchValue={searchValue}
        onSearchValueChange={onSearchValueChange}
        selectedValue={selectedValue}
        onSelectedValueChange={onSelectedValueChange}
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
        hoveredNode={hoveredNode}
        lockedNodeUnavailable={lockedNodeUnavailable}
        lockedNodePath={lockedNodePath}
        onLockNodeChange={onLockNodeChange}
      />
    </div>
  );
};

export default Sidebar;

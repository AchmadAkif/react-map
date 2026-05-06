import { Separator } from "../ui/separator";
import { ComponentDetails } from "../ComponentDetails";
import { DisplayPreferences } from "../DisplayPreferences";
import { SearchBar } from "../SearchBar";

import type { SidebarProps } from "./Sidebar.types";

const Sidebar = ({
  treeOrientation,
  onSetOrientation,
  nodeSpacing,
  onNodeSpacingChange,
  hoveredNode,
  treeFilters,
  onFilterChange,
  searchValue,
  onSearchValueChange,
  selectedValue,
  onSelectedValueChange,
  renderedNodeData,
}: SidebarProps) => {
  return (
    <div className="min-w-md h-full overflow-y-auto px-4 py-3 shadow-md">
      <SearchBar
        items={renderedNodeData}
        searchValue={searchValue}
        onSearchValueChange={onSearchValueChange}
        selectedValue={selectedValue}
        onSelectedValueChange={onSelectedValueChange}
      />
      <Separator className="my-2" />
      <DisplayPreferences
        treeOrientation={treeOrientation}
        nodeSpacing={nodeSpacing}
        handleSetOrientation={onSetOrientation}
        handleNodeSpacingChange={onNodeSpacingChange}
        treeFilters={treeFilters}
        handleFilterChange={onFilterChange}
      />
      <Separator className="my-2" />
      <ComponentDetails hoveredNode={hoveredNode} />
    </div>
  );
};

export default Sidebar;

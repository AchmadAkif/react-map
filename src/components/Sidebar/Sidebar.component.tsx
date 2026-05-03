import { Separator } from "../ui/separator";
import { ComponentDetails } from "../ComponentDetails";
import { DisplayPreferences } from "../DisplayPreferences";

import type { SidebarProps } from "./Sidebar.types";

const Sidebar = ({
  treeOrientation,
  onSetOrientation,
  nodeSpacing,
  onNodeSpacingChange,
  hoveredNode,
  treeFilters,
  onFilterChange,
}: SidebarProps) => {
  return (
    <div className="min-w-md h-full overflow-y-auto px-4 py-3 shadow-md">
      <h2 className="text-lg font-bold">React-Map</h2>
      <Separator />
      <DisplayPreferences
        treeOrientation={treeOrientation}
        nodeSpacing={nodeSpacing}
        handleSetOrientation={onSetOrientation}
        handleNodeSpacingChange={onNodeSpacingChange}
        treeFilters={treeFilters}
        handleFilterChange={onFilterChange}
      />
      <Separator />
      <ComponentDetails hoveredNode={hoveredNode} />
    </div>
  );
};

export default Sidebar;

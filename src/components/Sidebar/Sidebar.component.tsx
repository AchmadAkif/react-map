import { Separator } from "@radix-ui/themes";
import { Select, Slider, TextField } from "../RadixUI";
import { ComponentDetails } from "../ComponentDetails";

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
    <div className="min-w-md h-full overflow-y-auto px-2 py-3 shadow-md">
      <h2 className="text-lg font-bold">React-Map</h2>
      <Separator my="3" size="4" />
      <p>Tree Orientation</p>
      <Select
        value={treeOrientation}
        onValueChange={onSetOrientation}
        options={["Vertical", "Horizontal"]}
      />
      <p>Horizontal Spacing</p>
      <Slider
        value={[nodeSpacing.x]}
        size="1"
        onValueChange={(value) => onNodeSpacingChange(value[0], "x")}
      />
      <TextField
        type="number"
        value={nodeSpacing.x}
        onValueChange={(value) => onNodeSpacingChange(Number(value), "x")}
      />
      <p>Vertical Spacing</p>
      <Slider
        value={[nodeSpacing.y]}
        size="1"
        onValueChange={(value) => onNodeSpacingChange(value[0], "y")}
      />
      <TextField
        type="number"
        value={nodeSpacing.y}
        onValueChange={(value) => onNodeSpacingChange(Number(value), "y")}
      />
      <Separator my="3" size="4" />
      <p>Tree Filters</p>
      <label className="flex items-center gap-2 py-1 text-sm">
        <input
          type="checkbox"
          checked={treeFilters.hideRouterComponent}
          onChange={(event) =>
            onFilterChange("hideRouterComponent", event.currentTarget.checked)
          }
        />
        Hide Router Component
      </label>
      <label className="flex items-center gap-2 py-1 text-sm">
        <input
          type="checkbox"
          checked={treeFilters.hideDomComponent}
          onChange={(event) =>
            onFilterChange("hideDomComponent", event.currentTarget.checked)
          }
        />
        Hide DOM Component
      </label>
      <label className="flex items-center gap-2 py-1 text-sm">
        <input
          type="checkbox"
          checked={treeFilters.hideReduxComponent}
          onChange={(event) =>
            onFilterChange("hideReduxComponent", event.currentTarget.checked)
          }
        />
        Hide Redux Component
      </label>
      <Separator my="3" size="4" />
      <ComponentDetails hoveredNode={hoveredNode} />
    </div>
  );
};

export default Sidebar;

import { Select, Slider, TextField } from "../RadixUI";

import type { SidebarProps } from "./Sidebar.types";

const Sidebar = ({
  treeOrientation,
  onSetOrientation,
  nodeSpacing,
  onNodeSpacingChange,
}: SidebarProps) => {
  return (
    <div className="px-2 py-3 shadow-md">
      <h2 className="text-lg font-bold">React-Map</h2>
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
    </div>
  );
};

export default Sidebar;

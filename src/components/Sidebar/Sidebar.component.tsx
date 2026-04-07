import { Select, Slider } from "../RadixUI";

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
        defaultValue={treeOrientation}
        onValueChange={onSetOrientation}
        options={["Vertical", "Horizontal"]}
      />
      <p>Horizontal Spacing</p>
      <Slider
        defaultValue={[nodeSpacing.x]}
        size="1"
        onValueChange={(value) => onNodeSpacingChange(value, "x")}
      />
      <p>Vertical Spacing</p>
      <Slider
        defaultValue={[nodeSpacing.y]}
        size="1"
        onValueChange={(value) => onNodeSpacingChange(value, "y")}
      />
    </div>
  );
};

export default Sidebar;

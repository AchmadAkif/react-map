import { Select } from "../Select";

import type { SidebarProps } from "./Sidebar.types";

const Sidebar = ({ treeOrientation, onSetOrientation }: SidebarProps) => {
  return (
    <div className="px-2 py-3 shadow-md">
      <h2 className="text-lg font-bold">React-Map</h2>
      <p>Tree Orientation</p>
      <Select
        defaultValue={treeOrientation}
        onValueChange={onSetOrientation}
        options={["Vertical", "Horizontal"]}
      />
    </div>
  );
};

export default Sidebar;

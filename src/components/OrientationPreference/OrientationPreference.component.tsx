import type { OrientationPreferenceProps } from "./OrientationPreference.types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const OrientationPreference = ({
  treeOrientation,
  handleSetOrientation,
}: OrientationPreferenceProps) => {
  return (
    <div>
      <Select
        defaultValue={treeOrientation}
        onValueChange={handleSetOrientation}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Tree Orientation</SelectLabel>
            <SelectItem value="vertical">Vertical</SelectItem>
            <SelectItem value="horizontal">Horizontal</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default OrientationPreference;

import { Select } from "@radix-ui/themes";

import type { SelectProps } from "./Select.types";

const SelectComponent = ({
  options,
  defaultValue,
  onValueChange,
}: SelectProps) => {
  return (
    <Select.Root defaultValue={defaultValue} onValueChange={onValueChange}>
      <Select.Trigger />
      <Select.Content>
        <Select.Group>
          {options.map((opt) => (
            <Select.Item value={opt[0].toLowerCase() + opt.slice(1)}>
              {opt}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
};

export default SelectComponent;

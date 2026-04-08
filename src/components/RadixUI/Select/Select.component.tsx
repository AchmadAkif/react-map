import { Select } from "@radix-ui/themes";

import type { SelectProps } from "./Select.types";

const SelectComponent = ({ options, value, onValueChange }: SelectProps) => {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger />
      <Select.Content>
        <Select.Group>
          {options.map((opt, index) => (
            <Select.Item
              key={index}
              value={opt[0].toLowerCase() + opt.slice(1)}
            >
              {opt}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
};

export default SelectComponent;

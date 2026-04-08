import { TextField as TextFieldComponent } from "@radix-ui/themes";

import type { TextFieldProps } from "./TextField.types";

const TextField = ({ type, value, onValueChange }: TextFieldProps) => {
  return (
    <TextFieldComponent.Root
      type={type}
      value={value}
      onChange={(e) =>
        onValueChange(
          type === "number"
            ? e.currentTarget.valueAsNumber
            : e.currentTarget.value,
        )
      }
    />
  );
};

export default TextField;

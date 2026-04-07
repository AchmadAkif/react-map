import { Slider as SliderComponent } from "@radix-ui/themes";

import type { SliderProps } from "./Slider.types";

const Slider = ({ defaultValue, size, onValueChange }: SliderProps) => {
  return (
    <SliderComponent
      defaultValue={defaultValue}
      size={size}
      onValueChange={onValueChange}
      max={500}
    />
  );
};

export default Slider;

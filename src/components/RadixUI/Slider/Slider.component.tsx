import { Slider as SliderComponent } from "@radix-ui/themes";

import type { SliderProps } from "./Slider.types";

const Slider = ({ value, size, onValueChange }: SliderProps) => {
  return (
    <SliderComponent
      value={value}
      size={size}
      onValueChange={onValueChange}
      max={500}
    />
  );
};

export default Slider;

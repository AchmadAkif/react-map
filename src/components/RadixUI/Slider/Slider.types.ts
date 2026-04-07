export interface SliderProps {
  defaultValue: number[];
  size: "1" | "2" | "3";
  onValueChange?: (value: number[], axis?: "x" | "y") => void;
}

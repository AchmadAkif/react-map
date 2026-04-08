export interface SliderProps {
  value: number[];
  size: "1" | "2" | "3";
  onValueChange?: (value: number[], axis?: "x" | "y") => void;
}

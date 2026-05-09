import type { NodeSpacing } from "../../types";

export interface SpacingPreferenceProps {
  nodeSpacing: NodeSpacing;
  handleNodeSpacingChange: (value: number, axis: "x" | "y") => void;
}

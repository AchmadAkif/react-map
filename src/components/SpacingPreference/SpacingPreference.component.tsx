import { Slider, TextField } from "../RadixUI";

import type { SpacingPreferenceProps } from "./SpacingPreference.types";

const SpacingPreference = ({
  nodeSpacing,
  handleNodeSpacingChange,
}: SpacingPreferenceProps) => {
  return (
    <>
      <p>Horizontal Spacing</p>
      <Slider
        value={[nodeSpacing.x]}
        size="1"
        onValueChange={(value) => handleNodeSpacingChange(value[0], "x")}
      />
      <TextField
        type="number"
        value={nodeSpacing.x}
        onValueChange={(value) => handleNodeSpacingChange(Number(value), "x")}
      />
      <p>Vertical Spacing</p>
      <Slider
        value={[nodeSpacing.y]}
        size="1"
        onValueChange={(value) => handleNodeSpacingChange(value[0], "y")}
      />
      <TextField
        type="number"
        value={nodeSpacing.y}
        onValueChange={(value) => handleNodeSpacingChange(Number(value), "y")}
      />
    </>
  );
};

export default SpacingPreference;

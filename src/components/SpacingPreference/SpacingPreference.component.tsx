import { Input } from "../ui/input";
import { Slider } from "../ui/slider";

import type { SpacingPreferenceProps } from "./SpacingPreference.types";

const SpacingPreference = ({
  nodeSpacing,
  handleNodeSpacingChange,
}: SpacingPreferenceProps) => {
  return (
    <>
      <p>Horizontal Spacing</p>
      <Slider
        max={500}
        value={[nodeSpacing.x]}
        onValueChange={(value) => handleNodeSpacingChange(value[0], "x")}
      />
      <Input
        type="number"
        value={nodeSpacing.x}
        onChange={(event) =>
          handleNodeSpacingChange(Number(event.target.value), "x")
        }
      />
      <p>Vertical Spacing</p>
      <Slider
        max={500}
        value={[nodeSpacing.y]}
        onValueChange={(value) => handleNodeSpacingChange(value[0], "y")}
      />
      <Input
        type="number"
        value={nodeSpacing.y}
        onChange={(event) =>
          handleNodeSpacingChange(Number(event.target.value), "y")
        }
      />
    </>
  );
};

export default SpacingPreference;

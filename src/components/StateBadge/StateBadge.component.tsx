import { Badge } from "@radix-ui/themes";

import type { StateBadgeProps } from "./StateBadge.types";

const StateBadge = ({ index }: StateBadgeProps) => {
  return <Badge color="gray">{index}</Badge>;
};

export default StateBadge;

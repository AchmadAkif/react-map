import { Badge } from "../ui/badge";

import type { StateBadgeProps } from "./StateBadge.types";

const StateBadge = ({ index }: StateBadgeProps) => {
  return <Badge color="gray">{index}</Badge>;
};

export default StateBadge;

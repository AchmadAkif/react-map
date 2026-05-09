import { Badge } from "../ui/badge";

import type { StateBadgeProps } from "./StateBadge.types";

const StateBadge = ({ index }: StateBadgeProps) => {
  return (
    <Badge className="rounded-md px-1" variant="outline">
      {index}
    </Badge>
  );
};

export default StateBadge;

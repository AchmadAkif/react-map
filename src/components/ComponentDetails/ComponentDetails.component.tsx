import { Separator } from "../ui/separator";

import { StatePanel } from "../StatePanel";
import { PropsPanel } from "../PropsPanel";

import type { TreeNodeDatum } from "react-d3-tree";

const ComponentDetails = ({
  hoveredNode,
}: {
  hoveredNode: TreeNodeDatum | null | undefined;
}) => {
  return (
    <div className="flex flex-col">
      <StatePanel hoveredNode={hoveredNode} />
      <Separator className="my-2" />
      <PropsPanel hoveredNode={hoveredNode} />
    </div>
  );
};

export default ComponentDetails;

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
      {hoveredNode?.name && (
        <p className="font-bold mx-2 mb-2 text-blue-500">{hoveredNode?.name}</p>
      )}
      <StatePanel hoveredNode={hoveredNode} />
      <Separator className="my-2" />
      <PropsPanel hoveredNode={hoveredNode} />
    </div>
  );
};

export default ComponentDetails;

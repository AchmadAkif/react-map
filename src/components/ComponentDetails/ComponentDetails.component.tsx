import { Separator } from "../ui/separator";

import { StatePanel } from "../StatePanel";
import { PropsPanel } from "../PropsPanel";

import type { InspectableNode } from "../../types";

const ComponentDetails = ({
  hoveredNode,
  lockedNodeUnavailable,
}: {
  hoveredNode: InspectableNode;
  lockedNodeUnavailable?: boolean;
}) => {
  return (
    <div className="flex flex-col">
      {lockedNodeUnavailable ? (
        <p className="mx-2 mb-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400">
          Locked node is no longer present in the current React tree. Keep the
          lock if it may reappear, or unlock and select another node.
        </p>
      ) : null}
      {hoveredNode?.name && (
        <>
          <p className="font-bold mx-2 mb-2 text-blue-500">
            {hoveredNode?.name}
          </p>
          <Separator className="mb-2" />
        </>
      )}
      <StatePanel hoveredNode={hoveredNode} />
      <Separator className="my-2" />
      <PropsPanel hoveredNode={hoveredNode} />
    </div>
  );
};

export default ComponentDetails;

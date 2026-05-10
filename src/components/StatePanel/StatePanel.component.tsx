import { renderValue } from "../../utils";
import StateBadge from "../StateBadge";

import type { StatePanelProps } from "./StatePanel.types";

const StatePanel = ({ hoveredNode }: StatePanelProps) => {
  const hooks = hoveredNode?.state;
  return (
    <div className="flex flex-col px-4">
      <p className="font-bold">States</p>
      {hooks && hooks.length > 0 ? (
        <dl className="w-full flex flex-col gap-1">
          {hooks
            .filter((state) => state.type === "State")
            .map((state) => (
              <div key={state.index} className="flex">
                <dt className="w-24 min-w-20 max-w-25">
                  <div className="flex items-center gap-2">
                    <StateBadge index={state.index} />
                    <p>{state.type}</p>
                  </div>
                </dt>
                <dd>{renderValue(state.value)}</dd>
              </div>
            ))}
        </dl>
      ) : (
        <p>None</p>
      )}
    </div>
  );
};

export default StatePanel;

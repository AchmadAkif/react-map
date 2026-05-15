import { getValueTypeClass, renderValue } from "../../utils";
import { useTheme } from "../theme-provider";
import StateBadge from "../StateBadge";

import type { StatePanelProps } from "./StatePanel.types";

const StatePanel = ({ hoveredNode }: StatePanelProps) => {
  const hooks = hoveredNode?.state;
  const { resolvedTheme } = useTheme();
  return (
    <div className="flex flex-col px-4">
      <p className="font-bold">States</p>
      {hooks && hooks.length > 0 ? (
        <dl className="w-full flex flex-col gap-1">
          {hooks
            .filter((state) => state.type === "State")
            .map((state) => (
              <div key={state.index} className="flex">
                <dt className="min-w-20">
                  <div className="flex items-center gap-2">
                    <StateBadge index={state.index} />
                    <p>{state.type}</p>
                  </div>
                </dt>
                <dd className={getValueTypeClass(state.value)}>
                  {renderValue(state.value, resolvedTheme)}
                </dd>
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

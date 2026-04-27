import { Text, DataList } from "@radix-ui/themes";
import { renderValue } from "../../utils";
import StateBadge from "../StateBadge";

import type { StatePanelProps } from "./StatePanel.types";

const StatePanel = ({ hoveredNode }: StatePanelProps) => {
  const hooks = hoveredNode?.state;
  return (
    <div className="flex flex-col">
      <Text className="font-bold">States</Text>
      {hooks && hooks.length > 0 ? (
        <DataList.Root size="1">
          {hooks
            .filter((state) => state.type === "State")
            .map((state) => (
              <DataList.Item key={state.index}>
                <DataList.Label minWidth="80px" maxWidth="100px">
                  <div className="flex items-center gap-2">
                    <StateBadge index={state.index} />
                    {state.type}
                  </div>
                </DataList.Label>
                <DataList.Value>{renderValue(state.value)}</DataList.Value>
              </DataList.Item>
            ))}
        </DataList.Root>
      ) : (
        <Text size="1">None</Text>
      )}
    </div>
  );
};

export default StatePanel;

import { Text, DataList } from "@radix-ui/themes";
import { renderValue } from "../../utils";

import type { StatePanelProps } from "./StatePanel.types";

const StatePanel = ({ hoveredNode }: StatePanelProps) => {
  const states = hoveredNode?.state;
  return (
    <div className="flex flex-col">
      <Text className="font-bold">Hooks</Text>
      {states && states.length > 0 ? (
        <DataList.Root size="1">
          {states.map((state) => (
            <DataList.Item key={state.index}>
              <DataList.Label minWidth="80px" maxWidth="100px">
                {state.type}
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

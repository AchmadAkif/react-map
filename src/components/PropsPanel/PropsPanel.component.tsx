import { Text, DataList } from "@radix-ui/themes";

import type { PropsPanelProps } from "./PropsPanel.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderValue = (value: any) => {
  if (typeof value === "string") {
    return `"${value}"`;
  }
  return JSON.stringify(value);
};

const PropsPanel = ({ hoveredNode }: PropsPanelProps) => {
  const props = hoveredNode?.props ? hoveredNode.props : null;
  return (
    <div className="flex flex-col">
      <Text className="font-bold">Props</Text>
      {props && Object.keys(props).length > 0 ? (
        <DataList.Root size={"1"}>
          {Object.entries(props).map(([key, value]) => (
            <DataList.Item key={key}>
              <DataList.Label>{key}</DataList.Label>
              <DataList.Value>{renderValue(value)}</DataList.Value>
            </DataList.Item>
          ))}
        </DataList.Root>
      ) : (
        <Text size={"1"}>None</Text>
      )}
    </div>
  );
};

export default PropsPanel;

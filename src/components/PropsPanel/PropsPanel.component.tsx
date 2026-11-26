import { ValueList } from "../ValueList";
import type { PropsPanelProps } from "./PropsPanel.types";

export const PropsPanel = ({ selectedNode }: PropsPanelProps) => {
  return (
    <div className="flex flex-col px-4">
      <p className="font-bold">Props</p>
      <ValueList values={selectedNode?.props} />
    </div>
  );
};

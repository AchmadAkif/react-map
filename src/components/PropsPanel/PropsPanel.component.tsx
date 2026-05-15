// import { renderValue } from "../../utils";

import { getValueTypeClass, renderValue } from "@/utils";
import type { PropsPanelProps } from "./PropsPanel.types";

const PropsPanel = ({ hoveredNode }: PropsPanelProps) => {
  const props = hoveredNode?.props ? hoveredNode.props : null;
  return (
    <div className="flex flex-col px-4">
      <p className="font-bold">Props</p>
      {props && Object.keys(props).length > 0 ? (
        <dl className="w-full flex flex-col gap-1">
          {Object.entries(props).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <dt className="min-w-20">{key}</dt>
              <dd className={getValueTypeClass(value)}>{renderValue(value)}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p>None</p>
      )}
    </div>
  );
};

export default PropsPanel;

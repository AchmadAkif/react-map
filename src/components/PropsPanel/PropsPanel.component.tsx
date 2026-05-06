import { renderValue } from "../../utils";

import type { PropsPanelProps } from "./PropsPanel.types";

const PropsPanel = ({ hoveredNode }: PropsPanelProps) => {
  const props = hoveredNode?.props ? hoveredNode.props : null;
  return (
    <div className="flex flex-col">
      <p className="font-bold">Props</p>
      {props && Object.keys(props).length > 0 ? (
        <dl className="w-full flex flex-col gap-1">
          {Object.entries(props).map(([key, value]) => (
            <div key={key} className="flex">
              <dt className="w-24 min-w-20 max-w-25">{key}</dt>
              <dd>
                <p>{renderValue(value)}</p>
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

export default PropsPanel;

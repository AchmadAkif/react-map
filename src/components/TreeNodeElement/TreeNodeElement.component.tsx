import type { KeyboardEvent } from "react";
import type { TreeNodeElementProps } from "./TreeNodeElement.types";

const NODE_RADIUS = 15;
const CONTROL_RADIUS = 8;
const CONTROL_OFFSET = NODE_RADIUS + CONTROL_RADIUS + 1;
const SIGN_ARM = 4;
const LABEL_X = 40;

export function TreeNodeElement({
  nodeDatum,
  orientation,
  toggleNode,
  onNodeMouseOver,
  onNodeMouseOut,
}: TreeNodeElementProps) {
  const { name, attributes, children } = nodeDatum;
  const hasChildren = Boolean(children?.length);
  const { collapsed } = nodeDatum.__rd3t;

  // The control sits on the side the branch grows towards.
  const controlTransform =
    orientation === "horizontal"
      ? `translate(${CONTROL_OFFSET},0)`
      : `translate(0,${CONTROL_OFFSET})`;

  const handleControlKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleNode();
  };

  return (
    <>
      <circle
        r={NODE_RADIUS}
        onMouseOver={onNodeMouseOver}
        onMouseOut={onNodeMouseOut}
      />
      <g className="rd3t-label">
        <text className="rd3t-label__title" textAnchor="start" x={LABEL_X}>
          {name}
        </text>
        <text className="rd3t-label__attributes">
          {Object.entries(attributes ?? {}).map(([key, value]) => (
            <tspan key={key} x={LABEL_X} dy="1.2em">
              {key}: {String(value)}
            </tspan>
          ))}
        </text>
      </g>
      {hasChildren && (
        <g
          role="button"
          tabIndex={0}
          aria-expanded={!collapsed}
          aria-label={`${collapsed ? "Expand" : "Collapse"} ${name}`}
          className="cursor-pointer"
          transform={controlTransform}
          onClick={toggleNode}
          onKeyDown={handleControlKeyDown}
        >
          <circle r={CONTROL_RADIUS} fill="#fff" strokeWidth={1} />
          <path
            d={`M${-SIGN_ARM},0H${SIGN_ARM}${collapsed ? `M0,${-SIGN_ARM}V${SIGN_ARM}` : ""}`}
            strokeWidth={1.5}
          />
        </g>
      )}
    </>
  );
}

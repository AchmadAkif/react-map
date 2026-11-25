import { useLayoutEffect, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import type { TreeNodeElementProps } from "./TreeNodeElement.types";

const NODE_RADIUS = 15;
const RING_RADIUS = NODE_RADIUS + 4;
const CONTROL_RADIUS = 8;
const CONTROL_OFFSET = RING_RADIUS + CONTROL_RADIUS + 1;
const SIGN_ARM = 4;
const LABEL_X = 40;

/** Stops a double-click from reaching the tree's native zoom listener. */
const keepDoubleClickFromZooming = (element: SVGGElement) => {
  const stop = (event: Event) => event.stopPropagation();
  element.addEventListener("dblclick", stop);
  return () => element.removeEventListener("dblclick", stop);
};

export function TreeNodeElement({
  nodeDatum,
  orientation,
  selectedInstanceId,
  onToggleBranch,
  onSelectNode,
  onSelectedNodeDrawnChange,
}: TreeNodeElementProps) {
  const { name, attributes, children, instanceId, isCollapsed } = nodeDatum;
  const hasChildren = isCollapsed || Boolean(children?.length);
  // The artificial "Filtered Tree" root has no ID, so it cannot be selected.
  const isSelectable = instanceId !== undefined;
  const isSelected = isSelectable && instanceId === selectedInstanceId;

  // Only a drawn node has an element, whether a filter or a collapsed branch
  // excludes the others. A layout effect reports it before the next paint.
  useLayoutEffect(() => {
    if (!isSelected) return;
    onSelectedNodeDrawnChange(true);
    return () => onSelectedNodeDrawnChange(false);
  }, [isSelected, onSelectedNodeDrawnChange]);

  // The control sits on the side the branch grows towards.
  const controlTransform =
    orientation === "horizontal"
      ? `translate(${CONTROL_OFFSET},0)`
      : `translate(0,${CONTROL_OFFSET})`;

  const toggleBranch = () => onToggleBranch(instanceId);

  const handleControlKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (event.repeat) return;
    toggleBranch();
  };

  return (
    <>
      <g
        ref={keepDoubleClickFromZooming}
        className={cn(
          isSelectable ? "group/node cursor-pointer" : "cursor-grab",
          isSelected && "fill-primary stroke-primary",
        )}
        onClick={
          isSelectable ? () => onSelectNode({ instanceId, name }) : undefined
        }
      >
        {isSelected && <circle r={RING_RADIUS} fill="none" strokeWidth={2} />}
        <circle r={NODE_RADIUS} className="group-hover/node:stroke-primary" />
        <text
          className={cn(
            "fill-black stroke-none group-hover/node:fill-primary",
            isSelected && "font-bold",
          )}
          textAnchor="start"
          x={LABEL_X}
        >
          {name}
        </text>
      </g>
      <g className="cursor-grab">
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
          ref={keepDoubleClickFromZooming}
          role="button"
          tabIndex={0}
          aria-expanded={!isCollapsed}
          aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${name}`}
          className="cursor-pointer"
          transform={controlTransform}
          onClick={toggleBranch}
          onKeyDown={handleControlKeyDown}
        >
          <circle r={CONTROL_RADIUS} fill="#fff" strokeWidth={1} />
          <path
            d={`M${-SIGN_ARM},0H${SIGN_ARM}${isCollapsed ? `M0,${-SIGN_ARM}V${SIGN_ARM}` : ""}`}
            strokeWidth={1.5}
          />
        </g>
      )}
    </>
  );
}

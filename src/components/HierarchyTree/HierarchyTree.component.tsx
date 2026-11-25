import { useMemo, useRef, useState, useLayoutEffect } from "react";
import Tree from "react-d3-tree";
import { TreeNodeElement } from "../TreeNodeElement";
import { toRawNodeDatum } from "@/types/treeAdapter";
import type { HierarchyTreeProps } from "./HierarchyTree.types";

export function HierarchyTree({
  treeRef,
  data,
  treeOrientation,
  nodeSize,
  selectedNodePath,
  onSelectNode,
}: HierarchyTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      setContainerRect(containerRef.current.getBoundingClientRect());
    }
  }, []);

  // Convert domain TreeNode to RawNodeDatum format only at the visualization boundary
  const rawNodeData = useMemo(() => toRawNodeDatum(data), [data]);

  if (!rawNodeData) {
    return (
      <div
        id="treeWrapper"
        className="flex h-screen w-full items-center justify-center"
      >
        <p className="text-sm text-gray-500">
          No components match the selected filters.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} id="treeWrapper" className="h-screen w-full">
      <Tree
        ref={treeRef}
        data={rawNodeData}
        orientation={treeOrientation}
        nodeSize={nodeSize}
        renderCustomNodeElement={(nodeProps) => (
          <TreeNodeElement
            nodeDatum={nodeProps.nodeDatum}
            orientation={treeOrientation}
            toggleNode={nodeProps.toggleNode}
            selectedNodePath={selectedNodePath}
            onSelectNode={onSelectNode}
          />
        )}
        // Only the initial view: the root starts in the middle.
        translate={
          containerRect
            ? { x: containerRect.width / 2, y: containerRect.height / 2 }
            : undefined
        }
        dimensions={
          containerRect
            ? {
                height: containerRect.height,
                width: containerRect.width,
              }
            : undefined
        }
      />
    </div>
  );
}

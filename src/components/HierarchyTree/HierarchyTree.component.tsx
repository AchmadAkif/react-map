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
  collapsedBranches,
  onToggleBranch,
  selectedInstanceId,
  onSelectNode,
  onSelectedNodeDrawnChange,
}: HierarchyTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      setContainerRect(containerRef.current.getBoundingClientRect());
    }
  }, []);

  // Convert domain TreeNode to RawNodeDatum format only at the visualization boundary
  const rawNodeData = useMemo(
    () => toRawNodeDatum(data, collapsedBranches),
    [data, collapsedBranches],
  );

  // The wrapper is always rendered: it is measured once on mount, which may be
  // while the filters hide everything.
  return (
    <div ref={containerRef} id="treeWrapper" className="h-screen w-full">
      {rawNodeData ? (
        <Tree
          ref={treeRef}
          data={rawNodeData}
          orientation={treeOrientation}
          nodeSize={nodeSize}
          renderCustomNodeElement={(nodeProps) => (
            <TreeNodeElement
              nodeDatum={nodeProps.nodeDatum}
              orientation={treeOrientation}
              onToggleBranch={onToggleBranch}
              selectedInstanceId={selectedInstanceId}
              onSelectNode={onSelectNode}
              onSelectedNodeDrawnChange={onSelectedNodeDrawnChange}
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
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-gray-500">
            No components match the selected filters.
          </p>
        </div>
      )}
    </div>
  );
}

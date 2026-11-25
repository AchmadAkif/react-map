import { useMemo, useRef, useState, useLayoutEffect, useEffect } from "react";
import Tree from "react-d3-tree";
import { TreeNodeElement } from "../TreeNodeElement";
import { toRawNodeDatum } from "@/types/treeAdapter";
import type { HierarchyTreeProps } from "./HierarchyTree.types";

export function HierarchyTree({
  treeRef,
  data,
  treeOrientation,
  nodeSize,
  handleOnNodeHover,
  treeFilters,
  onRenderedTreeData,
  selectedNode,
}: HierarchyTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      setContainerRect(containerRef.current.getBoundingClientRect());
    }
  }, []);

  useEffect(() => {
    if (treeRef && "current" in treeRef && treeRef.current) {
      const renderedTreeData = treeRef.current.generateTree();
      const { nodes } = renderedTreeData;
      onRenderedTreeData(nodes);
    }
  }, [data, treeFilters, onRenderedTreeData, treeRef]);

  useEffect(() => {
    if (selectedNode && treeRef && "current" in treeRef && treeRef.current) {
      treeRef.current.centerNode(selectedNode);
    }
  }, [selectedNode, treeRef]);

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
            onNodeMouseOver={nodeProps.onNodeMouseOver}
          />
        )}
        onNodeMouseOver={(node) => {
          if (handleOnNodeHover) handleOnNodeHover(node.data as unknown as import("@/types").TreeNode);
        }}
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

import { useRef, useState, useLayoutEffect, useEffect } from "react";
import Tree from "react-d3-tree";

import type { HierarchyTreeProps } from "./HierarchyTree.types";

export default function HierarchyTree({
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
  }, [treeFilters, onRenderedTreeData, treeRef]);

  useEffect(() => {
    if (selectedNode && treeRef && "current" in treeRef && treeRef.current) {
      treeRef.current.centerNode(selectedNode);
    }
  }, [selectedNode, treeRef]);

  if (!data) {
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
    // `<Tree />` will fill width/height of its container; in this case `#treeWrapper`.
    <div ref={containerRef} id="treeWrapper" className="h-screen w-full">
      <Tree
        ref={treeRef}
        data={data}
        orientation={treeOrientation}
        nodeSize={nodeSize}
        onNodeMouseOver={(node) => {
          if (handleOnNodeHover) handleOnNodeHover(node.data);
        }}
        dimensions={
          containerRect
            ? {
                height: containerRect?.height,
                width: containerRect?.width,
              }
            : undefined
        }
      />
    </div>
  );
}

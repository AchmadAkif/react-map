import { useRef, useState, useLayoutEffect, useEffect } from "react";
import Tree from "react-d3-tree";
import { Tree as TreeType } from "react-d3-tree";

import type { HierarchyTreeProps } from "./HierarchyTree.types";

export default function HierarchyTree({
  data,
  treeOrientation,
  nodeSize,
  handleOnNodeHover,
  treeFilters,
  onRenderedTreeData,
}: HierarchyTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<TreeType>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      setContainerRect(containerRef.current.getBoundingClientRect());
    }
  }, []);

  useEffect(() => {
    const renderedTreeData = treeRef.current?.generateTree();

    if (renderedTreeData) {
      const { nodes } = renderedTreeData;
      onRenderedTreeData(nodes);
    }
  }, [treeFilters, onRenderedTreeData]);

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

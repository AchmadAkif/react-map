import { useMemo, useState } from "react";
import type { RenderedNode } from "@/types";

export function useNodeSearch() {
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [renderedNodeData, setRenderedNodeData] = useState<
    { value: string; label: string; nodePointer: RenderedNode }[]
  >([]);

  const handleRenderedTreeData = (data: RenderedNode[]) => {
    const filterData = data.map((node) => ({
      value:
        (node.data as { nodePath?: string }).nodePath ?? node.data.__rd3t.id,
      label: node.data.name,
      nodePointer: node,
    }));

    setRenderedNodeData(filterData);
  };

  const selectedNode = useMemo(
    () =>
      renderedNodeData.find((node) => node.value === selectedValue)
        ?.nodePointer ?? null,
    [renderedNodeData, selectedValue],
  );

  return {
    searchValue,
    setSearchValue,
    selectedValue,
    setSelectedValue,
    renderedNodeData,
    selectedNode,
    handleRenderedTreeData,
  };
}

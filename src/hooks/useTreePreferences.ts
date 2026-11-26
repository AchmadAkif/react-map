import { useState } from "react";
import type { NodeSpacing, TreeFilters, TreeOrientation } from "@/types";

export function useTreePreferences() {
  const [treeOrientation, setTreeOrientation] =
    useState<TreeOrientation>("vertical");
  const [nodeSpacing, setNodeSpacing] = useState<NodeSpacing>({
    x: 200,
    y: 200,
  });
  const [treeFilters, setTreeFilters] = useState<TreeFilters>({
    hideRouterComponent: false,
    hideDomComponent: true,
    hideReduxComponent: false,
  });

  const handleSetOrientation = (orientation: TreeOrientation) => {
    setTreeOrientation(orientation);
  };

  const handleNodeSpacingChange = (value: number, axis: "x" | "y") => {
    setNodeSpacing((prev) => ({ ...prev, [axis]: value }));
  };

  const handleFilterChange = (
    filterName: keyof TreeFilters,
    value: boolean,
  ) => {
    setTreeFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  return {
    treeOrientation,
    nodeSpacing,
    treeFilters,
    handleSetOrientation,
    handleNodeSpacingChange,
    handleFilterChange,
  };
}

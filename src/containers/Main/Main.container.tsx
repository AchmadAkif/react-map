import { useMemo, useState, useRef, useEffect } from "react";
import type { RawNodeDatum, TreeNodeDatum } from "react-d3-tree";

import { HierarchyTree, Sidebar } from "../../components";
import { addNodePaths, filterTreeData } from "../../utils";

import { Tree as TreeType } from "react-d3-tree";
import {
  type TreeFilters,
  type TreeOrientation,
  type NodeSpacing,
  type renderedNode,
} from "../../types";
import type { ComponentStateUpdatePayload } from "../../../extension/backend/types";

type MainProps = {
  data: RawNodeDatum;
  componentUpdate: ComponentStateUpdatePayload | null;
};

const Main = ({ data, componentUpdate }: MainProps) => {
  const treeRef = useRef<TreeType>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [selectedNode, setSelectedNode] = useState<renderedNode | null>(null);
  const [renderedNodeData, setRenderedNodeData] = useState<
    { value: string; label: string; nodePointer: renderedNode }[]
  >([]);
  const [treeOrientation, setTreeOrientation] =
    useState<TreeOrientation>("vertical");
  type TreeNodeWithPath = TreeNodeDatum & { __reactMapPath?: number[] };

  const [hoveredNode, setHoveredNode] = useState<TreeNodeWithPath | null>(null);
  const [nodeSpacing, setNodeSpacing] = useState<NodeSpacing>({
    x: 200,
    y: 200,
  });
  const [treeFilters, setTreeFilters] = useState<TreeFilters>({
    hideRouterComponent: false,
    hideDomComponent: false,
    hideReduxComponent: false,
  });

  const dataWithPaths = useMemo(() => addNodePaths(data), [data]);

  const filteredTreeData = useMemo(
    () => filterTreeData(dataWithPaths, treeFilters),
    [dataWithPaths, treeFilters],
  );

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

  const handleOnNodeHover = (node: TreeNodeDatum | null) => {
    setHoveredNode(node as TreeNodeWithPath | null);
  };

  const handleRenderedTreeData = (data: renderedNode[]) => {
    const filterData = data.map((node) => {
      return {
        value: node.data.__rd3t.id,
        label: node.data.name,
        nodePointer: node,
      };
    });

    setRenderedNodeData(filterData);
  };

  const handleSelectedValueChange = (value: string) => {
    setSelectedValue(value);

    const selectedNode =
      renderedNodeData.find((node) => node.value === value)?.nodePointer ??
      null;
    setSelectedNode(selectedNode);
  };

  useEffect(() => {
    const path = hoveredNode?.__reactMapPath;

    if (!chrome?.runtime?.sendMessage) {
      return;
    }

    const tabId = chrome.devtools?.inspectedWindow?.tabId;

    if (path && path.length >= 0) {
      chrome.runtime.sendMessage({
        source: "react-map-panel",
        payload: { type: "inspect-component", path, tabId },
      });
      return;
    }

    chrome.runtime.sendMessage({
      source: "react-map-panel",
      payload: { type: "stop-inspecting", tabId },
    });
  }, [hoveredNode]);

  useEffect(() => {
    if (!componentUpdate || !hoveredNode) {
      return;
    }

    const hoveredPath = hoveredNode.__reactMapPath;
    if (!hoveredPath) {
      return;
    }

    const isSamePath =
      hoveredPath.length === componentUpdate.path.length &&
      hoveredPath.every(
        (value, index) => value === componentUpdate.path[index],
      );

    if (!isSamePath) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHoveredNode((prev) =>
      prev
        ? {
            ...prev,
            state: componentUpdate.state,
            props: componentUpdate.props,
          }
        : prev,
    );
  }, [componentUpdate, hoveredNode]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <HierarchyTree
        treeRef={treeRef}
        data={filteredTreeData}
        treeOrientation={treeOrientation}
        nodeSize={nodeSpacing}
        handleOnNodeHover={handleOnNodeHover}
        treeFilters={treeFilters}
        onRenderedTreeData={handleRenderedTreeData}
        selectedNode={selectedNode}
      />
      <Sidebar
        treeOrientation={treeOrientation}
        onSetOrientation={handleSetOrientation}
        nodeSpacing={nodeSpacing}
        onNodeSpacingChange={handleNodeSpacingChange}
        hoveredNode={hoveredNode}
        treeFilters={treeFilters}
        onFilterChange={handleFilterChange}
        searchValue={searchValue}
        onSearchValueChange={setSearchValue}
        selectedValue={selectedValue}
        onSelectedValueChange={handleSelectedValueChange}
        renderedNodeData={renderedNodeData}
      />
    </div>
  );
};

export default Main;

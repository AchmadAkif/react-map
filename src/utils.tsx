import JsonView from "@uiw/react-json-view";
import { lightTheme } from "@uiw/react-json-view/light";
import type { RawNodeDatum, TreeNodeDatum } from "react-d3-tree";

import type { TreeFilters } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const renderValue = (value: any) => {
  switch (typeof value) {
    case "string":
      return `"${value}"`;
    case "number":
    case "boolean":
    case "bigint":
      return value.toString();
    case "undefined":
      return "undefined";
    case "symbol":
      return value.toString();
    case "function":
      return "ƒ()"; // Using ƒ to denote a function
    case "object":
      if (value === null) {
        return "null";
      }
      // For arrays and objects, use JsonView
      return (
        <JsonView
          value={value}
          style={lightTheme}
          collapsed={true}
          displayDataTypes={false}
          enableClipboard={true}
          displayObjectSize={false}
        />
      );
    default:
      // Fallback for any other types
      return String(value);
  }
};

const routerComponentNames = [
  "router",
  "routes",
  "route",
  "link",
  "navlink",
  "outlet",
  "navigate",
  "scrollrestoration",
];

const reduxComponentNames = ["provider", "connect", "redux"];

const shouldHideNode = (node: RawNodeDatum, filters: TreeFilters) => {
  const componentName = node.name.toLowerCase();
  const nodeType = String(node.attributes?.nodeType ?? "").toLowerCase();

  if (
    filters.hideDomComponent &&
    (node.isDOM === true || nodeType === "hostcomponent")
  ) {
    return true;
  }

  if (
    filters.hideRouterComponent &&
    routerComponentNames.some((name) => componentName.includes(name))
  ) {
    return true;
  }

  if (
    filters.hideReduxComponent &&
    reduxComponentNames.some((name) => componentName.includes(name))
  ) {
    return true;
  }

  return false;
};

const filterTreeNodes = (
  node: RawNodeDatum,
  filters: TreeFilters,
): RawNodeDatum[] => {
  const filteredChildren = (node.children ?? []).flatMap((child) =>
    filterTreeNodes(child, filters),
  );

  if (shouldHideNode(node, filters)) {
    return filteredChildren;
  }

  return [
    {
      ...node,
      children: filteredChildren.length > 0 ? filteredChildren : undefined,
    },
  ];
};

/**
 * Filters the tree by matching the component's official runtime name.
 *
 * This does not inspect local import aliases, so a component imported as
 * `import { Link as CustomLink } from ...` will still be treated by its
 * actual component name at runtime and may pass or fail the filter based on
 * that official name.
 */
export const filterTreeData = (
  node: RawNodeDatum | null,
  filters: TreeFilters,
): RawNodeDatum | null => {
  if (!node) return null;

  const filteredNodes = filterTreeNodes(node, filters);

  if (filteredNodes.length === 0) {
    return null;
  }

  if (filteredNodes.length === 1) {
    return filteredNodes[0];
  }

  return {
    name: "Filtered Tree",
    attributes: {
      nodeType: "SyntheticRoot",
    },
    children: filteredNodes,
  };
};

type RawNodeWithPath = RawNodeDatum & { __reactMapPath?: number[] };

export const addNodePaths = (
  node: RawNodeDatum | null,
  path: number[] = [],
): RawNodeDatum | null => {
  if (!node) return null;

  const children = node.children?.map((child, index) =>
    addNodePaths(child, [...path, index]),
  );

  const nextNode: RawNodeWithPath = {
    ...node,
    __reactMapPath: path,
    children: children?.filter(Boolean) as RawNodeDatum[] | undefined,
  };

  return nextNode;
};

export const findNodeById = (
  id: string,
  treeData: TreeNodeDatum[],
): TreeNodeDatum | null => {
  if (!treeData || treeData.length === 0) {
    return null;
  }

  const root = treeData[0];

  const traverse = (node: TreeNodeDatum): TreeNodeDatum | null => {
    if (node.__rd3t.id === id) {
      return node;
    }

    if (node.children) {
      for (const child of node.children) {
        const found = traverse(child);
        if (found) {
          return found;
        }
      }
    }

    return null;
  };

  return traverse(root);
};

import JsonView from "@uiw/react-json-view";
import { lightTheme } from "@uiw/react-json-view/light";
import type { RawNodeDatum, TreeNodeDatum } from "react-d3-tree";

import type { TreeFilters } from "./types";

const isJsxLikeComponentName = (value: string) => value.includes("/>");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getValueTypeClass = (value: any) => {
  if (value === null || value === "__react_map_undefined__") {
    return "text-amber-500 dark:text-amber-400";
  }

  switch (typeof value) {
    case "string":
      if (isJsxLikeComponentName(value)) {
        return "text-slate-700 dark:text-slate-400";
      }
      if (value === "f()" || value === "ƒ()") {
        return "text-fuchsia-500 dark:text-fuchsia-400";
      }
      return "text-violet-500 dark:text-violet-400";
    case "number":
      return "text-sky-500 dark:text-sky-400";
    case "boolean":
      return "text-emerald-500 dark:text-emerald-400";
    case "bigint":
      return "text-cyan-500 dark:text-cyan-400";
    case "undefined":
      return "text-amber-500 dark:text-amber-400";
    case "symbol":
      return "text-rose-500 dark:text-rose-400";
    case "function":
      return "text-fuchsia-500 dark:text-fuchsia-400";
    case "object":
      return undefined;
    default:
      return undefined;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const renderValue = (value: any) => {
  switch (typeof value) {
    case "string":
      if (value === "__react_map_undefined__") {
        return "undefined";
      }
      if (value === "f()" || value === "ƒ()") {
        return "ƒ()";
      }
      if (isJsxLikeComponentName(value)) {
        return value;
      }
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

export const findNodeByPath = (
  nodePath: string,
  treeData: RawNodeDatum[] | null,
): RawNodeDatum | null => {
  if (!treeData || treeData.length === 0) {
    return null;
  }

  const traverse = (node: RawNodeDatum): RawNodeDatum | null => {
    if ((node as { nodePath?: string }).nodePath === nodePath) {
      return node;
    }

    for (const child of node.children ?? []) {
      const found = traverse(child);
      if (found) {
        return found;
      }
    }

    return null;
  };

  for (const root of treeData) {
    const found = traverse(root);
    if (found) {
      return found;
    }
  }

  return null;
};

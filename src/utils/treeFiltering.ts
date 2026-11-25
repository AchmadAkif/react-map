import type { TreeFilters, TreeNode } from "../types";

export const routerComponentNames = [
  "router",
  "routes",
  "route",
  "link",
  "navlink",
  "outlet",
  "navigate",
  "scrollrestoration",
];

export const reduxComponentNames = ["provider", "connect", "redux"];

/** Lowercased node types, as labelled by the backend, that are DOM nodes. */
const domNodeTypes = [
  "hostcomponent",
  "text",
  "hosthoistable",
  "hostsingleton",
];

export const shouldHideNode = (node: TreeNode, filters: TreeFilters): boolean => {
  const componentName = node.name.toLowerCase();
  const nodeType = String(node.attributes?.nodeType ?? "").toLowerCase();

  if (
    filters.hideDomComponent &&
    (node.isDOM === true || domNodeTypes.includes(nodeType))
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

export const filterTreeNodes = (
  node: TreeNode,
  filters: TreeFilters,
): TreeNode[] => {
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
 * Filters the tree by matching the component's runtime name and metadata.
 */
export const filterTreeData = (
  node: TreeNode | null,
  filters: TreeFilters,
): TreeNode | null => {
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

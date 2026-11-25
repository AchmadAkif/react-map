export type TreeOrientation = "vertical" | "horizontal";
export type NodeSpacing = { x: number; y: number };

export type TreeFilters = {
  hideRouterComponent: boolean;
  hideDomComponent: boolean;
  hideReduxComponent: boolean;
};

export type ComponentHook = {
  index: number;
  type: string;
  value: string | number | object;
};

/**
 * Domain representation of a React component tree node,
 * decoupled from third-party visualization libraries like react-d3-tree.
 */
export interface TreeNode {
  name: string;
  nodePath?: string;
  attributes?: Record<string, string | number | boolean>;
  children?: TreeNode[];
  isDOM?: boolean | null;
  state?: ComponentHook[] | null;
  props?: Record<string, unknown> | null;
}

/** Points to a node that can be selected. */
export type NodeRef = { nodePath: string; name: string };

export type InspectableNode = {
  name?: string;
  state?: ComponentHook[] | null;
  props?: Record<string, unknown> | null;
  nodePath?: string;
} | null;

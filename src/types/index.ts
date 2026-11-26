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
  instanceId?: number;
  attributes?: Record<string, string | number | boolean>;
  children?: TreeNode[];
  isDOM?: boolean | null;
  /** State hooks; missing when the node cannot have any. */
  state?: ComponentHook[] | null;
  /** Class component state by key; missing on other nodes. */
  classState?: Record<string, unknown> | null;
  /** Missing on a text node. */
  props?: Record<string, unknown> | null;
  /** Only on a text node. */
  text?: string;
}

/** Points to a node that can be selected. */
export type NodeRef = { instanceId: number; name: string };

export type InspectableNode = {
  name?: string;
  state?: ComponentHook[] | null;
  classState?: Record<string, unknown> | null;
  props?: Record<string, unknown> | null;
  instanceId?: number;
} | null;

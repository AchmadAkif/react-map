import type { RawNodeDatum } from "react-d3-tree";

export type SerializedFiberNode = RawNodeDatum & {
  nodePath: string;
};

/** The inspectable values of a node, as opposed to its place in the tree. */
export type NodeDetails = Pick<
  RawNodeDatum,
  "state" | "classState" | "props" | "text"
>;

export type MinimalFiberNode = RawNodeDatum & {
  nodePath: string;
  state?: undefined;
  classState?: undefined;
  props?: undefined;
  text?: undefined;
};

export type TreeMinimalSnapshotMessage = {
  mode: "tree-minimal";
  tree: MinimalFiberNode | null;
};

export type NodeDetailSnapshotMessage = {
  mode: "node-detail";
  node: SerializedFiberNode | null;
  nodePath: string | null;
};

export type BackendPayload =
  | TreeMinimalSnapshotMessage
  | NodeDetailSnapshotMessage;

export type PanelCommand =
  | {
      type: "select-node";
      nodePath: string;
    }
  | {
      type: "deselect-node";
    };

export type BridgeSnapshot = {
  tree: MinimalFiberNode | null;
  selectedNode: SerializedFiberNode | null;
  selectedNodePath: string | null;
};

export type Message = {
  payload: RawNodeDatum | string;
  source: string;
};

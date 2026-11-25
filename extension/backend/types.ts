import type { RawNodeDatum } from "react-d3-tree";

export type SerializedFiberNode = RawNodeDatum & {
  instanceId: number;
};

/** The inspectable values of a node, as opposed to its place in the tree. */
export type NodeDetails = Pick<
  RawNodeDatum,
  "state" | "classState" | "props" | "text"
>;

export type MinimalFiberNode = RawNodeDatum & {
  instanceId: number;
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
  instanceId: number | null;
};

export type BackendPayload =
  | TreeMinimalSnapshotMessage
  | NodeDetailSnapshotMessage;

export type PanelCommand =
  | {
      type: "select-node";
      instanceId: number;
    }
  | {
      type: "deselect-node";
    };

export type BridgeSnapshot = {
  tree: MinimalFiberNode | null;
  selectedNode: SerializedFiberNode | null;
  selectedInstanceId: number | null;
};

export type Message = {
  payload: RawNodeDatum | string;
  source: string;
};

import type { RawNodeDatum } from "react-d3-tree";

export type SerializedFiberNode = RawNodeDatum & {
  nodePath: string;
};

export type MinimalFiberNode = RawNodeDatum & {
  nodePath: string;
  state?: undefined;
  props?: undefined;
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
      nodePath: string | null;
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

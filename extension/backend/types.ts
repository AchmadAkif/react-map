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
      type: "lock-node";
      nodePath: string | null;
    }
  | {
      type: "unlock-node";
    };

export type BridgeSnapshot = {
  tree: MinimalFiberNode | null;
  lockedNode: SerializedFiberNode | null;
  lockedNodePath: string | null;
};

export type Message = {
  payload: RawNodeDatum | string;
  source: string;
};

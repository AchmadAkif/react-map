import type { RawNodeDatum } from "react-d3-tree";

export type SerializedFiberNode = RawNodeDatum & {
  nodePath: string;
};

export type TreeSnapshotMessage = {
  mode: "tree";
  tree: SerializedFiberNode | null;
};

export type LockedNodeSnapshotMessage = {
  mode: "locked-node";
  node: SerializedFiberNode | null;
  nodePath: string | null;
};

export type BackendPayload = TreeSnapshotMessage | LockedNodeSnapshotMessage;

export type PanelCommand =
  | {
      type: "lock-node";
      nodePath: string | null;
    }
  | {
      type: "unlock-node";
    };

export type BridgeSnapshot = {
  tree: SerializedFiberNode | null;
  lockedNode: SerializedFiberNode | null;
  lockedNodePath: string | null;
};

export type Message = {
  payload: RawNodeDatum | string;
  source: string;
};

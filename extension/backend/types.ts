import type { RawNodeDatum } from "react-d3-tree";
import type { componentHook } from "../types";

export type InspectCommandPayload =
  | { type: "inspect-component"; path: number[]; tabId?: number }
  | { type: "stop-inspecting"; tabId?: number };

export type ComponentStateUpdatePayload = {
  type: "component-state-updated";
  path: number[];
  state: componentHook[] | null;
  props: object | null;
};

export type MessagePayload =
  | RawNodeDatum
  | string
  | InspectCommandPayload
  | ComponentStateUpdatePayload;

export type Message = {
  payload: MessagePayload;
  source: string;
};

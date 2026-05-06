import type { RawNodeDatum } from "react-d3-tree";

export type Message = {
  payload: RawNodeDatum | string;
  source: string;
};

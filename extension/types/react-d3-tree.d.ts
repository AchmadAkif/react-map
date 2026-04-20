import "react-d3-tree";
import { componentHook } from ".";

declare module "react-d3-tree" {
  export interface RawNodeDatum {
    state?: componentHook[] | null;
    props?: object | null;
    isDOM?: boolean | null;
  }
}

export {};

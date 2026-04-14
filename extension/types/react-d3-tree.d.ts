import "react-d3-tree";

declare module "react-d3-tree" {
  export interface RawNodeDatum {
    state?: object | null;
    props?: object | null;
    isDOM?: boolean | null;
  }
}

export {};

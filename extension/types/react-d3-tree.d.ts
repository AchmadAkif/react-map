import "react-d3-tree";
import { componentHook } from ".";

declare module "react-d3-tree" {
  export interface RawNodeDatum {
    state?: componentHook[] | null;
    classState?: Record<string, unknown> | null;
    props?: object | null;
    text?: string;
    isDOM?: boolean | null;
    instanceId?: number;
    /** Whether the node's children are left out because it is collapsed. */
    isCollapsed?: boolean;
  }
}

export {};

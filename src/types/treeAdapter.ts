import type { RawNodeDatum } from "react-d3-tree";
import type { TreeNode } from "@/types";

/**
 * Converts domain TreeNode into react-d3-tree RawNodeDatum format.
 */
export function toRawNodeDatum(node: TreeNode | null): RawNodeDatum | null {
  if (!node) return null;

  return {
    name: node.name,
    attributes: node.attributes,
    children: node.children?.map((child) => toRawNodeDatum(child) as RawNodeDatum),
    isDOM: node.isDOM,
    state: node.state,
    props: node.props,
    nodePath: node.nodePath,
  } as unknown as RawNodeDatum;
}

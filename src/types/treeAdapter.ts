import type { RawNodeDatum } from "react-d3-tree";
import type { TreeNode } from "@/types";
import type { CollapsedBranches } from "@/utils";

/**
 * Converts domain TreeNode into react-d3-tree RawNodeDatum format. A collapsed
 * branch loses its children here, because the library forgets which nodes are
 * collapsed whenever its data changes.
 */
export function toRawNodeDatum(
  node: TreeNode | null,
  collapsed: CollapsedBranches,
): RawNodeDatum | null {
  if (!node) return null;

  const isCollapsed =
    Boolean(node.children?.length) && collapsed.has(node.instanceId);

  return {
    name: node.name,
    attributes: node.attributes,
    // Empty rather than missing: the library styles a node with none as a leaf.
    children: isCollapsed
      ? []
      : node.children?.map(
          (child) => toRawNodeDatum(child, collapsed) as RawNodeDatum,
        ),
    isDOM: node.isDOM,
    state: node.state,
    props: node.props,
    instanceId: node.instanceId,
    isCollapsed,
  } as unknown as RawNodeDatum;
}

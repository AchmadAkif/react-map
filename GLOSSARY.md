# React Map

A browser DevTools panel that draws a live React app as a tree and lets the user inspect its components.

## Language

**Selected node**:
The one node the user has deliberately chosen to inspect, whether from the tree or through search. It follows the same component instance when that instance changes position in the tree.
_Avoid_: Pinned node, locked node, hovered node, active node

**Unmounted node**:
A selected node whose component instance no longer exists in the app. A later mount of the same component is a different node.
_Avoid_: Unavailable node, missing node

**Hidden node**:
A node that is still mounted but not drawn, because a filter or a collapsed branch excludes it.
_Avoid_: Unmounted node, removed node

**DOM node**:
A node in the tree that represents browser content, such as an element or text, rather than a React component. It has props but no state to inspect.
_Avoid_: DOM component, host component

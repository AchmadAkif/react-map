# Selection follows the component instance, not its tree position

Nodes were identified by their position in the tree (such as `0/2/1`), so inserting a sibling could silently switch the panel to a different component's state. We decided that the selected node is identified by its React component instance: it survives re-renders and reordering, and ends when the instance unmounts or the page reloads.

## Considered options

- **Position in the tree**: simple and survives a reload, but can show the wrong component without any sign that it changed.
- **Reselecting a similar node after a remount or reload**: convenient, but a guess. A remounted component is a new instance with fresh state.

## Consequences

- A full page reload clears the selection. Do not restore it by position, as that brings back the wrong-component problem.
- Identity is React's: if an app uses array indexes as list keys, the selection follows the instance React reuses, even when its data changes.

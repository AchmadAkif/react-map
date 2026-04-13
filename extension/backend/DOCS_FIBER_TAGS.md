React Fiber Tag Reference
In this project, we interact directly with React's internal "Fiber" nodes. Every node in the Fiber tree has a .tag property—a numeric value representing the WorkTag. This tag tells us exactly what kind of component or entity the node represents before we even look at its name or props.

The following table serves as a reference for the tag numbers encountered during tree traversal in React v16 through v18+.

Tag,Variable Name,Description,Crawler Action
0,FunctionComponent,Standard functional component.,Process & Render
1,ClassComponent,Standard ES6 class component.,Process & Render
3,HostRoot,"The ""Root"" container of the React tree.",Identify as Start Node
5,HostComponent,"Standard HTML elements (div, span, etc.).",Optional Render
6,HostText,Raw text nodes inside elements.,Skip (Too granular)
8,Mode,<StrictMode> or <ConcurrentMode>.,Skip (Internal Wrapper)
10,ContextProvider,The .Provider of a React Context.,Process & Render
11,ForwardRef,Components using React.forwardRef().,Process & Render
15,MemoComponent,Components using React.memo().,Process & Render
22,Offscreen,Hidden or Suspended components.,Identify as Inactive

Why We Document This
React's internal Fiber structure is circular and complex. When we "crawl" the tree to build our D3 map, we use these tags to make split-second decisions:

Filtering: We use Tag 8 (Mode) and Tag 6 (HostText) to "jump" over nodes that don't add value to a component hierarchy map.

Naming: If a node's type is null, the Tag is our only way to know if we are looking at a FiberRoot or a Fragment.

Recursion Safety: Understanding tags helps us know when to look for .child vs when we've reached a terminal leaf (like a HostText).

Source of Truth
These values are derived from the official React source:
packages/react-reconciler/src/ReactWorkTags.js

Warning: These are internal constants. While stable across major versions, they are subject to change by the React team without notice in minor or major updates.

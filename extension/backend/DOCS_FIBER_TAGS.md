# React Fiber Tag Reference

This document tracks the internal React `WorkTag` values used by the **React-Map** crawler. These tags are found on the `.tag` property of every Fiber node and are used to determine the type of component or internal process represented by that node.

Tag,Variable Name,Description,Crawler Action
0,FunctionComponent,Standard functional component.
1,ClassComponent,Standard ES6 class component.
3,HostRoot,"The ""Root"" container of the React tree.",Identify as Start Node
5,HostComponent,"Standard HTML elements (div, span, etc.).",Optional Render
6,HostText,Raw text nodes inside elements.
8,Mode,<StrictMode> or <ConcurrentMode>.
10,ContextProvider,The .Provider of a React Context.
11,ForwardRef,Components using React.forwardRef().
15,MemoComponent,Components using React.memo().
22,Offscreen,Hidden or Suspended components.

| Tag    | Variable Name       | Description                                   | Crawler Action              |
| :----- | :------------------ | :-------------------------------------------- | :-------------------------- |
| **0**  | `FunctionComponent` | Standard functional component.                | **Process & Render**        |
| **1**  | `ClassComponent`    | Standard ES6 class component.                 | **Process & Render**        |
| **3**  | `HostRoot`          | The "Root" container of the React tree.       | **Identify as Start Node**  |
| **5**  | `HostComponent`     | Standard HTML elements (`div`, `span`, etc.). | **Optional Render**         |
| **6**  | `HostText`          | Raw text nodes inside elements.               | **Skip** (Too granular)     |
| **8**  | `Mode`              | `<StrictMode>` or `<ConcurrentMode>`.         | **Skip** (Internal Wrapper) |
| **10** | `ContextProvider`   | The `.Provider` of a React Context.           | **Process & Render**        |
| **11** | `ForwardRef`        | Components using `React.forwardRef()`.        | **Process & Render**        |
| **13** | `SuspenseComponent` | A `<Suspense>` boundary.                      | **Process & Render**        |
| **14** | `MemoComponent`     | Components using `React.memo()`.              | **Process & Render**        |
| **22** | `Offscreen`         | Hidden or Suspended components.               | **Identify as Inactive**    |

Full version: https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactWorkTags.js/

## Implementation Usage

In our `fiberCrawler.ts`, we use these tags to make logic decisions without relying on the often-minified `type.name` property.

### Why Tag 8 is Skipped

Tag 8 represents a "Mode" node. These are invisible wrappers that React uses to enforce rules (like Strict Mode). Because they do not render a physical UI element or contain business logic, we jump straight to their `.child` to keep the visualization clean.

### Handling HostRoot (Tag 3)

The HostRoot is the entry point. We use this to distinguish the very top of the application from standard components. If `node.type` is null and `node.tag === 3`, we label it as **"FiberRoot"**.

## Source of Truth

These values are derived from the official React source:
`packages/react-reconciler/src/ReactWorkTags.js`

> **Warning:** These are internal constants. While stable across major versions, they are subject to change by the React team without notice in minor or major updates.

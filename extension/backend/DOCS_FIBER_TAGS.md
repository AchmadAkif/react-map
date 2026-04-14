# React Fiber Tag Reference

This document tracks the internal React `WorkTag` values used by the **React-Map** crawler. These tags are found on the `.tag` property of every Fiber node and are used to determine the type of component or internal process represented by that node.

| Tag    | Variable Name       | Description                                   
| :----- | :------------------ | :-------------------------------------------- 
| **0**  | `FunctionComponent` | Standard functional component.                
| **1**  | `ClassComponent`    | Standard ES6 class component.                
| **3**  | `HostRoot`          | The "Root" container of the React tree.       
| **5**  | `HostComponent`     | Standard HTML elements (`div`, `span`, etc.). 
| **6**  | `HostText`          | Raw text nodes inside elements.               
| **8**  | `Mode`              | `<StrictMode>` or `<ConcurrentMode>`.         
| **10** | `ContextProvider`   | The `.Provider` of a React Context.          
| **11** | `ForwardRef`        | Components using `React.forwardRef()`.        
| **13** | `SuspenseComponent` | A `<Suspense>` boundary.                      
| **15** | `MemoComponent`     | Components using `React.memo()`.              
| **22** | `Offscreen`         | Hidden or Suspended components.               

## Implementation Usage

In our `fiberCrawler.ts`, we use these tags to make logic decisions without relying on the often-minified `type.name` property.

### Why Tag 3 and 8 are Skipped

Tag 3 represents a "Root" node, while 8 represents a "Mode" node. Because they do not render a physical UI element or contain business logic, we jump straight to their `.child` to keep the visualization clean.

## Source of Truth

These values are derived from the official React source:
`packages/react-reconciler/src/ReactWorkTags.js`

> **Warning:** These are internal constants. While stable across major versions, they are subject to change by the React team without notice in minor or major updates.

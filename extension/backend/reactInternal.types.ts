/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * A simplified typescript translation of React's internal Fiber and FiberRoot types.
 *
 * NOTE: This is NOT a public API. It's based on React's internal source
 * code and is subject to change without notice in any React update.
 * Use with caution!.
 *
 * @see https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactInternalTypes.js
 * @see https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberRoot.js
 */

// Runtime constants representing React WorkTag values
export const WorkTag = {
  FunctionComponent: 0,
  ClassComponent: 1,
  IndeterminateComponent: 2,
  HostRoot: 3,
  HostPortal: 4,
  HostComponent: 5,
  HostText: 6,
  Fragment: 7,
  Mode: 8,
  ContextConsumer: 9,
  ContextProvider: 10,
  ForwardRef: 11,
  Profiler: 12,
  SuspenseComponent: 13,
  MemoComponent: 14,
  SimpleMemoComponent: 15,
  LazyComponent: 16,
  IncompleteClassComponent: 17,
  DehydratedFragment: 18,
  SuspenseListComponent: 19,
  ScopeComponent: 21,
  OffscreenComponent: 22,
  LegacyHiddenComponent: 23,
  CacheComponent: 24,
  TracingMarkerComponent: 25,
  HostHoistable: 26,
  HostSingleton: 27,
  IncompleteFunctionComponent: 28,
  Throw: 29,
  ViewTransitionComponent: 30,
  ActivityComponent: 31,
} as const;

export type WorkTag = (typeof WorkTag)[keyof typeof WorkTag];

// Describes the type of root.
export type RootTag = 0 | 1; // LegacyRoot | ConcurrentRoot

// Opaque types for internal React entities.
export type Lanes = number;
export type Lane = number;
export type LaneMap<T> = Array<T>;

// --- Main Fiber Node Definition ---
export interface Fiber {
  // --- Instance ---
  tag: WorkTag | number;
  key: null | string;
  elementType: any;
  type: any;
  stateNode: any;

  // --- Fiber traversal ---
  return: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  index: number;

  // --- Props and State ---
  pendingProps: any;
  memoizedProps: any;
  updateQueue: any; // Opaque object
  memoizedState: any;

  // --- Dependencies ---
  dependencies: any; // Opaque object

  // --- Effects ---
  flags: number;
  subtreeFlags: number;
  deletions: Fiber[] | null;

  // --- Scheduler ---
  lanes: Lanes;
  childLanes: Lanes;

  // --- Timeouts ---
  // The expiration time of this fiber.
  expirationTime?: number; // Legacy only

  // --- Alternates ---
  // This is a reference to the other Fiber in a double-buffered tree.
  alternate: Fiber | null;

  // DEV-only properties
  _debugSource?: any;
  _debugOwner?: Fiber | null;
  _debugSelf?: any;
}

// --- Fiber Root Definition ---
export interface FiberRoot {
  // --- Root Info ---
  readonly tag: RootTag;
  readonly containerInfo: any; // The DOM node.

  // --- Trees ---
  current: Fiber; // The currently committed tree.
  pendingChildren: any; // Not used anymore.

  // --- Scheduler ---
  pingCache: WeakMap<any, any> | Map<any, any> | null;
  pendingLanes: Lanes;
  suspendedLanes: Lanes;
  pingedLanes: Lanes;
  expiredLanes: Lanes;
  finishedWork: Fiber | null; // The tree that has just been completed.

  // --- Callbacks and Context ---
  callbackNode: any;
  callbackPriority: Lane;
  context: Record<string, any> | null;
  pendingContext: Record<string, any> | null;

  // --- Error Handling ---
  // Used to recover from errors.
  onRecoverableError: (
    error: unknown,
    errorInfo: { componentStack: string | null },
  ) => void;

  // --- Caching ---
  pooledCache: any; // Cache | null
  pooledCacheLanes: Lanes;

  // --- Misc ---
  timeoutHandle: any; // number | TimeoutID
  identifierPrefix: string;

  // --- Timestamps ---
  // A map of lane numbers to expiration times.
  expirationTimes: LaneMap<number>;

  // Many other internal fields exist here, but these are the most relevant.
}

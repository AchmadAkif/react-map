/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * A simplified typescript translation of React's internal Fiber and FiberRoot types.
 *
 * NOTE: This is NOT a public API. It's based on React's internal source
 * code and is subject to change without notice in any React update.
 * Use with caution.
 *
 * @see https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactInternalTypes.js
 * @see https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberRoot.js
 */

// --- Enums and basic types from React source ---
// Represents the type of a Fiber node.
export type WorkTag =
  | 0 // FunctionComponent
  | 1 // HostRoot
  | 2 // IndeterminateComponent (before we know what it is)
  | 3 // HostPortal
  | 4 // DehydratedFragment
  | 5 // HostComponent
  | 6 // HostText
  | 7 // Fragment
  | 8 // Mode
  | 9 // ContextConsumer
  | 10 // ContextProvider
  | 11 // ForwardRef
  | 12 // Profiler
  | 13 // SuspenseComponent
  | 14 // MemoComponent
  | 15 // SimpleMemoComponent
  | 16 // LazyComponent
  | 17 // IncompleteClassComponent
  | 18 // ScopeComponent
  | 19 // SuspenseListComponent
  | 21 // OffscreenComponent
  | 22 // LegacyHiddenComponent
  | 23 // CacheComponent
  | 24 // TracingMarkerComponent
  | 25 // HostHoistable
  | 26; // HostSingleton

// Describes the type of root.
export type RootTag = 0 | 1; // LegacyRoot | ConcurrentRoot

// Opaque types for internal React entities.
export type Lanes = number;
export type Lane = number;
export type LaneMap<T> = Array<T>;

// --- Main Fiber Node Definition ---
export interface Fiber {
  // --- Instance ---
  tag: WorkTag;
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

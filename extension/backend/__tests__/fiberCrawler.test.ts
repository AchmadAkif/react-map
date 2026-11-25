import { describe, it, expect } from "vitest";
import {
  traverseFiber,
  traverseFiberMinimal,
  serializeNodeDetail,
  findFiberByInstanceId,
} from "../fiberCrawler";
import { WorkTag, type Fiber } from "../reactInternal.types";

/**
 * Helper to construct a mock Fiber node for unit testing.
 */
function createMockFiber(overrides: Partial<Fiber> = {}): Fiber {
  return {
    tag: WorkTag.FunctionComponent,
    key: null,
    elementType: { name: "MockComponent" },
    type: { name: "MockComponent" },
    stateNode: null,
    return: null,
    child: null,
    sibling: null,
    index: 0,
    pendingProps: {},
    memoizedProps: {},
    updateQueue: null,
    memoizedState: null,
    dependencies: null,
    flags: 0,
    subtreeFlags: 0,
    deletions: null,
    lanes: 0,
    childLanes: 0,
    alternate: null,
    ...overrides,
  };
}

describe("fiberCrawler", () => {
  describe("traverseFiber and traverseFiberMinimal", () => {
    it("returns null for null fiber node", () => {
      expect(traverseFiber(null)).toBeNull();
      expect(traverseFiberMinimal(null)).toBeNull();
    });

    it("traverses a single FunctionComponent minimal node without props or state", () => {
      const fiber = createMockFiber({
        tag: WorkTag.FunctionComponent,
        type: { displayName: "App" },
        memoizedProps: { title: "Test" },
        memoizedState: {
          queue: { dispatch: () => {} },
          memoizedState: "active",
          next: null,
        },
      });

      const minimal = traverseFiberMinimal(fiber);
      expect(minimal).not.toBeNull();
      expect(minimal?.name).toBe("App");
      expect(minimal?.attributes?.nodeType).toBe("FunctionComponent");
      expect(minimal?.state).toBeUndefined();
      expect(minimal?.props).toBeUndefined();
    });

    it("includes props and state when includeDetails is true", () => {
      const fiber = createMockFiber({
        tag: WorkTag.FunctionComponent,
        type: { displayName: "Counter" },
        memoizedProps: { initialCount: 5 },
        memoizedState: {
          queue: { dispatch: () => {} },
          memoizedState: 5,
          next: null,
        },
      });

      const detailed = traverseFiber(fiber, { includeDetails: true });
      expect(detailed).not.toBeNull();
      expect(detailed?.name).toBe("Counter");
      expect(detailed?.props).toEqual({ initialCount: 5 });
      expect(detailed?.state).toBeDefined();
      expect(detailed?.state?.[0]?.value).toBe(5);
    });

    it("skips HostRoot and Mode (StrictMode) and transparently traverses children", () => {
      const childFiber = createMockFiber({
        tag: WorkTag.FunctionComponent,
        type: { displayName: "App" },
      });

      const strictModeFiber = createMockFiber({
        tag: WorkTag.Mode,
        type: null,
        child: childFiber,
      });

      const rootFiber = createMockFiber({
        tag: WorkTag.HostRoot,
        type: null,
        child: strictModeFiber,
      });

      const result = traverseFiber(rootFiber);
      expect(result).not.toBeNull();
      expect(result?.name).toBe("App");
    });

    it("skips HostText nodes inside HostComponent", () => {
      const textNode = createMockFiber({
        tag: WorkTag.HostText,
        type: null,
      });

      const buttonComponent = createMockFiber({
        tag: WorkTag.FunctionComponent,
        type: { displayName: "CustomButton" },
      });

      // textNode and buttonComponent are siblings inside div
      textNode.sibling = buttonComponent;

      const divFiber = createMockFiber({
        tag: WorkTag.HostComponent,
        type: "div",
        elementType: "div",
        child: textNode,
      });

      const result = traverseFiber(divFiber);
      expect(result).not.toBeNull();
      expect(result?.name).toBe("div");
      expect(result?.isDOM).toBe(true);
      // HostText was skipped, so div only has 1 visible child (CustomButton)
      expect(result?.children?.length).toBe(1);
      expect(result?.children?.[0]?.name).toBe("CustomButton");
    });

    it("transparently flattens multiple children when Mode is an intermediate wrapper", () => {
      const childA = createMockFiber({
        tag: WorkTag.FunctionComponent,
        type: { displayName: "Header" },
      });

      const childB = createMockFiber({
        tag: WorkTag.FunctionComponent,
        type: { displayName: "Footer" },
      });
      childA.sibling = childB;

      const strictMode = createMockFiber({
        tag: WorkTag.Mode,
        type: null,
        child: childA,
      });

      const appFiber = createMockFiber({
        tag: WorkTag.FunctionComponent,
        type: { displayName: "App" },
        child: strictMode,
      });

      const result = traverseFiber(appFiber);
      expect(result).not.toBeNull();
      // Both Header and Footer appear under App without Mode
      expect(result?.children?.length).toBe(2);
      expect(result?.children?.[0]?.name).toBe("Header");
      expect(result?.children?.[1]?.name).toBe("Footer");
    });
  });

  describe("serializeNodeDetail", () => {
    it("returns null for null fiber", () => {
      expect(serializeNodeDetail(null)).toBeNull();
    });

    it("serializes single node details with state and props", () => {
      const fiber = createMockFiber({
        tag: WorkTag.FunctionComponent,
        type: { displayName: "UserProfile" },
        memoizedProps: { username: "Alice" },
      });

      const detail = serializeNodeDetail(fiber);
      expect(detail).not.toBeNull();
      expect(detail?.name).toBe("UserProfile");
      expect(detail?.props).toEqual({ username: "Alice" });
      expect(detail?.isDOM).toBe(false);
    });

    it("shows class component state by key", () => {
      const fiber = createMockFiber({
        tag: WorkTag.ClassComponent,
        type: { displayName: "Counter" },
        memoizedState: {
          count: 5,
          user: { name: "Alice" },
          next: null,
          error: undefined,
          reset: () => {},
        },
      });

      const detail = serializeNodeDetail(fiber);
      expect(detail?.classState).toEqual({
        count: 5,
        user: { name: "Alice" },
        next: null,
        // Keeps the key across the bridge, which drops undefined values.
        error: "__react_map_undefined__",
        reset: "ƒ()",
      });
      expect(detail).not.toHaveProperty("state");
    });

    it.each([
      ["element", WorkTag.HostComponent, "div"],
      ["hoistable element", WorkTag.HostHoistable, "link"],
      ["singleton element", WorkTag.HostSingleton, "body"],
    ])("shows only the props of a DOM %s", (_label, tag, type) => {
      const detail = serializeNodeDetail(
        createMockFiber({
          tag,
          type,
          memoizedProps: { className: "main" },
          // React may keep its own data here, which is not the node's state.
          memoizedState: { memoizedState: null, queue: null, next: null },
        }),
      );

      expect(detail?.props).toEqual({ className: "main" });
      expect(detail).not.toHaveProperty("state");
      expect(detail).not.toHaveProperty("classState");
    });

    it.each(["Hello", ""])("shows the text %j as a single value", (text) => {
      const detail = serializeNodeDetail(
        createMockFiber({
          tag: WorkTag.HostText,
          type: null,
          elementType: null,
          memoizedProps: text,
        }),
      );

      expect(detail?.text).toBe(text);
      expect(detail).not.toHaveProperty("props");
      expect(detail).not.toHaveProperty("state");
      expect(detail).not.toHaveProperty("classState");
    });

    it("keeps function component state as a list of hooks", () => {
      const detail = serializeNodeDetail(
        createMockFiber({
          memoizedState: {
            queue: { dispatch: () => {} },
            memoizedState: 5,
            next: {
              queue: null,
              memoizedState: { current: null },
              next: null,
            },
          },
        }),
      );

      expect(detail?.state).toEqual([
        { index: 0, type: "State", value: 5 },
        { index: 1, type: "Ref", value: "() => {}" },
      ]);
      expect(detail).not.toHaveProperty("classState");
    });
  });

  describe("findFiberByInstanceId", () => {
    it("returns null when there is no tree or no such instance", () => {
      expect(findFiberByInstanceId(null, 1)).toBeNull();
      expect(findFiberByInstanceId(createMockFiber(), -1)).toBeNull();
    });

    it("finds every node of the tree, through transparent wrappers", () => {
      const inner = createMockFiber({ type: { displayName: "Inner" } });
      const last = createMockFiber({ type: { displayName: "Last" } });
      const innerMode = createMockFiber({
        tag: WorkTag.Mode,
        type: null,
        child: inner,
      });
      const outerMode = createMockFiber({
        tag: WorkTag.Mode,
        type: null,
        child: innerMode,
        sibling: last,
      });
      const app = createMockFiber({
        type: { displayName: "App" },
        memoizedProps: { title: "Home" },
        child: outerMode,
      });
      const hostRoot = createMockFiber({
        tag: WorkTag.HostRoot,
        type: null,
        child: createMockFiber({ tag: WorkTag.Mode, type: null, child: app }),
      });

      const tree = traverseFiberMinimal(hostRoot)!;
      const find = (instanceId?: number) =>
        findFiberByInstanceId(hostRoot, instanceId!);

      expect(tree.children?.map(({ name }) => name)).toEqual(["Inner", "Last"]);
      expect(find(tree.instanceId)).toBe(app);
      expect(find(tree.children?.[0].instanceId)).toBe(inner);
      expect(find(tree.children?.[1].instanceId)).toBe(last);
      expect(serializeNodeDetail(app)).toMatchObject({
        name: "App",
        instanceId: tree.instanceId,
        props: { title: "Home" },
      });
    });

    it("shares the ID between the current and alternate fibers", () => {
      const first = createMockFiber({ type: { displayName: "Counter" } });
      const instanceId = traverseFiberMinimal(first)!.instanceId;

      // Hot reload keeps the fiber pair and swaps the component function.
      const second = createMockFiber({
        type: { displayName: "Counter" },
        alternate: first,
      });
      first.alternate = second;

      expect(findFiberByInstanceId(second, instanceId)).toBe(second);
      expect(traverseFiberMinimal(second)!.instanceId).toBe(instanceId);
      expect(traverseFiberMinimal(first)!.instanceId).toBe(instanceId);
    });
  });
});

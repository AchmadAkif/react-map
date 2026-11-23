import { describe, it, expect } from "vitest";
import {
  traverseFiber,
  traverseFiberMinimal,
  serializeNodeDetail,
  findFiberByNodePath,
  buildNodePath,
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
  describe("buildNodePath", () => {
    it("constructs root-level path when parentPath is empty", () => {
      expect(buildNodePath("", 0)).toBe("0");
      expect(buildNodePath("", 2)).toBe("2");
    });

    it("constructs nested hierarchical paths", () => {
      expect(buildNodePath("0", 1)).toBe("0/1");
      expect(buildNodePath("0/1", 3)).toBe("0/1/3");
    });
  });

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
      expect(minimal?.nodePath).toBe("");
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

      const detailed = traverseFiber(fiber, "0", { includeDetails: true });
      expect(detailed).not.toBeNull();
      expect(detailed?.name).toBe("Counter");
      expect(detailed?.nodePath).toBe("0");
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

      const result = traverseFiber(divFiber, "0");
      expect(result).not.toBeNull();
      expect(result?.name).toBe("div");
      expect(result?.isDOM).toBe(true);
      // HostText was skipped, so div only has 1 visible child (CustomButton) with path 0/0
      expect(result?.children?.length).toBe(1);
      expect(result?.children?.[0]?.name).toBe("CustomButton");
      expect(result?.children?.[0]?.nodePath).toBe("0/0");
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

      const result = traverseFiber(appFiber, "0");
      expect(result).not.toBeNull();
      // Both Header and Footer appear under App without Mode
      expect(result?.children?.length).toBe(2);
      expect(result?.children?.[0]?.name).toBe("Header");
      expect(result?.children?.[0]?.nodePath).toBe("0/0");
      expect(result?.children?.[1]?.name).toBe("Footer");
      expect(result?.children?.[1]?.nodePath).toBe("0/1");
    });
  });

  describe("serializeNodeDetail", () => {
    it("returns null for null fiber", () => {
      expect(serializeNodeDetail(null, "0")).toBeNull();
    });

    it("serializes single node details with state, props, and path", () => {
      const fiber = createMockFiber({
        tag: WorkTag.FunctionComponent,
        type: { displayName: "UserProfile" },
        memoizedProps: { username: "Alice" },
      });

      const detail = serializeNodeDetail(fiber, "0/1");
      expect(detail).not.toBeNull();
      expect(detail?.name).toBe("UserProfile");
      expect(detail?.nodePath).toBe("0/1");
      expect(detail?.props).toEqual({ username: "Alice" });
      expect(detail?.isDOM).toBe(false);
    });
  });

  describe("findFiberByNodePath", () => {
    it("returns null for null fiber or non-matching path", () => {
      expect(findFiberByNodePath(null, "0")).toBeNull();
    });

    it("finds the exact target fiber node by hierarchical path", () => {
      const targetFiber = createMockFiber({
        tag: WorkTag.FunctionComponent,
        type: { displayName: "TargetComponent" },
      });

      const otherChild = createMockFiber({
        tag: WorkTag.FunctionComponent,
        type: { displayName: "OtherComponent" },
      });

      const parentFiber = createMockFiber({
        tag: WorkTag.FunctionComponent,
        type: { displayName: "Parent" },
        child: otherChild,
      });
      otherChild.sibling = targetFiber;

      const root = createMockFiber({
        tag: WorkTag.HostRoot,
        child: parentFiber,
      });

      const tree = traverseFiber(root);
      expect(tree).not.toBeNull();
      expect(tree?.nodePath).toBe("");
      expect(tree?.children?.[0]?.nodePath).toBe("0");
      expect(tree?.children?.[1]?.nodePath).toBe("1");

      // Target is at child index 1 of Parent (path "1")
      const found = findFiberByNodePath(root, "1");
      expect(found).toBe(targetFiber);

      // Other is at child index 0 of Parent (path "0")
      const foundOther = findFiberByNodePath(root, "0");
      expect(foundOther).toBe(otherChild);

      // Parent is at root (path "")
      const foundParent = findFiberByNodePath(root, "");
      expect(foundParent).toBe(parentFiber);

      // Invalid path returns null
      expect(findFiberByNodePath(root, "5")).toBeNull();
    });
  });
});

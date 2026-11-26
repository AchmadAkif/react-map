// @vitest-environment jsdom
import { act, createElement, StrictMode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  findFiberByInstanceId,
  serializeNodeDetail,
  traverseFiberMinimal,
} from "../fiberCrawler";
import type { Fiber, FiberRoot } from "../reactInternal.types";
import type { MinimalFiberNode } from "../types";

// Drives the crawler with fibers made by React itself, so that alternates,
// reordering and remounting are React's own.

let container: HTMLElement;
let root: Root;

const currentFiber = (): Fiber =>
  (root as unknown as { _internalRoot: FiberRoot })._internalRoot.current;

const render = (element: React.ReactNode) =>
  act(async () => root.render(element));

const listNodes = (node: MinimalFiberNode | null): MinimalFiberNode[] =>
  node
    ? [
        node,
        ...((node.children ?? []) as MinimalFiberNode[]).flatMap(listNodes),
      ]
    : [];

const crawl = () => listNodes(traverseFiberMinimal(currentFiber()));

const idsOf = (name: string) =>
  crawl()
    .filter((node) => node.name === name)
    .map((node) => node.instanceId);

const detailsOf = (instanceId: number) =>
  serializeNodeDetail(findFiberByInstanceId(currentFiber(), instanceId));

const Counter = () => {
  const [count, setCount] = useState(0);
  const increment = () => setCount(count + 1);
  return createElement("button", { onClick: increment }, count);
};

const clickCounter = () =>
  act(async () => container.querySelector("button")!.click());

const Item = ({ label }: { label: string }) => createElement("li", null, label);

const List = ({ labels }: { labels: string[] }) =>
  createElement(
    "ul",
    null,
    labels.map((label) => createElement(Item, { key: label, label })),
  );

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(() => act(async () => root.unmount()));

describe("component instance identity", () => {
  it("gives every node its own ID", async () => {
    await render(createElement(List, { labels: ["a", "b", "c"] }));

    const ids = crawl().map((node) => node.instanceId);
    expect(ids).toHaveLength(8);
    expect(new Set(ids).size).toBe(8);
    ids.forEach((id) => expect(id).toEqual(expect.any(Number)));
  });

  it("keeps the ID and reads current state across re-renders", async () => {
    await render(createElement(Counter));
    const [id] = idsOf("Counter");

    // More than two commits, so that both alternates take a turn as current.
    for (const count of [1, 2, 3, 4]) {
      await clickCounter();

      expect(idsOf("Counter")).toEqual([id]);
      expect(detailsOf(id)).toMatchObject({
        name: "Counter",
        instanceId: id,
        state: [{ value: count }],
      });
    }
  });

  it("keeps the ID when commits happen between crawls", async () => {
    await render(createElement(Counter));
    const [id] = idsOf("Counter");

    await clickCounter();
    await clickCounter();
    await clickCounter();

    expect(detailsOf(id)?.state?.[0].value).toBe(3);
    expect(idsOf("Counter")).toEqual([id]);
  });

  it.each([
    ["reordered", ["c", "b", "a"]],
    ["prepended", ["new", "a", "b", "c"]],
    ["removed", ["b", "c"]],
  ])("follows a keyed item when siblings are %s", async (_label, labels) => {
    await render(createElement(List, { labels: ["a", "b", "c"] }));
    const [, idOfB] = idsOf("Item");

    await render(createElement(List, { labels }));

    expect(detailsOf(idOfB)?.props).toEqual({ label: "b" });
    expect(idsOf("Item")[labels.indexOf("b")]).toBe(idOfB);
  });

  it("does not find an unmounted instance", async () => {
    await render(createElement(List, { labels: ["a", "b"] }));
    const [idOfA] = idsOf("Item");

    await render(createElement(List, { labels: ["b"] }));

    expect(findFiberByInstanceId(currentFiber(), idOfA)).toBeNull();
    expect(detailsOf(idOfA)).toBeNull();
  });

  it("gives a remounted component a new ID and never reuses the old one", async () => {
    await render(createElement(Counter, { key: "first" }));
    const [firstId] = idsOf("Counter");

    await render(createElement(Counter, { key: "second" }));
    const [secondId] = idsOf("Counter");

    await render(createElement(Counter, { key: "first" }));
    const [thirdId] = idsOf("Counter");

    expect(new Set([firstId, secondId, thirdId]).size).toBe(3);
    expect(findFiberByInstanceId(currentFiber(), firstId)).toBeNull();
  });

  it("finds the root and keeps its ID across re-renders", async () => {
    const app = (labels: string[]) =>
      createElement(StrictMode, null, createElement(List, { labels }));

    await render(app(["a"]));
    const [rootNode] = crawl();
    expect(rootNode.name).toBe("List");

    await render(app(["a", "b"]));

    expect(crawl()[0].instanceId).toBe(rootNode.instanceId);
    expect(detailsOf(rootNode.instanceId)).toMatchObject({
      name: "List",
      props: { labels: ["a", "b"] },
    });
  });
});

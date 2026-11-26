import type { Fiber } from "./reactInternal.types";

// Weak keys, so that an ID does not keep an unmounted instance in memory.
const instanceIds = new WeakMap<Fiber, number>();
let lastInstanceId = 0;

/** Reads the ID of a fiber's component instance, if it has been given one. */
export const readInstanceId = (fiber: Fiber): number | undefined =>
  instanceIds.get(fiber) ??
  (fiber.alternate ? instanceIds.get(fiber.alternate) : undefined);

/**
 * Returns the ID of a fiber's component instance, assigning one if needed.
 * The current and alternate fibers of an instance share its ID, and an ID is
 * never reused within a page.
 */
export const getInstanceId = (fiber: Fiber): number => {
  const instanceId = readInstanceId(fiber) ?? ++lastInstanceId;

  instanceIds.set(fiber, instanceId);
  if (fiber.alternate) instanceIds.set(fiber.alternate, instanceId);

  return instanceId;
};

import { describe, it, expect } from "vitest";
import { getValueTypeClass, renderValue } from "../valueRendering";

describe("valueRendering utils", () => {
  it("determines correct CSS classes for primitive types", () => {
    expect(getValueTypeClass(null)).toContain("text-amber-500");
    expect(getValueTypeClass("__react_map_undefined__")).toContain("text-amber-500");
    expect(getValueTypeClass(undefined)).toContain("text-amber-500");
    expect(getValueTypeClass("regular string")).toContain("text-violet-500");
    expect(getValueTypeClass("<MyComponent/>")).toContain("text-slate-700");
    expect(getValueTypeClass("ƒ()")).toContain("text-fuchsia-500");
    expect(getValueTypeClass(42)).toContain("text-sky-500");
    expect(getValueTypeClass(true)).toContain("text-emerald-500");
    expect(getValueTypeClass(BigInt(100))).toContain("text-cyan-500");
    expect(getValueTypeClass(Symbol("sym"))).toContain("text-rose-500");
    expect(getValueTypeClass(() => {})).toContain("text-fuchsia-500");
    expect(getValueTypeClass({})).toBeUndefined();
  });

  it("renders primitive values properly", () => {
    expect(renderValue("__react_map_undefined__")).toBe("undefined");
    expect(renderValue("f()")).toBe("ƒ()");
    expect(renderValue("<Button/>")).toBe("<Button/>");
    expect(renderValue("hello")).toBe('"hello"');
    expect(renderValue(123)).toBe("123");
    expect(renderValue(false)).toBe("false");
    expect(renderValue(undefined)).toBe("undefined");
    expect(renderValue(null)).toBe("null");
    expect(renderValue(() => {})).toBe("ƒ()");
  });
});

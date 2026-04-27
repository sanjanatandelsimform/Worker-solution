import { describe, it, expect } from "vitest";
import { selectEvenlySpacedItems } from "@/components/application/charts/chart-utils";

describe("selectEvenlySpacedItems", () => {
  it("returns empty array for empty input", () => {
    expect(selectEvenlySpacedItems([], 3)).toEqual([]);
  });

  it("returns empty array for null-ish input", () => {
    expect(selectEvenlySpacedItems(null as any, 3)).toEqual([]);
  });

  it("repeats single element for count > 1", () => {
    expect(selectEvenlySpacedItems(["a"], 3)).toEqual(["a", "a", "a"]);
  });

  it("returns first and last for count=2", () => {
    expect(selectEvenlySpacedItems([1, 2, 3, 4, 5], 2)).toEqual([1, 5]);
  });

  it("returns evenly spaced items for count=3", () => {
    expect(selectEvenlySpacedItems([1, 2, 3, 4, 5], 3)).toEqual([1, 3, 5]);
  });

  it("returns all items when count equals length", () => {
    expect(selectEvenlySpacedItems(["a", "b", "c"], 3)).toEqual(["a", "b", "c"]);
  });

  it("handles count=1 (edge case: division by zero)", () => {
    // count-1 = 0 causes NaN index → boundedIndex = 0, but array[NaN] = undefined
    const result = selectEvenlySpacedItems([10, 20, 30], 1);
    expect(result).toHaveLength(1);
  });
});

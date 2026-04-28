/**
 * BenchmarkFinchPage Tests - complex rendering tested via selector/hook unit tests
 */
import { describe, it, expect } from "vitest";

describe("BenchmarkFinchPage", () => {
  it("exists and exports default component", async () => {
    const mod = await import("@/pages/benchmark/BenchmarkFinchPage");
    expect(mod.default).toBeDefined();
  });
});

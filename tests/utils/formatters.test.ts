/**
 * Formatter Utility Tests
 *
 * Unit tests for formatEmployerCostPerYear.
 * TDD: written before implementation (Red state expected initially).
 */

import { describe, it, expect } from "vitest";
import { formatEmployerCostPerYear } from "@/utils/formatters";

describe("formatEmployerCostPerYear", () => {
  it("formats a positive integer with thousands separator and /yr suffix", () => {
    expect(formatEmployerCostPerYear(11240)).toBe("$11,240/yr");
  });

  it("formats zero as $0/yr", () => {
    expect(formatEmployerCostPerYear(0)).toBe("$0/yr");
  });

  it("formats a large number with correct separators", () => {
    expect(formatEmployerCostPerYear(1000000)).toBe("$1,000,000/yr");
  });

  it("returns -- for null", () => {
    expect(formatEmployerCostPerYear(null)).toBe("--");
  });

  it("returns -- for undefined", () => {
    expect(formatEmployerCostPerYear(undefined)).toBe("--");
  });

  it("returns -- for a negative number", () => {
    expect(formatEmployerCostPerYear(-500)).toBe("--");
  });
});

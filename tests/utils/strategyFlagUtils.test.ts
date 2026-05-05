import { describe, it, expect } from "vitest";
import { normaliseFlag } from "@/utils/strategyFlagUtils";

describe("normaliseFlag", () => {
  describe("valid string values pass through", () => {
    it('returns "green" for input "green"', () => {
      expect(normaliseFlag("green")).toBe("green");
    });

    it('returns "yellow" for input "yellow"', () => {
      expect(normaliseFlag("yellow")).toBe("yellow");
    });

    it('returns "hidden" for input "hidden"', () => {
      expect(normaliseFlag("hidden")).toBe("hidden");
    });
  });

  describe("invalid / unknown values → hidden", () => {
    it('returns "hidden" for boolean true (legacy API shape)', () => {
      expect(normaliseFlag(true)).toBe("hidden");
    });

    it('returns "hidden" for boolean false (legacy API shape)', () => {
      expect(normaliseFlag(false)).toBe("hidden");
    });

    it('returns "hidden" for null', () => {
      expect(normaliseFlag(null)).toBe("hidden");
    });

    it('returns "hidden" for undefined', () => {
      expect(normaliseFlag(undefined)).toBe("hidden");
    });

    it('returns "hidden" for an unrecognised string', () => {
      expect(normaliseFlag("active")).toBe("hidden");
    });

    it('returns "hidden" for a number', () => {
      expect(normaliseFlag(1)).toBe("hidden");
    });

    it('returns "hidden" for an empty string', () => {
      expect(normaliseFlag("")).toBe("hidden");
    });

    it('returns "hidden" for an object', () => {
      expect(normaliseFlag({ status: "green" })).toBe("hidden");
    });
  });
});

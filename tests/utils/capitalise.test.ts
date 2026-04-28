import { describe, it, expect } from "vitest";
import { capitalise } from "@/utils/capitalise";

describe("capitalise", () => {
  it("capitalises first letter", () => expect(capitalise("january")).toBe("January"));
  it("lowercases rest", () => expect(capitalise("APRIL")).toBe("April"));
  it("returns empty for empty", () => expect(capitalise("")).toBe(""));
  it("single char", () => expect(capitalise("a")).toBe("A"));
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError } from "axios";
import { getAuthToken, getErrorMessage } from "@/services/api/apiUtils";

beforeEach(() => {
  vi.stubGlobal("localStorage", {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  });
});

describe("getAuthToken", () => {
  it("returns token from localStorage", () => {
    (localStorage.getItem as any).mockReturnValue(
      JSON.stringify({ auth: { tokens: { accessToken: "tok123" } } })
    );
    expect(getAuthToken()).toBe("tok123");
  });

  it("returns null when no localStorage data", () => {
    expect(getAuthToken()).toBeNull();
  });

  it("returns null on invalid JSON", () => {
    (localStorage.getItem as any).mockReturnValue("{bad");
    expect(getAuthToken()).toBeNull();
  });
});

describe("getErrorMessage", () => {
  it("extracts message from axios response", () => {
    const err = new AxiosError("fail", "ERR", undefined, undefined, {
      status: 400,
      data: { message: "Bad input" },
      statusText: "Bad Request",
      headers: {},
      config: {} as any,
    });
    expect(getErrorMessage(err)).toBe("Bad input");
  });

  it("handles ECONNABORTED", () => {
    const err = new AxiosError("timeout", "ECONNABORTED");
    expect(getErrorMessage(err)).toContain("timed out");
  });

  it("falls back to axios message", () => {
    const err = new AxiosError("Network Error", "ERR_NETWORK");
    expect(getErrorMessage(err)).toBe("Network Error");
  });

  it("handles non-axios error", () => {
    expect(getErrorMessage(new Error("oops"))).toContain("unexpected");
  });

  it("handles non-error value", () => {
    expect(getErrorMessage("string")).toContain("unexpected");
  });
});

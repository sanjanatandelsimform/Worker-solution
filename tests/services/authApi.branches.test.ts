/**
 * Additional branch tests for authApi
 * Targets uncovered branches in signout, setTokens, checkEmailAvailability, forgotPassword, resetPassword
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();
const mockApi = {
  get: mockGet,
  post: mockPost,
  put: mockPut,
  delete: mockDelete,
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
  defaults: { headers: { common: {} } },
};

vi.mock("axios", async () => {
  const actual = await vi.importActual("axios");
  return {
    ...actual,
    default: {
      ...(actual as any).default,
      create: vi.fn(() => mockApi),
      isAxiosError: (actual as any).default.isAxiosError,
    },
  };
});

vi.mock("@/services/api/apiUtils", () => ({
  getAuthToken: vi.fn(() => "mock-token"),
  getErrorMessage: vi.fn((e: any) => e?.message || "Unknown error"),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("localStorage", {
    getItem: vi.fn(() =>
      JSON.stringify({ auth: { tokens: { accessToken: "at", refreshToken: "rt" } } })
    ),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  });
});

describe("authApi - additional branches", () => {
  // ── signout branches ───────────────────────────────────────────────────────
  it("signout without token reads from localStorage", async () => {
    mockPost.mockResolvedValueOnce({});
    const { signout } = await import("@/services/api/authApi");
    await signout(); // no token provided
    expect(localStorage.getItem).toHaveBeenCalledWith("userDetail");
  });

  it("signout without token and no localStorage entry still calls logout", async () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValueOnce(null);
    mockPost.mockResolvedValueOnce({});
    const { signout } = await import("@/services/api/authApi");
    await signout();
    expect(mockPost).toHaveBeenCalledWith("/auth/logout", {}, { headers: {} });
  });

  it("signout throws when POST request fails", async () => {
    mockPost.mockRejectedValueOnce(new Error("Logout failed"));
    const { signout } = await import("@/services/api/authApi");
    await expect(signout("some-token")).rejects.toThrow();
  });

  // ── checkEmailAvailability branches ──────────────────────────────────────
  it("checkEmailAvailability throws on network error", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network Error"));
    const { checkEmailAvailability } = await import("@/services/api/authApi");
    await expect(checkEmailAvailability("test@test.com")).rejects.toThrow();
  });

  it("checkEmailAvailability returns false when not available", async () => {
    mockGet.mockResolvedValueOnce({ data: { available: false } });
    const { checkEmailAvailability } = await import("@/services/api/authApi");
    const result = await checkEmailAvailability("taken@test.com");
    expect(result).toBe(false);
  });

  // ── forgotPassword branches ───────────────────────────────────────────────
  it("forgotPassword throws on API failure", async () => {
    mockPost.mockRejectedValueOnce(new Error("API error"));
    const { forgotPassword } = await import("@/services/api/authApi");
    await expect(forgotPassword("test@test.com")).rejects.toThrow();
  });

  it("forgotPassword returns empty object when no message", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    const { forgotPassword } = await import("@/services/api/authApi");
    const result = await forgotPassword("test@test.com");
    expect(result).toEqual({});
  });

  // ── resetPassword branches ────────────────────────────────────────────────
  it("resetPassword throws on API failure", async () => {
    mockPost.mockRejectedValueOnce(new Error("Reset failed"));
    const { resetPassword } = await import("@/services/api/authApi");
    await expect(resetPassword("bad-token", "newPass")).rejects.toThrow();
  });

  // ── setTokens branches ────────────────────────────────────────────────────
  it("setTokens does nothing when localStorage has no userDetail", async () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValueOnce(null);
    const { setTokens } = await import("@/services/api/authApi");
    setTokens({ accessToken: "new-at", refreshToken: "new-rt" });
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it("setTokens updates when userDetail exists", async () => {
    const { setTokens } = await import("@/services/api/authApi");
    setTokens({ accessToken: "new-at", refreshToken: "new-rt" });
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "userDetail",
      expect.stringContaining("new-at")
    );
  });

  // ── getIndustries edge cases ──────────────────────────────────────────────
  it("getIndustries throws when industries is null", async () => {
    mockGet.mockResolvedValueOnce({ data: { data: { industries: null } } });
    const { getIndustries } = await import("@/services/api/authApi");
    await expect(getIndustries()).rejects.toThrow();
  });

  // ── refreshAccessToken storage edge case ─────────────────────────────────
  it("refreshAccessToken returns tokens even if localStorage update fails", async () => {
    (localStorage.setItem as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw new Error("Storage quota exceeded");
    });
    mockPost.mockResolvedValueOnce({
      data: { data: { tokens: { accessToken: "new-at", refreshToken: "new-rt" } } },
    });
    const { refreshAccessToken } = await import("@/services/api/authApi");
    const result = await refreshAccessToken("old-rt");
    expect(result).toEqual({ accessToken: "new-at", refreshToken: "new-rt" });
  });

  // ── signin edge case ─────────────────────────────────────────────────────
  it("signin with axios error having no message uses default", async () => {
    const { AxiosError } = await import("axios");
    const err = new AxiosError("fail", "ERR", undefined, undefined, {
      status: 401,
      data: {},
      statusText: "Unauthorized",
      headers: {},
      config: {} as any,
    });
    mockPost.mockRejectedValueOnce(err);
    const { signin } = await import("@/services/api/authApi");
    const result = await signin({ businessEmail: "a@b.com", password: "wrong" });
    expect(result.status).toBe("error");
    expect(result.message).toBe("Incorrect email or password");
  });
});

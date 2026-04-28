import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

// Mock axios.create
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockApi = {
  get: mockGet,
  post: mockPost,
  interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
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
  getAuthToken: vi.fn(() => "tok"),
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

describe("authApi", () => {
  it("refreshAccessToken returns tokens on success", async () => {
    mockPost.mockResolvedValue({
      data: { data: { tokens: { accessToken: "new-at", refreshToken: "new-rt" } } },
    });
    const { refreshAccessToken } = await import("@/services/api/authApi");
    const tokens = await refreshAccessToken("old-rt");
    expect(tokens).toEqual({ accessToken: "new-at", refreshToken: "new-rt" });
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it("refreshAccessToken throws on invalid response", async () => {
    mockPost.mockResolvedValue({ data: { data: { tokens: {} } } });
    const { refreshAccessToken } = await import("@/services/api/authApi");
    await expect(refreshAccessToken("rt")).rejects.toThrow();
  });

  it("refreshAccessToken clears storage on failure", async () => {
    mockPost.mockRejectedValue(new Error("fail"));
    const { refreshAccessToken } = await import("@/services/api/authApi");
    await expect(refreshAccessToken("rt")).rejects.toThrow();
    expect(localStorage.removeItem).toHaveBeenCalledWith("userDetail");
  });

  it("signup sends registration data", async () => {
    mockPost.mockResolvedValue({
      data: { data: { user: { id: "1" }, tokens: { accessToken: "a", refreshToken: "r" } } },
    });
    const { signup } = await import("@/services/api/authApi");
    const result = await signup({
      firstName: "Jane",
      lastName: "Doe",
      businessName: "Acme",
      businessEmail: "j@a.com",
      businessPhone: "1234567890",
      industry: "Tech",
      zipCode: "90210",
      password: "Pass1!",
      confirmPassword: "Pass1!",
    });
    expect(result.user).toBeDefined();
  });

  it("signup throws on error", async () => {
    mockPost.mockRejectedValue(new Error("Email taken"));
    const { signup } = await import("@/services/api/authApi");
    await expect(signup({} as any)).rejects.toThrow();
  });

  it("signin returns data on success", async () => {
    mockPost.mockResolvedValue({
      data: { status: true, message: "OK", data: { user: { id: "1" }, tokens: {} } },
    });
    const { signin } = await import("@/services/api/authApi");
    const result = await signin({ businessEmail: "a@b.com", password: "pass" });
    expect(result.status).toBe(true);
  });

  it("signin returns error status on failure", async () => {
    const err = new axios.AxiosError("fail", "ERR", undefined, undefined, {
      status: 401,
      data: { message: "Wrong password" },
      statusText: "Unauthorized",
      headers: {},
      config: {} as any,
    });
    mockPost.mockRejectedValue(err);
    const { signin } = await import("@/services/api/authApi");
    const result = await signin({ businessEmail: "a@b.com", password: "wrong" });
    expect(result.status).toBe("error");
  });

  it("signout calls logout endpoint", async () => {
    mockPost.mockResolvedValue({});
    const { signout } = await import("@/services/api/authApi");
    await signout("token");
    expect(mockPost).toHaveBeenCalled();
  });

  it("signout reads token from localStorage when not provided", async () => {
    mockPost.mockResolvedValue({});
    const { signout } = await import("@/services/api/authApi");
    await signout();
    expect(localStorage.getItem).toHaveBeenCalled();
  });

  it("checkEmailAvailability returns boolean", async () => {
    mockGet.mockResolvedValue({ data: { available: true } });
    const { checkEmailAvailability } = await import("@/services/api/authApi");
    const result = await checkEmailAvailability("test@test.com");
    expect(result).toBe(true);
  });

  it("forgotPassword sends email", async () => {
    mockPost.mockResolvedValue({ data: { message: "Email sent" } });
    const { forgotPassword } = await import("@/services/api/authApi");
    const result = await forgotPassword("test@test.com");
    expect(result.message).toBe("Email sent");
  });

  it("resetPassword sends token and new password", async () => {
    mockPost.mockResolvedValue({ data: { message: "Reset successful" } });
    const { resetPassword } = await import("@/services/api/authApi");
    const result = await resetPassword("reset-token", "NewPass1!");
    expect(result.message).toBe("Reset successful");
  });

  it("verifyEmail returns user and tokens", async () => {
    mockPost.mockResolvedValue({
      data: {
        message: "Verified",
        data: { user: { id: "1", emailVerify: true }, tokens: { accessToken: "at" } },
      },
    });
    const { verifyEmail } = await import("@/services/api/authApi");
    const result = await verifyEmail("verify-token");
    expect(result.message).toBe("Verified");
    expect(result.user?.emailVerify).toBe(true);
  });

  it("verifyEmail throws on failure", async () => {
    mockPost.mockRejectedValue(new Error("Invalid token"));
    const { verifyEmail } = await import("@/services/api/authApi");
    await expect(verifyEmail("bad-token")).rejects.toThrow("Failed to verify email");
  });

  it("setTokens updates localStorage", async () => {
    const { setTokens } = await import("@/services/api/authApi");
    setTokens({ accessToken: "new-at", refreshToken: "new-rt" });
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it("getIndustries returns industries", async () => {
    mockGet.mockResolvedValue({
      data: { data: { industries: [{ id: 1, name: "Tech" }] } },
    });
    const { getIndustries } = await import("@/services/api/authApi");
    const result = await getIndustries();
    expect(result.data.industries).toHaveLength(1);
  });

  it("getIndustries throws on empty response", async () => {
    mockGet.mockResolvedValue({ data: { data: { industries: [] } } });
    const { getIndustries } = await import("@/services/api/authApi");
    await expect(getIndustries()).rejects.toThrow();
  });
});

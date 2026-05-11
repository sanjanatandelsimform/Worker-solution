/**
 * Tests for assessmentApi interceptor callbacks
 * Covers request interceptor (getAuthToken logic) and response interceptor (401 refresh logic)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Track interceptor callbacks
let requestInterceptorSuccess: ((config: any) => any) | null = null;
let requestInterceptorError: ((err: any) => Promise<any>) | null = null;
let responseInterceptorError: ((error: any) => Promise<any>) | null = null;
let responseInterceptorSuccess: ((response: any) => any) | null = null;

// The refreshClient (axios.create inside doRefreshToken) will use this mock
const refreshClientPost = vi.fn();

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockRetryCall = vi.fn().mockResolvedValue({ data: { success: true } });

// Create a callable mockApiInstance that also has method properties
const mockApiInstance: any = Object.assign((...args: any[]) => mockRetryCall(...args), {
  get: mockGet,
  post: mockPost,
  interceptors: {
    request: {
      use: vi.fn((success: (config: any) => any, error: (err: any) => any) => {
        requestInterceptorSuccess = success;
        requestInterceptorError = error;
        return 0;
      }),
    },
    response: {
      use: vi.fn((success: (r: any) => any, error: (e: any) => Promise<any>) => {
        responseInterceptorSuccess = success;
        responseInterceptorError = error;
        return 0;
      }),
    },
  },
  defaults: { headers: { common: {} } },
});

vi.mock("axios", async () => {
  const actual = await vi.importActual("axios");
  const createCallCount = { n: 0 };
  return {
    ...actual,
    default: {
      ...(actual as any).default,
      create: vi.fn(() => {
        createCallCount.n++;
        if (createCallCount.n === 1) {
          // First create: the main api instance (in assessmentApi.ts)
          return mockApiInstance;
        }
        // Subsequent creates: the plain refresh client inside doRefreshToken
        return {
          post: refreshClientPost,
        };
      }),
      isAxiosError: (actual as any).default.isAxiosError,
    },
  };
});

vi.mock("@/services/api/authApi", () => ({
  default: {
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

// Mock dispatchLogoutAndRedirect: in production it returns a never-resolving
// promise and navigates away.  In tests we return a rejected promise so that
// test assertions (`rejects`) still work without hanging.
// All other tokenRefresh exports (isRefreshing, failedQueue, processQueue, setIsRefreshing,
// doRefreshToken) are kept as real implementations so the counter trick for axios.create still works.
vi.mock("@/services/api/tokenRefresh", async importOriginal => {
  const actual = await importOriginal<typeof import("@/services/api/tokenRefresh")>();
  return {
    ...actual,
    dispatchLogoutAndRedirect: vi.fn(() => Promise.reject(new Error("session_expired_redirect"))),
  };
});

// Load the module to register interceptors
await import("@/services/api/assessmentApi");
const { setRefreshFailed } = await import("@/services/api/tokenRefresh");

beforeEach(() => {
  vi.clearAllMocks();
  mockGet.mockReset();
  mockPost.mockReset();
  refreshClientPost.mockReset();
  setRefreshFailed(false);
  vi.stubGlobal("localStorage", {
    getItem: vi.fn((key: string) => {
      if (key === "userDetail") {
        return JSON.stringify({ auth: { tokens: { accessToken: "at", refreshToken: "rt" } } });
      }
      return null;
    }),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  });
  delete (window as any).store;
});

describe("assessmentApi - request interceptor", () => {
  it("attaches Authorization header from localStorage", () => {
    const config = { headers: {} };
    const result = requestInterceptorSuccess?.(config);
    expect(result?.headers.Authorization).toBe("Bearer at");
  });

  it("logs warning when no token found", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    const config = { headers: {} };
    requestInterceptorSuccess?.(config);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("No auth token found"));
    consoleSpy.mockRestore();
  });

  it("reads token from window.store when available", () => {
    (window as any).store = {
      getState: () => ({ auth: { tokens: { accessToken: "store-token" } } }),
    };
    const config = { headers: {} };
    const result = requestInterceptorSuccess?.(config);
    expect(result?.headers.Authorization).toBe("Bearer store-token");
  });

  it("falls back to auth_token in localStorage", () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockImplementation((key: string) => {
      if (key === "userDetail") return null;
      if (key === "auth_token") return "fallback-token";
      return null;
    });
    const config = { headers: {} };
    const result = requestInterceptorSuccess?.(config);
    expect(result?.headers.Authorization).toBe("Bearer fallback-token");
  });

  it("returns config without auth when getAuthToken throws", () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("Storage error");
    });
    const config = { headers: {} };
    const result = requestInterceptorSuccess?.(config);
    // Should still return config, just without Authorization
    expect(result).toBeDefined();
  });

  it("passes through request errors", async () => {
    const err = new Error("Request setup error");
    if (requestInterceptorError) {
      await expect(requestInterceptorError(err)).rejects.toEqual(err);
    }
  });
});

describe("assessmentApi - response interceptor", () => {
  it("passes through successful responses", () => {
    const response = { data: { success: true }, status: 200 };
    const result = responseInterceptorSuccess?.(response);
    expect(result).toEqual(response);
  });

  it("rejects non-401 errors without retry", async () => {
    const error = { response: { status: 500 }, config: {} };
    await expect(responseInterceptorError?.(error)).rejects.toEqual(error);
  });

  it("rejects 401 already-retried requests", async () => {
    const error = {
      response: { status: 401 },
      config: { _retry: true },
    };
    await expect(responseInterceptorError?.(error)).rejects.toEqual(error);
  });

  it("clears session and redirects when /auth/refresh-token itself returns 401 (expired refresh token)", async () => {
    const error = {
      response: {
        status: 401,
        data: { status: "error", message: "Invalid or expired token" },
      },
      config: { _retry: false, url: "/auth/refresh-token", headers: {} },
    };
    await expect(responseInterceptorError?.(error)).rejects.toBeDefined();
    // Must remove session data immediately — no further retry should happen
    expect(localStorage.removeItem).toHaveBeenCalledWith("userDetail");
  });

  it("clears session and redirects when full refresh-token URL returns 401", async () => {
    const error = {
      response: { status: 401 },
      config: {
        _retry: false,
        url: "https://dev-api.benestats.com/api/v1/auth/refresh-token",
        headers: {},
      },
    };
    await expect(responseInterceptorError?.(error)).rejects.toBeDefined();
    expect(localStorage.removeItem).toHaveBeenCalledWith("userDetail");
  });

  it("rejects 401 when no localStorage data", async () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    const error = {
      response: { status: 401 },
      config: { _retry: false, headers: {} },
    };
    await expect(responseInterceptorError?.(error)).rejects.toBeDefined();
    expect(localStorage.removeItem).toHaveBeenCalledWith("userDetail");
  });

  it("rejects 401 when localStorage has no refresh token", async () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      JSON.stringify({ auth: { tokens: {} } })
    );
    const error = {
      response: { status: 401 },
      config: { _retry: false, headers: {} },
    };
    await expect(responseInterceptorError?.(error)).rejects.toBeDefined();
    expect(localStorage.removeItem).toHaveBeenCalledWith("userDetail");
  });

  it("handles refresh token failure: clears queue and rejects", async () => {
    refreshClientPost.mockRejectedValueOnce(new Error("Token refresh failed"));

    const error = {
      response: { status: 401 },
      config: { _retry: false, headers: {} },
    };
    await expect(responseInterceptorError?.(error)).rejects.toBeDefined();
  });

  it("handles malformed localStorage JSON", async () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValueOnce("not-json");
    const error = {
      response: { status: 401 },
      config: { _retry: false, headers: {} },
    };
    // JSON.parse throws, which is caught internally
    await expect(responseInterceptorError?.(error)).rejects.toBeDefined();
  });

  it("handles refresh with invalid token response", async () => {
    refreshClientPost.mockResolvedValueOnce({
      data: { data: { tokens: {} } }, // missing accessToken and refreshToken
    });

    const error = {
      response: { status: 401 },
      config: { _retry: false, headers: {} },
    };
    await expect(responseInterceptorError?.(error)).rejects.toBeDefined();
    expect(localStorage.removeItem).toHaveBeenCalledWith("userDetail");
  });

  it("successful refresh: retries original request with new token", async () => {
    refreshClientPost.mockResolvedValueOnce({
      data: { data: { tokens: { accessToken: "new-at", refreshToken: "new-rt" } } },
    });
    mockRetryCall.mockResolvedValueOnce({ data: { success: true } });

    const error = {
      response: { status: 401 },
      config: { _retry: false, headers: { Authorization: "Bearer old-at" } },
    };

    const result = await responseInterceptorError?.(error);
    expect(mockRetryCall).toHaveBeenCalled();
  });

  it("successful refresh: updates localStorage with new tokens", async () => {
    refreshClientPost.mockResolvedValueOnce({
      data: { data: { tokens: { accessToken: "tok-a", refreshToken: "tok-r" } } },
    });
    mockRetryCall.mockResolvedValueOnce({ data: {} });

    const error = {
      response: { status: 401 },
      config: { _retry: false, headers: {} },
    };

    await responseInterceptorError?.(error).catch(() => {});
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "userDetail",
      expect.stringContaining("tok-a")
    );
  });

  it("successful refresh: syncs tokens to Redux store when window.store is set", async () => {
    const mockDispatch = vi.fn();
    (window as any).store = { dispatch: mockDispatch };

    refreshClientPost.mockResolvedValueOnce({
      data: { data: { tokens: { accessToken: "redux-at", refreshToken: "redux-rt" } } },
    });
    mockRetryCall.mockResolvedValueOnce({ data: {} });

    const error = {
      response: { status: 401 },
      config: { _retry: false, headers: { Authorization: "Bearer old" } },
    };

    await responseInterceptorError?.(error).catch(() => {});
    expect(mockDispatch).toHaveBeenCalled();

    delete (window as any).store;
  });

  it("successful refresh: catches localStorage setItem error gracefully", async () => {
    (localStorage.setItem as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw new Error("QuotaExceededError");
    });

    refreshClientPost.mockResolvedValueOnce({
      data: { data: { tokens: { accessToken: "quota-at", refreshToken: "quota-rt" } } },
    });
    mockRetryCall.mockResolvedValueOnce({ data: {} });

    const error = {
      response: { status: 401 },
      config: { _retry: false, headers: {} },
    };

    // Should not throw even if localStorage.setItem fails
    await expect(responseInterceptorError?.(error)).resolves.toBeDefined();
  });

  it("skips refresh and redirects immediately when refreshFailed flag is set", async () => {
    // Simulate a previous refresh failure
    setRefreshFailed(true);

    const error = {
      response: { status: 401 },
      config: { _retry: false, headers: {} },
    };

    // Should redirect immediately without calling POST /auth/refresh-token
    await expect(responseInterceptorError?.(error)).rejects.toBeDefined();
    expect(refreshClientPost).not.toHaveBeenCalled();
  });
});

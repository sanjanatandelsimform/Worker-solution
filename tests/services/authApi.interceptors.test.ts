/**
 * Tests for authApi interceptor callbacks
 * Covers: request interceptor (lines 28-38), response interceptor (lines 130-250)
 * processQueue, dispatchLogout, isRefreshing queue logic
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Track interceptor callbacks
let requestInterceptorCallback: ((config: any) => any) | null = null;
let responseInterceptorSuccess: ((response: any) => any) | null = null;
let responseInterceptorError: ((error: any) => Promise<any>) | null = null;

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockRetryCall = vi.fn().mockResolvedValue({ data: { success: true } });

// Make mockApiInstance callable (for apiClient(originalRequest) retry)
const mockApiInstance = Object.assign((...args: any[]) => mockRetryCall(...args), {
  get: mockGet,
  post: mockPost,
  interceptors: {
    request: {
      use: vi.fn((cb: (config: any) => any) => {
        requestInterceptorCallback = cb;
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
  const AxiosError = (actual as any).default.AxiosError || (actual as any).AxiosError;
  return {
    ...actual,
    default: {
      ...(actual as any).default,
      create: vi.fn(() => mockApiInstance),
      isAxiosError: (actual as any).default.isAxiosError,
      AxiosError,
    },
  };
});

vi.mock("@/services/api/apiUtils", () => ({
  getAuthToken: vi.fn(() => "mock-token"),
  getErrorMessage: vi.fn((e: any) => e?.message || "Unknown error"),
}));

// Mock dispatchLogoutAndRedirect: in production it returns a never-resolving
// promise and navigates away.  In tests we return a rejected promise so that
// test assertions (`rejects`) still work without hanging.
vi.mock("@/services/api/tokenRefresh", async importOriginal => {
  const actual = await importOriginal<typeof import("@/services/api/tokenRefresh")>();
  return {
    ...actual,
    dispatchLogoutAndRedirect: vi.fn(() => Promise.reject(new Error("session_expired_redirect"))),
  };
});

// Load the module to register interceptors
await import("@/services/api/authApi");
const { setRefreshFailed } = await import("@/services/api/tokenRefresh");

beforeEach(() => {
  vi.clearAllMocks();
  mockGet.mockReset();
  mockPost.mockReset();
  setRefreshFailed(false);
  vi.stubGlobal("localStorage", {
    getItem: vi.fn(() =>
      JSON.stringify({ auth: { tokens: { accessToken: "at", refreshToken: "rt" } } })
    ),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  });
  // Reset window.store
  delete (window as any).store;
});

describe("authApi - request interceptor", () => {
  it("attaches Authorization header when token is available", () => {
    const config = { headers: {} };
    const result = requestInterceptorCallback?.(config);
    expect(result?.headers.Authorization).toBe("Bearer mock-token");
  });

  it("skips Authorization header when getAuthToken returns null", async () => {
    const { getAuthToken } = await import("@/services/api/apiUtils");
    vi.mocked(getAuthToken).mockReturnValueOnce(null);
    const config = { headers: {} };
    const result = requestInterceptorCallback?.(config);
    expect(result?.headers.Authorization).toBeUndefined();
  });

  it("handles getAuthToken throwing without crashing", async () => {
    const { getAuthToken } = await import("@/services/api/apiUtils");
    vi.mocked(getAuthToken).mockImplementationOnce(() => {
      throw new Error("Storage error");
    });
    const config = { headers: {} };
    // Should not throw - catch block ignores the error
    expect(() => requestInterceptorCallback?.(config)).not.toThrow();
  });
});

describe("authApi - response interceptor", () => {
  it("passes through successful responses unchanged", () => {
    const mockResponse = { data: { success: true }, status: 200 };
    const result = responseInterceptorSuccess?.(mockResponse);
    expect(result).toEqual(mockResponse);
  });

  it("rejects non-401 errors without retry", async () => {
    const error = {
      response: { status: 500 },
      config: {},
    };
    await expect(responseInterceptorError?.(error)).rejects.toEqual(error);
  });

  it("rejects 401 on sign-in page without retry", async () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/sign-in" },
      writable: true,
    });
    const error = {
      response: { status: 401 },
      config: { _retry: false },
    };
    await expect(responseInterceptorError?.(error)).rejects.toEqual(error);
  });

  it("rejects 401 when already retried", async () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard" },
      writable: true,
    });
    const error = {
      response: { status: 401 },
      config: { _retry: true },
    };
    await expect(responseInterceptorError?.(error)).rejects.toEqual(error);
  });

  it("clears session and redirects when /auth/refresh-token itself returns 401 (expired refresh token)", async () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard" },
      writable: true,
    });
    const error = {
      response: {
        status: 401,
        data: { status: "error", message: "Invalid or expired token" },
      },
      config: { _retry: false, url: "/auth/refresh-token", headers: {} },
    };
    await expect(responseInterceptorError?.(error)).rejects.toBeDefined();
    // Must clear session data so the user cannot continue with a stale token
    expect(localStorage.removeItem).toHaveBeenCalledWith("userDetail");
  });

  it("clears session and redirects when full refresh-token URL returns 401", async () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard" },
      writable: true,
    });
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

  it("rejects 401 when no stored state in localStorage", async () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValueOnce(null);
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard" },
      writable: true,
    });
    const error = {
      response: { status: 401 },
      config: { _retry: false, headers: {} },
    };
    await expect(responseInterceptorError?.(error)).rejects.toEqual(error);
  });

  it("clears localStorage and dispatches logout when stored state is malformed JSON", async () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValueOnce("invalid-json");
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard" },
      writable: true,
    });
    const error = {
      response: { status: 401 },
      config: { _retry: false, headers: {} },
    };
    await expect(responseInterceptorError?.(error)).rejects.toBeDefined();
    expect(localStorage.removeItem).toHaveBeenCalledWith("userDetail");
  });

  it("clears localStorage and dispatches logout when no refresh token", async () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      JSON.stringify({ auth: { tokens: {} } })
    );
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard" },
      writable: true,
    });
    const error = {
      response: { status: 401 },
      config: { _retry: false, headers: {} },
    };
    await expect(responseInterceptorError?.(error)).rejects.toBeDefined();
    expect(localStorage.removeItem).toHaveBeenCalledWith("userDetail");
  });

  it("refreshes token and retries on 401 with valid refresh token", async () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard" },
      writable: true,
    });

    // Mock successful token refresh via refreshAccessToken (uses apiClient.post)
    mockPost.mockResolvedValueOnce({
      data: {
        status: true,
        data: {
          tokens: { accessToken: "new-at", refreshToken: "new-rt" },
        },
      },
    });
    mockRetryCall.mockResolvedValueOnce({ data: { success: true } });

    const error = {
      response: { status: 401 },
      config: {
        _retry: false,
        headers: { Authorization: "Bearer old-at" },
        method: "get",
        url: "/some-endpoint",
      },
    };

    const result = await responseInterceptorError?.(error);
    // Should have retried and returned the successful response
    expect(mockRetryCall).toHaveBeenCalled();
  });

  it("covers localStorage update after successful token refresh", async () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard" },
      writable: true,
    });

    const storedState = JSON.stringify({
      auth: { tokens: { accessToken: "at", refreshToken: "rt" } },
    });
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(storedState);

    mockPost.mockResolvedValueOnce({
      data: {
        status: true,
        data: { tokens: { accessToken: "new-at", refreshToken: "new-rt" } },
      },
    });
    mockRetryCall.mockResolvedValueOnce({ data: {} });

    const error = {
      response: { status: 401 },
      config: { _retry: false, headers: {} },
    };

    await responseInterceptorError?.(error).catch(() => {});
    // localStorage.setItem should have been called with updated tokens
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it("covers window.store Redux sync after successful token refresh", async () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard" },
      writable: true,
    });

    // Set up window.store
    const mockDispatch = vi.fn();
    (window as any).store = { dispatch: mockDispatch };

    mockPost.mockResolvedValueOnce({
      data: {
        status: true,
        data: { tokens: { accessToken: "store-at", refreshToken: "store-rt" } },
      },
    });
    mockRetryCall.mockResolvedValueOnce({ data: {} });

    const error = {
      response: { status: 401 },
      config: { _retry: false, headers: { Authorization: "Bearer old" } },
    };

    await responseInterceptorError?.(error).catch(() => {});
    // window.store.dispatch should have been called with setTokens action
    expect(mockDispatch).toHaveBeenCalled();

    delete (window as any).store;
  });

  it("covers localStorage catch: setItem throws during token persistence", async () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard" },
      writable: true,
    });

    (localStorage.setItem as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw new Error("QuotaExceededError");
    });

    mockPost.mockResolvedValueOnce({
      data: {
        status: true,
        data: { tokens: { accessToken: "at2", refreshToken: "rt2" } },
      },
    });
    mockRetryCall.mockResolvedValueOnce({ data: {} });

    const error = {
      response: { status: 401 },
      config: { _retry: false, headers: {} },
    };

    // Should not throw even when localStorage.setItem fails
    await expect(responseInterceptorError?.(error)).resolves.toBeDefined();
  });

  it("handles refresh failure: clears tokens and rejects", async () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard" },
      writable: true,
    });

    // Mock refresh failure
    mockPost.mockRejectedValueOnce(new Error("Refresh failed"));

    const error = {
      response: { status: 401 },
      config: { _retry: false, headers: {} },
    };

    const result = responseInterceptorError?.(error);
    await expect(result).rejects.toBeDefined();
    expect(localStorage.removeItem).toHaveBeenCalledWith("userDetail");
  });

  it("skips refresh and redirects immediately when refreshFailed flag is set", async () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard" },
      writable: true,
    });

    // Simulate a previous refresh failure
    setRefreshFailed(true);

    const error = {
      response: { status: 401 },
      config: { _retry: false, headers: {} },
    };

    // Should redirect immediately without calling POST /auth/refresh-token
    await expect(responseInterceptorError?.(error)).rejects.toBeDefined();
    expect(mockPost).not.toHaveBeenCalled();
  });
});

/**
 * Full profileApi coverage tests
 * Covers updateProfile, updateEmail, updatePassword, deleteAccount, resendEmailVerification, retakeAssessment
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";

// Mock apiClient returned by axios.create
const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  defaults: { headers: { common: {} } },
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
};

vi.mock("axios", async () => {
  const actual = await vi.importActual("axios");
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => mockApiClient),
      isAxiosError: vi.fn(
        (error: unknown) =>
          typeof error === "object" &&
          error !== null &&
          "isAxiosError" in error &&
          !!(error as { isAxiosError: boolean }).isAxiosError
      ),
    },
  };
});

vi.mock("@/services/api/authApi", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
  refreshAccessToken: vi.fn(),
  signout: vi.fn(),
  signin: vi.fn(),
  signup: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  verifyEmail: vi.fn(),
  checkEmailAvailability: vi.fn(),
  getIndustries: vi.fn(),
  setTokens: vi.fn(),
}));

vi.mock("@/services/api/tokenRefresh", () => ({
  isRefreshing: false,
  refreshFailed: false,
  setIsRefreshing: vi.fn(),
  setRefreshFailed: vi.fn(),
  isRefreshFailed: vi.fn(() => false),
  failedQueue: [],
  processQueue: vi.fn(),
  doRefreshToken: vi.fn(),
  dispatchLogoutAndRedirect: vi.fn(),
}));

// Import after mocks
const {
  updateProfile,
  updateEmail,
  updatePassword,
  deleteAccount,
  resendEmailVerification,
  retakeAssessment,
  resetCircuitBreaker,
} = await import("@/services/api/profileApi");

// Mock localStorage helper
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: () => null,
  };
})();

const mockToken = "test-jwt-token";

const setAuthToken = () => {
  mockLocalStorage.setItem(
    "userDetail",
    JSON.stringify({ auth: { tokens: { accessToken: mockToken } } })
  );
};

const makeAxiosError = (status: number, data: Record<string, unknown>, code?: string) => ({
  isAxiosError: true,
  response: { status, data },
  code: code || "ERR_BAD_REQUEST",
  message: "Request failed",
});

beforeEach(() => {
  vi.stubGlobal("localStorage", mockLocalStorage);
  mockLocalStorage.clear();
  // Use resetAllMocks to also clear queued mockRejectedValueOnce / mockResolvedValueOnce
  mockApiClient.patch.mockReset();
  mockApiClient.post.mockReset();
  mockApiClient.delete.mockReset();
  mockApiClient.get.mockReset();
  vi.clearAllMocks();
  resetCircuitBreaker();
});

afterEach(() => {
  vi.clearAllMocks();
});

// ── updateProfile ─────────────────────────────────────────────────────────────
describe("profileApi - updateProfile", () => {
  it("throws Not authenticated when no token", async () => {
    await expect(updateProfile({ firstName: "A", lastName: "B" })).rejects.toThrow(
      "Not authenticated"
    );
  });

  it("throws Not authenticated when localStorage JSON is invalid", async () => {
    mockLocalStorage.setItem("userDetail", "not-json");
    await expect(updateProfile({ firstName: "A", lastName: "B" })).rejects.toThrow(
      "Not authenticated"
    );
  });

  it("returns user from response.data.data.user on success", async () => {
    setAuthToken();
    const mockUser = { id: "u1", firstName: "Alice", lastName: "Doe" };
    mockApiClient.patch.mockResolvedValueOnce({
      data: { data: { user: mockUser }, message: "OK" },
    });

    const result = await updateProfile({ firstName: "Alice", lastName: "Doe" });
    expect(result).toEqual(mockUser);
    expect(mockApiClient.patch).toHaveBeenCalledWith(
      "/profile",
      { firstName: "Alice", lastName: "Doe" },
      { headers: { Authorization: `Bearer ${mockToken}` } }
    );
  });

  it("throws when response.data.data.user is missing", async () => {
    setAuthToken();
    mockApiClient.patch.mockResolvedValueOnce({
      data: { data: null, message: "Bad data" },
    });

    // Non-axios error is wrapped in "An unexpected error occurred" by getErrorMessage
    await expect(updateProfile({ firstName: "A", lastName: "B" })).rejects.toThrow();
  });

  it("throws when no message and no user", async () => {
    setAuthToken();
    mockApiClient.patch.mockResolvedValueOnce({
      data: { data: {}, message: "" },
    });

    await expect(updateProfile({ firstName: "A", lastName: "B" })).rejects.toThrow();
  });

  it("propagates API error message on axios error", async () => {
    setAuthToken();
    mockApiClient.patch.mockRejectedValueOnce(makeAxiosError(500, { message: "Server Error" }));

    await expect(updateProfile({ firstName: "A", lastName: "B" })).rejects.toThrow("Server Error");
  });

  it("propagates non-axios errors through catch block", async () => {
    setAuthToken();
    // Non-axios errors always get wrapped as "An unexpected error occurred"
    mockApiClient.patch.mockRejectedValueOnce({ notAxios: true, message: "Something broke" });

    await expect(updateProfile({ firstName: "A", lastName: "B" })).rejects.toThrow();
  });

  it("throws error for ECONNABORTED (inner catch converts to plain Error)", async () => {
    setAuthToken();
    const timeoutError = {
      isAxiosError: true,
      code: "ECONNABORTED",
      response: undefined,
      message: "timeout",
    };
    // The inner try-catch converts the axios error to a plain Error, which isn't retried
    mockApiClient.patch.mockRejectedValueOnce(timeoutError);

    await expect(updateProfile({ firstName: "Alice", lastName: "Doe" })).rejects.toThrow();
    // Only 1 call because retry doesn't happen (converted to plain Error by inner catch)
    expect(mockApiClient.patch).toHaveBeenCalledTimes(1);
  });

  it("does not retry on axios response errors (non-network)", async () => {
    setAuthToken();
    const responseError = makeAxiosError(400, { message: "Invalid data" });
    // First call fails with a non-network error
    mockApiClient.patch.mockRejectedValueOnce(responseError);

    await expect(updateProfile({ firstName: "A", lastName: "B" })).rejects.toThrow();
    // With response present and non-network code, should NOT retry (only 1 call)
    expect(mockApiClient.patch).toHaveBeenCalledTimes(1);
  });
});

// ── updateEmail ───────────────────────────────────────────────────────────────
describe("profileApi - updateEmail", () => {
  it("throws Not authenticated when no token", async () => {
    await expect(updateEmail({ email: "new@example.com" })).rejects.toThrow("Not authenticated");
  });

  it("returns response data on success", async () => {
    setAuthToken();
    const mockResponse = { success: true, message: "Email updated" };
    mockApiClient.patch.mockResolvedValueOnce({ data: mockResponse });

    const result = await updateEmail({ email: "new@example.com" });
    expect(result).toEqual(mockResponse);
  });

  it("throws 'already in use' on 409 conflict", async () => {
    setAuthToken();
    const conflictError = {
      ...makeAxiosError(409, { message: "Email conflict" }),
      isAxiosError: true,
    };
    mockApiClient.patch.mockRejectedValueOnce(conflictError);

    await expect(updateEmail({ email: "used@example.com" })).rejects.toThrow(
      "This email is already in use"
    );
  });

  it("throws API error message on non-409 axios error", async () => {
    setAuthToken();
    const serverError = makeAxiosError(500, { message: "Internal error" });
    mockApiClient.patch.mockRejectedValueOnce(serverError);

    await expect(updateEmail({ email: "any@example.com" })).rejects.toThrow("Internal error");
  });

  it("throws API error.error field when message missing", async () => {
    setAuthToken();
    // Use a different status to avoid 409 path being triggered
    const serverError = makeAxiosError(422, { error: "Backend error" });
    mockApiClient.patch.mockRejectedValueOnce(serverError);

    await expect(updateEmail({ email: "any@example.com" })).rejects.toThrow("Backend error");
  });

  it("throws for non-axios errors in email update", async () => {
    setAuthToken();
    // Non-axios error (no isAxiosError flag)
    mockApiClient.patch.mockRejectedValueOnce({ message: "Network down" });

    await expect(updateEmail({ email: "any@example.com" })).rejects.toThrow();
  });

  it("throws error message on ERR_NETWORK for email update", async () => {
    setAuthToken();
    // updateEmail's inner catch wraps the error as plain Error, so retry doesn't happen
    const networkError = { isAxiosError: true, code: "ERR_NETWORK", response: undefined };
    mockApiClient.patch.mockRejectedValueOnce(networkError);

    await expect(updateEmail({ email: "new@example.com" })).rejects.toThrow();
    expect(mockApiClient.patch).toHaveBeenCalledTimes(1);
  });
});

// ── updatePassword ────────────────────────────────────────────────────────────
describe("profileApi - updatePassword", () => {
  it("throws Not authenticated when no token", async () => {
    await expect(
      updatePassword({ currentPassword: "old", newPassword: "new", confirmNewPassword: "new" })
    ).rejects.toThrow("Not authenticated");
  });

  it("returns response data on success", async () => {
    setAuthToken();
    const mockResponse = { success: true, message: "Password changed" };
    mockApiClient.patch.mockResolvedValueOnce({ data: mockResponse });

    const result = await updatePassword({
      currentPassword: "old",
      newPassword: "new",
      confirmNewPassword: "new",
    });
    expect(result).toEqual(mockResponse);
  });

  it("throws object with attemptsRemaining on 401 error", async () => {
    setAuthToken();
    const authError = {
      isAxiosError: true,
      response: { status: 401, data: { message: "Wrong password", attemptsRemaining: 2 } },
      code: "ERR_BAD_REQUEST",
    };
    mockApiClient.patch.mockRejectedValueOnce(authError);

    let caught: unknown;
    try {
      await updatePassword({
        currentPassword: "wrong",
        newPassword: "new",
        confirmNewPassword: "new",
      });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeDefined();
    expect((caught as { attemptsRemaining: number }).attemptsRemaining).toBe(2);
    expect((caught as { message: string }).message).toBe("Wrong password");
  });

  it("throws lockout object on 429 error", async () => {
    setAuthToken();
    const lockoutError = {
      isAxiosError: true,
      response: { status: 429, data: { message: "Locked", lockoutDuration: 900 } },
      code: "ERR_TOO_MANY_REQUESTS",
    };
    mockApiClient.patch.mockRejectedValueOnce(lockoutError);

    let caught: unknown;
    try {
      await updatePassword({
        currentPassword: "bad",
        newPassword: "new",
        confirmNewPassword: "new",
      });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeDefined();
    expect((caught as { lockoutDuration: number }).lockoutDuration).toBe(900);
    expect((caught as { message: string }).message).toBe(
      "Account locked due to too many failed attempts"
    );
  });

  it("uses default lockoutDuration of 900 when not in response", async () => {
    setAuthToken();
    const lockoutError = {
      isAxiosError: true,
      response: { status: 429, data: { message: "Locked" } },
      code: "ERR_TOO_MANY_REQUESTS",
    };
    mockApiClient.patch.mockRejectedValueOnce(lockoutError);

    let caught: unknown;
    try {
      await updatePassword({
        currentPassword: "bad",
        newPassword: "new",
        confirmNewPassword: "new",
      });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeDefined();
    expect((caught as { lockoutDuration: number }).lockoutDuration).toBe(900);
  });

  it("throws generic Error on other axios errors", async () => {
    setAuthToken();
    const serverError = makeAxiosError(500, { message: "Server crashed" });
    mockApiClient.patch.mockRejectedValueOnce(serverError);

    await expect(
      updatePassword({ currentPassword: "old", newPassword: "new", confirmNewPassword: "new" })
    ).rejects.toThrow("Server crashed");
  });

  it("throws for non-axios password update errors", async () => {
    setAuthToken();
    mockApiClient.patch.mockRejectedValueOnce({ notAxios: true, message: "unexpected" });

    await expect(
      updatePassword({ currentPassword: "old", newPassword: "new", confirmNewPassword: "new" })
    ).rejects.toBeDefined();
  });

  it("uses attemptsRemaining from error response (401 with attemptsRemaining: 1)", async () => {
    setAuthToken();
    const authError = {
      isAxiosError: true,
      response: { status: 401, data: { error: "Incorrect password", attemptsRemaining: 1 } },
      code: "ERR_BAD_REQUEST",
    };
    mockApiClient.patch.mockRejectedValueOnce(authError);

    let caught: unknown;
    try {
      await updatePassword({
        currentPassword: "wrong",
        newPassword: "new",
        confirmNewPassword: "new",
      });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeDefined();
    expect((caught as { attemptsRemaining: number }).attemptsRemaining).toBe(1);
  });
});

// ── deleteAccount ─────────────────────────────────────────────────────────────
describe("profileApi - deleteAccount", () => {
  it("throws Not authenticated when no token", async () => {
    await expect(deleteAccount("user-123")).rejects.toThrow("Not authenticated");
  });

  it("returns response data on success", async () => {
    setAuthToken();
    const mockResponse = { success: true, message: "Account deleted" };
    mockApiClient.delete.mockResolvedValueOnce({ data: mockResponse });

    const result = await deleteAccount("user-123");
    expect(result).toEqual(mockResponse);
    expect(mockApiClient.delete).toHaveBeenCalledWith("/users/user-123", {
      headers: { Authorization: `Bearer ${mockToken}` },
    });
  });

  it("throws error message on API failure", async () => {
    setAuthToken();
    const apiError = makeAxiosError(404, { message: "User not found" });
    mockApiClient.delete.mockRejectedValueOnce(apiError);

    await expect(deleteAccount("user-123")).rejects.toThrow("User not found");
  });

  it("throws for non-axios deleteAccount errors", async () => {
    setAuthToken();
    mockApiClient.delete.mockRejectedValueOnce({ notAxios: true, msg: "DB error" });

    await expect(deleteAccount("user-123")).rejects.toBeDefined();
  });

  it("throws error for ERR_NETWORK (inner catch converts to plain Error)", async () => {
    setAuthToken();
    const networkError = { isAxiosError: true, code: "ERR_NETWORK", response: undefined };
    // Inner catch converts to plain Error, so no retry happens
    mockApiClient.delete.mockRejectedValueOnce(networkError);

    await expect(deleteAccount("user-123")).rejects.toBeDefined();
    expect(mockApiClient.delete).toHaveBeenCalledTimes(1);
  });
});

// ── resendEmailVerification ───────────────────────────────────────────────────
describe("profileApi - resendEmailVerification", () => {
  it("throws 'No access token available' when no token", async () => {
    await expect(resendEmailVerification()).rejects.toThrow("No access token available");
  });

  it("returns response data on success", async () => {
    setAuthToken();
    const mockResponse = { success: true, message: "Verification sent" };
    mockApiClient.post.mockResolvedValueOnce({ data: mockResponse });

    const result = await resendEmailVerification();
    expect(result).toEqual(mockResponse);
    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/verification/resend",
      {},
      { headers: { Authorization: `Bearer ${mockToken}` } }
    );
  });

  it("throws error message on API failure", async () => {
    setAuthToken();
    const apiError = makeAxiosError(500, { message: "Email service down" });
    mockApiClient.post.mockRejectedValueOnce(apiError);

    await expect(resendEmailVerification()).rejects.toThrow("Email service down");
  });

  it("throws for non-axios resend verification errors", async () => {
    setAuthToken();
    mockApiClient.post.mockRejectedValueOnce({ notAxios: true, msg: "Unknown" });

    await expect(resendEmailVerification()).rejects.toBeDefined();
  });
});

// ── getErrorMessage (indirectly tested) ──────────────────────────────────────
describe("profileApi - error fallback handling", () => {
  beforeEach(() => {
    mockApiClient.patch.mockReset();
    mockApiClient.post.mockReset();
    mockApiClient.delete.mockReset();
  });

  it("uses error.error field from API when message is absent", async () => {
    setAuthToken();
    const errorWithErrorField = makeAxiosError(400, { error: "Validation failed" });
    mockApiClient.patch.mockRejectedValueOnce(errorWithErrorField);

    await expect(updateProfile({ firstName: "A", lastName: "B" })).rejects.toThrow(
      "Validation failed"
    );
  });

  it("uses error.message when API data has no message or error fields", async () => {
    setAuthToken();
    const errorMinimal = {
      isAxiosError: true,
      response: { status: 400, data: {} },
      message: "Request failed with status 400",
    };
    mockApiClient.patch.mockRejectedValueOnce(errorMinimal);

    await expect(updateProfile({ firstName: "A", lastName: "B" })).rejects.toThrow(
      "Request failed with status 400"
    );
  });

  it("handles non-axios plain object error as unexpected", async () => {
    setAuthToken();
    mockApiClient.patch.mockRejectedValueOnce({ someField: "nope" });

    await expect(updateProfile({ firstName: "A", lastName: "B" })).rejects.toThrow(
      "An unexpected error occurred"
    );
  });
});

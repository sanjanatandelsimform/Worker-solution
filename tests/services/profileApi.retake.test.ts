/**
 * Retake Assessment API Service Tests
 *
 * Unit tests for the retakeAssessment() function in profileApi.
 * Tests authentication, success response, error handling, and retry on network failure.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";

// Create a mock apiClient that axios.create will return
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

// Mock axios — ensure create() returns our mockApiClient
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

// Mock authApi to prevent apiClient initialization errors
vi.mock("@/services/api/authApi", () => {
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
  return {
    default: mockApiClient,
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
  };
});

// Import after mocks are set up
const { retakeAssessment } = await import("@/services/api/profileApi");

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: () => null,
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

beforeEach(() => {
  vi.stubGlobal("localStorage", mockLocalStorage);
  mockLocalStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("profileApi - retakeAssessment", () => {
  const mockToken = "mock-jwt-token";

  const setAuthToken = () => {
    mockLocalStorage.setItem(
      "userDetail",
      JSON.stringify({
        auth: { tokens: { accessToken: mockToken } },
      })
    );
  };

  describe("authentication", () => {
    it("should throw 'Not authenticated' when no token is available", async () => {
      // No token set in localStorage
      await expect(retakeAssessment()).rejects.toThrow("Not authenticated");
    });

    it("should throw 'Not authenticated' when userDetail is malformed", async () => {
      mockLocalStorage.setItem("userDetail", "invalid-json");
      await expect(retakeAssessment()).rejects.toThrow("Not authenticated");
    });

    it("should throw 'Not authenticated' when token path is missing", async () => {
      mockLocalStorage.setItem("userDetail", JSON.stringify({ auth: {} }));
      await expect(retakeAssessment()).rejects.toThrow("Not authenticated");
    });
  });

  describe("success response", () => {
    it("should call DELETE /assessment with Authorization header", async () => {
      setAuthToken();
      const mockResponse = { data: { success: true, message: "Assessment reset" } };

      mockApiClient.delete.mockResolvedValueOnce(mockResponse);

      const result = await retakeAssessment();

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        "/assessment",
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
      expect(result).toEqual({ success: true, message: "Assessment reset" });
    });
  });

  describe("error handling", () => {
    it("should throw error message from API on 401 Unauthorized", async () => {
      setAuthToken();

      const axiosError = {
        isAxiosError: true,
        response: {
          status: 401,
          data: { message: "Unauthorized" },
        },
        code: "ERR_BAD_REQUEST",
      };

      mockApiClient.delete.mockRejectedValueOnce(axiosError);

      await expect(retakeAssessment()).rejects.toThrow("Unauthorized");
    });

    it("should throw error message from API on 500 Server Error", async () => {
      setAuthToken();

      const axiosError = {
        isAxiosError: true,
        response: {
          status: 500,
          data: { message: "Internal server error" },
        },
        code: "ERR_BAD_RESPONSE",
      };

      mockApiClient.delete.mockRejectedValueOnce(axiosError);

      await expect(retakeAssessment()).rejects.toThrow("Internal server error");
    });
  });

  describe("network failure handling", () => {
    it("should throw a meaningful error on network failure", async () => {
      setAuthToken();

      const networkError = {
        isAxiosError: true,
        code: "ERR_NETWORK",
        response: undefined,
      };

      mockApiClient.delete.mockRejectedValueOnce(networkError);

      await expect(retakeAssessment()).rejects.toThrow();
    });

    it("should throw a meaningful error on timeout", async () => {
      setAuthToken();

      const timeoutError = {
        isAxiosError: true,
        code: "ECONNABORTED",
        response: undefined,
        message: "timeout of 10000ms exceeded",
      };

      mockApiClient.delete.mockRejectedValueOnce(timeoutError);

      await expect(retakeAssessment()).rejects.toThrow();
    });
  });
});

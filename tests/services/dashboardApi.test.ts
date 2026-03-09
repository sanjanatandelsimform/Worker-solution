/**
 * Dashboard API Service Tests
 *
 * Unit tests for dashboardApi service layer.
 * Tests authentication, error handling, and response shape.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import type { DashboardResponse } from "@/types/dashboardTypes";

// Mock axios FIRST
vi.mock("axios");

// Mock authApi to prevent apiClient initialization errors
vi.mock("@/services/api/authApi", () => {
  const mockApiClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
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

// NOW import getDashboard after mocks are set up
const { getDashboard } = await import("@/services/api/dashboardApi");
const authApi = await import("@/services/api/authApi");

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

describe("dashboardApi", () => {
  describe("getDashboard", () => {
    const mockToken = "mock-jwt-token";
    const mockDashboardData: DashboardResponse = {
      companyAtGlance: {
        totalWorkforce: 1250,
        averageHourlyWage: 18.5,
        averageSalary: 52000,
      },
      strategicRecommendations: [],
      industryOverview: null,
      turnoverVoluntaryVsInvoluntary: null,
      rateOfSeparation: null,
      zipCodes: ["12345"],
      areaMedianWage: [],
      housingCost: [],
      industry: {
        code: "42",
        name: "Wholesale Trade",
      },
    };

    beforeEach(() => {
      mockLocalStorage.setItem(
        "userDetail",
        JSON.stringify({
          auth: {
            tokens: {
              accessToken: mockToken,
            },
          },
        })
      );
    });

    it("should successfully fetch dashboard data", async () => {
      // Mock apiClient.get to return mock data
      const mockApiClient = authApi.default;
      vi.mocked(mockApiClient.get).mockResolvedValue({
        data: mockDashboardData,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const result = await getDashboard();

      expect(result).toBeDefined();
      expect(result).toHaveProperty("companyAtGlance");
      expect(result.companyAtGlance).toHaveProperty("totalWorkforce");
      expect(result.companyAtGlance?.totalWorkforce).toBe(1250);
      expect(result).toHaveProperty("zipCodes");
      expect(Array.isArray(result.zipCodes)).toBe(true);

      // Verify apiClient.get was called with correct parameters
      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/dashboard",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });

    it("should throw error when no auth token present", async () => {
      mockLocalStorage.clear();

      await expect(getDashboard()).rejects.toThrow("Authentication required. Please log in again.");
    });

    it("should throw when userDetail is invalid JSON", async () => {
      mockLocalStorage.setItem("userDetail", "invalid-json");

      await expect(getDashboard()).rejects.toThrow("Authentication required. Please log in again.");
    });

    it("should include Authorization header with token", async () => {
      const mockApiClient = authApi.default;
      vi.mocked(mockApiClient.get).mockResolvedValue({
        data: mockDashboardData,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      await getDashboard();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/dashboard",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });


    it("should throw timeout error when request times out", async () => {
      const mockApiClient = authApi.default;
      const timeoutError = {
        code: "ECONNABORTED",
        message: "timeout of 10000ms exceeded",
        isAxiosError: true,
      };

      vi.mocked(mockApiClient.get).mockRejectedValue(timeoutError);
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      await expect(getDashboard()).rejects.toThrow("Request timed out. Please try again.");
    });

    it("should throw API error message when available", async () => {
      const mockApiClient = authApi.default;
      const apiError = {
        response: {
          data: {
            message: "Dashboard data not available for this user",
          },
          status: 404,
        },
        isAxiosError: true,
      };

      vi.mocked(mockApiClient.get).mockRejectedValue(apiError);
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      await expect(getDashboard()).rejects.toThrow("Dashboard data not available for this user");
    });

    it("should throw generic message for unknown errors", async () => {
      const mockApiClient = authApi.default;
      const unknownError = new Error("Something went wrong");

      vi.mocked(mockApiClient.get).mockRejectedValue(unknownError);
      vi.mocked(axios.isAxiosError).mockReturnValue(false);

      await expect(getDashboard()).rejects.toThrow(
        "An unexpected error occurred. Please try again."
      );
    });
  });
});

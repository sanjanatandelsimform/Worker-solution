/**
 * Dashboard API Service Tests
 *
 * Unit tests for dashboardApi service layer.
 * Tests authentication, error handling, and response shape.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import { getDashboard } from "@/services/api/dashboardApi";
import type { DashboardResponse } from "@/types/dashboardTypes";

// Mock axios
vi.mock("axios");

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
      // Mock axios.get to return mock data
      vi.mocked(axios.get).mockResolvedValue({
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

      // Verify axios.get was called with correct parameters
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("/dashboard"),
        expect.objectContaining({
          timeout: 30000,
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
      vi.mocked(axios.get).mockResolvedValue({
        data: mockDashboardData,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      await getDashboard();

      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });

    it("should use 30-second timeout", async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: mockDashboardData,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      await getDashboard();

      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          timeout: 30000,
        })
      );
    });

    it("should throw timeout error when request times out", async () => {
      const timeoutError = {
        code: "ECONNABORTED",
        message: "timeout of 30000ms exceeded",
        isAxiosError: true,
      };

      vi.mocked(axios.get).mockRejectedValue(timeoutError);
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      await expect(getDashboard()).rejects.toThrow("Request timed out. Please try again.");
    });

    it("should throw API error message when available", async () => {
      const apiError = {
        response: {
          data: {
            message: "Dashboard data not available for this user",
          },
          status: 404,
        },
        isAxiosError: true,
      };

      vi.mocked(axios.get).mockRejectedValue(apiError);
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      await expect(getDashboard()).rejects.toThrow("Dashboard data not available for this user");
    });

    it("should throw generic message for unknown errors", async () => {
      const unknownError = new Error("Something went wrong");

      vi.mocked(axios.get).mockRejectedValue(unknownError);
      vi.mocked(axios.isAxiosError).mockReturnValue(false);

      await expect(getDashboard()).rejects.toThrow(
        "An unexpected error occurred. Please try again."
      );
    });
  });
});

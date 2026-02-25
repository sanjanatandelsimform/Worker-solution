/**
 * Dashboard API Service Tests
 *
 * Unit tests for dashboardApi service layer.
 * Tests GET /dashboard API calls, timeout handling, and error scenarios.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import { getDashboard } from "@/services/api/dashboardApi";
import type { DashboardResponse } from "@/types/dashboardTypes";

// Mock axios
vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("dashboardApi", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

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
      areaMedianWage: [],
      housingCost: [],
    };

    beforeEach(() => {
      // Setup auth token in localStorage
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
      // Arrange: Mock successful API response
      mockedAxios.get.mockResolvedValueOnce({
        data: mockDashboardData,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      });

      // Act: Call getDashboard
      const result = await getDashboard();

      // Assert: Should return the mocked data
      expect(result).toEqual(mockDashboardData);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it("should include Authorization header with token", async () => {
      // Arrange: Mock successful API response
      mockedAxios.get.mockResolvedValueOnce({
        data: mockDashboardData,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      });

      // Act: Call getDashboard
      await getDashboard();

      // Assert: Should call axios.get with Authorization header
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/dashboard"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });

    it("should use 30-second timeout", async () => {
      // Arrange: Mock successful API response
      mockedAxios.get.mockResolvedValueOnce({
        data: mockDashboardData,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      });

      // Act: Call getDashboard
      await getDashboard();

      // Assert: Should call axios.get with 30000ms timeout
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          timeout: 30000,
        })
      );
    });

    it("should throw error when no auth token present", async () => {
      // Arrange: Clear localStorage to remove token
      mockLocalStorage.clear();

      // Act & Assert: Should throw authentication error
      await expect(getDashboard()).rejects.toThrow("Authentication required. Please log in again.");

      // Should not call axios.get
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it("should handle timeout errors", async () => {
      // Arrange: Mock timeout error
      const timeoutError = {
        code: "ECONNABORTED",
        message: "timeout of 30000ms exceeded",
        isAxiosError: true,
      };
      mockedAxios.get.mockRejectedValueOnce(timeoutError);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      // Act & Assert: Should throw user-friendly timeout message
      await expect(getDashboard()).rejects.toThrow("Request timed out. Please try again.");
    });

    it("should handle 401 unauthorized errors", async () => {
      // Arrange: Mock 401 error response
      const unauthorizedError = {
        response: {
          status: 401,
          data: {
            message: "Unauthorized: Invalid or expired token",
          },
        },
        isAxiosError: true,
      } as AxiosError;
      mockedAxios.get.mockRejectedValueOnce(unauthorizedError);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      // Act & Assert: Should throw the API error message
      await expect(getDashboard()).rejects.toThrow("Unauthorized: Invalid or expired token");
    });

    it("should handle 500 server errors", async () => {
      // Arrange: Mock 500 error response
      const serverError = {
        response: {
          status: 500,
          data: {
            message: "Internal server error. Please try again later.",
          },
        },
        isAxiosError: true,
      } as AxiosError;
      mockedAxios.get.mockRejectedValueOnce(serverError);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      // Act & Assert: Should throw the API error message
      await expect(getDashboard()).rejects.toThrow(
        "Internal server error. Please try again later."
      );
    });

    it("should handle network errors", async () => {
      // Arrange: Mock network error (no response)
      const networkError = {
        message: "Network Error",
        isAxiosError: true,
        response: undefined,
      } as AxiosError;
      mockedAxios.get.mockRejectedValueOnce(networkError);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      // Act & Assert: Should throw the error message
      await expect(getDashboard()).rejects.toThrow("Network Error");
    });
  });
});

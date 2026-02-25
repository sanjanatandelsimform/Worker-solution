/**
 * Dashboard API Service Tests
 *
 * Unit tests for dashboardApi service layer.
 * Tests GET /dashboard API calls, timeout handling, and error scenarios.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios, { type AxiosRequestConfig, type AxiosError } from "axios";
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
        config: {} as AxiosRequestConfig,
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
        config: {} as AxiosRequestConfig,
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
        config: {} as AxiosRequestConfig,
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

    it("should throw timeout error when request times out", async () => {
      const timeoutError: AxiosError = {
        isAxiosError: true,
        code: "ECONNABORTED",
        message: "timeout of 30000ms exceeded",
        response: undefined,
      } as AxiosError;

      vi.mocked(axios.get).mockRejectedValueOnce(timeoutError);

      await expect(getDashboard()).rejects.toThrow("Request timed out. Please try again.");
    });

    it("should throw API error message when available", async () => {
      const apiError = {
        isAxiosError: true,
        response: {
          data: {
            message: "Invalid authentication token",
          },
        },
      } as unknown as Error;

      vi.mocked(axios.get).mockRejectedValueOnce(apiError);

      await expect(getDashboard()).rejects.toThrow("Invalid authentication token");
    });

    it("should throw generic message for unknown errors", async () => {
      const unknownError = {
        isAxiosError: true,
        message: undefined,
        response: undefined,
      } as unknown as Error;

      vi.mocked(axios.get).mockRejectedValueOnce(unknownError);

      await expect(getDashboard()).rejects.toThrow(
        "An unexpected error occurred. Please try again."
      );
    });
  });
});

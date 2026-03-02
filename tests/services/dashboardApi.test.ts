/**
 * Dashboard API Service Tests
 *
 * Unit tests for dashboardApi service layer.
 * Current implementation returns static data (GET /dashboard is commented out).
 * Tests auth token check and response shape; axios-specific tests are skipped until API is enabled.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDashboard } from "@/services/api/dashboardApi";

// Mock localStorage so getAuthToken() in dashboardApi uses it (stubGlobal ensures it's used)
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
});

describe("dashboardApi", () => {
  beforeEach(() => {
    mockLocalStorage.clear(); // clean state so token tests are isolated
  });

  describe("getDashboard", () => {
    const mockToken = "mock-jwt-token";

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
      const result = await getDashboard();

      expect(result).toBeDefined();
      expect(result).toHaveProperty("companyAtGlance");
      expect(result.companyAtGlance).toHaveProperty("totalWorkforce");
      expect(result).toHaveProperty("zipCodes");
      expect(Array.isArray(result.zipCodes)).toBe(true);
    });

    it("should throw error when no auth token present", async () => {
      mockLocalStorage.clear();

      await expect(getDashboard()).rejects.toThrow("Authentication required. Please log in again.");
    });

    it("should throw when userDetail is invalid JSON", async () => {
      mockLocalStorage.setItem("userDetail", "invalid-json");

      await expect(getDashboard()).rejects.toThrow("Authentication required. Please log in again.");
    });

    // Skipped until GET /dashboard is enabled (implementation currently returns static data)
    it.skip("should include Authorization header with token", async () => {
      // When axios.get is used: expect header to include Bearer token
    });

    it.skip("should use 30-second timeout", async () => {
      // When axios.get is used: expect timeout: 30000
    });

    it.skip("should throw timeout error when request times out", async () => {
      // When axios.get is used: ECONNABORTED -> "Request timed out. Please try again."
    });

    it.skip("should throw API error message when available", async () => {
      // When axios.get is used: response.data.message
    });

    it.skip("should throw generic message for unknown errors", async () => {
      // When axios.get is used: generic fallback message
    });
  });
});

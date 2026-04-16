/**
 * Unit tests for getIndustry() API service
 * Based on: specs/009-industry-status-api/contracts/industry-api.yaml
 */
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import apiClient from "@/services/api/authApi";
import type { IndustryData } from "@/types/industryTypes";

// Mock the apiClient module
vi.mock("@/services/api/authApi", () => ({
  default: {
    get: vi.fn(),
  },
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

const mockIndustryData: IndustryData = {
  industryOverview: {
    turnoverRate: { rate: "$4.46M", month: "Dec", year: 2024 },
    avgTurnover: { rate: 5.32, sinceYear: 2020 },
    industryWideCostOfTurnover: { amount: 1714381066.6667, formatted: "$1.7B", year: 2024 },
    rates: { hire: 31, seperation: 40 },
  },
  industry: {
    turnOverRate: {
      industry: { involuntary: 39, voluntary: 60 },
      company: { involuntary: 20, voluntary: 80 },
    },
    seperationRate: {
      industry: { seperation: 7.7, hiring: 11.1 },
      company: { seperation: 2.7, hiring: 8.1 },
    },
  },
  areaMedianWage: {
    availableZipcodes: ["03301"],
    nationalAvgSalary: 83227,
    companyMedianHourlyWage: 14.03,
    companyGraph: { salary: 40000, hourly: 26.0 },
    stateData: [
      {
        zipcode: "03301",
        city: "Manchester, NH",
        medianLivingWage: 24.03,
        graph: {
          state: { salary: 45000, hourly: 21.63 },
          national: { salary: 83245, hourly: 29.76 },
        },
        avgSalary: { salary: 40000, year: 2024 },
      },
    ],
  },
  housingBurden: {
    availableZipcodes: ["03301"],
    data: [
      {
        zipcode: "03301",
        city: "Manchester, NH",
        owners: {
          period: { quarter: 4, year: 2023 },
          burdened: { metroArea: 10.2, yourEmployees: 3.1 },
          severelyBurdened: { metroArea: 3.3, yourEmployees: 1.6 },
        },
        renters: {
          period: { quarter: 4, year: 2023 },
          burdened: { metroArea: 12.2, yourEmployees: 8.1 },
          severelyBurdened: { metroArea: 6.7, yourEmployees: 1.6 },
        },
        workingClass: {
          homeOwnershipRate: 72,
          medianHomeValue: 367200,
          medianRent: 1423,
          graph: [
            {
              incomeCategory: "lowIncome",
              label: "Low income",
              range: "$55,250 or less",
              burdened: 74,
              severelyBurdened: 44,
            },
          ],
        },
      },
    ],
  },
};

describe("industryApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    mockLocalStorage.setItem(
      "userDetail",
      JSON.stringify({ auth: { tokens: { accessToken: "test-token" } } })
    );
  });

  it("should fetch industry data successfully", async () => {
    (apiClient.get as Mock).mockResolvedValue({
      data: { status: true, data: mockIndustryData },
    });

    const { getIndustry } = await import("@/services/api/industryApi");
    const result = await getIndustry();

    expect(apiClient.get).toHaveBeenCalledWith(
      "/industry",
      expect.objectContaining({
        headers: { Authorization: "Bearer test-token" },
      })
    );
    expect(result).toEqual(mockIndustryData);
  });

  it("should throw error when API returns status false", async () => {
    (apiClient.get as Mock).mockResolvedValue({
      data: { status: false },
    });

    const { getIndustry } = await import("@/services/api/industryApi");
    await expect(getIndustry()).rejects.toThrow("Failed to fetch industry data");
  });

  it("should throw error when auth token is missing", async () => {
    mockLocalStorage.clear();

    const { getIndustry } = await import("@/services/api/industryApi");
    await expect(getIndustry()).rejects.toThrow("Authentication required");
  });

  it("should handle network errors gracefully", async () => {
    (apiClient.get as Mock).mockRejectedValue(new Error("Network Error"));

    const { getIndustry } = await import("@/services/api/industryApi");
    await expect(getIndustry()).rejects.toThrow("An unexpected error occurred. Please try again.");
  });
});

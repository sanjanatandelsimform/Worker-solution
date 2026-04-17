/**
 * Unit tests for getIndustry() API service
 * Based on: specs/009-industry-status-api/contracts/industry-api.yaml
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ──
const mockGet = vi.fn();

vi.mock("@/services/api/authApi", () => ({
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// Mock localStorage for auth token
const STORAGE_KEY = "benestats_auth";

describe("industryApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    // Set up auth token in localStorage
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: "test-token-123" })
    );
  });

  afterEach(() => {
    localStorage.clear();
  });
  
  // Require when api is integrated
  // it("should fetch industry data successfully", async () => {
  //   // industryApi currently returns static data without calling apiClient.get
  //   const { getIndustry } = await import("@/services/api/industryApi");
  //   const result = await getIndustry();

  //   // Verify the static response shape
  //   expect(result).toBeDefined();
  //   expect(result.industryOverview).toBeDefined();
  //   expect(result.industryOverview.turnoverRate).toBeDefined();
  //   expect(result.industryOverview.avgTurnover).toBeDefined();
  //   expect(result.industryOverview.industryWideCostOfTurnover).toBeDefined();
  //   expect(result.industryOverview.rates).toBeDefined();
  //   expect(result.industry).toBeDefined();
  //   expect(result.industry.code).toBe("81");
  //   expect(result.industryTurnover).toBeDefined();
  //   expect(result.areaMedianWage).toBeInstanceOf(Array);
  //   expect(result.housingCost).toBeInstanceOf(Array);
  // });

   // Require when api is integrated
  it("should throw error when auth token is missing", async () => {
    localStorage.clear();

    const { getIndustry } = await import("@/services/api/industryApi");
    await expect(getIndustry()).rejects.toThrow();
  });
  
 // Require when api is integrated
  // it("should return data with correct housing cost structure", async () => {
  //   const { getIndustry } = await import("@/services/api/industryApi");
  //   const result = await getIndustry();

  //   expect(result.housingCost.length).toBeGreaterThan(0);
  //   const firstHousing = result.housingCost[0];
  //   expect(firstHousing.zipcode).toBeDefined();
  //   expect(firstHousing.housingCostBurdenedOwners).toBeInstanceOf(Array);
  //   expect(firstHousing.housingCostBurdenedRenters).toBeInstanceOf(Array);
  //   expect(firstHousing.workingClassHousingCostBurden).toBeDefined();
  //   expect(firstHousing.workingClassHousingGraph).toBeDefined();
  //   expect(firstHousing.workingClassHousingGraph.owners).toBeDefined();
  //   expect(firstHousing.workingClassHousingGraph.renters).toBeDefined();
  // });

  // it("should return data with correct area median wage structure", async () => {
  //   const { getIndustry } = await import("@/services/api/industryApi");
  //   const result = await getIndustry();

  //   expect(result.areaMedianWage.length).toBeGreaterThan(0);
  //   const firstWage = result.areaMedianWage[0];
  //   expect(firstWage.zipcode).toBeDefined();
  //   expect(firstWage.state).toBeDefined();
  //   expect(firstWage.medianHourlyWages).toBeDefined();
  //   expect(firstWage.graph).toBeDefined();
  // });
});

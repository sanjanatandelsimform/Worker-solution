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

// Mock axios.isAxiosError
vi.mock("axios", async () => {
  const actual = await vi.importActual<typeof import("axios")>("axios");
  return {
    ...actual,
    default: { ...actual.default, isAxiosError: (err: unknown) => (err as any)?.__isAxiosError === true },
    isAxiosError: (err: unknown) => (err as any)?.__isAxiosError === true,
  };
});

const STORAGE_KEY = "userDetail";

describe("industryApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      auth: { tokens: { accessToken: "test-token-123" } }
    }));
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

  it("should throw error when auth token is missing", async () => {
    localStorage.clear();
    const { getIndustry } = await import("@/services/api/industryApi");
    await expect(getIndustry()).rejects.toThrow("Authentication required");
  });

  it("should fetch industry data successfully", async () => {
    const mockIndustryData = {
      industryOverview: { turnoverRate: 15 },
      industry: { code: "81" },
    };
    mockGet.mockResolvedValueOnce({
      status: 200,
      data: { industry: mockIndustryData },
    });
    const { getIndustry } = await import("@/services/api/industryApi");
    const result = await getIndustry();
    expect(result).toEqual(mockIndustryData);
  });

  it("should throw when api response has no status", async () => {
    mockGet.mockResolvedValueOnce({ status: 0, data: { industry: {} } });
    const { getIndustry } = await import("@/services/api/industryApi");
    await expect(getIndustry()).rejects.toThrow("Failed to fetch industry data");
  });

  it("should throw with getErrorMessage for axios timeout error", async () => {
    const axiosError = { __isAxiosError: true, code: "ECONNABORTED", message: "timeout", response: undefined };
    mockGet.mockRejectedValueOnce(axiosError);
    const { getIndustry } = await import("@/services/api/industryApi");
    await expect(getIndustry()).rejects.toThrow();
  });

  it("should throw with getErrorMessage for axios error with API message", async () => {
    const axiosError = { __isAxiosError: true, code: "ERR_BAD_REQUEST", response: { data: { message: "Invalid request" } }, message: "Request failed" };
    mockGet.mockRejectedValueOnce(axiosError);
    const { getIndustry } = await import("@/services/api/industryApi");
    await expect(getIndustry()).rejects.toThrow();
  });

  it("should throw with getErrorMessage for axios error without API message", async () => {
    const axiosError = { __isAxiosError: true, code: "NETWORK_ERROR", response: { data: {} }, message: "Network Error" };
    mockGet.mockRejectedValueOnce(axiosError);
    const { getIndustry } = await import("@/services/api/industryApi");
    await expect(getIndustry()).rejects.toThrow();
  });

  it("should throw generic error for non-axios errors", async () => {
    mockGet.mockRejectedValueOnce("some string error");
    const { getIndustry } = await import("@/services/api/industryApi");
    await expect(getIndustry()).rejects.toThrow();
  });

  it("handles localStorage parse error gracefully (no token)", async () => {
    localStorage.setItem(STORAGE_KEY, "invalid-json{{{");
    const { getIndustry } = await import("@/services/api/industryApi");
    await expect(getIndustry()).rejects.toThrow("Authentication required");
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

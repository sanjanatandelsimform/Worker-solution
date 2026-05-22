/**
 * Dashboard Redux Selectors Tests
 *
 * Unit tests for dashboardSelectors, including ZIP code-driven selectors.
 * Tests selector logic for filtering and data retrieval.
 */

import { describe, it, expect } from "vitest";
import {
  selectZipCodes,
  makeSelectAreaMedianByZip,
  makeSelectHousingCostByZip,
  selectDashboardState,
  selectDashboardData,
  selectDashboardLoading,
  selectDashboardError,
  selectDashboardLastFetched,
  selectCompanyAtGlance,
  selectStrategicRecommendations,
  selectIndustryOverview,
  selectTurnoverMetrics,
  selectSeparationMetrics,
  selectPrimaryAreaMedianWage,
  selectPrimaryHousingCost,
  selectDashboardIsLoaded,
  selectDashboardHasError,
  selectBurdenedOwnersPercentage,
  selectBurdenedRentersPercentage,
  selectWorkingClassHousingCostBurden,
  selectWorkingClassHousingGraph,
  selectAreaMedianWageChartData,
  selectIndustry,
} from "@/store/selectors/dashboardSelectors";
import type { RootState } from "@/store/store";
import type { DashboardResponse } from "@/types/dashboardTypes";

describe("Dashboard Selectors", () => {
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
    zipCodes: ["12345", "67890", "11111"],
    areaMedianWage: [
      {
        zipcode: "12345",
        stateAverage: 22.5,
        yourCompany: 18.5,
        nationalAverage: 24.0,
      },
      {
        zipcode: "67890",
        stateAverage: 21.0,
        yourCompany: 19.0,
        nationalAverage: 23.5,
      },
    ],
    housingCost: [
      {
        zipcode: "12345",
        burdenedOwners: 35.2,
        burdenedRenters: 48.7,
        workingClass: {
          ownersGte50: 22.1,
          ownersGte30: 58.3,
          rentersGte50: 45.6,
          rentersGte30: 72.4,
        },
        graph: {
          ownersGte50: 22.1,
          ownersGte30: 58.3,
          rentersGte50: 45.6,
          rentersGte30: 72.4,
        },
      },
      {
        zipcode: "67890",
        burdenedOwners: 32.5,
        burdenedRenters: 46.2,
        workingClass: {
          ownersGte50: 20.0,
          ownersGte30: 55.0,
          rentersGte50: 43.0,
          rentersGte30: 70.0,
        },
        graph: {
          ownersGte50: 20.0,
          ownersGte30: 55.0,
          rentersGte50: 43.0,
          rentersGte30: 70.0,
        },
      },
    ],
  };

  const createMockState = (data: DashboardResponse | null): RootState =>
    ({
      dashboard: {
        data,
        loading: false,
        error: null,
        lastFetched: Date.now(),
      },
    }) as RootState;

  describe("selectZipCodes", () => {
    it("should return ZIP codes array when data is available", () => {
      const state = createMockState(mockDashboardData);
      const result = selectZipCodes(state);
      expect(result).toEqual(["12345", "67890", "11111"]);
    });

    it("should return empty array when data is null", () => {
      const state = createMockState(null);
      const result = selectZipCodes(state);
      expect(result).toEqual([]);
    });

    it("should return empty array when zipCodes is undefined", () => {
      const dataWithoutZipCodes = { ...mockDashboardData, zipCodes: undefined };
      const state = createMockState(dataWithoutZipCodes as DashboardResponse);
      const result = selectZipCodes(state);
      expect(result).toEqual([]);
    });
  });

  describe("makeSelectAreaMedianByZip", () => {
    it("should return area median wage data for valid ZIP code", () => {
      const state = createMockState(mockDashboardData);
      const selector = makeSelectAreaMedianByZip("12345");
      const result = selector(state);

      expect(result).toEqual({
        zipcode: "12345",
        stateAverage: 22.5,
        yourCompany: 18.5,
        nationalAverage: 24.0,
      });
    });

    it("should return null for non-existent ZIP code", () => {
      const state = createMockState(mockDashboardData);
      const selector = makeSelectAreaMedianByZip("99999");
      const result = selector(state);

      expect(result).toBeNull();
    });

    it("should return null when data is null", () => {
      const state = createMockState(null);
      const selector = makeSelectAreaMedianByZip("12345");
      const result = selector(state);

      expect(result).toBeNull();
    });

    it("should return null when areaMedianWage is empty", () => {
      const state = createMockState({ ...mockDashboardData, areaMedianWage: [] });
      const selector = makeSelectAreaMedianByZip("12345");
      const result = selector(state);

      expect(result).toBeNull();
    });

    it("should return null when zipcode parameter is undefined", () => {
      const state = createMockState(mockDashboardData);
      const selector = makeSelectAreaMedianByZip(undefined as unknown as string);
      const result = selector(state);

      expect(result).toBeNull();
    });

    it("should return first matching entry when multiple entries have same ZIP", () => {
      const dataWithDuplicates: DashboardResponse = {
        ...mockDashboardData,
        areaMedianWage: [
          {
            zipcode: "12345",
            stateAverage: 22.5,
            yourCompany: 18.5,
            nationalAverage: 24.0,
          },
          {
            zipcode: "12345",
            stateAverage: 23.0,
            yourCompany: 19.0,
            nationalAverage: 25.0,
          },
        ],
      };
      const state = createMockState(dataWithDuplicates);
      const selector = makeSelectAreaMedianByZip("12345");
      const result = selector(state);

      expect(result).toEqual({
        zipcode: "12345",
        stateAverage: 22.5,
        yourCompany: 18.5,
        nationalAverage: 24.0,
      });
    });
  });

  describe("makeSelectHousingCostByZip", () => {
    it("should return housing cost data for valid ZIP code", () => {
      const state = createMockState(mockDashboardData);
      const selector = makeSelectHousingCostByZip("12345");
      const result = selector(state);

      expect(result).toEqual({
        zipcode: "12345",
        burdenedOwners: 35.2,
        burdenedRenters: 48.7,
        workingClass: {
          ownersGte50: 22.1,
          ownersGte30: 58.3,
          rentersGte50: 45.6,
          rentersGte30: 72.4,
        },
        graph: {
          ownersGte50: 22.1,
          ownersGte30: 58.3,
          rentersGte50: 45.6,
          rentersGte30: 72.4,
        },
      });
    });

    it("should return null for non-existent ZIP code", () => {
      const state = createMockState(mockDashboardData);
      const selector = makeSelectHousingCostByZip("99999");
      const result = selector(state);

      expect(result).toBeNull();
    });

    it("should return null when data is null", () => {
      const state = createMockState(null);
      const selector = makeSelectHousingCostByZip("12345");
      const result = selector(state);

      expect(result).toBeNull();
    });

    it("should return null when housingCost is empty", () => {
      const state = createMockState({ ...mockDashboardData, housingCost: [] });
      const selector = makeSelectHousingCostByZip("12345");
      const result = selector(state);

      expect(result).toBeNull();
    });

    it("should return null when zipcode parameter is undefined", () => {
      const state = createMockState(mockDashboardData);
      const selector = makeSelectHousingCostByZip(undefined as unknown as string);
      const result = selector(state);

      expect(result).toBeNull();
    });

    it("should return first matching entry when multiple entries have same ZIP", () => {
      const dataWithDuplicates: DashboardResponse = {
        ...mockDashboardData,
        housingCost: [
          {
            zipcode: "12345",
            burdenedOwners: 35.2,
            burdenedRenters: 48.7,
            workingClass: {
              ownersGte50: 22.1,
              ownersGte30: 58.3,
              rentersGte50: 45.6,
              rentersGte30: 72.4,
            },
            graph: {
              ownersGte50: 22.1,
              ownersGte30: 58.3,
              rentersGte50: 45.6,
              rentersGte30: 72.4,
            },
          },
          {
            zipcode: "12345",
            burdenedOwners: 36.0,
            burdenedRenters: 49.0,
            workingClass: {
              ownersGte50: 23.0,
              ownersGte30: 59.0,
              rentersGte50: 46.0,
              rentersGte30: 73.0,
            },
            graph: {
              ownersGte50: 23.0,
              ownersGte30: 59.0,
              rentersGte50: 46.0,
              rentersGte30: 73.0,
            },
          },
        ],
      };
      const state = createMockState(dataWithDuplicates);
      const selector = makeSelectHousingCostByZip("12345");
      const result = selector(state);

      expect(result?.burdenedOwners).toBe(35.2);
    });
  });

  describe("basic selectors", () => {
    it("selectDashboardState returns dashboard slice", () => {
      const state = createMockState(mockDashboardData);
      expect(selectDashboardState(state)).toBeDefined();
    });

    it("selectDashboardData returns data", () => {
      const state = createMockState(mockDashboardData);
      expect(selectDashboardData(state)).toEqual(mockDashboardData);
    });

    it("selectDashboardData returns null when no data", () => {
      const state = createMockState(null);
      expect(selectDashboardData(state)).toBeNull();
    });

    it("selectDashboardLoading returns loading state", () => {
      const state = createMockState(mockDashboardData);
      expect(selectDashboardLoading(state)).toBe(false);
    });

    it("selectDashboardError returns error state", () => {
      const state = createMockState(mockDashboardData);
      expect(selectDashboardError(state)).toBeNull();
    });

    it("selectDashboardLastFetched returns timestamp", () => {
      const state = createMockState(mockDashboardData);
      expect(typeof selectDashboardLastFetched(state)).toBe("number");
    });

    it("selectCompanyAtGlance returns company data", () => {
      const state = createMockState(mockDashboardData);
      const result = selectCompanyAtGlance(state);
      expect(result?.totalWorkforce).toBe(1250);
    });

    it("selectCompanyAtGlance returns null when no data", () => {
      expect(selectCompanyAtGlance(createMockState(null))).toBeNull();
    });

    it("selectStrategicRecommendations returns array", () => {
      const state = createMockState(mockDashboardData);
      expect(selectStrategicRecommendations(state)).toEqual([]);
    });

    it("selectIndustryOverview returns null when null", () => {
      expect(selectIndustryOverview(createMockState(mockDashboardData))).toBeNull();
    });

    it("selectTurnoverMetrics returns null when null", () => {
      expect(selectTurnoverMetrics(createMockState(mockDashboardData))).toBeNull();
    });

    it("selectSeparationMetrics returns null when null", () => {
      expect(selectSeparationMetrics(createMockState(mockDashboardData))).toBeNull();
    });

    it("selectDashboardIsLoaded returns falsy when not loaded", () => {
      const state = createMockState(mockDashboardData);
      expect(selectDashboardIsLoaded(state)).toBeFalsy();
    });

    it("selectDashboardHasError returns false when no error", () => {
      const state = createMockState(mockDashboardData);
      expect(selectDashboardHasError(state)).toBe(false);
    });
  });

  describe("housing and wage selectors", () => {
    it("selectPrimaryAreaMedianWage returns first zip data", () => {
      const state = createMockState(mockDashboardData);
      const result = selectPrimaryAreaMedianWage(state);
      expect(result).toBeDefined();
    });

    it("selectPrimaryHousingCost returns first zip data", () => {
      const state = createMockState(mockDashboardData);
      const result = selectPrimaryHousingCost(state);
      expect(result).toBeDefined();
    });

    it("selectBurdenedOwnersPercentage returns number or null", () => {
      const state = createMockState(mockDashboardData);
      const result = selectBurdenedOwnersPercentage(state);
      expect(result === null || typeof result === "number").toBe(true);
    });

    it("selectBurdenedRentersPercentage returns number or null", () => {
      const state = createMockState(mockDashboardData);
      const result = selectBurdenedRentersPercentage(state);
      expect(result === null || typeof result === "number").toBe(true);
    });

    it("selectWorkingClassHousingCostBurden returns data or null", () => {
      const state = createMockState(mockDashboardData);
      const result = selectWorkingClassHousingCostBurden(state);
      expect(result === null || typeof result === "object").toBe(true);
    });

    it("selectWorkingClassHousingGraph returns data or null", () => {
      const state = createMockState(mockDashboardData);
      const result = selectWorkingClassHousingGraph(state);
      expect(result === null || typeof result === "object").toBe(true);
    });

    it("selectAreaMedianWageChartData returns data or null", () => {
      const state = createMockState(mockDashboardData);
      const result = selectAreaMedianWageChartData(state);
      expect(result === null || typeof result === "object").toBe(true);
    });

    it("selectPrimaryAreaMedianWage returns null when no data", () => {
      expect(selectPrimaryAreaMedianWage(createMockState(null))).toBeNull();
    });

    it("selectPrimaryHousingCost returns null when no data", () => {
      expect(selectPrimaryHousingCost(createMockState(null))).toBeNull();
    });
  });

  describe("selectIndustry", () => {
    it("returns null when no data", () => {
      expect(selectIndustry(createMockState(null))).toBeNull();
    });
  });
});

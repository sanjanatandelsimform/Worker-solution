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
});

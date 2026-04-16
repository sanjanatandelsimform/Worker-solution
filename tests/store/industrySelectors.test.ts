/**
 * Industry Redux Selectors Tests
 *
 * Unit tests for industrySelectors — each selector returns the correct slice field.
 * Pattern: tests/store/finchStatusSelectors.test.ts
 */

import { describe, it, expect } from "vitest";
import {
  selectIndustryData,
  selectIndustryLoading,
  selectIndustryError,
  selectIndustryIsLoaded,
  selectIndustryOverviewData,
  selectIndustryTurnoverComparison,
  selectIndustryAreaMedianWage,
  selectIndustryHousingBurden,
} from "@/store/selectors/industrySelectors";
import type { RootState } from "@/store/store";
import type { IndustryData } from "@/types/industryTypes";

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

const buildState = (industry: Partial<RootState["industry"]> = {}): RootState =>
  ({
    industry: {
      data: null,
      loading: false,
      error: null,
      isLoaded: false,
      ...industry,
    },
  }) as unknown as RootState;

describe("industrySelectors", () => {
  describe("selectIndustryData", () => {
    it("returns null when data is null", () => {
      expect(selectIndustryData(buildState())).toBeNull();
    });

    it("returns industry data when set", () => {
      expect(selectIndustryData(buildState({ data: mockIndustryData }))).toEqual(mockIndustryData);
    });
  });

  describe("selectIndustryLoading", () => {
    it("returns false when not loading", () => {
      expect(selectIndustryLoading(buildState({ loading: false }))).toBe(false);
    });

    it("returns true when loading", () => {
      expect(selectIndustryLoading(buildState({ loading: true }))).toBe(true);
    });
  });

  describe("selectIndustryError", () => {
    it("returns null when no error", () => {
      expect(selectIndustryError(buildState({ error: null }))).toBeNull();
    });

    it("returns the error string when set", () => {
      expect(selectIndustryError(buildState({ error: "Network Error" }))).toBe("Network Error");
    });
  });

  describe("selectIndustryIsLoaded", () => {
    it("returns false when not loaded", () => {
      expect(selectIndustryIsLoaded(buildState({ isLoaded: false }))).toBe(false);
    });

    it("returns true when loaded", () => {
      expect(selectIndustryIsLoaded(buildState({ isLoaded: true }))).toBe(true);
    });
  });

  describe("selectIndustryOverviewData", () => {
    it("returns null when data is null", () => {
      expect(selectIndustryOverviewData(buildState())).toBeNull();
    });

    it("returns industryOverview from data", () => {
      expect(selectIndustryOverviewData(buildState({ data: mockIndustryData }))).toEqual(
        mockIndustryData.industryOverview
      );
    });
  });

  describe("selectIndustryTurnoverComparison", () => {
    it("returns null when data is null", () => {
      expect(selectIndustryTurnoverComparison(buildState())).toBeNull();
    });

    it("returns industry turnover comparison from data", () => {
      expect(selectIndustryTurnoverComparison(buildState({ data: mockIndustryData }))).toEqual(
        mockIndustryData.industry
      );
    });
  });

  describe("selectIndustryAreaMedianWage", () => {
    it("returns null when data is null", () => {
      expect(selectIndustryAreaMedianWage(buildState())).toBeNull();
    });

    it("returns area median wage from data", () => {
      expect(selectIndustryAreaMedianWage(buildState({ data: mockIndustryData }))).toEqual(
        mockIndustryData.areaMedianWage
      );
    });
  });

  describe("selectIndustryHousingBurden", () => {
    it("returns null when data is null", () => {
      expect(selectIndustryHousingBurden(buildState())).toBeNull();
    });

    it("returns housing burden from data", () => {
      expect(selectIndustryHousingBurden(buildState({ data: mockIndustryData }))).toEqual(
        mockIndustryData.housingBurden
      );
    });
  });
});

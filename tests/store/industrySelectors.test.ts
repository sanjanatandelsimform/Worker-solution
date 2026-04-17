/**
 * Industry Redux Selectors Tests
 *
 * Unit tests for industrySelectors — each selector returns the correct slice field.
 * Pattern: tests/store/finchStatusSelectors.test.ts
 */

import { describe, it, expect } from "vitest";
import {
  selectIndustryFullData,
  selectIndustryLoading,
  selectIndustryError,
  selectIndustryIsLoaded,
  selectIndustryOverviewData,
  selectIndustryTurnOverRate,
  selectIndustryAreaMedianWage,
  selectIndustryHousingData,
  selectIndustryData,
} from "@/store/selectors/industrySelectors";
import type { RootState } from "@/store/store";
import type { IndustryState, IndustryData } from "@/types/industryTypes";

const mockIndustryData: IndustryData = {
  industryOverview: {
    turnoverRate: { rate: "$4.46M", month: "Dec", year: 2024 },
    avgTurnover: { rate: 5.32, sinceYear: 2020 },
    industryWideCostOfTurnover: { amount: 1714381066.6667, formatted: "$1.7B", year: 2024 },
    rates: { hire: 31, seperation: 40 },
  },
  industry: { code: "81", name: "Other Services (except Public Administration)" },
  industryTurnover: {
    turnOverRate: {
      industryAvg: { involuntary: 39, voluntary: 60, quarter: "Q4", year: 2024 },
      company: { industry: 2, company: 5, year: 2024 },
    },
    seperationRate: {
      industryAvg: { seperation: 7.7, hiring: 11.1, quarter: "Q4", year: 2024 },
      company: { seperation: 2.7, hiring: 8.1 },
    },
  },
  areaMedianWage: [
    {
      zipcode: "10012",
      state: "New York",
      medianHourlyWages: 28.16,
      medianLivingWage: 29.89,
      nationalAverage: 44587,
      year: 2023,
      graph: {
        stateAverage: { salary: 58560, hourly: 28.16 },
        yourCompany: { salary: 87500, hourly: 17.5 },
        nationalAverage: { salary: 44710, hourly: 21.5 },
      },
    },
  ],
  housingCost: [
    {
      zipcode: "10012",
      housingCostBurdenedOwners: [{ year: 2025, burdened: 42.4782, severelyBurdened: 26.0105 }],
      housingCostBurdenedRenters: [{ year: 2024, burdened: 39.6756, severelyBurdened: 19.2329 }],
      workingClassHousingCostBurden: {
        homeOwnershipRate: 22.5,
        medianHomeValue: "1602800",
        medianRent: "2895",
      },
      workingClassHousingGraph: {
        owners: {
          lowIncome: { burdened: 3.939, severelyBurdened: 3.7519 },
          moderateIncome: { burdened: 6.25, severelyBurdened: 4.3413 },
          medianIncome: { burdened: 2.1707, severelyBurdened: 0.8608 },
          upperIncome: { burdened: 8.8885, severelyBurdened: 2.9005 },
        },
        renters: {
          lowIncome: { burdened: 68.1284, severelyBurdened: 2.8931 },
          moderateIncome: { burdened: 64.8235, severelyBurdened: 3.9549 },
          medianIncome: { burdened: 64.4531, severelyBurdened: 2.2971 },
          upperIncome: { burdened: 22.4214, severelyBurdened: 1.4086 },
        },
      },
    },
  ],
};

function buildState(overrides: Partial<IndustryState> = {}): RootState {
  return {
    industry: {
      data: null,
      loading: false,
      error: null,
      isLoaded: false,
      ...overrides,
    },
  } as unknown as RootState;
}

describe("industrySelectors", () => {
  describe("selectIndustryFullData", () => {
    it("returns null when data is null", () => {
      expect(selectIndustryFullData(buildState())).toBeNull();
    });
    it("returns full industry data when set", () => {
      expect(selectIndustryFullData(buildState({ data: mockIndustryData }))).toEqual(mockIndustryData);
    });
  });

  describe("selectIndustryData", () => {
    it("returns null when data is null", () => {
      expect(selectIndustryData(buildState())).toBeNull();
    });
  });

  describe("selectIndustryLoading", () => {
    it("returns false when not loading", () => {
      expect(selectIndustryLoading(buildState())).toBe(false);
    });
    it("returns true when loading", () => {
      expect(selectIndustryLoading(buildState({ loading: true }))).toBe(true);
    });
  });

  describe("selectIndustryError", () => {
    it("returns null when no error", () => {
      expect(selectIndustryError(buildState())).toBeNull();
    });
    it("returns the error string when set", () => {
      expect(selectIndustryError(buildState({ error: "fail" }))).toBe("fail");
    });
  });

  describe("selectIndustryIsLoaded", () => {
    it("returns false when not loaded", () => {
      expect(selectIndustryIsLoaded(buildState())).toBe(false);
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

  describe("selectIndustryTurnOverRate", () => {
    it("returns null when data is null", () => {
      expect(selectIndustryTurnOverRate(buildState())).toBeNull();
    });
    it("returns industry turnover from data", () => {
      expect(selectIndustryTurnOverRate(buildState({ data: mockIndustryData }))).toEqual(
        mockIndustryData.industryTurnover
      );
    });
  });

  describe("selectIndustryAreaMedianWage", () => {
    it("returns empty array when data is null", () => {
      expect(selectIndustryAreaMedianWage(buildState())).toEqual([]);
    });
    it("returns area median wage from data", () => {
      expect(selectIndustryAreaMedianWage(buildState({ data: mockIndustryData }))).toEqual(
        mockIndustryData.areaMedianWage
      );
    });
  });

  describe("selectIndustryHousingData", () => {
    it("returns empty array when data is null", () => {
      expect(selectIndustryHousingData(buildState())).toEqual([]);
    });
    it("returns housing cost from data", () => {
      expect(selectIndustryHousingData(buildState({ data: mockIndustryData }))).toEqual(
        mockIndustryData.housingCost
      );
    });
  });
});

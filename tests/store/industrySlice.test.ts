/**
 * Industry Redux Slice Tests
 *
 * Unit tests for industrySlice reducers, actions, and async thunks.
 * Tests state transitions for loading, success, error, and logout reset.
 */

import { describe, it, expect, vi } from "vitest";
import industryReducer, {
  fetchIndustry,
  clearIndustry,
  clearIndustryError,
} from "@/store/slices/industrySlice";
import type { IndustryState, IndustryData } from "@/types/industryTypes";

// Mock the API
vi.mock("@/services/api/industryApi");

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
    separationRate: {
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

describe("industrySlice", () => {
  const initialState: IndustryState = {
    data: null,
    loading: false,
    error: null,
    isLoaded: false,
  };

  describe("reducers", () => {
    it("should return initial state", () => {
      expect(industryReducer(undefined, { type: "unknown" })).toEqual(initialState);
    });

    it("should handle clearIndustry", () => {
      const stateWithData: IndustryState = {
        data: mockIndustryData,
        loading: false,
        error: null,
        isLoaded: true,
      };

      const newState = industryReducer(stateWithData, clearIndustry());

      expect(newState.data).toBeNull();
      expect(newState.error).toBeNull();
      expect(newState.isLoaded).toBe(false);
    });

    it("should handle clearIndustryError", () => {
      const stateWithError: IndustryState = {
        data: mockIndustryData,
        loading: false,
        error: "Some error",
        isLoaded: true,
      };

      const newState = industryReducer(stateWithError, clearIndustryError());

      expect(newState.error).toBeNull();
      expect(newState.data).toEqual(mockIndustryData);
      expect(newState.isLoaded).toBe(true);
    });
  });

  describe("fetchIndustry async thunk", () => {
    it("should set loading true on pending", () => {
      const newState = industryReducer(initialState, {
        type: fetchIndustry.pending.type,
      });

      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it("should set data on fulfilled", () => {
      const loadingState: IndustryState = { ...initialState, loading: true };

      const newState = industryReducer(loadingState, {
        type: fetchIndustry.fulfilled.type,
        payload: mockIndustryData,
      });

      expect(newState.loading).toBe(false);
      expect(newState.data).toEqual(mockIndustryData);
      expect(newState.error).toBeNull();
      expect(newState.isLoaded).toBe(true);
    });

    it("should set error on rejected", () => {
      const loadingState: IndustryState = { ...initialState, loading: true };
      const errorMessage = "Failed to fetch industry data";

      const newState = industryReducer(loadingState, {
        type: fetchIndustry.rejected.type,
        payload: errorMessage,
      });

      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(errorMessage);
      expect(newState.data).toBeNull();
      expect(newState.isLoaded).toBe(false);
    });

    it("should clear error when pending after previous error", () => {
      const errorState: IndustryState = {
        ...initialState,
        error: "Previous error",
      };

      const newState = industryReducer(errorState, {
        type: fetchIndustry.pending.type,
      });

      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });
  });

  describe("logout reset", () => {
    it("should reset state on auth/logout/fulfilled", () => {
      const stateWithData: IndustryState = {
        data: mockIndustryData,
        loading: false,
        error: null,
        isLoaded: true,
      };

      const newState = industryReducer(stateWithData, {
        type: "auth/logout/fulfilled",
      });

      expect(newState).toEqual(initialState);
    });

    it("should reset state on auth/logout", () => {
      const stateWithData: IndustryState = {
        data: mockIndustryData,
        loading: true,
        error: "Some error",
        isLoaded: true,
      };

      const newState = industryReducer(stateWithData, {
        type: "auth/logout",
      });

      expect(newState).toEqual(initialState);
    });
  });
});

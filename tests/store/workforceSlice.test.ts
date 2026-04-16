/**
 * Workforce Redux Slice Tests
 *
 * Unit tests for workforceSlice reducers, actions, and async thunks.
 * Tests state transitions for loading, success, and error states.
 * TDD: these tests are written before the implementation (Red state expected initially).
 */

import { describe, it, expect, vi } from "vitest";
import workforceReducer, {
  fetchWorkforce,
  clearWorkforce,
  clearWorkforceError,
  resetWorkforce,
} from "@/store/slices/workforceSlice";
import type { WorkforceState } from "@/types/workforceTypes";

// Mock the API service
vi.mock("@/services/api/workforceApi");

const initialState: WorkforceState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
  isLoaded: false,
};

describe("workforceSlice", () => {
  describe("initial state", () => {
    it("should return correct initial state", () => {
      expect(workforceReducer(undefined, { type: "unknown" })).toEqual(initialState);
    });
  });

  describe("fetchWorkforce async thunk", () => {
    it("should set loading true and clear error on pending", () => {
      const action = fetchWorkforce.pending("", undefined);
      const state = workforceReducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should set data, isLoaded, and clear loading on fulfilled", () => {
      const mockData = {
        workforce: {
          totalWorkforce: 3120,
          enrolledBenefits: 2450,
          avgEmployeeCost: 2254,
          employerCostPerEmployee: 44000,
        },
        participation: {
          totalWorkforce: 3120,
          enrolledBenefits: 2450,
          retirementEnrollment: "64%",
          healthcareEnrollment: "78%",
          benefits: [
            { name: "FSA", enrollment: "31%" },
            { name: "Wellness", enrollment: "N/A" },
            { name: "EAP", enrollment: "N/A" },
          ],
          retirement: [{ name: "401k", enrollment: "64%" }],
          insurance: [
            { name: "Health", enrollment: "78%" },
            { name: "Dental", enrollment: "65%" },
            { name: "Vision", enrollment: "60%" },
            { name: "Life", enrollment: "45%" },
          ],
        },
        demographics: {
          employmentType: [],
          gender: { men: "55%", women: "40%" },
          employmentBreakdownByAge: [],
        },
        compensation: {
          salaryBreakdown: { medianSalary: 60000, avgSalary: 65000, avgHourlyRate: 30 },
          workforceBreakdown: { departments: [] },
          benefitsCost: {
            employeeContribution: 468,
            employerCost: "$11000/yr",
            graph: [],
            table: [],
          },
        },
      };
      const action = fetchWorkforce.fulfilled(mockData, "", undefined);
      const state = workforceReducer(initialState, action);
      expect(state.loading).toBe(false);
      expect(state.data).toEqual(mockData);
      expect(state.isLoaded).toBe(true);
      expect(state.error).toBeNull();
      expect(state.lastFetched).not.toBeNull();
    });

    it("should set error and clear loading on rejected", () => {
      const action = fetchWorkforce.rejected(null, "", undefined, "API Error");
      const state = workforceReducer(initialState, action);
      expect(state.loading).toBe(false);
      expect(state.error).toBe("API Error");
      expect(state.isLoaded).toBe(false);
    });
  });

  describe("synchronous reducers", () => {
    it("should handle clearWorkforce — resets data, error, lastFetched, isLoaded", () => {
      const loadedState: WorkforceState = {
        ...initialState,
        data: {
          workforce: {
            totalWorkforce: 1,
            enrolledBenefits: 1,
            avgEmployeeCost: 1,
            employerCostPerEmployee: 1,
          },
          participation: {
            totalWorkforce: 1,
            enrolledBenefits: 1,
            retirementEnrollment: "0%",
            healthcareEnrollment: "0%",
            benefits: [
              { name: "FSA", enrollment: "0%" },
              { name: "Wellness", enrollment: "N/A" },
              { name: "EAP", enrollment: "N/A" },
            ],
            retirement: [{ name: "401k", enrollment: "0%" }],
            insurance: [
              { name: "Health", enrollment: "0%" },
              { name: "Dental", enrollment: "0%" },
              { name: "Vision", enrollment: "0%" },
              { name: "Life", enrollment: "0%" },
            ],
          },
          demographics: {
            employmentType: [],
            gender: { men: "0%", women: "0%" },
            employmentBreakdownByAge: [],
          },
          compensation: {
            salaryBreakdown: { medianSalary: 0, avgSalary: 0, avgHourlyRate: 0 },
            workforceBreakdown: { departments: [] },
            benefitsCost: { employeeContribution: 0, employerCost: "$0", graph: [], table: [] },
          },
        },
        isLoaded: true,
        lastFetched: Date.now(),
      };
      const state = workforceReducer(loadedState, clearWorkforce());
      expect(state.data).toBeNull();
      expect(state.isLoaded).toBe(false);
      expect(state.lastFetched).toBeNull();
    });

    it("should handle clearWorkforceError — clears error only", () => {
      const errorState: WorkforceState = { ...initialState, error: "Some error" };
      const state = workforceReducer(errorState, clearWorkforceError());
      expect(state.error).toBeNull();
    });

    it("should handle resetWorkforce — returns full initial state", () => {
      const loadedState: WorkforceState = {
        ...initialState,
        loading: true,
        error: "err",
        isLoaded: true,
      };
      const state = workforceReducer(loadedState, resetWorkforce());
      expect(state).toEqual(initialState);
    });
  });

  describe("auth logout matcher", () => {
    it("should reset to initialState on auth/logout/fulfilled", () => {
      const loadedState: WorkforceState = { ...initialState, isLoaded: true, lastFetched: 12345 };
      const state = workforceReducer(loadedState, { type: "auth/logout/fulfilled" });
      expect(state).toEqual(initialState);
    });
  });
});

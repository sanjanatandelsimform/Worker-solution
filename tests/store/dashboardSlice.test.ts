/**
 * Dashboard Redux Slice Tests
 *
 * Unit tests for dashboardSlice reducers, actions, and async thunks.
 * Tests state transitions for loading, success, and error states.
 */

import { describe, it, expect, vi } from "vitest";
import dashboardReducer, {
  fetchDashboard,
  clearDashboard,
  clearDashboardError,
} from "@/store/slices/dashboardSlice";
import type { DashboardState } from "@/types/dashboardTypes";

// Mock the API
vi.mock("@/services/api/dashboardApi");

describe("dashboardSlice", () => {
  const initialState: DashboardState = {
    data: null,
    loading: false,
    error: null,
    lastFetched: null,
    isLoaded: false,
  };

  describe("reducers", () => {
    it("should return initial state", () => {
      expect(dashboardReducer(undefined, { type: "unknown" })).toEqual(initialState);
    });

    it("should handle clearDashboard", () => {
      // Arrange: State with data, error, and lastFetched
      const stateWithData: DashboardState = {
        data: {
          companyAtGlance: {
            totalWorkforce: 1250,
            averageHourlyWage: 18.5,
            averageSalary: 52000,
          },
          strategicRecommendations: [],
          industryOverview: null,
          turnoverVoluntaryVsInvoluntary: null,
          rateOfSeparation: null,
          areaMedianWage: [],
          housingCost: [],
        },
        loading: false,
        error: "Some error",
        lastFetched: Date.now(),
      };

      // Act: Dispatch clearDashboard action
      const newState = dashboardReducer(stateWithData, clearDashboard());

      // Assert: Should reset data, error, and lastFetched
      expect(newState.data).toBeNull();
      expect(newState.error).toBeNull();
      expect(newState.lastFetched).toBeNull();
      expect(newState.loading).toBe(false);
    });

    it("should handle clearDashboardError", () => {
      // Arrange: State with error and data
      const stateWithError: DashboardState = {
        data: {
          companyAtGlance: {
            totalWorkforce: 1250,
            averageHourlyWage: 18.5,
            averageSalary: 52000,
          },
          strategicRecommendations: [],
          industryOverview: null,
          turnoverVoluntaryVsInvoluntary: null,
          rateOfSeparation: null,
          areaMedianWage: [],
          housingCost: [],
        },
        loading: false,
        error: "Previous error",
        lastFetched: 1234567890,
      };

      // Act: Dispatch clearDashboardError action
      const newState = dashboardReducer(stateWithError, clearDashboardError());

      // Assert: Should only clear error, keep data and lastFetched
      expect(newState.error).toBeNull();
      expect(newState.data).toEqual(stateWithError.data);
      expect(newState.lastFetched).toBe(stateWithError.lastFetched);
      expect(newState.loading).toBe(false);
    });
  });

  describe("fetchDashboard async thunk", () => {
    it("should set loading true on pending", () => {
      // Arrange: Initial state
      const currentState = { ...initialState };

      // Act: Dispatch pending action
      const newState = dashboardReducer(currentState, {
        type: fetchDashboard.pending.type,
      });

      // Assert: Should set loading to true and clear error
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it("should set data and lastFetched on fulfilled", () => {
      // Arrange: State with loading true
      const loadingState: DashboardState = {
        ...initialState,
        loading: true,
      };

      const mockData = {
        companyAtGlance: {
          totalWorkforce: 1250,
          averageHourlyWage: 18.5,
          averageSalary: 52000,
        },
        strategicRecommendations: [],
        industryOverview: null,
        turnoverVoluntaryVsInvoluntary: null,
        rateOfSeparation: null,
        areaMedianWage: [],
        housingCost: [],
      };

      // Mock Date.now for consistent lastFetched
      const mockTimestamp = 1234567890;
      vi.spyOn(Date, "now").mockReturnValue(mockTimestamp);

      // Act: Dispatch fulfilled action
      const newState = dashboardReducer(loadingState, {
        type: fetchDashboard.fulfilled.type,
        payload: mockData,
      });

      // Assert: Should set data, clear error, set lastFetched, and stop loading
      expect(newState.loading).toBe(false);
      expect(newState.data).toEqual(mockData);
      expect(newState.error).toBeNull();
      expect(newState.lastFetched).toBe(mockTimestamp);

      // Cleanup
      vi.restoreAllMocks();
    });

    it("should set error on rejected", () => {
      // Arrange: State with loading true
      const loadingState: DashboardState = {
        ...initialState,
        loading: true,
      };

      const errorMessage = "Request timed out. Please try again.";

      // Act: Dispatch rejected action
      const newState = dashboardReducer(loadingState, {
        type: fetchDashboard.rejected.type,
        payload: errorMessage,
      });

      // Assert: Should set error, stop loading, keep data null
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(errorMessage);
      expect(newState.data).toBeNull();
    });

    it("should clear error when pending", () => {
      // Arrange: State with previous error
      const errorState: DashboardState = {
        ...initialState,
        error: "Previous timeout error",
      };

      // Act: Dispatch pending action (retry scenario)
      const newState = dashboardReducer(errorState, {
        type: fetchDashboard.pending.type,
      });

      // Assert: Should clear previous error and set loading
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });
  });
});

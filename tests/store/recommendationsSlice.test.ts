/**
 * Recommendations Redux Slice Tests
 *
 * Unit tests for recommendationsSlice reducers, actions, and async thunks.
 * Tests state transitions for loading, success, and error states.
 * Follows patterns from workforceSlice.test.ts.
 */

import { describe, it, expect, vi } from "vitest";
import recommendationsReducer, {
  fetchRecommendations,
  clearRecommendations,
  clearRecommendationsError,
  resetRecommendations,
} from "@/store/slices/recommendationsSlice";
import type { RecommendationsState } from "@/types/recommendationsTypes";

// Mock the API service
vi.mock("@/services/api/recommendationsApi");

const initialState: RecommendationsState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
  isLoaded: false,
};

const mockData = {
  assessmentType: "finch",
  recommendation: {
    strategicRecommendations: [
      {
        order: 1,
        title: "Emergency Savings",
        category: "General",
        matchScore: 1.83,
        description: "A financial safety net.",
        keyFeatures: ["Reduces turnover"],
        matchedGoals: ["Retain Talent"],
        providerName: "Sunny Day Fund",
        workerRanking: 1,
        priorityLevelUsed: 1,
      },
    ],
    autoEnroll: true,
    nonElectiveMatch: false,
    healthcareAffordability: false,
    dataStatus: "available",
  },
};

describe("recommendationsSlice", () => {
  describe("initial state", () => {
    it("should return correct initial state", () => {
      expect(recommendationsReducer(undefined, { type: "unknown" })).toEqual(initialState);
    });
  });

  describe("fetchRecommendations async thunk", () => {
    it("should set loading true and clear error on pending", () => {
      const action = fetchRecommendations.pending("", undefined);
      const state = recommendationsReducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should set data, isLoaded and clear loading on fulfilled", () => {
      const action = fetchRecommendations.fulfilled(mockData, "", undefined);
      const state = recommendationsReducer(initialState, action);
      expect(state.loading).toBe(false);
      expect(state.data).toEqual(mockData);
      expect(state.isLoaded).toBe(true);
      expect(state.error).toBeNull();
      expect(state.lastFetched).not.toBeNull();
    });

    it("should set error and clear loading on rejected", () => {
      const action = fetchRecommendations.rejected(
        new Error("Network error"),
        "",
        undefined,
        "Network error"
      );
      const state = recommendationsReducer(initialState, action);
      expect(state.loading).toBe(false);
      expect(state.error).toBe("Network error");
      expect(state.isLoaded).toBe(false);
    });

    it("should use default error message when no payload on rejected", () => {
      const action = fetchRecommendations.rejected(null, "", undefined, undefined);
      const state = recommendationsReducer(initialState, action);
      expect(state.error).toBe("An unexpected error occurred");
    });
  });

  describe("clearRecommendations action", () => {
    it("should reset data, error and lastFetched but keep loading false", () => {
      const loadedState: RecommendationsState = {
        data: mockData,
        loading: false,
        error: null,
        lastFetched: 1234567890,
        isLoaded: true,
      };
      const state = recommendationsReducer(loadedState, clearRecommendations());
      expect(state.data).toBeNull();
      expect(state.error).toBeNull();
      expect(state.lastFetched).toBeNull();
      expect(state.isLoaded).toBe(false);
    });
  });

  describe("clearRecommendationsError action", () => {
    it("should clear error while preserving all other state", () => {
      const errorState: RecommendationsState = {
        ...initialState,
        error: "Something went wrong",
        data: mockData,
        isLoaded: true,
      };
      const state = recommendationsReducer(errorState, clearRecommendationsError());
      expect(state.error).toBeNull();
      expect(state.data).toEqual(mockData);
      expect(state.isLoaded).toBe(true);
    });
  });

  describe("resetRecommendations action", () => {
    it("should return to initial state completely", () => {
      const loadedState: RecommendationsState = {
        data: mockData,
        loading: false,
        error: "some error",
        lastFetched: 1234567890,
        isLoaded: true,
      };
      expect(recommendationsReducer(loadedState, resetRecommendations())).toEqual(initialState);
    });
  });

  describe("auth/logout matcher", () => {
    it("should reset to initial state on auth/logout", () => {
      const loadedState: RecommendationsState = {
        data: mockData,
        loading: false,
        error: null,
        lastFetched: 1234567890,
        isLoaded: true,
      };
      const state = recommendationsReducer(loadedState, { type: "auth/logout" });
      expect(state).toEqual(initialState);
    });

    it("should reset to initial state on auth/logout/fulfilled", () => {
      const loadedState: RecommendationsState = {
        data: mockData,
        loading: false,
        error: null,
        lastFetched: 1234567890,
        isLoaded: true,
      };
      const state = recommendationsReducer(loadedState, { type: "auth/logout/fulfilled" });
      expect(state).toEqual(initialState);
    });

    it("should not reset state on other action types", () => {
      const loadedState: RecommendationsState = {
        data: mockData,
        loading: false,
        error: null,
        lastFetched: 1234567890,
        isLoaded: true,
      };
      const state = recommendationsReducer(loadedState, { type: "other/action" });
      expect(state.isLoaded).toBe(true);
    });
  });

  describe("fetchRecommendations thunk error branches", () => {
    it("should use fallback error when rejected payload is undefined", () => {
      const newState = recommendationsReducer(initialState, {
        type: fetchRecommendations.rejected.type,
        payload: undefined,
      });
      expect(newState.error).toBe("An unexpected error occurred");
    });

    it("fetchRecommendations thunk uses fallback error when non-Error is thrown", async () => {
      const recommendationsApi = await import("@/services/api/recommendationsApi");
      vi.mocked((recommendationsApi as any).getRecommendations).mockRejectedValueOnce(
        "string error"
      );
      const { configureStore } = await import("@reduxjs/toolkit");
      const store = configureStore({ reducer: { recommendations: recommendationsReducer } });
      await store.dispatch(fetchRecommendations());
      const state = store.getState().recommendations;
      expect(state.error).toBeTruthy();
    });
  });
});

/**
 * Recommendations Redux Selector Tests
 *
 * Unit tests for recommendationsSelectors typed selector functions.
 * Follows patterns from workforceSelectors.test.ts.
 */

import { describe, it, expect } from "vitest";
import {
  selectRecommendationsData,
  selectRecommendationsLoading,
  selectRecommendationsError,
  selectRecommendationsIsLoaded,
  selectRecommendationItem,
  selectRecommStrategicRecommendations,
  selectProvenStrategiesFlags,
} from "@/store/selectors/recommendationsSelectors";
import type { RootState } from "@/store/store";
import type { RecommendationsApiResponse } from "@/types/recommendationsTypes";

const mockRecommendationsData: RecommendationsApiResponse = {
  assessmentType: "finch",
  recommendation: {
    strategicRecommendations: [
      {
        order: 3,
        title: "Financial Coaching",
        category: "General",
        matchScore: 1.33,
        description: "Financial coaching that lowers employee stress.",
        keyFeatures: ["Improves productivity"],
        matchedGoals: ["Retain Talent"],
        providerName: "TrustPlus",
        workerRanking: 4,
        priorityLevelUsed: 1,
      },
      {
        order: 1,
        title: "Emergency Savings",
        category: "General",
        matchScore: 1.83,
        description: "A financial safety net.",
        keyFeatures: ["Reduces turnover", "Reduces absenteeism"],
        matchedGoals: ["Reduce Absenteeism", "Retain Talent"],
        providerName: "Sunny Day Fund",
        workerRanking: 1,
        priorityLevelUsed: 1,
      },
      {
        order: 2,
        title: "Medical Financing",
        category: "General",
        matchScore: 1.33,
        description: "On-demand access to funds for high-cost medical expenses.",
        keyFeatures: ["Reduces financial strain"],
        matchedGoals: ["Reduce Absenteeism"],
        providerName: "medZERO",
        workerRanking: 3,
        priorityLevelUsed: 1,
      },
    ],
    autoEnroll: true,
    nonElectiveMatch: false,
    healthcareAffordability: true,
    dataStatus: "available",
  },
};

const makeState = (
  overrides: Partial<RootState["recommendations"]> = {}
): Pick<RootState, "recommendations"> => ({
  recommendations: {
    data: null,
    loading: false,
    error: null,
    lastFetched: null,
    isLoaded: false,
    ...overrides,
  },
});

describe("recommendationsSelectors", () => {
  describe("selectRecommendationsData", () => {
    it("returns null when no data loaded", () => {
      expect(selectRecommendationsData(makeState() as RootState)).toBeNull();
    });
    it("returns data when loaded", () => {
      expect(
        selectRecommendationsData(makeState({ data: mockRecommendationsData }) as RootState)
      ).toEqual(mockRecommendationsData);
    });
  });

  describe("selectRecommendationsLoading", () => {
    it("returns false by default", () => {
      expect(selectRecommendationsLoading(makeState() as RootState)).toBe(false);
    });
    it("returns true when loading", () => {
      expect(selectRecommendationsLoading(makeState({ loading: true }) as RootState)).toBe(true);
    });
  });

  describe("selectRecommendationsError", () => {
    it("returns null when no error", () => {
      expect(selectRecommendationsError(makeState() as RootState)).toBeNull();
    });
    it("returns error string when error present", () => {
      expect(
        selectRecommendationsError(makeState({ error: "Something went wrong" }) as RootState)
      ).toBe("Something went wrong");
    });
  });

  describe("selectRecommendationsIsLoaded", () => {
    it("returns false by default", () => {
      expect(selectRecommendationsIsLoaded(makeState() as RootState)).toBe(false);
    });
    it("returns true when isLoaded", () => {
      expect(selectRecommendationsIsLoaded(makeState({ isLoaded: true }) as RootState)).toBe(true);
    });
  });

  describe("selectRecommendationItem", () => {
    it("returns null when data is null", () => {
      expect(selectRecommendationItem(makeState() as RootState)).toBeNull();
    });
    it("returns the inner recommendation object when data is loaded", () => {
      const state = makeState({ data: mockRecommendationsData }) as RootState;
      expect(selectRecommendationItem(state)).toEqual(mockRecommendationsData.recommendation);
    });
  });

  describe("selectRecommStrategicRecommendations", () => {
    it("returns empty array when data is null", () => {
      expect(selectRecommStrategicRecommendations(makeState() as RootState)).toEqual([]);
    });

    it("returns empty array when strategicRecommendations is missing", () => {
      const dataWithNoRecs: RecommendationsApiResponse = {
        recommendation: {
          ...mockRecommendationsData.recommendation,
          strategicRecommendations: [],
        },
      };
      const state = makeState({ data: dataWithNoRecs }) as RootState;
      expect(selectRecommStrategicRecommendations(state)).toEqual([]);
    });

    it("returns recommendations sorted by order ascending", () => {
      const state = makeState({ data: mockRecommendationsData }) as RootState;
      const result = selectRecommStrategicRecommendations(state);
      expect(result).toHaveLength(3);
      expect(result[0].order).toBe(1);
      expect(result[0].title).toBe("Emergency Savings");
      expect(result[1].order).toBe(2);
      expect(result[1].title).toBe("Medical Financing");
      expect(result[2].order).toBe(3);
      expect(result[2].title).toBe("Financial Coaching");
    });

    it("does not mutate the original array order", () => {
      const state = makeState({ data: mockRecommendationsData }) as RootState;
      // Original data has order: 3, 1, 2
      expect(mockRecommendationsData.recommendation.strategicRecommendations[0].order).toBe(3);
      selectRecommStrategicRecommendations(state);
      // Still in original order after selector call
      expect(mockRecommendationsData.recommendation.strategicRecommendations[0].order).toBe(3);
    });
  });

  describe("selectProvenStrategiesFlags", () => {
    it("returns all false when data is null", () => {
      expect(selectProvenStrategiesFlags(makeState() as RootState)).toEqual({
        nonElectiveMatch: false,
        autoEnroll: false,
        healthcareAffordability: false,
      });
    });

    it("returns correct flag values from loaded data", () => {
      // mockRecommendationsData has: autoEnroll: true, nonElectiveMatch: false, healthcareAffordability: true
      const state = makeState({ data: mockRecommendationsData }) as RootState;
      expect(selectProvenStrategiesFlags(state)).toEqual({
        nonElectiveMatch: false,
        autoEnroll: true,
        healthcareAffordability: true,
      });
    });

    it("returns all true when all flags are true", () => {
      const allTrueData: RecommendationsApiResponse = {
        recommendation: {
          ...mockRecommendationsData.recommendation,
          autoEnroll: true,
          nonElectiveMatch: true,
          healthcareAffordability: true,
        },
      };
      const state = makeState({ data: allTrueData }) as RootState;
      expect(selectProvenStrategiesFlags(state)).toEqual({
        nonElectiveMatch: true,
        autoEnroll: true,
        healthcareAffordability: true,
      });
    });
  });
});

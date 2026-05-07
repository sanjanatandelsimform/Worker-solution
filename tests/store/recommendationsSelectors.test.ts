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
  selectRecommCompanyOverview,
} from "@/store/selectors/recommendationsSelectors";
import type { RootState } from "@/store/store";
import type { RecommendationsApiResponse, CompanyOverview } from "@/types/recommendationsTypes";

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
    autoEnroll: "green",
    nonElectiveMatch: "hidden",
    healthcareAffordability: "green",
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
    it("returns all 'hidden' when data is null", () => {
      expect(selectProvenStrategiesFlags(makeState() as RootState)).toEqual({
        nonElectiveMatch: "hidden",
        autoEnroll: "hidden",
        healthcareAffordability: "hidden",
      });
    });

    it("returns correct flag values from loaded data", () => {
      // mockRecommendationsData has: autoEnroll: "green", nonElectiveMatch: "hidden", healthcareAffordability: "green"
      const state = makeState({ data: mockRecommendationsData }) as RootState;
      expect(selectProvenStrategiesFlags(state)).toEqual({
        nonElectiveMatch: "hidden",
        autoEnroll: "green",
        healthcareAffordability: "green",
      });
    });

    it("returns all 'green' when all flags are 'green'", () => {
      const allGreenData: RecommendationsApiResponse = {
        ...mockRecommendationsData,
        recommendation: {
          ...mockRecommendationsData.recommendation,
          autoEnroll: "green",
          nonElectiveMatch: "green",
          healthcareAffordability: "green",
        },
      };
      const state = makeState({ data: allGreenData }) as RootState;
      expect(selectProvenStrategiesFlags(state)).toEqual({
        nonElectiveMatch: "green",
        autoEnroll: "green",
        healthcareAffordability: "green",
      });
    });

    it("normalises unrecognised value to 'hidden'", () => {
      const legacyData: RecommendationsApiResponse = {
        ...mockRecommendationsData,
        recommendation: {
          ...mockRecommendationsData.recommendation,
          // Cast to simulate a legacy boolean payload arriving from the API
          autoEnroll: true as unknown as import("@/types/strategyFlagTypes").StrategyFlagStatus,
          nonElectiveMatch:
            false as unknown as import("@/types/strategyFlagTypes").StrategyFlagStatus,
          healthcareAffordability:
            "active" as unknown as import("@/types/strategyFlagTypes").StrategyFlagStatus,
        },
      };
      const state = makeState({ data: legacyData }) as RootState;
      expect(selectProvenStrategiesFlags(state)).toEqual({
        autoEnroll: "hidden",
        nonElectiveMatch: "hidden",
        healthcareAffordability: "hidden",
      });
    });
  });

  describe("selectRecommCompanyOverview", () => {
    it("returns null when data is null", () => {
      expect(selectRecommCompanyOverview(makeState() as RootState)).toBeNull();
    });

    it("returns null when companyOverview is absent from response", () => {
      const state = makeState({ data: mockRecommendationsData }) as RootState;
      // mockRecommendationsData has no companyOverview field
      expect(selectRecommCompanyOverview(state)).toBeNull();
    });

    it("returns the companyOverview object when present", () => {
      const overview: CompanyOverview = {
        totalWorkforce: 200,
        avgHourlyRate: 22.5,
        avgSalary: 60000,
      };
      const dataWithOverview: RecommendationsApiResponse = {
        ...mockRecommendationsData,
        companyOverview: overview,
      };
      const state = makeState({ data: dataWithOverview }) as RootState;
      expect(selectRecommCompanyOverview(state)).toEqual(overview);
    });

    it("returns totalWorkforce: 0 without coercing to null (zero-value edge case)", () => {
      const overview: CompanyOverview = { totalWorkforce: 0, avgHourlyRate: 0, avgSalary: 0 };
      const dataWithOverview: RecommendationsApiResponse = {
        ...mockRecommendationsData,
        companyOverview: overview,
      };
      const state = makeState({ data: dataWithOverview }) as RootState;
      expect(selectRecommCompanyOverview(state)?.totalWorkforce).toBe(0);
    });
  });
});

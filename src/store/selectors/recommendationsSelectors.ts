/**
 * Recommendations Redux Selectors
 *
 * Typed selectors for accessing recommendations state sections.
 * Follows patterns from workforceSelectors.ts.
 *
 * Based on: specs/011-recommendations-api/data-model.md
 */

import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import type {
  RecommendationsApiResponse,
  RecommendationData,
  StrategicRecommendation,
} from "@/types/recommendationsTypes";

/** Select the entire recommendations slice state */
export const selectRecommendationsState = (state: RootState) => state.recommendations;

/** Select the full recommendations API response (null until loaded) */
export const selectRecommendationsData = (state: RootState): RecommendationsApiResponse | null =>
  state.recommendations.data;

/** Select recommendations loading flag */
export const selectRecommendationsLoading = (state: RootState): boolean =>
  state.recommendations.loading;

/** Select recommendations error message (null when no error) */
export const selectRecommendationsError = (state: RootState): string | null =>
  state.recommendations.error;

/** Select whether recommendations data has been successfully loaded at least once */
export const selectRecommendationsIsLoaded = (state: RootState): boolean =>
  state.recommendations.isLoaded;

/**
 * Select the inner `recommendation` object from the API response.
 * Contains flags, strategicRecommendations array, and companyAtGlance.
 */
export const selectRecommendationItem = (state: RootState): RecommendationData | null =>
  state.recommendations.data?.recommendation ?? null;

/**
 * Select strategic recommendations sorted by order (ascending).
 * Returns empty array if no recommendations available.
 */
export const selectRecommStrategicRecommendations = createSelector(
  [selectRecommendationItem],
  (item): StrategicRecommendation[] => {
    if (!item?.strategicRecommendations) return [];
    return [...item.strategicRecommendations].sort((a, b) => a.order - b.order);
  }
);

/**
 * Select the three proven strategy implementation flags.
 * Defaults all flags to false when data is not yet loaded.
 */
export const selectProvenStrategiesFlags = createSelector(
  [selectRecommendationItem],
  (item): { nonElectiveMatch: boolean; autoEnroll: boolean; healthcareAffordability: boolean } => ({
    nonElectiveMatch: item?.nonElectiveMatch ?? false,
    autoEnroll: item?.autoEnroll ?? false,
    healthcareAffordability: item?.healthcareAffordability ?? false,
  })
);

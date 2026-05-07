/**
 * Recommendations Redux Selectors
 *
 * Typed selectors for accessing recommendations state sections.
 * Follows patterns from workforceSelectors.ts.
 *
 * Based on: specs/011-recommendations-api/data-model.md
 * Updated: specs/001-proven-strategy-flags — selectProvenStrategiesFlags returns StrategyFlagStatus
 */

import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import type {
  RecommendationsApiResponse,
  RecommendationData,
  StrategicRecommendation,
  CompanyOverview,
} from "@/types/recommendationsTypes";
import type { StrategyFlagStatus } from "@/types/strategyFlagTypes";
import { normaliseFlag } from "@/utils/strategyFlagUtils";

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
 * Contains flags and strategicRecommendations array.
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
 * Select the three proven strategy implementation flags from the Recommendations API.
 * Returns StrategyFlagStatus values; unknown/absent/boolean values default to "hidden".
 * Note: In the Finch flow, healthcareAffordability is overridden by the Workforce API
 * (done in RecommendationsFinchPage, not in this selector).
 */
export const selectProvenStrategiesFlags = createSelector(
  [selectRecommendationItem],
  (
    item
  ): {
    nonElectiveMatch: StrategyFlagStatus;
    autoEnroll: StrategyFlagStatus;
    healthcareAffordability: StrategyFlagStatus;
  } => ({
    nonElectiveMatch: normaliseFlag(item?.nonElectiveMatch),
    autoEnroll: normaliseFlag(item?.autoEnroll),
    healthcareAffordability: normaliseFlag(item?.healthcareAffordability),
  })
);

/**
 * Select the companyOverview object from the recommendations API response.
 * Returns null when absent (Finch-connected users or older API versions).
 * Used by RecommendationsFinchPage to populate company at a glance for non-connected users.
 */
export const selectRecommCompanyOverview = (state: RootState): CompanyOverview | null =>
  state.recommendations.data?.companyOverview ?? null;

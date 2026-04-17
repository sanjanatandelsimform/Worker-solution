/**
 * Workforce Redux Selectors
 *
 * Typed selectors for accessing workforce state sections.
 * Follows patterns from dashboardSelectors (if present) or standard RTK selector patterns.
 *
 * Based on: specs/009-workforce-tab-api/plan.md
 */

import type { RootState } from "@/store/store";
import type {
  WorkforceApiResponse,
  Participation,
  Demographics,
  Compensation,
} from "@/types/workforceTypes";

/** Select the entire workforce slice state */
export const selectWorkforceState = (state: RootState) => state.workforce;

/** Select the full workforce API response (null until loaded) */
export const selectWorkforceData = (state: RootState): WorkforceApiResponse | null =>
  state.workforce.data;

/** Select workforce loading flag */
export const selectWorkforceLoading = (state: RootState): boolean => state.workforce.loading;

/** Select workforce error message (null when no error) */
export const selectWorkforceError = (state: RootState): string | null => state.workforce.error;

/** Select the timestamp when workforce data was last successfully fetched */
export const selectWorkforceLastFetched = (state: RootState): number | null =>
  state.workforce.lastFetched;

/** Select whether workforce data has been successfully loaded at least once */
export const selectWorkforceIsLoaded = (state: RootState): boolean => state.workforce.isLoaded;

/**
 * Select the top-level `workforce` section of the API response.
 * Contains totalWorkforce, enrolledBenefits, avgEmployeeCost, employerCostPerEmployee.
 */
export const selectWorkforceSection = (state: RootState) =>
  state.workforce.data?.workforce.workforce ?? null;

/**
 * Select the `participation` section of the API response.
 * Contains enrollment rates, benefits breakdown.
 */
export const selectParticipationSection = (state: RootState): Participation | null =>
  state.workforce.data?.workforce.participation ?? null;

/**
 * Select the `demographics` section of the API response.
 * Contains employmentType, gender, age breakdown.
 */
export const selectDemographicsSection = (state: RootState): Demographics | null =>
  state.workforce.data?.workforce.demographics ?? null;

/**
 * Select the `compensation` section of the API response.
 * Contains salaryBreakdown, workforceBreakdown (departments), benefitsCost.
 */
export const selectCompensationSection = (state: RootState): Compensation | null =>
  state.workforce.data?.workforce.compensation ?? null;

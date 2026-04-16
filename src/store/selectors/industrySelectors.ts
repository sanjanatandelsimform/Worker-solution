// /**
//  * Industry Redux Selectors
//  *
//  * Typed selectors for accessing industry state from Redux store.
//  * Follows patterns from dashboardSelectors.ts.
//  *
//  * Usage:
//  * ```typescript
//  * const data = useAppSelector(selectIndustryData);
//  * const loading = useAppSelector(selectIndustryLoading);
//  * ```
//  */

// import type { RootState } from "@/store/store";
// import type {
//   IndustryData,
//   IndustryOverview,
//   IndustryTurnoverComparison,
//   AreaMedianWage,
//   HousingBurden,
// } from "@/types/industryTypes";


// /**
//  * Select industry loading state
//  */
// export const selectIndustryLoading = (state: RootState): boolean => state.industry.loading;

// /**
//  * Select industry error message (null if no error)
//  */
// export const selectIndustryError = (state: RootState): string | null => state.industry.error;

// /**
//  * Select whether industry data has been loaded at least once
//  */
// export const selectIndustryIsLoaded = (state: RootState): boolean => state.industry.isLoaded;

// /**
//  * Select industry overview section
//  */

// /**
//  * Select industry turnover comparison (voluntary/involuntary + separation/hiring)
//  */
// export const selectIndustryTurnoverComparison = (
//   state: RootState
// ): IndustryTurnoverComparison | null => state.industry.data?.industry ?? null;

// /**
//  * Select area median wage data
//  */

// /**
//  * Select housing burden data
//  */
// export const selectIndustryHousingBurden = (state: RootState): HousingBurden | null =>
//   state.industry.data?.housingBurden ?? null;

// // industrySelectors.ts
// export const selectIndustryOverviewData = (state: RootState) => state.industry.data?.industryOverview ?? null;
// export const selectIndustryZipCodes = (state: RootState) => state.industry.data?.areaMedianWage?.availableZipcodes ?? null;
// export const selectIndustryData = (state: RootState) => state.industry.data?.industry ?? null;
// export const selectIndustryHousingData = (state: RootState) => state.industry.data?.housingBurden?.data ?? null;
// export const selectIndustryAreaMedianWage = (state: RootState) => state.industry.data?.areaMedianWage ?? null;
// export const selectIndustryTurnOverRate = (state: RootState) => state.industry.data?.industry ?? null;
import type { RootState } from "@/store/store";
import type { IndustryData, IndustryOverview, AreaMedianWage, HousingBurden } from "@/types/industryTypes";

// ── Core state selectors ──────────────────────────────────────────────────

export const selectIndustryLoading = (state: RootState): boolean => 
  state.industry.loading;

export const selectIndustryError = (state: RootState): string | null => 
  state.industry.error;

export const selectIndustryIsLoaded = (state: RootState): boolean => 
  state.industry.isLoaded;

// Full data object (used by useIndustry hook)
export const selectIndustryFullData = (state: RootState): IndustryData | null => 
  state.industry.data ?? null;

// ── Derived data selectors (used by BenchmarkPage) ────────────────────────

// industryOverview → { turnoverRate, avgTurnover, industryWideCostOfTurnover, rates }
export const selectIndustryOverviewData = (state: RootState): IndustryData["industryOverview"] | null =>
  state.industry.data?.industryOverview ?? null;

// industry → { turnOverRate, seperationRate }
export const selectIndustryData = (state: RootState): IndustryData["industry"] | null =>
  state.industry.data?.industry ?? null;

// industry turnover rate specifically
export const selectIndustryTurnOverRate = (state: RootState): IndustryData["industry"] | null =>
  state.industry.data?.industry ?? null;

// areaMedianWage → { availableZipcodes, stateData, nationalAvgSalary, ... }
export const selectIndustryAreaMedianWage = (state: RootState): IndustryData["areaMedianWage"] | null =>
  state.industry.data?.areaMedianWage ?? null;

// availableZipcodes array
export const selectIndustryZipCodes = (state: RootState): string[] | null =>
  state.industry.data?.areaMedianWage?.availableZipcodes ?? null;

// housingBurden data array
export const selectIndustryHousingData = (state: RootState): IndustryData["housingBurden"]["data"] | null =>
  state.industry.data?.housingBurden?.data ?? null;
import type { RootState } from "@/store/store";

// ── Base selectors ──
export const selectIndustryLoading = (state: RootState): boolean => state.industry.loading;
export const selectIndustryError = (state: RootState): string | null => state.industry.error;
export const selectIndustryIsLoaded = (state: RootState): boolean => state.industry.isLoaded;
export const selectIndustryFullData = (state: RootState) => state.industry.data ?? null;

// industryOverview
export const selectIndustryOverviewData = (state: RootState) =>
  state.industry.data?.industryOverview ?? null;

// industry → { code, name }
export const selectIndustryData = (state: RootState) =>
  state.industry.data?.industry ?? null;

// industryTurnover → { turnOverRate, seperationRate } with new nested structure
export const selectIndustryTurnOverRate = (state: RootState) =>
  state.industry.data?.industryTurnover ?? null;

// areaMedianWage → flat array
export const selectIndustryAreaMedianWage = (state: RootState) =>
  state.industry.data?.areaMedianWage ?? [];

// housingCost → flat array
export const selectIndustryHousingData = (state: RootState) =>
  state.industry.data?.housingCost ?? [];

// zip codes derived from areaMedianWage
export const selectIndustryZipCodes = (state: RootState): string[] =>
  state.industry.data?.areaMedianWage?.map((w: { zipcode: string }) => w.zipcode) ?? [];
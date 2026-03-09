/**
 * Dashboard Redux Selectors
 *
 * Typed selectors for accessing dashboard state from Redux store.
 * Follows patterns from authSelectors.ts and profileSelectors.ts.
 *
 * Usage:
 * ```typescript
 * const data = useAppSelector(selectDashboardData);
 * const loading = useAppSelector(selectDashboardLoading);
 * ```
 */

import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import type {
  DashboardResponse,
  CompanyAtGlance,
  StrategicRecommendation,
  IndustryOverview,
  TurnoverMetrics,
  SeparationMetrics,
  AreaMedianWage,
  HousingCost,
} from "@/types/dashboardTypes";

/**
 * Select the entire dashboard state
 */
export const selectDashboardState = (state: RootState) => state.dashboard;

/**
 * Select dashboard data (null if not loaded)
 */
export const selectDashboardData = (state: RootState): DashboardResponse | null =>
  state.dashboard.data;

/**
 * Select ZIP codes array from dashboard response
 */
export const selectZipCodes = (state: RootState): string[] => state.dashboard.data?.zipCodes || [];

/**
 * Select dashboard loading state
 */
export const selectDashboardLoading = (state: RootState): boolean => state.dashboard.loading;

/**
 * Select dashboard error message (null if no error)
 */
export const selectDashboardError = (state: RootState): string | null => state.dashboard.error;

/**
 * Select timestamp of last dashboard fetch
 */
export const selectDashboardLastFetched = (state: RootState): number | null =>
  state.dashboard.lastFetched;

/**
 * Select company at-a-glance metrics
 */
export const selectCompanyAtGlance = (state: RootState): CompanyAtGlance | null =>
  state.dashboard.data?.companyAtGlance || null;

/**
 * Select strategic recommendations sorted by order (ascending)
 * Returns empty array if no recommendations available
 */
// In dashboardSelectors.ts
export const selectStrategicRecommendations = createSelector(
  [selectDashboardData],
  (data): StrategicRecommendation[] => {
    if (!data || !data.strategicRecommendations) return [];

    // Sort by order field (ascending = higher priority)
    return [...data.strategicRecommendations].sort((a, b) => a.order - b.order);
  }
);

/**
 * Select industry overview metrics
 */
export const selectIndustryOverview = (state: RootState): IndustryOverview | null =>
  state.dashboard.data?.industryOverview || null;

/**
 * Select turnover voluntary vs involuntary metrics
 */
export const selectTurnoverMetrics = (state: RootState): TurnoverMetrics | null =>
  state.dashboard.data?.turnoverVoluntaryVsInvoluntary || null;

/**
 * Select separation metrics
 */
export const selectSeparationMetrics = (state: RootState): SeparationMetrics | null =>
  state.dashboard.data?.rateOfSeparation || null;

/**
 * Select first area median wage entry (primary display value)
 * Returns null if array is empty
 */
export const selectPrimaryAreaMedianWage = createSelector(
  [selectDashboardData],
  (data): AreaMedianWage | null => {
    if (!data || !data.areaMedianWage || data.areaMedianWage.length === 0) {
      return null;
    }
    return data.areaMedianWage[0];
  }
);

/**
 * Select first housing cost entry (primary display value)
 * Returns null if array is empty
 */
export const selectPrimaryHousingCost = createSelector(
  [selectDashboardData],
  (data): HousingCost | null => {
    if (!data || !data.housingCost || data.housingCost.length === 0) {
      return null;
    }
    return data.housingCost[0];
  }
);

/**
 * Select whether dashboard has been successfully loaded
 */
// export const selectDashboardIsLoaded = createSelector(
//   [selectDashboardData, selectDashboardLoading],
//   (data, loading): boolean => {
//     return !loading && data !== null;
//   }
// );

export const selectDashboardIsLoaded = (state: RootState) => state.dashboard.isLoaded;

/**
 * Select whether dashboard is in error state
 */
export const selectDashboardHasError = createSelector([selectDashboardError], (error): boolean => {
  return error !== null;
});

/**
 * Helper selectors for extracting specific nested values from the API response
 * These selectors make it easier to access deeply nested data in components
 */

/**
 * Select primary housing cost burdened owners percentage
 */
export const selectBurdenedOwnersPercentage = createSelector(
  [selectPrimaryHousingCost],
  (housingCost): { burdened: number; severelyBurdened: number } | null => {
    if (
      !housingCost ||
      !housingCost.housingCostBurdenedOwners ||
      housingCost.housingCostBurdenedOwners.length === 0
    ) {
      return null;
    }
    return {
      burdened: housingCost.housingCostBurdenedOwners[0].burdened,
      severelyBurdened: housingCost.housingCostBurdenedOwners[0].severelyBurdened,
    };
  }
);

/**
 * Select primary housing cost burdened renters percentage
 */
export const selectBurdenedRentersPercentage = createSelector(
  [selectPrimaryHousingCost],
  (housingCost): { burdened: number; severelyBurdened: number } | null => {
    if (
      !housingCost ||
      !housingCost.housingCostBurdenedRenters ||
      housingCost.housingCostBurdenedRenters.length === 0
    ) {
      return null;
    }
    return {
      burdened: housingCost.housingCostBurdenedRenters[0].burdened,
      severelyBurdened: housingCost.housingCostBurdenedRenters[0].severelyBurdened,
    };
  }
);

/**
 * Select working class housing cost burden data
 */
export const selectWorkingClassHousingCostBurden = createSelector(
  [selectPrimaryHousingCost],
  (
    housingCost
  ): {
    homeOwnershipRate: number;
    medianHomeValue: number;
    medianRent: number;
  } | null => {
    if (!housingCost || !housingCost.workingClassHousingCostBurden) {
      return null;
    }
    return housingCost.workingClassHousingCostBurden;
  }
);

/**
 * Select working class housing graph data (returns nested object structure)
 */
export const selectWorkingClassHousingGraph = createSelector(
  [selectPrimaryHousingCost],
  (
    housingCost
  ): {
    owners: {
      lowIncome: { burdened: number; severelyBurdened: number };
      moderateIncome: { burdened: number; severelyBurdened: number };
      medianIncome: { burdened: number; severelyBurdened: number };
      upperIncome: { burdened: number; severelyBurdened: number };
    };
    renters: {
      lowIncome: { burdened: number; severelyBurdened: number };
      moderateIncome: { burdened: number; severelyBurdened: number };
      medianIncome: { burdened: number; severelyBurdened: number };
      upperIncome: { burdened: number; severelyBurdened: number };
    };
  } | null => {
    if (!housingCost || !housingCost.workingClassHousingGraph) {
      return null;
    }
    return housingCost.workingClassHousingGraph;
  }
);

/**
 * Select area median wage graph data for WageBarChart
 * Transforms the API data into chart format with percentages relative to national average
 */
export const selectAreaMedianWageChartData = createSelector(
  [selectPrimaryAreaMedianWage],
  (
    areaMedianWage
  ): Array<{
    name: string;
    industryAverage: number;
    yourCompany: number;
    nationalAverage: number;
  }> | null => {
    if (!areaMedianWage || !areaMedianWage.graph) {
      return null;
    }

    const { graph } = areaMedianWage;
    const nationalSalary = graph.nationalAverage.salary || 1;
    const nationalHourly = graph.nationalAverage.hourly || 1;

    return [
      {
        name: "Salary",
        industryAverage: (graph.stateAverage.salary / nationalSalary) * 100,
        yourCompany: (graph.yourCompany.salary / nationalSalary) * 100,
        nationalAverage: 100,
      },
      {
        name: "Hourly",
        industryAverage: (graph.stateAverage.hourly / nationalHourly) * 100,
        yourCompany: (graph.yourCompany.hourly / nationalHourly) * 100,
        nationalAverage: 100,
      },
    ];
  }
);

/**
 * Selector factory: returns a selector that finds AreaMedianWage by zipcode
 */
export const makeSelectAreaMedianByZip = (zipcode?: string) =>
  createSelector([selectDashboardData], (data): AreaMedianWage | null => {
    if (!data || !data.areaMedianWage || data.areaMedianWage.length === 0 || !zipcode) {
      return null;
    }
    return data.areaMedianWage.find(a => a.zipcode === zipcode) || null;
  });

/**
 * Selector factory: returns a selector that finds HousingCost by zipcode
 */
export const makeSelectHousingCostByZip = (zipcode?: string) =>
  createSelector([selectDashboardData], (data): HousingCost | null => {
    if (!data || !data.housingCost || data.housingCost.length === 0 || !zipcode) {
      return null;
    }
    return data.housingCost.find(h => h.zipcode === zipcode) || null;
  });

/**
 * Select industry object from dashboard response
 * Returns null if industry is not available
 */
export const selectIndustry = (state: RootState): { code: string; name: string } | null =>
  state.dashboard.data?.industry || null;

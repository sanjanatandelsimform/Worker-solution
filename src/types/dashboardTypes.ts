/**
 * Dashboard API Types
 *
 * TypeScript interfaces for the GET /dashboard API response.
 * Based on: specs/001-dashboard-api-integration/data-model.md
 * Contract: specs/001-dashboard-api-integration/contracts/dashboard-api.yaml
 */

/**
 * Complete dashboard response from GET /dashboard endpoint
 */
export interface DashboardResponse {
  zipCodes?: string[]; // Array of ZIP codes for dropdown selection
  companyAtGlance: CompanyAtGlance | null;
  strategicRecommendations: StrategicRecommendation[];
  industryOverview: IndustryOverview | null;
  turnoverVoluntaryVsInvoluntary: TurnoverMetrics | null;
  rateOfSeparation: SeparationMetrics | null;
  areaMedianWage: AreaMedianWage[];
  housingCost: HousingCost[];
}

/**
 * Company at-a-glance metrics: workforce size and compensation
 */
export interface CompanyAtGlance {
  totalWorkforce: string | number | null; // Can be a range like "100-500" or a number
  averageHourlyWage: string | number | null; // Can be formatted like "$26+" or a number
  averageSalary: string | number | null; // Can be a range like "$30,000 - $50,000" or a number
  industryAverageWage: string | number | null;
  //   workingClassPopulation?: {
  //     count: number;
  //     percentage: number;
  //   };
}

/**
 * Strategic recommendation for company improvement
 */
export interface StrategicRecommendation {
  order: number;
  category: string;
  title: string;
  description: string;
  keyFeatures: string[] | string;
}

/**
 * Industry benchmark overview metrics
 */
export interface IndustryOverview {
  turnoverRate: {
    rate: number;
    year: number;
  } | null;
  avgTurnover: {
    rate: number;
    sinceYear: number;
  } | null;
  avgCostOfTurnover: {
    amount: number;
    formatted: string;
    year: number;
  } | null;
}

/**
 * Breakdown of voluntary vs involuntary employee turnover
 */
export interface TurnoverMetrics {
  quarter: number;
  year: number;
  percentage: {
    voluntary: number;
    involuntary: number;
  };
}

/**
 * Employee separation rate metrics
 */
export interface SeparationMetrics {
  quarter: number;
  year: number;
  percentage: {
    hiringRate: number;
    separationRate: number;
  };
}

/**
 * Area median wage comparison (state, company, national)
 */
export interface AreaMedianWage {
  zipcode: string;
  medianHourlyWages: number;
  medianLivingWage: number;
  nationalAverage: number;
  graph?: {
    stateAverage: {
      salary: number;
      hourly: number;
    };
    yourCompany: {
      salary: number;
      hourly: number;
    };
    nationalAverage: {
      salary: number;
      hourly: number;
    };
  };
}

/**
 * Graph data point for time-series or categorical data
 */
export interface GraphDataPoint {
  label: string;
  value: number;
}

/**
 * Housing cost burden metrics for workers
 */
export interface HousingCost {
  zipcode: string;
  housingCostBurdenedOwners: Array<{
    quarter: number;
    year: number;
    percentage: {
      burdened: number;
      severelyBurdened: number;
    };
  }>;
  housingCostBurdenedRenters: Array<{
    quarter: number;
    year: number;
    percentage: {
      burdened: number;
      severelyBurdened: number;
    };
  }>;
  workingClassHousingCostBurden?: {
    homeOwnershipRate: number;
    medianHomeValue: number;
    medianRent: number;
  };
  workingClassHousingGraph?: Array<{
    incomeCategory: string;
    label: string;
    range: string;
    burdened: number;
    severelyBurdened: number;
  }>;
}

/**
 * Redux state shape for dashboard slice
 */
export interface DashboardState {
  data: DashboardResponse | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

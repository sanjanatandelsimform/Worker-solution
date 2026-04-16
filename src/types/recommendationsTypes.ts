/**
 * Recommendations API Types
 *
 * TypeScript interfaces for the GET /api/v1/dashboard/recommendations API response.
 * Based on: specs/011-recommendations-api/data-model.md
 * Contract: specs/011-recommendations-api/contracts/recommendations-get.md
 */

/**
 * A single strategic recommendation returned by the API.
 */
export interface StrategicRecommendation {
  /** Display order (1-indexed; ascending = higher priority) */
  order: number;
  /** Benefit solution title, e.g. "Emergency Savings" */
  title: string;
  /** Category label, e.g. "General" */
  category: string;
  /** Weighted match score computed by the backend */
  matchScore: number;
  /** Human-readable description of the benefit solution */
  description: string;
  /** Short bullet-point feature highlights */
  keyFeatures: string[];
  /** Employer goals this recommendation addresses */
  matchedGoals: string[];
  /** Name of the benefit provider, e.g. "Sunny Day Fund" */
  providerName: string;
  /** Worker preference ranking (lower = higher preference) */
  workerRanking: number;
  /** Priority level used in the scoring algorithm */
  priorityLevelUsed: number;
}

/**
 * Company-at-a-glance summary included in the recommendations response.
 * Fields may be null when data is not yet available from Finch.
 */
export interface RecommendationCompanyAtGlance {
  totalWorkforce: number | null;
  averageHourlyWage: number | null;
  averageSalary: number | null;
}

/**
 * Core recommendation data: flags, strategic items, and company summary.
 */
export interface RecommendationData {
  /** Sorted list of tailored benefit solutions */
  strategicRecommendations: StrategicRecommendation[];
  /** Whether the employer has auto-enrollment enabled */
  autoEnroll: boolean;
  /** Whether the employer uses non-elective match contributions */
  nonElectiveMatch: boolean;
  /** Whether the employer has healthcare affordability measures in place */
  healthcareAffordability: boolean;
  /** Data availability status, e.g. "available" | "pending" */
  dataStatus: string;
  /** Company workforce summary (may contain nulls while data syncs) */
  companyAtGlance: RecommendationCompanyAtGlance;
}

/**
 * Top-level response from GET /api/v1/dashboard/recommendations
 */
export interface RecommendationsApiResponse {
  recommendation: RecommendationData;
}

/**
 * Redux slice state for the recommendations feature.
 * Follows the same shape as WorkforceState.
 */
export interface RecommendationsState {
  data: RecommendationsApiResponse | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  isLoaded: boolean;
}

/**
 * Recommendations API Types
 *
 * TypeScript interfaces for the GET /dashboard/recommendation API response.
 * Based on: specs/011-recommendations-api/data-model.md
 * Contract: specs/014-fix-workforce-rec-api/contracts/recommendation-get.md
 * Updated: specs/001-proven-strategy-flags — flag fields changed from boolean to StrategyFlagStatus
 */
import type { StrategyFlagStatus } from "./strategyFlagTypes";

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
 * Core recommendation data: flags, strategic items.
 */
export interface RecommendationData {
  /** Sorted list of tailored benefit solutions */
  strategicRecommendations: StrategicRecommendation[];
  /** Whether the employer has auto-enrollment enabled */
  autoEnroll: StrategyFlagStatus;
  /** Whether the employer uses non-elective match contributions */
  nonElectiveMatch: StrategyFlagStatus;
  /** Whether the employer has healthcare affordability measures in place */
  healthcareAffordability: StrategyFlagStatus;
  /** Data availability status, e.g. "available" | "pending" */
  dataStatus: string;
}

/**
 * Top-level response from GET /dashboard/recommendation
 */
export interface RecommendationsApiResponse {
  assessmentType: string;
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

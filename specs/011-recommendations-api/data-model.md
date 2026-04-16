# Data Model: Recommendations Finch Tab API Integration

**Feature**: 011-recommendations-api  
**Phase**: 1 — Design & Contracts  
**Date**: 2026-04-16

---

## TypeScript Interfaces

### File: `src/types/recommendationsTypes.ts`

```typescript
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
```

---

## Redux State Shape

```
state.recommendations: RecommendationsState {
  data: RecommendationsApiResponse | null,
  loading: boolean,
  error: string | null,
  lastFetched: number | null,
  isLoaded: boolean
}
```

---

## Selector Map

### File: `src/store/selectors/recommendationsSelectors.ts`

| Selector                               | Return Type                                                                            | Description                                 |
| -------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------- |
| `selectRecommendationsState`           | `RecommendationsState`                                                                 | Full slice state                            |
| `selectRecommendationsData`            | `RecommendationsApiResponse \| null`                                                   | Full API response                           |
| `selectRecommendationItem`             | `RecommendationData \| null`                                                           | Inner `recommendation` object               |
| `selectRecommStrategicRecommendations` | `StrategicRecommendation[]`                                                            | Sorted by `order` asc; empty array fallback |
| `selectProvenStrategiesFlags`          | `{ nonElectiveMatch: boolean; autoEnroll: boolean; healthcareAffordability: boolean }` | Three strategy implementation flags         |
| `selectRecommendationsLoading`         | `boolean`                                                                              | Slice loading flag                          |
| `selectRecommendationsError`           | `string \| null`                                                                       | Slice error message                         |
| `selectRecommendationsIsLoaded`        | `boolean`                                                                              | Whether data has loaded at least once       |

---

## Component Data Mapping

### `RecommendationsFinchPage.tsx` — post-migration selector usage

```typescript
// Workforce slice (Company + Benefits Overview)
const workforceSection = useAppSelector(selectWorkforceSection); // workforce.*
const compensationSection = useAppSelector(selectCompensationSection); // compensation.*
const participationSection = useAppSelector(selectParticipationSection); // participation.*
const workforceLoading = useAppSelector(selectWorkforceLoading);

// Recommendations slice (Core Benefits Enhancement + Strategic Solutions)
const recommendationItem = useAppSelector(selectRecommendationItem);
const strategicRecs = useAppSelector(selectRecommStrategicRecommendations);
const provenStrategyFlags = useAppSelector(selectProvenStrategiesFlags);
const recommendationsLoading = useAppSelector(selectRecommendationsLoading);
const recommendationsIsLoaded = useAppSelector(selectRecommendationsIsLoaded);
```

### Synthetic shapes for existing card configs

```typescript
// Company Overview cards — matches existing format function field names
const companyGlanceData = {
  totalWorkforce: workforceSection?.totalWorkforce ?? null,
  averageHourlyWage: compensationSection?.salaryBreakdown?.avgHourlyRate ?? null,
  averageSalary: compensationSection?.salaryBreakdown?.avgSalary ?? null,
  industryAverageWage: null, // not yet in workforce slice
};

// Benefits Overview cards — count values derived from participation
const benefitsGlanceData = {
  eligibleEmployees: participationSection?.totalWorkforce ?? null,
  enrolledEmployees: participationSection?.enrolledBenefits ?? null,
  enrolledInRetirement: participationSection?.retirementEnrollment ?? null,
  enrolledInHealthcare: participationSection?.healthcareEnrollment ?? null,
};
```

### Proven Strategies computed values

```typescript
const trueCount = [
  provenStrategyFlags.nonElectiveMatch,
  provenStrategyFlags.autoEnroll,
  provenStrategyFlags.healthcareAffordability,
].filter(Boolean).length;

const provenStrategiesTotal = 3;
const provenStrategiesPercent = Math.round((trueCount / provenStrategiesTotal) * 100);
// 0 flags → 0%  |  1 flag → 33%  |  2 flags → 66%  |  3 flags → 100%
```

---

## Static Stub Data

```typescript
// src/store/slices/recommendationsSlice.ts
const STATIC_RECOMMENDATIONS_DATA: RecommendationsApiResponse = {
  recommendation: {
    strategicRecommendations: [
      {
        order: 1,
        title: "Emergency Savings",
        category: "General",
        matchScore: 1.83,
        description:
          "A financial safety net that helps frontline workers manage everyday expenses and unexpected costs.",
        keyFeatures: ["Reduces turnover", "Reduces absenteeism"],
        matchedGoals: ["Reduce Absenteeism", "Retain Talent", "Attract Talent"],
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
        keyFeatures: ["Reduces financial strain", "Helps employees stay focused at work"],
        matchedGoals: ["Reduce Absenteeism", "Retain Talent"],
        providerName: "medZERO",
        workerRanking: 3,
        priorityLevelUsed: 1,
      },
      {
        order: 3,
        title: "Financial Coaching",
        category: "General",
        matchScore: 1.33,
        description: "Financial coaching that lowers employee stress.",
        keyFeatures: ["Improves productivity", "Supports a more resilient workforce"],
        matchedGoals: ["Reduce Absenteeism", "Retain Talent"],
        providerName: "TrustPlus",
        workerRanking: 4,
        priorityLevelUsed: 1,
      },
    ],
    autoEnroll: true,
    nonElectiveMatch: false,
    healthcareAffordability: false,
    dataStatus: "available",
    companyAtGlance: {
      totalWorkforce: null,
      averageHourlyWage: null,
      averageSalary: null,
    },
  },
};
```

With `autoEnroll: true`, `nonElectiveMatch: false`, `healthcareAffordability: false` → `trueCount = 1` → label shows **"1/3"**, progress bar at **33%**.

---

## Validation Rules

| Field                                                         | Rule                                                     |
| ------------------------------------------------------------- | -------------------------------------------------------- |
| `strategicRecommendations`                                    | May be empty array — UI shows fallback message           |
| `autoEnroll` / `nonElectiveMatch` / `healthcareAffordability` | Treated as `false` if `undefined`                        |
| `companyAtGlance.*`                                           | All fields may be `null` — cards show "N/A"              |
| `dataStatus`                                                  | Informational only — not used in current UI              |
| `matchScore`                                                  | Not displayed in current UI cards; stored for future use |
| `providerName`                                                | Not displayed in current cards; stored for future use    |

# Data Model: Company Overview Dual-Source Data

**Phase**: 1 — Design & Contracts  
**Feature**: `035-company-overview-recomm-api`  
**Date**: 2026-05-07

## New Interface: `CompanyOverview`

```typescript
/**
 * Company workforce size and compensation summary returned by the recommendations API.
 * Present on non-Finch (manual) assessments to supply company overview values
 * that would otherwise only come from the Workforce API.
 *
 * Path: response.recommendation.companyOverview
 */
export interface CompanyOverview {
  /** Total number of employees in the company */
  totalWorkforce: number;
  /** Average hourly wage across the workforce */
  avgHourlyRate: number;
  /** Average annual salary across the workforce */
  avgSalary: number;
}
```

## Modified Interface: `RecommendationData`

Add one optional field. All existing fields are **unchanged**.

```typescript
export interface RecommendationData {
  strategicRecommendations: StrategicRecommendation[];
  autoEnroll: StrategyFlagStatus;
  nonElectiveMatch: StrategyFlagStatus;
  healthcareAffordability: StrategyFlagStatus;
  dataStatus: string;
  /** Company overview for non-Finch assessments (absent for Finch-connected users) */
  companyOverview?: CompanyOverview;
}
```

## New Selector: `selectRecommCompanyOverview`

Location: `src/store/selectors/recommendationsSelectors.ts`

```typescript
/**
 * Select the companyOverview object from the recommendations API response.
 * Returns null when the field is absent (Finch-connected users or older API).
 * Used by RecommendationsFinchPage to populate company at a glance for non-connected users.
 */
export const selectRecommCompanyOverview = (state: RootState): CompanyOverview | null =>
  state.recommendations.data?.recommendation?.companyOverview ?? null;
```

## Data-Source Decision Table

| Field on `companyGlanceData` | `isConnected === true` (Finch)                                | `isConnected === false` (manual)                     |
| ---------------------------- | ------------------------------------------------------------- | ---------------------------------------------------- |
| `totalWorkforce`             | `workforceSection?.totalWorkforce ?? null`                    | `recommCompanyOverview?.totalWorkforce ?? null`      |
| `averageHourlyWage`          | `compensationSection?.salaryBreakdown?.avgHourlyRate ?? null` | `recommCompanyOverview?.avgHourlyRate ?? null`       |
| `averageSalary`              | `compensationSection?.salaryBreakdown?.avgSalary ?? null`     | `recommCompanyOverview?.avgSalary ?? null`           |
| `industryAverageWage`        | `industryAverageWage ?? null`                                 | `industryAverageWage ?? null` (unchanged both paths) |

## State Transitions

No state machine changes. The feature is a read-only derivation change — the Redux slice shape gains one optional field in its `data` payload, but no reducers, actions, or thunks need modification.

## Validation Rules

- All three `companyOverview` sub-fields are `number` at the TypeScript level.
- The selector returns `null` when the field is absent; each consuming expression uses `?? null` to propagate gracefully.
- Zero (0) for `totalWorkforce` is a valid value and must NOT be coerced to null.

## Entity Relationships

```
RecommendationsApiResponse
  └── recommendation: RecommendationData
        ├── strategicRecommendations: StrategicRecommendation[]
        ├── autoEnroll / nonElectiveMatch / healthcareAffordability: StrategyFlagStatus
        ├── dataStatus: string
        └── companyOverview?: CompanyOverview   ← NEW (optional)
              ├── totalWorkforce: number
              ├── avgHourlyRate: number
              └── avgSalary: number
```

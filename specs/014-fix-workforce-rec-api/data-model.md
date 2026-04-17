# Data Model: Live APIs – Update Workforce & Recommendations Endpoints and Interfaces

**Branch**: `014-fix-workforce-rec-api`  
**Date**: 2026-04-17

---

## Workforce Types (`src/types/workforceTypes.ts`)

### Changed: `WorkforceResponse` → rename to `WorkforceEnvelope`

The type previously named `WorkforceResponse` (the direct sub-payload with `workforce`, `participation`, `demographics`, `compensation`) is renamed to `WorkforceEnvelope` and gains one new field: `dataStatus`.

```typescript
/** The body of the "workforce" key in the API response envelope */
export interface WorkforceEnvelope {
  dataStatus: string; // NEW — e.g. "available" | "pending"
  workforce: WorkforceOverview; // previously at WorkforceResponse.workforce
  participation: Participation; // unchanged
  demographics: Demographics; // unchanged
  compensation: Compensation; // unchanged
}
```

### New: `WorkforceApiResponse`

New top-level type matching the full response from `GET /dashboard/workforce`:

```typescript
/** Full response from GET /dashboard/workforce */
export interface WorkforceApiResponse {
  assessmentType: string; // e.g. "finch"
  workforce: WorkforceEnvelope;
}
```

### Changed: `WorkforceState.data`

```typescript
export interface WorkforceState {
  data: WorkforceApiResponse | null; // was: WorkforceResponse | null
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  isLoaded: boolean;
}
```

### Unchanged sub-interfaces

All of the following remain byte-for-byte identical:

- `WorkforceOverview` (fields: `totalWorkforce`, `enrolledBenefits`, `avgEmployeeCost`, `employerCostPerEmployee`)
- `EnrollmentItem` (`name`, `enrollment`)
- `Participation` (`totalWorkforce`, `enrolledBenefits`, `retirementEnrollment`, `healthcareEnrollment`, `benefits`, `retirement`, `insurance`)
- `EmploymentTypeEntry`, `GenderBreakdown`, `AgeBreakdownEntry`, `Demographics`
- `SalaryBreakdown`, `Department`, `JobTitle`, `WorkforceBreakdown`
- `BenefitsCost`, `BenefitsCostGraphEntry`, `BenefitsCostTableRow`
- `Compensation`

---

## Recommendations Types (`src/types/recommendationsTypes.ts`)

### Changed: `RecommendationsApiResponse` — add `assessmentType`

```typescript
/** Full response from GET /dashboard/recommendation */
export interface RecommendationsApiResponse {
  assessmentType: string; // NEW — e.g. "finch"
  recommendation: RecommendationData; // unchanged key name and type
}
```

### Changed: `RecommendationData` — remove `companyAtGlance`

```typescript
export interface RecommendationData {
  strategicRecommendations: StrategicRecommendation[]; // unchanged
  autoEnroll: boolean; // unchanged
  nonElectiveMatch: boolean; // unchanged
  healthcareAffordability: boolean; // unchanged
  dataStatus: string; // unchanged
  // REMOVED: companyAtGlance: RecommendationCompanyAtGlance
}
```

### Removed: `RecommendationCompanyAtGlance`

This interface is deleted entirely. It had three fields (`totalWorkforce`, `averageHourlyWage`, `averageSalary`) and was only referenced by the now-removed `companyAtGlance` field.

### Unchanged interfaces

- `StrategicRecommendation` (all 10 fields)
- `RecommendationsState`

---

## API Services

### `src/services/api/workforceApi.ts`

| Field                      | Old value                     | New value              |
| -------------------------- | ----------------------------- | ---------------------- |
| Return type                | `WorkforceResponse`           | `WorkforceApiResponse` |
| Endpoint path              | `/api/v1/dashboard/workforce` | `/dashboard/workforce` |
| Generic on `apiClient.get` | `WorkforceResponse`           | `WorkforceApiResponse` |

### `src/services/api/recommendationsApi.ts`

| Field         | Old value                                                                                                                                                                                                               | New value                                               |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Endpoint path | `/dashboard/recommendation`                                                                                                                                                                                             | `/dashboard/recommendation` _(already correct in file)_ |
| Note          | The existing file already has the correct path (`/dashboard/recommendation`). The path that needed changing per the API `/api/v1/dashboard/recommendations` was in the thunk — confirmed by reading the slice comments. |

> **Important clarification**: The `recommendationsApi.ts` file already uses `/dashboard/recommendation` (no `/api/v1` prefix). The `recommendationsSlice.ts` has the live call commented out and uses static data. The only recommendations-side file changes are: uncomment the live call in the slice, update type shapes.

---

## Redux Slices

### `src/store/slices/workforceSlice.ts`

- Import `WorkforceApiResponse` instead of `WorkforceResponse`
- Remove `STATIC_WORKFORCE_DATA` constant (~360 lines)
- Uncomment `import { getWorkforce }` and the live API call inside the thunk
- Remove static-mode comment block
- Update thunk type params from `WorkforceResponse` → `WorkforceApiResponse`
- Update `PayloadAction<WorkforceResponse>` → `PayloadAction<WorkforceApiResponse>`

### `src/store/slices/recommendationsSlice.ts`

- Uncomment `import { getRecommendations }`
- Remove `STATIC_RECOMMENDATIONS_DATA` constant
- Uncomment live API call in thunk
- Update `companyAtGlance` references in type/mock data
- Add `assessmentType` if needed for static data (irrelevant once static removed)

---

## Redux Selectors

### `src/store/selectors/workforceSelectors.ts`

| Selector                     | Old access path                         | New access path                                 |
| ---------------------------- | --------------------------------------- | ----------------------------------------------- |
| `selectWorkforceData`        | return type `WorkforceResponse \| null` | return type `WorkforceApiResponse \| null`      |
| `selectWorkforceSection`     | `state.workforce.data?.workforce`       | `state.workforce.data?.workforce.workforce`     |
| `selectParticipationSection` | `state.workforce.data?.participation`   | `state.workforce.data?.workforce.participation` |
| `selectDemographicsSection`  | `state.workforce.data?.demographics`    | `state.workforce.data?.workforce.demographics`  |
| `selectCompensationSection`  | `state.workforce.data?.compensation`    | `state.workforce.data?.workforce.compensation`  |

---

## State Transitions (unchanged)

Loading/error/success state machine is identical for both slices — no behavioral changes, only data shape changes.

```
idle → pending → fulfilled (data: WorkforceApiResponse) → idle
idle → pending → rejected (error: string) → idle
```

---

## Test Mock Shape Updates

### Workforce tests — new mock object shape

```typescript
const mockWorkforceApiResponse: WorkforceApiResponse = {
  assessmentType: "finch",
  workforce: {
    dataStatus: "available",
    workforce: {
      totalWorkforce: 3120,
      enrolledBenefits: 2450,
      avgEmployeeCost: 2254,
      employerCostPerEmployee: 44000,
    },
    participation: { ... },   // same as before
    demographics: { ... },    // same as before
    compensation: { ... },    // same as before
  },
};
```

### Recommendations tests — new mock object shape

```typescript
const mockRecommendationsApiResponse: RecommendationsApiResponse = {
  assessmentType: "finch",          // NEW field
  recommendation: {
    strategicRecommendations: [ ... ],
    autoEnroll: true,
    nonElectiveMatch: false,
    healthcareAffordability: false,
    dataStatus: "available",
    // companyAtGlance REMOVED
  },
};
```

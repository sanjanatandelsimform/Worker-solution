# Quickstart: Live APIs – Update Workforce & Recommendations Endpoints and Interfaces

**Branch**: `014-fix-workforce-rec-api`  
**Date**: 2026-04-17

This guide walks a developer through every file change required to switch both the Workforce and Recommendations pages from static data to the live backend. Changes are ordered from lowest risk to highest. After each step, the project should remain TypeScript-compilable.

---

## Prerequisites

- You are on branch `014-fix-workforce-rec-api`
- Backend is deployed and serving `/dashboard/workforce` and `/dashboard/recommendation`
- Run `pnpm run type-check` before starting to confirm the baseline

---

## Step 1 — Update Workforce TypeScript Types

**File**: `src/types/workforceTypes.ts`

### 1a. Rename `WorkforceResponse` → `WorkforceEnvelope`

Find:

```typescript
export interface WorkforceResponse {
  workforce: WorkforceOverview;
  participation: Participation;
  demographics: Demographics;
  compensation: Compensation;
}
```

Replace with:

```typescript
export interface WorkforceEnvelope {
  dataStatus: string;
  workforce: WorkforceOverview;
  participation: Participation;
  demographics: Demographics;
  compensation: Compensation;
}
```

### 1b. Add `WorkforceApiResponse` (new top-level type)

Insert immediately after `WorkforceEnvelope`:

```typescript
export interface WorkforceApiResponse {
  assessmentType: string;
  workforce: WorkforceEnvelope;
}
```

### 1c. Update `WorkforceState.data` type

Find:

```typescript
data: WorkforceResponse | null;
```

Replace with:

```typescript
data: WorkforceApiResponse | null;
```

---

## Step 2 — Update Workforce API Service

**File**: `src/services/api/workforceApi.ts`

### 2a. Update import

```typescript
// Old:
import type { WorkforceResponse } from "@/types/workforceTypes";
// New:
import type { WorkforceApiResponse } from "@/types/workforceTypes";
```

### 2b. Update function signature and endpoint

```typescript
// Old:
export const getWorkforce = async (): Promise<WorkforceResponse> => {
  ...
  const response = await apiClient.get<WorkforceResponse>("/api/v1/dashboard/workforce", {

// New:
export const getWorkforce = async (): Promise<WorkforceApiResponse> => {
  ...
  const response = await apiClient.get<WorkforceApiResponse>("/dashboard/workforce", {
```

Also update the JSDoc `@returns` line:

```typescript
// Old: @returns Promise resolving to WorkforceResponse
// New: @returns Promise resolving to WorkforceApiResponse
```

---

## Step 3 — Update Workforce Redux Slice

**File**: `src/store/slices/workforceSlice.ts`

### 3a. Uncomment the API import

```typescript
// Old (commented out):
// import { getWorkforce } from "@/services/api/workforceApi";
// New:
import { getWorkforce } from "@/services/api/workforceApi";
```

### 3b. Update the type import

```typescript
// Old:
import type { WorkforceState, WorkforceResponse } from "@/types/workforceTypes";
// New:
import type { WorkforceState, WorkforceApiResponse } from "@/types/workforceTypes";
```

### 3c. Delete `STATIC_WORKFORCE_DATA`

Remove the entire `const STATIC_WORKFORCE_DATA: WorkforceResponse = { ... }` block (approximately lines 35–360). Also remove the `TODO: Remove STATIC_WORKFORCE_DATA block when backend is live` comment.

### 3d. Replace the thunk implementation

```typescript
// Old thunk signature:
export const fetchWorkforce = createAsyncThunk<WorkforceResponse, void, { rejectValue: string }>(

// New thunk signature:
export const fetchWorkforce = createAsyncThunk<WorkforceApiResponse, void, { rejectValue: string }>(
```

Replace the thunk body:

```typescript
// Old:
async (_, { rejectWithValue }) => {
  try {
    // Static data — remove this block when backend is live:
    await new Promise(resolve => setTimeout(resolve, 70000));
    return STATIC_WORKFORCE_DATA;

    // TODO: Uncomment when backend is live (and remove static block above):
    // const response = await getWorkforce();
    // return response;
  } catch (error) { ... }
}

// New:
async (_, { rejectWithValue }) => {
  try {
    const response = await getWorkforce();
    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch workforce data";
    return rejectWithValue(errorMessage);
  }
}
```

### 3e. Update `PayloadAction` type annotation in `fulfilled` case

```typescript
// Old:
.addCase(fetchWorkforce.fulfilled, (state, action: PayloadAction<WorkforceResponse>) => {
// New:
.addCase(fetchWorkforce.fulfilled, (state, action: PayloadAction<WorkforceApiResponse>) => {
```

---

## Step 4 — Update Workforce Selectors

**File**: `src/store/selectors/workforceSelectors.ts`

### 4a. Update import

```typescript
// Old:
import type {
  WorkforceResponse,
  ...
} from "@/types/workforceTypes";

// New:
import type {
  WorkforceApiResponse,
  ...
} from "@/types/workforceTypes";
```

Remove `WorkforceResponse` from the import; add `WorkforceApiResponse`.

### 4b. Update `selectWorkforceData` return type

```typescript
// Old:
export const selectWorkforceData = (state: RootState): WorkforceResponse | null =>
// New:
export const selectWorkforceData = (state: RootState): WorkforceApiResponse | null =>
```

### 4c. Fix selector access paths (the main change)

```typescript
// Old:
export const selectWorkforceSection = (state: RootState) => state.workforce.data?.workforce ?? null;

export const selectParticipationSection = (state: RootState): Participation | null =>
  state.workforce.data?.participation ?? null;

export const selectDemographicsSection = (state: RootState): Demographics | null =>
  state.workforce.data?.demographics ?? null;

export const selectCompensationSection = (state: RootState): Compensation | null =>
  state.workforce.data?.compensation ?? null;

// New:
export const selectWorkforceSection = (state: RootState) =>
  state.workforce.data?.workforce.workforce ?? null;

export const selectParticipationSection = (state: RootState): Participation | null =>
  state.workforce.data?.workforce.participation ?? null;

export const selectDemographicsSection = (state: RootState): Demographics | null =>
  state.workforce.data?.workforce.demographics ?? null;

export const selectCompensationSection = (state: RootState): Compensation | null =>
  state.workforce.data?.workforce.compensation ?? null;
```

> **No consumer hook changes needed.** The four hooks (`useWorkforceOverviewConfig`, `useWorkforceParticipationConfig`, `useWorkforceDemographicsConfig`, `useWorkforceCompensationConfig`) all call these selectors and receive the same typed sub-objects as before.

---

## Step 5 — Update Recommendations TypeScript Types

**File**: `src/types/recommendationsTypes.ts`

### 5a. Add `assessmentType` to `RecommendationsApiResponse`

```typescript
// Old:
export interface RecommendationsApiResponse {
  recommendation: RecommendationData;
}

// New:
export interface RecommendationsApiResponse {
  assessmentType: string;
  recommendation: RecommendationData;
}
```

### 5b. Remove `companyAtGlance` from `RecommendationData`

```typescript
// Old:
export interface RecommendationData {
  strategicRecommendations: StrategicRecommendation[];
  autoEnroll: boolean;
  nonElectiveMatch: boolean;
  healthcareAffordability: boolean;
  dataStatus: string;
  companyAtGlance: RecommendationCompanyAtGlance; // ← REMOVE THIS LINE
}

// New:
export interface RecommendationData {
  strategicRecommendations: StrategicRecommendation[];
  autoEnroll: boolean;
  nonElectiveMatch: boolean;
  healthcareAffordability: boolean;
  dataStatus: string;
}
```

### 5c. Delete `RecommendationCompanyAtGlance` interface

Remove the entire interface:

```typescript
// DELETE:
export interface RecommendationCompanyAtGlance {
  totalWorkforce: number | null;
  averageHourlyWage: number | null;
  averageSalary: number | null;
}
```

---

## Step 6 — Update Recommendations Redux Slice

**File**: `src/store/slices/recommendationsSlice.ts`

### 6a. Uncomment the API import

```typescript
// Old (commented out):
// import { getRecommendations } from "@/services/api/recommendationsApi";
// New:
import { getRecommendations } from "@/services/api/recommendationsApi";
```

### 6b. Delete `STATIC_RECOMMENDATIONS_DATA`

Remove the entire `const STATIC_RECOMMENDATIONS_DATA: RecommendationsApiResponse = { ... }` block.

### 6c. Replace the thunk body

```typescript
// Old:
async (_, { rejectWithValue }) => {
  try {
    // Static data — remove this block when backend is live:
    return STATIC_RECOMMENDATIONS_DATA;

    // TODO: Uncomment when backend is live (and remove static block above):
    // const response = await getRecommendations();
    // return response;
  } catch (error) { ... }
}

// New:
async (_, { rejectWithValue }) => {
  try {
    const response = await getRecommendations();
    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch recommendations data";
    return rejectWithValue(errorMessage);
  }
}
```

---

## Step 7 — Update Test Files

### 7a. `tests/services/workforceApi.test.ts`

1. Import `WorkforceApiResponse` instead of `WorkforceResponse`
2. Update `mockWorkforceResponse` to match `WorkforceApiResponse` envelope:
   ```typescript
   const mockWorkforceResponse: WorkforceApiResponse = {
     assessmentType: "finch",
     workforce: {
       dataStatus: "available",
       workforce: { totalWorkforce: 3120, enrolledBenefits: 2450, avgEmployeeCost: 2254, employerCostPerEmployee: 44000 },
       participation: { ... },
       demographics: { ... },
       compensation: { ... },
     },
   };
   ```
3. Update endpoint assertion:
   ```typescript
   // Old:
   expect(apiClient.get).toHaveBeenCalledWith("/api/v1/dashboard/workforce", ...)
   // New:
   expect(apiClient.get).toHaveBeenCalledWith("/dashboard/workforce", ...)
   ```

### 7b. `tests/store/workforceSlice.test.ts`

Wrap `mockData` in the `WorkforceApiResponse` envelope:

```typescript
const mockData: WorkforceApiResponse = {
  assessmentType: "finch",
  workforce: {
    dataStatus: "available",
    workforce: { ... },    // same values as before
    participation: { ... },
    demographics: { ... },
    compensation: { ... },
  },
};
```

### 7c. `tests/store/workforceSelectors.test.ts`

1. Import `WorkforceApiResponse` instead of `WorkforceResponse`
2. Wrap `mockWorkforceData` in envelope
3. Update `makeState` to use `WorkforceApiResponse` type
4. Fix `selectWorkforceSection` test assertions — the returned value comes from `mockData.workforce.workforce`, not `mockData.workforce`

### 7d. `tests/store/recommendationsSlice.test.ts`

1. Remove `companyAtGlance` from `mockData.recommendation`
2. Add `assessmentType: "finch"` to root of `mockData`

### 7e. `tests/store/recommendationsSelectors.test.ts`

1. Remove `companyAtGlance` from any mock data objects
2. Add `assessmentType` at root level if full `RecommendationsApiResponse` objects are constructed

---

## Step 8 — Verify

```bash
pnpm run type-check   # must pass with zero errors
pnpm test             # run all tests
pnpm dev              # smoke-test: load /dashboard and /recommendations tabs
```

Confirm in browser DevTools → Network:

- Workforce tab triggers `GET /dashboard/workforce` (not `/api/v1/...`)
- Recommendations tab triggers `GET /dashboard/recommendation` (not `/api/v1/...`)

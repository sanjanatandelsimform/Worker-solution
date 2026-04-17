# Quickstart: Recommendations Finch Tab API Integration

**Feature**: 011-recommendations-api  
**Branch**: `011-recommendations-api`  
**Phase**: 1 — Implementation Guide  
**Date**: 2026-04-16

This guide provides an ordered, step-by-step path to implement the feature from scratch. Each step is self-contained; complete them in order.

---

## Prerequisites

- Branch `011-recommendations-api` is checked out
- `pnpm install` has been run
- You are familiar with `workforceSlice.ts` and `workforceSelectors.ts` — this feature mirrors those patterns exactly

---

## Step 1 — Create TypeScript types

**File**: `src/types/recommendationsTypes.ts`

Copy the interface definitions from [data-model.md](./data-model.md#typescript-interfaces). Key types to export:

- `StrategicRecommendation`
- `RecommendationCompanyAtGlance`
- `RecommendationData`
- `RecommendationsApiResponse`
- `RecommendationsState`

No default export. All named exports.

---

## Step 2 — Create the API service

**File**: `src/services/api/recommendationsApi.ts`

Model this file exactly after `src/services/api/workforceApi.ts`:

```typescript
/**
 * Recommendations API Service
 *
 * API service for retrieving recommendations data from GET /api/v1/dashboard/recommendations endpoint.
 * Follows the same pattern as workforceApi.ts.
 *
 * Based on: specs/011-recommendations-api/contracts/recommendations-get.md
 */

import type { RecommendationsApiResponse } from "@/types/recommendationsTypes";
import apiClient from "@/services/api/authApi";
import { getAuthToken, getErrorMessage } from "@/services/api/apiUtils";

export const getRecommendations = async (): Promise<RecommendationsApiResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication required. Please log in again.");
    }
    const response = await apiClient.get<RecommendationsApiResponse>(
      "/api/v1/dashboard/recommendations",
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 600000,
      }
    );
    return response.data;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Authentication required. Please log in again."
    ) {
      throw error;
    }
    throw new Error(getErrorMessage(error));
  }
};
```

---

## Step 3 — Create the Redux slice

**File**: `src/store/slices/recommendationsSlice.ts`

Model this file exactly after `src/store/slices/workforceSlice.ts`. Key points:

1. Add the JSDoc migration header at the top (with `TO MIGRATE TO LIVE API` instructions)
2. Import `RecommendationsState` and `RecommendationsApiResponse` from types
3. Comment out the import of `getRecommendations` (live API not yet available)
4. Define `STATIC_RECOMMENDATIONS_DATA` — use the exact static data from [data-model.md#static-stub-data](./data-model.md#static-stub-data)
5. In the `fetchRecommendations` thunk: return `STATIC_RECOMMENDATIONS_DATA` directly; add the live call below as a comment:
   ```typescript
   // TODO: Uncomment when backend is live:
   // const response = await getRecommendations();
   // return response;
   ```
6. The slice reducers: `clearRecommendations`, `clearRecommendationsError`, `resetRecommendations`
7. The thunk action type: `"recommendations/fetchRecommendations"`

The `extraReducers` builder handles `.pending`, `.fulfilled`, `.rejected`, and `auth/logout` (same `addMatcher` as workforce slice).

---

## Step 4 — Create selectors

**File**: `src/store/selectors/recommendationsSelectors.ts`

Export these selectors (see [data-model.md#selector-map](./data-model.md#selector-map)):

```typescript
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import type { StrategicRecommendation, RecommendationData } from "@/types/recommendationsTypes";

export const selectRecommendationsState = (state: RootState) => state.recommendations;
export const selectRecommendationsData = (state: RootState) => state.recommendations.data;
export const selectRecommendationsLoading = (state: RootState): boolean =>
  state.recommendations.loading;
export const selectRecommendationsError = (state: RootState): string | null =>
  state.recommendations.error;
export const selectRecommendationsIsLoaded = (state: RootState): boolean =>
  state.recommendations.isLoaded;

export const selectRecommendationItem = (state: RootState): RecommendationData | null =>
  state.recommendations.data?.recommendation ?? null;

export const selectRecommStrategicRecommendations = createSelector(
  [selectRecommendationItem],
  (item): StrategicRecommendation[] => {
    if (!item?.strategicRecommendations) return [];
    return [...item.strategicRecommendations].sort((a, b) => a.order - b.order);
  }
);

export const selectProvenStrategiesFlags = createSelector([selectRecommendationItem], item => ({
  nonElectiveMatch: item?.nonElectiveMatch ?? false,
  autoEnroll: item?.autoEnroll ?? false,
  healthcareAffordability: item?.healthcareAffordability ?? false,
}));
```

---

## Step 5 — Register the slice in the Redux store

**File**: `src/store/store.ts`

Add these three changes:

**a) Import the reducer and state type:**

```typescript
import recommendationsReducer from "./slices/recommendationsSlice";
import type { RecommendationsState } from "@/types/recommendationsTypes";
```

**b) Add to `rootReducer`:**

```typescript
const rootReducer = combineReducers({
  // ... existing reducers ...
  recommendations: recommendationsReducer,
});
```

**c) Add to the `RootState` type export:**

```typescript
export type RootState = {
  // ... existing ...
  recommendations: RecommendationsState;
};
```

---

## Step 6 — Update `RecommendationsFinchPage.tsx`

This is the main surgery. The file changes are:

### 6a — Remove dashboard selector imports

**Remove** this import block entirely:

```typescript
import {
  selectCompanyAtGlance,
  selectStrategicRecommendations,
} from "@/store/selectors/dashboardSelectors";
```

### 6b — Add new imports

Add after the existing `useAppSelector` import:

```typescript
import { useAppDispatch } from "@/store/hooks";
import {
  selectWorkforceSection,
  selectCompensationSection,
  selectParticipationSection,
  selectWorkforceLoading,
} from "@/store/selectors/workforceSelectors";
import {
  selectRecommendationItem,
  selectRecommStrategicRecommendations,
  selectProvenStrategiesFlags,
  selectRecommendationsLoading,
  selectRecommendationsIsLoaded,
} from "@/store/selectors/recommendationsSelectors";
import { fetchRecommendations } from "@/store/slices/recommendationsSlice";
```

### 6c — Update selector usage inside the component

Replace:

```typescript
const companyAtGlance = useAppSelector(selectCompanyAtGlance);
const strategicRecommendations = useAppSelector(selectStrategicRecommendations);
```

With:

```typescript
const dispatch = useAppDispatch();

// Workforce slice — Company Overview & Benefits Overview
const workforceSection = useAppSelector(selectWorkforceSection);
const compensationSection = useAppSelector(selectCompensationSection);
const participationSection = useAppSelector(selectParticipationSection);
const workforceIsLoading = useAppSelector(selectWorkforceLoading);

// Recommendations slice — Proven Strategies & Strategic Solutions
const strategicRecommendations = useAppSelector(selectRecommStrategicRecommendations);
const provenStrategyFlags = useAppSelector(selectProvenStrategiesFlags);
const recommendationsIsLoading = useAppSelector(selectRecommendationsLoading);
const recommendationsIsLoaded = useAppSelector(selectRecommendationsIsLoaded);
```

### 6d — Dispatch fetchRecommendations on mount

Add a new `useEffect` (alongside the existing timer effects):

```typescript
useEffect(() => {
  if (!recommendationsIsLoaded) {
    dispatch(fetchRecommendations());
  }
}, [dispatch, recommendationsIsLoaded]);
```

### 6e — Build synthetic shapes before the JSX return

Inside the component body, before `return (`:

```typescript
// Synthetic Company Overview shape (maps workforce fields to existing format fn expectations)
const companyGlanceData = {
  totalWorkforce: workforceSection?.totalWorkforce ?? null,
  averageHourlyWage: compensationSection?.salaryBreakdown?.avgHourlyRate ?? null,
  averageSalary: compensationSection?.salaryBreakdown?.avgSalary ?? null,
  industryAverageWage: null,
};

// Synthetic Benefits Overview shape
const benefitsGlanceData = {
  eligibleEmployees: participationSection?.totalWorkforce ?? null,
  enrolledEmployees: participationSection?.enrolledBenefits ?? null,
  enrolledInRetirement: participationSection?.retirementEnrollment ?? null,
  enrolledInHealthcare: participationSection?.healthcareEnrollment ?? null,
};

// Proven Strategies dynamic computation
const provenStrategiesCount = [
  provenStrategyFlags.nonElectiveMatch,
  provenStrategyFlags.autoEnroll,
  provenStrategyFlags.healthcareAffordability,
].filter(Boolean).length;
const provenStrategiesPercent = Math.round((provenStrategiesCount / 3) * 100);
```

### 6f — Update loading guard

Replace the `isLoadingCards` guard with a combined check:

```typescript
const isAnyLoading = isLoadingCards || workforceIsLoading || recommendationsIsLoading;
```

Use `isAnyLoading` wherever `isLoadingCards` was used for skeleton conditionals.

### 6g — Update Company Overview card rendering

Change:

```tsx
count={String(card.format(companyAtGlance))}
```

To:

```tsx
count={String(card.format(companyGlanceData))}
```

### 6h — Update Benefits Overview card rendering

The `overviewCardsConfigR2` cards currently use hardcoded `count` strings in the config. Remove those hardcoded values from the config and pass counts dynamically. Map card `id` → value:

| Card id                  | Field in `benefitsGlanceData` |
| ------------------------ | ----------------------------- |
| `eligible-employees`     | `eligibleEmployees`           |
| `enrolled-employees`     | `enrolledEmployees`           |
| `enrolled-in-retirement` | `enrolledInRetirement`        |
| `enrolled-in-healthcare` | `enrolledInHealthcare`        |

Update the render:

```tsx
count={
  benefitsGlanceData[card.id as keyof typeof benefitsGlanceData] != null
    ? String(benefitsGlanceData[card.id as keyof typeof benefitsGlanceData])
    : card.count  // fallback to config value if no data
}
```

> **Simpler alternative**: You may also keep the `count` prop hardcoded in the config as a fallback and override per-card using the participation data. Either approach is acceptable.

### 6i — Update Proven Strategies section

Replace hardcoded label and progress value:

```tsx
// Before:
<h4>Strategies Implemented: 2/3</h4>
...
<p>You have already implemented 2 of 3 proven strategies! ...</p>
<ProgressBar value={66} ... />

// After:
<h4>Strategies Implemented: {provenStrategiesCount}/3</h4>
...
<p>You have already implemented {provenStrategiesCount} of 3 proven strategies! ...</p>
<ProgressBar value={provenStrategiesPercent} ... />
```

---

## Step 7 — Quality checks

Run these in order before opening a PR:

```bash
pnpm run type-check   # Must: zero TypeScript errors
pnpm lint:fix         # Must: zero ESLint errors/warnings
pnpm format           # Auto-formats all touched files
pnpm dev              # Smoke test: navigate to Recommendations tab, verify all 4 sections render
```

---

## Migration to Live API (when backend is ready)

In `src/store/slices/recommendationsSlice.ts`:

1. Remove the `STATIC_RECOMMENDATIONS_DATA` constant block
2. Remove the `return STATIC_RECOMMENDATIONS_DATA;` line (and the `await new Promise(...)` if added)
3. Uncomment the `import { getRecommendations }` line at the top
4. Uncomment `const response = await getRecommendations();` and `return response;`

No changes needed in any component or selector files.

# Quickstart: Company Overview Dual-Source Data

**Branch**: `035-company-overview-recomm-api`  
**Date**: 2026-05-07  
**Effort**: ~40 lines changed across 5 files. No new files. No new components.

## Overview of Changes

```
src/types/recommendationsTypes.ts          — add CompanyOverview interface + optional field
src/store/selectors/recommendationsSelectors.ts — add selectRecommCompanyOverview selector
src/pages/recommendations/RecommendationsFinchPage.tsx — conditional data source
tests/store/recommendationsSelectors.test.ts        — new selector tests
tests/pages/RecommendationsFinchPage.test.tsx        — non-connected path tests
```

---

## Step 1 — Add `CompanyOverview` type and extend `RecommendationData`

**File**: `src/types/recommendationsTypes.ts`

Add the new interface **before** `RecommendationData`. Then add one optional field to `RecommendationData`.

```typescript
// ADD this new interface before RecommendationData:
export interface CompanyOverview {
  totalWorkforce: number;
  avgHourlyRate: number;
  avgSalary: number;
}

// MODIFY RecommendationData — add one field at the bottom of the interface:
export interface RecommendationData {
  strategicRecommendations: StrategicRecommendation[];
  autoEnroll: StrategyFlagStatus;
  nonElectiveMatch: StrategyFlagStatus;
  healthcareAffordability: StrategyFlagStatus;
  dataStatus: string;
  /** Company overview for non-Finch assessments. Absent for Finch-connected users. */
  companyOverview?: CompanyOverview;
}
```

---

## Step 2 — Add `selectRecommCompanyOverview` selector

**File**: `src/store/selectors/recommendationsSelectors.ts`

Import `CompanyOverview` from types, then add a new selector at the bottom of the file (after `selectProvenStrategiesFlags`).

```typescript
// ADD to imports:
import type {
  RecommendationsApiResponse,
  RecommendationData,
  StrategicRecommendation,
  CompanyOverview, // ← add this
} from "@/types/recommendationsTypes";

// ADD at end of file:
/**
 * Select the companyOverview object from the recommendations API response.
 * Returns null when absent (Finch-connected users or older API versions).
 * Used by RecommendationsFinchPage to populate company at a glance for non-connected users.
 */
export const selectRecommCompanyOverview = (state: RootState): CompanyOverview | null =>
  state.recommendations.data?.recommendation?.companyOverview ?? null;
```

---

## Step 3 — Conditionally source company overview in `RecommendationsFinchPage`

**File**: `src/pages/recommendations/RecommendationsFinchPage.tsx`

### 3a — Import the new selector

```typescript
import {
  selectRecommStrategicRecommendations,
  selectProvenStrategiesFlags,
  selectRecommendationsLoading,
  selectRecommCompanyOverview, // ← add this
} from "@/store/selectors/recommendationsSelectors";
```

### 3b — Read the selector value from the store

After the existing `recommendationsIsLoading` line, add:

```typescript
const recommCompanyOverview = useAppSelector(selectRecommCompanyOverview);
```

### 3c — Conditionally compose `companyGlanceData`

Replace the existing `companyGlanceData` object with:

```typescript
// Synthetic Company Overview shape — source depends on connection state:
// Finch-connected: workforce API (workforceSection + compensationSection)
// Non-connected:   recommendations API (recommendation.companyOverview)
const companyGlanceData = {
  totalWorkforce: isConnected
    ? (workforceSection?.totalWorkforce ?? null)
    : (recommCompanyOverview?.totalWorkforce ?? null),
  averageHourlyWage: isConnected
    ? (compensationSection?.salaryBreakdown?.avgHourlyRate ?? null)
    : (recommCompanyOverview?.avgHourlyRate ?? null),
  averageSalary: isConnected
    ? (compensationSection?.salaryBreakdown?.avgSalary ?? null)
    : (recommCompanyOverview?.avgSalary ?? null),
  industryAverageWage: industryAverageWage ?? null,
};
```

---

## Step 4 — Tests: new selector unit tests

**File**: `tests/store/recommendationsSelectors.test.ts`

Add import for `selectRecommCompanyOverview` and `CompanyOverview`, then add a new `describe` block:

```typescript
// ADD to imports at top of file:
import { selectRecommCompanyOverview } from "@/store/selectors/recommendationsSelectors";
import type { CompanyOverview } from "@/types/recommendationsTypes";

// ADD a new describe block inside the top-level describe("recommendationsSelectors"):
describe("selectRecommCompanyOverview", () => {
  it("returns null when data is null", () => {
    expect(selectRecommCompanyOverview(makeState() as RootState)).toBeNull();
  });

  it("returns null when companyOverview is absent from recommendation", () => {
    const state = makeState({ data: mockRecommendationsData }) as RootState;
    // mockRecommendationsData has no companyOverview → null
    expect(selectRecommCompanyOverview(state)).toBeNull();
  });

  it("returns companyOverview when present", () => {
    const overview: CompanyOverview = {
      totalWorkforce: 200,
      avgHourlyRate: 22.5,
      avgSalary: 60000,
    };
    const dataWithOverview: RecommendationsApiResponse = {
      ...mockRecommendationsData,
      recommendation: {
        ...mockRecommendationsData.recommendation,
        companyOverview: overview,
      },
    };
    const state = makeState({ data: dataWithOverview }) as RootState;
    expect(selectRecommCompanyOverview(state)).toEqual(overview);
  });

  it("returns totalWorkforce: 0 without coercing to null", () => {
    const overview: CompanyOverview = { totalWorkforce: 0, avgHourlyRate: 0, avgSalary: 0 };
    const dataWithOverview: RecommendationsApiResponse = {
      ...mockRecommendationsData,
      recommendation: { ...mockRecommendationsData.recommendation, companyOverview: overview },
    };
    const state = makeState({ data: dataWithOverview }) as RootState;
    expect(selectRecommCompanyOverview(state)?.totalWorkforce).toBe(0);
  });
});
```

---

## Step 5 — Tests: non-connected company at a glance path

**File**: `tests/pages/RecommendationsFinchPage.test.tsx`

Add a new `describe` block for the non-connected path. The `companyOverview` data must be provided in the Redux store's recommendations preload.

```typescript
// Helper — builds recommendations data with companyOverview included
const defaultRecommendationsDataWithOverview: RecommendationsState["data"] = {
  ...defaultRecommendationsData,
  recommendation: {
    ...defaultRecommendationsData!.recommendation,
    companyOverview: {
      totalWorkforce: 350,
      avgHourlyRate: 21.0,
      avgSalary: 58000,
    },
  },
};

// ADD this describe block alongside the existing "company at a glance data mapping" block:
describe("RecommendationsFinchPage — company at a glance (non-connected path)", () => {
  beforeEach(() => {
    vi.mocked(useAssessmentStatus).mockReturnValue({
      isFinchAssessmentIncomplete: false,
      isFinchCompleted: false,
      isConnected: false, // ← non-connected
      isFetched: true,
      completionCount: 4,
      isLoading: false,
      error: null,
      assessmentData: null,
      sectionCompletion: { workforce: true, compensation: true, benefits: true, goals: true },
      refetch: vi.fn(),
    } as ReturnType<typeof useAssessmentStatus>);
  });

  it("displays totalWorkforce from recommendation.companyOverview when not connected", () => {
    const store = createTestStore({
      recommendations: { data: defaultRecommendationsDataWithOverview },
    });
    renderPage(store);
    expect(screen.getByText("350")).toBeInTheDocument();
  });

  it("displays avgHourlyRate from recommendation.companyOverview when not connected", () => {
    const store = createTestStore({
      recommendations: { data: defaultRecommendationsDataWithOverview },
    });
    renderPage(store);
    expect(screen.getByText("$21.00")).toBeInTheDocument();
  });

  it("displays avgSalary from recommendation.companyOverview when not connected", () => {
    const store = createTestStore({
      recommendations: { data: defaultRecommendationsDataWithOverview },
    });
    renderPage(store);
    expect(screen.getByText("$58,000")).toBeInTheDocument();
  });

  it("shows N/A for company fields when companyOverview is absent and not connected", () => {
    const store = createTestStore({
      recommendations: { data: defaultRecommendationsData }, // no companyOverview
    });
    renderPage(store);
    expect(screen.getAllByText("No data available").length).toBeGreaterThan(0);
  });
});
```

---

## Quality Gate

Run after all changes:

```bash
pnpm run type-check
pnpm vitest run tests/store/recommendationsSelectors.test.ts tests/pages/RecommendationsFinchPage.test.tsx
```

Both must pass with 0 errors and 0 failing tests.

## Do NOT touch

- `src/services/api/recommendationsApi.ts` — HTTP call unchanged; TypeScript picks up the type automatically
- `src/store/slices/recommendationsSlice.ts` — no reducer changes needed
- `src/pages/recommendations/CompanyAtAGlance.tsx` — props interface unchanged
- `src/store/selectors/workforceSelectors.ts` — Finch path unchanged
- `assessmentSchemas.ts` or any Compensation/Workforce-related files

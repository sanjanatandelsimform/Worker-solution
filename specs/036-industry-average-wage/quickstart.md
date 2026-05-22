# Quickstart: Update `industryAverageWage` to Object Type

**Feature**: `036-industry-average-wage`  
**Branch**: `036-industry-average-wage`  
**Date**: 2026-05-12

This guide provides a complete, copy-paste-ready implementation. Three files change; two are source, one is a test.

---

## Pre-flight

```bash
git checkout 036-industry-average-wage
pnpm run type-check   # note current 0-error baseline
pnpm run test         # note current 0-failure baseline
```

---

## Step 1 — Update the TypeScript type

**File**: `src/types/industryTypes.ts`

Find the `IndustryOverview` interface. Change:

```typescript
// BEFORE
export interface IndustryOverview {
  turnoverRate: {
    rate: string;
    month: string;
    year: number;
  };
  avgTurnover: {
    rate: number;
    sinceYear: number;
  };
  industryWideCostOfTurnover: {
    amount: number;
    formatted: string;
    year: number;
  };
  rates: {
    hire: number;
    seperation: number;
  };
  industryAverageWage: number;
}
```

To:

```typescript
// AFTER
export interface IndustryOverview {
  turnoverRate: {
    rate: string;
    month: string;
    year: number;
  };
  avgTurnover: {
    rate: number;
    sinceYear: number;
  };
  industryWideCostOfTurnover: {
    amount: number;
    formatted: string;
    year: number;
  };
  rates: {
    hire: number;
    seperation: number;
  };
  industryAverageWage: SalaryHourly;
}
```

> `SalaryHourly` is already defined in the same file (`{ salary: number; hourly: number }`). No new imports needed.

**Verify**: `pnpm run type-check` will now show errors in `RecommendationsFinchPage.tsx` — this is expected and fixed in Step 2.

---

## Step 2 — Fix extraction in `RecommendationsFinchPage.tsx`

**File**: `src/pages/recommendations/RecommendationsFinchPage.tsx`

Find line ~54:

```typescript
// BEFORE
const industryAverageWage = industryData?.industryOverview?.industryAverageWage;
```

Change to:

```typescript
// AFTER
const industryAverageWage = industryData?.industryOverview?.industryAverageWage?.salary;
```

That's the only change in this file. Everything downstream (`companyGlanceData.industryAverageWage`, `CompanyAtAGlance` component, display formatting) is unchanged.

**Verify**: `pnpm run type-check` should now pass with 0 errors.

---

## Step 3 — Update the test fixture

**File**: `tests/pages/RecommendationsFinchPage.test.tsx`

Find the test `"displays formatted industryAverageWage from useIndustry hook"` (around line 353). In its `vi.mocked(useIndustry).mockReturnValue(...)` call, change:

```typescript
// BEFORE
industryAverageWage: 45000,
```

To:

```typescript
// AFTER
industryAverageWage: { salary: 45000, hourly: 21.63 },
```

Full updated mock block for clarity:

```typescript
vi.mocked(useIndustry).mockReturnValue({
  isLoading: false,
  data: {
    industryOverview: {
      industryAverageWage: { salary: 45000, hourly: 21.63 }, // ← updated
      turnoverRate: { rate: "15%", month: "Jan", year: 2025 },
      avgTurnover: { rate: 15, sinceYear: 2020 },
      industryWideCostOfTurnover: { amount: 50000, formatted: "$50,000", year: 2025 },
      rates: { hire: 10, seperation: 8 },
    },
  } as unknown as IndustryData,
  error: null,
  isLoaded: true,
});
```

The assertion `expect(screen.getByText("$45,000")).toBeInTheDocument()` continues to pass because `salary: 45000` is extracted via `.salary` in Step 2 and formatted as `$45,000`.

> **Note**: `hourly: 21.63` is an approximate conversion of 45000/2080 and is not asserted by any test. Any positive number is valid.

---

## Step 4 — Verify

```bash
pnpm run type-check    # must exit 0
pnpm run test          # must exit 0, no failures
```

If `pnpm run test` shows failures, check:

1. Is the fixture in Step 3 the only place `industryAverageWage: <number>` appears in test files? (Yes, per research.)
2. Did you append `.salary` (not `.hourly`) in Step 2?

---

## Files Modified Summary

| File                                                     | Change                                                                                    |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/types/industryTypes.ts`                             | `industryAverageWage: number` → `industryAverageWage: SalaryHourly` in `IndustryOverview` |
| `src/pages/recommendations/RecommendationsFinchPage.tsx` | `.industryAverageWage` → `.industryAverageWage?.salary`                                   |
| `tests/pages/RecommendationsFinchPage.test.tsx`          | `industryAverageWage: 45000` → `industryAverageWage: { salary: 45000, hourly: 21.63 }`    |

## Files NOT Modified

| File                                       | Reason                                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `src/types/dashboardTypes.ts`              | `CompanyAtGlance.industryAverageWage: string \| number \| null` — already accepts `number`        |
| `tests/pages/CompanyAtAGlance.test.tsx`    | Tests the component prop directly (not `IndustryOverview`) — prop type unchanged                  |
| `tests/pages/RecommendationsPage.test.tsx` | `industryAverageWage: 68000` feeds `mockCompanyAtGlance` (display layer) — not `IndustryOverview` |
| Any other file                             | No other file reads `IndustryOverview.industryAverageWage`                                        |

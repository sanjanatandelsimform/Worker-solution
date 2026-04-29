# Quickstart: Consolidate Finch Connection Status

**Feature**: 001-remove-finch-polling  
**Branch**: `001-remove-finch-polling`  
**Date**: 2026-04-28

## Goal

Remove `useFinchStatus` and all polling-driven usage. Derive Finch connection state from assessment response (`assessmentType === "finch"`) and keep tests green.

## Step 1: Update source consumers

1. `src/hooks/useIndustry.ts`

- Remove `useFinchStatus` import.
- Derive `isConnected` from `useAssessmentStatus().assessmentData`.
- Keep current fetch guards (`isLoaded`, `isLoading`) unchanged.

2. `src/pages/dashboard/DashboardPage.tsx`

- Remove `useFinchStatus` import and call.
- Derive `isConnected` from `assessmentData?.assessmentType === "finch"`.
- Keep existing recommendation/workforce dispatch behavior intact.

3. `src/pages/additionalQuestions/AdditionalQuestions.tsx`

- Remove `useFinchStatus` import and usage.
- Use `useAssessmentStatus` loading + assessmentType to gate redirect safely.

4. `src/pages/recommendations/CompanyAtAGlance.tsx`

- Remove `useFinchStatus` import and usage.
- Derive `isConnected` from assessment status in component logic.

5. Delete `src/hooks/useFinchStatus.ts` after all imports are removed.

## Step 2: Update tests

Replace `vi.mock("@/hooks/useFinchStatus", ...)` in:

- `tests/pages/DashboardPage.test.tsx`
- `tests/pages/DashboardErrorHandling.test.tsx`
- `tests/pages/BenchmarkPage.test.tsx`
- `tests/pages/AdditionalQuestions.test.tsx`
- `tests/pages/AdditionalQuestionsValidation.test.tsx`
- `tests/pages/AdditionalQuestionsHealthPremium.test.tsx`
- `tests/pages/RecommendationsFinchPage.test.tsx`

Recommended strategy:

- Extend existing `useAssessmentStatus` mocks to represent connected/disconnected cases.
- Keep assertion intent unchanged; only switch source of connection truth.

## Step 3: Verification

Run in order:

```bash
pnpm run type-check
pnpm vitest run tests/pages/DashboardPage.test.tsx
pnpm vitest run tests/pages/AdditionalQuestions.test.tsx
pnpm vitest run tests/pages/RecommendationsFinchPage.test.tsx
pnpm vitest run
```

## Done Criteria

- No source import remains for `@/hooks/useFinchStatus`.
- `src/hooks/useFinchStatus.ts` is removed.
- All affected page tests pass after mock migration.
- Full suite passes or non-feature-related failures are documented.

## Validation Results

- `pnpm run type-check`: PASS
- `pnpm vitest run tests/pages/DashboardPage.test.tsx tests/pages/AdditionalQuestions.test.tsx tests/pages/AdditionalQuestionsValidation.test.tsx tests/pages/AdditionalQuestionsHealthPremium.test.tsx tests/pages/RecommendationsFinchPage.test.tsx`: PASS (5 files, 66 tests)
- `pnpm vitest run --reporter=dot`: PASS (93 files, 1070 tests)

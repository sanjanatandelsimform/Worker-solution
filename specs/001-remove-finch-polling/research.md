# Research: Consolidate Finch Connection Status

**Feature**: 001-remove-finch-polling  
**Phase**: 0 - Research  
**Date**: 2026-04-28

## Summary

All decisions were resolved from current repository code and test coverage. No external technology choice clarifications are needed.

## Decision 1: Replace `useFinchStatus` polling with assessment-derived connection state

- Decision: Define Finch connection as `assessmentData?.assessmentType === "finch"` from `useAssessmentStatus`.
- Rationale: This matches the requested source of truth and removes periodic polling (`setInterval`) from `useFinchStatus`.
- Alternatives considered:
- Keep polling but lower interval: rejected, still duplicate source of truth.
- Keep polling only on selected pages: rejected, inconsistent state across pages.

## Decision 2: Consumer migration strategy

- Decision: Update current `useFinchStatus` consumers (`useIndustry`, `DashboardPage`, `AdditionalQuestions`, `CompanyAtAGlance`) to derive connection from assessment state.
- Rationale: These are all direct import points; migrating them removes runtime dependency completely.
- Alternatives considered:
- Build a compatibility wrapper with same hook name using assessment data: rejected as unnecessary indirection.

## Decision 3: Redirect/loading behavior in `AdditionalQuestions`

- Decision: Preserve delayed redirect behavior by using assessment loading state before deciding disconnected navigation.
- Rationale: Current flow waits on `isFinchStatusLoading` to avoid false redirect during initial load. Equivalent guard is required after migration.
- Alternatives considered:
- Redirect immediately when assessment data is null: rejected due to race-condition risk on initial fetch.

## Decision 4: Test update scope

- Decision: Replace all `@/hooks/useFinchStatus` mocks in page tests with `useAssessmentStatus`-driven state setup.
- Rationale: Existing tests currently expect the old hook contract in 7 page test files.
- Alternatives considered:
- Keep old hook mock while removing source hook: rejected because import path becomes invalid.

## Decision 5: API contract handling

- Decision: Define a lightweight contract artifact documenting required assessment response fields for connection derivation (`assessmentType`, `data.status`).
- Rationale: There is no new endpoint, but this feature depends on specific response fields and should document that dependency.
- Alternatives considered:
- Skip contracts entirely: rejected to keep Phase 1 artifact completeness.

## Impacted Files (confirmed)

- `src/hooks/useFinchStatus.ts` (delete)
- `src/hooks/useIndustry.ts`
- `src/pages/dashboard/DashboardPage.tsx`
- `src/pages/additionalQuestions/AdditionalQuestions.tsx`
- `src/pages/recommendations/CompanyAtAGlance.tsx`
- `tests/pages/DashboardPage.test.tsx`
- `tests/pages/DashboardErrorHandling.test.tsx`
- `tests/pages/BenchmarkPage.test.tsx`
- `tests/pages/AdditionalQuestions.test.tsx`
- `tests/pages/AdditionalQuestionsValidation.test.tsx`
- `tests/pages/AdditionalQuestionsHealthPremium.test.tsx`
- `tests/pages/RecommendationsFinchPage.test.tsx`

## Validation Plan

- Run `pnpm run type-check`.
- Run targeted Finch-related test files first.
- Run full `pnpm vitest run` before closing feature tasks.

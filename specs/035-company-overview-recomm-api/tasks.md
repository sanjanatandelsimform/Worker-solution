---
description: "Task list for 035-company-overview-recomm-api"
---

# Tasks: Company Overview Dual-Source Data

**Input**: Design documents from `specs/035-company-overview-recomm-api/`  
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Branch**: `035-company-overview-recomm-api`  
**Scope**: 5 files modified, ~40 lines total. No new files, no new components, no reducer changes.

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[US1]**: Non-Finch user sees company overview from recommendations API
- **[US2]**: Finch-connected user continues using workforce API (regression guard)

---

## Phase 1: Setup

**Purpose**: No scaffold needed — modifying existing files only. This phase confirms the branch is clean and tests pass before changes begin.

- [x] T001 Verify branch `035-company-overview-recomm-api` is checked out and `pnpm run type-check` passes with 0 errors
- [x] T002 Verify baseline tests pass: `pnpm vitest run tests/store/recommendationsSelectors.test.ts tests/pages/RecommendationsFinchPage.test.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Type-layer and selector changes that both user stories depend on. Must be complete before any component or test work begins.

**⚠️ CRITICAL**: US1 and US2 both depend on `CompanyOverview` type and `selectRecommCompanyOverview` selector existing.

- [x] T003 Add `CompanyOverview` interface to `src/types/recommendationsTypes.ts` (new interface with `totalWorkforce: number`, `avgHourlyRate: number`, `avgSalary: number`)
- [x] T004 Add optional `companyOverview?: CompanyOverview` field to `RecommendationData` interface in `src/types/recommendationsTypes.ts`
- [x] T005 Add `CompanyOverview` to the import list in `src/store/selectors/recommendationsSelectors.ts`
- [x] T006 Add `selectRecommCompanyOverview` selector to `src/store/selectors/recommendationsSelectors.ts` (returns `CompanyOverview | null` from `state.recommendations.data?.recommendation?.companyOverview ?? null`)
- [x] T007 Run `pnpm run type-check` — must pass with 0 errors before proceeding

**Checkpoint**: Type system and selector are in place. Both user stories can now proceed.

---

## Phase 3: User Story 1 — Non-Finch User Sees Company Overview (Priority: P1) 🎯 MVP

**Goal**: When `isConnected === false`, `companyGlanceData` in `RecommendationsFinchPage` reads `totalWorkforce`, `averageHourlyWage`, and `averageSalary` from `recommendation.companyOverview` via the new selector.

**Independent Test**: Set `isConnected: false` in `useAssessmentStatus` mock and provide `recommendation.companyOverview` in the Redux preload — verify the three formatted values appear in the rendered page.

### Tests for User Story 1

- [x] T008 [P] [US1] Add `selectRecommCompanyOverview` import and `CompanyOverview` type import to `tests/store/recommendationsSelectors.test.ts`
- [x] T009 [P] [US1] Add `describe("selectRecommCompanyOverview")` block with 4 tests to `tests/store/recommendationsSelectors.test.ts`:
  - returns null when data is null
  - returns null when `companyOverview` is absent from recommendation
  - returns the `companyOverview` object when present
  - returns `totalWorkforce: 0` without coercing to null (zero-value edge case)
- [x] T010 [P] [US1] Add `defaultRecommendationsDataWithOverview` fixture (recommendations data containing `companyOverview: { totalWorkforce: 350, avgHourlyRate: 21.0, avgSalary: 58000 }`) at the top of `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T011 [P] [US1] Add `describe("RecommendationsFinchPage — company at a glance (non-connected path)")` block with `beforeEach` setting `isConnected: false` to `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T012 [US1] Add test: `"displays totalWorkforce from recommendation.companyOverview when not connected"` — expects `"350"` in document — in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T013 [US1] Add test: `"displays avgHourlyRate from recommendation.companyOverview when not connected"` — expects `"$21.00"` in document — in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T014 [US1] Add test: `"displays avgSalary from recommendation.companyOverview when not connected"` — expects `"$58,000"` in document — in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T015 [US1] Add test: `"shows N/A for company fields when companyOverview is absent and not connected"` — uses `defaultRecommendationsData` (no companyOverview), expects `"No data available"` — in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T016 [US1] Run selector tests and confirm they **fail** (red): `pnpm vitest run tests/store/recommendationsSelectors.test.ts`
- [x] T017 [US1] Run page tests and confirm they **fail** (red): `pnpm vitest run tests/pages/RecommendationsFinchPage.test.tsx`

### Implementation for User Story 1

- [x] T018 [US1] Import `selectRecommCompanyOverview` in `src/pages/recommendations/RecommendationsFinchPage.tsx` (add to existing `recommendationsSelectors` import block)
- [x] T019 [US1] Add `const recommCompanyOverview = useAppSelector(selectRecommCompanyOverview);` after `recommendationsIsLoading` line in `src/pages/recommendations/RecommendationsFinchPage.tsx`
- [x] T020 [US1] Replace `companyGlanceData` object in `src/pages/recommendations/RecommendationsFinchPage.tsx` with conditional version: `totalWorkforce`, `averageHourlyWage`, `averageSalary` use `isConnected ? workforceAPI : recommCompanyOverview` ternary; `industryAverageWage` unchanged
- [x] T021 [US1] Run type-check: `pnpm run type-check` — must pass with 0 errors
- [x] T022 [US1] Run tests and confirm they **pass** (green): `pnpm vitest run tests/store/recommendationsSelectors.test.ts tests/pages/RecommendationsFinchPage.test.tsx`

**Checkpoint**: US1 complete. Non-Finch users now see company overview data. Selector tests and page non-connected tests all pass.

---

## Phase 4: User Story 2 — Finch-Connected Regression Guard (Priority: P2)

**Goal**: Confirm the Finch-connected path is completely unaffected. The existing `"company at a glance data mapping"` describe block in the test file already covers this path — it must continue to pass without modification.

**Independent Test**: Run the existing Finch-connected test suite — all existing tests in `tests/pages/RecommendationsFinchPage.test.tsx` pass unchanged.

### Tests for User Story 2

- [x] T023 [US2] Run the full `tests/pages/RecommendationsFinchPage.test.tsx` suite (all describe blocks including the pre-existing `"company at a glance data mapping"` block): `pnpm vitest run tests/pages/RecommendationsFinchPage.test.tsx` — confirm 0 failures
- [x] T024 [US2] Visually confirm no change to `isConnected === true` branch in `src/pages/recommendations/RecommendationsFinchPage.tsx` — `workforceSection` and `compensationSection` selectors still used for those three fields

### Implementation for User Story 2

_(No new code — the conditional in T020 preserves the existing Finch-connected branch. Verification only.)_

- [x] T025 [P] [US2] Confirm `selectWorkforceSection`, `selectCompensationSection`, `selectWorkforceLoading` imports are still present and used in `src/pages/recommendations/RecommendationsFinchPage.tsx` (no dead-import regressions)
- [x] T026 [US2] Run full test suite: `pnpm vitest run tests/store/recommendationsSelectors.test.ts tests/store/selectors.test.ts tests/pages/RecommendationsFinchPage.test.tsx` — all must pass

**Checkpoint**: US1 and US2 both verified. All existing tests pass, new tests pass.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gate before PR.

- [x] T027 [P] Run full type-check across project: `pnpm run type-check` — 0 errors
- [x] T028 [P] Run linter and formatter: `pnpm lint:fix ; pnpm format`
- [x] T029 Run complete test suite for all affected files: `pnpm vitest run tests/store/recommendationsSelectors.test.ts tests/store/selectors.test.ts tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T030 Review `src/pages/recommendations/RecommendationsFinchPage.tsx` for any unused imports or dead selectors introduced by this change

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — verify baseline first
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS** all user stories (both US1 and US2 need the type + selector)
- **Phase 3 (US1)**: Depends on Phase 2
- **Phase 4 (US2)**: Depends on Phase 2; can run in parallel with Phase 3 (verification only — no new code)
- **Phase 5 (Polish)**: Depends on Phase 3 + Phase 4 completion

### User Story Dependencies

- **US1 (P1)**: Foundational phase must complete first. Core new feature.
- **US2 (P2)**: Foundational phase must complete first. Verification-only — no additional implementation beyond what US1 delivers.

### Within Each Phase

- T008–T015 (write failing tests) MUST run before T018–T020 (implementation) — TDD
- T016–T017 (confirm tests fail) MUST precede T021–T022 (confirm tests pass)
- T003 → T004 must be sequential (T004 references `CompanyOverview` from T003)
- T005 → T006 must be sequential (T006 imports the type from T005)

### Parallel Opportunities

Within Phase 2: T003+T004 are sequential; T005+T006 are sequential — but T003/T004 and T005/T006 chains can partially overlap once T003 is done.

Within Phase 3 tests: T008, T009, T010, T011 are all [P] (different sections of different files).

Within Phase 5: T027, T028 are [P] (type-check and lint are independent commands).

---

## Parallel Example: Phase 3 Test Writing

```bash
# These can be written simultaneously by separate sessions/agents:
# T008+T009 → tests/store/recommendationsSelectors.test.ts
# T010+T011+T012+T013+T014+T015 → tests/pages/RecommendationsFinchPage.test.tsx
```

---

## Implementation Strategy

**MVP scope**: Phase 2 + Phase 3 (US1) = full feature delivery.  
Phase 4 (US2) is verification only — the conditional in T020 inherently preserves the existing path.

**Suggested order for single implementor**:

1. T001 → T002 (baseline)
2. T003 → T004 → T005 → T006 → T007 (foundational — sequential)
3. T008 → T009 → T010 → T011 (write failing tests in parallel across files)
4. T012 → T013 → T014 → T015 (add assertion tests)
5. T016 → T017 (confirm red)
6. T018 → T019 → T020 (implement)
7. T021 → T022 (confirm green)
8. T023 → T024 → T025 → T026 (regression verification)
9. T027 → T028 → T029 → T030 (polish)

**Total tasks**: 30 | **US1**: 20 tasks | **US2**: 4 tasks | **Setup/Foundational/Polish**: 6 tasks

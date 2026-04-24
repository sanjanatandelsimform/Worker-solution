# Tasks: Remove Payroll Provider Question from Finch Flow

**Branch**: `022-finch-remove-payroll`  
**Input**: Design documents from `specs/022-finch-remove-payroll/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, quickstart.md ✓

**Total tasks**: 8  
**Parallel opportunities**: 4 tasks can run in parallel (T003–T006 after T001–T002)  
**Suggested MVP scope**: All tasks — feature is a single atomic removal with no optional increments

---

## Phase 1: Setup

**Purpose**: No new infrastructure needed. This phase confirms the branch and workspace are clean before changes begin.

- [x] T001 Confirm branch is `022-finch-remove-payroll` and `pnpm test` passes (baseline green)
- [x] T002 Confirm `pnpm run type-check` passes (baseline zero errors)

**Checkpoint**: Baseline is green — all source changes can now proceed

---

## Phase 2: Foundational — Type Contract (Blocking)

**Purpose**: Updating the TypeScript type first causes the compiler to immediately flag every downstream usage, making the remaining changes self-guided.

**⚠️ CRITICAL**: Complete T003 before touching any other source file — TypeScript errors will guide T004–T006

- [x] T003 [US1] Remove `payrollProvider: string | null` from `CompensationPayload` in `src/types/finchAssessmentTypes.ts`

**Checkpoint**: `pnpm run type-check` now reports errors in `finchAssessmentPayload.ts`, `AdditionalQuestions.tsx`, and `CompensationSection.tsx` — proceed to Phase 3

---

## Phase 3: User Story 1 — Finch Flow Excludes Payroll Provider Question (Priority: P1) 🎯 MVP

**Goal**: Remove the payroll provider question, its state, its validation, and its API field from the Finch Additional Questions flow end-to-end.

**Independent Test**: Navigate to the Finch Additional Questions page → Compensation section has no payroll provider dropdown → submitting the form succeeds without providing a payroll provider value → submitted payload contains no `payrollProvider` key.

### Implementation for User Story 1

- [x] T004 [P] [US1] Remove `payrollProvider` parameter and `payrollProvider: payrollProvider || null` field from `buildFinchAssessmentPayload` in `src/utils/finchAssessmentPayload.ts`
- [x] T005 [P] [US1] Remove `payrollProvider` state, validation block (`if (!payrollProvider)`), the `payrollProvider` argument in the `buildFinchAssessmentPayload(...)` call, and `payrollProvider` / `onPayrollProviderChange` props from `<CompensationSection>` in `src/pages/additionalQuestions/AdditionalQuestions.tsx`
- [x] T006 [P] [US1] Remove the `payroll-provider` question entry from `compensationQuestions`, remove `payrollProvider` and `onPayrollProviderChange` from `CompensationSectionProps` and destructuring, and remove the entire `if (question.isDropdown)` rendering branch in `src/pages/additionalQuestions/CompensationSection.tsx`

**Checkpoint**: `pnpm run type-check` must now pass with zero errors — US1 source changes are complete

---

## Phase 4: User Story 2 — Manual Flow Is Unaffected (Priority: P1)

**Goal**: Verify the manual assessment flow is undisturbed. No code changes are needed — this story is satisfied entirely by not touching the manual-flow files and by the test suite passing.

**Independent Test**: Run `pnpm test` — tests covering `assessmentSchemas.ts` and the manual assessment path must all pass without modification.

**Files explicitly NOT modified** (verified by git diff):

- `src/services/validation/assessmentSchemas.ts`
- `src/pages/assessmentWorkforce/CompensationTab.tsx`
- `src/hooks/useWorkforceCompensationConfig.ts`

_(No implementation tasks — compliance is enforced by scope constraint and test suite)_

**Checkpoint**: Confirm via `git diff --name-only` that none of the manual-flow files above appear in the diff

---

## Phase 5: Test Fixture Updates

**Purpose**: Update the four test files whose payload fixtures reference the now-removed `payrollProvider` field. All test changes are independent of each other.

- [x] T007 [P] Remove `payrollProvider` argument from every `buildFinchAssessmentPayload(...)` call and remove `payrollProvider: "ADP"` (or any value) from expected `compensation` object assertions in `tests/utils/finchAssessmentPayload.test.ts`
- [x] T008 [P] Remove `payrollProvider: null` from the `CompensationPayload` / `FinchAssessmentPayload` fixture in `tests/hooks/useSubmitFinchAssessment.test.ts`
- [x] T009 [P] Remove `_payrollProvider` destructuring and any related payroll provider argument or assertion in `tests/pages/AdditionalQuestionsHealthPremium.test.tsx`
- [x] T010 [P] Remove `payrollProvider: null` from the test payload fixture in `tests/services/finchAssessmentApi.test.ts`

**Checkpoint**: `pnpm test` passes with zero failures

---

## Phase 6: Polish & Verification

- [x] T011 Run `pnpm run type-check` — must report zero errors
- [x] T012 Run `pnpm test` — all tests must pass
- [x] T013 Run `pnpm lint:fix` — no lint errors
- [ ] T014 [P] Smoke test: `pnpm dev` → navigate to Additional Questions page (Finch flow) → confirm no payroll provider dropdown in Compensation section

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational — Type)**: Depends on Phase 1 ✓ — **BLOCKS Phase 3**
- **Phase 3 (US1 source)**: Depends on Phase 2 (T003) — T004, T005, T006 can run in parallel
- **Phase 4 (US2 verification)**: No code changes; verified after Phase 3 completes
- **Phase 5 (Tests)**: Depends on Phase 3 — T007–T010 can all run in parallel
- **Phase 6 (Polish)**: Depends on Phases 3 + 5

### User Story Dependencies

- **US1 (P1)**: Phases 2–3 — implementation; Phase 5 — test fixtures
- **US2 (P1)**: Phase 4 — constraint verification only; no code changes

### Parallel Opportunities

Within Phase 3, T004 + T005 + T006 can be worked simultaneously (different files):

```
T004  src/utils/finchAssessmentPayload.ts   ┐
T005  src/pages/.../AdditionalQuestions.tsx ├── all parallel after T003
T006  src/pages/.../CompensationSection.tsx ┘
```

Within Phase 5, T007 + T008 + T009 + T010 can be worked simultaneously (different files):

```
T007  tests/utils/finchAssessmentPayload.test.ts          ┐
T008  tests/hooks/useSubmitFinchAssessment.test.ts        ├── all parallel
T009  tests/pages/AdditionalQuestionsHealthPremium.test.tsx│
T010  tests/services/finchAssessmentApi.test.ts           ┘
```

---

## Implementation Strategy

### Single-Pass (Recommended — feature is atomic)

1. T001–T002: Confirm baseline is green
2. T003: Update type (compiler now flags all downstream usages)
3. T004–T006 in parallel: Fix all source files guided by TypeScript errors
4. Verify: `pnpm run type-check` passes
5. T007–T010 in parallel: Update test fixtures
6. T011–T014: Final verification

**Total estimated sessions**: 1 (all 14 tasks are small, well-scoped edits)

### Validation Checkpoints

| After | Command               | Expected                                        |
| ----- | --------------------- | ----------------------------------------------- |
| T002  | `pnpm run type-check` | Zero errors (baseline)                          |
| T003  | `pnpm run type-check` | Errors in 3 files (expected — guides T004–T006) |
| T006  | `pnpm run type-check` | Zero errors                                     |
| T010  | `pnpm test`           | All pass                                        |
| T014  | visual check          | No payroll provider dropdown in Finch flow      |

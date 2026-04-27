# Tasks: Additional Questions Test Coverage Update

**Input**: Design documents from `/specs/023-addl-questions-tests/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Branch**: `023-addl-questions-tests`  
**Scope**: Test-only — all changes confined to `tests/pages/`; no production code modified

**User Stories from spec.md (in priority order)**:

- US1 (P1): Redirect and Guard Behaviour → `tests/pages/AdditionalQuestions.test.tsx` (update)
- US2 (P1): Form Validation on Submit → `tests/pages/AdditionalQuestionsValidation.test.tsx` (new)
- US3 (P2): Field Interaction and Inline Error Clearing → `tests/pages/AdditionalQuestionsValidation.test.tsx` (new)
- US4 (P2): Submission Payload Construction → `tests/pages/AdditionalQuestionsValidation.test.tsx` (new)
- US5 (P2): Error and Success Message Display → `tests/pages/AdditionalQuestionsValidation.test.tsx` (new)
- US6 (P3): Existing Health Premium Tests Alignment → `tests/pages/AdditionalQuestionsHealthPremium.test.tsx` (update)

---

## Phase 1: Setup

**Purpose**: Confirm baseline passes and create the new test file skeleton

- [x] T001 Confirm all existing tests pass before any changes by running `pnpm test` and recording results
- [x] T002 Create `tests/pages/AdditionalQuestionsValidation.test.tsx` with file header, imports (`React`, `describe`, `it`, `expect`, `vi`, `beforeEach`, `render`, `screen`, `waitFor`, `fireEvent`, `MemoryRouter`), and empty describe block placeholder
- [x] T003 [P] Add global hook mocks to `tests/pages/AdditionalQuestionsValidation.test.tsx`: mock `react-router-dom` (`useNavigate`), `useAssessmentStatus`, `useFinchStatus`, `useSubmitFinchAssessment`, and `buildFinchAssessmentPayload` — using full shapes from data-model.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement test-friendly section component stubs shared by US2–US5. All validation/submission tests depend on these mocks being in place.

**⚠️ CRITICAL**: US2, US3, US4, and US5 tests CANNOT be written without these stubs rendering field-error spans and trigger buttons.

- [x] T004 Add `WorkforceSection` stub mock to `tests/pages/AdditionalQuestionsValidation.test.tsx` — renders `data-testid="workforce-section"`, forwards all `fieldErrors` as `data-testid="field-error-{key}"` spans, and exposes trigger buttons: `trigger-benefits-updates-work_email` (calls `onMultiSelectToggle`) and `trigger-deskless-employees-yes-deskless`, `trigger-annual-raises-yes-raises`, `trigger-annual-raises-no-raises` (calls `onAnswerChange`)
- [x] T005 Add `CompensationSection` stub mock to `tests/pages/AdditionalQuestionsValidation.test.tsx` — renders `data-testid="compensation-section"`, forwards all `fieldErrors` as `data-testid="field-error-{key}"` spans, and exposes trigger buttons: `trigger-payroll-provider-ADP` (calls `onPayrollProviderChange`), `trigger-annual-raise-month-january` (calls `onAnnualRaiseMonthChange`), `trigger-annual-raises-yes-raises` and `trigger-annual-raises-no-raises` (calls `onAnswerChange`)
- [x] T006 Add `BenefitsRetirementSection` stub mock to `tests/pages/AdditionalQuestionsValidation.test.tsx` — renders `data-testid="benefits-section"`, forwards all `fieldErrors` as `data-testid="field-error-{key}"` spans, and exposes trigger buttons: `trigger-benefits-broker-yes-broker` (calls `onAnswerChange`), `trigger-benefits-enrollment-month-january` (calls `onBenefitsEnrollmentMonthChange`), `trigger-health-premium-monthly-300` (calls `onHealthPremiumMonthlyChange`), `trigger-retirement-vesting-period-6mo_or_less`, `trigger-retirement-employer-match-yes-match`, `trigger-retirement-employer-match-no-match`, `trigger-retirement-auto-enroll-yes-autoenroll`, `trigger-retirement-hardship-withdrawals-yes-hardship` (calls `onAnswerChange`), `trigger-retirement-match-percentage-5` and `trigger-retirement-match-percentage-101` (calls `onRetirementMatchPercentageChange`)
- [x] T007 Add `GoalsSection` stub mock and `@/data/goalsData` mock to `tests/pages/AdditionalQuestionsValidation.test.tsx` — `goalsData` mock provides 3 goals (`goal1`, `goal2`, `goal3`); `GoalsSection` stub renders `data-testid="goals-section"`, forwards `fieldErrors["selectedGoals"]` as `data-testid="field-error-selectedGoals"` span, and exposes trigger buttons `trigger-goal-goal1`, `trigger-goal-goal2`, `trigger-goal-goal3` (each calls `onGoalToggle`)
- [x] T008 Add remaining mocks to `tests/pages/AdditionalQuestionsValidation.test.tsx`: mock `@/components/common/ErrorMessage` (renders `data-testid="error-message"`), mock `Button` component (renders `<button>` with `disabled` prop support), and dynamic import of `AdditionalQuestions` after all mocks; implement `renderPage()` helper and `fillAllRequiredFields()` helper per quickstart.md

**Checkpoint**: Foundational mocks complete — US2–US5 tests can now be written in the new file; US1 and US6 can proceed independently in parallel

---

## Phase 3: User Story 1 — Redirect and Guard Behaviour (Priority: P1) 🎯 MVP

**Goal**: All redirect/guard tests in the existing test file pass with the current section-component architecture.

**Independent Test**: Run `pnpm test -- AdditionalQuestions.test.tsx` — all 5 existing tests pass, close button test added, success-redirect test added.

- [x] T009 [US1] Add null-stub mocks for all four section components to `tests/pages/AdditionalQuestions.test.tsx`: `vi.mock("@/pages/additionalQuestions/WorkforceSection", ...)`, `CompensationSection`, `BenefitsRetirementSection`, `GoalsSection` — each returning `() => null` (see quickstart.md Step 1)
- [x] T010 [US1] Add mock for `@/components/common/ErrorMessage` to `tests/pages/AdditionalQuestions.test.tsx` to prevent import errors from the existing test setup
- [x] T011 [US1] Add test case to `tests/pages/AdditionalQuestions.test.tsx` — "navigates to /dashboard when success is true" — mocks `useSubmitFinchAssessment` returning `{ success: true }`, renders page, asserts `mockNavigate` called with `"/dashboard"` (covers FR-005)
- [x] T012 [US1] Add test case to `tests/pages/AdditionalQuestions.test.tsx` — "navigates to /dashboard when close button is clicked" — renders page, clicks the X button (`role="button"` with no text or by matching the icon container), asserts `mockNavigate` called with `"/dashboard"` (covers FR-009)
- [x] T013 [US1] Run `pnpm test -- AdditionalQuestions.test.tsx` and confirm all 7 tests pass

**Checkpoint**: US1 complete — redirect behaviour fully tested and passing independently

---

## Phase 4: User Story 2 — Form Validation on Submit (Priority: P1)

**Goal**: All 15 validation branches in `handleSubmit` are covered by failing-then-passing test cases in the new validation test file.

**Independent Test**: Run `pnpm test -- AdditionalQuestionsValidation.test.tsx` — all describe("Validation…") tests pass.

- [x] T014 [US2] Add `describe("AdditionalQuestions – Validation (empty form)", ...)` to `tests/pages/AdditionalQuestionsValidation.test.tsx` with test: "shows goals error when fewer than 3 goals selected" — renders page, clicks Next, asserts `field-error-selectedGoals` contains "Please select at least 3 workforce goals to rank them." (covers validation row 1)
- [x] T015 [US2] Add test "shows all required field errors when form is empty" — renders page, clicks Next, asserts `field-error-benefits-updates` = "Select an option", `field-error-deskless-employees` = "Select an option", `field-error-annual-raises` = "Select an option", `field-error-payroll-provider` = "Select an option", `field-error-benefits-broker` = "Select an option", `field-error-benefits-enrollment-period` = "Select an option", `field-error-health-plan-monthly-premium` = "Enter an amount", `field-error-retirement-vesting-period` = "Select an option", `field-error-retirement-employer-match` = "Select an option", `field-error-retirement-auto-enroll` = "Select an option", `field-error-retirement-hardship-withdrawals` = "Select an option" (covers validation rows 2–5, 7–11, 14–15)
- [x] T016 [US2] Add `describe("AdditionalQuestions – Conditional validation", ...)` with test: "requires raise month when annual-raises is yes-raises" — sets annual-raises to yes-raises via trigger, clicks Next (with all other required fields still empty), asserts `field-error-annualRaiseMonth` = "Please select a month." (covers validation row 6)
- [x] T017 [US2] Add test "does not require raise month when annual-raises is no-raises" — sets annual-raises to no-raises via trigger, clicks Next, asserts `queryByTestId("field-error-annualRaiseMonth")` is null (covers acceptance scenario US2-3)
- [x] T018 [US2] Add test "requires retirement match percentage when employer-match is yes-match" — sets retirement-employer-match to yes-match via trigger, clicks Next, asserts `field-error-retirementMatchPercentage` = "Please enter a percentage." (covers validation row 12)
- [x] T019 [US2] Add test "shows percentage-over-100 error when retirement match exceeds 100" — sets retirement-employer-match to yes-match and match percentage to 101 via triggers, clicks Next, asserts `field-error-retirementMatchPercentage` = "Percentage must be 100 or less." (covers validation row 13, edge case)
- [x] T020 [US2] Add test "does not require retirement match percentage when employer-match is no-match" — sets retirement-employer-match to no-match via trigger, clicks Next, asserts `queryByTestId("field-error-retirementMatchPercentage")` is null (covers acceptance scenario US2-6)
- [x] T021 [US2] Add test "passes validation and calls submit when all required fields are filled" — calls `fillAllRequiredFields()`, clicks Next, asserts `mockSubmit` called once and no field-error spans present (covers acceptance scenario US2-8, FR-003)

**Checkpoint**: US2 complete — all 15 validation branches covered

---

## Phase 5: User Story 3 — Field Interaction and Inline Error Clearing (Priority: P2)

**Goal**: Each inline-error-clearing scenario has a dedicated test case demonstrating error disappears immediately on field change.

**Independent Test**: Run `pnpm test -- AdditionalQuestionsValidation.test.tsx` — all describe("Inline error clearing…") tests pass.

- [x] T022 [US3] Add `describe("AdditionalQuestions – Inline error clearing", ...)` with test: "clears selectedGoals error when a goal is toggled after validation fires" — clicks Next to trigger error, then clicks `trigger-goal-goal1`, asserts `queryByTestId("field-error-selectedGoals")` is null (covers acceptance scenario US3-4, FR-010)
- [x] T023 [US3] Add test "clears annual-raises error when an answer is selected after validation fires" — clicks Next to trigger error, then clicks `trigger-annual-raises-no-raises`, asserts `queryByTestId("field-error-annual-raises")` is null (covers acceptance scenario US3-2, FR-010)
- [x] T024 [US3] Add test "clears health-plan-monthly-premium error when BenefitsRetirementSection calls onHealthPremiumMonthlyChange" — clicks Next to trigger error, then clicks `trigger-health-premium-monthly-300`, asserts `queryByTestId("field-error-health-plan-monthly-premium")` is null (covers acceptance scenario US3-1, FR-010)
- [x] T025 [US3] Add test "resets retirementMatchPercentage to empty string when employer-match changes to no-match" — set match to yes-match then match % to 5 via triggers, then switch to no-match via trigger, click Next again, assert no `field-error-retirementMatchPercentage` (proving % was reset to ""); covers acceptance scenario US3-3 and FR-012

**Checkpoint**: US3 complete — all error-clearing paths verified

---

## Phase 6: User Story 4 — Submission Payload Construction (Priority: P2)

**Goal**: `buildFinchAssessmentPayload` is called with precisely the correct 8 arguments and `submit()` receives its return value.

**Independent Test**: Run `pnpm test -- AdditionalQuestionsValidation.test.tsx` — all describe("Submission payload…") tests pass.

- [x] T026 [US4] Add `describe("AdditionalQuestions – Submission payload", ...)` with test: "calls buildFinchAssessmentPayload with correct arguments on valid no-match submission" — calls `fillAllRequiredFields()` (uses no-match path), clicks Next, asserts `vi.mocked(buildFinchAssessmentPayload)` called with `(expect.any(Object), expect.any(Object), "", "ADP", "january", false, "", "300")` (covers acceptance scenarios US4-1, US4-3, US4-5, FR-007)
- [x] T027 [US4] Add test "calls buildFinchAssessmentPayload with retirementPlanHasMatch=true and percentage when yes-match path used" — calls `fillAllRequiredFields()` then override to yes-match and set percentage to 5 via triggers (also need all goals + other fields), clicks Next, asserts `buildFinchAssessmentPayload` called with 6th arg `true` and 7th arg `"5"` (covers acceptance scenario US4-4, FR-007)
- [x] T028 [US4] Add test "calls submit() with the payload returned by buildFinchAssessmentPayload" — mocks `buildFinchAssessmentPayload` returning a known payload object, calls `fillAllRequiredFields()`, clicks Next, asserts `mockSubmit` called with that exact payload object (covers acceptance scenario US4-2, FR-008)
- [x] T029 [US4] Add test "does not call submit() when validation fails" — clicks Next without filling any fields, asserts `mockSubmit` not called (confirms validation gate works end-to-end)

**Checkpoint**: US4 complete — payload construction correctness verified

---

## Phase 7: User Story 5 — Error and Success Message Display (Priority: P2)

**Goal**: API error strings and success state from `useSubmitFinchAssessment` render the correct UI feedback.

**Independent Test**: Run `pnpm test -- AdditionalQuestionsValidation.test.tsx` — all describe("Error and success…") tests pass.

- [x] T030 [US5] Add `describe("AdditionalQuestions – Error and success display", ...)` with test: "renders API error message when hook returns error" — overrides `useSubmitFinchAssessment` mock to return `{ error: "Something went wrong", success: false, isSubmitting: false, ... }`, renders page, asserts `screen.getByTestId("error-message")` has text "Something went wrong" (covers acceptance scenario US5-1)
- [x] T031 [US5] Add test "renders success message and navigates to dashboard when hook returns success" — overrides `useSubmitFinchAssessment` mock to return `{ success: true, error: null, isSubmitting: false, ... }`, renders page, asserts `screen.getByTestId("error-message")` has text "Assessment submitted successfully!" and `mockNavigate` called with "/dashboard" via waitFor (covers acceptance scenario US5-2, FR-005)
- [x] T032 [US5] Add test "shows Submitting... text and disabled Next button when isSubmitting is true" — overrides `useSubmitFinchAssessment` mock to return `{ isSubmitting: true, ... }`, renders page, asserts Next button text is "Submitting..." and `button` has `disabled` attribute (covers acceptance scenario US5-3, FR-006)
- [x] T033 [US5] Add test "calls clearError when error message is dismissed" — overrides mock to return error state with known `mockClearError` fn, renders page, fires the error message onClose callback, asserts `mockClearError` called (covers acceptance scenario US5-4)

**Checkpoint**: US5 complete — all error/success display paths verified

---

## Phase 8: User Story 6 — Existing Health Premium Tests Alignment (Priority: P3)

**Goal**: `AdditionalQuestionsHealthPremium.test.tsx` passes without modification to production code, using section-level mocks instead of individual primitive mocks.

**Independent Test**: Run `pnpm test -- AdditionalQuestionsHealthPremium.test.tsx` — all existing tests pass.

- [x] T034 [US6] Replace individual UI primitive mocks in `tests/pages/AdditionalQuestionsHealthPremium.test.tsx` with four section-level mocks per quickstart.md Step 2 — `WorkforceSection` → `() => null`, `CompensationSection` → `() => null`, `BenefitsRetirementSection` → thin stub rendering a real `<input type="number" placeholder="Enter amount">` plus label text plus error span, `GoalsSection` → `() => null`
- [x] T035 [US6] Remove now-redundant individual primitive mocks from `tests/pages/AdditionalQuestionsHealthPremium.test.tsx`: remove `vi.mock` calls for `Select`, `SelectItem`, `RadioButton`, `RadioGroup`, `Label`, `Checkbox`, `@/assets/icons/inputInfo`, `RankingList`, `Tooltip`, `TooltipTrigger` (all replaced by section-level mocks in T034)
- [x] T036 [US6] Run `pnpm test -- AdditionalQuestionsHealthPremium.test.tsx` and confirm all tests pass; fix any import or mock-shape issues without modifying production code
- [x] T037 [US6] Add mock for `@/data/goalsData` to `tests/pages/AdditionalQuestionsHealthPremium.test.tsx` (returns `goalsData: []`) to prevent any import-resolution errors from the GoalsSection mock path

**Checkpoint**: US6 complete — health premium test file aligned and fully passing

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final validation — type checking, coverage verification, and clean run

- [x] T038 [P] Run `pnpm run type-check` — confirm 0 TypeScript errors across all three test files
- [x] T039 [P] Run `pnpm lint:fix` and `pnpm format` on all modified test files in `tests/pages/`
- [x] T040 Run `pnpm test` (full suite) — confirm 0 failing tests; verify `AdditionalQuestions.tsx` coverage ≥ 90% statements in coverage report (SC-001, SC-002)
- [x] T041 Review coverage report for `src/pages/additionalQuestions/AdditionalQuestions.tsx` — confirm all 15 validation branches (data-model.md validation matrix) each have at least one covering test (SC-003)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS US2, US3, US4, US5
- **US1 (Phase 3)**: Depends on Phase 1 only — can start in **parallel** with Phase 2 (different file)
- **US2 (Phase 4)**: Depends on Phase 2 completion
- **US3 (Phase 5)**: Depends on Phase 2 completion; can run in **parallel** with US2 (different describe block)
- **US4 (Phase 6)**: Depends on Phase 2 completion; can run in **parallel** with US2, US3
- **US5 (Phase 7)**: Depends on Phase 2 completion; can run in **parallel** with US2, US3, US4
- **US6 (Phase 8)**: Depends on Phase 1 only — can start in **parallel** with Phase 2 (different file)
- **Polish (Phase 9)**: Depends on all phases complete

### User Story Dependencies

| Story    | Blocking     | Can Parallel With                                      |
| -------- | ------------ | ------------------------------------------------------ |
| US1 (P1) | Phase 1 only | Phase 2, US6                                           |
| US2 (P1) | Phase 2      | US3, US4, US5 (different describe blocks in same file) |
| US3 (P2) | Phase 2      | US2, US4, US5                                          |
| US4 (P2) | Phase 2      | US2, US3, US5                                          |
| US5 (P2) | Phase 2      | US2, US3, US4                                          |
| US6 (P3) | Phase 1 only | Phase 2, US1                                           |

### Within Each User Story

- Tests are written in order of increasing complexity within each describe block
- Each test is independently runnable (`it.only(...)` can isolate any single test)
- No test has a dependency on another test's side-effects (each uses `beforeEach` with `mockReset`)

---

## Parallel Opportunities

```bash
# After Phase 1 completes, these can run simultaneously:
Task T004  # Foundational: WorkforceSection mock   → tests/pages/AdditionalQuestionsValidation.test.tsx
Task T009  # US1: Add section null-stubs           → tests/pages/AdditionalQuestions.test.tsx
Task T034  # US6: Replace primitive mocks          → tests/pages/AdditionalQuestionsHealthPremium.test.tsx

# After Phase 2 completes, these describe() blocks can be written simultaneously:
Task T014-T021  # US2 validation tests             → AdditionalQuestionsValidation.test.tsx
Task T022-T025  # US3 error-clearing tests         → AdditionalQuestionsValidation.test.tsx
Task T026-T029  # US4 payload tests                → AdditionalQuestionsValidation.test.tsx
Task T030-T033  # US5 display tests                → AdditionalQuestionsValidation.test.tsx

# Polish tasks are independent:
Task T038  # type-check
Task T039  # lint + format
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational mocks (T004–T008)
3. Complete Phase 3: US1 redirect tests (T009–T013)
4. Complete Phase 4: US2 validation tests (T014–T021)
5. **STOP and VALIDATE**: Run `pnpm test -- AdditionalQuestions.test.tsx AdditionalQuestionsValidation.test.tsx` — both must pass
6. All critical P1 stories delivered; P2 and P3 can follow

### Full Delivery (All Stories)

1. Continue with Phase 5–8 after MVP validation
2. Run full test suite after each phase
3. Final Polish in Phase 9

---

## Task Count Summary

| Phase                 | Tasks        | User Story    | Priority |
| --------------------- | ------------ | ------------- | -------- |
| Phase 1: Setup        | T001–T003    | —             | —        |
| Phase 2: Foundational | T004–T008    | —             | —        |
| Phase 3               | T009–T013    | US1           | P1       |
| Phase 4               | T014–T021    | US2           | P1       |
| Phase 5               | T022–T025    | US3           | P2       |
| Phase 6               | T026–T029    | US4           | P2       |
| Phase 7               | T030–T033    | US5           | P2       |
| Phase 8               | T034–T037    | US6           | P3       |
| Phase 9: Polish       | T038–T041    | —             | —        |
| **Total**             | **41 tasks** | **6 stories** | —        |

**Parallelizable tasks**: T003, T004/T009/T034 (after Phase 1), T014–T033 (after Phase 2), T038–T039 (Polish)

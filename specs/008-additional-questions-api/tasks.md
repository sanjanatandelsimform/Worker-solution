# Tasks: API Integration for the Additional Questions Form

**Branch**: `008-additional-questions-api`
**Input**: Design documents from `/specs/008-additional-questions-api/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/finch-assessment-post.md](./contracts/finch-assessment-post.md), [quickstart.md](./quickstart.md)

**Tests**: Following TDD per Constitution Principle III — tests written FIRST, before implementation

**Organization**: Tasks grouped by user story for independent implementation and testing

---

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **Checkbox**: `- [ ]` — Track completion status
- **[ID]**: Task identifier (T001, T002, …) in execution order
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3) — Phase-specific only
- **Description**: Clear action with exact file path

---

## Phase 1: Setup

**Purpose**: Verify the development environment baseline and expose component API details required for integration tasks in Phase 3

- [x] T001 Verify branch `008-additional-questions-api` is active and `pnpm run type-check` passes with zero errors as a clean baseline
- [x] T002 [P] Read `src/components/base/select/select.tsx` in full to identify the controlled prop names for value and change handler — **Result**: `selectedKey` + `onSelectionChange` (React Aria)
- [x] T003 [P] Read `src/components/base/buttons/button.tsx` in full to confirm whether the disabled prop is `isDisabled` (React Aria) or `disabled` (HTML) — **Result**: `isDisabled` + standard HTML `onClick`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: New TypeScript type definitions + TDD test scaffolding — must complete before ANY user story work begins

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete

- [x] T004 Create `src/types/finchAssessmentTypes.ts` with interfaces `WorkforcePayload`, `CompensationPayload`, `BenefitsPayload`, `GoalsPayload`, `FinchAssessmentPayload`, `FinchAssessmentResponse` exactly as specified in data-model.md§TypeScript Type Definitions
- [x] T005 [P] Create `tests/utils/finchAssessmentPayload.test.ts` with 8 TDD test cases: (1) workforce communicationMethods array passthrough, (2) hasDesklessEmployees boolean coercion from yes-deskless, (3) annualRaiseMonth capitalised from lowercase ID, (4) annualRaiseMonth omitted when offersAnnualRaises is false, (5) benefits broker ID mapped to "Yes"/"No"/"Unsure" string, (6) multi-select fields with no selection submit as empty arrays, (7) workforceGoals maps selected IDs to goal label strings, (8) full payload matches FinchAssessmentPayload shape — all tests MUST FAIL before T008 is implemented
- [x] T006 [P] Create `tests/hooks/useSubmitFinchAssessment.test.ts` with 5 TDD test cases: (1) initial state: isSubmitting=false, error=null, success=false, (2) isSubmitting=true during API call, (3) success=true after 2xx response, (4) error set to message string after non-2xx response, (5) clearError() resets error to null — all tests MUST FAIL before T009 is implemented
- [x] T007 [P] Create `tests/services/finchAssessmentApi.test.ts` with 4 TDD test cases: (1) calls POST to `/api/v1/assessment/finch`, (2) includes Bearer token Authorization header (via apiClient interceptor), (3) resolves with success response on 2xx, (4) rejects/throws on non-2xx — all tests MUST FAIL before T010 is implemented

**Checkpoint**: Types file and 3 test files exist; all new tests fail (TDD Red); `pnpm run type-check` passes

---

## Phase 3: User Story 1 — Successful Form Submission (Priority: P1) 🎯 MVP

**Goal**: Clicking "Next" assembles and POSTs the four-section payload to `POST /api/v1/assessment/finch`; on a 2xx response a success banner is shown and the user is navigated to `/dashboard`

**Independent Test**: Fill all required fields, click "Next," confirm exactly one POST to `/api/v1/assessment/finch` with payload matching the contract schema, confirm success banner (`errorType="success"`) appears, confirm browser navigates to `/dashboard`

### Implementation for User Story 1

- [x] T008 [P] [US1] Create `src/utils/finchAssessmentPayload.ts` implementing `buildFinchAssessmentPayload(answers, goalsAnswers, annualRaiseMonth, payrollProvider, benefitsEnrollmentMonth): FinchAssessmentPayload` per all transformation rules in data-model.md§Payload Builder — makes `tests/utils/finchAssessmentPayload.test.ts` Green
- [x] T009 [P] [US1] Create `src/hooks/useSubmitFinchAssessment.ts` exposing `{ isSubmitting, error, success, submit, clearError }` typed as `UseSubmitFinchAssessmentReturn` per data-model.md§Hook Shape — makes `tests/hooks/useSubmitFinchAssessment.test.ts` Green
- [x] T010 [P] [US1] Add `export async function submitFinchAssessment(payload: FinchAssessmentPayload): Promise<ApiResponse>` at the bottom of `src/services/api/assessmentApi.ts` using `apiClient` imported from `authApi.ts` (not the local `api` instance already in that file) — makes `tests/services/finchAssessmentApi.test.ts` Green
- [x] T011 [US1] Update 18 option IDs in static data arrays in `src/pages/additionalQuestions/AdditionalQuestions.tsx` per data-model.md§Option ID Changes: `work_email`, `personal_email`, `office_signs`, `group_transportation`, `<15min`, `15-30min`, `30-1hr`, `1hr+`, `cash_bonuses`, `profit_sharing`, `stock_options`, `deferred_compensation`, `pension_plans`, `<6m`, `6m_1yr`, `1yr_2yr`, `2yr_4yr`, `>4yr`
- [x] T012 [P] [US1] Update 14 goal labels in `goalsData` to title-case in `src/pages/additionalQuestions/AdditionalQuestions.tsx` per data-model.md§goalsData label capitalisation table (e.g. `"Attract talent"` → `"Attract Talent"`, `"Retain talent"` → `"Retain Talent"`)
- [x] T013 [US1] Add three new state variables in `src/pages/additionalQuestions/AdditionalQuestions.tsx`: `const [annualRaiseMonth, setAnnualRaiseMonth] = useState<string>("")`, `const [payrollProvider, setPayrollProvider] = useState<string>("")`, `const [benefitsEnrollmentMonth, setBenefitsEnrollmentMonth] = useState<string>("")`
- [x] T014 [US1] Wire all three `Select` components as controlled inputs using prop names confirmed in T002 in `src/pages/additionalQuestions/AdditionalQuestions.tsx`: (1) payroll provider Select → `payrollProvider` / `setPayrollProvider`, (2) annual raise month Select → `annualRaiseMonth` / `setAnnualRaiseMonth`, (3) benefits enrollment month Select → `benefitsEnrollmentMonth` / `setBenefitsEnrollmentMonth`
- [x] T015 [US1] In `src/pages/additionalQuestions/AdditionalQuestions.tsx`: import `useSubmitFinchAssessment` from `@/hooks/useSubmitFinchAssessment`; import `buildFinchAssessmentPayload` from `@/utils/finchAssessmentPayload`; destructure `{ isSubmitting, error, success, submit, clearError }` from the hook; add `const [validationError, setValidationError] = useState<string | null>(null)`
- [x] T016 [US1] Implement `handleSubmit` function in `src/pages/additionalQuestions/AdditionalQuestions.tsx`: (1) validate `answers["deskless-employees"]` is set, (2) validate `answers["retirement-vesting-period"]` is set, (3) validate `answers["retirement-auto-enroll"]` is set, (4) validate `answers["retirement-hardship-withdrawals"]` is set, (5) when `answers["annual-raises"] === "yes-raises"` validate `annualRaiseMonth` is non-empty — set `validationError` and return early on any failure; on pass call `buildFinchAssessmentPayload(answers, goalsAnswers, annualRaiseMonth, payrollProvider, benefitsEnrollmentMonth)` then call `await submit(payload)`
- [x] T017 [US1] Show inline validation error text adjacent to the annual raise month dropdown in `src/pages/additionalQuestions/AdditionalQuestions.tsx`: render a `<p className="text-sm text-red-600 mt-1">Please select a month</p>` (or equivalent semantic class) directly below the `Select` when `answers["annual-raises"] === "yes-raises"` and `validationError` is non-null and `annualRaiseMonth` is empty
- [x] T018 [US1] Add `useEffect(() => { if (success) navigate("/dashboard"); }, [success, navigate])` in `src/pages/additionalQuestions/AdditionalQuestions.tsx`
- [x] T019 [US1] Render `<ErrorMessage errorType="success" message="Assessment submitted successfully!" onClose={() => {}} />` at the top of the form content area (immediately inside the `mx-auto` container div, above the first section card) when `success === true` in `src/pages/additionalQuestions/AdditionalQuestions.tsx`

**Checkpoint**: User Story 1 complete — "Next" fires the POST, success banner shown, browser navigates to `/dashboard`

---

## Phase 4: User Story 2 — API Error Handling (Priority: P2)

**Goal**: Non-2xx responses and network failures surface an inline danger banner; all form answers remain intact on the page

**Independent Test**: Intercept POST and return a 500; click "Next"; confirm `<ErrorMessage errorType="danger">` renders at top of form area with all form field values still populated; confirm banner can be manually dismissed

### Implementation for User Story 2

- [x] T020 [US2] In `src/pages/additionalQuestions/AdditionalQuestions.tsx`: render `<ErrorMessage errorType="danger" message={error ?? ""} onClose={clearError} />` at the top of the form content area (same location as T019 success banner — display is mutually exclusive) when `error` is non-null; confirm all `answers`, `goalsAnswers`, and the three dropdown state variables are untouched by the error path

**Checkpoint**: User Story 2 complete — API error banner displayed on failure, form data preserved, banner dismissible via clearError

---

## Phase 5: User Story 3 — Loading / In-Progress Feedback (Priority: P3)

**Goal**: The "Next" button is visually disabled and non-interactive while the POST is in flight, preventing duplicate submission

**Independent Test**: Click "Next"; before response arrives confirm button is disabled and a second click has no effect; after response (success or failure) confirm button returns to active state or navigation occurs

### Implementation for User Story 3

- [x] T021 [US3] Wire the "Next" `Button` with `onClick={handleSubmit}`, `isDisabled={isSubmitting}`, and conditional label in `src/pages/additionalQuestions/AdditionalQuestions.tsx`: add `onPress={handleSubmit}` (or `onClick` if confirmed in T003 — match the Button API); add the disabled prop (name confirmed in T003) set to `{isSubmitting}`; optionally change button label to `isSubmitting ? "Submitting..." : "Next"` for additional user feedback

**Checkpoint**: User Story 3 complete — button disabled and non-interactive during in-flight POST; prevents duplicate submissions

---

## Phase 6: Polish & Quality Gate

**Purpose**: Verify all code quality standards and validate complete end-to-end behaviour across all three user stories

- [x] T022 Run `pnpm run type-check` and confirm zero TypeScript errors across all changed and new files
- [x] T023 [P] Run `pnpm lint:fix` then `pnpm format` — zero ESLint and Prettier violations remain
- [x] T024 [P] Run `pnpm test` — confirm all three new test files pass (`finchAssessmentPayload.test.ts`, `useSubmitFinchAssessment.test.ts`, `finchAssessmentApi.test.ts`) and zero existing tests regress
- [ ] T025 Smoke test happy path: run `pnpm dev` → navigate to the Additional Questions page → fill all required fields → click "Next" → open Network tab → confirm one POST to `/api/v1/assessment/finch` with correct four-section JSON → confirm success banner appears → confirm navigation to `/dashboard`
- [ ] T026 Smoke test error path: intercept or mock POST to return HTTP 500 → click "Next" → confirm `ErrorMessage errorType="danger"` banner appears at top of form → confirm all previously entered form values are still visible and intact → confirm banner can be closed with the × button
- [ ] T027 Smoke test validation path: select "Yes" for annual raises but leave month dropdown empty → click "Next" → confirm inline validation error appears near the month dropdown → confirm no POST request is made to the API

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately. T002 result needed before T014; T003 result needed before T021.
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user story work.
- **US1 (Phase 3)**: Depends on Phase 2 (T004 types must exist). T008/T009/T010 can start as soon as T004 completes.
- **US2 (Phase 4)**: Depends on T015 (hook imported in component) and T020 is a one-task delta.
- **US3 (Phase 5)**: Depends on T016 (handleSubmit exists) and T003 (button prop name confirmed).
- **Quality Gate (Phase 6)**: Depends on all user story phases complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on US2 or US3 — independently completable after Foundational.
- **US2 (P2)**: Depends on T015 completion (hook imported in component). A small delta on top of US1 component work.
- **US3 (P3)**: Depends on T016 completion (handleSubmit function written). A single button wiring task.

### Within Phase 3 (US1)

| Task(s)          | Depends on          | Can run in parallel with |
| ---------------- | ------------------- | ------------------------ |
| T008, T009, T010 | T004 (types file)   | Each other [P]           |
| T011             | T004                | T012 [P]                 |
| T012             | T004                | T011 [P]                 |
| T013             | T011, T012          | —                        |
| T014             | T013, T002 findings | —                        |
| T015             | T009 (hook created) | —                        |
| T016             | T015, T008          | —                        |
| T017             | T016                | —                        |
| T018             | T015                | T019                     |
| T019             | T015                | T018                     |

---

## Parallel Examples

### Phase 2 — Create all test files simultaneously

```
Task T005: tests/utils/finchAssessmentPayload.test.ts
Task T006: tests/hooks/useSubmitFinchAssessment.test.ts
Task T007: tests/services/finchAssessmentApi.test.ts
```

### Phase 3 — Create core logic files simultaneously (after T004)

```
Task T008: src/utils/finchAssessmentPayload.ts
Task T009: src/hooks/useSubmitFinchAssessment.ts
Task T010: src/services/api/assessmentApi.ts  (add submitFinchAssessment)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T007) — types + TDD Red tests
3. Complete Phase 3: User Story 1 (T008–T019) — full happy path
4. **STOP and VALIDATE**: Run smoke test T025 — form POSTs, success banner shows, navigates to `/dashboard`
5. Demo or deploy MVP increment; continue with US2 and US3 if accepted

### Incremental Delivery

1. MVP (US1) → smoke test T025 → merge if acceptable
2. Add US2 (T020) → smoke test T026 (error path) → merge
3. Add US3 (T021) → smoke test T027 (validation path) → merge
4. Quality Gate (T022–T027) → full suite green → PR ready

### Single Developer (Sequential)

```
Phase 1:  T001 → T002 + T003 (parallel)
Phase 2:  T004 → T005 + T006 + T007 (parallel)
Phase 3:  T008 + T009 + T010 (parallel)
          → T011 + T012 (parallel)
          → T013 → T014 → T015 → T016 → T017
          → T018 + T019 (parallel)
Phase 4:  T020
Phase 5:  T021
Phase 6:  T022 → T023 + T024 (parallel) → T025 → T026 → T027
```

---

## Notes

- **[P]** tasks have different target files and no incomplete shared dependency — safe to run concurrently
- **[Story]** label provides full traceability from task back to the user story acceptance scenario
- **TDD discipline**: Run `pnpm test` after T004–T007 and confirm all new tests fail before writing any source file
- **Critical — Two Axios instances**: `submitFinchAssessment` in `assessmentApi.ts` MUST use `apiClient` from `authApi.ts`. The local `api` instance already in that file is used only by the existing functions — do NOT refactor existing functions in this PR.
- **Critical — Month format**: Use `capitalise(id)` (e.g. `"january"` → `"January"`). Do NOT use `mapMonthToApiValue` — it produces 3-letter abbreviations (`"Jan"`) which are incompatible with this endpoint.
- **Critical — Static ranking**: `workforceGoalsRanking` is always `["Retain Talent", "Attract Talent", "Reduce Absenteeism"]` — hardcoded, not derived from user selections.
- Commit after each task or logical group to keep history clean
- Stop at each Checkpoint to validate the story independently before proceeding

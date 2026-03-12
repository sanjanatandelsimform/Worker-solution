# Tasks: Replace Hardcoded State Options with Live API Integration

**Input**: Design documents from `/specs/001-states-api-integration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/states-lookup.md, quickstart.md

**Tests**: Included — constitution principle III (TDD) mandates tests before implementation.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Source File References

| File | Role | Lines of Interest |
|------|------|-------------------|
| `src/components/assessment/DynamicTab.tsx` (819 lines) | Receives `questions: Question[]` as prop, passes each `question` **by reference** (no cloning) to `DynamicQuestionRenderer` via `renderQuestion()` (~L762–778). Uses `useAssessment({ section })` for answers/errors. | L12–24 (props), L762–778 (renderQuestion), L65–68 (useAssessment) |
| `src/components/assessment/DynamicQuestionRenderer.tsx` (921 lines) | Reads options from `question.validationRules.fields[].options` in `renderStructuredArrayField()` (~L140–210). For conditionals, `renderConditionalQuestion()` (~L413–487) iterates `conditionalQuestion.validationRules.fields` and delegates to `renderStructuredArrayField(field, index, ..., conditionalKey)`. **No override props** — options must be baked into the question object before rendering. | L140–210 (renderStructuredArrayField), L413–487 (conditional STRUCTURED_ARRAY), L755–820 (main STRUCTURED_ARRAY case) |
| `src/data/assessment/questionData.json` (1601 lines) | Hardcoded 50 states in `{ id, label }` format. `topWorkLocations` at L198: `validationRules.fields[0].options`. `employeeLivingZipCodes` at L298: nested inside `employeesResideInSameZipCodes.conditionalQuestion.question.validationRules.fields[0].options`. | L198–280 (topWorkLocations), L283–400 (employeesResideInSameZipCodes + conditional) |
| `src/pages/assessmentWorkforce/WorkforceTab.tsx` (47 lines) | Thin wrapper: imports `questionData.json`, finds "Workforce" section, passes `questions` to `<DynamicTab>`. Currently has no hooks. **This is the injection point** — will call `useStatesLookup()`, clone questions, replace state field options, pass modified array to `DynamicTab`. | L22–46 (entire component body) |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the `getStates()` API service function and TypeScript types that all user stories depend on.

**Key insight**: `src/services/api/assessmentApi.ts` already has an `api = axios.create(...)` instance (L39–44) with auth interceptors (L48–60). The `getStates()` function reuses this instance, following the same pattern as `getIndustries()` in `authApi.ts` (L432–445).

- [x] T001 Add `StateOptionApi` and `StatesLookupResponse` TypeScript interfaces to `src/services/api/assessmentApi.ts` — `StateOptionApi: { stateAbbreviation: string; stateName: string }`, `StatesLookupResponse: { data: { states: StateOptionApi[] } }`
- [x] T002 Add `getStates()` exported function to `src/services/api/assessmentApi.ts` using the existing `api` axios instance — calls `GET /lookup/states`, returns typed `StatesLookupResponse`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the `useStatesLookup` custom hook that manages the entire fetch lifecycle (loading → success/error), transforms API shape to component shape, and enforces the single-fetch constraint.

**Key insight**: Follow the exact `useState + useEffect + async IIFE` pattern from `RegistrationForm.tsx` (L36–40 for state vars, L115–139 for useEffect body): three state vars (`data`, `isLoading`, `error`), empty dependency array, try/catch/finally with `setIsLoading(false)` in finally block.

**Key insight**: `DynamicQuestionRenderer.renderStructuredArrayField()` (L140–210) reads state select options as `field.options?.map(opt => ({ id: opt.id, label: opt.label }))` — the `{ id, label }` shape is critical.  The conditional STRUCTURED_ARRAY path (L413–487) uses the same `renderStructuredArrayField` with `conditionalKey` as `arrayKey`, and reads options from the inline field type — same `{ id, label }` shape.

**⚠️ CRITICAL**: No user story integration can begin until this phase is complete.

### Tests

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T003 [P] Write unit tests for `transformStates()` helper in `tests/hooks/useStatesLookup.test.ts` — covers: valid entries mapped to `{ id, label }`, entries missing `stateAbbreviation` skipped, entries missing `stateName` skipped, all-malformed returns empty array, empty input returns empty array
- [x] T004 [P] Write hook tests for `useStatesLookup` in `tests/hooks/useStatesLookup.test.ts` — covers: returns `isLoading: true` initially, sets `stateOptions` on success, sets `error` on API failure, sets `error` on empty array response, calls API exactly once on mount (no re-fetch on re-render)

### Implementation

- [x] T005 Create `transformStates()` pure function in `src/hooks/useStatesLookup.ts` — filters entries missing `stateAbbreviation` or `stateName`, maps valid entries to `{ id, label }` (FR-004, FR-011)
- [x] T006 Create `useStatesLookup` custom hook in `src/hooks/useStatesLookup.ts` — manages `stateOptions`, `isLoading`, `error` state via `useState`; calls `getStates()` in `useEffect([], [])` on mount; transforms response via `transformStates()`; treats empty result as error (FR-008); returns `{ stateOptions, isLoading, error }` (FR-001, FR-005)
- [x] T007 Run tests from T003 and T004 — all must pass (Green phase)

**Checkpoint**: `useStatesLookup` hook is complete, tested, and ready for integration.

---

## Phase 3: User Story 1 — States Load Dynamically on Form Mount (Priority: P1) 🎯 MVP

**Goal**: `topWorkLocations` and `employeeLivingZipCodes` state dropdowns are populated from the live API instead of hardcoded JSON.

**Key insight**: `DynamicTab` passes `question` objects **by reference** to `DynamicQuestionRenderer` (see `renderQuestion()` at DynamicTab L762–778 — `question={question}` with no spread/clone). Therefore, cloning must happen in `WorkforceTab` before passing to `DynamicTab`. The renderer will read the cloned options from `question.validationRules.fields[0].options` as usual.

**Key insight**: Two injection paths (from questionData.json structure):
1. `topWorkLocations` (L198): `question.validationRules.fields[0].options` where `fields[0].name === "state"`
2. `employeeLivingZipCodes` (L298): nested at `employeesResideInSameZipCodes.conditionalQuestion.question.validationRules.fields[0].options`

**Independent Test**: Open WorkforceTab, confirm state select options match the API response; submit the form and confirm the payload shape is unchanged.

### Tests for User Story 1

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T008 [US1] Write integration test for WorkforceTab state option injection in `tests/pages/WorkforceTab.test.tsx` — mock `getStates()` from `@/services/api/assessmentApi` to return known states; mock `useAssessment` to avoid real API calls; render WorkforceTab; assert that `topWorkLocations` state select contains API-sourced options (not hardcoded); assert `employeeLivingZipCodes` conditional state select also contains API-sourced options; assert other questions retain their original options unchanged (FR-006). Follow the same mock pattern as `tests/pages/RegisterPage.test.tsx` (`vi.mock()` + `vi.mocked()` + `mockResolvedValue`).

### Implementation for User Story 1

- [x] T009 [US1] Import `useStatesLookup` in `src/pages/assessmentWorkforce/WorkforceTab.tsx` and call it at the top of the component — destructure `{ stateOptions, isLoading, error }`
- [x] T010 [US1] Add question-cloning logic in `src/pages/assessmentWorkforce/WorkforceTab.tsx` — use `JSON.parse(JSON.stringify(...))` to deep-clone `workforceSection.questions`; for question with `key === "topWorkLocations"`, replace `validationRules.fields[0].options` with `stateOptions`; for question with `key === "employeesResideInSameZipCodes"`, replace `conditionalQuestion.question.validationRules.fields[0].options` with `stateOptions` (FR-002, FR-003). Use `useMemo` keyed on `[stateOptions]` to avoid re-cloning on every render.
- [x] T011 [US1] Pass the cloned (modified) questions array to `<DynamicTab>` instead of the original static array — `questions={modifiedQuestions as Question[]}` in `src/pages/assessmentWorkforce/WorkforceTab.tsx` (FR-002, FR-003, FR-009)
- [x] T012 [US1] Run test from T008 — must pass; also run existing assessment tests to confirm no regressions (FR-006, FR-007)

**Checkpoint**: User Story 1 is fully functional — state options come from the live API. Form submission payload is unchanged. All other questions work identically.

---

## Phase 4: User Story 2 — Single Fetch, No Redundant Calls (Priority: P2)

**Goal**: Confirm the states API is called exactly once per WorkforceTab mount, regardless of navigation or re-renders.

**Key insight**: `DynamicTab` uses `useAssessment({ section })` (L65–68) which triggers re-renders on answer changes via `handleAnswerChange` (L82–110). The questions prop passed from WorkforceTab must not cause `useStatesLookup` to re-fetch — this is guaranteed by the empty dependency array in `useEffect([], [])`.

**Independent Test**: Render WorkforceTab, interact with multiple questions, and assert the API was called exactly once.

### Tests for User Story 2

- [x] T013 [US2] Write test in `tests/pages/WorkforceTab.test.tsx` — mock `getStates()`, render WorkforceTab, trigger multiple re-renders (simulate user answering different questions via `fireEvent`), assert `getStates` was called exactly once (FR-005, SC-002)

### Verification for User Story 2

- [x] T014 [US2] Run test from T013 — must pass. No new implementation needed; the single-fetch behavior is inherent in the `useEffect([], [])` empty-dependency design from Phase 2 (T006)

**Checkpoint**: Verified that the architectural constraint (single fetch) holds under realistic interaction patterns.

---

## Phase 5: User Story 3 — Graceful Degradation When API Is Unavailable (Priority: P3)

**Goal**: When the states API fails, returns empty, or returns malformed data, the two affected questions show "state options unavailable" while all other questions remain fully functional.

**Key insight**: `DynamicQuestionRenderer.renderStructuredArrayField()` (L156–210) renders a `<Select>` when `field.type === "select"`, with `items={field.options?.map(...)}`. If `field.options` is an empty array, the Select renders with no items. The error/loading state must be handled via the options and placeholder — e.g., setting `placeholder` to "Loading states..." or "State options unavailable" and options to `[]`.

**Key insight**: `DynamicTab` already shows error boxes for API errors (L708–750 — `apiError?.type === "get"` shows ErrorMessage with retry). The states error is independent and must use a different mechanism (option-level indication, not full-tab error).

**Independent Test**: Mock `getStates()` to reject, render WorkforceTab, confirm state selects show error indication and all other questions work.

### Tests for User Story 3

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T015 [P] [US3] Write test in `tests/pages/WorkforceTab.test.tsx` — mock `getStates()` to reject; render WorkforceTab; assert state selects for `topWorkLocations` and `employeeLivingZipCodes` show "state options unavailable" or equivalent error indication (FR-008)
- [x] T016 [P] [US3] Write test in `tests/pages/WorkforceTab.test.tsx` — mock `getStates()` to reject; render WorkforceTab; assert all other questions render normally and are interactive (FR-008, SC-004)
- [x] T017 [P] [US3] Write test in `tests/pages/WorkforceTab.test.tsx` — mock `getStates()` to return empty array; render WorkforceTab; assert state selects show error indication (FR-008)

### Implementation for User Story 3

- [x] T018 [US3] Add loading-state handling in `src/pages/assessmentWorkforce/WorkforceTab.tsx` — when `isLoading` is true from `useStatesLookup`, set state field options to an empty array with placeholder override "Loading states..." in the cloned question's field, ensuring the `<Select>` (rendered by `renderStructuredArrayField` at DynamicQuestionRenderer L156–210) renders as disabled. The zip code field remains usable because it's a separate `<Input>` field in the same STRUCTURED_ARRAY row. (FR-010)
- [x] T019 [US3] Add error-state handling in `src/pages/assessmentWorkforce/WorkforceTab.tsx` — when `error` is set from `useStatesLookup`, inject placeholder "State options unavailable" and empty options into the affected questions' state fields in the cloned array, while leaving all other questions unchanged (FR-008)
- [x] T020 [US3] Run tests from T015, T016, T017 — all must pass (Green phase)

**Checkpoint**: All three user stories are independently functional. Error, empty, and loading states handled. Other questions unaffected.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all stories + code quality.

- [x] T021 Run `pnpm run type-check` — confirm zero TypeScript errors across all new and modified files
- [x] T022 Run `pnpm lint:fix` and `pnpm format` — ensure all new and modified files pass linting and formatting
- [x] T023 Run full test suite (`pnpm test`) — confirm all existing tests still pass (no regressions) alongside new tests
- [x] T024 Run quickstart.md verification checklist in `specs/001-states-api-integration/quickstart.md` — manually verify all 8 items
- [x] T025 Smoke test: start `pnpm dev`, navigate to WorkforceTab, verify state options load from API, select states, fill zip codes, submit form, confirm payload shape in network tab

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (T001, T002) — `useStatesLookup` imports `getStates` from `assessmentApi`
- **Phase 3 (US1)**: Depends on Phase 2 — uses the hook created in T006
- **Phase 4 (US2)**: Depends on Phase 3 — verification of behavior already built
- **Phase 5 (US3)**: Depends on Phase 3 — adds error/loading handling to WorkforceTab
- **Phase 6 (Polish)**: Depends on all prior phases

### User Story Dependencies

- **US1 (P1)**: Requires Foundational (Phase 2). No dependency on other stories.
- **US2 (P2)**: Verification-only; inherent in Phase 2 design. Depends on US1 being integrated so the test is meaningful.
- **US3 (P3)**: Requires US1 integration (Phase 3) so error paths can be tested in context. Independent of US2.

### Within Each User Story

1. Tests written FIRST and must FAIL (Red phase — TDD per constitution III)
2. Implementation tasks (Green phase)
3. Run tests and confirm pass
4. Checkpoint: story independently testable

### Parallel Opportunities

Within Phase 2:
- T003 and T004 can run in parallel (both write tests in the same file but different test suites)

Within Phase 5:
- T015, T016, and T017 can run in parallel (each writes an independent test case)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003–T007)
3. Complete Phase 3: User Story 1 (T008–T012)
4. **STOP and VALIDATE**: State options load from API, form submission works, no regressions
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Hook ready
2. Add User Story 1 → Live options in form → **Deploy/Demo (MVP!)**
3. Add User Story 2 → Verified single-fetch constraint → Deploy/Demo
4. Add User Story 3 → Error/loading/empty states handled → Deploy/Demo
5. Polish → Type-check, lint, full test suite, smoke test → Final release

---

## Notes

- [P] tasks = different files or independent test cases, no dependencies
- [US*] label maps task to specific user story for traceability
- TDD is mandatory per constitution principle III — write tests first, confirm they fail, then implement
- US2 requires no new implementation — the single-fetch behavior is architectural (empty `useEffect` deps) and only needs verification via test
- `DynamicTab` passes question objects by reference — cloning MUST happen in `WorkforceTab` before passing to `<DynamicTab>`
- `DynamicQuestionRenderer` has NO override props for options — options must be embedded in the question object's `validationRules.fields[].options`
- The conditional STRUCTURED_ARRAY path in `DynamicQuestionRenderer.renderConditionalQuestion()` iterates `conditionalQuestion.validationRules.fields` and delegates to `renderStructuredArrayField` — same flow as the main path
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently

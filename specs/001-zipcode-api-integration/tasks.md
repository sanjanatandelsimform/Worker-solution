# Tasks: Zip Code API Autocomplete Integration

**Input**: Design documents from `/specs/001-zipcode-api-integration/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Included per Constitution Principle III (Test-Driven Development).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Includes exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create TypeScript types and utility hook that all stories depend on

- [x] T001 [P] Define `ZipCodeSuggestion`, `ZipCodeLookupResponse`, and `Pagination` TypeScript interfaces in `src/types/lookupTypes.ts` per data-model.md entity definitions
- [x] T002 [P] Create generic `useDebounce<T>` hook in `src/hooks/useDebounce.ts` using `useState` + `useEffect` + `setTimeout`/`clearTimeout` pattern from research.md §1

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API service function that MUST be complete before any user story component work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Add `lookupZipCodes(query: string)` function to `src/services/api/assessmentApi.ts` — GET `/api/v1/lookup/zip-codes?search={query}&limit=5`, typed with `ZipCodeLookupResponse` from `lookupTypes.ts`, using the existing axios instance in that file. Handle errors by returning empty `zipCodes` array (do not throw).

**Checkpoint**: Types, hook, and API function ready — component work can now begin

---

## Phase 3: User Story 1 — Zip Code Autocomplete on Work Locations (Priority: P1) 🎯 MVP

**Goal**: When a user types 2+ characters in a zip code field in the "top 5 work locations" question (`topWorkLocations`), a dropdown of matching zip codes appears. Clicking a suggestion populates the field.

**Independent Test**: Navigate to Workforce tab → "top 5 work locations" question → type "394" in zip code field → dropdown appears → click "39401" → field populated.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T004 [P] [US1] Create test file `tests/components/common/ZipCodeAutocomplete.test.tsx` with test cases: (a) renders input with placeholder, (b) does NOT call API when fewer than 2 characters typed, (c) calls `lookupZipCodes` after 300ms debounce when 2+ chars typed, (d) displays zip code suggestions in dropdown, (e) populates field and closes dropdown on suggestion click. Mock `lookupZipCodes` via `vi.mock("@/services/api/assessmentApi")`.

### Implementation for User Story 1

- [x] T005 [US1] Create `ZipCodeAutocomplete` component in `src/components/common/ZipCodeAutocomplete.tsx` with props: `value: string`, `onChange: (value: string) => void`, `placeholder?: string`, `isInvalid?: boolean`. Internally: manage input state, use `useDebounce` (300ms), call `lookupZipCodes` when debounced value has 2+ chars, render dropdown list of `ZipCodeSuggestion.zip` values below input. Use `relative` wrapper + `absolute` dropdown positioning with Tailwind semantic classes (`bg-background`, `border-border`, `shadow-sm`). Maintain existing digit-only filtering (`/^\d{0,5}$/`) and maxLength=5.
- [x] T006 [US1] Integrate `ZipCodeAutocomplete` into `src/components/assessment/DynamicQuestionRenderer.tsx` — in `renderStructuredArrayField()`, within the `else` branch (non-select fields), add a condition: when `field.name === "zipCode"`, render `<ZipCodeAutocomplete>` instead of `<Input>`. Pass `value`, `onChange` (calling `updateArrayItemField`), `placeholder`, and `isInvalid` props. All other fields continue rendering `<Input>` unchanged.
- [x] T007 [US1] Verify all US1 tests pass — run `pnpm vitest run tests/components/common/ZipCodeAutocomplete.test.tsx`

**Checkpoint**: User Story 1 fully functional — autocomplete works on `topWorkLocations` zip code fields

---

## Phase 4: User Story 2 — Zip Code Autocomplete on Employee Living Locations (Priority: P1)

**Goal**: The conditional question `employeeLivingZipCodes` (shown when user answers "No" to `employeesResideInSameZipCodes`) uses the same zip code autocomplete behavior, working identically in the conditional STRUCTURED_ARRAY context.

**Independent Test**: Navigate to Workforce tab → answer "No" to residence question → conditional STRUCTURED_ARRAY appears → type "100" in zip code field → dropdown appears → works identically to US1. Add a second row → autocomplete works independently per row.

### Tests for User Story 2

- [x] T008 [P] [US2] Add test cases to `tests/components/common/ZipCodeAutocomplete.test.tsx`: (a) two `ZipCodeAutocomplete` instances on the same page operate independently — typing in one does not affect the other's dropdown, (b) component works correctly when mounted/unmounted dynamically (simulates conditional rendering and add/remove row).

### Implementation for User Story 2

- [x] T009 [US2] Verify that the conditional STRUCTURED_ARRAY in `DynamicQuestionRenderer.tsx` (inside `renderConditionalQuestion` → `STRUCTURED_ARRAY` case) also calls `renderStructuredArrayField` with the `conditionalKey` — confirm the T006 integration already covers this path since `renderStructuredArrayField` is shared. If not, add the same `field.name === "zipCode"` condition in the conditional rendering path.
- [x] T010 [US2] Run all tests — verify both US1 and US2 test cases pass

**Checkpoint**: Both target questions (`topWorkLocations` and `employeeLivingZipCodes`) have working autocomplete

---

## Phase 5: User Story 3 — Loading and Empty States (Priority: P2)

**Goal**: Show a loading indicator while the API call is in progress. Show "No results found" when the API returns zero matches or fails.

**Independent Test**: Type a zip prefix with no matches (e.g., "00") → see loading indicator briefly → then "No results found" message.

### Tests for User Story 3

- [x] T011 [P] [US3] Add test cases to `tests/components/common/ZipCodeAutocomplete.test.tsx`: (a) shows loading indicator while API call is pending (use unresolved promise mock), (b) shows "No results found" when API returns empty `zipCodes` array, (c) shows "No results found" when API call rejects with error.

### Implementation for User Story 3

- [x] T012 [US3] Add `isLoading` state to `ZipCodeAutocomplete` component in `src/components/common/ZipCodeAutocomplete.tsx` — set `true` before API call, `false` after. When `isLoading` is true, render a loading indicator (e.g., "Loading..." text or spinner) in the dropdown area. When results are empty and not loading, render "No results found" text in the dropdown.
- [x] T013 [US3] Run all tests — verify US1, US2, and US3 test cases pass

**Checkpoint**: Loading and empty states visible — user gets feedback during all API states

---

## Phase 6: User Story 4 — Dropdown Dismissal (Priority: P2)

**Goal**: Dropdown closes when user clicks outside the component or presses Escape.

**Independent Test**: Open dropdown by typing 2+ chars → click outside → dropdown closes. Open again → press Escape → dropdown closes.

### Tests for User Story 4

- [x] T014 [P] [US4] Add test cases to `tests/components/common/ZipCodeAutocomplete.test.tsx`: (a) dropdown closes when clicking outside the component container, (b) dropdown closes when Escape key is pressed.

### Implementation for User Story 4

- [x] T015 [US4] Add click-outside and Escape dismissal to `ZipCodeAutocomplete` component in `src/components/common/ZipCodeAutocomplete.tsx` — use `useRef` for the wrapper container, add `useEffect` with `mousedown` event listener on `document` (matching `MultiSelect.tsx` pattern), add `onKeyDown` handler for Escape key. Close dropdown (clear suggestions, set `isOpen` to false) on either event.
- [x] T016 [US4] Run all tests — verify US1, US2, US3, and US4 test cases pass

**Checkpoint**: All user stories functional — full autocomplete with loading states and proper dismissal

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality gate validation and regression check

- [x] T017 [P] Run type-check: `pnpm run type-check` — must pass with zero errors
- [x] T018 [P] Run linting and formatting: `pnpm lint:fix && pnpm format`
- [x] T019 Run full test suite: `pnpm test` — verify zero regressions in existing tests
- [x] T020 Run quickstart.md validation — follow the manual verification steps in `specs/001-zipcode-api-integration/quickstart.md` section "Verify the Feature" against a running dev server (`pnpm dev`)

---

## ⚙️ Revision: Bug Fix — Post-Selection Dropdown Reopening (2026-03-11)

> **Context**: After completing T001–T020, a bug was discovered where the dropdown reopens after a suggestion is selected. The debounced input effect fires for the selected value, resetting `abortRef` and calling `setIsOpen(true)`. See spec.md (FR-005 strengthened, FR-016 added) and research.md §9 for root cause analysis and chosen fix strategy.

### Phase 8: Bug Fix Verification Setup

**Purpose**: Confirm existing feature code is intact and all prior tasks remain functional before applying the bug fix

- [x] T021 Verify dependencies installed and dev server starts with `pnpm install && pnpm dev`
- [x] T022 Run existing test suite to confirm baseline — `pnpm vitest run tests/components/common/ZipCodeAutocomplete.test.tsx` (all 13 existing tests must pass)
- [x] T023 Run type check to confirm no pre-existing errors — `pnpm run type-check`

**⚠️ NOTE**: All 3 checks MUST pass before proceeding. If any existing test fails, triage before writing new code.

**Checkpoint**: Existing 13 tests pass, type-check clean, dev server operational.

---

### Phase 9: User Story 4 — Dropdown Dismissal Bug Fix (Priority: P2 → Elevated) 🎯 Bug Fix MVP

**Goal**: When a user selects a zip code suggestion, the dropdown closes immediately and does NOT reopen when the debounced input resolves to the selected value. Implements FR-005 (strengthened) and FR-016 (new). See research.md §9 for root cause analysis and chosen strategy.

**Independent Test**: Select a suggestion → wait for debounce window to elapse → confirm dropdown remains closed and no additional API call fires.

#### Test for Bug Fix (TDD — write FIRST, confirm FAIL)

- [x] T024 [US4] Write regression test: "dropdown does not reopen after suggestion selection when debounce resolves" in `tests/components/common/ZipCodeAutocomplete.test.tsx` — in the US4 describe block, add a test that: (1) renders `ZipCodeAutocomplete` with `vi.useFakeTimers`, (2) types "394" and advances timers to trigger lookup, (3) mock `lookupZipCodes` resolves with `[{zip:"39401",...}]`, (4) selects "39401" via `fireEvent.mouseDown`, (5) clears mock call count, (6) advances timers by 350ms (past debounce window), (7) asserts dropdown (`role="option"`) is NOT in the document, (8) asserts `lookupZipCodes` was NOT called again after selection

**Checkpoint**: T024 test MUST FAIL (red) before proceeding to T025. This confirms the bug exists in the current code.

#### Implementation for Bug Fix

- [x] T025 [US4] Add `lastSelectedValueRef` guard and relocate `setIsOpen(true)` in `src/components/common/ZipCodeAutocomplete.tsx` — per research.md §9 apply these 6 changes: (1) add `const lastSelectedValueRef = useRef<string | null>(null)` alongside existing refs, (2) in `handleSelect` callback add `lastSelectedValueRef.current = zip` before `setInputValue(zip)`, (3) in `handleInputChange` callback add `lastSelectedValueRef.current = null` after the regex guard, (4) in the `useEffect` with `[debouncedInput]` dependency add early return `if (debouncedInput === lastSelectedValueRef.current) return` after the `< MIN_QUERY_LENGTH` check, (5) remove `setIsOpen(true)` from inside the `fetchSuggestions` async function in that same effect, (6) in `handleInputChange` add `if (raw.length >= MIN_QUERY_LENGTH) setIsOpen(true)` after `onChange(raw)` to drive dropdown visibility from user typing only

**Checkpoint**: T024 test MUST now PASS (green). All 14 tests (13 existing + 1 new) must pass — run `pnpm vitest run tests/components/common/ZipCodeAutocomplete.test.tsx`.

---

### Phase 10: Regression Verification (US1 & US2)

**Goal**: Confirm the bug fix does not regress acceptance scenarios for US1 (topWorkLocations) or US2 (employeeLivingZipCodes). The strengthened acceptance scenario 2 for both stories ("dropdown closes immediately — it MUST NOT reopen until the user manually types new characters") is now covered by T024.

- [x] T026 [P] [US1] Verify existing US1 tests pass unmodified — run test cases: "renders input with placeholder", "does NOT call lookup for <2 chars", "calls lookup after debounce", "displays suggestions", "populates field & closes dropdown on click", "filters non-numeric input" in `tests/components/common/ZipCodeAutocomplete.test.tsx`
- [x] T027 [P] [US2] Verify existing US2 tests pass unmodified — run test cases: "two instances operate independently", "works when mounted/unmounted dynamically" in `tests/components/common/ZipCodeAutocomplete.test.tsx`

**Checkpoint**: All existing US1/US2 tests pass unmodified. No regressions from the `lastSelectedValueRef` guard or `setIsOpen` relocation.

---

### Phase 11: Bug Fix Polish & Quality Gates

**Purpose**: Full quality gate validation and manual smoke test

- [x] T028 Run full project test suite — `pnpm vitest run` (all tests across the project must pass, zero regressions)
- [x] T029 Run type check — `pnpm run type-check` (zero errors)
- [x] T030 Run lint and format — `pnpm lint:fix && pnpm format`
- [ ] T031 Run quickstart.md manual validation — follow steps in `specs/001-zipcode-api-integration/quickstart.md` including step 6 (wait 1–2 seconds after selection, dropdown must NOT reopen per FR-016) and step 7 (type new character, dropdown reappears normally)

---

## Dependencies & Execution Order

### Original Implementation (T001–T020) — COMPLETED ✅

- **Setup (Phase 1)**: T001 ‖ T002 (parallel — different files)
- **Foundational (Phase 2)**: T003 (depends on T001)
- **User Story 1 (Phase 3)**: T004 ‖ T005, then T006, then T007
- **User Story 2 (Phase 4)**: T008 ‖ T009, then T010
- **User Story 3 (Phase 5)**: T011 ‖ T012, then T013
- **User Story 4 (Phase 6)**: T014 ‖ T015, then T016
- **Polish (Phase 7)**: T017 ‖ T018, then T019, T020

### Bug Fix Revision (T021–T031)

#### Phase Dependencies

- **Verification Setup (Phase 8)**: No dependencies — start immediately
- **Bug Fix (Phase 9)**: Depends on Phase 8 passing. T024 MUST precede T025 (TDD — Constitution Principle III)
- **Regression Verification (Phase 10)**: Depends on Phase 9 completion. T026 and T027 can run in parallel
- **Polish (Phase 11)**: Depends on all prior phases. T028–T030 are sequential quality gates. T031 is manual smoke test

#### User Story Dependencies

- **US4 (Phase 9)**: Primary target — contains the bug fix. No dependency on other stories.
- **US1/US2 (Phase 10)**: Verification only — confirm no regressions. Depends on Phase 9 completion.
- **US3 (Loading/Empty)**: NOT affected — loading and empty state logic is unchanged. No tasks needed.

#### Critical Path

```
T021 → T022 → T023 → T024 (must FAIL) → T025 → T024 re-run (must PASS) → T026 ‖ T027 → T028 → T029 → T030 → T031
```

#### Parallel Opportunities

```
Phase 8:  T021 → T022 → T023             (sequential baseline verification)
Phase 9:  T024 → T025                     (sequential TDD: red → green)
Phase 10: T026 ‖ T027                     (parallel — independent test suites)
Phase 11: T028 → T029 → T030 → T031      (sequential quality gates)
```

---

## Implementation Strategy

### Original Feature — COMPLETED ✅

1. Phase 1 → Setup (types + hook)
2. Phase 2 → Foundational (API function)
3. Phase 3 → User Story 1 (component + integration) — MVP
4. Phase 4 → User Story 2 (conditional question coverage)
5. Phase 5 → User Story 3 (loading/empty states)
6. Phase 6 → User Story 4 (click-outside + Escape dismissal)
7. Phase 7 → Polish (quality gates)

### Bug Fix — MVP First (Phase 9 Only)

1. Complete Phase 8: Verify baseline (T021–T023)
2. Complete Phase 9: Write regression test (T024), confirm FAIL, implement fix (T025), confirm PASS
3. **STOP and VALIDATE**: All 14 tests pass, dropdown stays closed after selection
4. This delivers the bug fix with TDD validation

### Bug Fix — Full Delivery

1. Phase 8 → Baseline verified
2. Phase 9 → Bug fix implemented with TDD (T024–T025)
3. Phase 10 → Regression verification for US1/US2 (T026–T027)
4. Phase 11 → Quality gates + manual smoke test (T028–T031)

---

## Files Modified

### Original Implementation (T001–T020)

| File | Change | Tasks |
|------|--------|-------|
| `src/types/lookupTypes.ts` | Created — TypeScript interfaces | T001 |
| `src/hooks/useDebounce.ts` | Created — generic debounce hook | T002 |
| `src/services/api/assessmentApi.ts` | Added `lookupZipCodes()` function | T003 |
| `src/components/common/ZipCodeAutocomplete.tsx` | Created — full autocomplete component | T005, T012, T015 |
| `src/components/assessment/DynamicQuestionRenderer.tsx` | Added `zipCode` field condition | T006 |
| `tests/components/common/ZipCodeAutocomplete.test.tsx` | Created — 13 tests across 4 user stories | T004, T008, T011, T014 |

### Bug Fix Revision (T024–T025)

| File | Change | Tasks |
|------|--------|-------|
| `src/components/common/ZipCodeAutocomplete.tsx` | Add `lastSelectedValueRef` guard (~4 lines), relocate `setIsOpen(true)` from effect to handler (~3 lines) | T025 |
| `tests/components/common/ZipCodeAutocomplete.test.tsx` | Add 1 regression test (~15 lines) | T024 |

**Files NOT modified by bug fix**: `src/hooks/useDebounce.ts`, `src/services/api/assessmentApi.ts`, `src/types/lookupTypes.ts`, `src/components/assessment/DynamicQuestionRenderer.tsx`, `src/data/assessment/questionData.json`

---

## Notes

- [P] tasks = different files, no dependencies on each other
- [Story] label maps task to specific user story for traceability
- All 4 user stories are independently testable after their phase completes
- Constitution Principle III (TDD): Tests written before implementation in each story
- Zero new npm dependencies required — all implemented with built-in React patterns
- Only 2 existing files modified: `assessmentApi.ts` (add function) and `DynamicQuestionRenderer.tsx` (conditional render)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Bug fix TDD is non-negotiable — T024 MUST fail before T025 is implemented
- The bug fix is ~7 lines of code in one file (research.md §9) plus ~15 lines of test code
- `abortRef` remains in the code for backward compatibility with in-flight request cancellation — it is not removed
- Commit after T025 (bug fix complete) and again after T030 (quality gates passed)
- The `lastSelectedValueRef` pattern was chosen over 4 alternatives — see research.md §9 for decision rationale

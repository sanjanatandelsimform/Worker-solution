# Tasks: Assessment Data Persistence via API

**Branch**: `004-assessment-api-persistence`  
**Input**: Design documents from `/specs/004-assessment-api-persistence/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/assessment-api.md](./contracts/assessment-api.md), [quickstart.md](./quickstart.md)

**Tests**: Following TDD per constitution Principle III - Tests written FIRST before implementation

**Organization**: Tasks grouped by user story for independent implementation and testing

---

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **Checkbox**: `- [ ]` - Track completion status
- **[ID]**: Task identifier (T001, T002, etc.) in execution order
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3, US4) - Phase-specific only
- **Description**: Clear action with exact file path

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize feature branch and verify environment

- [X] T001 Verify feature branch `004-assessment-api-persistence` is checked out and up to date with main
- [X] T002 Run type check with `pnpm run type-check` to establish baseline (no new errors)
- [X] T003 [P] Review existing assessment flow in src/components/assessment/ and src/pages/assessmentWorkforce/
- [X] T004 [P] Review existing API service patterns in src/services/api/assessmentApi.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core API function and type definitions that ALL user stories depend on

**⚠️ CRITICAL**: No user story implementation can begin until this phase completes

- [X] T005 Add AssessmentData TypeScript interface to src/services/api/assessmentApi.ts per data-model.md
- [X] T006 Implement getAssessment() API function in src/services/api/assessmentApi.ts returning Promise<ApiResponse<AssessmentData>>
- [X] T007 [P] Add SectionType union type ('workforce' | 'compensation' | 'benefits' | 'goals') to src/types/questionTypes.ts
- [X] T008 [P] Add APILoadingState interface to src/hooks/useAssessment.ts for isLoadingGet and apiError states

**Checkpoint**: Foundation ready - user story tasks can now proceed in parallel

---

## Phase 3: User Story 1 - Navigate Assessment Tabs With Data Persistence (Priority: P1) 🎯 MVP

**Goal**: Users can navigate between assessment tabs with data restored from server via GET /assessment, eliminating localStorage dependency

**Independent Test**: Complete WorkforceTab → navigate to CompensationTab → click Back → verify workforce data restored from API (not localStorage)

**Success Criteria**: SC-001 (back navigation), SC-002 (100% persistence), SC-007 (no localStorage), SC-010 (all tabs functional)

### Tests for User Story 1 (TDD - Write FIRST)

> **CRITICAL**: Write tests before implementation, ensure they FAIL initially

- [X] T009 [P] [US1] Create tests/hooks/useAssessment.test.ts with test: "should call GET /assessment via loadProgress()"
- [X] T010 [P] [US1] Add test to useAssessment.test.ts: "should populate answers from API response sections[section]"
- [X] T011 [P] [US1] Add test to useAssessment.test.ts: "should set isLoadingGet=true during GET call"
- [X] T012 [P] [US1] Add test to useAssessment.test.ts: "should NOT call localStorage functions (saveAssessmentProgress, loadSectionProgress)"
- [X] T013 [US1] Create tests/integration/assessment-navigation.test.ts with test: "should restore previous tab data from GET /assessment on back navigation"

### Implementation for User Story 1

- [X] T014 [US1] Remove localStorage imports from src/hooks/useAssessment.ts (saveAssessmentProgress, loadSectionProgress, autoSaveProgress)
- [X] T015 [US1] Add isLoadingGet useState(false) to src/hooks/useAssessment.ts
- [X] T016 [US1] Add apiError useState<{type: 'get'|'post', message: string} | null>(null) to src/hooks/useAssessment.ts
- [X] T017 [US1] Refactor loadProgress() function in src/hooks/useAssessment.ts to call getAssessment() API instead of loadSectionProgress()
- [X] T018 [US1] Update loadProgress() to setAnswers(response.data.sections[section]) when API succeeds
- [X] T019 [US1] Add error handling in loadProgress() to setApiError({type: 'get', message}) on failure
- [X] T020 [US1] Remove autoSaveProgress() calls from updateAnswer() and updateAnswers() functions in src/hooks/useAssessment.ts
- [X] T021 [US1] Add retryGetAssessment function to src/hooks/useAssessment.ts (calls loadProgress, clears apiError)
- [X] T022 [US1] Update useAssessment return type to include { isLoadingGet, apiError, retryGetAssessment }
- [X] T023 [US1] Add useEffect in src/pages/assessmentWorkforce/AssessmentWorkforce.tsx to call loadProgress() on component mount
- [X] T023.1 [US1] Verify GET /assessment is called immediately on tab mount/activation (not delayed)
- [X] T023.2 [US1] Ensure form fields pre-fill with API response data when available
- [X] T023.3 [US1] Verify empty form fields display when no API data exists for section
- [X] T023.4 [US1] Ensure tabs ALWAYS display data based solely on GET /assessment response on mount/activation
- [X] T024 [P] [US1] Add loading state UI to src/components/assessment/WorkforceTab.tsx: disable Back button when isLoadingGet=true
- [X] T025 [P] [US1] Add loading state UI to src/components/assessment/CompensationTab.tsx: disable Back button when isLoadingGet=true
- [X] T026 [P] [US1] Add loading state UI to src/components/assessment/BenefitsTab.tsx: disable Back button when isLoadingGet=true
- [X] T027 [P] [US1] Add loading state UI to src/components/assessment/GoalsTab.tsx: disable Back button when isLoadingGet=true
- [X] T028 [P] [US1] Add spinner display to Back buttons in all 4 tab components when isLoadingGet=true
- [X] T029 [P] [US1] Add GET error message display with Retry button to src/components/assessment/WorkforceTab.tsx
- [X] T030 [P] [US1] Add GET error message display with Retry button to src/components/assessment/CompensationTab.tsx
- [X] T031 [P] [US1] Add GET error message display with Retry button to src/components/assessment/BenefitsTab.tsx
- [X] T032 [P] [US1] Add GET error message display with Retry button to src/components/assessment/GoalsTab.tsx

**Checkpoint**: User Story 1 complete - Assessment data now persists via API only, no localStorage usage

---

## Phase 4: User Story 2 - Validation Feedback on Required Fields (Priority: P2)

**Goal**: Users see clear visual indicators (red borders, red error messages) when required fields fail validation on Next button click

**Independent Test**: Leave required fields empty on any tab → click Next → verify red borders appear on invalid fields with red error messages inline

**Success Criteria**: SC-005 (red borders for 6 field types), SC-006 (<100ms validation feedback), SC-009 (no regressions)

### Tests for User Story 2 (TDD - Write FIRST)

- [X] T033 [P] [US2] Create tests/components/assessment/WorkforceTab.test.tsx with test: "should display red borders on required empty fields when Next clicked"
- [X] T034 [P] [US2] Add test to WorkforceTab.test.tsx: "should show error messages in red text when validation fails"
- [X] T035 [P] [US2] Add test to WorkforceTab.test.tsx: "should clear errors when user corrects invalid field"
- [X] T036 [P] [US2] Add test to WorkforceTab.test.tsx: "should NOT display errors on field blur (only on Next click)"

### Implementation for User Story 2

- [X] T037 [US2] Add validateAllFields() function to src/hooks/useAssessment.ts that checks required fields and returns Record<string, string> errors
- [X] T038 [US2] Update handleNext logic in src/hooks/useAssessment.ts to call validateAllFields() before submitSection()
- [X] T039 [US2] Add validation trigger ONLY on Next click (NOT on blur) - ensure no onBlur handlers in validation flow
- [X] T040 [P] [US2] Update src/components/assessment/DynamicQuestionRenderer.tsx to accept errors prop
- [X] T041 [P] [US2] Add red border styling (border-red-500) to TEXT_INPUT fields in DynamicQuestionRenderer when errors[question.key] exists
- [X] T042 [P] [US2] Add red border styling to SINGLE_SELECT_DROPDOWN fields in DynamicQuestionRenderer when errors exist
- [X] T043 [P] [US2] Add red border styling to NUMERIC fields in DynamicQuestionRenderer when errors exist
- [X] T044 [P] [US2] Add red border styling to NUMBER_INPUT fields in DynamicQuestionRenderer when errors exist
- [X] T045 [P] [US2] Add red border styling to PARTICIPATION_RATES fields in DynamicQuestionRenderer when errors exist
- [X] T046 [P] [US2] Add red border styling to STRUCTURED_ARRAY add button wrapper in DynamicQuestionRenderer when errors exist
- [X] T047 [US2] Add red error message display (<span className="text-red-500">) below each field type in DynamicQuestionRenderer
- [X] T048 [P] [US2] Update src/components/assessment/WorkforceTab.tsx to pass errors prop to DynamicQuestionRenderer
- [X] T049 [P] [US2] Update src/components/assessment/CompensationTab.tsx to pass errors prop to DynamicQuestionRenderer
- [X] T050 [P] [US2] Update src/components/assessment/BenefitsTab.tsx to pass errors prop to DynamicQuestionRenderer
- [X] T051 [P] [US2] Update src/components/assessment/GoalsTab.tsx to pass errors prop to DynamicQuestionRenderer
- [X] T052 [US2] Add logic to prevent navigation (keep user on tab) when validation errors exist in useAssessment.ts

**Checkpoint**: User Story 2 complete - Validation feedback displays correctly on Next click only

---

## Phase 5: User Story 3 - Form Input Reliability on First Interaction (Priority: P2)

**Goal**: Fix bugs where STRUCTURED_ARRAY first item doesn't initialize and SINGLE_SELECT_DROPDOWN first selection doesn't display

**Independent Test**: Add first item to empty STRUCTURED_ARRAY → verify it persists. Select first dropdown option → verify it displays immediately.

**Success Criteria**: SC-003 (STRUCTURED_ARRAY fix), SC-004 (SINGLE_SELECT fix), SC-009 (no regressions)

### Tests for User Story 3 (TDD - Write FIRST)

- [X] T053 [P] [US3] Create tests/components/assessment/DynamicQuestionRenderer.test.tsx with test: "should persist first STRUCTURED_ARRAY item on add"
- [X] T054 [P] [US3] Add test to DynamicQuestionRenderer.test.tsx: "should display SINGLE_SELECT_DROPDOWN value immediately after first selection"
- [X] T055 [P] [US3] Add test to DynamicQuestionRenderer.test.tsx: "should initialize STRUCTURED_ARRAY with empty array when undefined"

### Implementation for User Story 3

- [X] T056 [US3] Fix addArrayItem() in src/components/assessment/DynamicQuestionRenderer.tsx to explicitly initialize array with [{ id: generateId() }] when answers[key] is undefined/null/empty
- [X] T057 [US3] Remove getArrayItems() call from addArrayItem() logic - use answers[key] directly to avoid stale default values
- [X] T058 [US3] Add explicit check: if (!currentItems || !Array.isArray(currentItems) || currentItems.length === 0) before spreading in addArrayItem()
- [X] T059 [US3] Fix Select component onValueChange in src/components/assessment/DynamicQuestionRenderer.tsx to call onAnswerChange(question.key, value) synchronously
- [X] T060 [US3] Verify Select value prop is correctly bound to currentAnswer (answers[question.key]) for immediate re-render
- [X] T061 [US3] Remove any intermediate handlers between Select onValueChange and onAnswerChange to prevent stale closures

**Checkpoint**: User Story 3 complete - STRUCTURED_ARRAY and SINGLE_SELECT bugs fixed

---

## Phase 6: User Story 4 - Assessment Completion Flow (Priority: P3)

**Goal**: Display appropriate modal after GoalsTab final submission - success modal ("You're done!") or empty submission warning ("Uh-oh")

**Independent Test**: Complete GoalsTab with valid data → verify success modal appears with "Go to Dashboard" button. Submit empty assessment → verify warning modal appears.

**Success Criteria**: SC-008 (completion modals), SC-010 (all tabs functional)

### Tests for User Story 4 (TDD - Write FIRST)

- [X] T062 [P] [US4] Create tests/components/assessment/GoalsTab.test.tsx with test: "should display success modal after POST /assessment/goals succeeds"
- [X] T063 [P] [US4] Add test to GoalsTab.test.tsx: "should display empty submission warning modal when API returns empty submission error"
- [X] T064 [P] [US4] Add test to GoalsTab.test.tsx: "should navigate to dashboard when 'Go to Dashboard' button clicked in success modal"

### Implementation for User Story 4

- [X] T065 [US4] Add completion modal state to src/components/assessment/GoalsTab.tsx (showSuccessModal, showEmptyWarning)
- [X] T066 [US4] Update submitSection() callback in GoalsTab to check response.data and set showSuccessModal=true on success
- [X] T067 [US4] Add error handling in GoalsTab to detect empty submission error from API and set showEmptyWarning=true
- [X] T068 [P] [US4] Add BaseModalWithIcon component for success in src/components/assessment/GoalsTab.tsx with title="You're done!"
- [X] T069 [P] [US4] Add subtitle to success modal: "See your results and recommendations on your dashboard"
- [X] T070 [P] [US4] Add "Go to Dashboard" button to success modal that navigates to /dashboard
- [X] T071 [P] [US4] Add BaseModalWithIcon component for empty warning in src/components/assessment/GoalsTab.tsx with title="Uh-oh"
- [X] T072 [P] [US4] Add subtitle to empty warning modal: "You have not filled anything out. Your recommendations will not be as accurate. Are you sure you want to proceed?"
- [X] T073 [P] [US4] Add Cancel button to empty warning modal that closes modal and keeps user on GoalsTab
- [X] T074 [P] [US4] Add Continue button to empty warning modal that proceeds despite empty submission

**Checkpoint**: User Story 4 complete - Completion flow modals functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple components

- [X] T075 [P] Update POST loading states: disable Next button when isSubmitting=true across all 4 tab components
- [X] T076 [P] Add spinner to Next buttons when isSubmitting=true across all 4 tab components
- [X] T077 [P] Add POST error message display (inline, no modal) when submitSection() fails in all 4 tab components
- [X] T077.1 [P] Verify Next button is ENABLED and interactive while user fills form (not disabled during data entry)
- [X] T077.2 [P] Verify Next button is ONLY disabled during actual POST operation (after user clicks Next)
- [X] T077.3 [P] Verify form fields remain interactive during GET /assessment loading (not blocked by loading state)
- [X] T077.4 [P] Verify Back button is disabled ONLY during GET /assessment, not during form filling or POST
- [X] T078 Verify localStorage.getItem('assessment*') is never called in browser DevTools Network/Console during full assessment flow
- [X] T079 Run complete assessment flow test: WorkforceTab → CompensationTab → BenefitsTab → GoalsTab → Back to BenefitsTab → verify data from API
- [X] T079.1 Test data restoration on back navigation: Complete tab → move forward → click Back → verify GET /assessment called and data restored
- [X] T079.2 Test data restoration on page refresh: Navigate to middle tab → refresh page → verify GET /assessment called and correct section data displayed
- [X] T079.3 Test data restoration on direct URL: Navigate directly to /assessment/benefits → verify GET /assessment called and benefits data pre-filled
- [X] T079.4 Test data persistence on tab switching: Fill Workforce → save → switch to Compensation → switch back to Workforce → verify data persists via API
- [X] T079.5 Verify tabs always show server data from GET /assessment on mount/activation (no client merging)
- [X] T080 Run quickstart.md validation: verify all 7 steps completed and Definition of Done criteria met
- [X] T081 [P] Run `pnpm run type-check` and fix any new TypeScript errors introduced
- [X] T082 [P] Run `pnpm lint:fix` to ensure code style compliance
- [X] T083 Verify no UI regressions: all existing assessment features work without visual changes (FR-020, FR-021)
- [X] T084 Update IMPLEMENTATION_SUMMARY.md with changes made to 8 files in scope

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Setup (Phase 1)**: No dependencies - start immediately
2. **Foundational (Phase 2)**: Depends on Setup → **BLOCKS all user stories**
3. **User Stories (Phase 3-6)**: All depend on Foundational phase completion
   - After Phase 2 completes, user stories can proceed in parallel (if staffed)
   - Or sequentially by priority: US1 (P1) → US2 (P2) → US3 (P2) → US4 (P3)
4. **Polish (Phase 7)**: Depends on all user stories (US1-US4) being complete

### User Story Dependencies

- **US1 (P1) - Data Persistence**: Can start after Phase 2 - **NO dependencies on other stories** ✅ MVP
- **US2 (P2) - Validation**: Can start after Phase 2 - Integrates with US1 but independently testable
- **US3 (P2) - Bug Fixes**: Can start after Phase 2 - Integrates with US1/US2 but independently testable
- **US4 (P3) - Completion Flow**: Can start after Phase 2 - Depends on US1 POST flow, but independently testable

### Within Each User Story

1. **Tests FIRST** (TDD) - All test tasks must be written and FAIL before implementation
2. **Models/Types** - Data structures defined
3. **Core logic** - Business logic implementation
4. **UI updates** - Visual feedback and user interactions
5. **Integration** - Wire components together
6. **Story complete** - All acceptance scenarios pass

### Parallel Opportunities Per User Story

**User Story 1 Parallel Tasks**:
- After T009-T013 (tests) complete, T014-T023 (core implementation) can proceed
- T024-T032 (4 tab components UI updates) - ALL can run in parallel (different files)

**User Story 2 Parallel Tasks**:
- T033-T036 (tests) - ALL can run in parallel (same file, independent tests)
- T041-T046 (red border styling for 6 field types) - ALL can run in parallel (same file, different code blocks)
- T048-T051 (pass errors prop to 4 tabs) - ALL can run in parallel (different files)

**User Story 3 Parallel Tasks**:
- T053-T055 (tests) - ALL can run in parallel
- T056-T061 are sequential (same function edits)

**User Story 4 Parallel Tasks**:
- T062-T064 (tests) - ALL can run in parallel
- T068-T074 (modal components) can be split: success modal (T068-T070) and warning modal (T071-T074) in parallel

---

## Implementation Strategy

### MVP Delivery (Phase 1 + Phase 2 + Phase 3 only)

**Minimum Viable Product** = User Story 1 (Data Persistence)

**Rationale**: 
- US1 delivers core requirement (FR-001 to FR-010): Replace localStorage with API
- Provides immediate value: Users don't lose data on back navigation
- Independently testable without other stories
- **Can ship to production after Phase 3 completes**

**Timeline**: ~2-3 days (1 developer)
- Setup: 30 min
- Foundational: 1-2 hours
- US1 Tests: 2-3 hours
- US1 Implementation: 1-2 days
- Testing & validation: 2-4 hours

### Incremental Delivery

**Iteration 1**: Phase 1 + Phase 2 + Phase 3 (US1) → **Ship MVP** ✅  
**Iteration 2**: Phase 4 (US2) → Ship validation feedback  
**Iteration 3**: Phase 5 (US3) → Ship bug fixes  
**Iteration 4**: Phase 6 (US4) → Ship completion flow  
**Iteration 5**: Phase 7 (Polish) → Final release  

### Task Count Summary

- **Total Tasks**: 94 (84 original + 10 new verification tasks)
- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (Foundational)**: 4 tasks (BLOCKING)
- **Phase 3 (US1 - MVP)**: 27 tasks (5 tests + 22 implementation)
- **Phase 4 (US2)**: 20 tasks (4 tests + 16 implementation)
- **Phase 5 (US3)**: 9 tasks (3 tests + 6 implementation)
- **Phase 6 (US4)**: 13 tasks (3 tests + 10 implementation)
- **Phase 7 (Polish)**: 17 tasks (including UX verification)

### Parallel Execution Example

**After Phase 2 completes**, if you have 3 developers:

```bash
# Developer 1: User Story 1 (P1) - Data Persistence
T009-T013 tests → T014-T023 core → T024-T032 UI (8 parallel tasks)

# Developer 2: User Story 2 (P2) - Validation  
T033-T036 tests (4 parallel) → T037-T039 core → T041-T046 styling (6 parallel) → T048-T051 tabs (4 parallel)

# Developer 3: User Story 3 (P2) - Bug Fixes
T053-T055 tests (3 parallel) → T056-T061 fixes → US4 tests T062-T064 (3 parallel)
```

All three stories complete independently and can be tested/shipped separately.

---

## Validation Checklist (from quickstart.md Definition of Done)

- [X] All 94 tasks completed (84 original + 10 verification tasks)
- [X] GET /assessment called on back navigation (US1)
- [X] GET /assessment called immediately on tab mount/activation
- [X] Form fields pre-fill with API data when available
- [X] No localStorage/sessionStorage used for data restoration (US1)
- [X] Next button remains ENABLED during form filling (only disabled during POST)
- [X] Form remains interactive during GET /assessment loading
- [X] Back button disabled ONLY during GET, not during form filling
- [X] Validation red borders show on Next click only, not blur (US2)
- [X] STRUCTURED_ARRAY first item persists (US3)
- [X] SINGLE_SELECT first selection displays (US3)
- [X] Completion modals appear after GoalsTab submission (US4)
- [X] Data restoration works on: back navigation, page refresh, direct URL access, tab switching
- [X] All tests pass (TDD approach followed)
- [X] Type check passes: `pnpm run type-check`
- [X] Linting passes: `pnpm lint:fix`
- [X] No UI/UX regressions in existing features
- [X] All 4 assessment tabs functional end-to-end

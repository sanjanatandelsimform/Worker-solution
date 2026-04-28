# Tasks: Consolidate Finch Connection Status

**Input**: Design documents from `/specs/001-remove-finch-polling/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are required for this feature (FR-007 explicitly requires updated automated coverage).

**Organization**: Tasks are grouped by user story so each story is independently implementable and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on unfinished tasks)
- **[Story]**: User story label ([US1], [US2], [US3])
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare feature task baseline and verification entry points

- [x] T001 Create feature task baseline and verification checklist in specs/001-remove-finch-polling/tasks.md
- [x] T002 Capture current `useFinchStatus` usage map in specs/001-remove-finch-polling/research.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared migration prerequisites before story work

**CRITICAL**: No user story implementation starts until this phase is complete

- [x] T003 Confirm assessment response contract fields for connection derivation in specs/001-remove-finch-polling/contracts/assessment-status-finch-connection.yaml
- [x] T004 Define derived connection/loading behavior rules in specs/001-remove-finch-polling/data-model.md
- [x] T005 Identify and lock all impacted source/test files in specs/001-remove-finch-polling/quickstart.md

**Checkpoint**: Foundational requirements complete; user stories can proceed.

---

## Phase 3: User Story 1 - Accurate Finch Connection State (Priority: P1) 🎯 MVP

**Goal**: Derive Finch-connected behavior from assessment status and preserve current user-facing flows.

**Independent Test**: With mocked assessment responses, pages/hooks should behave correctly for both `assessmentType = finch` and non-finch without using `useFinchStatus`.

### Tests for User Story 1

- [x] T006 [P] [US1] Add connected/disconnected assessment-derived state assertions in tests/pages/DashboardPage.test.tsx
- [x] T007 [P] [US1] Add assessment-loading guard coverage for redirect behavior in tests/pages/AdditionalQuestions.test.tsx
- [x] T008 [P] [US1] Add connected/disconnected rendering coverage for company overview section in tests/pages/RecommendationsFinchPage.test.tsx

### Implementation for User Story 1

- [x] T009 [US1] Replace `useFinchStatus` dependency with assessment-derived `isConnected` in src/hooks/useIndustry.ts
- [x] T010 [US1] Replace `useFinchStatus` dependency with assessment-derived `isConnected` in src/pages/dashboard/DashboardPage.tsx
- [x] T011 [US1] Replace `useFinchStatus` dependency with assessment-derived connection and loading guard in src/pages/additionalQuestions/AdditionalQuestions.tsx
- [x] T012 [US1] Replace `useFinchStatus` dependency with assessment-derived `isConnected` in src/pages/recommendations/CompanyAtAGlance.tsx

**Checkpoint**: US1 should be functionally correct and testable independent of polling removal cleanup.

---

## Phase 4: User Story 2 - Reduced Redundant Network Activity (Priority: P2)

**Goal**: Remove dedicated Finch status polling pathway and keep only assessment-driven connection state.

**Independent Test**: Codebase contains no runtime imports/usages of `@/hooks/useFinchStatus`, and app behavior remains stable in affected screens.

### Tests for User Story 2

- [x] T013 [P] [US2] Update dashboard error-flow tests to remove `useFinchStatus` mocks in tests/pages/DashboardErrorHandling.test.tsx
- [x] T014 [P] [US2] Update benchmark page tests to remove `useFinchStatus` mocks in tests/pages/BenchmarkPage.test.tsx

### Implementation for User Story 2

- [x] T015 [US2] Remove remaining `@/hooks/useFinchStatus` imports/usages in src/hooks/useIndustry.ts, src/pages/dashboard/DashboardPage.tsx, src/pages/additionalQuestions/AdditionalQuestions.tsx, and src/pages/recommendations/CompanyAtAGlance.tsx
- [x] T016 [US2] Delete obsolete polling hook file src/hooks/useFinchStatus.ts
- [x] T017 [US2] Ensure no broken exports/imports after hook removal by validating hook references in src/hooks/useIndustry.ts and src/pages/dashboard/DashboardPage.tsx

**Checkpoint**: US2 complete when polling hook path is removed and connection state remains assessment-driven.

---

## Phase 5: User Story 3 - Reliable Regression Coverage (Priority: P3)

**Goal**: Update and stabilize all affected tests so behavior remains protected after migration.

**Independent Test**: All Finch-related page tests pass with assessment-derived connection state and no `useFinchStatus` mock dependency.

### Tests for User Story 3

- [x] T018 [P] [US3] Update finch-related mock usage in tests/pages/AdditionalQuestionsValidation.test.tsx
- [x] T019 [P] [US3] Update finch-related mock usage in tests/pages/AdditionalQuestionsHealthPremium.test.tsx
- [x] T020 [P] [US3] Reconcile dual-hook mock setup for assessment-derived connection in tests/pages/RecommendationsFinchPage.test.tsx
- [x] T021 [US3] Run targeted regression tests for changed suites via pnpm vitest run tests/pages/DashboardPage.test.tsx tests/pages/AdditionalQuestions.test.tsx tests/pages/AdditionalQuestionsValidation.test.tsx tests/pages/AdditionalQuestionsHealthPremium.test.tsx tests/pages/RecommendationsFinchPage.test.tsx
- [x] T022 [US3] Run full regression and type checks using scripts in package.json (`pnpm run type-check` and `pnpm vitest run`) and record outcomes in specs/001-remove-finch-polling/quickstart.md

### Implementation for User Story 3

- [x] T023 [US3] Align shared mock defaults with `useAssessmentStatus` return shape in tests/pages/DashboardPage.test.tsx and tests/pages/AdditionalQuestions.test.tsx

**Checkpoint**: US3 complete when all updated suites pass and no coverage gap remains for finch connection behavior.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and artifact consistency

- [x] T024 [P] Validate quickstart steps and command sequence in specs/001-remove-finch-polling/quickstart.md
- [x] T025 Verify task-to-requirement traceability (FR-001 to FR-008) in specs/001-remove-finch-polling/tasks.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Starts immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks user stories.
- **Phase 3 (US1)**: Depends on Phase 2 completion.
- **Phase 4 (US2)**: Depends on Phase 2; can start after US1 implementation is stable.
- **Phase 5 (US3)**: Depends on US1 and US2 file changes.
- **Phase 6 (Polish)**: Depends on all user stories.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories; delivers MVP behavior.
- **US2 (P2)**: Depends on migrated consumers from US1 to safely remove polling hook.
- **US3 (P3)**: Depends on US1/US2 completion to finalize regression coverage.

### Within Each User Story

- Test updates precede or accompany implementation in the same story.
- Source refactors occur before deletion tasks.
- Verification commands execute after all file changes in that story.

### Parallel Opportunities

- Setup and foundational doc tasks can run in parallel where marked [P].
- US1 test tasks T006-T008 can run in parallel.
- US2 test tasks T013-T014 can run in parallel.
- US3 test mock updates T018-T020 can run in parallel.
- Polish validation tasks can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Parallel test updates (US1)
Task: "T006 [US1] tests/pages/DashboardPage.test.tsx"
Task: "T007 [US1] tests/pages/AdditionalQuestions.test.tsx"
Task: "T008 [US1] tests/pages/RecommendationsFinchPage.test.tsx"

# Sequential implementation after tests are updated
Task: "T009 [US1] src/hooks/useIndustry.ts"
Task: "T010 [US1] src/pages/dashboard/DashboardPage.tsx"
Task: "T011 [US1] src/pages/additionalQuestions/AdditionalQuestions.tsx"
Task: "T012 [US1] src/pages/recommendations/CompanyAtAGlance.tsx"
```

## Parallel Example: User Story 2

```bash
# Parallel test maintenance
Task: "T013 [US2] tests/pages/DashboardErrorHandling.test.tsx"
Task: "T014 [US2] tests/pages/BenchmarkPage.test.tsx"

# Cleanup sequence
Task: "T015 [US2] remove src imports"
Task: "T016 [US2] delete src/hooks/useFinchStatus.ts"
Task: "T017 [US2] validate source hook references"
```

## Parallel Example: User Story 3

```bash
# Parallel mock migration tasks
Task: "T018 [US3] tests/pages/AdditionalQuestionsValidation.test.tsx"
Task: "T019 [US3] tests/pages/AdditionalQuestionsHealthPremium.test.tsx"
Task: "T020 [US3] tests/pages/RecommendationsFinchPage.test.tsx"

# Final verification
Task: "T021 [US3] targeted vitest runs"
Task: "T022 [US3] full type-check + full vitest run"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete US1 tasks (T006-T012).
3. Validate US1 independently with focused page tests.
4. Demonstrate accurate assessment-derived connection behavior.

### Incremental Delivery

1. Deliver US1 (functional behavior migration).
2. Deliver US2 (polling pathway removal).
3. Deliver US3 (regression hardening and full verification).
4. Complete polish tasks.

### Parallel Team Strategy

1. One developer handles source migration (T009-T012, T015-T017).
2. One developer handles test migration (T006-T008, T013-T014, T018-T020).
3. Shared ownership for validation runs and final traceability checks (T021-T025).

---

## Notes

- [P] tasks are safe to parallelize by file boundaries.
- All user story tasks include explicit [US#] labels.
- Every task includes a concrete file path or command target.
- Story checkpoints are intended stop points for independent validation.

# Tasks: Ranking Feature — Additional Questions Goals Section

**Branch**: `001-ranking-feature`  
**Input**: Design documents from `/specs/001-ranking-feature/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: Existing test file `tests/utils/finchAssessmentPayload.test.ts` must be updated to keep passing after the static constant is removed (T006). No new test files are required.

**Organization**: Tasks are grouped by user story. All 3 user stories touch `src/pages/additionalQuestions/AdditionalQuestions.tsx` — work them sequentially (T003 → T004 → T005) within that file to avoid conflicts.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: User story label (US1 / US2 / US3)
- All paths are relative to repository root

---

## Phase 1: Setup

**Purpose**: Confirm clean baseline before any source changes.

- [x] T001 Verify branch `001-ranking-feature` is active and `pnpm run type-check` passes with zero errors as a clean baseline

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Add the `RankingList` import to `AdditionalQuestions.tsx` — required by US1 before the component can be rendered.

**⚠️ CRITICAL**: T002 must be complete before US1 implementation (T003) can begin.

- [x] T002 Add `import { RankingList } from "@/components/common/RankList"` to the import section of `src/pages/additionalQuestions/AdditionalQuestions.tsx`

**Checkpoint**: Import in place — US1 implementation can now begin.

---

## Phase 3: User Story 1 — Drag-and-Drop Goal Ranking (Priority: P1) 🎯 MVP

**Goal**: Wire the `RankingList` component into Question 2 of the Goals section so that any goals the user checks in Question 1 immediately appear as a draggable ranking list.

**Independent Test**: Navigate to `/additional-questions`, select 3 goals in Question 1 — a draggable list appears in Question 2. Drag items to reorder — order changes. Deselect a goal — it disappears from the list.

### Implementation for User Story 1

- [x] T003 [US1] Replace the Question 2 static label block in the Goals section of `src/pages/additionalQuestions/AdditionalQuestions.tsx` with a full `<RankingList>` component: (1) derive `availableOptions` inline as `goalsData.flatMap(cat => cat.goals.map(g => ({ label: g.label, value: g.id }))).filter(opt => goalsAnswers.selectedGoals.includes(opt.value))`; (2) render `<RankingList label="Rank your company's top three workforce goals (from above list)." isRequired={true} displayOrder={2} availableOptions={availableOptions} value={goalsAnswers.topThreeGoals} onChange={value => setGoalsAnswers(prev => ({ ...prev, topThreeGoals: value }))} maxItems={3} />`; (3) remove the old `<div className="pt-4">` label-only block for Question 2

**Checkpoint**: User Story 1 is fully functional — goals selected in Q1 appear as a draggable ranking list in Q2.

---

## Phase 4: User Story 2 — Minimum Selection Gate (Priority: P2)

**Goal**: Prevent form submission when fewer than 3 goals are selected, with a clear validation message.

**Independent Test**: Select 0–2 goals and click "Next" — a validation error appears and the form does not submit. Add goals to reach 3 — clicking "Next" proceeds normally.

### Implementation for User Story 2

- [x] T004 [US2] Add goal-count validation in `handleSubmit` in `src/pages/additionalQuestions/AdditionalQuestions.tsx`: insert `if (goalsAnswers.selectedGoals.length < 3) { setValidationError("Please select at least 3 workforce goals to rank them."); return; }` as the first check (before the existing `deskless-employees` check)

**Checkpoint**: User Stories 1 AND 2 both work — the ranking list renders dynamically and submission is blocked when fewer than 3 goals are selected.

---

## Phase 5: User Story 3 — Dynamic Payload Ranking (Priority: P3)

**Goal**: Remove the hardcoded `WORKFORCE_GOALS_RANKING` static array from `finchAssessmentPayload.ts` and replace it with the user's actual drag-ordered ranking from `goalsAnswers.topThreeGoals`. Update the existing test to reflect the new dynamic behaviour.

**Independent Test**: Select and rank 3 specific goals (e.g., "Attract Talent", "Reduce Absenteeism", "Retain Talent" in that order), submit the form, and verify via the Network tab that `goals.workforceGoalsRanking` in the payload matches that exact order — not the old static values.

### Implementation for User Story 3

- [x] T005 [US3] In `src/utils/finchAssessmentPayload.ts`: (1) remove the `const WORKFORCE_GOALS_RANKING = ["Retain Talent", "Attract Talent", "Reduce Absenteeism"]` constant (line 19); (2) change `workforceGoalsRanking: WORKFORCE_GOALS_RANKING` to `workforceGoalsRanking: [...goalsAnswers.topThreeGoals]` in the `goals` object
- [x] T006 [P] [US3] In `tests/utils/finchAssessmentPayload.test.ts`: update the "produces a complete payload matching FinchAssessmentPayload shape" test — change `topThreeGoals: []` to `topThreeGoals: ["Retain Talent", "Attract Talent", "Reduce Absenteeism"]` and update the `workforceGoalsRanking` expectation from the old static array to `["Retain Talent", "Attract Talent", "Reduce Absenteeism"]` (now driven by `topThreeGoals`)

**Checkpoint**: All 3 user stories complete — ranking is fully dynamic, payload carries user-ordered data, and all tests pass.

---

## Phase 6: Polish & Validation

**Purpose**: Confirm type safety, linting, and formatting after all changes.

- [x] T007 Run `pnpm run type-check` and confirm zero TypeScript errors across all modified files
- [x] T008 [P] Run `pnpm lint:fix` followed by `pnpm format` on modified files; confirm no lint warnings remain
- [x] T009 [P] Start dev server with `pnpm dev`, navigate to `/additional-questions`, and smoke-test the full Goals section per `specs/001-ranking-feature/quickstart.md` scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS US1
- **US1 (Phase 3)**: Depends on Phase 2 (T002)
- **US2 (Phase 4)**: Depends on Phase 2; sequentially after US1 (same file — avoid conflict)
- **US3 (Phase 5)**: Depends on Phase 2; **T005** is independent of US1/US2 (different file); **T006** is independent of all source tasks (test-only file)
- **Polish (Phase 6)**: Depends on all phases complete

### User Story Dependencies

- **US1 (P1)**: Depends only on T002 (import added)
- **US2 (P2)**: Logically independent; work sequentially after T003 to avoid file conflicts
- **US3 (P3)**: `src/utils/finchAssessmentPayload.ts` change (T005) is independent of AdditionalQuestions.tsx tasks — can be done in parallel with T003/T004 by a second developer

### Within Each User Story

- Models/derivations before component render
- Component render before validation wiring (US1 before US2 in same file)
- Source change (T005) before test update (T006) within US3

### Parallel Opportunities

- **T005** (payload change) and **T003** (component wiring) touch different files — can be done concurrently
- **T006** (test update) can run in parallel with any AdditionalQuestions.tsx tasks
- **T007**, **T008**, **T009** (polish) can all run in parallel after T001–T006 complete

---

## Parallel Example: Two-Developer Split

```
Developer A (AdditionalQuestions.tsx):
  T001 → T002 → T003 → T004

Developer B (payload + test):
  T005 → T006

Both finish → T007, T008, T009 (parallel)
```

---

## Implementation Strategy

**MVP scope**: Implement in priority order — US1 (T002, T003) alone delivers visible drag-and-drop functionality. US2 (T004) adds the hard validation gate. US3 (T005, T006) completes the data integrity fix.

**Incremental delivery checkpoints**:

1. After T003: Drag-and-drop list visible and functional
2. After T004: Submission gate enforced
3. After T006: All tests pass with dynamic payload
4. After T009: Smoke-tested and ready for PR

**Format validation**: All 9 tasks follow the required checklist format — checkbox ✅, Task ID ✅, [P] where applicable ✅, [Story] label on US phases ✅, file path in description ✅.

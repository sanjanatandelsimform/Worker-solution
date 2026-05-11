# Tasks: Rename Seasonal → Other in Workforce Demographics

**Input**: Design documents from `/specs/034-rename-seasonal-to-other/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on each other)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- No new files are created — this is a pure rename across 6 existing files

---

## Phase 1: Setup

**Purpose**: Confirm feature branch and locate all affected files

- [ ] T001 Confirm active branch is `034-rename-seasonal-to-other` and identify all 6 files listed in research.md

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Rename the TypeScript interface fields at the type layer — this MUST be done first because the hook and components derive their types from these interfaces

**⚠️ CRITICAL**: Phase 3 and Phase 4 tasks all depend on this phase being complete — the TypeScript compiler will error on `entry.seasonal` until the interface is updated

- [ ] T002 [US2] Rename `seasonal: string` → `other: string` on `EmploymentTypeEntry` and update JSDoc comment; rename `seasonal: number` → `other: number` on `AgeBreakdownEntry` in `src/types/workforceTypes.ts`

**Checkpoint**: `pnpm run type-check` will report errors in hook and pages — that is expected and confirms the types now require updating downstream

---

## Phase 3: User Story 1 — Employment Type Relabeled as Other (Priority: P1) 🎯 MVP

**Goal**: Users see "Other" (not "Seasonal") as the third donut chart label and the third Age Breakdown dropdown option; the correct backend key (`other`) drives the chart data

**Independent Test**: Start `pnpm dev`, navigate to Workforce → Demographics. The third donut chart is labeled "Other". The Age Breakdown dropdown's third option reads "Other". Selecting "Other" updates the progress bars.

### Implementation for User Story 1

- [ ] T003 [P] [US1] Rename third donut config entry: `id: "seasonal"` → `"other"`, `label: "Seasonal"` → `"Other"`, `selectedDeptData.seasonal` → `selectedDeptData.other`; rename param type `"seasonal"` → `"other"` in `src/hooks/useWorkforceDemographicsConfig.ts`
- [ ] T004 [P] [US1] Rename third `employmentTypeItems` entry: `id: "seasonal"` → `"other"`, `label: "Seasonal"` → `"Other"`; rename `EmploymentType` union `"seasonal"` → `"other"`; rename cast in `onSelectionChange` from `"seasonal"` → `"other"` in `src/pages/workforce/WorkforceDemographics.tsx`
- [ ] T005 [P] [US2] Rename `useState` type `"seasonal"` → `"other"` in `src/pages/workforce/WorkforcePage.tsx`

**Checkpoint**: `pnpm run type-check` must report **0 errors**. User Story 1 is fully functional — the donut chart and dropdown display "Other" and data flows from `entry.other`

---

## Phase 4: User Story 3 — All Tests Pass (Priority: P3)

**Goal**: Existing test suites reflect the renamed key so `pnpm run test` passes with 0 failures

**Independent Test**: `pnpm run test` exits with code 0 and all workforce-related test suites show green

### Implementation for User Story 3

- [ ] T006 [P] [US3] Update `sampleDemographics.employmentType` fixture (3 entries) and `sampleDemographics.employmentBreakdownByAge` fixture (6 entries) replacing `seasonal` key with `other`; update test description for donut chart entries; update destructuring and assertions that reference `seasonal` variable/id/label to use `other`; update age breakdown test description and `renderHook` argument from `"seasonal"` to `"other"` in `tests/hooks/useWorkforceDemographicsConfig.test.ts`
- [ ] T007 [P] [US3] Update `mockWorkforceData.workforce.demographics.employmentType` fixture field `seasonal: "5%"` → `other: "5%"` in `tests/store/workforceSelectors.test.ts`

**Checkpoint**: All workforce test suites pass. User Story 3 complete.

---

## Phase 5: Polish & Verification

**Purpose**: Run all quality gates to confirm the complete rename is consistent and nothing else regressed

- [ ] T008 Run `pnpm run type-check` and confirm exit code 0 with 0 TypeScript errors
- [ ] T009 Run `pnpm run test` and confirm exit code 0 with 0 failing tests
- [ ] T010 [P] Run `pnpm lint:fix` and `pnpm format` to apply any formatting cleanup
- [ ] T011 [P] Verify no residual `"seasonal"` strings remain as employment-type keys in `src/` or `tests/` (search for `seasonal` — only `contractorsSeasonalEmployees` in `assessmentSchemas.ts` should remain)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS Phases 3 and 4**
- **Phase 3 (US1 Source)**: All three tasks (T003, T004, T005) depend on T002; T003/T004/T005 are mutually parallel
- **Phase 4 (US3 Tests)**: T006/T007 depend on T002; can start in parallel with Phase 3 (different files)
- **Phase 5 (Polish)**: Depends on all of Phase 3 and Phase 4 being complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational (T002) → T003, T004 in parallel
- **US2 (P2)**: Depends on Foundational (T002) → T005 (and T002 itself is the primary US2 deliverable)
- **US3 (P3)**: Depends on Foundational (T002) → T006, T007 in parallel

### Parallel Opportunities

- T003, T004, T005 — three different source files, no inter-dependencies
- T006, T007 — two different test files, no inter-dependencies
- T003–T007 can all start simultaneously once T002 is complete
- T010, T011 can run in parallel during Polish

---

## Parallel Execution Example (after T002 completes)

```
# All 5 of these can start simultaneously:
T003 — src/hooks/useWorkforceDemographicsConfig.ts
T004 — src/pages/workforce/WorkforceDemographics.tsx
T005 — src/pages/workforce/WorkforcePage.tsx
T006 — tests/hooks/useWorkforceDemographicsConfig.test.ts
T007 — tests/store/workforceSelectors.test.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (T002 — workforceTypes.ts) ← **CRITICAL**
3. Complete Phase 3: T003, T004, T005
4. **STOP and VALIDATE**: `pnpm run type-check` → 0 errors; smoke-test in browser
5. Then add Phase 4 (test fixtures) and run `pnpm run test`

### Full Delivery (all stories)

1. T001 → T002 → (T003 + T004 + T005 + T006 + T007 in parallel) → T008 → T009 → T010 + T011

### Total Task Count

| Phase     | Tasks         | Story            |
| --------- | ------------- | ---------------- |
| Phase 1   | 1 (T001)      | Setup            |
| Phase 2   | 1 (T002)      | US2 Foundational |
| Phase 3   | 3 (T003–T005) | US1, US2         |
| Phase 4   | 2 (T006–T007) | US3              |
| Phase 5   | 4 (T008–T011) | Polish           |
| **Total** | **11**        |                  |

---

## Notes

- `assessmentSchemas.ts` (`contractorsSeasonalEmployees`) must NOT be changed — unrelated field
- `WorkforceCompensation*` and `useWorkforceCompensationConfig.ts` must NOT be changed
- T002 is the only true sequential bottleneck; all other tasks parallelize freely after it
- See `specs/034-rename-seasonal-to-other/quickstart.md` for exact diff hunks per file

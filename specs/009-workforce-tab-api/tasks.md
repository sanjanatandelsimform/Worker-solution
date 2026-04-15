---
description: "Task list for Dashboard Workforce Tab API Integration"
---

# Tasks: Dashboard Workforce Tab API Integration

**Input**: Design documents from `specs/009-workforce-tab-api/`
**Prerequisites**: plan.md ✓ | spec.md ✓ | research.md ✓ | data-model.md ✓ | contracts/workforce-get.md ✓ | quickstart.md ✓
**Branch**: `009-workforce-tab-api`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[US1/2/3]**: Which user story this task belongs to
- Exact file paths included in every task description

---

## Phase 1: Setup

**Purpose**: Ensure feature branch and spec artifacts are ready before implementation begins.

- [x] T001 Confirm active branch is `009-workforce-tab-api` and `specs/009-workforce-tab-api/` contains plan.md, data-model.md, contracts/workforce-get.md, quickstart.md

**Checkpoint**: On correct branch, all design artifacts present.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: TypeScript types, TDD test scaffolding, API service, Redux slice, selectors, and store registration. ALL must be complete before any user story can be verified.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Create `src/types/workforceTypes.ts` — define `WorkforceResponse`, `WorkforceOverview`, `Participation`, `BenefitsEnrollment`, `RetirementEnrollment`, `InsuranceEnrollment`, `Demographics`, `EmploymentTypeEntry`, `GenderBreakdown`, `AgeBreakdownEntry`, `Compensation`, `SalaryBreakdown`, `WorkforceBreakdown`, `Department`, `JobTitle`, `BenefitsCost`, `BenefitsCostGraphEntry`, `BenefitsCostTableRow`, `WorkforceState` (see `specs/009-workforce-tab-api/data-model.md`)
- [x] T003 [P] Create `tests/store/workforceSlice.test.ts` — 6 TDD test cases (Red): initial state, pending sets loading, fulfilled sets data+isLoaded, rejected sets error, clearWorkforce resets, auth/logout resets (see `specs/009-workforce-tab-api/quickstart.md` §A2)
- [x] T004 [P] Create `tests/store/workforceSelectors.test.ts` — 6 TDD test cases (Red): selectWorkforceData null, selectWorkforceLoading flag, selectWorkforceError string, selectWorkforceSection null, selectParticipationSection null, selectDemographicsSection null (see quickstart.md §A3)
- [x] T005 [P] Create `tests/services/workforceApi.test.ts` — 4 TDD test cases (Red): calls GET /api/v1/dashboard/workforce with Bearer token, returns response data on success, throws when no access token, throws normalised error on axios error (see quickstart.md §A4)
- [x] T006 [P] Create `src/services/api/workforceApi.ts` — `getWorkforce(): Promise<WorkforceResponse>` following `dashboardApi.ts` pattern exactly (token from localStorage, `apiClient.get`, 600 000 ms timeout, `getErrorMessage` helper) — makes `tests/services/workforceApi.test.ts` Green
- [x] T007 Create `src/store/slices/workforceSlice.ts`
- [x] T008 [P] Create `src/store/selectors/workforceSelectors.ts`
- [x] T009 Edit `src/store/store.ts`

**Checkpoint**: `pnpm test` passes for all three new test files. `pnpm run type-check` passes. Foundation ready — user story implementation can begin.

---

## Phase 3: User Story 1 — View Workforce Data from API (Priority: P1) 🎯 MVP

**Goal**: `DashboardPage` dispatches `fetchWorkforce` on every mount; `WorkforcePage` renders all four data sections (Overview, Participation, Demographics, Compensation) exclusively from Redux selectors — zero hardcoded display values remain.

**Independent Test**: With static fallback active, navigate to `/dashboard`, open the Workforce tab — all six card groups, three progress card groups, two donut/bar charts, and two tables must display values matching `STATIC_WORKFORCE_DATA`. No console errors. Loading skeletons appear briefly before data, not for a fixed 5-second delay.

### Implementation for User Story 1

- [x] T010 [P] [US1] Edit `src/pages/dashboard/DashboardPage.tsx`
- [x] T011 [P] [US1] Edit `src/pages/workforce/SalaryChart.tsx`
- [x] T012 [US1] Edit `src/pages/workforce/WorkforcePage.tsx` — add imports and replace loading state
- [x] T013 [US1] Edit `src/pages/workforce/WorkforcePage.tsx` — overview/employee card configs
- [x] T014 [US1] Edit `src/pages/workforce/WorkforcePage.tsx` — participation cards + progress cards
- [x] T015 [US1] Edit `src/pages/workforce/WorkforcePage.tsx` — demographics cards + selects
- [x] T016 [US1] Edit `src/pages/workforce/WorkforcePage.tsx` — donut charts + age breakdown
- [x] T017 [US1] Edit `src/pages/workforce/WorkforcePage.tsx` — compensation + salary breakdown cards
- [x] T018 [US1] Edit `src/pages/workforce/WorkforcePage.tsx` — users table from API
- [x] T019 [US1] Edit `src/pages/workforce/WorkforcePage.tsx` — salary table from API
- [x] T020 [US1] Edit `src/pages/workforce/WorkforcePage.tsx` — salary chart data prop

**Checkpoint**: `pnpm run type-check` passes. `pnpm dev` smoke test — Workforce tab shows all static values, loading skeletons visible briefly on mount, department dropdown changes update donut chart, no console errors. No hardcoded display literals remain in `WorkforcePage.tsx`.

---

## Phase 4: User Story 2 — Static Fallback While Backend Is Unavailable (Priority: P2)

**Goal**: Confirm `STATIC_WORKFORCE_DATA` in `workforceSlice.ts` is complete and correctly typed, and that the commented-out API call is in the right place for zero-friction migration when the backend goes live.

**Independent Test**: Load Workforce tab with static mode active — every field across all sections shows a real value (no `undefined`, no blank cells, no crashed components). Confirm the migration path: locate the `// TODO: Remove static data...` comment; removing the static block and uncommenting `getWorkforce()` is the only change needed.

### Implementation for User Story 2

- [x] T021 [US2] Verify `src/store/slices/workforceSlice.ts`
- [x] T022 [US2] Smoke test static mode

**Checkpoint**: All Workforce tab sections populated from static data. Migration path confirmed to be a single-file, comment-only change.

---

## Phase 5: User Story 3 — Error Handling for API Failure (Priority: P3)

**Goal**: When `workforceError` is non-null, `WorkforcePage` renders an `<ErrorMessage>` banner at the top of the page content instead of a broken empty state.

**Independent Test**: Temporarily force the `fetchWorkforce` thunk to reject (e.g. change static return to `rejectWithValue("Test error")`); load the Workforce tab — an error banner appears at the top, loading skeletons are removed; restoring the thunk clears the error.

### Implementation for User Story 3

- [x] T023 [US3] Edit `src/pages/workforce/WorkforcePage.tsx` — add error banner

**Checkpoint**: Forcing a thunk rejection displays the error banner. Restoring correct thunk removes it. Loading skeletons do not remain stuck.

---

## Phase 6: Polish & Quality Gate

**Purpose**: Final quality verification across all user stories.

- [x] T024 [P] Run `pnpm run type-check` — ✓ zero TypeScript errors
- [x] T025 [P] Run `pnpm lint:fix` then `pnpm format` — ✓ 0 errors, 44 pre-existing warnings, Prettier clean
- [x] T026 Run `pnpm test` — ✓ 213 tests passed (21 files), all workforce tests pass
- [ ] T027 Final smoke test `pnpm dev`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **blocks all user stories**
- **Phase 3 (US1)**: Depends on Phase 2 complete
- **Phase 4 (US2)**: Depends on Phase 2 + Phase 3 complete (verifying data is displayed)
- **Phase 5 (US3)**: Depends on Phase 3 T012 (workforceError selector wired in WorkforcePage)
- **Phase 6 (Polish)**: Depends on all implementation phases complete

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2. Core story — enables US2 and US3 verification.
- **US2 (P2)**: Starts after Phase 2 + Phase 3. Validates static data completeness and migration path.
- **US3 (P3)**: Starts after T012 (WorkforcePage imports workforceError). Single task (T023).

### Parallel Opportunities Within Phases

**Phase 2**:

- T002 must complete first (types needed by all)
- T003, T004, T005, T006 can all run in parallel after T002
- T007 can start after T002 (types) and T006 (API import)
- T008 can run in parallel with T007 (different file, only needs T002 + T009 prerequisite)
- T009 depends on T007 and T008

**Phase 3**:

- T010 (DashboardPage) and T011 (SalaryChart) can run in parallel — independent files
- T012–T020 are sequential — all edits to the same file (WorkforcePage.tsx)
- T010 and T011 can be worked in parallel with T012–T020 by separate developers

---

## Parallel Example: Phase 2 After T002

```
After T002 completes:
├── T003  tests/store/workforceSlice.test.ts        (parallel)
├── T004  tests/store/workforceSelectors.test.ts    (parallel)
├── T005  tests/services/workforceApi.test.ts       (parallel)
└── T006  src/services/api/workforceApi.ts          (parallel)

After T006 + T002 complete:
└── T007  src/store/slices/workforceSlice.ts        (sequential — imports T006)

After T002 complete (parallel with T007):
└── T008  src/store/selectors/workforceSelectors.ts

After T007 + T008 complete:
└── T009  src/store/store.ts
```

## Parallel Example: Phase 3

```
After Phase 2 complete:
├── T010  DashboardPage.tsx               (parallel — independent file)
├── T011  SalaryChart.tsx                 (parallel — independent file)
└── T012  WorkforcePage.tsx (step 1/9)    (sequential chain: T012 → T013 → ... → T020)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only — 20 tasks)

1. Complete Phase 1 (T001)
2. Complete Phase 2 (T002–T009) — Foundation
3. Complete Phase 3 (T010–T020) — Data displayed end-to-end
4. **STOP and VALIDATE**: Workforce tab renders all sections with static data, type-check passes
5. Deliver US1 for review

### Full Delivery (All Stories — 27 tasks)

1. Phases 1–3 as above (MVP)
2. Phase 4 (T021–T022) — Confirm static fallback + migration path
3. Phase 5 (T023) — Error handling banner
4. Phase 6 (T024–T027) — Quality gate
5. PR ready

### Task Count Summary

| Phase                 | Tasks  | Story    |
| --------------------- | ------ | -------- |
| Phase 1: Setup        | 1      | —        |
| Phase 2: Foundational | 8      | —        |
| Phase 3: US1          | 11     | US1 (P1) |
| Phase 4: US2          | 2      | US2 (P2) |
| Phase 5: US3          | 1      | US3 (P3) |
| Phase 6: Polish       | 4      | —        |
| **Total**             | **27** |          |

---

## Notes

- [P] tasks use different files with no dependencies on incomplete tasks
- TDD discipline required: T003/T004/T005 test files must **fail** before T006/T007/T008 implementations are written
- The `STATIC_WORKFORCE_DATA` const is the implementation of US2 — it lives in `workforceSlice.ts` (T007)
- `employementType` field name in types and code is intentionally misspelled to match backend schema
- `SalaryChart.tsx` (T011) must be completed before `WorkforcePage.tsx` T020 (which passes data to it)
- Stop at each Checkpoint to validate before continuing
- Commit after each logical group of tasks (e.g., after Phase 2, after each WorkforcePage step)

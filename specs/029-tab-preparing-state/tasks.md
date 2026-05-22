# Tasks: Show Preparing Dashboard Component Based on a Condition

**Input**: Design documents from `/specs/029-tab-preparing-state/`  
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅  
**Branch**: `029-tab-preparing-state`  
**Generated**: 2026-05-01

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (touches different files, no shared dependency)
- **[Story]**: Which user story this task belongs to
- Every task includes the exact file path to modify

---

## Phase 1: Setup

**Purpose**: No project initialization required — this feature modifies existing files only. This phase contains the single pre-flight validation step.

- [ ] T001 Verify branch `029-tab-preparing-state` is checked out and `pnpm run type-check` passes with zero errors on the current codebase

---

## Phase 2: Foundational — TypeScript Type Contract (Blocking Prerequisite)

**Purpose**: The type interface update in `dashboardStatusTypes.ts` is a hard prerequisite for both the hook implementation (US2) and any tab page changes (US3). Nothing else can compile until this is done.

**⚠️ CRITICAL**: T002 must be completed before any other task can start.

- [ ] T002 Add `isRecommendationTabStale: boolean`, `isWorkforceTabStale: boolean`, and `isIndustryTabStale: boolean` fields to `UseDashboardStatusPollingReturn` interface in `src/types/dashboardStatusTypes.ts` (after the `hasExceededProcessingWindow` field)

**Checkpoint**: Run `pnpm run type-check` — it will now show errors in the hook (T002 fields not yet returned). That is expected and confirms the type contract is in place.

---

## Phase 3: User Story 2 — Stale Detection Flags in the Polling Hook (Priority: P2) 🎯 MVP

**Goal**: `useDashboardStatusPolling` computes and returns three boolean stale flags. This is the core business logic and must be complete before US1 and US3 can be wired.

**Independent Test**: Unit-test the hook in isolation. Mock `getDashboardStatus` to return controlled `updatedAt` + `status` values. Assert each flag independently. No UI rendering needed.

### Tests for User Story 2

- [ ] T003 [US2] Add a `describe("useDashboardStatusPolling — stale flags", ...)` block to `tests/hooks/useDashboardStatusPolling.test.ts` with the following cases:
  - Returns `false` for all stale flags when `enabled: false` (no status loaded)
  - Returns `false` for all stale flags when `updatedAt` is `null` on all tabs (even if `pending`)
  - Returns `true` for `isRecommendationTabStale` when `status = "pending"` and `updatedAt` is 400s ago
  - Returns `false` for `isRecommendationTabStale` when `status = "pending"` and `updatedAt` is 60s ago
  - Returns `false` for `isRecommendationTabStale` when `status = "completed"` regardless of `updatedAt` age
  - Returns `false` for `isRecommendationTabStale` when `status = "not_applicable"` regardless of `updatedAt` age
  - Returns `true` for `isWorkforceTabStale` and `isIndustryTabStale` independently with stale+pending values

### Implementation for User Story 2

- [ ] T004 [US2] Add module-level helper function `isTabStale(updatedAt: string | null, tabStatus: StatusValue | undefined): boolean` in `src/hooks/useDashboardStatusPolling.ts` — above the `useDashboardStatusPolling` function. Logic: return `false` if `tabStatus !== "pending"` or `!updatedAt`; parse `updatedAt` with `Date.parse`; return `false` if `NaN`; return `Date.now() - parsed > PROCESSING_WINDOW_MS`.
- [ ] T005 [US2] Add three `useMemo` blocks in `src/hooks/useDashboardStatusPolling.ts` after the existing `isIndustryTabReady` memo — computing `isRecommendationTabStale`, `isWorkforceTabStale`, and `isIndustryTabStale` using the `isTabStale` helper.
- [ ] T006 [US2] Add `isRecommendationTabStale`, `isWorkforceTabStale`, `isIndustryTabStale` to the `return` object at the bottom of `useDashboardStatusPolling` in `src/hooks/useDashboardStatusPolling.ts`.

**Checkpoint**: Run `pnpm run type-check` — zero errors expected. Run `pnpm run test tests/hooks/useDashboardStatusPolling.test.ts` — all tests including T003's new describe block must pass.

---

## Phase 4: User Story 3 — Tab Pages Accept and Render `isStale` Prop (Priority: P3)

**Goal**: Each of the three tab page components renders `<PreparingDashboard />` when `isStale={true}` and falls back to normal content when `isStale={false}` or omitted.

**Independent Test**: Render each tab page in isolation with `isStale={true}` and assert the text "Preparing your dashboard" appears. Render with `isStale={false}` and assert it does not appear.

**⚠️ Rules of Hooks**: The early-return `if (isStale) return <PreparingDashboard />;` MUST be placed **after** all hook calls (`useState`, `useSelector`, `useMemo`, `useCallback`, `useEffect`, etc.) in each component.

### Tests for User Story 3

- [ ] T007 [P] [US3] Add `isStale={true}` / `isStale={false}` render tests for `RecommendationsFinchPage` in the existing or new test file `tests/pages/RecommendationsFinchPage.test.tsx` — assert `screen.getByText(/Preparing your dashboard/i)` is present when `true`, absent when `false`
- [ ] T008 [P] [US3] Add `isStale={true}` / `isStale={false}` render tests for `WorkforcePage` in the existing or new test file `tests/pages/WorkforcePage.test.tsx`
- [ ] T009 [P] [US3] Add `isStale={true}` / `isStale={false}` render tests for `BenchmarkFinchPage` in the existing or new test file `tests/pages/BenchmarkFinchPage.test.tsx`

### Implementation for User Story 3

- [ ] T010 [P] [US3] Update `src/pages/recommendations/RecommendationsFinchPage.tsx`:
  1. Add `import PreparingDashboard from "./PreparingDashboard";`
  2. Add `isStale = false` to the props destructure with type `readonly isStale?: boolean`
  3. Add early-return `if (isStale) { return <PreparingDashboard />; }` after the last hook call and before the `return` JSX block
- [ ] T011 [P] [US3] Update `src/pages/workforce/WorkforcePage.tsx`:
  1. Add `import PreparingDashboard from "@/pages/recommendations/PreparingDashboard";`
  2. Add `isStale = false` to the props destructure with type `readonly isStale?: boolean`
  3. Add early-return `if (isStale) { return <PreparingDashboard />; }` after the last hook call and before the `return` JSX block
- [ ] T012 [P] [US3] Update `src/pages/benchmark/BenchmarkFinchPage.tsx`:
  1. Add `import PreparingDashboard from "@/pages/recommendations/PreparingDashboard";`
  2. Add `isStale = false` to the props destructure with type `readonly isStale?: boolean`
  3. Add early-return `if (isStale) { return <PreparingDashboard />; }` after the last hook call and before the `return` JSX block

**Checkpoint**: All three tab pages individually render `<PreparingDashboard />` when `isStale={true}`. `pnpm run type-check` passes.

---

## Phase 5: User Story 1 — Wire Flags Through DashboardPage (Priority: P1)

**Goal**: `DashboardPage` destructures the three new stale flags from the hook and passes each as `isStale` to the corresponding tab page. End-to-end: a stale-pending tab shows `<PreparingDashboard />` to the user.

**Independent Test**: With Phase 3 and Phase 4 complete, load the dashboard in a browser (or integration test) with a mocked API response where one tab's `updatedAt` is > 5 min old and `status = "pending"`. Navigate to that tab and confirm `<PreparingDashboard />` renders.

### Implementation for User Story 1

- [ ] T013 [US1] Update `src/pages/dashboard/DashboardPage.tsx`: Destructure `isRecommendationTabStale`, `isWorkforceTabStale`, and `isIndustryTabStale` from the `useDashboardStatusPolling(...)` call (alongside the existing `isRecommendationTabReady` etc. fields).
- [ ] T014 [US1] Update `src/pages/dashboard/DashboardPage.tsx`: Pass `isStale={isRecommendationTabStale}` to `<RecommendationsFinchPage>`, `isStale={isWorkforceTabStale}` to `<WorkforcePage>`, and `isStale={isIndustryTabStale}` to `<BenchmarkFinchPage>`.

**Checkpoint**: Full end-to-end scenario: stale+pending tab shows `<PreparingDashboard />`; non-stale or completed tab shows normal content.

---

## Phase 6: Polish & Quality Gates

**Purpose**: Confirm all changes are complete, typed, linted, formatted, and all tests pass.

- [ ] T015 [P] Run `pnpm run type-check` — must exit with zero errors
- [ ] T016 [P] Run `pnpm lint:fix` then `pnpm format` — fix any linting or formatting issues
- [ ] T017 Run `pnpm run build` — must complete without errors
- [ ] T018 Run `pnpm run test` — all existing tests plus new stale-flag tests must pass

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    └── Phase 2 (Type Contract — T002)
            └── Phase 3 (Hook Logic — T003–T006)   ← US2
            └── Phase 4 (Tab Pages — T007–T012)    ← US3 [can start concurrently with Phase 3 after T002]
                    └── Phase 5 (DashboardPage — T013–T014) ← US1
                            └── Phase 6 (Polish — T015–T018)
```

### User Story Dependencies

- **US2 (Hook Flags — P2)**: Requires T002 (type contract). Logically P2 but implemented first because US1 and US3 depend on it.
- **US3 (Tab Pages — P3)**: Requires T002 (type contract). T007–T012 can run **in parallel** with T003–T006 once T002 is done.
- **US1 (DashboardPage wiring — P1)**: Requires T002, T005–T006 (hook returns flags), and T010–T012 (tab pages accept `isStale` prop).

### Parallel Opportunities Within Phases

- **Phase 4** (T007–T012): All six tasks touch different files — can all run in parallel once T002 is done.
- **Phase 3 + Phase 4**: After T002, Phase 3 hook implementation and Phase 4 tab page changes can proceed concurrently.
- **Phase 6** (T015–T016): Type-check and lint/format can run in parallel.

---

## Parallel Execution Example

```bash
# After T001 (branch check) and T002 (type contract) complete:

# Stream A — Hook logic (US2):
T003 → T004 → T005 → T006

# Stream B — Tab page changes (US3, all in parallel):
T007  T008  T009   # tests (can start alongside T010–T012)
T010  T011  T012   # implementations

# After both streams complete:
T013 → T014   # DashboardPage wiring (US1)

# Then:
T015  T016    # parallel: type-check + lint
T017          # build
T018          # full test run
```

---

## Implementation Strategy

### MVP Scope (minimum viable delivery)

Since all three user stories form a single coherent feature (flags → prop → render), the MVP is the complete feature delivered in order:

1. **T001–T002**: Validate + type contract
2. **T003–T006**: Hook stale flags (US2)
3. **T007–T012**: Tab page `isStale` prop (US3) — can overlap with US2
4. **T013–T014**: DashboardPage wiring (US1)
5. **T015–T018**: Quality gates

### Total Task Count: 18 tasks

| Phase           | Tasks     | User Story |
| --------------- | --------- | ---------- |
| Setup           | T001      | —          |
| Foundational    | T002      | —          |
| US2 — Hook      | T003–T006 | US2        |
| US3 — Tab Pages | T007–T012 | US3        |
| US1 — Dashboard | T013–T014 | US1        |
| Polish          | T015–T018 | —          |

### Parallel Opportunities: 9 tasks marked [P]

- T007, T008, T009 (test files, different files)
- T010, T011, T012 (implementation files, different files)
- T015, T016 (polish, different tools)
- All of Phase 4 is parallelizable internally

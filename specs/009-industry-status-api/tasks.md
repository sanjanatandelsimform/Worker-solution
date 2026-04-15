# Tasks: Conditional Industry API Call Based on Status Response

**Input**: Design documents from `specs/009-industry-status-api/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Included per constitution Principle III (Test-Driven Development — NON-NEGOTIABLE).

**Organization**: Tasks grouped by user story. US1 + US2 share infrastructure (same API, same slice), so they are co-implemented in Phase 3. US3 + US4 (suppression + skeleton) are addressed as part of the same hook logic.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US#]**: Maps to user story from spec.md
- Exact file paths included in all task descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create all new types, service, slice, and selectors — the foundational data pipeline that all user stories require.

- [ ] T001 [P] Define industry data TypeScript interfaces in `src/types/industryTypes.ts` — all entities from data-model.md: `IndustryData`, `IndustryOverview`, `IndustryTurnoverComparison`, `AreaMedianWage`, `HousingBurden`, `IndustryState`, plus API envelope type `IndustryApiResponse`
- [ ] T002 [P] Extend `FinchConnection` interface with `industry: "fetch" | null` field in `src/types/finchStatusTypes.ts`
- [ ] T003 [P] Add `selectFinchIndustryStatus` selector in `src/store/selectors/finchStatusSelectors.ts` — returns `state.finchStatus.connection?.industry ?? null`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Industry API service, Redux slice, selectors, and store registration. MUST be complete before any user story integration.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Tests (write FIRST — must FAIL before implementation)

- [ ] T004 [P] Write unit tests for `getIndustry()` service in `tests/services/industryApi.test.ts` — mock `apiClient.get`, test success response mapping, test error handling, test auth token extraction
- [ ] T005 [P] Write unit tests for `industrySlice` in `tests/store/slices/industrySlice.test.ts` — test initial state, `fetchIndustry.pending` (loading=true), `.fulfilled` (data set, isLoaded=true), `.rejected` (error set, isLoaded=false), logout reset
- [ ] T006 [P] Write unit tests for industry selectors in `tests/store/selectors/industrySelectors.test.ts` — test `selectIndustryData`, `selectIndustryLoading`, `selectIndustryError`, `selectIndustryIsLoaded` with various states

### Implementation

- [ ] T007 Create `getIndustry()` API service function in `src/services/api/industryApi.ts` — follows `dashboardApi.ts` pattern: auth token from localStorage, `apiClient.get<IndustryApiResponse>("/industry")`, error extraction via axios helpers
- [ ] T008 Create `industrySlice` with `fetchIndustry` async thunk in `src/store/slices/industrySlice.ts` — follows `dashboardSlice.ts` pattern: initialState with `data/loading/error/isLoaded`, pending/fulfilled/rejected cases, logout addMatcher reset
- [ ] T009 [P] Create typed selectors in `src/store/selectors/industrySelectors.ts` — `selectIndustryData`, `selectIndustryLoading`, `selectIndustryError`, `selectIndustryIsLoaded` (follows `dashboardSelectors.ts` pattern)
- [ ] T010 Register `industryReducer` in `src/store/store.ts` — import `industryReducer` from `industrySlice`, add to `combineReducers`, add `IndustryState` to `RootState` type

**Checkpoint**: Industry data pipeline complete. `fetchIndustry()` can be dispatched and data flows through Redux. All foundational tests pass (green).

---

## Phase 3: User Story 1 + 2 — Load Industry Data on Tab Click (Priority: P1) 🎯 MVP

**Goal**: When user clicks Industry tab (US1) or Finch Industry tab (US2), if `connection.industry === "fetch"`, call Industry API, show skeleton during load, render data on success. Cache data for session.

**Independent Test**: Log in with user whose `/finch/status` returns `industry: "fetch"`, click Industry tab, verify skeleton → data. Click Finch Industry tab, verify same behavior. Switch tabs and return — data shown instantly.

### Tests (write FIRST — must FAIL before implementation)

- [ ] T011 Write unit tests for `useIndustry` hook in `tests/hooks/useIndustry.test.ts` — test: dispatches `fetchIndustry` when `industry === "fetch"` and `!isLoaded`; does NOT dispatch when `isLoaded === true`; does NOT dispatch when `industry !== "fetch"`; returns correct `{ data, isLoading, error, isLoaded }` shape

### Implementation

- [ ] T012 Create `useIndustry` hook in `src/hooks/useIndustry.ts` — reads `selectFinchIndustryStatus` from finch state; reads `selectIndustryIsLoaded` + `selectIndustryLoading` from industry state; dispatches `fetchIndustry()` via `useEffect` when `industryStatus === "fetch"` && `!isLoaded` && `!loading`; returns `{ data, isLoading, error, isLoaded }` from industry selectors
- [ ] T013 Integrate `useIndustry` hook into `src/pages/benchmark/BenchmarkPage.tsx` — import hook; replace `setTimeout`-based `isLoadingCards` state with `isLoading` from hook; replace `selectIndustryOverview`/`selectDashboardData` reads with `data` from hook for industry-specific fields; keep existing skeleton components, wire to `isLoading` instead of timer
- [ ] T014 Integrate `useIndustry` hook into `src/pages/benchmark/BenchmarkFinchPage.tsx` — same integration pattern as T013: import hook, replace timer loading with hook `isLoading`, wire data from hook to existing UI components

**Checkpoint**: US1 + US2 complete. Industry and Finch Industry tabs fetch data conditionally, show skeleton while loading, render data on success, cache for session.

---

## Phase 4: User Story 3 — Suppress API Call When industry === null (Priority: P2)

**Goal**: When `connection.industry` is `null` or any non-`"fetch"` value, no Industry API call is made, no skeleton is shown.

**Independent Test**: Log in with user whose `/finch/status` returns `industry: null`, click Industry tab, verify no network request to `/industry` and no skeleton loader.

> Note: The suppression logic is inherently built into the `useIndustry` hook (T012) via the conditional `industry === "fetch"` check. This phase validates that the behavior works correctly end-to-end.

- [ ] T015 [US3] Add targeted test case in `tests/hooks/useIndustry.test.ts` for null/undefined/unexpected `connection.industry` values — verify `fetchIndustry` is NOT dispatched and `isLoading` remains `false`
- [ ] T016 [US3] Verify in `src/hooks/useIndustry.ts` that the industry status check treats any non-`"fetch"` value (null, undefined, empty string, unexpected string) as "do not fetch" — add defensive guard if not already covered by T012

**Checkpoint**: US3 complete. No unnecessary API calls when `connection.industry !== "fetch"`.

---

## Phase 5: User Story 4 — Skeleton Loader During Data Retrieval (Priority: P2)

**Goal**: Skeleton loaders matching the layout of final content are visible for the entire fetch duration — no blank area, no flash, no layout shift.

**Independent Test**: Simulate slow Industry API response, verify skeleton loaders render in correct positions within Industry and Finch Industry tabs.

> Note: Existing skeleton components (`OverviewCardSkeleton`, `TurnoverRateCardSkeleton`, `SalaryHourlySkeleton`, `WagesCardSkeleton`, `ProgressCardSkeleton`) are already defined in `BenchmarkPage.tsx`. The integration in T013/T014 wires them to `isLoading` from the hook. This phase validates the wiring is correct.

- [ ] T017 [US4] Verify skeleton loader wiring in `src/pages/benchmark/BenchmarkPage.tsx` — confirm all skeleton components render when `isLoading === true` and hide when `isLoading === false`; confirm no residual `setTimeout` timer logic remains
- [ ] T018 [US4] Verify skeleton loader wiring in `src/pages/benchmark/BenchmarkFinchPage.tsx` — same verification as T017 for the Finch page

**Checkpoint**: US4 complete. Skeleton loaders display correctly during data fetch with no layout shift.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, edge cases, type-checking, quickstart validation.

- [ ] T019 [P] Add error state handling in `src/pages/benchmark/BenchmarkPage.tsx` — when `error` from `useIndustry` is truthy, display error message within the tab content area (matching existing error patterns in the codebase, e.g., `ErrorMessage` component)
- [ ] T020 [P] Add error state handling in `src/pages/benchmark/BenchmarkFinchPage.tsx` — same pattern as T019
- [ ] T021 Run `pnpm run type-check` and fix any TypeScript errors across all modified/new files
- [ ] T022 Run `pnpm lint:fix` and `pnpm format` to ensure code quality compliance
- [ ] T023 Run all tests: `pnpm vitest run tests/services/industryApi.test.ts tests/store/slices/industrySlice.test.ts tests/store/selectors/industrySelectors.test.ts tests/hooks/useIndustry.test.ts` — all must pass
- [ ] T024 Run quickstart.md validation — follow all verification steps in `specs/009-industry-status-api/quickstart.md` manually with dev server

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (types must exist before service/slice)
- **Phase 3 (US1+US2)**: Depends on Phase 2 (slice/selectors must exist before hook/component integration)
- **Phase 4 (US3)**: Depends on Phase 3 (hook must exist to test suppression logic)
- **Phase 5 (US4)**: Depends on Phase 3 (component integration must exist to verify skeleton wiring)
- **Phase 6 (Polish)**: Depends on Phases 3-5

### User Story Dependencies

- **US1 + US2 (P1)**: Co-implemented in Phase 3 — they share the same hook, selectors, and data source. Cannot be separated without duplicating infrastructure.
- **US3 (P2)**: Logically embedded in the hook from Phase 3; Phase 4 adds explicit validation/testing.
- **US4 (P2)**: Logically embedded in the component integration from Phase 3; Phase 5 adds explicit validation.

### Within Each Phase

- Tests MUST be written first and MUST FAIL before implementation (TDD)
- Types before service
- Service before slice
- Slice before selectors
- Selectors before hook
- Hook before component integration

### Parallel Opportunities

Within Phase 1: T001, T002, T003 can all run in parallel (different files, no dependencies).

Within Phase 2:
- T004, T005, T006 (tests) can all run in parallel
- T007 must complete before T008 (thunk calls service)
- T009 can run in parallel with T008 (different files)
- T010 must be last (depends on T008)

Within Phase 3:
- T011 (test) runs first
- T012 must complete before T013, T014
- T013 and T014 can run in parallel (different files)

Within Phase 6:
- T019, T020 can run in parallel (different files)
- T021, T022 are sequential (lint after type-check)

---

## Parallel Example: Phase 1 (all tasks)

```bash
# All three tasks modify different files — run in parallel:
T001: src/types/industryTypes.ts
T002: src/types/finchStatusTypes.ts
T003: src/store/selectors/finchStatusSelectors.ts
```

## Parallel Example: Phase 2 (tests)

```bash
# All three test files — run in parallel:
T004: tests/services/industryApi.test.ts
T005: tests/store/slices/industrySlice.test.ts
T006: tests/store/selectors/industrySelectors.test.ts
```

## Parallel Example: Phase 3 (component integration)

```bash
# After hook is created (T012), both pages can be modified in parallel:
T013: src/pages/benchmark/BenchmarkPage.tsx
T014: src/pages/benchmark/BenchmarkFinchPage.tsx
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (3 tasks)
2. Complete Phase 2: Foundational (7 tasks)
3. Complete Phase 3: US1 + US2 (4 tasks)
4. **STOP and VALIDATE**: Test Industry + Finch Industry tabs end-to-end
5. Deploy/demo if ready — core feature delivers value

### Incremental Delivery

1. Setup + Foundational → Data pipeline ready
2. US1 + US2 → Tabs load data conditionally → MVP! 🎯
3. US3 → Suppression validated → Ensures no wasted API calls
4. US4 → Skeleton quality verified → Polish
5. Polish → Error handling, type-check, lint, quickstart validation

### Single Developer Flow

All phases are sequential for a single developer:
Phase 1 (30 min) → Phase 2 (1.5 hr) → Phase 3 (1.5 hr) → Phase 4 (30 min) → Phase 5 (30 min) → Phase 6 (45 min)

**Estimated total**: ~5 hours

---

## Notes

- [P] tasks = different files, no dependencies; can run in parallel
- [US#] label maps task to user story for traceability
- US1 and US2 are co-implemented because they share 100% of infrastructure (slice, hook, API)
- Existing skeleton components are REUSED, not created — only wiring changes
- No UI/design changes per spec — only data flow and loading state logic
- Commit after each phase or logical task group
- Stop at any checkpoint to validate independently

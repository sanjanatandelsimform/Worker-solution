# Tasks: Defer Tab API Calls Until Tab Is Ready

**Feature Branch**: `033-defer-tab-api`  
**Input**: Design documents from `/specs/033-defer-tab-api/`  
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Total tasks**: 13  
**Source files**: 3 | **Test files**: 4  
**Tests**: Included per FR-009 and spec requirement

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other [P]-marked tasks
- **[US1]** = Workforce tab deferred fetch (P1)
- **[US2]** = Recommendations tab deferred fetch (P1)
- **[US3]** = Industry tab deferred fetch (P2)

---

## Phase 1: Setup

**Purpose**: No new project scaffolding required for this feature. All source and test files already exist.

> No setup tasks needed — all files modified, none created.

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Add the `useDashboardStatusPolling` mock to the two Dashboard test files. This is a prerequisite for the test tasks in US1 and US2 — without it, those test files will call the real hook during test runs, which starts network polling and breaks timers.

**⚠️ CRITICAL**: Must complete before US1/US2 test tasks can be written or run.

- [ ] T001 Add `useDashboardStatusPolling` hoisted mock + `DEFAULT_POLLING_STATUS` constant to `tests/pages/DashboardPage.test.tsx`; add `mockUseDashboardStatusPolling.mockReturnValue({ ...DEFAULT_POLLING_STATUS })` to the top-level `beforeEach`

- [ ] T002 [P] Add `useDashboardStatusPolling` hoisted mock (same shape, all-ready defaults) to `tests/pages/DashboardPage.branches.test.tsx`; add `mockUseDashboardStatusPolling.mockReturnValue({ ...DEFAULT_POLLING_STATUS })` to `beforeEach` — no new test cases needed in this file

**Checkpoint**: Both Dashboard test files now have the polling hook mocked → existing tests still pass, new deferred-fetch test cases can be added.

---

## Phase 3: User Story 1 — Workforce Data Loads Only When Ready (Priority: P1) 🎯 MVP

**Goal**: `fetchWorkforce` is NOT dispatched until `isWorkforceTabReady` is `true`. When polling is disabled the gate is bypassed and original behaviour is preserved.

**Independent Test**: In `DashboardPage.test.tsx`, spy on `fetchWorkforce` and assert it is not called when `isWorkforceTabReady = false` with `isConnected = true`; assert it IS called when `isWorkforceTabReady = true`.

### Tests for User Story 1 ⚠️ Write FIRST — must FAIL before implementation

- [ ] T003 [US1] Add `describe("deferred fetch gating — workforce")` block to `tests/pages/DashboardPage.test.tsx`:
  - `it("does NOT dispatch fetchWorkforce when isWorkforceTabReady=false")` — spy on `fetchWorkforce`, set `isConnected=true`, `isWorkforceTabReady=false`, assert spy not called
  - `it("dispatches fetchWorkforce when isWorkforceTabReady=true and isConnected=true")` — assert spy called after flag is true

### Implementation for User Story 1

- [ ] T004 [US1] Modify `src/pages/dashboard/DashboardPage.tsx`:
  - Move the existing dispatch `useEffect` (the one calling `fetchWorkforce` / `fetchRecommendations`) to AFTER the `useDashboardStatusPolling` destructure block
  - Add `workforceReady = !shouldPollDashboardStatus || isWorkforceTabReady` inside the effect
  - Update the workforce dispatch condition: `if (isConnected && workforceReady) dispatch(fetchWorkforce())`
  - Add `isWorkforceTabReady` and `shouldPollDashboardStatus` to the dependency array

**Checkpoint**: US1 tests pass. `fetchWorkforce` is only dispatched when `isWorkforceTabReady = true` (or polling is off).

---

## Phase 4: User Story 2 — Recommendations Data Loads Only When Ready (Priority: P1)

**Goal**: `fetchRecommendations` is NOT dispatched until `isRecommendationTabReady` is `true`. Gate uses the same `!shouldPollDashboardStatus` bypass to preserve non-polling behaviour.

**Independent Test**: Spy on `fetchRecommendations`, set `assessmentData.status = "completed"` but `isRecommendationTabReady = false`, assert spy not called; flip to `true`, assert it is called.

### Tests for User Story 2 ⚠️ Write FIRST — must FAIL before implementation

- [ ] T005 [US2] Add `describe("deferred fetch gating — recommendations")` block to `tests/pages/DashboardPage.test.tsx`:
  - `it("does NOT dispatch fetchRecommendations when isRecommendationTabReady=false")` — spy on `fetchRecommendations`, set `assessmentData.status="completed"`, `isRecommendationTabReady=false`, assert spy not called
  - `it("dispatches fetchRecommendations when isRecommendationTabReady=true and assessment completed")` — assert spy called
  - `it("gate bypasses when polling disabled (isConnected=false, assessmentData=null)")` — both ready flags false, both conditions false, both spies not called

### Implementation for User Story 2

- [ ] T006 [US2] Modify `src/pages/dashboard/DashboardPage.tsx` (continuing from T004):
  - Add `recommendReady = !shouldPollDashboardStatus || isRecommendationTabReady` inside the moved dispatch effect
  - Update recommendations dispatch condition: `if ((isConnected || assessmentData?.data?.status === "completed") && recommendReady) dispatch(fetchRecommendations())`
  - Add `isRecommendationTabReady` to the dependency array

**Checkpoint**: US2 tests pass. `fetchRecommendations` is only dispatched when `isRecommendationTabReady = true` (or polling is off). US1 tests continue to pass.

---

## Phase 5: User Story 3 — Industry Data Loads Only When Ready (Priority: P2)

**Goal**: `fetchIndustry` is NOT dispatched until `isIndustryTabReady` is `true`. The gate is implemented via a new `enabled` option in `useIndustry`; `BenchmarkFinchPage` threads `isReady` into it.

**Independent Test**: Render `BenchmarkFinchPage` with `isReady=false`; verify `mockUseIndustry` was called with `{ enabled: false }`. Separately, test `useIndustry({ enabled: false })` does not dispatch.

### Tests for User Story 3 ⚠️ Write FIRST — must FAIL before implementation

- [ ] T007 [P] [US3] Add `describe("enabled option")` block to `tests/hooks/useIndustry.test.ts`:
  - `it("does NOT dispatch fetchIndustry when enabled=false")` — `renderHook(() => useIndustry({ enabled: false }))`, assert `mockDispatch` not called
  - `it("dispatches fetchIndustry when enabled flips to true")` — start with `enabled=false`, `rerender` with `enabled=true`, assert `mockDispatch` called

- [ ] T008 [P] [US3] Add `describe("isReady forwarded to useIndustry as enabled")` block to `tests/pages/BenchmarkFinchPage.test.tsx`:
  - `it("calls useIndustry with enabled=false when isReady=false")` — `render(<BenchmarkFinchPage isReady={false} />)`, assert `mockUseIndustry` called with `{ enabled: false }`
  - `it("calls useIndustry with enabled=true when isReady=true")` — assert `mockUseIndustry` called with `{ enabled: true }`

### Implementation for User Story 3

- [ ] T009 [P] [US3] Modify `src/hooks/useIndustry.ts`:
  - Add `export interface UseIndustryOptions { enabled?: boolean; }` (before the function)
  - Change signature to `export function useIndustry({ enabled = true }: UseIndustryOptions = {}): UseIndustryReturn`
  - Add `if (!enabled) return;` as the FIRST guard inside the dispatch `useEffect` (before `if (isLoaded || isLoading) return`)
  - Add `enabled` to the `useEffect` dependency array

- [ ] T010 [US3] Modify `src/pages/benchmark/BenchmarkFinchPage.tsx`:
  - Change `useIndustry()` call to `useIndustry({ enabled: isReady })`
  - No import change needed (`useIndustry` is already imported)

**Checkpoint**: US3 tests pass. `fetchIndustry` is only dispatched when `isReady = true` (i.e., `isIndustryTabReady = true` as set by `DashboardPage`). All three user stories are complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify full regression pass and type check.

- [ ] T011 [P] Run `pnpm run type-check` — zero TypeScript errors expected (especially for the new `UseIndustryOptions` interface usage and updated `useEffect` dependency arrays)

- [ ] T012 [P] Run `pnpm lint:fix` then `pnpm format` — no new lint warnings; `exhaustive-deps` rule satisfied by the updated dependency arrays

- [ ] T013 Run full test suite for affected files: `pnpm test -- tests/hooks/useIndustry.test.ts tests/pages/BenchmarkFinchPage.test.tsx tests/pages/DashboardPage.test.tsx tests/pages/DashboardPage.branches.test.tsx` — all existing AND new tests MUST pass

**Checkpoint**: Zero type errors, zero lint warnings, all tests green. Feature complete.

---

## Dependencies

```
T001 → T003, T004 (Dashboard polling mock must exist before Dashboard tests/impl)
T002 (independent — branches test file)
T003 → T004 (test must fail before impl)
T004 → T005, T006 (DashboardPage dispatch effect already moved by T004)
T005 → T006 (test must fail before impl)
T007 (independent — hook test)
T008 (independent — BenchmarkFinchPage test)
T007, T008 → T009, T010 (tests must fail before impl)
T009 → T010 (useIndustry interface must exist before BenchmarkFinchPage uses it)
T004, T006, T010 → T011, T012, T013 (all source changes done before final checks)
```

## Parallel Execution Opportunities

| Wave | Tasks            | What runs                                            |
| ---- | ---------------- | ---------------------------------------------------- |
| 1    | T001, T002       | Both dashboard test files get polling mock added     |
| 2    | T003, T007, T008 | US1 + US3 tests written simultaneously               |
| 3    | T004             | US1 implementation (unblocks US2 impl)               |
| 4    | T005             | US2 test (can write while T004 is reviewed)          |
| 5    | T006, T009, T010 | US2 impl + US3 impl run in parallel                  |
| 6    | T011, T012, T013 | Final checks (type-check + lint + tests in parallel) |

## Implementation Strategy

**MVP scope**: Complete Phase 3 (US1 — Workforce) alone. This delivers the highest-value fix independently.

**Full delivery order**: US1 → US2 (same file, same effect) → US3 (different files, parallel after US1/US2).

**Estimated task count per story**:

- US1: 2 tasks (T003, T004)
- US2: 2 tasks (T005, T006)
- US3: 4 tasks (T007, T008, T009, T010)
- Setup/Foundational: 2 tasks (T001, T002)
- Polish: 3 tasks (T011, T012, T013)

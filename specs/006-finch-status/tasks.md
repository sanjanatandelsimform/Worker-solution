# Tasks: Finch Status API Integration — Dashboard Visibility Control

**Input**: Design documents from `/specs/006-finch-status/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/finch-status-api.md ✅, quickstart.md ✅

**Tests**: Included — Constitution Principle III (TDD) is NON-NEGOTIABLE for this project.
All tests MUST be written BEFORE implementation (Red-Green-Refactor cycle).

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story (US1–US4) — required for user story phase tasks only
- No Story label for Setup or Foundational tasks

---

## Phase 1: Setup

**Purpose**: Confirm branch is active and baseline is clean before any new code is written.

- [x] T001 Confirm branch `006-finch-status` is active and `pnpm run type-check` reports zero errors on the baseline before any changes

**Checkpoint**: Branch confirmed, baseline green — Phase 2 can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types, service function, Redux slice, selectors, and store registration. ALL stories depend on this phase.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Create `src/types/finchStatusTypes.ts` — define `FinchConnectionStatus`, `FinchSyncJobStatus`, `FinchConnection`, `FinchSyncJob`, `FinchStatusApiResponse`, `FinchStatusData`, and `FinchStatusState` as specified in data-model.md
- [x] T003 [P] Write failing tests for `getFinchStatus()` in `tests/services/finchApi.test.ts` — success path with `{ status: true, data: {...} }`, `status: false` throws, network error throws
- [x] T004 [P] Write failing tests for `finchStatusSlice` reducer in `tests/store/finchStatusSlice.test.ts` (NEW file) — pending/fulfilled/rejected state transitions and `auth/logout` reset to `initialState`
- [x] T005 [P] Write failing tests for `finchStatusSelectors` in `tests/store/finchStatusSelectors.test.ts` (NEW file) — `selectFinchConnection`, `selectFinchLatestSyncJob`, `selectFinchStatusLoading`, `selectFinchStatusError` each return correct slice fields
- [x] T006 Add `getFinchStatus()` to `src/services/api/finchApi.ts` — `apiClient.get<FinchStatusApiResponse>("/finch/status")`, throw when `response.data.status` is falsy, return `response.data.data`
- [x] T007 Create `src/store/slices/finchStatusSlice.ts` — `fetchFinchStatus` async thunk calling `getFinchStatus()`, `resetFinchStatus` reducer, `auth/logout` reset matcher, following pattern from `src/store/slices/dashboardSlice.ts`
- [x] T008 [P] Create `src/store/selectors/finchStatusSelectors.ts` — `selectFinchConnection`, `selectFinchLatestSyncJob`, `selectFinchStatusLoading`, `selectFinchStatusError` with typed `RootState` parameter
- [x] T009 [P] Register `finchStatus: finchStatusReducer` in `src/store/store.ts` — add import and add key to `combineReducers` call

**Checkpoint**: Foundation complete. `pnpm run type-check` and all T003–T005 tests pass.
User story implementation can now begin.

---

## Phase 3: User Story 1 — Hide Choice Cards When Finch Is Connected (Priority: P1) 🎯 MVP

**Goal**: When the `/finch/status` endpoint returns `connection.status === "connected"`, the Basic Plan card, the "Connect with Finch" choice card, and the "Connect to Finch" banner card are all hidden on the Dashboard.

**Independent Test**: Mount `DashboardPage` with `emailVerify=true`, `assessmentData.status="completed"`, `isDashboardReady=true`. Stub `/finch/status` to return `connection.status === "connected"`. Assert Basic Plan card, Connect with Finch choice card, and Connect to Finch banner are not rendered.

### Tests for User Story 1 ⚠️ Write FIRST — must FAIL before T012/T013

- [x] T010 [P] [US1] Write failing tests for `useFinchStatus` hook dispatch-on-mount and `isConnected` derivation in `tests/hooks/useFinchStatus.test.ts` (NEW file) — verify `fetchFinchStatus` dispatched on mount; `isConnected=true` when `connection.status="connected"`; `isConnected=false` for `"disconnected"`, `"reauth_required"`, and `null` connection
- [x] T011 [P] [US1] Write failing tests for DashboardPage connected-state card hiding in `tests/pages/DashboardPage.test.tsx` — three scenarios: Basic Plan card absent, Connect with Finch choice card absent, Connect to Finch banner absent when `isConnected=true` and `assessmentData.status !== "completed"`; and banner absent when `isConnected=true` and `assessmentData.status === "completed"`

### Implementation for User Story 1

- [x] T012 [US1] Create `src/hooks/useFinchStatus.ts` — `useEffect` dispatches `fetchFinchStatus()` immediately on mount, then `setInterval(() => dispatch(fetchFinchStatus()), 15_000)` unconditionally; `clearInterval` in cleanup; returns `{ connectionStatus, syncJobStatus, isConnected, isLoading, error }` using selectors from `finchStatusSelectors.ts`
- [x] T013 [US1] Update `src/pages/dashboard/DashboardPage.tsx` — import `useFinchStatus` and destructure `isConnected`; add `&& !isConnected` to (a) the "Take Assessment" DashboardCard condition, (b) the flexbox div containing the Basic Plan and Connect with Finch choice cards, and (c) the "Connect to Finch" DashboardCard condition

**Checkpoint**: US1 fully functional. `isConnected=true` hides all three card sections. Dev server smoke test: `/dashboard` with mocked connected state shows no onboarding cards.

---

## Phase 4: User Story 2 — Show Choice Cards When Finch Is Not Connected (Priority: P2)

**Goal**: When the connection status is disconnected, reauth_required, null, or when the status endpoint returns an error, the Dashboard renders identically to its pre-feature state — all existing assessment-based visibility logic is preserved.

**Independent Test**: Mount `DashboardPage` with same props as Phase 3 test. Stub `/finch/status` to return each of: `connection.status="disconnected"`, `connection.status="reauth_required"`, `connection=null`, and a network error. Assert all existing cards render exactly as before (no regression).

### Tests for User Story 2 ⚠️ Write FIRST — must FAIL before validation

- [x] T014 [US2] Extend `tests/pages/DashboardPage.test.tsx` with backward-compat test cases — for each of `"disconnected"`, `"reauth_required"`, `connection: null`, and API error: assert the "Take Assessment" card, Basic Plan card, and Connect with Finch choice card render per their existing assessment-status conditions; assert no crash; assert tabs appear only when `isDashboardReady=true`

**Note**: No new production code required for US2. T013's `&& !isConnected` condition naturally satisfies all backward-compat scenarios since `isConnected` is `false` for all non-connected states. T014 tests confirm no regression.

**Checkpoint**: US1 + US2 verified. Non-connected users see zero visual difference from pre-feature dashboard.

---

## Phase 5: User Story 3 — Wire the "Connect to Finch" Dashboard Card Button (Priority: P2)

**Goal**: The "Connect" button on the "Connect to Finch" DashboardCard initiates the Finch Connect flow (`connectWithFinch()`) and is disabled while a Finch operation is in progress.

**Independent Test**: Mount `DashboardPage` with `assessmentData.status="completed"` and Finch status returning a non-connected state. Assert "Connect to Finch" DashboardCard is visible. Click "Connect" button and verify `connectWithFinch()` called. Set `isFinchLoading=true` and verify button is disabled.

### Tests for User Story 3 ⚠️ Write FIRST — must FAIL before T016

- [x] T015 [US3] Extend `tests/pages/DashboardPage.test.tsx` with Connect button test cases — clicking "Connect" calls `connectWithFinch()`; button has `disabled` attribute when `isFinchLoading=true`; button is interactive when `isFinchLoading=false`

### Implementation for User Story 3

- [x] T016 [US3] Update `src/pages/dashboard/DashboardPage.tsx` — add `onClick={() => void connectWithFinch()}` and `buttonIsDisabled={isFinchLoading}` props to the "Connect to Finch" DashboardCard (the card already uses `useFinchConnect` hook from T013's import; `connectWithFinch` and `isFinchLoading` are already destructured in the component)

**Checkpoint**: US3 complete. Connect button on the banner card functional and disabled during loading.

---

## Phase 6: User Story 4 — 15-Second Status Polling While Dashboard Is Open (Priority: P3)

**Goal**: While the Dashboard is mounted, `/finch/status` is re-fetched every 15 seconds. The interval is cleared on unmount with no residual dispatches (no memory leaks).

**Independent Test**: Mount `DashboardPage` with fake timers. Verify initial dispatch on mount. Advance timer 15s — verify second dispatch. Advance another 15s — verify third dispatch. Unmount — advance timers further and verify no additional dispatches.

### Tests for User Story 4 ⚠️ Write FIRST — confirms T012 polling implementation is correct

- [x] T017 [US4] Extend `tests/hooks/useFinchStatus.test.ts` with polling lifecycle test cases — using `vi.useFakeTimers()`: confirm initial dispatch on mount (1 call); advance 15 000ms → confirm 2nd dispatch; advance another 15 000ms → confirm 3rd dispatch; unmount component → advance 30 000ms → confirm no additional dispatches beyond the pre-unmount count (verifies `clearInterval` works)

**Note**: Polling implementation is already delivered by T012. US4's sole task is the fake-timer test suite that formally verifies the interval contract. These tests MUST fail if T012 is not yet implemented, confirming TDD discipline.

**Checkpoint**: All four user stories complete and independently verified.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality gate confirmation across all new and modified files.

- [x] T018 [P] Run `pnpm run type-check` — zero TypeScript errors required; fix any issues in `finchStatusTypes.ts`, `finchStatusSlice.ts`, `finchStatusSelectors.ts`, `useFinchStatus.ts`, `DashboardPage.tsx`
- [x] T019 [P] Run `pnpm lint:fix` then `pnpm format` across all new and modified files
- [x] T020 Run `pnpm test` — all tests pass (new: T003–T005, T010–T011, T014–T015, T017 suites; modified: finchApi.test.ts, DashboardPage.test.tsx; existing tests unaffected)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
  └── Phase 2 (Foundational)  ← BLOCKS everything
        ├── Phase 3 (US1 P1)  ← start here after foundation
        │     └── Phase 4 (US2 P2)  ← verify regression after US1
        │           └── Phase 5 (US3 P2)  ← wire button (same file)
        │                 └── Phase 6 (US4 P3)  ← polling tests
        │                       └── Phase 7 (Polish)
        └── (US2, US3, US4 also depend on foundation but ordered by priority)
```

### User Story Dependencies

- **US1 (P1)**: Requires foundation (T002–T009) — no other story dependencies
- **US2 (P2)**: Requires US1 implementation (T013) to have something to regression-test
- **US3 (P2)**: Requires T013 (`useFinchStatus` imported into `DashboardPage`, `isConnected` available) — `connectWithFinch` and `isFinchLoading` are already in the component from `useFinchConnect`
- **US4 (P3)**: Requires T012 (`useFinchStatus` hook implementation) to have the interval to test

### Parallel Opportunities Within Phases

**Phase 2** (after T002 completes):

- T003 ‖ T004 ‖ T005 (three test files — all independent)
- T008 ‖ T009 (selectors file and store.ts — after T007)

**Phase 3** (after Phase 2 completes):

- T010 ‖ T011 (two different test files for different things)

### Critical Path (single developer, sequential)

```
T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009
  └─→ Tests pass → T010 → T011 → T012 → T013 → T014 → T015 → T016 → T017
        → T018 → T019 → T020
```

---

## Parallel Execution Examples

### Fastest Path (parallelized Phase 2)

```bash
# After T002 completes, launch in parallel:
Task A: T003 — Write getFinchStatus tests in tests/services/finchApi.test.ts
Task B: T004 — Write finchStatusSlice tests in tests/store/finchStatusSlice.test.ts
Task C: T005 — Write finchStatusSelectors tests in tests/store/finchStatusSelectors.test.ts
# → then T006 → T007 → [T008 ‖ T009]
```

### Parallel Phase 3 Tests

```bash
# After Phase 2 completes, begin tests in parallel:
Task A: T010 — useFinchStatus hook tests in tests/hooks/useFinchStatus.test.ts
Task B: T011 — DashboardPage visibility tests in tests/pages/DashboardPage.test.tsx
# → both fail → then T012 → T013 (make them pass)
```

---

## Implementation Strategy

### MVP (User Story 1 Only — ~2 hours)

1. Complete Phase 1 + Phase 2 (foundation)
2. Complete Phase 3 (US1 — hook + dashboard visibility)
3. **STOP and validate**: Choice cards hidden when connected, tabs unaffected
4. Optionally demo/deploy

### Full Delivery (all 4 stories — sequential priority order)

1. Foundation → US1 → US2 → US3 → US4 → Polish
2. Each story independently testable before moving to next
3. No story breaks a previously verified story

---

## Task Summary

| Phase          | Story | Tasks     | Files Touched                                                                                                                                                                                                                      |
| -------------- | ----- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — Setup      | —     | T001      | —                                                                                                                                                                                                                                  |
| 2 — Foundation | —     | T002–T009 | `finchStatusTypes.ts` (NEW), `finchApi.ts` (MOD), `finchStatusSlice.ts` (NEW), `finchStatusSelectors.ts` (NEW), `store.ts` (MOD), `finchApi.test.ts` (MOD), `finchStatusSlice.test.ts` (NEW), `finchStatusSelectors.test.ts` (NEW) |
| 3 — US1 P1     | US1   | T010–T013 | `useFinchStatus.ts` (NEW), `DashboardPage.tsx` (MOD), `useFinchStatus.test.ts` (NEW), `DashboardPage.test.tsx` (MOD)                                                                                                               |
| 4 — US2 P2     | US2   | T014      | `DashboardPage.test.tsx` (MOD)                                                                                                                                                                                                     |
| 5 — US3 P2     | US3   | T015–T016 | `DashboardPage.test.tsx` (MOD), `DashboardPage.tsx` (MOD)                                                                                                                                                                          |
| 6 — US4 P3     | US4   | T017      | `useFinchStatus.test.ts` (MOD)                                                                                                                                                                                                     |
| 7 — Polish     | —     | T018–T020 | all above                                                                                                                                                                                                                          |

**Total**: 20 tasks | 5 NEW source files | 2 MODIFIED source files | 3 NEW test files | 2 MODIFIED test files

### Parallel Opportunities: 3 identified (Phase 2 triple-parallel test writing; Phase 3 dual-parallel test writing; Phase 7 lint+typecheck)

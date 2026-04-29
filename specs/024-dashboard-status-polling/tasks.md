# Tasks: Dashboard Status API Polling

**Input**: Design documents from `/specs/024-dashboard-status-polling/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md, contracts/dashboard-status-api.yaml

**TDD**: Constitution Principle III requires tests written BEFORE implementation. Test tasks in each user story must be authored first and verified failing before implementation tasks begin.

**Organization**: Tasks are grouped by user story so each story is independently implementable and testable.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependency)
- **[Story]**: User story label (US1, US2, US3)
- Every task includes an exact file path

---

## Phase 1: Setup

**Purpose**: Confirm feature docs are present and scope is implementation-ready.

- [x] T001 Verify planning artifacts exist and are current: `specs/024-dashboard-status-polling/plan.md`, `specs/024-dashboard-status-polling/research.md`, `specs/024-dashboard-status-polling/data-model.md`, `specs/024-dashboard-status-polling/quickstart.md`, `specs/024-dashboard-status-polling/contracts/dashboard-status-api.yaml`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create shared API/type/hook scaffolding needed by all stories.

**CRITICAL**: No user story work starts until this phase is complete.

- [x] T002 Create dashboard status types (`StatusValue`, `ProviderType`, `StatusSection`, `DashboardStatusResponse`, hook return/config types) in `src/types/dashboardStatusTypes.ts`
- [x] T003 Add `getDashboardStatus(): Promise<DashboardStatusResponse>` API method in `src/services/api/dashboardApi.ts` targeting `/api/v1/dashboard/status`
- [x] T004 Create hook skeleton with public API (`status`, `isLoading`, `error`, `isPolling`, `start`, `stop`, `reset`) in `src/hooks/useDashboardStatusPolling.ts`

**Checkpoint**: Type contracts compile and hook/API entry points exist.

---

## Phase 3: User Story 1 - Auto-Polling Dashboard Status (Priority: P1) 🎯 MVP

**Goal**: Start polling when `isConnected || assessmentData?.data?.status === "completed"`, continue using backend interval, and stop when `allSettled === true`.

**Independent Test**: With mocked API responses, verify polling starts on trigger, schedules next call by `suggestPollMs`, and stops immediately when `allSettled` is true.

### Tests for User Story 1 (write first)

- [x] T005 [P] [US1] Add hook test: starts polling when enabled true in `tests/hooks/useDashboardStatusPolling.test.tsx`
- [x] T006 [P] [US1] Add hook test: schedules next poll using returned `suggestPollMs` in `tests/hooks/useDashboardStatusPolling.test.tsx`
- [x] T007 [P] [US1] Add hook test: stops polling and clears timer when response has `allSettled: true` in `tests/hooks/useDashboardStatusPolling.test.tsx`
- [x] T008 [US1] Add DashboardPage test: polling enabled when `isConnected === true` in `tests/pages/DashboardPage.test.tsx`
- [x] T009 [US1] Add DashboardPage test: polling enabled when `assessmentData?.data?.status === "completed"` in `tests/pages/DashboardPage.test.tsx`
- [x] T010 [US1] Add DashboardPage test: polling disabled when neither trigger condition is true in `tests/pages/DashboardPage.test.tsx`

### Implementation for User Story 1

- [x] T011 [US1] Implement trigger-driven polling start/stop wiring in `src/hooks/useDashboardStatusPolling.ts` (enabled-based lifecycle + cleanup)
- [x] T012 [US1] Implement recursive timeout scheduler using response-driven `suggestPollMs` in `src/hooks/useDashboardStatusPolling.ts`
- [x] T013 [US1] Implement settle-stop behavior (`allSettled === true` halts cycle and marks non-polling) in `src/hooks/useDashboardStatusPolling.ts`
- [x] T014 [US1] Integrate hook in `src/pages/dashboard/DashboardPage.tsx` with trigger condition `isConnected || assessmentData?.data?.status === "completed"`

**Checkpoint**: US1 fully functional and independently testable.

---

## Phase 4: User Story 2 - Dynamic Poll Interval and Long Delays (Priority: P2)

**Goal**: Use latest `suggestPollMs` every cycle, support hour-level values without max capping, and enforce minimum 1000ms when non-positive.

**Independent Test**: Mock varying intervals (3000 -> 5000 -> 3600000) and verify schedule changes each cycle; for 0/negative values verify 1000ms minimum.

### Tests for User Story 2 (write first)

- [x] T015 [P] [US2] Add hook test: interval updates per response (`suggestPollMs` changes) in `tests/hooks/useDashboardStatusPolling.test.tsx`
- [x] T016 [P] [US2] Add hook test: hour-level interval value is honored (no upper cap) in `tests/hooks/useDashboardStatusPolling.test.tsx`
- [x] T017 [P] [US2] Add hook test: non-positive `suggestPollMs` falls back to 1000ms minimum in `tests/hooks/useDashboardStatusPolling.test.tsx`

### Implementation for User Story 2

- [x] T018 [US2] Implement dynamic interval reassignment from latest successful response in `src/hooks/useDashboardStatusPolling.ts`
- [x] T019 [US2] Implement interval normalization rule (`delayMs = Math.max(1000, suggestPollMs)`, no maximum cap) in `src/hooks/useDashboardStatusPolling.ts`

**Checkpoint**: US2 behavior works independently and does not regress US1.

---

## Phase 5: User Story 3 - Retry Policy and 429 Behavior (Priority: P3)

**Goal**: Retry non-429 errors with 1000/2000/4000ms backoff up to 3 attempts, then stop with error; keep 429 on normal cadence with no special override.

**Independent Test**: Simulate non-429 failures and verify retry sequence then stop/error; simulate 429 and verify no special throttle/backoff mode is applied.

### Tests for User Story 3 (write first)

- [x] T020 [P] [US3] Add hook test: non-429 retry sequence uses 1000/2000/4000ms and then stops with error in `tests/hooks/useDashboardStatusPolling.test.tsx`
- [x] T021 [P] [US3] Add hook test: successful poll resets retry counter after prior failures in `tests/hooks/useDashboardStatusPolling.test.tsx`
- [x] T022 [P] [US3] Add hook test: HTTP 429 follows normal polling cadence (no special mode) in `tests/hooks/useDashboardStatusPolling.test.tsx`

### Implementation for User Story 3

- [x] T023 [US3] Implement non-429 retry counter and backoff scheduler (1000/2000/4000ms) in `src/hooks/useDashboardStatusPolling.ts`
- [x] T024 [US3] Implement max-retry stop and error-state propagation in `src/hooks/useDashboardStatusPolling.ts`
- [x] T025 [US3] Implement explicit 429 handling path as normal cadence (no retry-after special override) in `src/hooks/useDashboardStatusPolling.ts`

**Checkpoint**: US3 behavior works independently and preserves US1/US2.

---

## Final Phase: Polish & Quality Gate

- [x] T026 Run type checks: `pnpm run type-check`
- [ ] T027 [P] Run lint/format: `pnpm lint:fix` then `pnpm format`
- [ ] T028 [P] Run test suite: `pnpm test`
- [ ] T029 Smoke test dashboard flow in `src/pages/dashboard/DashboardPage.tsx`: verify trigger start, dynamic intervals, and stop on settled

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): starts immediately
- Foundational (Phase 2): depends on Phase 1 and blocks all user stories
- User Story phases (Phase 3-5): depend on Phase 2 completion
- Final Phase: depends on completion of selected user stories

### User Story Dependencies

- US1 (P1): depends only on Foundational; delivers MVP polling flow
- US2 (P2): depends on US1 scheduler baseline
- US3 (P3): depends on US1 baseline and error handling scaffolding

### Within Each User Story

- Tests first and failing before implementation tasks
- Hook logic before page wiring (where applicable)
- Story checkpoint before moving to next priority

---

## Parallel Opportunities

- T005, T006, T007 can run in parallel (same test file, independent assertions if coordinated)
- T008 and T009 can run in parallel (same page test file, independent test blocks)
- T015, T016, T017 can run in parallel
- T020, T021, T022 can run in parallel
- T027 and T028 can run in parallel after T026

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 and Phase 2
2. Complete Phase 3 (US1)
3. Validate US1 independently
4. Demo/deploy MVP polling loop

### Incremental Delivery

1. Add US1 (core trigger/start/stop)
2. Add US2 (dynamic + long interval behavior)
3. Add US3 (retry + 429 behavior)
4. Run final quality gate

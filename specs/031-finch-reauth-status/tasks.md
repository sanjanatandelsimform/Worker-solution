# Tasks: Finch Reauth Status Flag

**Input**: Design documents from `/specs/031-finch-reauth-status/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/api-types.md ✅ | quickstart.md ✅

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Type-layer changes that every other task depends on. Must complete before any hook or UI work.

**⚠️ CRITICAL**: All downstream tasks depend on these type definitions being in place.

- [x] T001 Add `FinchConnectionStatus` union type and extend `DashboardStatusResponse` with optional `finchConnectionStatus?: FinchConnectionStatus` field in `src/types/dashboardStatusTypes.ts`
- [x] T002 Add `isReauthRequired: boolean` to `UseDashboardStatusPollingReturn` interface in `src/types/dashboardStatusTypes.ts`
- [x] T003 Add `reconnectWithFinch: () => Promise<void>` to `UseFinchConnectReturn` interface in `src/hooks/useFinchConnect.ts`

**Checkpoint**: TypeScript types compile — `pnpm run type-check` passes with new fields declared (implementations not yet present)

---

## Phase 2: User Story 3 — Status Polling Hook Exposes Reauth Flag (Priority: P2) 🏗️ Foundation for US1

**Goal**: `useDashboardStatusPolling` derives and returns `isReauthRequired: boolean` from `status.finchConnectionStatus`.

**Independent Test**: Render the hook with mocked API response `{ finchConnectionStatus: "reauth_required" }` → `isReauthRequired` is `true`; any other value or absent field → `false`.

### Tests for User Story 3 (write first — must FAIL before T006)

- [x] T004 [P] [US3] Add `describe("useDashboardStatusPolling — isReauthRequired flag")` block in `tests/hooks/useDashboardStatusPolling.test.ts`:
  - Case: disabled hook → `isReauthRequired` is `false`
  - Case: `finchConnectionStatus` absent → `false`
  - Case: `finchConnectionStatus: "reauth_required"` → `true`
  - Case: `finchConnectionStatus: "connected"` → `false`
  - Case: `finchConnectionStatus: "disconnected"` → `false`
  - Case: `finchConnectionStatus: "pending"` → `false`

### Implementation for User Story 3

- [x] T005 [US3] Add `isReauthRequired` `useMemo` in `src/hooks/useDashboardStatusPolling.ts` (after `isAutomatedProvider` memo): `useMemo(() => status?.finchConnectionStatus === "reauth_required", [status])` (depends on T001, T002)
- [x] T006 [US3] Add `isReauthRequired` to the return object of `useDashboardStatusPolling` in `src/hooks/useDashboardStatusPolling.ts` (depends on T005)

**Checkpoint**: `pnpm test tests/hooks/useDashboardStatusPolling.test.ts` — all 6 new cases pass, existing tests still pass

---

## Phase 3: User Story 2 — Reconnect Skips Additional-Questions Redirect (Priority: P1)

**Goal**: `useFinchConnect` exposes `reconnectWithFinch()` which runs the Finch Connect flow but does NOT navigate to `/additional-questions` on success. Existing `connectWithFinch` is unchanged.

**Independent Test**: Render hook, call `reconnectWithFinch()`, simulate SDK `onSuccess` → `mockNavigate` is NOT called. Then call `connectWithFinch()`, simulate `onSuccess` → `mockNavigate("/additional-questions")` IS called.

### Tests for User Story 2 (write first — must FAIL before T009)

- [x] T007 [P] [US2] Add reconnect test cases to `tests/hooks/useFinchConnect.test.tsx`:
  - Case: `reconnectWithFinch` succeeds → `exchangeFinchCode` called, `navigate` NOT called
  - Case: `connectWithFinch` still navigates to `/additional-questions` (no regression)
  - Case: `connectWithFinch` navigates correctly after a prior `reconnectWithFinch` call (ref reset)
  - Case: error during `reconnectWithFinch` resets ref so subsequent `connectWithFinch` still navigates

### Implementation for User Story 2

- [x] T008 [US2] Add `isReconnectRef = useRef(false)` inside `useFinchConnect` hook body in `src/hooks/useFinchConnect.ts` (depends on T003)
- [x] T009 [US2] Update `onSuccess` callback in `src/hooks/useFinchConnect.ts` — replace unconditional `navigate("/additional-questions")` with conditional check + reset ref in both success and error paths (depends on T008):
  ```
  await exchangeFinchCode(code);
  if (!isReconnectRef.current) { navigate("/additional-questions"); }
  isReconnectRef.current = false;
  // in catch: isReconnectRef.current = false; (before existing error handling)
  ```
- [x] T010 [US2] Add `reconnectWithFinch` function in `src/hooks/useFinchConnect.ts` — sets `isReconnectRef.current = true` then delegates to `connectWithFinch` (depends on T009)
- [x] T011 [US2] Add `reconnectWithFinch` to the hook's return object in `src/hooks/useFinchConnect.ts` (depends on T010)

**Checkpoint**: `pnpm test tests/hooks/useFinchConnect.test.tsx` — all 4 new reconnect cases pass, all existing cases still pass

---

## Phase 4: User Story 1 — Dashboard Shows Reconnect Card Conditionally (Priority: P1)

**Goal**: The "Reconnect to Finch" `DashboardCard` renders only when `isReauthRequired` is `true`. Button uses `reconnectWithFinch` instead of `connectWithFinch`.

**Independent Test**: With `finchConnectionStatus: "reauth_required"` mocked in the polling API, the card is visible. With any other value or absent field, the card is hidden.

### Implementation for User Story 1

- [x] T012 [US1] Destructure `reconnectWithFinch` from `useFinchConnect()` call in `src/pages/dashboard/DashboardPage.tsx` (depends on T011)
- [x] T013 [US1] Destructure `isReauthRequired` from `useDashboardStatusPolling()` call in `src/pages/dashboard/DashboardPage.tsx` (depends on T006)
- [x] T014 [US1] Wrap the "Reconnect to Finch" `DashboardCard` (lines ~540–553) with `{isReauthRequired && (...)}` in `src/pages/dashboard/DashboardPage.tsx` (depends on T013)
- [x] T015 [US1] Change the Reconnect card's `onClick` prop from `connectWithFinch` to `reconnectWithFinch` in `src/pages/dashboard/DashboardPage.tsx` (depends on T012, T014)

**Checkpoint**: Dashboard renders without TypeScript errors. Card is absent when `isReauthRequired=false` (default), present when `true`.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T016 [P] Run `pnpm run type-check` — confirm zero TypeScript errors across all modified files
- [x] T017 [P] Run `pnpm lint:fix` then `pnpm format` — confirm no ESLint or Prettier issues
- [x] T018 Run full test suite `pnpm test` — confirm all existing tests still pass alongside new test cases
- [x] T019 Smoke test per quickstart.md verification checklist:
  - Mock API returns `finchConnectionStatus: "reauth_required"` → Reconnect card visible
  - Mock API returns `finchConnectionStatus: "connected"` → card hidden
  - Click Reconnect → Finch SDK opens → success → user stays on dashboard (no redirect)
  - Click "Start with Finch" (initial connect) → success → redirects to `/additional-questions`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: No dependencies — start immediately
- **Phase 2 (US3)**: Depends on Phase 1 (T001, T002)
- **Phase 3 (US2)**: Depends on Phase 1 (T003); can run in parallel with Phase 2
- **Phase 4 (US1)**: Depends on Phase 2 (T006) and Phase 3 (T011)
- **Phase 5 (Polish)**: Depends on all prior phases complete

### User Story Dependencies

- **US3 (P2)**: Depends on Phase 1 only
- **US2 (P1)**: Depends on Phase 1 only — can start in parallel with US3
- **US1 (P1)**: Depends on both US3 and US2 being complete (needs `isReauthRequired` + `reconnectWithFinch`)

### Within Each User Story

- Tests (T004, T007) MUST be written first and FAIL before implementation begins
- Type changes (Phase 1) before all implementations
- Hook implementations before page consumption

### Parallel Opportunities

- **T004 and T007** — test tasks for US3 and US2 can be written in parallel (different files)
- **T001–T003** — all Phase 1 type changes are in the same file; execute sequentially
- **Phase 2 and Phase 3** — US3 and US2 hook work can proceed in parallel after Phase 1
- **T012 and T013** — destructuring both values in DashboardPage can be done in a single edit

---

## Parallel Example: US2 + US3 (after Phase 1 complete)

```
Phase 1 complete
      │
      ├──► US3: T004 (write tests) → T005 → T006
      │
      └──► US2: T007 (write tests) → T008 → T009 → T010 → T011
```

Both US3 and US2 work on different files (`useDashboardStatusPolling.ts` vs `useFinchConnect.ts`) and can be developed simultaneously.

---

## Implementation Strategy

**MVP Scope**: Phase 1 + Phase 2 (US3) alone delivers a testable `isReauthRequired` flag with full test coverage — a releasable hook-layer increment.

**Full Delivery**: Phase 1 + 2 + 3 + 4 delivers the complete user-visible feature (conditional card + correct reconnect behavior).

**Total tasks**: 19 (3 foundational + 3 US3 + 5 US2 + 4 US1 + 4 polish)  
**Parallelizable**: T004/T007, Phase 2/Phase 3, T016/T017  
**Files modified**: 4 source files + 2 test files — no new files created

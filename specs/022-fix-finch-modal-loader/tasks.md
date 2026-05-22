# Tasks: Fix Finch Modal Loading State

**Input**: Design documents from `/specs/022-fix-finch-modal-loader/`  
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**TDD**: Constitution Principle III requires tests written BEFORE implementation. Tests in Phase 3–5 MUST be written and confirmed to fail before the corresponding implementation tasks are executed.

**Organization**: Tasks grouped by user story for independent delivery.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (independent files / no shared dependency)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Each description includes the exact file path

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Type-level contract change that all three user stories depend on. Must complete before any user story work begins.

**⚠️ CRITICAL**: All user story tasks BLOCK on this phase.

- [x] T001 Update `UseFinchConnectReturn` interface — add `isPageLoading: boolean` field after `isLoading: boolean` in `src/hooks/useFinchConnect.ts`

**Checkpoint**: Interface compiled with no errors (`pnpm run type-check`). No runtime behaviour changes yet.

---

## Phase 3: User Story 1 — No Spinner While Finch Modal Is Open (Priority: P1) 🎯 MVP

**Goal**: The full-screen `<LoadingSpinner>` is NOT visible while the Finch Connect modal is open. The spinner appears only during the pre-modal (session-fetch) and post-modal (code-exchange) server round-trips. The "Start with Finch" button remains disabled for the entire flow.

**Independent Test**: Can be fully verified by clicking "Start with Finch" on the Dashboard: spinner shows briefly, then disappears when the Finch modal appears, then reappears when the modal closes and the app processes the result.

### Tests for User Story 1 ⚠️ Write FIRST — ensure they FAIL before T005

- [x] T002 [US1] Add `isPageLoading: false` to the default `mockUseFinchConnect` factory object in `tests/pages/DashboardPage.test.tsx`
- [x] T003 [P] [US1] Write hook test T017c — assert `isPageLoading` is `false` when the Finch modal is open (`connecting` phase) while `isLoading` remains `true` in `tests/hooks/useFinchConnect.test.tsx`
- [x] T004 [US1] Write Dashboard test T018 — assert no full-screen spinner is rendered when mock returns `{ isLoading: true, isPageLoading: false }` (simulating modal-open state) in `tests/pages/DashboardPage.test.tsx`

### Implementation for User Story 1

- [x] T005 [US1] Add `isPageLoading` derivation — `const isPageLoading = status === "fetching-session" || status === "exchanging-code";` — immediately after the `isLoading` derivation line in `src/hooks/useFinchConnect.ts`
- [x] T006 [US1] Include `isPageLoading` in the hook's return object in `src/hooks/useFinchConnect.ts`
- [x] T007 [US1] Destructure `isPageLoading: isFinchPageLoading` from `useFinchConnect()` in `src/pages/dashboard/DashboardPage.tsx`
- [x] T008 [US1] Replace `isFinchLoading` with `isFinchPageLoading` in the early-return spinner guard (`if (isLoadingAssessment || isFinchPageLoading)`) in `src/pages/dashboard/DashboardPage.tsx`

**Checkpoint**: T003 and T004 now pass. The Dashboard renders normally with the Finch modal open. The `isDisabled={isFinchLoading}` prop on the "Start with Finch" button is unchanged and still uses `isFinchLoading`.

---

## Phase 4: User Story 2 — Spinner Still Shows During Session Fetch (Priority: P2)

**Goal**: The full-screen spinner appears immediately when the user clicks "Start with Finch" and remains visible while the app fetches the session token from the backend.

**Independent Test**: Simulate a slow or pending `getFinchSessionId` response and confirm `isPageLoading` is `true` during that window.

### Tests for User Story 2 ⚠️ Write FIRST — ensure they FAIL before T005 (if not already implemented)

- [x] T009 [P] [US2] Write hook test T017a — assert `isPageLoading` is `false` on initial render in `tests/hooks/useFinchConnect.test.tsx`
- [x] T010 [P] [US2] Write hook test T017b — assert `isPageLoading` is `true` immediately after `connectWithFinch()` is called (while `getFinchSessionId` is pending/unresolved) in `tests/hooks/useFinchConnect.test.tsx`

**Checkpoint**: T009 and T010 pass with the implementation from Phase 3 (T005–T006). No additional implementation changes needed for this story.

---

## Phase 5: User Story 3 — Spinner Shows During Code Exchange (Priority: P3)

**Goal**: After the user completes authentication in the Finch modal, the full-screen spinner reappears while the app exchanges the authorization code with the backend.

**Independent Test**: Hold `exchangeFinchCode` unresolved and confirm `isPageLoading` becomes `true` after `onSuccess` fires.

### Tests for User Story 3 ⚠️ Write FIRST — ensure they FAIL before T005 (if not already implemented)

- [x] T011 [US3] Write hook test T017d — assert `isPageLoading` is `true` during the `exchanging-code` phase (hold `exchangeFinchCode` unresolved, trigger `onSuccess` callback, then verify `isPageLoading === true`) in `tests/hooks/useFinchConnect.test.tsx`

**Checkpoint**: T011 passes with the implementation from Phase 3. No additional implementation changes needed for this story.

---

## Final Phase: Polish & Quality Gate

**Purpose**: Validate the complete change set before opening a PR.

- [x] T012 Run `pnpm run type-check` and fix any TypeScript errors — verify zero errors with new `isPageLoading` field in `UseFinchConnectReturn`
- [x] T013 [P] Run `pnpm lint:fix` then `pnpm format` — confirm no linting or formatting violations remain
- [x] T014 [P] Run `pnpm test` — confirm all 5 new tests pass (T017a–T017d, T018) and all existing tests (T009–T016, T017, and all other suites) continue to pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — start immediately. BLOCKS all user story phases.
- **User Story 1 (Phase 3)**: Depends on Phase 2 (T001 interface change). P1 — highest priority.
- **User Story 2 (Phase 4)**: Depends on Phase 2. T009–T010 pass automatically once T005–T006 (Phase 3 implementation) are done; no separate implementation needed.
- **User Story 3 (Phase 5)**: Depends on Phase 2. T011 passes automatically once T005–T006 are done; no separate implementation needed.
- **Polish (Final Phase)**: Depends on all phases complete.

### User Story Dependencies

- **US1**: Foundational complete → write T002–T004 (tests) → implement T005–T008
- **US2**: Foundational + US1 implementation complete → write T009–T010 (tests only — they pass with US1's implementation)
- **US3**: Foundational + US1 implementation complete → write T011 (test only — it passes with US1's implementation)

### Within User Story 1

- T002 must complete before T004 (Dashboard test uses the updated mock default)
- T003 can run in parallel with T002 (different files)
- T005–T006 must complete before T007–T008 (Dashboard needs the new return field)
- T007 must complete before T008 (must destructure before using in guard)
- All tests (T002–T004) MUST be written and confirmed to FAIL before T005 is started

---

## Parallel Opportunities

### User Story 1 Test Phase (after T001)

```
T002 (DashboardPage.test.tsx — update mock default)
T003 (useFinchConnect.test.tsx — test T017c)          ← parallel to T002
     └─ T004 (DashboardPage.test.tsx — test T018)    ← after T002
```

### User Story 2 Tests (after T005–T006)

```
T009 (useFinchConnect.test.tsx — test T017a)   ← parallel
T010 (useFinchConnect.test.tsx — test T017b)   ← parallel
```

### Polish Phase

```
T012 (type-check)       ← sequential first
T013 (lint + format)    ← parallel with T014 after T012
T014 (test run)         ← parallel with T013 after T012
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2 (T001 — interface update)
2. Write tests T002–T004 — confirm they fail
3. Implement T005–T008 — all 3 tests now pass
4. **STOP and VALIDATE**: Run `pnpm test` — spinner no longer shows behind Finch modal
5. Open PR — this alone resolves the reported bug

### Incremental Delivery

1. Phase 2 + Phase 3 → Bug fixed, MVP deliverable
2. Phase 4 → Adds regression coverage for session-fetch loading (no code change needed)
3. Phase 5 → Adds regression coverage for code-exchange loading (no code change needed)
4. Final Phase → Quality gate passes

---

## Summary

| Metric                 | Value                                                    |
| ---------------------- | -------------------------------------------------------- |
| Total tasks            | 14                                                       |
| Phase 2 (Foundational) | 1 task                                                   |
| Phase 3 — US1 (P1)     | 7 tasks (3 tests + 4 implementation)                     |
| Phase 4 — US2 (P2)     | 2 tasks (tests only)                                     |
| Phase 5 — US3 (P3)     | 1 task (test only)                                       |
| Final Phase            | 3 tasks                                                  |
| New tests              | 5 (T017a–T017d, T018)                                    |
| Source files changed   | 2 (`useFinchConnect.ts`, `DashboardPage.tsx`)            |
| Test files changed     | 2 (`useFinchConnect.test.tsx`, `DashboardPage.test.tsx`) |
| New files created      | 0                                                        |
| Parallel opportunities | 3 (T003 ∥ T002; T009 ∥ T010; T013 ∥ T014)                |

**Suggested MVP**: Complete Phase 2 + Phase 3 only (T001–T008). This is the full bug fix with all acceptance criteria met.

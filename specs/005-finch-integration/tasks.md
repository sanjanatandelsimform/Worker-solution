# Tasks: Finch Integration

**Input**: Design documents from `/specs/005-finch-integration/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: Included — explicitly required by FR-014 and FR-015 in spec.md. Follow TDD: write tests first, confirm they fail, then implement.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Maps to user story (US1 = Dashboard flow, US2 = Get More flow, US3 = Stub API contracts)

---

## Phase 1: Setup

**Purpose**: Install dependencies and add the toast provider — prerequisite for all other work.

- [x] T001 Install `@tryfinch/react-connect` via `pnpm add @tryfinch/react-connect`
- [x] T002 Add `sonner` toast component via `pnpm dlx shadcn@latest add sonner` (creates `src/components/ui/sonner.tsx`)
- [x] T003 Add `<Toaster />` from `@/components/ui/sonner` to `src/App.tsx` (or root layout) so toasts render globally

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Type definitions and stub service file must exist before the hook or any tests can be written.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 [P] Create TypeScript interfaces (`FinchSessionResponse`, `FinchConnectResponse`, `FinchSuccessEvent`, `FinchErrorEvent`, `UseFinchConnectReturn`, `FinchConnectStatus`) in `src/services/api/finchApi.ts` — types only, no logic yet
- [x] T005 [P] Write unit tests for `getFinchSessionId` stub (happy path returns `{ sessionId: 'stub-session-id-001' }`) in `tests/services/finchApi.test.ts` — **must FAIL before T006**
- [x] T006 Implement `getFinchSessionId()` stub in `src/services/api/finchApi.ts` (depends on T004, T005 failing)
- [x] T007 [P] Write unit tests for `exchangeFinchCode` stub (happy path returns `{ success: true }`) in `tests/services/finchApi.test.ts` — **must FAIL before T008**
- [x] T008 Implement `exchangeFinchCode(code: string)` stub in `src/services/api/finchApi.ts` (depends on T004, T007 failing)

**Checkpoint**: `pnpm test tests/services/finchApi.test.ts` passes — stub services ready for hook consumption.

---

## Phase 3: User Story 1 — Start Finch Connect from Dashboard (Priority: P1) 🎯 MVP

**Goal**: A logged-in user on `/dashboard` clicks "Start with Finch", the Finch Connect overlay opens, and on success the user is redirected to `/additional-questions`. All error paths show toast notifications.

**Independent Test**: Navigate to `/dashboard`, click "Start with Finch", stub `getFinchSessionId` to resolve and mock `useFinchConnect` SDK hook's `open()` to fire `onSuccess({ code: 'test-code' })`, assert `exchangeFinchCode` is called with `'test-code'`, and assert route changes to `/additional-questions`.

### Tests for User Story 1 ⚠️ Write FIRST — confirm they FAIL before implementing

- [x] T009 [P] [US1] Write hook test: happy path — `connectWithFinch()` calls `getFinchSessionId`, calls SDK `open({ sessionId })`, then on `onSuccess` calls `exchangeFinchCode(code)` and navigates to `/additional-questions` in `tests/hooks/useFinchConnect.test.tsx`
- [x] T010 [P] [US1] Write hook test: `isLoading` is `true` during `fetching-session` and `exchanging-code` states, `false` at idle in `tests/hooks/useFinchConnect.test.tsx`
- [x] T011 [P] [US1] Write hook test: session ID fetch failure → calls `toast.error(...)` and resets `status` to `'idle'` in `tests/hooks/useFinchConnect.test.tsx`
- [x] T012 [P] [US1] Write hook test: Finch `onError` callback → calls `toast.error(...)` and resets `status` to `'idle'` in `tests/hooks/useFinchConnect.test.tsx`
- [x] T013 [P] [US1] Write hook test: Finch `onClose` callback → resets `status` to `'idle'` with **no** toast in `tests/hooks/useFinchConnect.test.tsx`
- [x] T014 [P] [US1] Write hook test: code-exchange failure → calls `toast.error(...)` and resets `status` to `'idle'` without navigating in `tests/hooks/useFinchConnect.test.tsx`
- [x] T015 [P] [US1] Write hook test: empty/falsy `code` in `onSuccess` → calls `toast.error(...)`, does NOT call `exchangeFinchCode`, resets to `'idle'` in `tests/hooks/useFinchConnect.test.tsx`
- [x] T016 [P] [US1] Write hook test: concurrent call guard — calling `connectWithFinch()` while `isLoading === true` is a no-op in `tests/hooks/useFinchConnect.test.tsx`
- [x] T017 [P] [US1] Write Dashboard page test: "Start with Finch" button is disabled when `isLoading === true` in `tests/pages/DashboardPage.test.tsx`
- [x] T018 [P] [US1] Write Dashboard page test: clicking "Start with Finch" calls `connectWithFinch()` in `tests/pages/DashboardPage.test.tsx`

### Implementation for User Story 1

- [x] T019 [US1] Implement `useFinchConnect` hook in `src/hooks/useFinchConnect.ts`
- [x] T020 [US1] Update `src/pages/dashboard/DashboardPage.tsx`

**Checkpoint**: `pnpm test tests/hooks/useFinchConnect.test.ts tests/pages/DashboardPage.test.tsx` passes. Smoke test `/dashboard` — click "Start with Finch" and verify the flow.

---

## Phase 4: User Story 2 — Start Finch Connect from Get More Page (Priority: P2)

**Goal**: A logged-in user on `/get-more` with the Finch plan selected clicks "Let's get started" and the same Finch Connect flow is triggered. Manual Entry path remains unchanged (navigates to `/assessment`).

**Independent Test**: Navigate to `/get-more`, confirm Finch plan selected (default), click "Let's get started", assert `connectWithFinch()` is called. Also assert that selecting Manual Entry and clicking "Let's get started" still navigates directly to `/assessment`.

### Tests for User Story 2 ⚠️ Write FIRST — confirm they FAIL before implementing

- [x] T021 [P] [US2] Write Get More page test: with Finch plan selected, clicking "Let's get started" calls `connectWithFinch()` (not `navigate('/additional-questions')` directly) in `tests/pages/GetMore.test.tsx`
- [x] T022 [P] [US2] Write Get More page test: with Manual Entry plan selected, clicking "Let's get started" navigates to `/assessment` without calling `connectWithFinch()` in `tests/pages/GetMore.test.tsx`
- [x] T023 [P] [US2] Write Get More page test: "Let's get started" button is disabled when `isLoading === true` (Finch plan selected) in `tests/pages/GetMore.test.tsx`

### Implementation for User Story 2

- [x] T024 [US2] Update `src/pages/getMore/GetMore.tsx` — import and call `useFinchConnect()`; replace `navigate('/additional-questions')` in `handleGetStarted`'s Finch branch with `void connectWithFinch(); return;`; add `disabled={selectedPlan === 'finch' && isFinchLoading}` to "Let's get started" button (depends on T021–T023 failing, T019 done)

**Checkpoint**: `pnpm test tests/pages/GetMore.test.tsx` passes. Smoke test `/get-more` — both Finch and Manual Entry paths work correctly.

---

## Phase 5: User Story 3 — Stub API Contracts (Priority: P3)

**Goal**: Both stub service functions resolve with the correct typed shapes and are verified to be independently replaceable with real API calls.

**Independent Test**: Call `getFinchSessionId()` and `exchangeFinchCode('test-code')` directly in unit tests; assert return shapes match interfaces. Verify test passes with stub bodies and would still pass with real API bodies returning the same shapes.

### Tests for User Story 3 ⚠️ Already written as part of Phase 2 (T005, T007)

No additional tests needed — stub contract tests were created in the Foundational phase to unblock the hook. Add additional edge-case tests if desired:

- [x] T025 [P] [US3] Write unit test: `exchangeFinchCode` is called with the `code` argument in `tests/services/finchApi.test.ts`
- [x] T026 [US3] Verify `src/services/api/finchApi.ts` has clear `TODO` comments on both stub function bodies

**Checkpoint**: `pnpm test tests/services/finchApi.test.ts` all pass. Confirm that replacing stub bodies with real `apiClient.post(...)` calls requires zero changes to `src/hooks/useFinchConnect.ts` or any page component.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality gate, type safety, and final validation.

- [x] T027 [P] Run `pnpm run type-check` — resolve any TypeScript errors introduced by new files
- [x] T028 [P] Run `pnpm lint:fix` then `pnpm format` — ensure all new files pass ESLint + Prettier
- [x] T029 Run `pnpm test` (full suite) — confirm zero regressions across the entire test suite
- [x] T030 Smoke test end-to-end per `specs/005-finch-integration/quickstart.md` verification checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (needs `sonner` available for `toast` import in hook tests)
- **US1 (Phase 3)**: Depends on Phase 2 (hook consumes stub services and sonner)
- **US2 (Phase 4)**: Depends on Phase 2 + T019 (hook must exist before page uses it)
- **US3 (Phase 5)**: Already partially covered by Phase 2; only T025–T026 remain, can run in parallel with Phase 4
- **Polish (Phase 6)**: Depends on all story phases complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — no dependency on US2 or US3
- **US2 (P2)**: Can start after T019 (hook) is complete — reuses the hook from US1
- **US3 (P3)**: Largely complete after Foundational; T025–T026 are independent

### Within Each User Story

1. Write ALL tests for the story first (marked `⚠️ Write FIRST`)
2. Confirm every test FAILS (Red)
3. Implement the feature (Green)
4. Run full story tests to confirm passing
5. Commit the story as a logical unit

### Parallel Opportunities

- T004 + T005 + T007 can all start simultaneously after Phase 1 (different concerns)
- T009–T018 (all US1 hook + Dashboard tests) can be written in parallel — all are test files
- T021–T023 (US2 Get More tests) can be written in parallel with T019–T020 (US1 implementation) once T019 is underway
- T025–T026 (US3) can run in parallel with Phase 4

---

## Parallel Example: User Story 1 Tests

```bash
# All of these test files can be authored simultaneously
Task T009: hook happy path
Task T010: isLoading state transitions
Task T011: session fetch failure path
Task T012: onError callback path
Task T013: onClose callback path
Task T014: code-exchange failure path
Task T015: empty code guard
Task T016: concurrent call guard
Task T017: Dashboard button disabled
Task T018: Dashboard button calls connectWithFinch
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T008)
3. Complete Phase 3: User Story 1 (T009–T020)
4. **STOP and VALIDATE**: Full smoke test on `/dashboard`
5. Deploy/demo — Finch flow is live from Dashboard

### Incremental Delivery

1. Phase 1 + 2 → foundation ready
2. Phase 3 (US1) → Dashboard Finch flow live ✅ **MVP**
3. Phase 4 (US2) → Get More Finch flow live ✅
4. Phase 5 (US3) → Stub contracts documented and verified ✅
5. Phase 6 → Quality gate cleared ✅

### Stub-to-Real API Swap (Future)

When the backend is ready, open `src/services/api/finchApi.ts` and replace the two stub function bodies as described in `specs/005-finch-integration/quickstart.md`. Zero changes required in `src/hooks/useFinchConnect.ts` or any page component.

---

## Notes

- [P] tasks = operate on different files with no incomplete dependencies — safe to parallelise
- [US1/US2/US3] labels map each task to its user story for traceability
- TDD is non-negotiable (Constitution Principle III) — every test must be red before the implementation task begins
- Commit after each checkpoint (end of Phase 2, end of each story phase) for clean rollback points
- `pnpm run type-check` must pass at all times — do not leave TypeScript errors between tasks

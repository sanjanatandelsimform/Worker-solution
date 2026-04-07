# Tasks: Finch Connect — Remove Get-More Page & Real API Integration

**Input**: Design documents from `/specs/005-finch-integration/`
**Prerequisites**: plan-finch-api-integration.md ✅, spec-finch-api-integration.md ✅, research-finch-api-integration.md ✅, data-model-finch-api-integration.md ✅, contracts/finch-connect-session.md ✅, contracts/finch-callback.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to
- All paths are relative to repository root

---

## Phase 1: Setup

**Purpose**: Confirm baseline state before any changes are made.

- [x] T001 Run `pnpm run type-check` on the current codebase and confirm it passes with zero errors (establishes clean baseline)
- [x] T002 Run `pnpm vitest run` and note all currently passing tests (establishes test baseline to protect)

---

## Phase 2: User Story 1 — Real API Integration (Priority: P1) 🎯 MVP

**Goal**: Replace the two stub functions in `finchApi.ts` with real `apiClient` HTTP calls, update the TypeScript types to reflect the actual response contracts, and fix the three hook fallback error strings to match FR-014. Update all tests that mock the service layer to use the new response shapes and assert real endpoint/payload behaviour.

**Independent Test**: With mocks in place simulating the real backend contracts (from `contracts/finch-connect-session.md` and `contracts/finch-callback.md`), click "Start with Finch" on `/dashboard` and verify the correct endpoints are called, the overlay opens, and on success the user navigates to `/additional-questions`. All `useFinchConnect.test.tsx` and `finchApi.test.ts` tests must pass.

### Implementation for User Story 1

- [x] T003 [US1] Add `apiClient` default import from `@/services/api/authApi` and `axios` named import to `src/services/api/finchApi.ts`; add module-level constants `SESSION_ERROR_MSG = "Failed to start Finch Connect. Please try again."` and `CALLBACK_ERROR_MSG = "Failed to complete Finch connection. Please try again."`
- [x] T004 [US1] Replace `FinchSessionResponse` interface (add `connectUrl: string` field) and add new `FinchSessionApiResponse` envelope interface in `src/services/api/finchApi.ts`
- [x] T005 [US1] Replace `FinchConnectResponse` interface (drop `success: boolean`; add `connectionId`, `connectionStatus`, `providerId`, `syncJobId`, `syncJobStatus` fields) and add new `FinchCallbackApiResponse` envelope interface in `src/services/api/finchApi.ts`
- [x] T006 [US1] Replace `getFinchSessionId()` stub body with real `apiClient.post<FinchSessionApiResponse>('/finch/connect-session')` call, validate `response.data.status` and `response.data.data.sessionId`, throw `Error(response.data.message || SESSION_ERROR_MSG)` on failure, return `response.data.data` on success — in `src/services/api/finchApi.ts`
- [x] T007 [US1] Replace `exchangeFinchCode()` stub body with real `apiClient.post<FinchCallbackApiResponse>('/finch/callback', { code })` call, validate `response.data.status`, throw `Error(response.data.message || CALLBACK_ERROR_MSG)` on failure, return `response.data.data` on success — in `src/services/api/finchApi.ts`
- [x] T008 [P] [US1] Update the three fallback error strings in `src/hooks/useFinchConnect.ts`: (a) empty-`code` guard in `onSuccess` → `"Failed to complete Finch connection. Please try again."`, (b) `onError` fallback → `"Failed to complete Finch connection. Please try again."`, (c) `connectWithFinch` catch block → `"Failed to start Finch Connect. Please try again."`; verify catch block propagates `error.message` before falling back
- [x] T009 [US1] Rewrite `tests/services/finchApi.test.ts`: mock `apiClient` (imported from `authApi`), replace stub-value assertions with assertions that `apiClient.post` was called with the correct endpoint (`/finch/connect-session` and `/finch/callback`), the correct payload (no body for session; `{ code }` for callback), and returns the real response shape; add tests for `status: false` path (should throw) and missing `sessionId` path (should throw)
- [x] T010 [P] [US1] Update `tests/hooks/useFinchConnect.test.tsx`: change `mockGetFinchSessionId.mockResolvedValue` to return `{ sessionId: "sess_abc123", connectUrl: "https://connect.tryfinch.com/authorize/sess_abc123" }`; change `mockExchangeFinchCode.mockResolvedValue` to return `{ connectionId: "conn-uuid-123", connectionStatus: "connected", providerId: "gusto", syncJobId: "sync-uuid-456", syncJobStatus: "pending" }`; update error string assertions in T011 and T014 to match the new fixed fallback strings

**Checkpoint**: `pnpm vitest run tests/hooks/useFinchConnect.test.tsx tests/services/finchApi.test.ts` — all tests must pass. `pnpm run type-check` must pass.

---

## Phase 3: User Story 2 — Remove Finch from /get-more & Fix Navigation (Priority: P1)

**Goal**: Remove all Finch-related code (import, hook instantiation, trigger, loading prop) from `GetMore.tsx`. Update `AdditionalQuestions.tsx` to navigate to `/dashboard` instead of `/get-more`. Delete Finch-specific test cases from `GetMore.test.tsx` and clean up the orphaned mock setup.

**Independent Test**: Navigate to `/get-more` and confirm no Finch Connect UI, hook invocation, or session request occurs. Navigate in app to where `navigate("/get-more")` was called (inside `AdditionalQuestions.tsx`) and confirm it now routes to `/dashboard`. The Dashboard Finch flow (US1) must be unaffected. `GetMore.test.tsx` T022 (Manual Entry) must pass.

### Implementation for User Story 2

- [x] T011 [P] [US2] Remove from `src/pages/getMore/GetMore.tsx`: (a) `import { useFinchConnect } from "@/hooks/useFinchConnect"`, (b) `const { connectWithFinch, isLoading: isFinchLoading } = useFinchConnect()`, (c) the `connectWithFinch()` call in the Finch plan branch of the submit handler, (d) `isFinchLoading` usage on the button's disabled/loading prop; leave all other page content and the Manual Entry branch unchanged
- [x] T012 [P] [US2] Update `src/pages/additionalQuestions/AdditionalQuestions.tsx`: change `navigate("/get-more")` to `navigate("/dashboard")` (line 218)
- [x] T013 [US2] Update `tests/pages/GetMore.test.tsx`: (a) delete the T021 `it(...)` block ("clicking 'Let's Get Started' with Finch plan calls connectWithFinch"), (b) delete the T023 `it(...)` block ("'Let's Get Started' button has data-disabled when Finch plan is loading"), (c) remove `mockConnectWithFinch`, `mockUseFinchConnect`, and the `vi.mock("@/hooks/useFinchConnect", ...)` block, (d) remove `mockUseFinchConnect.mockReturnValue(...)` from `beforeEach`; retain T022 (Manual Entry navigation) unchanged

**Checkpoint**: `pnpm vitest run tests/pages/GetMore.test.tsx` — only T022 remains and passes. `pnpm run type-check` must pass. Visiting `/get-more` renders without errors and contains no Finch trigger.

---

## Final Phase: Polish & Quality Gate

**Purpose**: Ensure the full codebase is consistent, typed, linted, and all tests pass before the PR is ready.

- [x] T014 Run `pnpm run type-check` — must exit with zero errors across all changed files
- [x] T015 [P] Run `pnpm lint:fix` then `pnpm format` — auto-fix any lint or formatting issues introduced by the edits
- [x] T016 Run `pnpm vitest run` — full test suite must pass with no regressions; confirm T021 and T023 no longer exist in the output

---

## Dependencies (Story Completion Order)

```
T001 ──► T002 (baseline established)
           │
           ├──► T003 → T004 → T005 → T006 → T007  [US1 service layer — sequential within finchApi.ts]
           │         └──── T008 [P] [US1 hook strings — parallel, different file]
           │
           ├──► T009 → T010 [US1 tests — sequential; T009 after T006/T007; T010 parallel with T009]
           │
           ├──► T011 [P] [US2 GetMore.tsx — independent of US1]
           ├──► T012 [P] [US2 AdditionalQuestions.tsx — independent of US1 and T011]
           └──► T013 [US2 GetMore.test.tsx — after T011]
                      │
                      └──► T014 → T015 [P] → T016  [Polish — after all implementation]
```

---

## Parallel Execution Opportunities

### US1 — within Story 1

| Group A (sequential in finchApi.ts) | Group B (parallel, different file)      |
| ----------------------------------- | --------------------------------------- |
| T003 → T004 → T005 → T006 → T007    | T008 (useFinchConnect.ts error strings) |

Once Group A is done: T009 (finchApi.test.ts) and T010 (useFinchConnect.test.tsx) can run in parallel.

### US1 + US2 — cross-story

US2 tasks (T011, T012, T013) are fully independent of US1 tasks. Both stories can be worked simultaneously by different agents on different files:

| Agent 1 (US1) | Agent 2 (US2)    |
| ------------- | ---------------- |
| T003–T010     | T011, T012, T013 |

---

## Implementation Strategy

**MVP scope**: Both US1 and US2 are P1 — implement both before declaring the feature done. Neither depends on the other for its core functionality; they share only the final quality gate.

**Recommended order for a single developer**:

1. T001–T002 (baseline check)
2. T003–T007 (finchApi.ts — the core change; sequential)
3. T008 (hook strings — quick, 3-line change)
4. T009–T010 (update tests for finchApi.ts and the hook in parallel)
5. T011–T013 (GetMore cleanup — fast, minimal code removal)
6. T014–T016 (quality gate)

**Total estimated files changed**: 5 (`finchApi.ts`, `useFinchConnect.ts`, `GetMore.tsx`, `AdditionalQuestions.tsx`, `GetMore.test.tsx`, `finchApi.test.ts`, `useFinchConnect.test.tsx`) — all modifications, zero new files.

---

## Format Validation

All tasks follow the mandatory checklist format:

- ✅ Every task starts with `- [ ]`
- ✅ Every task has a sequential Task ID (T001–T016)
- ✅ `[P]` marker present only on tasks with no dependency on incomplete tasks
- ✅ `[US1]` / `[US2]` labels present on all user story phase tasks
- ✅ Every task includes an exact file path
- ✅ Setup and Polish phase tasks have no story label (correct per spec)

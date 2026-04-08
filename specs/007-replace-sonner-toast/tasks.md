# Tasks: Replace Sonner Toast with ErrorMessage Component in Finch Feature

**Input**: Design documents from `/specs/007-replace-sonner-toast/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/README.md ✅ (no API changes), quickstart.md ✅

**Tests**: Included — Constitution Principle III (TDD) is NON-NEGOTIABLE for this project.
Existing tests that mock Sonner MUST be updated to assert `error` state BEFORE the hook implementation is changed (Red-Green-Refactor cycle).

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story (US1/US2) — required for user story phase tasks only
- No Story label for Setup or Foundational tasks

---

## Phase 1: Setup

**Purpose**: Confirm branch is active and the baseline is clean before any changes are made.

- [x] T001 Confirm branch `007-replace-sonner-toast` is active and `pnpm run type-check` + `pnpm test` both pass with zero errors on the unmodified baseline

**Checkpoint**: Baseline green — Phase 2 can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Refactor `useFinchConnect.ts` — the shared pivot point of this entire feature. Exposes `error` and `clearError` (US1 requires them), removes the `sonner` import (US2 requires it). Both user stories are blocked until this phase is complete.

**⚠️ CRITICAL**: TDD Red-Green order: update tests FIRST (T002), watch them fail, then implement (T003).

- [x] T002 Refactor `tests/hooks/useFinchConnect.test.tsx` — (TDD Red) remove `vi.mock("sonner", ...)` block and `mockToastError` variable + resets; replace all `expect(mockToastError).toHaveBeenCalledWith(...)` assertions with `expect(result.current.error).toBe(...)` equivalents; add two new test cases: (a) `error` is `null` after `clearError()` is called, (b) `error` is cleared to `null` when a new `connectWithFinch()` call begins (see quickstart.md Step 1 for exact code)
- [x] T003 Implement `src/hooks/useFinchConnect.ts` — (TDD Green) (a) delete `import { toast } from "sonner"`, (b) add `const [error, setError] = useState<string | null>(null)` alongside existing `status` state, (c) add `const clearError = useCallback(() => setError(null), [])`, (d) add `setError(null)` as the first statement inside `connectWithFinch` (before `setStatus("fetching-session")`), (e) replace all four `toast.error(message)` calls with `setError(message)`, (f) delete the `console.log("Error in connectWithFinch:", e)` line, (g) update `UseFinchConnectReturn` interface to add `error: string | null` and `clearError: () => void`, (h) include `error` and `clearError` in the return object

**Checkpoint**: `tests/hooks/useFinchConnect.test.tsx` fully green. `pnpm run type-check` reports zero errors on the hook file.

---

## Phase 3: User Story 1 — Finch Connection Error Displayed Inline (Priority: P1) 🎯 MVP

**Goal**: When any of the four Finch connection error paths fires, an inline `<ErrorMessage />` banner appears inside the Dashboard page's Finch connect section(s) — no floating Sonner toast.

**Independent Test**: In `DashboardPage.test.tsx`, mock `useFinchConnect` to return `error: "Failed to start Finch Connect. Please try again."`. Assert `screen.getByTestId("error-message")` is present and contains the expected text. Mock `error: null` and assert no `error-message` testid present.

### Tests for User Story 1 ⚠️ Write FIRST — must FAIL before T005

- [x] T004 [US1] Update `tests/pages/DashboardPage.test.tsx` — (TDD Red) (a) add `error: null` and `clearError: mockClearFinchError` (new `vi.fn()`) to all existing `mockUseFinchConnect.mockReturnValue({...})` calls in `beforeEach` and individual tests; (b) add a new `describe("DashboardPage — Finch error display")` block with two test cases: one verifying `data-testid="error-message"` renders with the error string when `error` is set to `"Failed to start Finch Connect. Please try again."`, one verifying no `data-testid="error-message"` when `error` is `null` (see quickstart.md Step 2 for exact code)

### Implementation for User Story 1

- [x] T005 [US1] Update `src/pages/dashboard/DashboardPage.tsx` — (a) destructure `error: finchError` and `clearError: clearFinchError` alongside existing `connectWithFinch` and `isLoading: isFinchLoading` from `useFinchConnect()`; (b) inside the two-column choice section (`completionCount === 0 && emailVerify && assessmentData?.status !== "completed" && !isConnected`), add `{finchError && <div className="mb-4"><ErrorMessage errorType="danger" textColor="text-red-700" alertIcon={AlertCircle} errorMessage={finchError} onClose={clearFinchError} /></div>}` directly above the "Start with Finch" `<Button>` in the right-hand column; (c) in the post-completion section (`emailVerify && assessmentData?.status === "completed" && !isConnected`), wrap existing `<DashboardCard title="Connect to Finch" ...>` in a `<>...</>` fragment and add the same `{finchError && <ErrorMessage ...>}` block directly above the card (see quickstart.md Step 4 for exact placement)

**Checkpoint**: US1 fully functional. All `DashboardPage.test.tsx` tests pass. Dev smoke test: trigger a Finch error on `/dashboard` — inline red error banner appears co-located with the Finch CTA, no floating toast.

---

## Phase 4: User Story 2 — Sonner Dependency Fully Removed (Priority: P2)

**Goal**: Zero references to `sonner` remain anywhere in the codebase; the `sonner` package is absent from the project dependency manifest.

**Independent Test**: After T006–T008 complete, run `git grep -i sonner` in the repo root — zero matches. Inspect `package.json` — `sonner` absent from `dependencies`.

### Implementation for User Story 2

- [x] T006 [P] [US2] Update `src/App.tsx` — delete `import { Toaster } from "@/components/ui/sonner"` import line; delete `<Toaster />` JSX element near the closing `</AuthErrorBoundary>` tag (see App.tsx lines 3 and 176)
- [x] T007 [P] [US2] Delete `src/components/ui/sonner.tsx` — this file has no remaining consumers after T006; verify no barrel `index.ts` in `src/components/ui/` references it before deleting
- [x] T008 [US2] Run `pnpm remove sonner` in the repository root — updates `package.json` and `pnpm-lock.yaml` atomically; confirm `sonner` no longer appears under `dependencies` in `package.json`

**Checkpoint**: US2 complete. `git grep -i sonner` returns zero matches. `package.json` clean.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Full quality gate across all modified files to satisfy SC-005.

- [x] T009 [P] Run `pnpm run type-check` — must report zero TypeScript errors; fix any type issues across `useFinchConnect.ts`, `DashboardPage.tsx`, `App.tsx`
- [x] T010 [P] Run `pnpm lint:fix` then `pnpm format` — ESLint auto-fix + Prettier format on all modified files
- [x] T011 Run `pnpm test` — full test suite must pass; new/modified suites: `useFinchConnect.test.tsx` (T002), `DashboardPage.test.tsx` (T004); all pre-existing tests unaffected

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup / Baseline)
  └── Phase 2 (Foundational — hook refactor)  ← BLOCKS both user stories
        ├── Phase 3 (US1 P1)  ← error display on Dashboard
        │     └── Phase 4 (US2 P2)  ← sonner removal (T006+T007 parallel after T003)
        │           └── Phase 5 (Polish)
        └── (US2 T006/T007 can start in parallel with US1 after foundation is done)
```

### User Story Dependencies

- **US1 (P1)**: Requires Phase 2 complete (hook must expose `error` and `clearError`)
- **US2 (P2)**: T006 + T007 require only that the `sonner` import has been removed from `useFinchConnect.ts` (T003) — they can proceed in parallel with Phase 3 after Phase 2 completes. T008 (`pnpm remove sonner`) must follow T003 (hook no longer imports sonner) and can follow T006 (App.tsx no longer imports sonner).

### Within Each Phase

- T002 (tests) MUST be written and FAIL before T003 (implementation) — TDD discipline
- T004 (tests) MUST be written and FAIL before T005 (implementation) — TDD discipline
- T006 ‖ T007 are independent of each other and can run in parallel once Phase 2 is done
- T009 ‖ T010 can run in parallel (type-check and lint/format are independent)

### Parallel Opportunities

**Phase 4** (US2): After Phase 2 completes, T006 and T007 can both start immediately while US1 Phase 3 continues:

- T006 (App.tsx) and T007 (delete sonner.tsx) touch different files — fully parallel

---

## Parallel Execution Examples

### Phase 4 Parallel (US2)

```
After Phase 2 completes, launch in parallel with Phase 3:
  Task A: T006 — Remove Toaster from src/App.tsx
  Task B: T007 — Delete src/components/ui/sonner.tsx
  # → then T008 (pnpm remove sonner) once both A and B are done
```

### Phase 5 Parallel (Polish)

```
After Phase 4 completes:
  Task A: T009 — pnpm run type-check
  Task B: T010 — pnpm lint:fix && pnpm format
  # → then T011 (pnpm test) once both A and B are done
```

---

## Implementation Strategy

### MVP First (User Story 1 Only — ~45 min)

1. Complete Phase 1: baseline confirmation
2. Complete Phase 2: hook refactor (T002 → T003)
3. Complete Phase 3: dashboard error display (T004 → T005)
4. **STOP and VALIDATE**: `pnpm test`, smoke test `/dashboard` with Finch error triggered
5. US1 is independently deliverable — inline error works even if Sonner package is still present

### Full Delivery (both stories — ~90 min total)

1. Foundation (T001–T003) → US1 (T004–T005) → US2 (T006–T008) → Polish (T009–T011)
2. US2 adds the clean removal; US1 already guaranteed no toasts are shown
3. US2 T006/T007 can overlap with US1 Phase 3 if working in parallel

---

## Task Summary

| Phase          | Story | Tasks     | Files Touched                                                                                        |
| -------------- | ----- | --------- | ---------------------------------------------------------------------------------------------------- |
| 1 — Setup      | —     | T001      | — (verification only)                                                                                |
| 2 — Foundation | —     | T002–T003 | `tests/hooks/useFinchConnect.test.tsx` (MOD), `src/hooks/useFinchConnect.ts` (MOD)                   |
| 3 — US1 P1     | US1   | T004–T005 | `tests/pages/DashboardPage.test.tsx` (MOD), `src/pages/dashboard/DashboardPage.tsx` (MOD)            |
| 4 — US2 P2     | US2   | T006–T008 | `src/App.tsx` (MOD), `src/components/ui/sonner.tsx` (DELETED), `package.json`+`pnpm-lock.yaml` (MOD) |
| 5 — Polish     | —     | T009–T011 | all above                                                                                            |

**Total tasks**: 11 | **New files**: 0 | **Modified files**: 4 | **Deleted files**: 1

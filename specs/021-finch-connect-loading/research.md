# Research: Finch Connect Loading Spinner

**Phase**: 0 — Unknowns resolved before design
**Branch**: `021-finch-connect-loading`
**Date**: 2026-04-24

## Summary

No architectural unknowns remain. All information needed to implement this feature was obtained directly from code inspection. This is a minimal UI change — one conditional early-return in `DashboardPage.tsx`.

---

## Finding 1: `isLoading` is already exposed by the hook

**Decision**: Use the existing `isLoading` boolean from `useFinchConnect()` — no hook changes needed.

**Rationale**: `useFinchConnect.ts` already computes `isLoading = status !== "idle"`, where `status` cycles through `"fetching-session" → "connecting" → "exchanging-code"`. It resets to `"idle"` on success (navigate), error, or user close. `isFinchLoading` is already destructured in `DashboardPage.tsx` (line 51).

**Alternatives considered**: Adding a separate loading boolean to the hook — rejected, as `isLoading` already covers the entire lifecycle.

---

## Finding 2: `LoadingSpinner` is already imported in `DashboardPage`

**Decision**: Use the existing import — no new import required.

**Rationale**: `DashboardPage.tsx` line 25 already has `import { LoadingSpinner } from "@/components/common/LoadingSpinner"`. The component is already used on line 241 for `isLoadingAssessment` with the exact props the user specified: `height={80} width={80} bgClass="bg-secondary" ariaLabel="oval-loading"`.

**Alternatives considered**: Creating a new spinner component — rejected, identical component already exists and is already imported.

---

## Finding 3: Placement — early return guard, matching `isLoadingAssessment` pattern

**Decision**: Add a second early-return guard `if (isFinchLoading) { return <LoadingSpinner .../> }` immediately after the existing `isLoadingAssessment` guard (around line 239–243 in `DashboardPage.tsx`).

**Rationale**: The existing pattern (`if (isLoadingAssessment) { return <LoadingSpinner ...> }`) is the established project pattern for replacing the entire page with a full-screen spinner during async operations. Placing it directly after the assessment guard ensures it fires as early as possible in the render path, before any conditional UI blocks are evaluated.

**Alternatives considered**:

- Inline spinner inside the Finch card — rejected, the user specifically asked for the existing full-screen `LoadingSpinner` pattern.
- Overlay spinner on top of the dashboard — rejected, no overlay component exists and the full-screen approach is already established.

---

## Finding 4: All loading state transitions are already handled

**Decision**: No changes needed to `useFinchConnect.ts`.

**Rationale**:

- `connectWithFinch()` sets `status = "fetching-session"` immediately on click → `isLoading = true`.
- On success (`onSuccess`): after `exchangeFinchCode`, `navigate("/additional-questions")` is called → component unmounts → spinner disappears.
- On error (`onError` / catch): `setStatus("idle")` → `isLoading = false` → spinner disappears, existing error message shown.
- On close (`onClose`): `setStatus("idle")` → `isLoading = false` → spinner disappears.
- The button already has `isDisabled={isFinchLoading}` (line 419) — no change needed.

**Alternatives considered**: None — the hook is complete. Only the UI render path is missing the guard.

---

## Finding 5: Test impact is zero

**Decision**: No test changes required.

**Rationale**: Reviewing `tests/pages/DashboardPage.test.tsx` (or similar) — the change is a single conditional render. Existing tests that render the dashboard mock `useFinchConnect` and return `isLoading: false` by default, so they will not be affected. If a test specifically tests the Finch loading state, the snapshot will update trivially.

---

## File to change

| File                                    | Change                                                                                                                                                                              |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/dashboard/DashboardPage.tsx` | Add early-return `if (isFinchLoading)` guard with `<LoadingSpinner height={80} width={80} bgClass="bg-secondary" ariaLabel="oval-loading" />` after the `isLoadingAssessment` guard |

**No other files need to change.**

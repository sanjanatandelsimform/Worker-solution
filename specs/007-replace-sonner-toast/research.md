# Research: Replace Sonner Toast with ErrorMessage Component

**Feature**: `007-replace-sonner-toast` | **Phase**: 0 — Pre-Design Research  
**Date**: 2026-04-07

## §1. Error State Surface — Where Should Error Live?

**Decision**: Expose `error: string | null` from the `useFinchConnect` hook, alongside the existing `isLoading`.

**Rationale**: The hook already owns all Finch connection state (`status` internally, `isLoading` publicly). Errors are a direct outcome of Finch operations — they have no meaning outside of a Finch connect flow. Owning error in the hook means: (a) the lifetime is controlled by the hook (cleared automatically when a new `connectWithFinch()` call begins, FR-002), and (b) the call site (Dashboard) requires zero extra wiring logic — it just reads `error` like it reads `isLoading`.

**Alternatives considered**:

- _Use `DashboardPage`'s existing `errorMessage` state_: Rejected. DashboardPage.tsx has a shared `errorMessage` state used for email-verification and profile error display. Mixing Finch errors into it blurs responsibility: the Dashboard would need to explicitly call `setErrorMessage` based on hook callbacks it doesn't own, and auto-clear on retry would require additional `useEffect` logic in the consuming component.
- _Use Redux / global state_: Rejected. Finch connection errors are transient, session-scoped, and not consumed by any other part of the application. Routing ephemeral error strings through Redux adds unnecessary boilerplate with no benefit (no cross-component sharing needed).

---

## §2. ErrorMessage Placement on DashboardPage

**Decision**: Render the `<ErrorMessage />` co-located inside each Finch section where a Finch CTA button appears. Two placements required, both conditional on `finchError`:

1. **Two-column plan choice section** (`completionCount === 0 && emailVerify && assessmentData.status !== "completed" && !isConnected`) — error renders inside the "Connect with Finch" column, between the descriptive bullets and the "Start with Finch" button.
2. **Post-completion Finch banner card** (`emailVerify && assessmentData.status === "completed" && !isConnected`) — error renders directly above the `<DashboardCard>` for "Connect to Finch".

**Rationale**: Error appears where the user's eye is — next to the button they clicked. This is consistent with how `<ErrorMessage />` is used in `SignInForm.tsx` and `ResetPasswordForm.tsx` (co-located with the triggering form). The Dashboard already renders error at top-of-section for unrelated errors (email verification, dashboard fetch failures), so Finch-specific errors go in the Finch section.

**Alternatives considered**:

- _Top-of-page shared error zone (Option C)_: Rejected. User has scrolled to the Finch section; a top-of-page error may not be visible without scrolling back up.
- _Merging into existing `errorMessage` at page top (Option B)_: Rejected for same reason as Option C plus the naming collision with the existing `errorMessage` state variable.

---

## §3. `sonner.tsx` Wrapper File — Delete or Stub?

**Decision**: Delete `src/components/ui/sonner.tsx`.

**Rationale**: The file's sole consumer is `App.tsx` (the `<Toaster />` mount). Once that import is removed, the file is unreferenced. Deleting it removes dead code unambiguously. A `barrel` export for `src/components/ui/` (if one exists) will need updating — verified there is no barrel `index.ts` in `src/components/ui/`, so deletion is a clean one-file operation.

**Alternatives considered**:

- _Keep file, remove internal sonner import_: Pointless — the component would export nothing useful and no consumer remains.

---

## §4. Package Removal — pnpm remove vs. Manual Edit

**Decision**: Run `pnpm remove sonner` via terminal.

**Rationale**: This atomically updates `package.json` and `pnpm-lock.yaml` in a single operation. Manual edits to `package.json` leave `pnpm-lock.yaml` out of sync until `pnpm install` is run separately, which adds a step and a risk.

**Alternatives considered**:

- _Manual package.json edit + pnpm install_: Equivalent outcome but more steps and more error-prone.

---

## §5. Existing Test Refactoring Required

**Findings**: `tests/hooks/useFinchConnect.test.tsx` mocks Sonner's `toast.error` via `vi.mock("sonner", ...)` and asserts `mockToastError` calls. These tests must be updated to:

1. Remove the Sonner mock entirely.
2. Replace `expect(mockToastError).toHaveBeenCalledWith(...)` assertions with `expect(result.current.error).toBe(...)`.

`tests/pages/DashboardPage.test.tsx` mocks `useFinchConnect` with `{ connectWithFinch, isLoading }`. The mock factory must be updated to include `error: null` in the default return value. New test cases must assert that when `error` is non-null the `<ErrorMessage />` data-testid appears with the correct message.

**No other test files reference Sonner** — confirmed via workspace grep.

---

## §6. `console.log` in Hook — Keep or Remove?

**Finding**: Line 58 of `useFinchConnect.ts` has `console.log("Error in connectWithFinch:", e)` which was presumably added for debugging the Finch integration.

**Decision**: Remove the `console.log` — it is the only debug log in the hook and any consumer of the error can surface the message through the new `error` state. Keeping it adds noise and violates the project's code-quality standard (ESLint rules typically flag `no-console`). This is a safe mechanical removal in the same edit as the Sonner replacement.

**Alternatives considered**:

- _Keep it_: Rejected — project doesn't use structured logging and `no-console` lint warnings would surface on CI.

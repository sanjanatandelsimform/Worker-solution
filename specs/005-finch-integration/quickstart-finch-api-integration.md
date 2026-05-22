# Quickstart: Finch Connect API Integration

**Feature**: 005-finch-integration (update)  
**Date**: 2026-04-01  
**Spec**: spec-finch-api-integration.md  
**Estimated scope**: ~4 file changes, ~80 lines modified/deleted

---

## Prerequisites

- Node.js + pnpm installed (existing project setup)
- Running on branch `005-finch-integration`
- Existing Finch stub implementation already in place:
  - `src/services/api/finchApi.ts` — stubs exist; will be replaced
  - `src/hooks/useFinchConnect.ts` — hook exists; error strings only will change
  - `src/pages/getMore/GetMore.tsx` — imports `useFinchConnect`; to be removed
  - `tests/pages/GetMore.test.tsx` — T021 and T023 to be deleted
  - `tests/hooks/useFinchConnect.test.tsx` — mock return shapes to be updated

---

## Step 1 — Update `finchApi.ts` (core change)

Open `src/services/api/finchApi.ts` and replace the entire file:

**Key changes**:

1. Import `apiClient` (default export) from `@/services/api/authApi`
2. Add `axios` import for `isAxiosError` error helper
3. Replace `FinchSessionResponse` type: add `connectUrl: string` field
4. Replace `FinchConnectResponse` type: replace `success: boolean` with full connection fields
5. Add internal API response envelope types (`FinchSessionApiResponse`, `FinchCallbackApiResponse`)
6. Add module-level error constant strings
7. Replace stub function bodies with real `apiClient.post()` calls + `status` validation

**Reference**: [contracts/finch-connect-session.md](contracts/finch-connect-session.md) and [contracts/finch-callback.md](contracts/finch-callback.md) contain the exact implementation snippets.

**Validation**: After this step, run `pnpm run type-check` — should pass with no errors.

---

## Step 2 — Update error strings in `useFinchConnect.ts` (minor change)

Open `src/hooks/useFinchConnect.ts` and update the two fallback error strings to match FR-014:

| Location in hook                 | Old string                                    | New string                                                 |
| -------------------------------- | --------------------------------------------- | ---------------------------------------------------------- |
| `onSuccess` guard (empty `code`) | `"Connection failed. Please try again."`      | `"Failed to complete Finch connection. Please try again."` |
| `onError` callback fallback      | `"Finch connection error. Please try again."` | `"Failed to complete Finch connection. Please try again."` |
| `connectWithFinch` catch block   | `"Connection failed. Please try again."`      | `"Failed to start Finch Connect. Please try again."`       |

> The `onSuccess` guard and catch block in `exchangeFinchCode` may already throw an `Error` whose `.message` comes from the service — the hook's `catch` block should propagate `error.message` before falling back to the constant. Verify the catch pattern handles this correctly.

**Validation**: `pnpm run type-check` — should pass.

---

## Step 3 — Remove Finch code from `GetMore.tsx`

Open `src/pages/getMore/GetMore.tsx` and remove:

1. `import { useFinchConnect } from "@/hooks/useFinchConnect";`
2. `const { connectWithFinch, isLoading: isFinchLoading } = useFinchConnect();`
3. The Finch plan branch in the submit handler that calls `connectWithFinch()`
4. Any disabled/loading prop on the button that references `isFinchLoading`

The page should revert to navigating directly (or show no action) when the Finch plan is selected, since Finch entry is now Dashboard-only. Manual Entry navigation (`navigate("/assessment")`) is unchanged.

**Validation**: `pnpm run type-check` + `pnpm lint:fix` — should pass with no new errors.

---

## Step 4 — Update `GetMore.test.tsx`

Open `tests/pages/GetMore.test.tsx` and:

1. **Delete** the entire `it(...)` block for T021 (`"clicking 'Let's Get Started' with Finch plan calls connectWithFinch"`)
2. **Delete** the entire `it(...)` block for T023 (`"'Let's Get Started' button has data-disabled when Finch plan is loading"`)
3. **Remove** the `mockConnectWithFinch`, `mockUseFinchConnect`, and `vi.mock("@/hooks/useFinchConnect", ...)` setup since the hook is no longer imported by the component
4. **Remove** the `mockUseFinchConnect.mockReturnValue(...)` call from `beforeEach`
5. **Keep** T022 (`"clicking 'Let's Get Started' with Manual Entry plan navigates to /assessment"`) exactly as-is

**Validation**: Run `pnpm vitest run tests/pages/GetMore.test.tsx` — T022 should pass; T021/T023 should no longer exist.

---

## Step 5 — Update `useFinchConnect.test.tsx` mock shapes

Open `tests/hooks/useFinchConnect.test.tsx` and update the mock return values:

1. `mockGetFinchSessionId.mockResolvedValue(...)`:
   - **Old**: `{ sessionId: "stub-session-id-001" }`
   - **New**: `{ sessionId: "sess_abc123", connectUrl: "https://connect.tryfinch.com/authorize/sess_abc123" }`

2. `mockExchangeFinchCode.mockResolvedValue(...)`:
   - **Old**: `{ success: true }`
   - **New**: `{ connectionId: "conn-uuid-123", connectionStatus: "connected", providerId: "gusto", syncJobId: "sync-uuid-456", syncJobStatus: "pending" }`

No test logic changes are needed — the hook doesn't read these values; the tests only assert that `navigate` was called and `toast.error` was/wasn't called.

**Validation**: Run `pnpm vitest run tests/hooks/useFinchConnect.test.tsx` — all tests should pass.

---

## Step 6 — Full quality gate

```bash
pnpm run type-check    # Must have zero errors
pnpm lint:fix          # Auto-fix any lint issues
pnpm format            # Prettier
pnpm vitest run        # All tests must pass
```

Smoke-test manually:

1. Start `pnpm dev`
2. Navigate to `/dashboard` → click "Start with Finch" → confirm overlay opens (requires real backend or mock server)
3. Navigate to `/get-more` → confirm no Finch Connect trigger exists

---

## File Change Summary

| File                                   | Change type | Description                                             |
| -------------------------------------- | ----------- | ------------------------------------------------------- |
| `src/services/api/finchApi.ts`         | Modified    | Replace stubs with real `apiClient` calls; update types |
| `src/hooks/useFinchConnect.ts`         | Modified    | Update 3 fallback error strings to match FR-014         |
| `src/pages/getMore/GetMore.tsx`        | Modified    | Remove `useFinchConnect` import + Finch trigger code    |
| `tests/pages/GetMore.test.tsx`         | Modified    | Delete T021 + T023; remove Finch mock setup             |
| `tests/hooks/useFinchConnect.test.tsx` | Modified    | Update mock return shapes for both service functions    |

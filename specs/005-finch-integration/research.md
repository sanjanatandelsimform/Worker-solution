# Research: Finch Integration

**Feature**: 005-finch-integration  
**Date**: 2026-03-31

## 1. Finch SDK API Surface (`@tryfinch/react-connect` v5)

**Decision**: Use `useFinchConnect({ onSuccess, onError, onClose })` from `@tryfinch/react-connect` and call the returned `open({ sessionId })` to trigger the overlay.

**Rationale**: This is the only supported React integration path as documented in the official SDK README. The hook internally manages the iFrame lifecycle — callers only supply callbacks and a session ID at open time. There is no constructor/class API to manage.

**Callback signatures** (confirmed from SDK README):

```typescript
onSuccess: (event: { code: string; state?: string }) => void
onError:   (event: { errorMessage: string; errorType: 'validation_error' | 'employer_connection_error' }) => void
onClose:   () => void
```

**Alternatives considered**:

- Using the vanilla JavaScript CDN path — rejected; project is a React SPA and the hook integration avoids manual DOM event wiring.

---

## 2. Hook Architecture: Callbacks Defined Outside `useFinchConnect`

**Decision**: Define `onSuccess`, `onError`, and `onClose` as stable callbacks inside the custom `useFinchConnect` hook (our hook, not the SDK hook), and pass them to the SDK hook. The custom hook exposes only `connectWithFinch()` (trigger) and `isLoading` to consumers.

**Rationale**: The SDK's `useFinchConnect` hook re-renders when its callback references change. Defining callbacks inside a wrapping hook with `useCallback` prevents infinite re-render loops — a known React 18+ StrictMode issue documented in the SDK's CHANGELOG (fix in v5.0.1). This pattern also keeps all Finch business logic (session fetch, code exchange, toast, navigate) in one place, so Dashboard and Get More pages are trivially thin consumers.

**Alternatives considered**:

- Passing callbacks as parameters to the wrapping hook — rejected because it leaks Finch internals to consumers, contradicting FR-003.
- Calling `useFinchConnect` (SDK) directly in page components — rejected for the same reason; also causes code duplication across two pages.

---

## 3. Session ID Fetch: When to Fetch

**Decision**: Fetch the session ID lazily — inside `connectWithFinch()` when the user clicks the button — not on component mount.

**Rationale**: Session IDs are short-lived (Finch documentation notes they are intended to authorize a single Connect session). Fetching on mount risks the session expiring before the user clicks. Fetching on click ensures the session is fresh and only incurs the network round-trip when the user actively intends to connect.

**Alternatives considered**:

- Prefetch on mount and cache — rejected; adds complexity and risks using a stale/expired session ID.
- Prefetch on hover — rejected; over-engineered for this feature scope.

---

## 4. Toast Library: Sonner via shadcn/ui

**Decision**: Add `sonner` via `pnpm dlx shadcn@latest add sonner`. This installs the `sonner` npm package and places a pre-configured `Toaster` wrapper in `src/components/ui/sonner.tsx`. Mount `<Toaster />` once in `App.tsx` (or the root private layout). All toasts are fired via `import { toast } from 'sonner'`.

**Rationale**: The project already uses shadcn/ui (confirmed by `components.json`). The shadcn `sonner` component is the officially recommended toast primitive — it wraps `sonner` with project-consistent theming and a Tailwind-compatible API. No conflict with existing dependencies. The `Toaster` is a trivial one-line addition at the app root.

**Alternatives considered**:

- `react-hot-toast` — not part of the shadcn ecosystem; would require manual theming.
- `react-toastify` — heavier bundle, not shadcn-native.
- Custom toast state in the hook exposed as a return value — rejected; requires every consumer to render a `<Toast />` component, violating the "hook handles all toasting" requirement.

---

## 5. Stub Service File Location and Shape

**Decision**: Create `src/services/api/finchApi.ts` with two exported functions:

- `getFinchSessionId(): Promise<{ sessionId: string }>`
- `exchangeFinchCode(code: string): Promise<{ success: boolean }>`

Both stubs `return Promise.resolve(...)` with hardcoded values. The file uses the same top-of-file JSDoc comment format as `dashboardApi.ts` and `authApi.ts`.

**Rationale**: Placing stubs in a dedicated `finchApi.ts` next to other API service files makes the swap-in location immediately obvious to the future developer replacing stubs with real calls. The function signatures match what the real API will require (confirmed by working back from the spec's described endpoint shapes). No changes to the hook are needed when the real API is integrated — only the function bodies change.

**Alternatives considered**:

- Inlining stubs inside the hook — rejected; violates FR-009/FR-010 (stub must be replaceable without touching the hook).
- Adding stubs to an existing service file — rejected; coupling unrelated API concerns violates single-responsibility.

---

## 6. State Machine in the Hook

**Decision**: Track hook state with a single `status` discriminated union: `'idle' | 'fetching-session' | 'connecting' | 'exchanging-code'`, plus a boolean `isLoading` derived from it.

**Rationale**: A typed status union is more expressive and easier to test than multiple booleans. It also enables future states (e.g., `'success'`) to be added without breaking consumers.

**Alternatives considered**:

- Multiple booleans (`isFetchingSession`, `isConnecting`, `isExchanging`) — rejected; prone to impossible states (e.g., two `true` at once).
- A `useReducer` approach — rejected as over-engineered for a linear flow with no branching state.

---

## 7. Code Exchange Failure Recovery

**Decision**: On code-exchange failure, show a toast, set status back to `'idle'`, and do NOT navigate. The user restarts the full flow (new session ID + new Finch overlay) by clicking the button again.

**Rationale**: Confirmed by clarification Q3. Storing the authorization code client-side for a partial retry introduces security surface (the code is sensitive) and adds complexity. The Finch flow is fast enough that a full restart is acceptable.

**Alternatives considered**:

- Store the code in hook state and retry only the exchange call — rejected per clarification Q3; also introduces risk of replaying a stale/invalid code.

---

## 8. `useFinchConnect` SDK Callback Stability (React StrictMode)

**Decision**: Wrap `onSuccess`, `onError`, and `onClose` callbacks in `useCallback` with stable dependencies. Use a `useRef` to hold the `navigate` function reference where needed.

**Rationale**: The SDK v5.0.1 changelog documents a fix: "callbacks not firing in React 18+ with StrictMode". The fix relies on stable callback references. Using `useCallback` with correct dependency arrays ensures the SDK picks up callbacks once and does not silently drop them on StrictMode double-mount.

**Alternatives considered**:

- Not wrapping in `useCallback` — rejected; breaks the SDK in StrictMode as documented.

---

## 9. Dashboard Page Change Scope

**Decision**: Replace the existing `handleFinchStarted` function in `DashboardPage.tsx` (which currently calls `navigate("/additional-questions")` directly) with a call to `connectWithFinch()` from the hook. No other changes to the page.

**Rationale**: The existing button wiring (`onClick={handleFinchStarted}`) is already in place. Only the handler body changes. Disabling the button (`disabled={isLoading}`) is the only additional prop change required.

---

## 10. Get More Page Change Scope

**Decision**: In `GetMore.tsx`, replace the `if (selectedPlan === "finch") { navigate("/additional-questions"); }` branch in `handleGetStarted` with `connectWithFinch()`. The `else if (selectedPlan === "manual")` branch (`navigate("/assessment")`) is unchanged.

**Rationale**: The Finch plan's "Let's get started" button already calls `handleGetStarted`. Swapping out the navigation with the hook trigger is a minimal, targeted change. The Manual Entry path is unaffected.

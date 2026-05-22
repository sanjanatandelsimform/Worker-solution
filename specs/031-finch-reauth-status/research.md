# Research: Finch Reauth Status Flag

**Feature**: `031-finch-reauth-status`  
**Phase**: 0 — Outline & Research  
**Date**: 2026-05-01

## Resolved Questions

### 1. Where should `finchConnectionStatus` live in the API response type?

**Decision**: Add it as an optional field to the existing `DashboardStatusResponse` interface in `src/types/dashboardStatusTypes.ts`.  
**Rationale**: All other dashboard status fields are on this interface. Making it optional (`finchConnectionStatus?: FinchConnectionStatus`) means the hook degrades gracefully when the API response omits the field (e.g., before backend deploys) — `isReauthRequired` will be `false` due to the strict `=== "reauth_required"` check.  
**Alternatives considered**: Adding to a separate interface and merging — rejected because it creates unnecessary fragmentation for a single field.

---

### 2. How should `isReauthRequired` be derived?

**Decision**: Use a `useMemo` in `useDashboardStatusPolling`, analogous to the existing `isRecommendationTabReady`, `isWorkforceTabReady` etc. pattern:

```ts
const isReauthRequired = useMemo(
  () => status?.finchConnectionStatus === "reauth_required",
  [status]
);
```

**Rationale**: Consistent with existing pattern. `useMemo` avoids recomputation on unrelated state changes. Strict equality on the string `"reauth_required"` naturally handles absent or unexpected values (returns `false`).  
**Alternatives considered**: Inline derivation in `DashboardPage` directly from `status.finchConnectionStatus` — rejected because it bypasses the hook's abstraction boundary and would require the page to import more than needed.

---

### 3. How should `reconnectWithFinch` skip the `/additional-questions` redirect?

**Decision**: Add an internal `isReconnectRef = useRef(false)` to `useFinchConnect`. A new `reconnectWithFinch` function exported from the hook sets this ref to `true` then delegates to `connectWithFinch`. The existing `onSuccess` callback checks the ref before calling `navigate("/additional-questions")` and resets the ref to `false` afterwards.

```ts
const isReconnectRef = useRef(false);

const reconnectWithFinch = useCallback(async () => {
  isReconnectRef.current = true;
  return connectWithFinch();
}, [connectWithFinch]);

// In onSuccess:
await exchangeFinchCode(code);
if (!isReconnectRef.current) {
  navigate("/additional-questions");
}
isReconnectRef.current = false;
```

**Rationale**:

- Minimal change to the existing hook. A ref is safe here because the navigation decision happens synchronously after awaiting `exchangeFinchCode` — no re-render race.
- A single hook instance in `DashboardPage` exposes both `connectWithFinch` (for first-time use) and `reconnectWithFinch` (for reauth), avoiding a second hook call.
- The ref resets after each attempt, so subsequent reconnects behave correctly.

**Alternatives considered**:

- **Two separate hook calls** (`useFinchConnect()` + `useFinchConnect({ skip: true })`): Both instances would share the same Finch SDK via `useFinchSDK`, but would create two separate `onSuccess` listeners — rejected as unnecessarily complex and potentially error-prone.
- **Passing `skipRedirect` to `connectWithFinch` directly**: The `connectWithFinch` function doesn't have access to the `onSuccess` closure; the navigation is wired at hook initialization via `useCallback`. This approach would require restructuring the entire hook — too invasive.
- **Callback option in hook options** (`useFinchConnect({ onSuccess: () => {} })`): Workable but requires changing the call site at DashboardPage and makes the hook more complex with an optional override — rejected in favor of the simpler ref approach.

---

### 4. Should the Reconnect card be gated on `isReauthRequired` alone or combined with other conditions?

**Decision**: Gate on `isReauthRequired` alone. The card is only appropriate when the API explicitly signals `reauth_required`.  
**Rationale**: The existing card is unconditionally rendered (which was a placeholder). The new condition is clean and directly represents intent. No need for additional guards like `emailVerify` or `isConnected` — if the API says reauth is required, show the card regardless.  
**Alternatives considered**: Combining with `isConnected` — rejected because `reauth_required` implies the user was previously connected; the API status is the authoritative source.

---

### 5. What happens with loading state for `reconnectWithFinch`?

**Decision**: `reconnectWithFinch` shares `isLoading` / `isPageLoading` with `connectWithFinch` since it delegates to the same underlying function. No separate loading state needed.  
**Rationale**: The Finch SDK allows only one connection at a time (the hook's guard `if (isLoading) return` handles concurrent calls). Sharing state simplifies the component — the reconnect card button can also use `isFinchLoading` to disable during reconnect.

---

## Technology Patterns Confirmed

| Pattern                              | Precedent in codebase                                                                                      | Applied here                                                                |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `useMemo` for derived boolean flags  | `isRecommendationTabReady`, `isWorkforceTabReady`, `isAutomatedProvider` in `useDashboardStatusPolling.ts` | `isReauthRequired`                                                          |
| Optional field on response type      | `providerType: ProviderType` (nullable)                                                                    | `finchConnectionStatus?: FinchConnectionStatus`                             |
| `useRef` for ephemeral control flags | `isMountedRef`, `isPollingRef`, `fetchInProgressRef`                                                       | `isReconnectRef` in `useFinchConnect`                                       |
| Extending hook return interface      | `UseDashboardStatusPollingReturn` (grew from 028)                                                          | Add `isReauthRequired`; add `reconnectWithFinch` to `UseFinchConnectReturn` |
| `makeStatus()` helper in test        | `useDashboardStatusPolling.test.ts`                                                                        | Extend `makeStatus` with `finchConnectionStatus` override                   |

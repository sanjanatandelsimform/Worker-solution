# Research: Finch Status API Integration

**Feature**: 006-finch-status
**Date**: 2026-04-02

---

## 1. Redux vs Local State for Finch Status

**Decision**: Store finch status in a Redux slice (`finchStatusSlice`), not in local component state.

**Rationale**: The finch connection status is a global concern — it directly controls the visibility of major dashboard sections. If it were local state, it would be lost on any component remount. Placing it in Redux also enables future consumers (e.g., header badge, sidebar indicator) to read `isConnected` without prop drilling or re-fetching.

**Alternatives considered**:

- Local `useState` in `DashboardPage.tsx` — rejected; status would be lost on remount and is non-trivially shared.
- React Query — project already establishes Redux as the server-state management layer for all API-backed data (see `dashboardSlice.ts`, `userSlice.ts`, `profileSlice.ts`). Adding React Query for a single endpoint would fracture the state management pattern without proportionate benefit.

---

## 2. Polling Mechanism: `setInterval` in a Custom Hook

**Decision**: Use `setInterval` inside `useFinchStatus` with a `useEffect` cleanup that calls `clearInterval`.

**Rationale**: `setInterval` is the simplest standard mechanism for periodic polling with deterministic cleanup via React's `useEffect` return value. This matches the pattern already documented in the spec and is consistent with the project's avoidance of additional dependencies.

**Polling interval**: 15 seconds (fixed, per product requirement).

**Alternatives considered**:

- `useInterval` from a utility library (e.g., `usehooks-ts`) — rejected; adds a dependency for something trivially implementable inline.
- React Query's `refetchInterval` — rejected for the same reason as §1: consistency with established Redux patterns.
- Long polling or WebSockets — rejected; the feature explicitly uses short polling. Real-time server push is out of scope.

---

## 3. No Stop Condition — Documented Tradeoff

**Decision**: The polling interval fires unconditionally every 15 seconds. No terminal state causes the interval to stop.

**Rationale**: Explicitly required by FR-009 and confirmed by the clarification in the spec. The product team defers this optimisation to a future iteration to keep the current implementation scope small.

**Known tradeoff**: A connected user generates one `GET /finch/status` call every 15 seconds for the duration of their dashboard session. At ~100 concurrent users this is ~400 req/min — acceptable load for a backend endpoint with no heavy computation.

**Future optimisation path**: Stop the interval when `connection.status === "connected"` and `latestSyncJob.status` is a terminal value (`"completed"` or `"failed"`).

---

## 4. Selector File Location: Separate `selectors/` Directory

**Decision**: Create selectors in `src/store/selectors/finchStatusSelectors.ts`, NOT co-located in the slice file.

**Rationale**: The project exclusively uses a separate `src/store/selectors/` directory for all selector files:

| File                | Selector location                           |
| ------------------- | ------------------------------------------- |
| `userSlice.ts`      | `src/store/selectors/userSelector.ts`       |
| `dashboardSlice.ts` | `src/store/selectors/dashboardSelectors.ts` |
| `profileSlice.ts`   | `src/store/selectors/profileSelectors.ts`   |

Following this established pattern ensures `finchStatusSelectors.ts` is found in the expected place by every developer on the team. FR-005 in the spec says "co-located in finchStatusSlice.ts" — this is a spec imprecision; the actual convention is a separate file, and the plan adopts the actual convention.

---

## 5. `isConnected` Derivation: Hook vs Selector

**Decision**: Derive `isConnected` inside the `useFinchStatus` hook rather than in a dedicated memoised selector.

**Rationale**: `isConnected` is a simple boolean derived from a single field (`connection?.status === "connected"`). Calling `createSelector` for a constant-time boolean check adds boilerplate with no memoisation benefit (the derived value is a primitive). The hook is the only consumer in this feature; the selector file will expose the raw `connection` field for future consumers who may need it.

**Alternatives considered**:

- `selectIsFinchConnected` memoised selector — deferred to future feature; would be added to `finchStatusSelectors.ts` when a second consumer appears.

---

## 6. Initial Loading Fallback: No Skeleton

**Decision**: While the first `/finch/status` fetch is in-flight, `isConnected` is `false` (initial Redux state has `connection: null`). The dashboard renders the existing onboarding/assessment UI as-is — no loading spinner or skeleton for the Finch status section.

**Rationale**: Confirmed by clarification Q1. The alternative (showing a skeleton or blocking render) would cause a visible layout shift for non-connected users and adds implementation complexity with no business benefit. Because the connection check is fast (one GET with no body), the transition from "not connected" to "connected" is imperceptible in practice.

---

## 7. Error Handling During Polling: Silent Fallback

**Decision**: When `/finch/status` returns an error (any network failure or non-2xx response), the Redux slice stores the error string and `connection` remains at its last known value (or `null` on first failure). No visible error indicator is shown. Polling continues every 15 seconds unchanged.

**Rationale**: Confirmed by clarification Q2 and FR-009. Showing an error toast on every failed poll would spam the user with notifications during transient network issues. The dashboard's fallback state (existing onboarding UI) remains functional regardless of the Finch status API's availability.

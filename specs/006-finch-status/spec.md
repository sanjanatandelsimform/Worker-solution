# Feature Specification: Finch Status API Integration — Dashboard Visibility Control

**Feature Branch**: `006-finch-status`  
**Created**: 2026-04-02  
**Status**: Draft  
**Input**: User description: "Add a new API call to `GET /api/v1/finch/status` that polls every 15 seconds on the Dashboard screen. The response determines which UI sections are shown or hidden in the Dashboard. Additionally, wire up the existing 'Connect to Finch' button on the dashboard to call the `connectWithFinch` function."

## Clarifications

### Session 2026-04-02

- Q: When `/finch/status` is still loading on first mount, what should the dashboard show? → A: Show existing cards/onboarding UI (same as non-connected state) until the first response arrives — no spinner or skeleton for the loading interim.
- Q: When `/finch/status` returns an error, what should happen to polling? → A: Keep polling every 15s regardless of errors — consistent with the no-stop-condition rule already in the spec.
- Q: Should the "Connect to Finch" banner card be hidden only when assessment is completed, or globally when connected? → A: Only suppress it within the `assessmentData.status === "completed"` branch where the card currently renders — minimal change.
- Q: When Finch is connected, should tabs still require `isDashboardReady === true` before showing? → A: Yes — keep the `isDashboardReady` gate. The `isConnected` flag controls card visibility only; tab/data readiness is governed by the existing `isDashboardReady` logic unchanged.

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Hide Choice Cards When Finch Is Already Connected (Priority: P1)

A returning user who previously connected their HR provider through Finch visits the Dashboard. Because their Finch connection is active, the system automatically polls the status endpoint and determines the connection is live. The two selection cards ("Basic Plan" and "Connect with Finch") are hidden, and the dashboard data tabs (Recommendations and Industry) remain visible.

**Why this priority**: Prevents a confusing UX where an already-connected user is still prompted to connect. This is the central business outcome of the feature — routing the user directly to actionable data instead of the onboarding choice cards.

**Independent Test**: Mount the Dashboard with `assessmentData.status === "completed"` and `isDashboardReady === true`. Stub the `/finch/status` endpoint to return `connection.status === "connected"`. Assert that the Basic Plan card and Connect with Finch choice card are not rendered, while the Recommendations/Industry tabs remain rendered.

**Acceptance Scenarios**:

1. **Given** a user visits the Dashboard and the status endpoint returns `connection.status === "connected"`, **When** the first poll response is received, **Then** the Basic Plan card and Connect with Finch choice card are no longer visible on the page.
2. **Given** the Finch connection is active, **When** the dashboard loads, **Then** the Recommendations and Industry tabs remain fully visible and functional.
3. **Given** the Finch connection is active and the choice cards are hidden, **When** the page is refreshed, **Then** the same connected state is re-established within one polling cycle (≤ 15 seconds).
4. **Given** the Finch connection is active, **When** the dashboard renders, **Then** the "Connect to Finch" DashboardCard banner is also hidden (user is already connected).

---

### User Story 2 — Show Choice Cards When Finch Is Not Connected (Priority: P2)

A user visits the Dashboard whose Finch connection is disconnected, requires re-authentication, or has never been established. The status endpoint returns a non-connected state. The dashboard renders the same choice cards as before this feature was introduced, preserving the existing onboarding flow.

**Why this priority**: Guarantees backward compatibility — users who have not connected Finch must continue to see the onboarding experience without any regression.

**Independent Test**: Mount the Dashboard with `assessmentData.status === "completed"` and `isDashboardReady === true`. Stub the `/finch/status` endpoint to return `connection.status === "disconnected"` (and separately `"reauth_required"` and `null` connection). Assert the choice cards are rendered as before.

**Acceptance Scenarios**:

1. **Given** the status endpoint returns `connection.status === "disconnected"`, **When** the dashboard loads, **Then** the existing visibility logic is unchanged — onboarding choice cards appear based on assessment status as before.
2. **Given** the status endpoint returns `connection.status === "reauth_required"`, **When** the dashboard loads, **Then** the existing visibility logic is unchanged.
3. **Given** the status endpoint returns `connection: null` (no connection record exists), **When** the dashboard loads, **Then** the existing visibility logic is unchanged.
4. **Given** the status endpoint returns an error (network failure or non-200 response), **When** the request fails, **Then** the dashboard falls back to the existing pre-feature behavior (choice cards visible per assessment status) and does not crash.

---

### User Story 3 — Wire the "Connect to Finch" Dashboard Card Button (Priority: P2)

A user who has completed the assessment but has not yet connected Finch sees a "Connect to Finch" banner card on the dashboard. They click the **Connect** button. The system initiates the Finch Connect flow (same flow as the existing "Start with Finch" card). The button is disabled while the Finch operation is in progress.

**Why this priority**: The button existed but was non-functional. This task finalises the existing UI without introducing any new UI components, making it a low-risk, high-value change.

**Independent Test**: Mount the Dashboard with `assessmentData.status === "completed"` and Finch status returning a non-connected state. Assert the "Connect to Finch" DashboardCard is visible. Simulate a button click and assert `connectWithFinch()` was called. Verify the button is disabled while `isFinchLoading === true`.

**Acceptance Scenarios**:

1. **Given** the user is on the dashboard with `assessmentData.status === "completed"` and Finch is not connected, **When** they click the **Connect** button on the "Connect to Finch" DashboardCard, **Then** the `connectWithFinch()` function is invoked.
2. **Given** a Finch connection is in progress (`isFinchLoading === true`), **When** the user observes the Connect button, **Then** the button is visually disabled and non-interactive, preventing duplicate invocations.
3. **Given** `isConnected === true`, **When** the dashboard renders, **Then** the "Connect to Finch" DashboardCard is not shown (no button to click).

---

### User Story 4 — 15-Second Status Polling While Dashboard Is Open (Priority: P3)

While the user remains on the Dashboard page, the system periodically re-fetches `/finch/status` every 15 seconds. If the connection status changes between polls (e.g., the user completes onboarding in another tab), the dashboard UI updates automatically without requiring a page refresh.

**Why this priority**: Enables near-real-time state synchronisation. Lower priority because the dashboard is functional with just the initial fetch; polling is an enhancement.

**Independent Test**: Mount the Dashboard and use fake timers. Fire the initial fetch. Advance timers by 15 seconds and assert a second fetch was dispatched. Advance by another 15 seconds and assert a third fetch. Unmount the component and assert that advancing timers further triggers no additional fetches (interval was cleared).

**Acceptance Scenarios**:

1. **Given** the Dashboard is open, **When** 15 seconds elapse, **Then** a new `/finch/status` request is automatically dispatched.
2. **Given** the first poll returns a disconnected state and the second poll (15 s later) returns a connected state, **When** the second response is received, **Then** the choice cards disappear without a page refresh.
3. **Given** the user navigates away from the Dashboard, **When** the component unmounts, **Then** no further polling requests are made (interval is cleaned up).

---

### Edge Cases

- What happens when `/finch/status` returns a response with `latestSyncJob.status === "pending"`? No UI change is made for this state in this feature. The status value is stored in Redux for future use but not reflected in any visual indicator yet.
- What happens when `latestSyncJob` is `null`? Treated as a non-blocking absence of data; the dashboard renders based solely on `connection.status`.
- What happens when the polling interval fires while a previous request is still in-flight? The async thunk's built-in loading state prevents inconsistent updates; the new dispatch proceeds and the latest response wins.
- What happens when the user quickly navigates to the dashboard and back multiple times? Each mount starts a new interval and each unmount clears it, so no duplicate intervals accumulate.
- What happens when the bearer token is expired and `/finch/status` returns 401? The existing `apiClient` error handling propagates the error; the Redux slice stores the error string and the dashboard falls back to existing behavior without crashing.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST expose a `getFinchStatus()` service function in `src/services/api/finchApi.ts` that calls `GET /finch/status` using the existing `apiClient` and returns a typed response matching the API shape.
- **FR-002**: The system MUST define TypeScript interfaces for the status response in `src/types/finchStatusTypes.ts`, covering `FinchStatusResponse`, `FinchConnection` (with `id`, `status`, `providerId`, `lastSyncedAt`, `createdAt`), and `FinchSyncJob` (with `id`, `status`, `errorMessage`, `startedAt`, `completedAt`, `createdAt`).
- **FR-003**: The system MUST create a Redux slice `finchStatusSlice` in `src/store/slices/finchStatusSlice.ts` with state shape `{ connection: FinchConnection | null, latestSyncJob: FinchSyncJob | null, loading: boolean, error: string | null }` and a `fetchFinchStatus` async thunk that calls `getFinchStatus()`.
- **FR-004**: The `finchStatusSlice` MUST be registered in `src/store/store.ts` under the key `finchStatus`, following the existing reducer registration pattern.
- **FR-005**: Selectors for `connection`, `latestSyncJob`, `loading`, and `error` MUST be co-located in `finchStatusSlice.ts`, following the pattern in other slice files.
- **FR-006**: The system MUST create a `useFinchStatus` hook in `src/hooks/useFinchStatus.ts` that dispatches `fetchFinchStatus` on mount and sets up a 15-second polling interval using `setInterval`.
- **FR-007**: The `useFinchStatus` hook MUST clear the polling interval in its cleanup function (return value of `useEffect`) when the consuming component unmounts.
- **FR-008**: The `useFinchStatus` hook MUST expose `{ connectionStatus, syncJobStatus, isConnected, isLoading, error }` where `isConnected` is `true` only when `connection?.status === "connected"`.
- **FR-009**: The polling interval in `useFinchStatus` MUST fire unconditionally every 15 seconds — no stop condition is implemented in this feature. This behaviour is documented as a known limitation pending future optimisation. Errors from `/finch/status` MUST NOT halt polling — the interval continues regardless of error or success.
- **FR-010**: In `DashboardPage.tsx`, when `isConnected === true`, the system MUST hide the two onboarding choice cards: the Basic Plan card and the "Connect with Finch" choice card (the one with the "Start with Finch" button).
- **FR-011**: In `DashboardPage.tsx`, when `isConnected === true`, the system MUST also hide the "Connect to Finch" DashboardCard banner. This card only renders within the `assessmentData.status === "completed"` branch; suppression applies only within that branch (no change needed for pre-assessment users).
- **FR-012**: In `DashboardPage.tsx`, the existing assessment-based visibility logic for the Recommendations and Industry tabs MUST remain fully unchanged when `isConnected` changes. The `isDashboardReady` gate for tabs MUST remain in place — `isConnected` controls card visibility only, not data/tab readiness.
- **FR-013**: In `DashboardPage.tsx`, when `isConnected !== true` (including `false`, `null` connection, error state, or the loading state during the initial first fetch), the existing visibility logic for all dashboard sections MUST remain unchanged — no regression for non-connected users. During the initial in-flight fetch, the dashboard renders as if `isConnected === false` (existing onboarding cards visible per assessment status).
- **FR-014**: The "Connect to Finch" DashboardCard in `DashboardPage.tsx` MUST have `onClick={() => void connectWithFinch()}` added so that clicking the button initiates the Finch Connect flow.
- **FR-015**: The "Connect to Finch" DashboardCard MUST have `buttonIsDisabled={isFinchLoading}` set, disabling the button while a Finch Connect operation is in progress.
- **FR-016**: `latestSyncJob.status === "pending"` MUST be stored in Redux state but MUST NOT trigger any visible UI change in this feature iteration.

### Key Entities

- **Finch Connection**: Represents the live HR provider connection for the user's account. Key attributes: `id` (string), `status` (`"connected"` | `"reauth_required"` | `"disconnected"`), `providerId` (string), `lastSyncedAt` (ISO date string | null), `createdAt` (ISO date string). The `status` field drives dashboard visibility decisions.
- **Finch Sync Job**: Represents the most recent data synchronisation job triggered after a connection. Key attributes: `id` (string), `status` (`"pending"` | `"processing"` | `"completed"` | `"failed"`), `errorMessage` (string | null), `startedAt` (ISO date string | null), `completedAt` (ISO date string | null), `createdAt` (ISO date string). May be `null` if no sync has been initiated yet.
- **Finch Status Response**: The top-level API envelope. Attributes: `status` (boolean — `true` on success), `data` containing `connection` (FinchConnection | null) and `latestSyncJob` (FinchSyncJob | null).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A user with an active Finch connection sees choice cards disappear within one polling cycle — at most 15 seconds after landing on the Dashboard (first fetch fires immediately on mount, so in practice the cards are hidden before the user can interact with them).
- **SC-002**: A user without an active Finch connection observes zero visual difference from the pre-feature dashboard at all assessment stages.
- **SC-003**: The dashboard does not crash or display an error screen when the `/finch/status` endpoint is unreachable or returns a non-success response.
- **SC-004**: Clicking the **Connect** button on the "Connect to Finch" DashboardCard successfully initiates the Finch Connect overlay, identical in behaviour to the existing "Start with Finch" button on the choice card.
- **SC-005**: The **Connect** button is reliably non-interactive whenever a Finch operation is underway, preventing duplicate connection requests.
- **SC-006**: No additional network requests to `/finch/status` are issued after the user navigates away from the Dashboard (no memory leaks or zombie intervals).
- **SC-007**: The polling interval consistently fires every 15 seconds while the Dashboard is mounted, verified through unit tests with fake timers.

## Assumptions

- The `/finch/status` endpoint is live and reachable in the target environment; no stub is required for this feature (unlike `005-finch-integration`).
- On the first render and while the initial `/finch/status` fetch is in-flight, `isConnected` is `false` (connection is `null` in initial Redux state). The dashboard renders its existing onboarding/assessment-based UI as the fallback — no loading skeleton introduced for this interim state.
- When `/finch/status` returns any error (network failure, 4xx, 5xx), polling continues every 15 seconds unchanged. No error indicator is shown on the dashboard for status endpoint failures — the dashboard silently retains its current visible state.
- `latestSyncJob.status === "pending"` requires no UI treatment in this iteration. The decision on what badge or messaging to show for pending/processing sync states is deferred to a future feature.
- Polling fires unconditionally every 15 seconds. Stopping the poll when `connection.status === "connected"` is a known future optimisation explicitly out of scope for this feature.
- The `apiClient` already attaches the bearer token to all requests via a shared interceptor; `getFinchStatus()` requires no additional auth configuration.
- The existing `connectWithFinch()` function from `useFinchConnect.ts` already handles the full Finch overlay flow including toast errors and redirect; wiring the button requires no changes to that hook.
- `connection.status === "reauth_required"` is treated identically to `"disconnected"` for dashboard visibility purposes in this feature — both result in the normal (non-connected) onboarding view.
- No visual indicator (badge, banner, or status pill) for `connection.status` values other than hiding cards is introduced in this feature.
- The `finchStatusSlice` follows the same reducer/thunk/selector file structure as `dashboardSlice.ts`.

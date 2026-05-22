# Feature Specification: Finch Reauth Status Flag

**Feature Branch**: `031-finch-reauth-status`  
**Created**: 2026-05-01  
**Status**: Draft  
**Input**: User description: "Add finchConnectionStatus field support to useDashboardStatusPolling hook. Expose isReauthRequired flag when value is reauth_required. Conditionally show Reconnect to Finch card in DashboardPage. When reconnecting in this context skip navigation to additional-questions form. Update tests."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Dashboard Alerts User of Expired Finch Authorization (Priority: P1)

A user who previously connected their payroll provider via Finch has a session that has expired or been revoked. When they open the dashboard, they see a prominent warning card prompting them to reconnect. Without this alert, the user would not know their data is stale and their dashboard tabs may show incomplete results.

**Why this priority**: This is the core user-facing change. All other stories depend on the reauth status being correctly detected and surfaced.

**Independent Test**: Can be fully tested by mocking the `dashboards/status` API to return `finchConnectionStatus: "reauth_required"` and verifying the "Reconnect to Finch" card appears on the dashboard — delivers immediate user visibility into the reauth problem.

**Acceptance Scenarios**:

1. **Given** a logged-in user who has a Finch connection with `finchConnectionStatus: "reauth_required"`, **When** the dashboard loads and the status polling returns the API response, **Then** the "Reconnect to Finch" card is displayed on the dashboard.
2. **Given** `finchConnectionStatus` is `"connected"`, `"disconnected"`, or `"pending"`, **When** the dashboard loads, **Then** the "Reconnect to Finch" card is NOT displayed.
3. **Given** the status polling has not yet returned (no status data), **When** the dashboard renders, **Then** the "Reconnect to Finch" card is NOT displayed.

---

### User Story 2 - User Reconnects to Finch Without Being Redirected to Additional Questions (Priority: P1)

When a user clicks "Reconnect" on the reauth warning card, the Finch Connect flow opens. After successfully completing the reconnect, the user stays on the dashboard instead of being redirected to the additional-questions form. This is appropriate because the user already completed that onboarding step previously.

**Why this priority**: Equal in priority to Story 1 — the reconnect action must behave correctly or the user flow is broken. Sending a returning user back to additional-questions is a regression in user experience.

**Independent Test**: Can be tested by triggering the Finch reconnect flow from the reauth card, completing the Finch session, and confirming the user remains on the dashboard page without a redirect.

**Acceptance Scenarios**:

1. **Given** the "Reconnect to Finch" card is visible (reauth required), **When** the user clicks "Reconnect" and successfully completes the Finch Connect popup, **Then** the user remains on the dashboard and is NOT redirected to `/additional-questions`.
2. **Given** the user is in the normal first-time Finch connect flow (not reauth), **When** they complete the Finch Connect popup, **Then** they ARE still redirected to `/additional-questions` (existing behavior unchanged).
3. **Given** the Finch reconnect fails or the user closes the popup, **When** this occurs, **Then** an appropriate error is shown and the user stays on the dashboard.

---

### User Story 3 - Status Polling Hook Exposes Reauth Flag (Priority: P2)

The `useDashboardStatusPolling` hook derives a boolean `isReauthRequired` flag from the API response field `finchConnectionStatus`. This flag is consumed by the dashboard page to control the visibility of the reconnect card.

**Why this priority**: An internal data-layer concern that supports Stories 1 and 2. It can be tested independently via hook unit tests before the UI is wired up.

**Independent Test**: Can be fully tested by rendering the hook with a mocked API response and asserting `isReauthRequired` is `true` only when `finchConnectionStatus === "reauth_required"`.

**Acceptance Scenarios**:

1. **Given** the API returns `finchConnectionStatus: "reauth_required"`, **When** the hook processes the response, **Then** `isReauthRequired` is `true`.
2. **Given** the API returns `finchConnectionStatus: "connected"`, **When** the hook processes the response, **Then** `isReauthRequired` is `false`.
3. **Given** the API returns `finchConnectionStatus: "disconnected"` or `"pending"`, **When** the hook processes the response, **Then** `isReauthRequired` is `false`.
4. **Given** the hook is disabled or no status has been received, **When** accessed, **Then** `isReauthRequired` is `false`.

---

### Edge Cases

- What happens when `finchConnectionStatus` is absent from the API response (field not present)? → `isReauthRequired` must default to `false`.
- What happens when `finchConnectionStatus` contains an unexpected value not in the defined set? → `isReauthRequired` must remain `false` (strict equality check on `"reauth_required"`).
- What if the user clicks "Reconnect" multiple times rapidly? → The existing loading guard in `useFinchConnect` prevents duplicate calls.
- What if the Finch reconnect succeeds but the API still returns `reauth_required` on the next poll? → The card may briefly reappear until the status updates; this is acceptable behavior within the polling cadence.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The `dashboards/status` API response type MUST include the `finchConnectionStatus` field with possible values: `"connected"`, `"reauth_required"`, `"disconnected"`, `"pending"`.
- **FR-002**: The `useDashboardStatusPolling` hook MUST expose a boolean `isReauthRequired` flag that is `true` only when `finchConnectionStatus === "reauth_required"`.
- **FR-003**: The `isReauthRequired` flag MUST default to `false` when the status has not yet been received or `finchConnectionStatus` is absent or has any value other than `"reauth_required"`.
- **FR-004**: The dashboard page MUST display the "Reconnect to Finch" warning card only when `isReauthRequired` is `true`.
- **FR-005**: The "Reconnect to Finch" card MUST be hidden when `isReauthRequired` is `false`, regardless of other dashboard state.
- **FR-006**: The Finch Connect hook MUST support a "reconnect" mode that skips the post-success navigation to `/additional-questions`.
- **FR-007**: When the "Reconnect to Finch" card triggers the Finch flow, the flow MUST complete without redirecting the user away from the dashboard.
- **FR-008**: The existing first-time Finch connection flow (initiated from the non-reauth entry point) MUST continue to redirect to `/additional-questions` after success (no regression).
- **FR-009**: All new flags and type changes MUST be covered by updated or new unit tests for the hook and any affected utilities.

### Key Entities

- **`finchConnectionStatus`**: A new string field on the `DashboardStatusResponse` representing the Finch payroll connection health. Values: `"connected"` | `"reauth_required"` | `"disconnected"` | `"pending"`.
- **`isReauthRequired`**: A derived boolean flag in `UseDashboardStatusPollingReturn`. True only when `finchConnectionStatus === "reauth_required"`.
- **Reconnect to Finch Card**: The existing `DashboardCard` component in `DashboardPage` (currently always rendered) that warns about a Finch connection issue. Becomes conditionally rendered based on `isReauthRequired`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The "Reconnect to Finch" card appears on the dashboard within one polling cycle of the API returning `finchConnectionStatus: "reauth_required"`, and disappears when the status changes to any other value.
- **SC-002**: 100% of users who click "Reconnect" from the reauth card complete the flow and remain on the dashboard without being redirected to the additional-questions form.
- **SC-003**: 0 regressions — first-time Finch users continue to be redirected to additional-questions after connection as before.
- **SC-004**: All new and modified code paths have corresponding test coverage, with tests passing in CI.

## Assumptions

- The `finchConnectionStatus` field is added to the existing `dashboards/status` endpoint response by the backend team. The frontend only needs to consume it.
- The "Reconnect to Finch" card in `DashboardPage` at lines 540–553 is the only location that needs to be conditionally gated; no other UI elements need to change.
- The mechanism to skip the additional-questions redirect will be implemented by passing a flag or callback variant into `useFinchConnect` rather than creating a second hook.
- The polling hook already handles the `finchConnectionStatus` field being absent in earlier API responses gracefully via type-safe optional access.
- No backend changes are required beyond the API contract addition; the frontend is the sole scope of this feature.

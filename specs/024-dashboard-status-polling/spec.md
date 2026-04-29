# Feature Specification: Dashboard Status API Polling

**Feature Branch**: `024-dashboard-status-polling`  
**Created**: April 29, 2026  
**Status**: Draft  
**Input**: User description: "API Integration - Dashboard Status API Polling with automatic retry based on suggestPollMs until allSettled is true"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Auto-Polling Dashboard Status (Priority: P1)

When a user navigates to the dashboard after completing any workflow action (e.g., starting a Finch connection, submitting industry information), the system automatically polls the dashboard status endpoint at intervals specified by the API, without requiring any manual refresh or user interaction.

**Why this priority**: This is the core value of the feature—automatic status updates are essential for providing real-time feedback to users without blocking their workflow. It directly enables features like "Finch Connect Loading" and "Industry Status Flags" to work correctly.

**Independent Test**: Poll the status endpoint after an action triggers `allSettled: false`. Verify calls continue at API-specified intervals until `allSettled: true`, then stop automatically. This can be tested independently by mocking the API responses and verifying polling behavior in isolation.

**Acceptance Scenarios**:

1. **Given** the dashboard status endpoint returns `allSettled: false` with `suggestPollMs: 3000`, **When** the dashboard loads, **Then** the system should call the status endpoint immediately, then again after 3000ms, and continue polling at 3000ms intervals
2. **Given** polling is active with a 3000ms interval, **When** the user manually refreshes the page, **Then** the polling timer resets and the first call after refresh happens after a new 3000ms interval from the refresh time
3. **Given** polling is active, **When** the API response returns `allSettled: true`, **Then** polling stops immediately and no further status calls are made
4. **Given** the dashboard status endpoint returns different `suggestPollMs` values (e.g., 3000, 5000, 10000), **When** the system polls, **Then** it uses the most recently returned `suggestPollMs` for the next interval

---

### User Story 2 - Handle Dynamic Poll Interval Changes (Priority: P2)

The API may return different `suggestPollMs` values over time to dynamically adjust the polling frequency based on server load or business requirements. The system must respect these interval changes in real-time.

**Why this priority**: Allows backend to optimize polling frequency without code changes, improving server performance during high-load periods or accelerating updates when needed.

**Independent Test**: Receive two consecutive API responses with different `suggestPollMs` values. Verify the polling interval switches to the new value for the next poll.

**Acceptance Scenarios**:

1. **Given** polling at 3000ms returns `suggestPollMs: 5000`, **When** the next interval elapses, **Then** the subsequent poll waits 5000ms instead of 3000ms
2. **Given** polling at 5000ms returns `suggestPollMs: 3000`, **When** the next interval elapses, **Then** the subsequent poll waits 3000ms instead of 5000ms

---

### User Story 3 - Recovery from Transient Network Errors (Priority: P3)

If a poll request fails due to transient network errors, the system should retry with a reasonable backoff strategy before stopping and surfacing the error to the user.

**Why this priority**: Improves resilience for users with intermittent connectivity; prevents premature failure when temporary network glitches occur.

**Independent Test**: Simulate a failed API call; verify the system attempts retry logic (using a fallback interval or backoff) and surfaces an error only after exhausting retries.

**Acceptance Scenarios**:

1. **Given** a poll request fails with a network error, **When** the failure occurs, **Then** the system retries the request after a short backoff delay (suggested: 1-2 seconds)
2. **Given** a poll request fails multiple times consecutively, **When** max retries are exhausted, **Then** polling stops and an error state is set (specific error handling deferred to next phase)

---

### Edge Cases

- What happens if `suggestPollMs` is 0 or negative? → System should use a safe minimum (e.g., 1000ms) to prevent rapid-fire requests.
- What if the API returns `allSettled: true` on the first call? → Polling should never start (one initial call only, no continuous polling).
- What if the page is in a hidden/backgrounded state (browser tab inactive)? → [NEEDS CLARIFICATION: Should polling pause when tab is hidden, or continue in background?]
- What if a poll takes longer than `suggestPollMs` to complete? → System should use the interval from API response, not relative to request start time.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST call the dashboard status endpoint (`/api/v1/dashboard/status`) immediately when the dashboard mounts or when explicitly triggered by a workflow action
- **FR-002**: System MUST parse the `suggestPollMs` value from the API response and use it as the interval (in milliseconds) for the next poll
- **FR-003**: System MUST continue polling at the specified interval until the API response contains `allSettled: true`
- **FR-004**: System MUST stop polling immediately once `allSettled: true` is received and not make any further status calls
- **FR-005**: System MUST reset the polling timer if the user refreshes the page, so the next poll occurs `suggestPollMs` ms after the refresh
- **FR-006**: System MUST update the polling interval dynamically if consecutive API responses return different `suggestPollMs` values
- **FR-007**: System MUST handle poll request failures gracefully with retry logic before surfacing errors (implementation details deferred to error handling phase)
- **FR-008**: System MUST NOT make rapid-fire polling requests; if `suggestPollMs` is 0 or negative, use a safe minimum interval (e.g., 1000ms)
- **FR-009**: System MUST store the current status data (recommendation, workforce, industry, updatedAt, etc.) in component/hook state for consumption by UI components
- **FR-010**: System MUST expose a hook (`useDashboardStatusPolling` or similar) that encapsulates all polling logic and provides consumers with `status`, `isLoading`, and `error` states

### Key Entities

- **DashboardStatus**: Object representing the current state of all dashboard sections
  - `recommendation`: Section status with `status` (completed | pending | not_applicable) and `updatedAt` timestamp
  - `workforce`: Section status with `status` and `updatedAt` timestamp
  - `industry`: Section status with `status` and `updatedAt` timestamp
  - `allSettled`: Boolean indicating all sections have reached a final state
  - `suggestPollMs`: Number indicating milliseconds until next recommended poll
  - `updatedAt`: ISO timestamp of when the status was updated
  - `source`: "stored_state" | other source indicators
  - `createdAt`: ISO timestamp of when the status record was created
  - `providerType`: "automated" | "assisted" | null

- **PollingState**: Internal state tracking polling behavior
  - `isPolling`: Boolean indicating if active polling is in progress
  - `currentInterval`: Number representing the current polling interval in ms
  - `lastPollTime`: ISO timestamp of the last poll
  - `error`: Error state, if any (implementation deferred)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Polling initiates automatically when dashboard loads with `allSettled: false`, without user clicking any button or triggering manual refresh
- **SC-002**: Polling continues at the API-specified interval (`suggestPollMs`) ±200ms accuracy (within reasonable timer variance)
- **SC-003**: Polling stops within 100ms of receiving `allSettled: true` (no orphaned timers or continued requests)
- **SC-004**: When user refreshes the page, polling timer resets and the next poll occurs after a new full `suggestPollMs` interval (not shortened by the refresh)
- **SC-005**: Dynamic interval changes (different `suggestPollMs` values between responses) take effect on the next polling cycle with no delays or race conditions
- **SC-006**: Network failures are handled gracefully with retry logic before surfacing error state (error UX deferred to next phase)
- **SC-007**: All polling logic is encapsulated in a reusable hook that can be tested independently of UI components
- **SC-008**: Zero memory leaks from timers or event listeners when dashboard unmounts or polling completes

## Assumptions

- The API endpoint `/api/v1/dashboard/status` is publicly documented and available in the development, staging, and production environments.
- `suggestPollMs` is always a positive integer ≥ 0; if 0 or negative, a safe minimum (1000ms) will be applied.
- Browser timers (via `setInterval` or `setTimeout`) are sufficient for this polling pattern; no service worker or background task is required at this stage.
- Polling logic will be implemented in a custom React hook to keep state management and lifecycle isolated from UI rendering.
- Error handling strategy (retry count, backoff, user notification) will be defined in a future phase.
- The feature assumes the dashboard component will have a way to trigger polling start/stop (e.g., mounted/unmounted lifecycle or explicit trigger).

## Notes for Implementation Phase

- This specification covers **polling orchestration only** (timing, intervals, lifecycle). What to do with the fetched status data (e.g., update feature-specific UI, trigger dependent actions) is deferred to the next phase.
- Hook implementation should support both eager polling (start immediately on mount) and lazy polling (wait for explicit trigger).
- All timers must be properly cleaned up in component `useEffect` cleanup functions to prevent memory leaks.
- Unit tests should mock `setTimeout` or use a fake timer library (e.g., `vitest.useFakeTimers()`) to verify polling intervals without actual delays.

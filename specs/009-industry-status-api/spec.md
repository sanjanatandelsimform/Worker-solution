# Feature Specification: Conditional Industry API Call Based on Status Response

**Feature Branch**: `009-industry-status-api`  
**Created**: 15 April 2026  
**Status**: Draft  
**Input**: User description: "Conditional Industry API Call Based on Status Response — When the user clicks Industry or Finch Industry tab, check `connection.industry` from the status API. If `"fetch"`, call the Industry API; show skeleton loader while loading; display data once loaded."

## Clarifications

### Session 2026-04-15

- Q: Which endpoint provides `connection.industry` — a new `/status` endpoint, the existing `/finch/status`, or the assessment status endpoint? → A: The existing `/finch/status` endpoint, extended with an `industry` field on the connection object.
- Q: When `connection.industry` changes after data is already loaded (e.g., `"fetch"` → `null` during polling), what should happen? → A: Once loaded, keep showing industry data for the session; only re-fetch on full page reload.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Load Industry Data on Tab Click When Status Permits (Priority: P1)

A user has completed an assessment and navigates to the Dashboard. They click the **Industry** tab. The system checks the status API response to determine whether industry data is available. Because the status indicates `industry: "fetch"`, the system calls the Industry API. While the data is being retrieved, a skeleton loader occupies the Industry tab content area. Once the response arrives, the skeleton is replaced with the fully rendered industry data (overview metrics, turnover rates, separation rates, area median wages, and housing burden).

**Why this priority**: This is the core value of the feature — conditionally fetching industry data only when the backend signals readiness. Without this, either no data loads or data is fetched unnecessarily.

**Independent Test**: Can be fully tested by logging in with a user whose status API returns `industry: "fetch"`, navigating to Dashboard, clicking the Industry tab, and verifying that data loads after a visible skeleton.

**Acceptance Scenarios**:

1. **Given** the status API response contains `connection.industry === "fetch"`, **When** the user clicks the Industry tab, **Then** the system initiates a call to the Industry API and displays a skeleton loader immediately.
2. **Given** the Industry API call is in progress, **When** the data returns successfully, **Then** the skeleton loader is replaced with the rendered industry data (overview cards, turnover rate charts, separation rate charts, wage comparisons, and housing burden data).
3. **Given** the status API response contains `connection.industry === "fetch"`, **When** the user clicks the Industry tab a second time (data already loaded), **Then** the previously fetched data is shown instantly without a new API call or skeleton.

---

### User Story 2 — Load Finch Industry Data on Tab Click When Status Permits (Priority: P1)

A user who has completed a Finch integration sees the **Finch Industry** tab on the Dashboard. Clicking it triggers the same conditional logic: if `connection.industry === "fetch"`, the Industry API is called, a skeleton loader is displayed while loading, and data is rendered upon completion.

**Why this priority**: Equal priority to Story 1 because the Finch Industry tab uses the same conditional logic and data source. Both tabs must work for the feature to be complete.

**Independent Test**: Can be tested by logging in with a user with a completed Finch connection and `industry: "fetch"`, clicking the Finch Industry tab, and verifying skeleton → data transition.

**Acceptance Scenarios**:

1. **Given** the status API response contains `connection.industry === "fetch"` and the user has a completed Finch connection, **When** the user clicks the Finch Industry tab, **Then** the system calls the Industry API and shows a skeleton loader.
2. **Given** the Industry API returns data, **When** the Finch Industry tab content renders, **Then** the Finch-specific industry data is displayed correctly.

---

### User Story 3 — Suppress Industry API Call When Status Indicates No Data (Priority: P2)

A user navigates to the Industry tab (or Finch Industry tab), but the status API response contains `connection.industry === null`. The system does NOT call the Industry API. Instead, the tab displays the existing UI state (empty state or cached data, depending on what the existing design already handles).

**Why this priority**: This prevents unnecessary API calls and avoids confusing the user with loading indicators when no data is available.

**Independent Test**: Can be tested by logging in with a user whose status API returns `industry: null`, clicking the Industry tab, and verifying that no Industry API call is made and no skeleton loader appears.

**Acceptance Scenarios**:

1. **Given** the status API response contains `connection.industry === null`, **When** the user clicks the Industry tab, **Then** no Industry API call is made and no skeleton loader is shown.
2. **Given** the status API response contains `connection.industry === null`, **When** the user clicks the Finch Industry tab, **Then** no Industry API call is made and no skeleton loader is shown.

---

### User Story 4 — Skeleton Loader During Data Retrieval (Priority: P2)

While the Industry API call is in progress, the user sees skeleton loaders that match the layout of the final content. This provides a smooth visual transition and signals to the user that content is loading.

**Why this priority**: Skeleton loaders improve perceived performance and prevent layout shift. The user requirement explicitly calls for skeleton loaders.

**Independent Test**: Can be tested by simulating a slow Industry API response and verifying the skeleton loader renders in the correct layout positions within the Industry and Finch Industry tabs.

**Acceptance Scenarios**:

1. **Given** the Industry API call is in progress, **When** the Industry tab is displayed, **Then** skeleton loaders appear in place of the overview cards, turnover rate cards, salary charts, and housing burden sections.
2. **Given** the Industry API call completes, **When** the data renders, **Then** there is no visible layout shift between the skeleton and the actual content.

---

### Edge Cases

- What happens if the status API itself fails or returns an unexpected response shape? The system should treat `connection.industry` as `null` and skip the Industry API call.
- What happens if the Industry API call fails (network error, server error)? The system should stop the skeleton loader and display an appropriate error state within the tab.
- What happens if the user rapidly switches between tabs while the Industry API is loading? The system should not trigger duplicate API calls; if data is already being fetched, subsequent tab clicks should wait for the in-progress response.
- What happens if `connection.industry` has a value other than `"fetch"` or `null`? The system should treat any value other than `"fetch"` as equivalent to `null` (no API call).
- What happens if the user navigates away from the Dashboard while the Industry API is loading? The in-flight request should be handled gracefully (no orphan state updates).
- What happens if `connection.industry` transitions from `"fetch"` to `null` (or vice versa) during the session via polling? Once industry data is loaded, the system keeps displaying it for the session. A re-fetch only occurs on a full page reload.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST read the `connection.industry` field from the status API response before deciding whether to call the Industry API.
- **FR-002**: System MUST call the Industry API when `connection.industry === "fetch"` and the user activates the Industry tab or Finch Industry tab.
- **FR-003**: System MUST NOT call the Industry API when `connection.industry` is `null` or any value other than `"fetch"`.
- **FR-004**: System MUST display a skeleton loader in the Industry or Finch Industry tab content area while the Industry API call is in progress.
- **FR-005**: System MUST replace the skeleton loader with the rendered industry data once the Industry API call completes successfully.
- **FR-006**: System MUST display an error state within the tab if the Industry API call fails.
- **FR-007**: System MUST NOT trigger duplicate Industry API calls if the user clicks the same tab multiple times while a request is already in progress.
- **FR-008**: System MUST reuse previously fetched industry data when the user revisits the Industry or Finch Industry tab. Data is session-scoped: once loaded, it persists until a full page reload regardless of subsequent status polling changes.
- **FR-009**: System MUST treat a failed or malformed status API response as `connection.industry === null` (fail-safe: do not call Industry API).
- **FR-010**: System MUST follow the existing API calling pattern used in the Profile Settings module (service layer → state management → hook → component consumption).

### Key Entities

- **Status Response**: Returned by the existing `/finch/status` endpoint (extended with an `industry` field on the connection object). Key attribute: `connection.industry` (`"fetch"` | `null`). Drives conditional data loading. The `useFinchStatus` hook already polls this endpoint every 15 seconds, so the `industry` field is available without an additional API call.
- **Industry Data**: Represents the industry benchmark information for the user's company. Contains: industry overview (turnover rate, average turnover, industry-wide cost), turnover rate breakdown (voluntary/involuntary for industry vs. company), separation rate (industry vs. company), area median wage (per zip code with state/national comparisons), and housing burden (per zip code with owner/renter/working-class breakdowns).
- **Skeleton Loader State**: A transient visual state shown while industry data is being fetched. Matches the layout of the final rendered content to prevent layout shift.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users see industry data rendered within 3 seconds of clicking the Industry or Finch Industry tab (assuming standard network conditions).
- **SC-002**: A skeleton loader is visible for the entire duration of data fetching — no blank content area or flash of empty state.
- **SC-003**: Zero unnecessary Industry API calls are made when `connection.industry` is `null` — verifiable by monitoring network requests.
- **SC-004**: Repeated clicks on the same tab do not trigger additional API calls once data has been successfully loaded.
- **SC-005**: If the Industry API fails, the user sees a clear indication that data could not be loaded (no infinite skeleton, no silent failure).
- **SC-006**: No existing UI or design is modified — only API integration logic and skeleton loading states are added.

## Assumptions

- The `/finch/status` endpoint (already polled every 15 seconds by `useFinchStatus`) is being extended with a `connection.industry` field. No new endpoint is needed — the existing hook and Redux state can be extended to expose this field to the Industry/Finch Industry tab components.
- The Industry API endpoint already exists on the backend and returns the response shape documented in this spec.
- The existing skeleton loader components in `BenchmarkPage.tsx` (e.g., `OverviewCardSkeleton`, `TurnoverRateCardSkeleton`) are suitable for reuse during the loading state.
- The design for the Industry and Finch Industry tabs is already complete and should not be modified — only the data-fetching and loading-state logic is in scope.
- The same Industry API call serves both the Industry tab and the Finch Industry tab (both consume the same data source).

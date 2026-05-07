# Feature Specification: Defer Tab API Calls Until Tab Is Ready

**Feature Branch**: `033-defer-tab-api`  
**Created**: 2026-05-05  
**Status**: Draft  
**Input**: User description: "We have dashboard in that we have three tabs, For three tabs, we have each API call Workforce (WorkforcePage.tsx) Industry (BenchmarkFinchPage.tsx) Recommendation (RecommendationsFinchPage.tsx) Currently the API calls happens when user lands on the dashboard. I have a dashboard/status API (useDashboardStatusPolling.ts) And in that three flags, If each tab Is ready or not.. I want to call the API for the each tabs only when we have the tabs ready (useDashboardStatusPolling.ts). Please make sure to update and also make sure to update the test cases and update it as well"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Workforce Data Loads Only When Ready (Priority: P1)

When a user lands on the dashboard and Finch is connected, the Workforce tab data fetch must not start until `isWorkforceTabReady` becomes `true` in the dashboard status polling response. Until that flag is `true`, the Workforce tab displays its loading/skeleton state without triggering an API call.

**Why this priority**: Calling the Workforce API before the back-end has finished processing the Finch payload can return empty or stale data, producing a broken or misleading UI. Blocking the fetch until the tab is marked ready eliminates this problem and is the core of this request.

**Independent Test**: Mount `DashboardPage` with Finch connected but `isWorkforceTabReady = false`. Assert `fetchWorkforce` has NOT been dispatched. Change `isWorkforceTabReady` to `true` and assert `fetchWorkforce` IS dispatched exactly once.

**Acceptance Scenarios**:

1. **Given** the user is on the dashboard with Finch connected and `isWorkforceTabReady` is `false`, **When** the page mounts, **Then** the workforce API is NOT called and the Workforce tab shows its skeleton state.
2. **Given** `isWorkforceTabReady` transitions from `false` to `true` during polling, **When** the flag becomes `true`, **Then** the workforce API is called exactly once.
3. **Given** `isWorkforceTabReady` is already `true` when the page first mounts, **When** the page mounts, **Then** the workforce API is called immediately (existing behaviour preserved).

---

### User Story 2 - Recommendations Data Loads Only When Ready (Priority: P1)

The Recommendations tab data fetch (workforce slice + recommendations slice) must not start until `isRecommendationTabReady` is `true`. Until that flag is satisfied, the Recommendations tab shows its loading/skeleton state.

**Why this priority**: Same class of problem as the Workforce story — equal priority.

**Independent Test**: Mount `DashboardPage` with assessment completed or Finch connected but `isRecommendationTabReady = false`. Assert neither `fetchRecommendations` nor the dependent `fetchWorkforce` have been dispatched. Flip the flag to `true` and verify both dispatches occur.

**Acceptance Scenarios**:

1. **Given** `isRecommendationTabReady` is `false` on mount, **When** the page loads, **Then** `fetchRecommendations` is NOT dispatched.
2. **Given** `isRecommendationTabReady` transitions to `true`, **When** the flag flips, **Then** `fetchRecommendations` is dispatched exactly once.
3. **Given** `isRecommendationTabReady` is already `true` on mount, **When** the page mounts, **Then** `fetchRecommendations` is dispatched immediately (existing behaviour preserved).

---

### User Story 3 - Industry Data Loads Only When Ready (Priority: P2)

The Industry (Benchmark) tab data fetch must not start until `isIndustryTabReady` is `true`. The fetch guard must be respected whether the control lives in the hook or its call site. Until satisfied, the Industry tab shows skeleton cards.

**Why this priority**: Same problem as P1 stories; lower priority because the Industry tab is less prominent in the primary user flow.

**Independent Test**: Mount `BenchmarkFinchPage` (or the hook it uses) with `isReady = false` / `enabled = false` and assert that `fetchIndustry` has not been dispatched. Flip the flag to `true` and verify the dispatch occurs once.

**Acceptance Scenarios**:

1. **Given** `isIndustryTabReady` is `false` on mount, **When** the page loads, **Then** the industry API is NOT called and the Industry tab renders skeleton cards.
2. **Given** `isIndustryTabReady` transitions to `true`, **When** the flag flips, **Then** the industry API is dispatched exactly once.
3. **Given** `isIndustryTabReady` is already `true` on mount, **When** the page mounts, **Then** the industry API is dispatched immediately.

---

### Edge Cases

- What happens when a tab readiness flag is already `true` on the very first polling response? The API call must execute immediately with no extra delay.
- What happens if dashboard status polling is not enabled (assessment not completed, Finch not connected)? Existing fetch behaviour remains unchanged; readiness gating only applies when polling is active.
- What happens if polling ends before a tab becomes ready (e.g., `hasExceededProcessingWindow` is reached)? Tabs remain in their current state; no fallback fetch is triggered on expiry — the stale-state UI handles that presentation.
- What happens if a tab readiness flag is `true` but the Redux store already has data loaded? The fetch guard must be idempotent and must NOT re-dispatch; existing `isLoaded` guards in the store slices handle this.
- What happens if two readiness flags become `true` in the same polling cycle? Each corresponding API call fires independently without duplication.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST NOT dispatch `fetchWorkforce` until `isWorkforceTabReady` is `true`.
- **FR-002**: The system MUST NOT dispatch `fetchRecommendations` until `isRecommendationTabReady` is `true`.
- **FR-003**: The system MUST NOT dispatch `fetchIndustry` until `isIndustryTabReady` is `true`.
- **FR-004**: Each tab data fetch MUST be dispatched exactly once when its corresponding readiness flag transitions to `true`.
- **FR-005**: When a tab readiness flag is already `true` on initial render, the data fetch MUST fire immediately without waiting for a subsequent polling cycle.
- **FR-006**: Each tab MUST display its existing skeleton/loading state for the entire duration that its readiness flag is `false`.
- **FR-007**: Readiness gating MUST only activate when dashboard status polling is enabled (`shouldPollDashboardStatus` is `true`). When polling is disabled, existing fetch behaviour MUST remain unchanged.
- **FR-008**: The implementation MUST NOT introduce duplicate API calls for any tab regardless of how many times the readiness flag is observed as `true`.
- **FR-009**: All affected test files MUST be updated to cover both the "not ready → no fetch" and "ready → fetch" scenarios for each tab.

### Key Entities

- **Tab Readiness Flag**: A boolean derived from `useDashboardStatusPolling` (`isWorkforceTabReady`, `isRecommendationTabReady`, `isIndustryTabReady`). A flag is `true` when the back-end status for that tab is `"completed"` or `"not_applicable"`.
- **Dashboard Status Polling**: The `useDashboardStatusPolling` hook that periodically queries the back-end for per-tab processing state and exposes the three readiness flags.
- **Tab Data Fetch**: A Redux async thunk (`fetchWorkforce`, `fetchRecommendations`, `fetchIndustry`) that retrieves display data for the corresponding tab.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Zero unnecessary API calls are made to workforce, recommendations, or industry endpoints while any tab readiness flag is `false` — verifiable by test assertions on dispatch spies.
- **SC-002**: When any readiness flag transitions to `true`, the corresponding API call fires within the same render cycle — verifiable by unit test.
- **SC-003**: All existing dashboard, workforce, industry, and recommendations tests continue to pass after the change with no regressions.
- **SC-004**: New test cases covering the deferred-fetch scenarios are added for each of the three tabs, increasing measurable coverage of the readiness-gating logic.
- **SC-005**: Users whose tab statuses arrive as already-ready on first load continue to see data displayed correctly with no visible change in behaviour.

## Assumptions

- The three readiness flags already exist and are correctly computed in `useDashboardStatusPolling`; no changes to their derivation logic are required by this feature.
- The `isReady` prop already flows into `WorkforcePage`, `BenchmarkFinchPage`, and `RecommendationsFinchPage` for display-layer skeleton gating. This feature extends the gate to the data-fetch layer.
- The `useIndustry` hook currently does not accept an `enabled` flag; adding one (or gating the dispatch inside the hook on a prop/param) is in scope for this feature.
- The Redux slices for workforce, recommendations, and industry each have their own `isLoaded` guard that prevents redundant re-fetches once data is present — this feature relies on that guard remaining in place.

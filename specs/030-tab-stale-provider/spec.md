# Feature Specification: Tab Stale State & Provider-Aware Preparing Messages

**Feature Branch**: `030-tab-stale-provider`  
**Created**: 2026-05-01  
**Status**: Draft  
**Input**: User description: "Update isStale prop to include isConnected guard; make PreparingDashboard accept a custom description; expose isAutomatedProvider flag from polling hook; pass correct timed message (24-36 h vs 2 weeks) based on provider type; store messages in constants; update tests."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Finch-Connected User Sees Preparing State, Not Skeleton (Priority: P1)

A user who has completed the Finch payroll connection flow arrives at their dashboard while data is still being processed. Instead of the generic loading skeleton, all three dashboard tabs (Recommendations, Workforce, Industry) display the "Preparing your dashboard" screen — communicating clearly that their data is in progress and they will be notified when ready.

A user who has NOT completed the Finch flow (e.g., completed a manual assessment) should continue to see the standard skeleton loading state, not the Preparing dashboard screen.

**Why this priority**: Incorrectly showing the Preparing screen to non-Finch users would confuse them, since they have no pending Finch processing. Gating this experience on Finch-connection status is a correctness fix that affects all dashboard users.

**Independent Test**: Can be tested by toggling the Finch connection flag on/off and verifying which loading UI each tab renders when tab data is still processing.

**Acceptance Scenarios**:

1. **Given** a user has completed the Finch connection flow AND a dashboard tab's data is still being processed, **When** the user visits that tab, **Then** the "Preparing your dashboard" screen is shown (not a skeleton).
2. **Given** a user has NOT completed the Finch connection flow AND a tab's data is still being processed, **When** the user visits that tab, **Then** the standard skeleton loading state is shown (not the Preparing screen).
3. **Given** a user has completed the Finch flow AND a tab's data has finished processing, **When** the user visits that tab, **Then** the full tab content is displayed (neither skeleton nor Preparing screen).

---

### User Story 2 - Provider-Aware Processing Time Message (Priority: P2)

When the "Preparing your dashboard" screen is displayed, the message shown to the user should accurately reflect the expected processing time based on their payroll provider type:

- If the provider uses automated data transfer ("automated" provider type), the message should indicate **24-36 hours** as the expected processing window.
- If the provider requires a manual/assisted data transfer (any other provider type), the message should indicate **up to 2 weeks** as the expected processing window.

This ensures users have accurate expectations and reduces support inquiries related to mismatched time estimates.

**Why this priority**: Telling an "assisted" provider user to expect 24-36 hours would create false expectations and increase support load. The messaging must reflect the actual service-level window for the user's provider type.

**Independent Test**: Can be tested by setting the provider type to "automated" vs. non-automated and verifying which message text is rendered inside the Preparing dashboard screen on each tab.

**Acceptance Scenarios**:

1. **Given** a Finch-connected user whose payroll provider uses automated data transfer, **When** any dashboard tab is in the preparing state, **Then** the message reads: _"Finch is working hard with your payroll provider to create your custom dashboard. This may take 24-36 hours. We'll send an email once your setup is complete."_
2. **Given** a Finch-connected user whose payroll provider uses non-automated (assisted) data transfer, **When** any dashboard tab is in the preparing state, **Then** the message reads: _"Finch is working hard with your payroll provider to create your custom dashboard. This may take up to 2 weeks. We'll send an email once your setup is complete."_
3. **Given** the provider type information is unavailable, **When** a dashboard tab is in the preparing state, **Then** the "up to 2 weeks" message is shown as the safe default.

---

### User Story 3 - Per-Tab Custom Preparing Message (Priority: P3)

Each dashboard tab (Recommendations, Workforce, Industry) should be able to display its own custom description text inside the "Preparing your dashboard" screen. This enables future tab-specific messaging without changes to the Preparing screen component itself.

**Why this priority**: Although all three tabs currently use the same provider-based message, making the description a configurable input prepares the system for tab-specific copy divergence and eliminates any tight coupling between the Preparing screen and a single hardcoded string.

**Independent Test**: Can be tested by passing different description text to the Preparing screen from each tab and verifying the correct text is rendered per tab.

**Acceptance Scenarios**:

1. **Given** the Recommendations tab is in the preparing state, **When** it renders the Preparing screen, **Then** the description text passed from the Recommendations tab is displayed.
2. **Given** the Workforce tab is in the preparing state, **When** it renders the Preparing screen, **Then** the description text passed from the Workforce tab is displayed.
3. **Given** the Industry tab is in the preparing state, **When** it renders the Preparing screen, **Then** the description text passed from the Industry tab is displayed.

---

### Edge Cases

- What happens when the provider type is `null` or unrecognized? → The system should fall back to the "up to 2 weeks" message (non-automated default).
- What happens when `isConnected` is `false` but the stale flag is `true`? → The Preparing screen must NOT be shown; the standard skeleton is used.
- What happens when a tab's data finishes processing (stale flag clears) while the user is viewing the Preparing screen? → The screen should give way to the full tab content on the next render cycle.
- What happens when the provider type changes mid-session (e.g., webhook updates)? → The message should reflect the latest known provider type from the polling response.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The "Preparing your dashboard" screen on each tab MUST only be shown when the user has completed the Finch payroll connection flow (i.e., is connected via Finch).
- **FR-002**: When a user has NOT completed the Finch flow, each dashboard tab MUST display the standard skeleton loading state (not the Preparing screen) while data is loading.
- **FR-003**: Each dashboard tab's stale/preparing condition MUST incorporate the Finch-connection status so that non-Finch users are never routed to the Preparing screen.
- **FR-004**: The dashboard status polling data source MUST expose whether the user's payroll provider uses automated data transfer, as a boolean flag.
- **FR-005**: The "Preparing your dashboard" screen MUST accept the description/message text as an external input so that each tab can supply its own copy.
- **FR-006**: When the provider uses automated data transfer, the Preparing screen description MUST read: _"Finch is working hard with your payroll provider to create your custom dashboard. This may take 24-36 hours. We'll send an email once your setup is complete."_
- **FR-007**: When the provider does NOT use automated data transfer (or the provider type is unknown), the Preparing screen description MUST read: _"Finch is working hard with your payroll provider to create your custom dashboard. This may take up to 2 weeks. We'll send an email once your setup is complete."_
- **FR-008**: The two message strings (24-36 hours and up to 2 weeks) MUST be defined in a single shared constants location and reused across all three tabs rather than duplicated inline.
- **FR-009**: All three tabs (Recommendations, Workforce, Industry) MUST receive and correctly apply the automated-provider flag to select and pass the appropriate message to the Preparing screen.
- **FR-010**: All existing and new behaviors MUST be covered by automated tests; tests MUST pass after implementation.

### Key Entities

- **Finch Connection Status**: Whether the user has completed the Finch payroll integration; used to gate the Preparing screen vs. skeleton display.
- **Provider Type**: Indicates how the payroll provider transfers data — `"automated"` (fast, 24-36 h) or `"assisted"`/null (slower, up to 2 weeks).
- **Tab Stale Flag**: Per-tab boolean indicating that a tab's data is pending and has exceeded the initial processing window — combined with Finch connection status to determine whether to show the Preparing screen.
- **Preparing Screen Description**: The body text displayed beneath the "Preparing your dashboard" heading; varies by provider type and must be supplied by the parent tab.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Non-Finch users (manual assessment only) never see the "Preparing your dashboard" screen on any tab — 100% of such sessions show the skeleton state when data is loading.
- **SC-002**: Finch-connected users with an automated provider type see the "24-36 hours" message — verified across all three tabs with zero instances of the "2 weeks" message appearing for automated providers.
- **SC-003**: Finch-connected users with a non-automated provider type see the "up to 2 weeks" message — verified across all three tabs with zero instances of the "24-36 hours" message appearing for non-automated providers.
- **SC-004**: The two message strings exist in exactly one shared location in the codebase; no tab-level files contain inline duplicates of these strings.
- **SC-005**: All automated tests (unit + integration) pass without modification to test expectations for unchanged behavior; new behaviors are covered by new or updated tests.

## Assumptions

- `isConnected` (from the assessment status hook) is the correct and reliable indicator of whether a user has completed the Finch payroll connection flow.
- `providerType === "automated"` is the exact condition for the 24-36 hour message; all other values (`"assisted"`, `null`, or any unrecognized value) fall back to the "up to 2 weeks" message.
- The three tab pages (Recommendations, Workforce, Industry) are the only consumers of the `PreparingDashboard` component that need provider-aware messaging.
- No UI or copy changes are needed to the main heading ("Preparing your dashboard") — only the description paragraph changes.
- Tests should cover: stale + connected = Preparing screen shown; stale + not connected = skeleton shown; automated provider = 24-36 h message; non-automated provider = 2-week message.

## Files to Modify

- `src/pages/recommendations/PreparingDashboard.tsx` — accept `description` prop
- `src/hooks/useDashboardStatusPolling.ts` — expose `isAutomatedProvider` flag (`providerType === "automated"`)
- `src/types/dashboardStatusTypes.ts` — add `isAutomatedProvider: boolean` to `UseDashboardStatusPollingReturn`
- `src/pages/dashboard/DashboardPage.tsx` — update `isStale` to `isXxxTabStale && isConnected`; destructure and pass `isAutomatedProvider` to each tab
- `src/pages/recommendations/RecommendationsFinchPage.tsx` — accept `isAutomatedProvider` prop; pass correct message to `PreparingDashboard`
- `src/pages/benchmark/BenchmarkFinchPage.tsx` — accept `isAutomatedProvider` prop; pass correct message to `PreparingDashboard`
- `src/pages/workforce/WorkforcePage.tsx` — accept `isAutomatedProvider` prop; pass correct message to `PreparingDashboard`

## Files to Create

- `src/constants/preparingDashboardMessages.ts` — the two shared message strings + any related exports

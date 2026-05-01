# Feature Specification: Show Preparing Dashboard Component Based on a Condition

**Feature Branch**: `029-tab-preparing-state`  
**Created**: 2026-05-01  
**Status**: Draft  
**Input**: User description: "Show Preparing the dashboard component based on a condition. In useDashboardStatusPolling.ts, API response we get the three tab's information like status and updatedAt. Calculate if each tab's updatedAt time is longer than 5 minutes as compared to current time AND the tab's status is pending. Expose three flags for each. Pass that flag to each three tabs workforce, recommendation and industry. If that flag is true, inside the each tab's file, show <PreparingDashboard /> instead of the tab's children."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Tab Shows Preparing State When Data Is Stale and Pending (Priority: P1)

A user navigates to a dashboard tab (Recommendations, Workforce, or Industry/Benchmark). The polling hook has determined that a specific tab's `updatedAt` timestamp is more than 5 minutes in the past **and** the tab's status is still `pending`. Instead of seeing the regular tab content with skeleton loaders, the user sees the `PreparingDashboard` component — a friendly message explaining that data preparation is in progress.

**Why this priority**: This is the core deliverable. Without it, users on slow-processing assessments see confusing skeleton states indefinitely instead of a clear "preparing" message.

**Independent Test**: Can be fully tested by mocking the polling hook to return a stale-pending flag as `true` for one tab, navigating to that tab, and asserting the `PreparingDashboard` component is rendered while the regular content is absent.

**Acceptance Scenarios**:

1. **Given** a tab's `updatedAt` is more than 5 minutes ago **and** that tab's status is `pending`, **When** the user views that tab, **Then** only `<PreparingDashboard />` is shown; all other tab content is hidden.
2. **Given** a tab's `updatedAt` is less than 5 minutes ago **and** that tab's status is `pending`, **When** the user views that tab, **Then** the normal tab content (with skeleton loaders if data is loading) is shown — NOT `<PreparingDashboard />`.
3. **Given** a tab's status is `completed` or `not_applicable` regardless of `updatedAt`, **When** the user views that tab, **Then** the normal tab content is shown — NOT `<PreparingDashboard />`.

---

### User Story 2 - Stale Detection Flags Are Exposed by the Polling Hook (Priority: P2)

A developer or consumer of `useDashboardStatusPolling` expects three new boolean flags: `isRecommendationTabStale`, `isWorkforceTabStale`, and `isIndustryTabStale`. Each flag is `true` when the corresponding tab's `updatedAt` is older than 5 minutes relative to the current time **and** that tab's status is `pending`.

**Why this priority**: The flags must be computed and exposed before any tab page can consume them. This is a prerequisite for User Story 1.

**Independent Test**: Can be fully tested by unit-testing the hook in isolation: mock API responses with various `updatedAt` + `status` combinations and assert each flag value.

**Acceptance Scenarios**:

1. **Given** API returns `recommendation.status = "pending"` and `recommendation.updatedAt` is 6 minutes ago, **When** the hook processes the response, **Then** `isRecommendationTabStale` is `true`.
2. **Given** API returns `workforce.status = "pending"` and `workforce.updatedAt` is 3 minutes ago, **When** the hook processes the response, **Then** `isWorkforceTabStale` is `false`.
3. **Given** API returns `industry.status = "completed"` regardless of `updatedAt`, **When** the hook processes the response, **Then** `isIndustryTabStale` is `false`.
4. **Given** API returns `updatedAt` as `null` for a tab with `status = "pending"`, **When** the hook processes the response, **Then** the corresponding stale flag is `false` (treat missing timestamps as safe defaults).

---

### User Story 3 - Each Tab Page Accepts and Responds to the Stale Flag Prop (Priority: P3)

Each tab page component (`RecommendationsFinchPage`, `WorkforcePage`, `BenchmarkFinchPage`) accepts a new `isStale` (or similarly named) boolean prop. When `true`, the component renders only `<PreparingDashboard />` and suppresses all child components. When `false` or absent (defaults to `false`), normal rendering behaviour is unchanged.

**Why this priority**: Tab-level rendering logic is the visible consumer of the flags from User Story 2.

**Independent Test**: Render each tab page component in isolation with `isStale={true}` and assert `<PreparingDashboard />` renders; render with `isStale={false}` (or no prop) and assert normal child content renders.

**Acceptance Scenarios**:

1. **Given** `isStale={true}` is passed to `RecommendationsFinchPage`, **When** the component renders, **Then** only `<PreparingDashboard />` is visible.
2. **Given** `isStale={true}` is passed to `WorkforcePage`, **When** the component renders, **Then** only `<PreparingDashboard />` is visible.
3. **Given** `isStale={true}` is passed to `BenchmarkFinchPage`, **When** the component renders, **Then** only `<PreparingDashboard />` is visible.
4. **Given** `isStale={false}` (default) is passed to any tab page, **When** the component renders, **Then** normal content is rendered without `<PreparingDashboard />`.

---

### Edge Cases

- What happens when `updatedAt` is `null` for a tab? → Treat as not-stale (flag stays `false`); do not crash.
- What happens when the API has not yet returned any data (status is `null`)? → All stale flags default to `false`; `<PreparingDashboard />` is NOT shown.
- What happens when a tab transitions from stale-pending to completed mid-session? → The flag flips to `false` on the next polling update and normal content reappears.
- What happens when the clock skew causes `updatedAt` to be in the future? → Treat elapsed time as 0; flag is `false`.
- What happens when all three tabs are stale at the same time? → Each tab independently shows `<PreparingDashboard />` when the user navigates to it.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The dashboard status polling hook MUST compute a per-tab boolean flag indicating whether a tab's data is "stale and pending": tab `status === "pending"` AND tab `updatedAt` parsed as a timestamp is more than 5 minutes before the current time.
- **FR-002**: The hook MUST expose three new flags in its return value: one for the Recommendations tab, one for the Workforce tab, and one for the Industry tab.
- **FR-003**: Each flag MUST default to `false` when the API has not yet returned data or when `updatedAt` is absent/unparseable.
- **FR-004**: The `DashboardPage` (or equivalent orchestrator) MUST pass each tab's stale flag to the corresponding tab page component as a prop.
- **FR-005**: `RecommendationsFinchPage` MUST render only `<PreparingDashboard />` when its stale prop is `true`, suppressing all other child components.
- **FR-006**: `WorkforcePage` MUST render only `<PreparingDashboard />` when its stale prop is `true`, suppressing all other child components.
- **FR-007**: `BenchmarkFinchPage` MUST render only `<PreparingDashboard />` when its stale prop is `true`, suppressing all other child components.
- **FR-008**: The stale flag prop MUST default to `false` in each tab page component so existing callers without the prop are unaffected.
- **FR-009**: All existing unit tests MUST continue to pass; new tests MUST be added for the three stale flags in the hook and for the `<PreparingDashboard />` rendering path in each tab page.
- **FR-010**: The TypeScript type for the hook's return value MUST be updated to include the three new stale flag properties.

### Key Entities

- **Tab Staleness Flag**: A boolean derived from a tab's `updatedAt` + `status` from `DashboardStatusResponse`. Is `true` only when `status === "pending"` AND `Date.now() - Date.parse(updatedAt) > 300_000`.
- **DashboardStatusResponse Tab Section**: The `recommendation`, `workforce`, and `industry` sub-objects, each carrying a `status` and `updatedAt` field.
- **PreparingDashboard Component**: A standalone presentational component that renders a friendly "preparing" message and image, used as the fallback UI when a tab's data is stale.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: When a tab's data has been in `pending` state for over 5 minutes, users see the `PreparingDashboard` view within one polling cycle of the condition being met.
- **SC-002**: When a tab's data transitions to `completed` or `not_applicable`, users see normal tab content restored within one polling cycle — no manual refresh required.
- **SC-003**: The three new stale flags have 100% unit-test coverage for all defined combinations (stale-pending, fresh-pending, completed, not_applicable, null updatedAt, null status).
- **SC-004**: All pre-existing tests pass without modification to their assertions (backward compatibility is fully preserved).
- **SC-005**: The build (`pnpm run build`) and test suite (`pnpm run test`) both complete without errors after implementation.

## Assumptions

- The 5-minute staleness threshold matches the existing `PROCESSING_WINDOW_MS = 300_000` constant already defined in the hook; no new constant is introduced.
- The `updatedAt` field on each tab section is an ISO 8601 string parseable by `Date.parse()`, consistent with how `createdAt` is already handled in the hook.
- A `PreparingDashboard` component already exists at `src/pages/recommendations/PreparingDashboard.tsx` and does not need to be created or modified.
- The stale flags are independent of the existing `isReady` prop and `isRecommendationTabReady` / `isWorkforceTabReady` / `isIndustryTabReady` flags; both may be in play simultaneously, but `isStale` takes visual precedence.
- `DashboardPage.tsx` is the single caller responsible for destructuring the new stale flags from the hook and forwarding them to each tab page as props.

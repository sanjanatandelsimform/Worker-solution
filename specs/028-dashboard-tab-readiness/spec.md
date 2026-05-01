# Feature Specification: Dashboard Tab Readiness, Skeletons & Shared "Did You Know" Content

**Feature Branch**: `028-dashboard-tab-readiness`  
**Created**: 2026-05-01  
**Status**: Draft  
**Input**: User description: "Move Carousel didYouKnowSlides into a const module and reuse it inside DynamicLoadingModal (replacing the existing labels). Expose per-tab readiness flags (recommendation, workforce, industry) plus a 5-minute processing-timeout flag from useDashboardStatusPolling. Pass each flag into its tab so each tab renders a skeleton while not ready, and only show the DynamicLoadingModal during the first 5 minutes (computed from the API response createdAt)."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Each dashboard tab shows a skeleton while its data is still being prepared (Priority: P1)

After a user connects with Finch (or completes the manual assessment), the dashboard renders three tabs (Recommendations, Workforce, Industry). Each tab's data is produced asynchronously by the backend and reaches the "completed" state independently. While a particular tab's data is still being prepared, that tab must show a skeleton placeholder so the user can see the page structure and switch between tabs without waiting for the slowest one.

**Why this priority**: This is the primary user-visible improvement. Today the entire dashboard waits for everything before showing anything meaningful per tab; users cannot tell which tabs are ready and which are still loading.

**Independent Test**: Open the dashboard with the polling hook returning a status payload where one tab is `completed` and the other two are `pending`. Verify the completed tab shows real content and the two pending tabs show their skeleton states. Switching between tabs is possible immediately.

**Acceptance Scenarios**:

1. **Given** the polling response reports `recommendation.status = "completed"`, `workforce.status = "pending"`, `industry.status = "pending"`, **When** the dashboard renders, **Then** the Recommendations tab shows real content while the Workforce and Industry tabs show skeletons.
2. **Given** all three tabs are `pending`, **When** the user opens the dashboard, **Then** all three tabs show skeletons and the user can still switch tabs without errors.
3. **Given** a previously pending tab transitions to `completed` from a poll, **When** the new status arrives, **Then** that tab automatically replaces its skeleton with real content without a full page reload.

---

### User Story 2 - "Did you know?" content is shared between the dashboard carousel and the loading modal (Priority: P2)

The "Did you know?" facts shown in the Recommendations carousel and in the dashboard loading modal are currently maintained in two different files with different copy. Content owners should only need to update one source. The loading modal should rotate through the same canonical list used by the carousel.

**Why this priority**: Removes duplicated copy and keeps messaging consistent across the dashboard. Smaller user impact than US1 but unlocks ongoing maintainability.

**Independent Test**: Update one entry in the shared list and verify both the carousel slide and the loading-modal text reflect the change. Verify the modal cycles through the same set of facts the carousel shows.

**Acceptance Scenarios**:

1. **Given** the shared "Did you know?" content list, **When** the Recommendations carousel renders, **Then** it displays the entries (icon, title, content, source) from the shared list in order.
2. **Given** the same shared list, **When** the dashboard loading modal is visible, **Then** it cycles through the same entries, showing one at a time, with the source attribution.
3. **Given** the shared list is updated (entry added, edited, or removed), **When** both surfaces re-render, **Then** both reflect the change without any other code edits.

---

### User Story 3 - Loading modal is dismissed after 5 minutes even if data is still pending (Priority: P2)

The dashboard loading modal communicates to the user that their custom dashboard is being generated. To avoid trapping users behind a modal indefinitely when backend processing is slow, the modal must auto-dismiss once 5 minutes have elapsed since the dashboard status record was created. After that point, the user remains on the dashboard with skeletons in any still-pending tabs and the user-interface clearly indicates that processing is taking longer than expected.

**Why this priority**: Protects the user experience in the slow-path case. The skeletons (US1) provide a graceful fallback once the modal closes.

**Independent Test**: Simulate a polling response where `createdAt` is more than 5 minutes in the past while one or more tabs are still pending. Verify the loading modal is not shown, the skeletons remain, and the long-processing flag is exposed for downstream UI use.

**Acceptance Scenarios**:

1. **Given** the dashboard status response has `createdAt` less than 5 minutes ago and at least one tab is pending, **When** the dashboard renders, **Then** the loading modal is shown.
2. **Given** the dashboard status response has `createdAt` more than 5 minutes ago and at least one tab is still pending, **When** the dashboard renders, **Then** the loading modal is not shown, the pending tabs continue to show skeletons, and the polling hook exposes a flag indicating the 5-minute window has elapsed.
3. **Given** all tabs are `completed`, **When** the dashboard renders, **Then** the loading modal is not shown regardless of `createdAt`.
4. **Given** the modal is currently visible and the 5-minute mark passes while the user is still on the page, **When** that boundary is crossed, **Then** the modal is dismissed automatically (without requiring another poll response to arrive).

---

### Edge Cases

- The polling response is missing `createdAt`, or `createdAt` cannot be parsed: treat the 5-minute window as already elapsed (do not show the modal).
- The polling hook has no status yet (initial load before the first response): treat each tab as not ready (show skeletons) and do not show the loading modal.
- A tab status value is `not_applicable`: treat that tab as ready (no skeleton needed) because there is no work pending for it.
- The user device clock is significantly skewed from the server clock: the 5-minute computation uses the local clock against the server-provided `createdAt`; small skew is acceptable.
- The polling hook reports an error and stops polling while one or more tabs are still pending: the affected tabs continue to show their skeleton state; the loading modal follows the same 5-minute rule.
- Polling is disabled (e.g. user not connected): no readiness flags are emitted; the dashboard falls back to its existing pre-polling behavior for non-Finch flows.

## Requirements _(mandatory)_

### Functional Requirements

#### Shared "Did you know?" content

- **FR-001**: The `didYouKnowSlides` data array MUST live in a single shared constants module rather than being declared inside `Carousel.tsx`.
- **FR-002**: The Recommendations carousel MUST consume the shared `didYouKnowSlides` list and render the same fields it does today (icon, title, content, source).
- **FR-003**: The dashboard loading modal MUST consume the shared `didYouKnowSlides` list and MUST NOT keep its own internal `labels` array.
- **FR-004**: The loading modal MUST cycle through the shared list at the existing rotation cadence, showing one entry at a time including the source attribution.

#### Per-tab readiness from the polling hook

- **FR-005**: The `useDashboardStatusPolling` hook MUST expose three readiness flags derived from the latest status response: `isRecommendationTabReady`, `isWorkforceTabReady`, and `isIndustryTabReady`.
- **FR-006**: A tab readiness flag MUST be `true` when the corresponding section's `status` is `"completed"` and `false` otherwise (including `"pending"`, `"not_applicable"` MUST be treated as ready, and missing/unknown sections MUST be treated as not ready).
- **FR-007**: The readiness flags MUST update reactively when a new poll response arrives, so consumers re-render automatically.

#### 5-minute processing-time flag

- **FR-008**: The polling hook MUST expose a flag (e.g. `hasExceededProcessingWindow`) indicating whether the elapsed time since the response's `createdAt` exceeds 5 minutes.
- **FR-009**: The flag MUST recompute as time passes (not only when a new response arrives) so it can flip from `false` to `true` while the page remains open.
- **FR-010**: When `createdAt` is missing or unparseable, the flag MUST be treated as `true` (i.e. the long-processing condition is considered met).

#### Dashboard tab integration

- **FR-011**: Each Finch-flow tab panel (Recommendations, Workforce, Industry) MUST receive its corresponding readiness flag as a prop (e.g. `isReady`).
- **FR-012**: When a tab's `isReady` flag is `false`, that tab MUST render a skeleton placeholder consistent with that tab's existing loading state instead of fetching/rendering its real content.
- **FR-013**: The skeleton state MUST be combined with each tab's existing internal loading state so that a tab shows a skeleton when **either** the polling hook reports it not ready **or** the tab's own data fetch is still in flight.
- **FR-014**: When a tab's `isReady` flag becomes `true`, the tab MUST proceed with its normal data fetching and rendering behavior.

#### Loading modal visibility

- **FR-015**: The dashboard MUST show the loading modal only while at least one tab is still not ready **and** the 5-minute processing window has not yet elapsed.
- **FR-016**: The dashboard MUST hide the loading modal as soon as either condition is no longer true (all tabs ready, or 5-minute window elapsed).

### Key Entities

- **Dashboard status response**: The payload returned by the dashboard status polling endpoint. Includes per-section status (`recommendation`, `workforce`, `industry`), a `createdAt` timestamp marking when backend processing began, an `allSettled` indicator, and a suggested polling interval.
- **Tab readiness flag**: A boolean derived per dashboard tab indicating whether that tab's underlying data is ready for display.
- **Processing window flag**: A boolean derived from `createdAt` indicating whether more than 5 minutes have passed since processing began.
- **Did You Know slide**: A single shared content entry containing an icon, title, body content, and source attribution. Used by both the Recommendations carousel and the dashboard loading modal.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The Recommendations, Workforce, and Industry tabs each render their skeleton state independently within 1 second of the dashboard mounting whenever the corresponding section is not yet `"completed"`, with no full-page blocking spinner gating them.
- **SC-002**: When a previously pending tab transitions to `"completed"` in a poll response, that tab swaps from skeleton to real content within the next render cycle (no manual reload required).
- **SC-003**: The "Did you know?" content list is defined exactly once in the codebase and is consumed by both the Recommendations carousel and the dashboard loading modal; updating any entry requires changes in only one file.
- **SC-004**: The dashboard loading modal is never visible more than 5 minutes after the dashboard status record's `createdAt`, regardless of tab status.
- **SC-005**: Users on slow backend processing (greater than 5 minutes) can interact with all three dashboard tabs (switching between them, viewing skeletons) without the loading modal blocking the page.

## Assumptions

- The existing `getDashboardStatus` endpoint already returns per-section status objects (`recommendation`, `workforce`, `industry`) and a `createdAt` timestamp; this feature consumes them and does not modify the API contract.
- "5 minutes" is a fixed product value for the processing window and does not need to be user-configurable; if it ever changes it will be a single constant change in the polling hook.
- Each tab component (Recommendations, Workforce, Industry) already owns or can render an appropriate skeleton presentation consistent with the rest of the dashboard's loading patterns.
- The `not_applicable` per-section status value is treated as "ready" because it indicates the backend has explicitly declared no work is pending for that section.
- The loading modal continues to use its current visual design and rotation cadence; only its content source changes.
- Local-clock vs. server-clock skew is small enough that the 5-minute boundary is acceptable when computed against the server-provided `createdAt`.

# Feature Specification: Consolidate Finch Connection Status

**Feature Branch**: `001-remove-finch-polling`  
**Created**: 2026-04-28  
**Status**: Draft  
**Input**: User description: "We need to remove useFinchStatus.ts and API polling. Determine if Finch is connected from the existing assessment API using assessment type = finch, and update tests to keep full coverage."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Accurate Finch Connection State (Priority: P1)

As a user on the dashboard and assessment flow, I need the app to reliably detect whether Finch is connected so I always see the correct workflow and prompts.

**Why this priority**: Correct connection state directly impacts which actions users can take and prevents incorrect guidance.

**Independent Test**: Can be fully tested by loading assessment status data with and without Finch connection and verifying the UI state changes correctly without any dedicated Finch polling behavior.

**Acceptance Scenarios**:

1. **Given** an assessment status response that indicates Finch-connected assessment type, **When** the page loads or refreshes status, **Then** the app treats Finch as connected.
2. **Given** an assessment status response that does not indicate Finch-connected assessment type, **When** the page loads or refreshes status, **Then** the app treats Finch as not connected.
3. **Given** an assessment status response is temporarily unavailable, **When** status is evaluated, **Then** the app does not falsely report Finch as connected.

---

### User Story 2 - Reduced Redundant Network Activity (Priority: P2)

As a user, I want the app to avoid unnecessary repeated status requests so the experience remains responsive and stable.

**Why this priority**: Eliminating redundant status polling reduces load, avoids conflicting states, and improves perceived performance.

**Independent Test**: Can be tested by instrumenting requests during a typical dashboard session and confirming no dedicated Finch-status polling cycle runs.

**Acceptance Scenarios**:

1. **Given** a standard user session, **When** the dashboard is open, **Then** Finch connection determination comes from the assessment status response rather than a separate Finch polling flow.
2. **Given** status is refreshed manually or by existing assessment refresh triggers, **When** new data arrives, **Then** Finch connection state updates from that response only.

---

### User Story 3 - Reliable Regression Coverage (Priority: P3)

As a maintainer, I need automated tests updated so Finch connection behavior remains protected against regressions after removing the dedicated status hook.

**Why this priority**: Test coverage ensures behavior remains stable as related assessment logic evolves.

**Independent Test**: Can be tested by running relevant hook/page test suites and verifying all Finch-related scenarios pass with the new status source.

**Acceptance Scenarios**:

1. **Given** Finch-connected and non-connected assessment fixtures, **When** automated tests run, **Then** expected connection outcomes pass for both conditions.
2. **Given** legacy tests tied to dedicated Finch polling behavior, **When** tests are updated, **Then** they validate assessment-derived state instead of removed polling pathways.

### Edge Cases

- Assessment status response exists but is missing assessment type information.
- Assessment status response indicates in-progress data with incomplete sections while Finch is connected.
- Assessment status request fails intermittently and then recovers on a later refresh.
- User navigates rapidly between pages while assessment status is loading.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST determine Finch connection state from the existing assessment status response.
- **FR-002**: The system MUST treat assessment type value `finch` as Finch connected.
- **FR-003**: The system MUST treat missing, empty, or non-`finch` assessment type values as not Finch connected.
- **FR-004**: The system MUST remove the dedicated Finch status polling pathway so connection status is not resolved through a separate polling mechanism.
- **FR-005**: The system MUST keep dashboard and assessment UI behavior consistent with Finch connection state derived from assessment status.
- **FR-006**: The system MUST preserve existing error handling behavior when assessment status cannot be retrieved.
- **FR-007**: The system MUST update automated tests to cover Finch-connected, Finch-not-connected, and missing-data scenarios under the new status source.
- **FR-008**: The system MUST ensure no existing user-facing flow loses functional coverage after the polling pathway is removed.

### Key Entities _(include if feature involves data)_

- **Assessment Status**: Current assessment payload used to derive completion and connection state, including assessment type and completion status fields.
- **Finch Connection State**: Derived boolean-like domain state representing whether the user is connected through Finch, inferred from assessment type.
- **Assessment Sections**: Workforce, compensation, benefits, and goals completion segments that continue to coexist with Finch connection determination.

## Assumptions & Dependencies

- The assessment status response remains the authoritative source for connection-related assessment metadata.
- Existing flows already fetch assessment status in all places where Finch connection state is needed.
- No additional user role or permission rules are required for this change.
- Existing test infrastructure and fixtures can be extended to validate the revised status source.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: In regression tests, 100% of Finch connection scenarios pass using assessment-derived state.
- **SC-002**: During a standard dashboard session, no dedicated Finch-status polling request cycle is observed.
- **SC-003**: In user acceptance testing, users are shown the correct Finch-connected or not-connected experience in at least 95% of evaluated sessions.
- **SC-004**: Post-release, support incidents related to incorrect Finch connection display do not increase versus the previous release over the first two weeks.

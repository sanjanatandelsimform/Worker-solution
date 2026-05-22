# Feature Specification: Finch Connect Loading Spinner

**Feature Branch**: `021-finch-connect-loading`  
**Created**: 2026-04-24  
**Status**: Draft  
**Input**: User description: "In the dashboard, when user starts the Finch connection flow and clicks the connect button, if the connection is good then redirect to the additional question form, if not then show error. There is a gap between clicking connect and getting the result - we need to show a loading spinner using LoadingSpinner component."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Loading State During Finch Connect (Priority: P1)

A dashboard user clicks "Start with Finch" to initiate the payroll provider connection. After clicking, the page currently shows no visible feedback — the button goes disabled but nothing else changes. This story covers showing a full-screen loading spinner from the moment the user clicks the connect button until the flow concludes (success or error).

**Why this priority**: Without visible feedback during the async operation, users may believe the app is frozen and click again or navigate away. This is the core gap described in the feature request and the only change required.

**Independent Test**: Can be fully tested by clicking "Start with Finch" on the dashboard and observing that a loading spinner appears immediately and remains visible until either a redirect to additional questions occurs or an error message is displayed.

**Acceptance Scenarios**:

1. **Given** the user is on the dashboard and Finch is not yet connected, **When** the user clicks "Start with Finch", **Then** a full-screen loading spinner is displayed immediately.
2. **Given** the loading spinner is visible, **When** the Finch connection succeeds and the code exchange completes, **Then** the spinner disappears and the user is redirected to the additional questions form.
3. **Given** the loading spinner is visible, **When** an error occurs at any stage of the Finch flow (session fetch, connection, or code exchange), **Then** the spinner disappears and the existing error message is shown to the user.
4. **Given** the loading spinner is visible, **When** the user closes the Finch modal without completing the flow, **Then** the spinner disappears and the user is returned to the dashboard in its normal state.

---

### Edge Cases

- What happens if the user tries to click the connect button a second time while loading is in progress? The button must be disabled and the spinner must remain visible.
- What happens if the Finch modal is dismissed by the user without selecting a provider? The spinner must disappear and the dashboard must return to its normal state with no error shown.
- What happens if the network fails mid-flow? The spinner must disappear and the existing error message mechanism must display an appropriate error.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST display a loading spinner immediately when the user clicks the "Start with Finch" or "Connect" button to initiate the Finch connection flow.
- **FR-002**: The loading spinner MUST remain visible for the entire duration of the Finch connection process — including session fetch, provider connection, and authorization code exchange.
- **FR-003**: The loading spinner MUST disappear and the user MUST be redirected to the additional questions form when the connection flow completes successfully.
- **FR-004**: The loading spinner MUST disappear and the existing error message MUST be displayed when any step of the connection flow fails.
- **FR-005**: The loading spinner MUST disappear and the dashboard MUST return to its idle state when the user closes the Finch modal without completing the flow.
- **FR-006**: While the loading spinner is visible, the connect button MUST remain non-interactive to prevent duplicate requests.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users see a visible loading indicator within 100 milliseconds of clicking the connect button — eliminating the perceived "gap" in feedback.
- **SC-002**: The loading state correctly resolves (spinner removed) in 100% of cases — success, error, or user cancellation — with no scenario leaving the spinner permanently visible.
- **SC-003**: Zero duplicate Finch connection requests are initiated while a connection is already in progress.

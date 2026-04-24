# Feature Specification: Fix Finch Modal Loading State

**Feature Branch**: `022-fix-finch-modal-loader`  
**Created**: 2026-04-24  
**Status**: Draft  
**Input**: User description: "For the finch, there's a state called isLoading: isFinchLoading. I am using that in dashboard for showing loader. Currently the loading state is being true even if the finch modal is opened. I don't want that. If we need to create another state in the hook, please create it. Currently even if the finch modal is opened, in the BG the loader is running."

## Overview

When a user initiates the Finch payroll connection flow from the Dashboard, the application currently shows a full-screen loading spinner for the entire duration of the flow — including while the Finch Connect modal is open and visible. This creates a confusing experience: the user is actively interacting with the Finch modal, but a blocking spinner is also running behind it.

The Finch connection flow has three distinct phases:

1. **Session fetch** — the app contacts the backend to obtain a session token (brief, ~1–2 seconds).
2. **Finch modal open** — the Finch Connect UI is rendered; the user authenticates with their payroll provider. This can take several minutes.
3. **Code exchange** — after the user completes the Finch modal, the app exchanges the authorization code with the backend (brief, ~1–2 seconds).

The full-screen spinner should only appear during phases 1 and 3 — not while the Finch modal itself is open.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - No Spinner While Finch Modal Is Open (Priority: P1)

A user on the Dashboard clicks "Start with Finch". The app briefly shows a loading spinner while it fetches a session token. Once the Finch Connect modal appears, the spinner stops — the user can interact with the Finch UI without a blocking overlay behind it. After the user completes or dismisses the modal, appropriate feedback is shown.

**Why this priority**: The core bug. The spinner running behind the open modal is the primary UX problem reported. Fixing this alone resolves the issue.

**Independent Test**: Can be fully tested by clicking "Start with Finch" on the Dashboard and verifying the full-screen spinner is not visible while the Finch modal is displayed.

**Acceptance Scenarios**:

1. **Given** the Dashboard is loaded and the user's email is verified and no Finch connection exists, **When** the user clicks "Start with Finch", **Then** a full-screen loading spinner appears immediately.
2. **Given** the loading spinner is shown, **When** the Finch Connect modal becomes visible to the user, **Then** the full-screen loading spinner is no longer shown.
3. **Given** the Finch Connect modal is open, **When** the user completes their payroll provider authentication and the modal closes, **Then** the full-screen loading spinner appears again briefly while the app processes the result.
4. **Given** the Finch Connect modal is open, **When** the user dismisses/cancels the modal without completing authentication, **Then** the spinner does not appear and the Dashboard returns to its normal idle state.

---

### User Story 2 - Spinner Still Shows During Session Fetch (Priority: P2)

A user clicks "Start with Finch". While the app is fetching the Finch session token from the backend, the full-screen spinner is visible, giving the user immediate feedback that the action was registered.

**Why this priority**: Preserves the existing positive feedback UX during the brief server round-trip before the modal opens.

**Independent Test**: Can be tested by simulating a slow session-fetch response and confirming the spinner is shown during that window.

**Acceptance Scenarios**:

1. **Given** the user clicks "Start with Finch", **When** the session token is being fetched from the backend, **Then** the full-screen loading spinner is displayed.
2. **Given** the session token fetch completes successfully, **When** the Finch modal opens, **Then** the spinner is replaced by the Finch modal without any flicker.

---

### User Story 3 - Spinner Shows During Code Exchange (Priority: P3)

After a user successfully authenticates via the Finch modal, the app exchanges the authorization code. The full-screen spinner is shown during this brief processing window before the user is redirected.

**Why this priority**: Completes the UX contract — the user needs feedback while the app finalizes the connection after the modal closes.

**Independent Test**: Can be tested by completing the Finch modal flow and verifying the spinner appears between modal close and navigation to the next page.

**Acceptance Scenarios**:

1. **Given** the user has completed Finch authentication and the modal has closed, **When** the app is exchanging the authorization code with the backend, **Then** the full-screen loading spinner is displayed.
2. **Given** the code exchange completes successfully, **When** the app navigates to the next page, **Then** the spinner is no longer shown.

---

### Edge Cases

- What happens when the session fetch fails? The spinner stops and an error message is shown; the user can retry.
- What happens when the user cancels the Finch modal mid-flow? No spinner is shown; the Dashboard returns to its idle state cleanly.
- What happens if the code exchange fails after a successful Finch modal completion? The spinner stops and an error message is displayed; the Finch modal does not re-open.
- What happens if the user clicks "Start with Finch" while a session fetch is already in progress? The duplicate click is ignored; no second request is made.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The full-screen loading spinner MUST be shown immediately when the user initiates the Finch connection flow, before the Finch modal opens.
- **FR-002**: The full-screen loading spinner MUST NOT be shown while the Finch Connect modal is open and visible to the user.
- **FR-003**: The full-screen loading spinner MUST be shown again after the Finch modal closes, while the app processes the result (code exchange with backend).
- **FR-004**: The full-screen loading spinner MUST NOT appear when the user cancels or dismisses the Finch modal without completing authentication.
- **FR-005**: The "Start with Finch" button MUST remain disabled (non-clickable) for the duration of the entire connection flow to prevent duplicate submissions.
- **FR-006**: The Finch connection hook MUST expose a separate loading indicator that reflects only the pre-modal and post-modal loading phases, distinct from the "modal is open" phase.
- **FR-007**: The existing error reporting and clearing behavior of the Finch connection hook MUST be preserved after this change.

### Key Entities

- **Finch Connection Flow State**: Represents the current phase of the Finch payroll connection process. Phases are: idle, fetching-session (pre-modal loading), connecting (modal open — no spinner), exchanging-code (post-modal loading).
- **Dashboard Loading Guard**: The conditional rendering in the Dashboard that shows the full-screen spinner. Currently triggered by `isFinchLoading`; after this fix it should only trigger for the pre-modal and post-modal phases.

## Assumptions

- The `useFinchConnect` hook already tracks phase via an internal `status` field with values `"idle"`, `"fetching-session"`, `"connecting"`, and `"exchanging-code"`.
- The new loading indicator exposed by the hook will be `true` when `status` is `"fetching-session"` or `"exchanging-code"`, and `false` when `status` is `"idle"` or `"connecting"`.
- No other consumers of `useFinchConnect` are adversely affected by adding a new return value; the existing `isLoading` field may be retained for backward compatibility or removed if unused elsewhere.
- No changes are needed to the Finch SDK integration, backend API, or routing logic.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Zero occurrences of the full-screen loading spinner being visible at the same time as the Finch Connect modal during a normal connection flow.
- **SC-002**: The full-screen loading spinner is visible during 100% of session-fetch and code-exchange phases, ensuring users always receive feedback during backend round-trips.
- **SC-003**: The "Start with Finch" button remains non-interactive for the entire Finch connection flow (all phases), preventing duplicate submissions in 100% of cases.
- **SC-004**: Cancelling or dismissing the Finch modal returns the Dashboard to its normal idle state without any residual spinner or error state in 100% of cases.
- **SC-005**: All existing Finch connection hook behaviors (error reporting, error clearing, navigation on success) continue to function correctly after this change.

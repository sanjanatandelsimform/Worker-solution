# Feature Specification: Finch Connect — Remove Get-More Page & Real API Integration

**Feature Branch**: `005-finch-integration`  
**Created**: 2026-04-01  
**Status**: Draft  
**Input**: User description: "Remove the usage of /get-more page — we don't need to use it now. API Integration for the Finch Connection: connect two APIs — (i) POST /api/v1/finch/connect-session to fetch the session ID, (ii) POST /api/v1/finch/callback with auth code payload to complete the connection."

## Clarifications

### Session 2026-04-01

- Q: What should happen to the `/get-more` page — keep it (strip Finch only), remove it entirely, or redirect it to `/dashboard`? → A: Keep the `/get-more` page; remove only its Finch-related UI and flow triggers. Any app navigation that previously directed users to `/get-more` as part of the Finch flow should be updated to point to `/dashboard` instead.
- Q: After a successful Finch Connect flow, should the post-success redirect go to `/additional-questions` or `/dashboard`? → A: Redirect to `/additional-questions` (unchanged — `/dashboard` applies only to replacing stale navigation links that previously pointed to `/get-more`).
- Q: What should the `/get-more` page show where the Finch section used to be? → A: Remove only the Finch flow triggers and related code; leave the rest of the `/get-more` page content completely unchanged. No replacement, placeholder, or restructuring is needed. The Dashboard "Connect with Finch" card also remains visually unchanged after a successful Finch connection — conditional card visibility based on connection status will be driven by a future backend API.
- Q: What should happen to existing unit tests covering the Finch flow from `/get-more`? → A: Delete tests that specifically cover the Finch flow triggered from `/get-more`. Any non-Finch test coverage for that page should be kept.
- Q: Should the generic toast fallback error message be a fixed string or left to implementation judgment? → A: Define fixed fallback strings: "Failed to start Finch Connect. Please try again." for session failures, and "Failed to complete Finch connection. Please try again." for callback failures. Use the backend `message` field when present; fall back to these strings otherwise.

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Initiate Finch Connect from Dashboard Using Real Session API (Priority: P1)

A logged-in user on the `/dashboard` page clicks **Start with Finch**. The system calls the real backend session endpoint to obtain a session ID and a Finch Connect URL. The Finch Connect overlay opens using those real credentials. Once the user completes Finch authorization, the real callback endpoint is called with the authorization code. On success, the user is redirected to `/additional-questions`.

**Why this priority**: The Dashboard is now the sole entry point for Finch Connect. All downstream behavior (overlay, callback, redirect) depends on the real session being returned correctly. This story validates the complete end-to-end integration path.

**Independent Test**: On `/dashboard`, click "Start with Finch", mock the real session endpoint to return `{ status: true, data: { sessionId: "sess_abc123", connectUrl: "..." } }`, assert the Finch Connect overlay opens with the returned sessionId. Stub Finch's `onSuccess` to fire with `code: "auth_code_abc123"`, mock the callback endpoint to return a successful connection response, and assert the user is redirected to `/additional-questions`.

**Acceptance Scenarios**:

1. **Given** a logged-in user is on `/dashboard`, **When** they click "Start with Finch", **Then** the system calls `POST /api/v1/finch/connect-session` (no payload) and the Finch Connect overlay opens with the session credentials returned by the server.
2. **Given** the Finch Connect overlay is open and the user completes authorization, **When** Finch returns an authorization code, **Then** the system calls `POST /api/v1/finch/callback` with the authorization code as the payload.
3. **Given** the callback endpoint responds with a successful connection, **When** the response is received, **Then** the user is automatically redirected to `/additional-questions`.
4. **Given** the `connect-session` endpoint returns an error, **When** the error is received, **Then** a toast notification is displayed and the Finch Connect overlay does not open.
5. **Given** the Finch Connect overlay is open, **When** the user closes it without completing authorization, **Then** the overlay closes silently and the dashboard page remains in its previous state.
6. **Given** Finch returns an `onError` event inside the overlay, **When** the error callback fires, **Then** the overlay closes and a toast error notification is displayed.
7. **Given** the `callback` endpoint returns an error after Finch succeeds, **When** the error is received, **Then** a toast error notification is displayed, the hook resets to idle, and the user is not redirected.

---

### User Story 2 — Remove Finch UI from /get-more Page & Redirect Finch Navigation to Dashboard (Priority: P1)

The `/get-more` page previously served as an alternate entry point for starting the Finch Connect flow. This entry point is no longer needed. The Dashboard is now the sole route for initiating Finch. All Finch-related UI and flow triggers must be removed from `/get-more`; the page itself is **retained** (not deleted). Any in-app navigation that previously directed users to `/get-more` as part of the Finch flow must be updated to point to `/dashboard` instead.

**Why this priority**: Cleaning up the deprecated entry point ensures consistency, reduces maintenance surface, and eliminates dead code paths that could confuse future contributors or cause unexpected side effects. Retaining the page avoids breaking any existing bookmarks or non-Finch routes that may link to it.

**Independent Test**: Navigate to `/get-more` and confirm that no Finch Connect UI (button, hook invocation, session request) is present. Confirm that any button or link that previously navigated to `/get-more` now navigates to `/dashboard`. Confirm the Dashboard Finch flow is unaffected.

**Acceptance Scenarios**:

1. **Given** a user visits `/get-more`, **When** the page renders, **Then** no Finch Connect button, hook, or session request is present or triggered.
2. **Given** any in-app link or button previously navigated to `/get-more` as a Finch entry point, **When** that element is clicked, **Then** the user is taken to `/dashboard` instead.
3. **Given** the Finch hook is wired exclusively to the Dashboard, **When** the user clicks "Start with Finch" on the Dashboard, **Then** the flow works correctly with no dependency on `/get-more`.
4. **Given** all Finch references are removed from `/get-more`, **When** the rest of the application is exercised, **Then** routing, Dashboard flow, and non-Finch functionality continue to work without errors.

---

### Edge Cases

- What happens when the `connect-session` endpoint returns a response where `data.sessionId` is missing or empty? The system must treat this as a failure — display a toast error and not open the Finch overlay.
- What happens when the `callback` endpoint returns `status: false` but with HTTP 200? The system must read the `status` field and treat a falsy value as a failure, displaying a toast error and not redirecting.
- What happens when the user clicks "Start with Finch" multiple times rapidly? Concurrent session requests must be prevented — the button must be disabled once a request is in progress.
- What happens when the authorization code returned by Finch is empty or malformed? The system must not call the callback endpoint and must display a toast error instead.
- What happens when the network times out during either API call? A user-facing toast error must be displayed and the hook must reset to idle.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The `connect-session` integration MUST call `POST /api/v1/finch/connect-session` with no request body and extract `data.sessionId` from the response to pass to the Finch Connect SDK.
- **FR-002**: The `connect-session` integration MUST use the established API client (with authentication headers, base URL, and timeout) consistent with other existing service integrations in the project.
- **FR-003**: The `callback` integration MUST call `POST /api/v1/finch/callback` with a JSON body containing the `code` field (the authorization code returned by Finch).
- **FR-004**: The `callback` integration MUST use the same API client as FR-002, ensuring authentication headers are included.
- **FR-005**: If the `connect-session` response `status` is falsy or the response is missing `data.sessionId`, the system MUST treat the result as a failure, display a toast error notification, and NOT open the Finch Connect overlay.
- **FR-006**: If the `callback` response `status` is falsy or the request fails, the system MUST display a toast error notification, reset the hook to idle state, and NOT redirect the user.
- **FR-007**: On a successful `callback` response, the system MUST redirect the user to `/additional-questions`.
- **FR-008**: The Finch Connect flow MUST remain exclusively accessible from the `/dashboard` page — all Finch UI and flow triggers on `/get-more` MUST be removed. The `/get-more` page itself MUST be retained. Any in-app navigation that previously directed users to `/get-more` as part of the Finch flow MUST be updated to point to `/dashboard`.
- **FR-009**: The existing hook interface (trigger function, loading/status states) MUST remain unchanged so that Dashboard components require no structural changes beyond the service swap.
- **FR-010**: The "Start with Finch" button on the Dashboard MUST be disabled and show a loading indicator while either the `connect-session` request or the `callback` request is in progress.
- **FR-011**: The stub implementations of `getFinchSessionId` and `exchangeFinchCode` MUST be replaced with real API calls; the function signatures and names MUST remain the same to avoid breaking the hook or any existing tests that mock these functions.
- **FR-012**: Unit tests MUST be updated to mock the real API calls (rather than the stub return values) and assert the correct endpoints, payloads, and response handling.
- **FR-013**: Existing unit tests that cover the Finch flow triggered from `/get-more` MUST be deleted. Any non-Finch test coverage for the `/get-more` page MUST be retained without modification.
- **FR-014**: Toast error messages MUST use the backend `message` field when present. When it is absent, the following fixed fallback strings MUST be used: `"Failed to start Finch Connect. Please try again."` for `connect-session` failures, and `"Failed to complete Finch connection. Please try again."` for `callback` failures (including Finch `onError` events).

### Key Entities

- **Finch Session**: A short-lived authorization token issued by the backend. Attributes: `sessionId` (unique identifier for the session), `connectUrl` (the Finch-hosted authorization URL). Created via `connect-session`; consumed by the Finch Connect SDK to open the overlay.
- **Finch Authorization Code**: A single-use code returned by the Finch Connect overlay upon successful user authorization. Attribute: `code` (string). Submitted to the `callback` endpoint to complete the connection.
- **Finch Connection Result**: The backend's confirmation that the authorization code has been accepted and a payroll provider connection established. Attributes: `connectionId`, `connectionStatus`, `providerId`, `syncJobId`, `syncJobStatus`. A `connectionStatus` of `"connected"` signals a successful integration.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A user can complete the Finch Connect flow from the Dashboard — from clicking "Start with Finch" to arriving at `/additional-questions` — using real backend responses, with no stub data involved.
- **SC-002**: All unit tests that previously passed with stub service functions continue to pass after the real API integration, with endpoints, payloads, and response shapes updated to reflect the new contracts.
- **SC-003**: The `/get-more` page contains no Finch-related UI components, hooks, or flow triggers after this change is applied. Any navigation link that previously pointed to `/get-more` as a Finch entry point now routes to `/dashboard`.
- **SC-004**: When either the `connect-session` or `callback` endpoint returns an error (network failure, non-`true` status), the user sees a clear toast error message and the page remains fully functional and interactive.
- **SC-005**: The "Start with Finch" button is visually disabled and non-interactive from the moment it is clicked until the full flow completes or fails — preventing duplicate submissions.
- **SC-006**: The response data from the `callback` endpoint (including `connectionId`, `connectionStatus`, `providerId`, `syncJobId`, `syncJobStatus`) is available for future use without requiring hook or component changes.

## Assumptions

- The `connect-session` endpoint does not require any request body; authentication is conveyed via the Authorization header already handled by the shared API client.
- The `callback` endpoint accepts exactly `{ "code": "<authorization_code>" }` as its JSON payload and returns the full connection result on success.
- A `status: true` field in the response body signals success at the application level; HTTP 2xx alone is not sufficient — the `status` field must be checked.
- The `connectUrl` field in the `connect-session` response is available for potential future use (e.g., fallback redirect) but the current implementation passes only `sessionId` to the Finch Connect SDK.
- The `/get-more` page is retained as a routable page; only the Finch flow trigger code is removed. All other content and layout on the page is left completely unchanged. In-app navigation that previously led to `/get-more` as a Finch entry point is updated to point to `/dashboard`.
- After a successful Finch Connect flow, the "Connect with Finch" card on `/dashboard` remains completely unchanged — no badge, hidden state, or any other visual mutation. Whether the card is shown or hidden will be driven by a future backend API; the frontend does not track or persist connection state in this iteration.
- No changes are needed in the `/additional-questions` page or anywhere else in the application beyond the service layer, hook, and `/get-more` cleanup.
- Error messages displayed in toast notifications use the backend `message` field when present. Fixed fallback strings are used when it is absent: `"Failed to start Finch Connect. Please try again."` for `connect-session` failures, and `"Failed to complete Finch connection. Please try again."` for `callback` failures (including Finch `onError` events).
- Existing tests use Vitest + React Testing Library; updated tests follow the same conventions.

# Feature Specification: Finch Integration

**Feature Branch**: `005-finch-integration`  
**Created**: 2026-03-31  
**Status**: Draft  
**Input**: User description: "FINCH INTEGRATION — Implement Finch Connect flow from Dashboard and Get More pages using @tryfinch/react-connect, with stub session ID API and stub code-exchange API, redirecting to /additional-questions on success, full error handling, and test coverage."

## Clarifications

### Session 2026-03-31

- Q: After a successful Finch Connect flow, what should happen to the "Connect with Finch" card if the user navigates back to `/dashboard`? → A: Card remains unchanged — no frontend connected-state tracking; connected status will be derived from the real backend API in a future iteration.
- Q: How should Finch flow errors (session ID fetch failure, Finch `onError` callback) be displayed to the user? → A: Toast notification (temporary pop-up, auto-dismisses).
- Q: When the backend code-exchange call fails after Finch returns a success code, what recovery path is available? → A: A toast error is shown and the hook resets to idle state; the user must restart the entire flow from scratch (click "Start with Finch" again for a new session ID and new Finch overlay).
- Q: Does the project already have a toast notification mechanism, or should one be introduced? → A: No toast library is currently installed. Add one (shadcn/ui `sonner` component, backed by the `sonner` npm package, is the natural fit given the existing shadcn/ui setup); update if a different library is chosen later.
- Q: Should the Get More page also use a toast for Finch errors, consistent with the Dashboard? → A: Yes — all Finch errors on both pages are toasts; the hook handles all toasting internally so components need no error-display logic.

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Start Finch Connect from Dashboard (Priority: P1)

A logged-in user on the `/dashboard` page sees a "Connect with Finch" card. They click the **Start with Finch** button. The system requests a Finch session ID from the backend, then immediately opens the Finch Connect modal (iFrame overlay). The user completes the Finch authorization flow, the system receives an authorization code from Finch, notifies the backend of the successful connection, and finally redirects the user to `/additional-questions`.

**Why this priority**: This is the primary entry point for Finch onboarding and the core of the feature. All other stories depend on the same underlying connection flow working correctly.

**Independent Test**: Navigate to `/dashboard`, click "Start with Finch", mock the session ID endpoint, stub the Finch Connect SDK `open()` call to immediately fire `onSuccess({ code: 'test-code' })`, assert the backend code-exchange endpoint is called with `'test-code'`, and assert the user is redirected to `/additional-questions`.

**Acceptance Scenarios**:

1. **Given** a logged-in user is on `/dashboard`, **When** they click "Start with Finch", **Then** the system calls the session ID endpoint and the Finch Connect overlay opens.
2. **Given** the Finch Connect overlay is open, **When** the user completes authorization, **Then** the system calls the backend code-exchange endpoint with the authorization code returned by Finch.
3. **Given** the backend code-exchange call succeeds, **When** the response is received, **Then** the user is automatically redirected to `/additional-questions`.
4. **Given** the session ID endpoint fails, **When** the error is received, **Then** a toast error notification is displayed and the Finch overlay does not open.
5. **Given** the Finch Connect overlay is open, **When** the user closes it (clicks outside or presses Escape) without completing authorization, **Then** the overlay closes gracefully and the dashboard remains in its previous state without any error message.
6. **Given** Finch returns an error inside the overlay, **When** the error callback fires, **Then** the overlay closes and a toast error notification is displayed.

---

### User Story 2 — Start Finch Connect from Get More Page (Priority: P2)

A logged-in user on the `/get-more` page selects the **Finch** plan option (the default) and clicks **Let's get started**. Instead of navigating directly to `/additional-questions` as before, the system now initiates the same Finch Connect flow (session ID → Finch overlay → code exchange → redirect).

**Why this priority**: Ensures consistent Finch onboarding behavior regardless of which page the user uses to start the connection, while avoiding code duplication via the shared hook.

**Independent Test**: Navigate to `/get-more`, confirm Finch is selected, click "Let's get started", stub the same session ID endpoint, assert the Finch overlay opens; stub `onSuccess`, assert the backend is called and the user is redirected to `/additional-questions`. Also verify that selecting Manual Entry still navigates directly to `/assessment` as before.

**Acceptance Scenarios**:

1. **Given** a logged-in user is on `/get-more` with the Finch plan selected, **When** they click "Let's get started", **Then** the Finch Connect flow is initiated (session ID fetched and overlay opened) instead of navigating directly to `/additional-questions`.
2. **Given** the Finch Connect flow succeeds, **When** the authorization code is exchanged, **Then** the user is redirected to `/additional-questions`.
3. **Given** a logged-in user is on `/get-more` with the Manual Entry plan selected, **When** they click "Let's get started", **Then** the system navigates directly to `/assessment` as before (no Finch flow is triggered).
4. **Given** the session ID request fails on `/get-more`, **When** the error occurs, **Then** a toast error notification is displayed and the user can retry by clicking the button again.

---

### User Story 3 — Stub API Contracts (Priority: P3)

The feature uses two stub/placeholder API calls in the absence of a real backend:

1. **Session ID fetch**: Simulates a POST to a future `/api/finch/sessions` endpoint and returns a hardcoded session ID.
2. **Code exchange**: Simulates a POST to a future `/api/finch/connect` endpoint with the authorization code and returns a success acknowledgement.

Both stubs must be structured as real service functions so that they can be replaced by real API calls later without touching component or hook code.

**Why this priority**: Decouples UI flow from backend readiness, enabling the feature to be demonstrated and tested end-to-end while the real API is being built.

**Independent Test**: Call each stub service function directly in unit tests, assert they resolve with the expected shape (`{ sessionId: string }` and `{ success: true }` respectively), and confirm they throw or reject on simulated failure paths.

**Acceptance Scenarios**:

1. **Given** the stub session service is called, **When** it resolves, **Then** it returns an object with a non-empty `sessionId` string.
2. **Given** the stub code-exchange service is called with a valid code, **When** it resolves, **Then** it returns `{ success: true }`.
3. **Given** the stub session service is replaced with a real API call, **When** the code is updated, **Then** no changes are required in the hook or components.

---

### Edge Cases

- What happens when the Finch Connect SDK `open()` is called before the session ID is available? The button must be disabled and show a loading state while the session ID is being fetched.
- What happens when the user clicks "Start with Finch" multiple times rapidly? Concurrent session ID requests must be prevented (guarded by a loading flag).
- What happens when the backend code-exchange call fails after Finch returns a success code? A toast error is shown and the hook resets to idle; the user must restart the entire flow from scratch by clicking "Start with Finch" again (new session ID + new Finch overlay). There is no partial-retry of only the code-exchange step.
- What happens when the Finch Connect SDK cannot load due to a network issue? A graceful error message should be shown.
- What happens when the authorization code returned by Finch is empty or malformed? The system must not call the backend and must display an error.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST install and use the `@tryfinch/react-connect` npm package to drive the Finch Connect authorization overlay.
- **FR-002**: A custom hook MUST encapsulate the entire Finch flow: session ID fetching, Finch SDK initialization, overlay invocation, success handling, error handling, and close handling.
- **FR-003**: The hook MUST expose a single trigger function that components call — components must not need to know about session ID values or SDK internals.
- **FR-004**: The hook MUST expose loading and status states so consuming components can render appropriate UI feedback (loading indicator, disabled button). Error display is handled internally by the hook via toast — components do not need to render error messages.
- **FR-005**: When the Finch `onSuccess` callback fires, the system MUST call the backend code-exchange stub service with the authorization code before redirecting.
- **FR-006**: On successful code exchange, the system MUST redirect the user to `/additional-questions`.
- **FR-007**: When the Finch `onError` callback fires, or when the session ID fetch fails, the system MUST display the error as a toast notification using the shadcn/ui `sonner` component (to be installed via `pnpm dlx shadcn@latest add sonner`). If a different toast library is already present when implementation begins, use that instead.
- **FR-008**: When the `onClose` callback fires (user dismissed without completing), the system MUST silently reset to idle state with no error shown.
- **FR-009**: The stub session ID service MUST be a standalone service function that can later be replaced by a real API call without modifying the hook or components.
- **FR-010**: The stub code-exchange service MUST similarly be a standalone service function replaceable by a real API call.
- **FR-011**: The **Dashboard** page MUST invoke the hook's trigger function when the "Start with Finch" button is clicked.
- **FR-012**: The **Get More** page MUST invoke the hook's trigger function when "Let's get started" is clicked and the Finch plan is selected, replacing the existing direct navigation to `/additional-questions`.
- **FR-013**: The "Start with Finch" and "Let's get started" buttons MUST be disabled and show a loading indicator while any Finch operation (session fetch or code exchange) is in progress.
- **FR-014**: Unit tests MUST cover the hook's happy path, session ID fetch failure, Finch `onError` callback, Finch `onClose` callback, Dashboard button behavior, and Get More button behavior for both Finch and Manual Entry plans.
- **FR-015**: All new tests MUST follow the existing project test structure under `tests/` using Vitest and React Testing Library.
- **FR-016**: When the code-exchange backend call fails, the system MUST display an error toast notification, reset the hook to idle state, and NOT redirect the user. The user can then restart the full Finch flow (new session ID + new overlay) by clicking the button again.

### Key Entities

- **Finch Session**: A short-lived token (session ID) issued by the backend that authorizes a specific Finch Connect session. Attributes: `sessionId` (string). Created before opening the overlay, consumed by the Finch SDK.
- **Finch Authorization Code**: A single-use code returned by the Finch Connect overlay on successful user authorization. Passed to the backend for exchange. Attributes: `code` (string), optional `state` (string).
- **Finch Connection Result**: The backend's acknowledgement that the authorization code has been received and processed. Attributes: `success` (boolean). Triggers downstream redirect on success.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A user can initiate Finch Connect from the Dashboard and reach `/additional-questions` in under 30 seconds under normal network conditions (excluding time spent inside the Finch Connect overlay itself).
- **SC-002**: A user can initiate the same Finch Connect flow from the `/get-more` page with identical behavior and the same destination.
- **SC-003**: 100% of unit tests for the Finch hook and both stub service functions pass without flakiness.
- **SC-004**: When the session ID request fails, the user sees a clear error message within 1 second of the failure and the page does not crash.
- **SC-005**: When Finch returns an `onError` event, the user sees an appropriate error message and the page remains functional with no broken state.
- **SC-006**: Replacing stub service functions with real API calls requires changes only in the respective service files — zero changes in the hook or component files.
- **SC-007**: The "Start with Finch" / "Let's get started" button is visually disabled and non-interactive whenever a Finch operation is in progress, preventing duplicate submissions.

## Assumptions

- The Finch Connect SDK (`@tryfinch/react-connect`) renders its authorization flow as an iFrame overlay; no custom redirect page is needed on this application.
- The stub session ID service returns the hardcoded value `"stub-session-id-001"` until the real backend is available.
- The stub code-exchange service always resolves successfully; real-world latency and failure paths are tested via mocks in unit tests.
- No toast library is currently installed. The implementation will add the shadcn/ui `sonner` component (backed by the `sonner` npm package) as the toast mechanism. If a different toast library is adopted before implementation begins, FR-007 should be updated to reference it.
- After a successful Finch Connect flow, the "Connect with Finch" card on `/dashboard` remains visually unchanged (no "connected" badge or hidden state). Connected status will be derived from the real backend API in a future iteration — the frontend does not persist this state.
- The existing navigation from Get More's Manual Entry plan (`→ /assessment`) remains unchanged.
- No changes are required to the `/additional-questions` page itself.
- Tests use Vitest + React Testing Library to match the existing `tests/` setup.

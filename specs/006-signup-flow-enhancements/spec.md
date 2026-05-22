# Feature Specification: MVP Signup Flow Enhancements

**Feature Branch**: `006-signup-flow-enhancements`
**Created**: 2 April 2026
**Status**: Draft
**Input**: User description: "MVP Signup Flow Enhancements without breaking existing functionality — auto-login after signup, email verification modal on dashboard, and returning unverified-user login flow."

## Assumptions

- The `/users/create` endpoint now returns `tokens` (accessToken + refreshToken) alongside the `user` object in its successful response. This is a backend change already deployed or in progress.
- The existing "email sent" modal and "Verify your email" dashboard card remain unchanged in appearance and behaviour.
- The design provided (screenshot) is the single source of truth for the "Your email has been verified!" modal UI.
- The existing `/success` page continues to work for any other flows that still navigate to it (e.g., sign-in success).
- The verification link format (`/verify-email?token=...`) and the `verifyEmail` API response shape remain unchanged.
- The "Return to dashboard" button on the verification modal simply closes the modal; no additional navigation is required because the user is already on the dashboard.
- In the cross-browser verification case (user registered in one browser, clicks verify link in another), the system will authenticate the user via the tokens returned by the verify API and redirect to the dashboard with the modal.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Auto-Login After Registration (Priority: P1)

A new user completes the sign-up form and clicks "Create Account." The system creates their account and automatically logs them in. They see a success confirmation and are taken directly to the dashboard without having to sign in separately.

**Why this priority**: This is the highest-impact UX improvement — it eliminates a redundant sign-in step that causes drop-off. Every new user experiences this flow on their first interaction.

**Independent Test**: Register a new account end-to-end. Verify the user lands on the dashboard (authenticated) without visiting the sign-in page.

**Acceptance Scenarios**:

1. **Given** a visitor is on the registration page with valid form data, **When** they submit the form and the `/users/create` API returns successfully with user data and tokens, **Then** the system stores the tokens and user in the authenticated session (same mechanism as the existing login flow).
2. **Given** the registration API has returned successfully, **Then** the user is shown a success page with the title "Account created successfully!", subtitle "Welcome aboard! Start your success journey with A2B", and a "Let's Get Started" button.
3. **Given** the user is on the post-registration success page, **When** they click "Let's Get Started", **Then** they are navigated directly to `/dashboard` (not `/sign-in`).
4. **Given** the registration API returns an error, **When** the error is displayed, **Then** the existing error handling behaviour is preserved unchanged.
5. **Given** the user has been auto-logged-in after registration, **When** they arrive on the dashboard, **Then** the dashboard shows the "Verify your email" card (since `emailVerify` is `false` for newly registered accounts).

---

### User Story 2 — Email Verified Modal on Dashboard (Priority: P1)

A registered user clicks the email verification link. Instead of being taken to a generic success page, they are redirected to the dashboard where a modal confirms their email has been verified.

**Why this priority**: This directly pairs with Story 1. New users who auto-login will see the "Verify email" card on their dashboard; when they verify, the confirmation must appear on the dashboard, not on an unrelated success page.

**Independent Test**: Register a user, obtain the verification link, click it. Verify the user lands on `/dashboard` with the "Your email has been verified!" modal displayed.

**Acceptance Scenarios**:

1. **Given** a user clicks the email verification link (`/verify-email?token=…`), **When** the `verifyEmail` API returns successfully, **Then** the system authenticates the user (stores tokens and updates user state) and redirects to `/dashboard`.
2. **Given** the user has been redirected to the dashboard after successful email verification, **Then** a modal is displayed with:
   - A green checkmark icon
   - Title: "Your email has been verified!"
   - Subtitle: "Welcome aboard! Start your success journey with A2B."
   - A single "Return to dashboard" button
3. **Given** the verification modal is displayed, **When** the user clicks "Return to dashboard", **Then** the modal closes and the dashboard is visible with the updated state (no more "Verify your email" card).
4. **Given** the verification modal has been closed, **When** the user refreshes the page, **Then** the modal does NOT reappear (navigation state is cleared).
5. **Given** the `verifyEmail` API returns an error (expired/invalid token), **Then** the existing error UI (Verification Failed screen with "Back to Sign In" button) is displayed unchanged.
6. **Given** the user clicks the verification link in a different browser (cross-browser), **When** the verify API succeeds, **Then** the system creates a new authenticated session from the returned tokens and redirects to the dashboard with the verification modal.

---

### User Story 3 — Returning Unverified User Login and Verification (Priority: P2)

A user registers, does not verify their email, logs out, and later logs back in. The dashboard shows the "Verify your email" card. When they eventually verify, they see the same dashboard modal confirmation.

**Why this priority**: This covers the case of users who don't verify immediately. It ensures the verification modal experience is consistent regardless of when verification happens.

**Independent Test**: Register a user, skip verification, log out, log back in. Confirm the dashboard shows the verification prompt. Then verify the email and confirm the dashboard modal appears.

**Acceptance Scenarios**:

1. **Given** a user has registered but not verified their email, **When** they log out and log back in, **Then** the sign-in flow works exactly as before (no changes to the login flow itself).
2. **Given** an unverified user is logged in and viewing the dashboard, **Then** the "Verify your email" card is displayed (existing behaviour, unchanged).
3. **Given** the user clicks "Verify" on the dashboard, **Then** the send-email API is called and the "Email Sent" modal is shown (existing behaviour, unchanged).
4. **Given** the unverified user later clicks the verification link from their email, **When** the verify API succeeds, **Then** they are redirected to the dashboard with the "Your email has been verified!" modal (same behaviour as User Story 2).

---

### Edge Cases

- **Expired verification token**: The existing error UI on VerifyEmailPage ("Verification Failed" with "Back to Sign In") is preserved unchanged.
- **Missing or malformed token parameter**: The existing error handling ("Invalid or missing verification token") is preserved unchanged.
- **Double-click on registration submit**: The existing form should prevent duplicate submissions. No change required.
- **User navigates away from success page before clicking "Let's Get Started"**: The user is already authenticated; if they manually navigate to `/dashboard`, they should reach it as a logged-in user.
- **Browser refresh on dashboard with verification modal open**: The modal should NOT reappear — the trigger state must be transient (navigation state), not persistent.
- **Network failure during token storage after registration**: If the registration API succeeds but the client fails to persist tokens, the user should still be able to log in via `/sign-in` using their credentials.
- **Concurrent verification attempts**: If the user clicks the verification link multiple times, subsequent calls should handle gracefully (API returns appropriate error for already-verified emails).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: After a successful `/users/create` API call, the system MUST extract and store the `accessToken` and `refreshToken` from the response using the same storage mechanism as the existing login flow.
- **FR-002**: After successful registration and token storage, the system MUST set the user data in the application state (same as the existing login `setUser` flow).
- **FR-003**: The post-registration success page MUST navigate the user to `/dashboard` (instead of `/sign-in`) when they click the "Let's Get Started" button.
- **FR-004**: The registration success page UI (title, subtitle, button text) MUST remain unchanged — only the button's destination changes from `/sign-in` to `/dashboard`.
- **FR-005**: After a successful `verifyEmail` API call, the system MUST redirect the user to `/dashboard` instead of `/success`.
- **FR-006**: When the dashboard is loaded as a result of successful email verification, the system MUST display a confirmation modal matching the provided design.
- **FR-007**: The verification modal MUST display: a green checkmark icon, the title "Your email has been verified!", the subtitle "Welcome aboard! Start your success journey with A2B.", and a "Return to dashboard" button.
- **FR-008**: Clicking the "Return to dashboard" button MUST close the modal and clear any navigation state that triggered it so the modal does not reopen on page refresh.
- **FR-009**: The existing "Verify your email" dashboard card, "Verify" button behaviour, send-email API call, and "Email Sent" modal MUST remain unchanged.
- **FR-010**: The existing VerifyEmailPage error handling (missing token, expired token, API failure) MUST remain unchanged.
- **FR-011**: The existing sign-in flow, sign-in form, and sign-in success page MUST remain unchanged.
- **FR-012**: The existing dashboard UI for verified users (assessment card, recommendations, etc.) MUST remain unchanged.
- **FR-013**: Cross-browser email verification MUST create a valid authenticated session from the tokens returned by the verify API, then redirect to the dashboard with the verification modal.

### Key Entities

- **User Account**: Represents a registered user. Key attributes: `id`, `firstName`, `lastName`, `businessEmail`, `emailVerify` (boolean). The `emailVerify` flag drives conditional dashboard rendering.
- **Authentication Tokens**: A pair of `accessToken` and `refreshToken` used for authenticated API calls. Now returned by both `/users/create` and `/auth/login` endpoints.
- **Navigation State**: Transient state passed during route navigation used to trigger the verification modal on the dashboard. Must be cleared after the modal is displayed to prevent re-triggering.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: New users complete the sign-up-to-dashboard journey in a single flow without visiting the sign-in page, reducing total steps from 5 (register → success → sign-in → sign-in success → dashboard) to 3 (register → success → dashboard).
- **SC-002**: 100% of successful email verifications result in the user landing on the dashboard with the verification modal displayed — zero users are sent to the generic success page after email verification.
- **SC-003**: The verification confirmation modal does not reappear after page refresh (zero false re-triggers).
- **SC-004**: All existing flows that are explicitly unchanged (sign-in, error handling, dashboard cards, "Email Sent" modal) continue to pass their current acceptance criteria with no regressions.
- **SC-005**: Users who register, skip verification, log out, and log back in experience the same verification modal flow as users who verify immediately — consistent experience across all verification timing scenarios.
- **SC-006**: Cross-browser email verification (clicking the link in a different browser than where the user registered) successfully authenticates the user and shows the verification modal on the dashboard.

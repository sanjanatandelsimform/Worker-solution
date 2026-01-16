# Feature Specification: Authentication Module - Business Onboarding & Sign-In

**Feature Branch**: `001-auth-business-onboarding`  
**Created**: 2026-01-15  
**Status**: Draft  
**Input**: User description: "Build a complete authentication frontend module using React + Vite with Untitled UI and Tailwind CSS with business onboarding and sign-in flows"

## Clarifications

### Session 2026-01-16

- Q: What is the OAuth callback URL structure for Google SSO? → A: Use a dedicated backend callback endpoint (e.g., `/api/auth/google/callback`) that handles token exchange server-side, then redirects to frontend with session cookie set
- Q: Should the business information form for Google SSO users be a separate page, modal, or dashboard integration? → A: Separate dedicated page (`/onboarding/business-info`) that users must complete before accessing the dashboard
- Q: What timeout threshold should be applied to authentication API calls? → A: 10-second timeout for all authentication API calls; show timeout error if exceeded
- Q: Should password values be cleared from form state after successful submission? → A: Clear password fields from form state immediately after successful API response to minimize memory exposure

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Business Account Registration (Priority: P1)

A new business owner visits the platform to create an account for their company. They need to provide their personal information, business details, and create secure credentials to access workforce quality assessment tools.

**Why this priority**: This is the entry point for all new customers. Without the ability to create an account, no business can access the platform. This directly impacts customer acquisition and is critical for the SaaS business model.

**Independent Test**: A user can navigate to the registration page, fill out all required fields with valid information, submit the form, and receive confirmation that their account was created. The user should then be redirected to an email verification page and receive a verification email.

**Acceptance Scenarios**:

1. **Given** the user is on the registration page, **When** they fill in all required fields (First Name: "John", Last Name: "Doe", Business Name: "Acme Corp", Email: "john@acmecorp.com", Phone: "1234567890", Industry: "Manufacturing", Zip Code: "12345", Password: "SecurePass1!", Confirm Password: "SecurePass1!") and check the Terms & Conditions checkbox, **Then** the form submits successfully, a success modal displays "Account Created Successfully", and the user is redirected to the email verification page.

2. **Given** the user is filling out the registration form, **When** they enter an email that already exists in the system (e.g., "existing@business.com"), **Then** the email field displays an error message "This email is already registered" in red, and the form cannot be submitted.

3. **Given** the user is on the registration page, **When** they enter a password that doesn't meet requirements (e.g., "weak" - no uppercase, no number, too short), **Then** the password field displays inline error messages specifying which requirements are not met, the field is highlighted in red, and the form cannot be submitted.

4. **Given** the user has filled in the Password field with "SecurePass1!", **When** they enter a different value in Confirm Password field (e.g., "DifferentPass2@"), **Then** the Confirm Password field displays "Passwords do not match" error message in red, and the form cannot be submitted.

5. **Given** the user is on the registration page, **When** they attempt to submit the form without checking the Terms & Conditions checkbox, **Then** an error message appears next to the checkbox "You must accept the terms and conditions", and the form cannot be submitted.

6. **Given** the user is filling out the registration form, **When** they enter invalid data in any field (e.g., First Name: "J" - too short, Email: "notanemail" - invalid format, Zip Code: "123" - too short), **Then** each invalid field displays a specific error message in real-time, the field is highlighted in red, and the form cannot be submitted until all errors are corrected.

7. **Given** the user has successfully submitted the registration form, **When** the backend processes the request, **Then** the user's profile data is stored in the database, a verification email is sent to the provided email address, and the user sees a success modal before being redirected.

8. **Given** the user is on the registration page, **When** they click the "Sign In" link, **Then** they are navigated to the sign-in page.

---

### User Story 2 - Business Account Sign-In (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

An existing business user returns to the platform to access their account. They enter their email and password, optionally choose to remain signed in for 30 days, and gain access to their dashboard to manage workforce assessments.

**Why this priority**: This is equally critical as registration - existing customers must be able to access the platform to derive value from the service. Without reliable sign-in, customer retention and satisfaction suffer dramatically.

**Independent Test**: A registered user can navigate to the sign-in page, enter their valid email and password, optionally check "Remember for 30 days", submit the form, and be redirected to their dashboard with an active session. The session should persist according to their preference.

**Acceptance Scenarios**:

1. **Given** a registered user is on the sign-in page, **When** they enter valid credentials (Email: "john@acmecorp.com", Password: "SecurePass1!") and submit the form, **Then** they are successfully authenticated, redirected to their dashboard, and a secure authentication token is stored (HttpOnly cookie recommended).

2. **Given** a registered user is on the sign-in page, **When** they enter valid credentials and check the "Remember for 30 days" checkbox before submitting, **Then** they are authenticated and redirected to the dashboard, and their session persists for 30 days (the authentication token has a 30-day expiry).

3. **Given** a registered user is on the sign-in page, **When** they enter an incorrect email or password (e.g., Email: "john@acmecorp.com", Password: "WrongPassword"), **Then** a generic error message "Incorrect email or password" is displayed, the email and password fields are highlighted in red, and the user remains on the sign-in page.

4. **Given** a user is filling out the sign-in form, **When** they enter an email without proper format (e.g., "notanemail"), **Then** the email field displays "Please enter a valid email address" error message in real-time, highlighted in red, and the form cannot be submitted.

5. **Given** a user is on the sign-in page, **When** they click the "Forgot password?" link, **Then** they are navigated to the password recovery flow (password reset page).

6. **Given** a user is on the sign-in page, **When** they click the "Sign up" link, **Then** they are navigated to the registration page.

7. **Given** a user is on the sign-in page, **When** they click the "Sign in with Google" button, **Then** they are redirected to Google's OAuth consent screen to authorize the application.

8. **Given** a user is submitting the sign-in form, **When** the form is being processed by the backend, **Then** the submit button shows a loading spinner and is disabled to prevent multiple submissions, and the user receives visual feedback that authentication is in progress.

---

### User Story 3 - Form Accessibility & Validation Feedback (Priority: P2)
\
Users with disabilities or using assistive technologies need to navigate and complete authentication forms easily. All users benefit from clear, real-time validation feedback that helps them understand and correct errors quickly.

**Why this priority**: Accessibility is a legal requirement (WCAG 2.1 Level AA per constitution) and improves the experience for all users. However, it's prioritized after the core flows work correctly, as it enhances rather than enables the functionality.

**Independent Test**: A user navigating with keyboard only (Tab key) can access all form fields in logical order, screen readers announce field labels and error messages correctly, and all validation feedback is provided in real-time with clear, actionable messages.

**Acceptance Scenarios**:

1. **Given** a user is navigating the registration or sign-in form using only a keyboard, **When** they press the Tab key, **Then** the focus moves through form fields in a logical order (First Name → Last Name → Business Name → Email → etc.), and the current focused field is visually indicated.

2. **Given** a user with a screen reader is on the registration form, **When** they navigate to any form field, **Then** the screen reader announces the field label, required status, and any associated error messages.

3. **Given** a user is filling out any form field, **When** they enter invalid data and move to the next field (blur event), **Then** the error message appears immediately next to the invalid field, is announced by screen readers, and the field is highlighted with appropriate ARIA attributes (aria-invalid="true", aria-describedby pointing to error message).

4. **Given** a user has corrected a previously invalid field, **When** the field now contains valid data, **Then** the error message disappears, the red highlight is removed, and screen readers announce that the field is now valid.

5. **Given** a user is on any authentication form, **When** they attempt to submit with invalid fields, **Then** focus automatically moves to the first invalid field, and a summary of errors is announced for screen reader users.

6. **Given** a user is entering a password on the registration form, **When** they type characters, **Then** a password strength indicator (optional but recommended) updates in real-time showing weak/medium/strong status without revealing the actual password characters.

---

### User Story 4 - Google SSO Authentication (Priority: P1)

Users can sign in or register using their existing Google account, providing a streamlined authentication experience without creating a new password. This reduces friction and increases conversion rates for new users.

**Why this priority**: Google SSO significantly improves user experience by eliminating password fatigue and reducing registration friction. Studies show that social login options increase conversion rates by 20-40%. This is critical for SaaS platforms targeting SMBs who value quick onboarding.

**Independent Test**: A user can click "Sign in with Google" on either the sign-in or registration page, complete Google's OAuth flow, and be automatically registered (if new) or authenticated (if existing) and redirected to the dashboard with an active session.

**Acceptance Scenarios**:

1. **Given** a new user is on the sign-in or registration page, **When** they click the "Sign in with Google" button, **Then** they are redirected to Google's OAuth consent screen to authorize the application access to their basic profile information (name, email).

2. **Given** a user has authorized the application on Google's consent screen, **When** Google redirects back to the application with an authorization code, **Then** the system exchanges the code for an access token, retrieves the user's Google profile information, and creates a new account if the email doesn't exist in the system.

3. **Given** a new user completes Google SSO for the first time, **When** their account is created, **Then** their profile is populated with data from Google (first name, last name, email), their email is automatically marked as verified, they are redirected to a business information form to complete required fields (Business Name, Phone, Industry, Zip Code), and no password is stored for their account.

4. **Given** an existing user (who previously registered with email/password or Google) is on the sign-in page, **When** they click "Sign in with Google" and authorize with a Google account matching their registered email, **Then** they are authenticated and redirected to the dashboard with an active session.

5. **Given** a user completes Google SSO authentication, **When** the system creates their session, **Then** an authentication token is stored securely (HttpOnly cookie), the session persists according to default settings (30 days or session-based), and the user is fully authenticated.

6. **Given** a user is in the middle of the Google OAuth flow, **When** they cancel or deny authorization on Google's consent screen, **Then** they are redirected back to the sign-in page with a message "Google sign-in was cancelled. Please try again or sign in with email."

7. **Given** a user completes Google SSO, **When** Google returns an error (e.g., invalid state, network timeout), **Then** the system displays a user-friendly error message "Unable to complete Google sign-in. Please try again or use email/password." and logs the error details for debugging.

8. **Given** a user has an existing account created with email/Reviwingpassword, **When** they later sign in with Google using the same email address, **Then** the system links the Google account to their existing profile, allowing them to sign in with either method in the future.

---

### Edge Cases

- What happens when the user loses internet connection while submitting the registration or sign-in form? The system should display a user-friendly error message: "Unable to connect. Please check your internet connection and try again."

- What happens when the backend API is unavailable or returns a 500 error? The system should display: "We're experiencing technical difficulties. Please try again in a few moments."

- What happens when the user's session expires while they are logged in? The system should detect the expired token on the next API call, clear the stored token, redirect to the sign-in page, and display a message: "Your session has expired. Please sign in again."

- What happens when the user tries to register with an email from a temporary/disposable email service? The backend should reject the email and return an error: "Please use a valid business email address."

- What happens when the user enters a phone number in various formats (e.g., with dashes, parentheses, spaces, or different country codes)? The system should normalize the input to a standard format (e.g., removing non-numeric characters) before validation and submission.

- What happens when the "Remember for 30 days" option is selected but the user explicitly logs out? The system should immediately invalidate the session and clear the stored token, regardless of the 30-day setting.

- What happens if the user navigates away from the registration form after filling out several fields? The form data should not persist (for security reasons), and the user must start over if they return.

- What happens when a user selects "Other" in the Industry dropdown? The selection is flagged for manual review on the backend, but the user can complete registration without additional action.

- What happens when the backend email uniqueness check times out? The system should allow form submission and handle the duplicate email error from the backend on submission, displaying: "This email is already registered."

- What happens when a user tries to sign in with Google but their Google account email doesn't have a verified email? The system should display: "Please verify your email with Google before signing in."

- What happens when a user signs in with Google but the Google API returns incomplete profile data (missing name or email)? The system should prompt the user to complete the missing information manually before proceeding.

- What happens when a user has multiple Google accounts and switches accounts during the OAuth flow? The system should handle the final authorized account and create/authenticate based on that email address.

- What happens if the Google OAuth token expires during the redirect flow? The system should detect the expired token, display an error message, and allow the user to retry the Google sign-in process.

- What happens when the system disables the submit button on first click? The button should show a loading spinner immediately, be disabled to prevent duplicate submissions, and remain disabled until the API response is received (success or error).

- What happens when there's a network interruption during form submission after the timeout period? The system should display the timeout error message with a "Retry" button that allows the user to resubmit without re-entering all form data.

- What happens when a user's email verification token expires and they try to sign in? The system should detect the unverified status and display a message: "Your email is not verified. Please check your inbox or request a new verification email." with a "Resend verification email" link on the login page.

- What happens when the Industry dropdown API fails to load options? The system should display a predefined fallback list of common industries to ensure users can still complete registration.

- What happens when a user enters a business name longer than 100 characters? The system should truncate the input at 100 characters maximum and display a character counter showing "100/100 characters" to inform the user of the limit.

- What happens when a user registers with a free email provider (gmail.com, yahoo.com, outlook.com)? The system should allow registration to proceed but flag the account for manual business verification review on the backend, with no visible indication to the user during registration.

- What happens when input contains potentially malicious code (SQL injection attempts, XSS scripts)? The system should implement client-side input sanitization and filtering, while relying on server-side validation and parameterized queries for primary protection against injection attacks.

## Requirements *(mandatory)*

### Functional Requirements

#### Registration Flow

- **FR-001**: System MUST provide a registration form with exactly 10 fields: First Name, Last Name, Legal Business Name, Email, Phone Number, Industry (dropdown), Zip Code, Password, Confirm Password, and Terms & Conditions checkbox.

- **FR-002**: System MUST validate First Name and Last Name fields to require minimum 2 characters each, and display error message "Must be at least 2 characters" if violated.

- **FR-003**: System MUST validate Legal Business Name field to require minimum 2 characters and display error message "Business name must be at least 2 characters" if violated.

- **FR-004**: System MUST validate Email field to require "@" and "." characters in appropriate positions (valid email format), and display error message "Please enter a valid email address" if violated.

- **FR-005**: System MUST check Email uniqueness against the backend before or during form submission, and display error message "This email is already registered" if the email already exists in the database.

- **FR-006**: System MUST validate Phone Number field to require exactly 10 digits with support for country code formatting, and display error message "Please enter a valid 10-digit phone number" if violated.

- **FR-007**: System MUST provide an Industry dropdown with a predefined list of industries and an "Other" option, require selection, and display error message "Please select an industry" if not selected.

- **FR-008**: System MUST flag "Other" industry selections for manual review on the backend (implementation detail for backend, frontend only needs to submit the value).

- **FR-009**: System MUST validate Zip Code field to require exactly 5 digits, and display error message "Please enter a valid 5-digit zip code" if violated.

- **FR-010**: System MUST validate Password field to require minimum 8 characters, at least 1 uppercase letter, at least 1 lowercase letter, at least 1 number, and at least 1 symbol, and display specific error messages for each unmet requirement (e.g., "Password must contain at least one uppercase letter").

- **FR-011**: System MUST validate Confirm Password field to match the Password field exactly, and display error message "Passwords do not match" if they differ.

- **FR-012**: System MUST require the Terms & Conditions checkbox to be checked before form submission, and display error message "You must accept the terms and conditions" if not checked.

- **FR-013**: System MUST perform real-time validation on all fields as the user types or when the field loses focus (blur event), displaying inline error messages immediately.

- **FR-014**: System MUST highlight all fields with validation errors in red with clear visual indicators (border color, error icon, or similar).

- **FR-015**: System MUST disable the form submit button and prevent form submission if any field has validation errors.

- **FR-016**: System MUST call the backend API endpoint (e.g., /api/auth/signup) upon successful form submission with all validated data.

- **FR-017**: System MUST display a success modal with the message "Account Created Successfully" when the backend confirms successful account creation.

- **FR-018**: System MUST redirect the user to an email verification page after displaying the success modal.

- **FR-019**: System MUST provide a "Sign In" link on the registration page that navigates to the sign-in page.

- **FR-020**: System SHOULD display a password strength indicator (weak/medium/strong) as the user types in the Password field, without revealing the actual password characters.

#### Sign-In Flow

- **FR-021**: System MUST provide a sign-in form with Email field, Password field, "Remember for 30 days" checkbox, "Forgot password?" link, "Sign in with Google" button (disabled for MVP), and "Sign up" link.

- **FR-022**: System MUST validate Email field in sign-in form to require valid email format with "@" and "." characters, displaying error message "Please enter a valid email address" if violated.

- **FR-023**: System MUST validate Password field in sign-in form to meet security requirements (same as registration password requirements).

- **FR-024**: System MUST call the backend API endpoint (e.g., /api/auth/signin) with email and password upon form submission.

- **FR-025**: System MUST display a generic error message "Incorrect email or password" when authentication fails, without specifying whether the email or password was incorrect (security best practice).

- **FR-026**: System MUST highlight Email and Password fields in red when authentication fails.

- **FR-027**: System MUST create a session on the backend upon successful authentication and receive an authentication token in response.

- **FR-028**: System MUST store the authentication token securely, preferably using HttpOnly cookies to prevent XSS attacks.

- **FR-029**: System MUST respect the "Remember for 30 days" checkbox setting by configuring the authentication token/session to persist for 30 days when checked.

- **FR-030**: System MUST redirect authenticated users to the dashboard page after successful sign-in.

- **FR-031**: System MUST provide a "Forgot password?" link that navigates to the password recovery flow (password reset page).

- **FR-032**: System MUST provide a "Sign up" link that navigates to the registration page.

- **FR-033**: System MUST display a "Sign in with Google" button that is visually present but disabled/grayed out with an appropriate indicator (tooltip or text) stating "Coming soon" or similar.

- **FR-034**: System MUST display a loading spinner and disable the submit button during sign-in form submission to prevent multiple submissions and provide feedback to the user.

#### Google SSO Flow

- **FR-035-SSO**: System MUST provide a "Sign in with Google" button on both the sign-in and registration pages, styled consistently with Untitled UI components.

- **FR-036-SSO**: System MUST initiate Google OAuth 2.0 flow when the "Sign in with Google" button is clicked, redirecting users to Google's consent screen with appropriate scopes (email, profile).

- **FR-037-SSO**: System MUST include CSRF protection by generating and validating a state parameter during the OAuth flow to prevent cross-site request forgery attacks.

- **FR-038-SSO**: System MUST handle the OAuth callback from Google via a dedicated backend endpoint (e.g., `/api/auth/google/callback`) that exchanges the authorization code for an access token server-side, retrieves the user's profile information (email, first name, last name, profile picture URL), and redirects to the frontend with a secure session cookie set.

- **FR-039-SSO**: System MUST check if a user with the Google account email already exists in the database, and if so, authenticate that user and create a session.

- **FR-040-SSO**: System MUST create a new user account when a Google account email is not found in the database, populating profile fields with Google data (first name, last name, email) and marking email as verified.

- **FR-041-SSO**: System MUST redirect new Google SSO users to a separate business information page (`/onboarding/business-info`) to collect required fields not provided by Google (Business Name, Phone Number, Industry, Zip Code) before allowing dashboard access. This page must be completed before the user can proceed.

- **FR-042-SSO**: System MUST link Google accounts to existing user profiles when a user with the same email address signs in with Google for the first time (account linking).

- **FR-043-SSO**: System MUST handle OAuth errors gracefully, displaying user-friendly messages for scenarios including: authorization denied, invalid state, network failures, and API errors.

- **FR-044-SSO**: System MUST store Google OAuth tokens securely (encrypted) if needed for future API calls, or discard them if only used for authentication.

- **FR-045-SSO**: System MUST NOT require a password for accounts created via Google SSO, allowing those users to sign in exclusively through Google unless they later set a password.

- **FR-046-SSO**: System MUST handle cases where Google returns incomplete profile data by prompting users to provide missing required information manually.

- **FR-047-SSO**: System MUST display appropriate loading states during the OAuth flow, including when redirecting to Google and when processing the callback.

#### General Authentication Requirements

- **FR-048**: System MUST implement proper error handling for network failures, displaying user-friendly messages like "Unable to connect. Please check your internet connection and try again."

- **FR-049**: System MUST implement proper error handling for backend errors (e.g., 500 Internal Server Error), displaying messages like "We're experiencing technical difficulties. Please try again in a few moments."

- **FR-050**: System MUST never display passwords in plain text at any time; password fields must use masked input (type="password"), and password values must be cleared from form state immediately after successful API response to minimize memory exposure.

- **FR-051**: System MUST implement proper ARIA labels on all form fields for screen reader accessibility.

- **FR-052**: System MUST ensure logical tab order for keyboard navigation through all form fields and interactive elements.

- **FR-053**: System MUST use React Hook Form for form state management and Zod for schema validation as specified in the tech stack.

- **FR-054**: System MUST use Axios as the HTTP client with proper error interceptors for handling authentication errors and network failures, configured with a 10-second timeout for all authentication API calls, displaying "Request timed out. Please try again." if the timeout is exceeded.

- **FR-055**: System MUST use React Router v6 for navigation between authentication pages (registration, sign-in, password reset, email verification, business information form at `/onboarding/business-info`).

- **FR-056**: System MUST implement responsive design that works correctly on mobile, tablet, and desktop screen sizes following mobile-first principles.

- **FR-057**: System MUST use Untitled UI components (Input, Button, Form, Card, Checkbox, Select) styled with Tailwind CSS for consistent UI design.

- **FR-058**: System MUST detect expired authentication tokens on API calls, clear stored credentials, redirect to sign-in page, and display message "Your session has expired. Please sign in again."

### Key Entities

- **User Account**: Represents a business user's account in the system. Attributes include: first name, last name, legal business name, email (unique identifier for authentication), phone number, industry, zip code, hashed password (nullable for Google SSO accounts), email verification status, account creation timestamp, last login timestamp, authentication method (email/password, Google SSO, or both), Google account ID (if linked), and profile picture URL (from Google).

- **Authentication Session**: Represents an active user session after successful sign-in. Attributes include: session token/JWT, user identifier, session expiry timestamp (either short-lived or 30 days based on "Remember me" setting), device/browser information for security tracking, and session creation timestamp.

- **Form Validation Error**: Represents validation errors encountered during form submission. Attributes include: field name, error message, error type (format, required, uniqueness, etc.), and timestamp of validation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the registration process in under 3 minutes with all required fields properly validated.

- **SC-002**: The sign-in process completes in under 10 seconds from form submission to dashboard redirect under normal network conditions, with a 10-second timeout enforced for API calls.

- **SC-003**: Form validation errors are displayed in real-time within 200 milliseconds of the user's input or blur event.

- **SC-004**: The authentication module achieves WCAG 2.1 Level AA compliance, verified through automated accessibility testing tools (axe-core or similar).

- **SC-005**: All forms are fully navigable using keyboard only, with no mouse required to complete any authentication flow.

- **SC-006**: Password validation prevents 100% of weak passwords (those not meeting the 8+ characters, uppercase, lowercase, number, symbol requirements) from being accepted.

- **SC-007**: Email uniqueness validation prevents 100% of duplicate account registrations using the same email address.

- **SC-008**: The authentication token is stored securely using HttpOnly cookies, preventing XSS-based token theft.

- **SC-009**: Users who select "Remember for 30 days" remain authenticated for the full 30-day period without needing to re-enter credentials.

- **SC-010**: The registration form achieves a 95% completion rate among users who begin filling it out (tracking from first field interaction to successful submission).

- **SC-011**: Authentication error messages never reveal whether an email exists in the system (generic "Incorrect email or password" message prevents account enumeration attacks).

- **SC-012**: The authentication module renders correctly and maintains full functionality on devices with screen widths from 320px (mobile) to 2560px (desktop).

- **SC-013**: Form submission loading states provide immediate visual feedback within 100 milliseconds of user clicking the submit button.

- **SC-014**: All authentication pages load with initial render time under 2 seconds and meet Core Web Vitals thresholds (LCP < 2.5s, FID < 100ms, CLS < 0.1).

- **SC-015**: Google SSO authentication completes in under 15 seconds from button click to dashboard redirect, including Google's consent screen interaction.

- **SC-016**: The Google SSO flow successfully handles 100% of account linking scenarios where users switch between email/password and Google authentication methods.

- **SC-017**: Google SSO registration reduces average user onboarding time by at least 40% compared to traditional email/password registration.

## Assumptions *(optional)*

- The backend API endpoints (/api/auth/signup and /api/auth/signin) already exist or will be developed in parallel, with documented request/response schemas.

- The email verification flow (page and backend logic) will be implemented as a separate feature; this specification only covers redirecting to that page.

- The password reset/forgot password flow will be implemented as a separate feature; this specification only covers the link to initiate that flow.

- The dashboard page exists and is the appropriate landing page after successful authentication.

- The backend handles password hashing and secure storage; the frontend only sends the plain text password over HTTPS.

- HTTPS is enforced for all authentication endpoints to protect credentials in transit.

- The backend enforces rate limiting on authentication endpoints to prevent brute force attacks.

- The predefined industry list will be provided by the product team or can use a standard industry classification (NAICS, SIC, or similar).

- "Business email" validation (rejecting disposable email providers) is handled by the backend if required.

- Session management, token refresh logic, and logout functionality will be implemented as part of the broader application architecture.

- Error messages and validation rules may need localization in the future, but initial implementation is English only.

- A Google Cloud Project is configured with OAuth 2.0 credentials, and the OAuth consent screen is configured with appropriate branding and scopes.

- The backend securely stores Google OAuth Client Secret and handles token exchange; the frontend only initiates the OAuth flow and receives the callback.

- Google accounts used for SSO must have verified email addresses; unverified Google accounts will be rejected.

- Users who create accounts via Google SSO and later want to add password authentication can do so through a separate "Add Password" feature (implementation separate from this spec).

## Dependencies *(optional)*

- **Backend API**: The frontend depends on backend API endpoints for user registration, authentication, email uniqueness checking, and Google OAuth callback handling (`/api/auth/google/callback`). API contracts must be defined and agreed upon before implementation.

- **Email Service**: The backend depends on an email service (e.g., SendGrid, AWS SES) to send verification emails after registration.

- **Untitled UI Library**: The project depends on Untitled UI components being properly installed and configured in the React + Vite project.

- **React Hook Form & Zod**: Form validation depends on these libraries being installed and configured correctly.

- **Axios**: HTTP requests depend on Axios being installed with proper configuration for base URL, headers, and error interceptors.

- **React Router v6**: Navigation between authentication pages depends on React Router being installed and configured with appropriate routes.

- **Tailwind CSS**: All styling depends on Tailwind CSS v4+ being properly configured with the @tailwindcss/vite plugin.

- **Google OAuth 2.0**: The Google SSO feature depends on a Google OAuth 2.0 client library (e.g., @react-oauth/google or similar) being installed and configured with valid Google Cloud Project credentials (Client ID, Client Secret).

- **Backend OAuth Endpoints**: The frontend depends on backend API endpoints for OAuth callback handling, token exchange, and user profile creation/linking.

## Out of Scope *(optional)*

The following features are explicitly excluded from this specification:

- **Email Verification Implementation**: Only the redirect to the verification page is included; the actual verification page, backend logic, and email template are separate features.

- **Password Reset Flow**: Only the "Forgot password?" link is included; the actual password reset pages and backend logic are separate features.

- **Multi-Factor Authentication (MFA)**: MFA/2FA is not included in the initial authentication module.

- **Additional Social Login Providers**: Only Google OAuth is included; other social login providers (Facebook, LinkedIn, Microsoft, Apple, etc.) are not included.

- **Add Password to Google SSO Accounts**: While Google SSO accounts are created without passwords, the ability to later add a password to enable dual authentication methods is a separate feature.

- **Account Deletion**: User account deletion functionality is not part of this authentication module.

- **Profile Editing**: After account creation, editing profile information is a separate feature.

- **Role-Based Access Control (RBAC)**: Authorization and permissions beyond basic authentication are out of scope.

- **Session Management UI**: Viewing active sessions, device management, or "log out all devices" functionality is not included.

- **Audit Logging UI**: While backend may log authentication events, no user-facing audit log is included.

- **CAPTCHA/Bot Prevention**: Bot protection mechanisms are not explicitly included but may be added by backend team.

- **Passwordless Authentication**: Magic links, SMS OTP, or other passwordless methods are not included.

- **Account Recovery**: Beyond password reset link, no additional account recovery mechanisms (security questions, backup codes, etc.) are included.


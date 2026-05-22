# Feature Specification: Profile Settings Module

**Feature Branch**: `002-profile-settings`  
**Created**: 30 January 2026  
**Status**: Draft  
**Input**: User description: "Profile Settings Module Implementation - comprehensive settings module with update profile, email, password, retake assessment, and delete account features"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View and Update Basic Profile Information (Priority: P1)

A user needs to update their personal information (first name and last name) to keep their profile current. When they navigate to the Settings page, they should see their existing information and be able to make changes quickly.

**Why this priority**: Core profile management functionality that provides immediate value. Users expect to be able to update basic profile information as a fundamental feature of any application.

**Independent Test**: Can be fully tested by navigating to Settings, editing first/last name fields, clicking Save, and verifying the success confirmation appears. Delivers immediate value by allowing users to maintain accurate profile information.

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** they click on the Settings tab, **Then** the settings page displays with their current First Name, Last Name, Email (disabled), and Password as masked placeholder "••••••••" (read-only, disabled) with a "Change Password" link
2. **Given** the settings page is displayed, **When** the user modifies their First Name or Last Name and clicks "Save", **Then** the system updates the profile information and displays a success modal with "Update Complete" message
3. **Given** the update was successful, **When** the user clicks "Back to Settings" in the success modal, **Then** they are redirected to the settings page with updated information visible
4. **Given** the settings page is loaded, **When** the profile data retrieval fails, **Then** an error message is displayed with details about the failure

---

### User Story 2 - Update Email Address (Priority: P2)

A user wants to change their email address for account communications and login. They need to provide a new email address, receive verification, and confirm the change.

**Why this priority**: Critical for account security and user autonomy, but not blocking basic profile functionality. Email verification adds a security layer to prevent unauthorized changes.

**Independent Test**: Can be fully tested by clicking "Update Email" link, entering a new valid email address, submitting the change, and verifying that the link changes to "Resend Verification Email" and a success message appears.

**Acceptance Scenarios**:

1. **Given** a user is on the settings page, **When** they click the "Update Email" link, **Then** the Update Email modal opens displaying their current email (disabled) and a field for the new email address
2. **Given** the Update Email modal is open, **When** the user enters a valid new email address and submits, **Then** the system updates the email, sends verification email with magic link to new address, and displays a success modal with confirmation message
3. **Given** the email update was successful, **When** the user returns to the settings page, **Then** the "Update Email" link is replaced with "Resend Verification Email" link AND a "Verification pending" badge appears next to the email field
4. **Given** the user clicks the verification magic link in their email, **When** the verification completes successfully, **Then** the settings page updates to show verified status (removes "Verification pending" badge) and restores "Update Email" link
5. **Given** the Update Email modal is open, **When** the user enters an invalid email format, **Then** validation feedback is displayed preventing submission
6. **Given** the email update fails, **When** the error response is received, **Then** an error message component displays the failure details

---

### User Story 3 - Change Password (Priority: P2)

A user wants to update their password for security reasons or because they've forgotten it. They need to provide their current password and choose a new one that meets security requirements.

**Why this priority**: Essential security feature that empowers users to maintain account security, but not required for initial profile viewing/editing functionality.

**Independent Test**: Can be fully tested by clicking "Change Password" link, entering current and new passwords with validation, submitting, and verifying the success confirmation modal appears.

**Acceptance Scenarios**:

1. **Given** a user is on the settings page, **When** they click the "Change Password" link, **Then** the Change Password modal opens with fields for current password and new password
2. **Given** the Change Password modal is open, **When** the user enters their current password and a valid new password that meets requirements and submits, **Then** the system updates the password and displays a success modal
3. **Given** the password change was successful, **When** the user clicks "Back to Settings" in the success modal, **Then** they are redirected to the settings page
4. **Given** the Change Password modal is open, **When** the user enters passwords that don't meet validation requirements, **Then** validation feedback is displayed preventing submission
5. **Given** the password change fails, **When** the error response is received, **Then** an error message component displays the failure details

---

### User Story 4 - Retake Assessment (Priority: P3)

A user wants to retake their workforce assessment to update their profile results or skills evaluation. Before proceeding, they should be warned that this action may affect their existing results. Upon confirmation, the system calls the assessment API to initiate the retake, and on success redirects the user to the assessment page.

**Why this priority**: Feature-specific functionality that enhances user experience but is not core to profile management. Users who need to retake assessments represent a subset of use cases.

**Independent Test**: Can be fully tested by clicking "Retake the Assessment" button, confirming the warning modal appears with appropriate buttons, clicking "Yes, Retake Assessment", verifying the API is called, and verifying redirection to the assessment page on success or an error message on failure.

**Acceptance Scenarios**:

1. **Given** a user is on the settings page, **When** they click the "Retake the Assessment" button, **Then** a confirmation modal appears with warning styling and "Yes, Retake Assessment" and "Cancel" buttons
2. **Given** the retake confirmation modal is open, **When** the user clicks "Yes, Retake Assessment", **Then** the system shows a loading spinner on the confirm button, disables both "Yes, Retake Assessment" and "Cancel" buttons, and calls the retake assessment API (`/api/v1/assessment`)
3. **Given** the retake assessment API returns a successful response, **When** the response is received, **Then** the confirmation modal closes and the user is redirected to the assessment page
4. **Given** the retake assessment API returns an error, **When** the error response is received, **Then** the confirmation modal closes, buttons are re-enabled, and an error message is displayed using the existing ErrorMessage component
5. **Given** the retake assessment API call is in progress, **When** the user attempts to click "Yes, Retake Assessment" or "Cancel", **Then** neither button responds because both are disabled during the API call
6. **Given** the retake confirmation modal is open and no API call is in progress, **When** the user clicks "Cancel", **Then** the modal closes and they remain on the settings page

---

### User Story 5 - Delete Account (Priority: P3)

A user wants to permanently delete their account and all associated data. This is a destructive action that requires explicit confirmation to prevent accidental deletion.

**Why this priority**: Important for user data rights and compliance, but represents an infrequent use case. This is a terminal action that should be available but doesn't need to be prioritized for initial implementation.

**Independent Test**: Can be fully tested by clicking "Delete my Account" button, confirming the warning modal appears, clicking "Yes, Delete my account", and verifying either successful redirection to success page or appropriate error handling.

**Acceptance Scenarios**:

1. **Given** a user is on the settings page, **When** they click the "Delete my Account" button, **Then** a confirmation modal appears with warning styling and "Yes, Delete my account" and "Cancel" buttons
2. **Given** the delete confirmation modal is open, **When** the user clicks "Yes, Delete my account", **Then** the system deletes the user account, clears all user data from Redux store, clears authentication tokens, and redirects to `/account-deleted-success` page
3. **Given** the user is redirected to account deleted success page, **When** the page loads, **Then** the page displays "Your account has been successfully deleted" message with links to homepage or sign-up page and no navigation back to authenticated pages
4. **Given** a user account has been deleted, **When** the user tries to log in with deleted credentials, **Then** the system prevents login
5. **Given** the delete confirmation modal is open, **When** the user clicks "Cancel", **Then** the modal closes and they remain on the settings page with their account intact
6. **Given** the delete account request is submitted, **When** the deletion fails, **Then** an error message component displays the failure details

---

### User Story 6 - Resend Email Verification (Priority: P3 - **BLOCKED**)

**Status**: Blocked - Awaiting API specification

A user who has updated their email but hasn't received the verification email needs to request it again. This ensures they can complete the email change process.

**Why this priority**: Support feature for the email update flow. Only relevant after a user has already updated their email, making it a follow-up feature.

**Independent Test**: Can be fully tested by completing an email update first (making the link visible), clicking "Resend Verification Email", and verifying the appropriate response.

**Acceptance Scenarios**:

1. **Given** a user has updated their email, **When** they click the "Resend Verification Email" link on the settings page, **Then** the system sends another verification email
   - **Note**: API endpoint and payload specification pending

---

## Clarifications

### Session 2026-03-13

- Q: When the user clicks "Yes, Retake Assessment" and the API call is in progress, what should the modal display to prevent duplicate submissions? → A: Show loading spinner on confirm button + disable both buttons while API is in progress

### Session 2026-02-12

- Q: When should validation errors be displayed to the user - as they type in real-time, only when they try to submit, or hybrid approach? → A: Real-time validation - show validation errors as the user types, immediately clearing errors when the input is corrected
- Q: Where should error messages display and should invalid fields have visual indicators like red borders or icons? → A: Error message only - display text error message below/inside the input field, no border change or icon on the input field itself
- Q: Should Save/Update buttons be disabled when validation errors exist, or remain enabled for users to attempt submission? → A: Disable submit when errors exist - Save/Update buttons are disabled (grayed out) whenever any field has a validation error
- Q: When should current password field be validated - in real-time with format checks, or only on submit? → A: Real-time validation for current password too - Validate all three fields (current, new, confirm) as user types, showing errors immediately for empty/too-short current password, but actual correctness of current password only validated on submit
- Q: How should confirm password field be displayed - masked like new password or visible for verification? → A: Both masked - Both new password and confirm password fields display as masked dots (••••) for security

### Session 2026-01-30

- Q: When a user tries to update their email to an address that's already registered by another user, what should happen? → A: Display specific error "This email is already in use" and prevent update
- Q: How should the system handle network failures during profile update operations (e.g., timeout, connection lost)? → A: Auto-retry once; show error with "Retry" button preserving form data
- Q: When a user's session expires while they're filling out the Change Password modal (before submission), what should happen? → A: Show session expired warning; redirect to login; restore modal after re-auth (without password values)
- Q: How should the system handle concurrent updates when a user has the settings page open in multiple browser tabs and modifies their profile in one tab? → A: Show notification in other tabs "Profile updated in another tab" with refresh button
- Q: When a user enters an incorrect current password in the Change Password modal, how should the system respond regarding security and rate limiting? → A: Allow 5 attempts; after 5 failures, lock account for 15 minutes; require verification
- Q: What happens after successful account deletion and how should the password field be displayed on settings page? → A: After deletion: clear all data, clear tokens, redirect to `/account-deleted-success`, show confirmation, prevent re-login. Password display: show masked placeholder "••••••••" (read-only), provide "Change Password" link

---

### Edge Cases

- **Duplicate Email**: When a user tries to update their email to an address that's already in use by another account, the system displays the error message "This email is already in use" and prevents the update.
- **Network Failures**: When profile update operations fail due to network issues (timeout, connection lost), the system automatically retries once, then displays an error message with a "Retry" button that preserves the user's form data for easy resubmission.
- **Session Expiry During Modal Interaction**: If a user's session expires while they're filling out the Change Password modal (before submission), the system shows a session expired warning, redirects to login, and restores the modal after successful re-authentication without any password values (user must re-enter passwords).
- **Concurrent Updates Across Tabs**: When a user has the settings page open in multiple browser tabs and saves changes in one tab, the system displays a notification in the other tabs stating "Profile updated in another tab" with a refresh button to reload the updated data.
- **Incorrect Current Password & Rate Limiting**: When a user enters an incorrect current password in the Change Password modal, the system allows up to 5 attempts. After 5 failed attempts, the account is locked for 15 minutes and requires verification to unlock. Each failed attempt displays an error message with remaining attempts count.
- **Account Deletion Flow**: After successful account deletion, the system: (1) clears all user data from Redux store, (2) clears authentication tokens, (3) redirects to `/account-deleted-success` page, (4) displays "Your account has been successfully deleted" message, (5) prevents user from logging back in with deleted credentials. The success page displays confirmation message with link to homepage or sign-up page, and no navigation back to authenticated pages.
- **Password Field Display**: The Settings page does NOT show an actual password input field. Instead, it displays a masked placeholder "••••••••" (read-only, disabled) with a "Change Password" link next to it. Clicking the link opens the ChangePasswordModal.
- **Retake Assessment API Failure**: When the retake assessment API call fails (network error, server error, or any non-success response), the system closes the confirmation modal and displays an error message using the existing ErrorMessage component. The user remains on the settings page and can retry by clicking "Retake the Assessment" again.
- **Retake Assessment Duplicate Click Prevention**: While the retake assessment API call is in progress, both modal buttons ("Yes, Retake Assessment" and "Cancel") are disabled and the confirm button displays a loading spinner, preventing duplicate API calls.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST retrieve and display user's current profile information (first name, last name, email, password status) when the Settings page loads
- **FR-002**: System MUST send authenticated API requests using the accessToken in headers for all profile operations
- **FR-003**: Email field MUST be displayed as disabled (read-only) on the initial settings page view
- **FR-004**: Password field MUST be displayed as a masked placeholder "••••••••" (read-only, disabled) with a "Change Password" link next to it - do NOT show an actual password input field
- **FR-004a**: Clicking the "Change Password" link next to the password field MUST open the ChangePasswordModal
- **FR-005**: Users MUST be able to edit their First Name and Last Name fields
- **FR-006**: System MUST validate that First Name and Last Name are not empty and display real-time validation errors as the user types, clearing errors immediately when the input is corrected
- **FR-006a**: System MUST disable the "Save" button when any validation error exists in the First Name or Last Name fields, preventing submission until all errors are resolved
- **FR-007**: System MUST send profile updates (first name, last name) to the backend via PATCH request when user clicks "Save"
- **FR-008**: System MUST display a success modal (BaseModalWithIcon) with "Update Complete" title, success styling, checkmark icon, and "Back to Settings" button after successful profile update
- **FR-009**: System MUST redirect user back to settings page when they click "Back to Settings" in any success modal
- **FR-010**: System MUST display an error message (ErrorMessage component) with details when any API request fails
- **FR-010a**: System MUST automatically retry failed API requests once before displaying error, and provide a "Retry" button that preserves user's form data. EXCEPTION: Password fields MUST NOT be preserved for security reasons - user must re-enter passwords on retry.
- **FR-011**: Users MUST be able to open the Update Email modal by clicking "Update Email" link
- **FR-012**: Update Email modal MUST display the current email address in a disabled field
- **FR-013**: Update Email modal MUST provide an input field for the new email address with real-time validation that displays errors as the user types and clears errors immediately when corrected
- **FR-014**: System MUST validate email format in real-time, displaying validation errors as the user types and preventing submission when validation fails
- **FR-014b**: System MUST disable the "Update Email" button when any validation error exists in the new email field, preventing submission until all errors are resolved
- **FR-014a**: System MUST check for duplicate email addresses and display error message "This email is already in use" if the email is already registered to another account
- **FR-015**: System MUST send email update to backend via PATCH request when user submits new email
- **FR-016**: System MUST change "Update Email" link to "Resend Verification Email" link after successful email update AND display "Verification pending" badge or indicator next to email field. Badge MUST be removed after user successfully verifies email via magic link. Verification status MUST be stored in Redux state and checked on settings page load.
- **FR-017**: Users MUST be able to open the Change Password modal by clicking "Change Password" link
- **FR-018**: Change Password modal MUST provide fields for current password, new password, and confirm password with real-time validation that displays errors as the user types and clears errors immediately when corrected
- **FR-018a**: Change Password modal MUST display validation errors inside the modal body (consistent with Update Email Modal), below or adjacent to the corresponding input fields
- **FR-019**: System MUST validate all password fields in real-time:
  - Current password: Required, minimum 8 characters
  - New password: Required, minimum 8 characters, must contain uppercase, lowercase, number, special character, and be different from current password
  - Confirm password: Required, must match new password exactly
- **FR-019a**: System MUST disable the "Change Password" submit button when any validation error exists in current password, new password, or confirm password fields, preventing submission until all errors are resolved
- **FR-020**: System MUST send password update to backend via PATCH request when user submits valid password change
- **FR-021**: Users MUST be able to trigger retake assessment by clicking "Retake the Assessment" button
- **FR-022**: System MUST display a confirmation modal (BaseModalWithIcon) with warning styling, explanatory message, and "Yes, Retake Assessment" and "Cancel" buttons before allowing retake
- **FR-023**: When the user clicks "Yes, Retake Assessment", the system MUST call the retake assessment API (`/api/v1/assessment`) using the existing API service pattern
- **FR-023a**: On successful API response, system MUST close the confirmation modal and redirect the user to the assessment page
- **FR-023b**: On API error response, system MUST close the confirmation modal and display the error using the existing ErrorMessage component with error details
- **FR-023c**: System MUST NOT change any existing functionality related to modal display, cancel behavior, or other settings page operations when integrating the retake assessment API
- **FR-023d**: While the retake assessment API call is in progress, the system MUST show a loading spinner on the "Yes, Retake Assessment" button and disable both the confirm and cancel buttons to prevent duplicate submissions
- **FR-024**: Users MUST be able to trigger account deletion by clicking "Delete my Account" button
- **FR-025**: System MUST display a confirmation modal (BaseModalWithIcon) with warning styling, explanatory message, and "Yes, Delete my account" and "Cancel" buttons before allowing deletion
- **FR-026**: System MUST send account deletion request to backend via DELETE request when user confirms deletion
- **FR-027**: System MUST clear all user data from Redux store after successful account deletion
- **FR-027a**: System MUST clear all authentication tokens after successful account deletion
- **FR-027b**: System MUST redirect user to `/account-deleted-success` page after successful account deletion
- **FR-027c**: Account deleted success page MUST display confirmation message "Your account has been successfully deleted"
- **FR-027d**: Account deleted success page MUST provide links to homepage or sign-up page and prevent navigation back to authenticated pages
- **FR-027e**: System MUST prevent deleted user credentials from being used to log back in. After successful account deletion: (1) API MUST invalidate the current session token immediately, (2) Client MUST clear all stored authentication data (tokens, refresh tokens, user session), (3) API MUST mark user account as deleted in database, (4) Any subsequent API requests with deleted user credentials MUST return 401 Unauthorized with error message "Account has been deleted".
- **FR-028**: System MUST manage modal visibility state using Redux Toolkit for all modals (UpdateYourEmailModal, ChangePasswordModal, confirmation modals)
- **FR-029**: System MUST use existing ErrorMessage component consistently for all error scenarios
- **FR-030**: System MUST use existing BaseModalWithIcon component for all confirmation and success messages
- **FR-031**: System MUST follow the API calling patterns established in the existing auth module
- **FR-032**: System MUST detect session expiry via TWO mechanisms: (1) Proactive detection by checking JWT token expiry timestamp before modal submission (warn user if token expires within 5 minutes), (2) Reactive detection by handling 401 Unauthorized API responses (redirect to login with session expired message). Both mechanisms MUST work together for optimal UX.
- **FR-033**: System MUST restore the user's modal context (which modal was open) after successful re-authentication using sessionStorage key 'profile-modal-context'. Store modal identifier (e.g., 'change-password', 'update-email') before redirect to login. After re-auth, check sessionStorage and reopen the modal if context exists. MUST clear all password field values and any other sensitive data from form state - user must re-enter sensitive information.
- **FR-034**: System MUST detect when profile data is updated in another browser tab using BroadcastChannel API (for modern browsers) with localStorage event listener fallback (for older browsers). When profile update occurs in one tab, broadcast 'profile-updated' event with timestamp. All other tabs listening on same channel display notification "Profile updated in another tab" with a refresh button.
- **FR-035**: System MUST reload profile data when user clicks the refresh button in the concurrent update notification
- **FR-036**: System MUST track failed password change attempts SERVER-SIDE and allow maximum of 5 attempts per account. Failed attempt count MUST persist on server and be returned in API error responses. Client-side tracking is for display purposes only and MUST NOT enforce security policy.
- **FR-037**: System MUST display error message with remaining attempts count after each failed password change attempt. Remaining count MUST be retrieved from API 401 Unauthorized response field `attemptsRemaining`.
- **FR-038**: System MUST lock the account SERVER-SIDE for 15 minutes after 5 failed password change attempts. Lockout enforcement MUST be server-side (API rejects password change requests during lockout). Client displays lockout message retrieved from API 429 Too Many Requests response with `lockoutDuration` field (900 seconds).

## API Endpoints *(mandatory)*

### Profile Management

- **GET** `{{baseUrl}}/api/v1/users/{{userId}}` - Retrieve user profile
  - **Headers**: `Authorization: Bearer {{accessToken}}`
  - **Response**: `{ "firstName": "string", "lastName": "string", "email": "string" }`

- **PATCH** `{{baseUrl}}/api/v1/profile` - Update first name and last name
  - **Headers**: `Authorization: Bearer {{accessToken}}`
  - **Payload**: `{ "firstName": "string", "lastName": "string" }`
  - **Response**: Success confirmation object

### Email Management

- **PATCH** `{{baseUrl}}/api/v1/profile/email` - Update email address
  - **Headers**: `Authorization: Bearer {{accessToken}}`
  - **Payload**: `{ "email": "test123@gmail.com" }`
  - **Response**: Success confirmation object
  - **Error Response (409 Conflict)**: `{ "error": "This email is already in use" }` - when email exists

- **POST** `{{baseUrl}}/api/v1/profile/email/resend` - Resend verification email
  - **Headers**: `Authorization: Bearer {{accessToken}}`
  - **Status**: TBD - API specification pending

### Password Management

- **PATCH** `{{baseUrl}}/api/v1/profile/password` - Change password
  - **Headers**: `Authorization: Bearer {{accessToken}}`
  - **Payload**: `{ "currentPassword": "SecurePass123!", "newPassword": "NewSecurePass456!" }`
  - **Response**: Success confirmation object
  - **Error Response (401 Unauthorized)**: `{ "error": "Incorrect current password", "attemptsRemaining": number }` - when current password is wrong
  - **Error Response (429 Too Many Requests)**: `{ "error": "Account locked due to too many failed attempts", "lockoutDuration": 900 }` - when 5 attempts exceeded (900 seconds = 15 minutes)

### Assessment Management

- **POST** `{{baseUrl}}/api/v1/assessment` - Retake assessment
  - **Headers**: `Authorization: Bearer {{accessToken}}`
  - **Response**: Success confirmation object (assessment initiated)
  - **Error Response (401 Unauthorized)**: Token expired or invalid
  - **Error Response (500 Server Error)**: Server-side failure

### Account Management

- **DELETE** `{{baseUrl}}/api/v1/users/{{userId}}` - Delete user account
  - **Headers**: `Authorization: Bearer {{accessToken}}`
  - **Response**: Success confirmation object

**Authentication**: All requests require `accessToken` in headers using format `Authorization: Bearer {{accessToken}}`

### Key Entities

- **User Profile**: Represents the user's account information including first name, last name, email address, and password status. Related to authentication state and user session.
- **Email Verification**: Represents the verification state of a user's email address after an update, tracking whether verification has been sent and completed.
- **Modal State**: Represents the visibility and content state of various modals (update email, change password, confirmations) managed through Redux Toolkit.
### Email Verification Link Behavior

**Initial State**:
- If user email is verified: Display "Update Email" link
- If user email is unverified: Display "Resend Verification Email" link

**After Email Update**:
- When email update API returns success, change link text from "Update Email" to "Resend Verification Email"
- Store verification status in Redux state

**Link Visibility Logic**:
```jsx
{emailVerificationPending ? (
  <button onClick={handleResendVerification}>Resend Verification Email</button>
) : (
  <button onClick={handleUpdateEmail}>Update Email</button>
)}
```

## Modal Configurations *(mandatory)*

### Modal

```jsx
<BaseModalWithIcon
  title={dynamic value}
  subtitle={dynamic value}
  icon={<CheckCircle className="size-6 text-ws-success-600" />}
  messageImg={checkmarkIcon}
  backgroundPattern={dynamic value}
  buttons={[
    {
      text: {dynamic value},
      onClick: {dynamic value},
      color: "primary",
    },
  ]}
/>
```

## Validation Rules *(mandatory)*

### Email Validation

- Must match regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Cannot be empty
- Maximum length: 255 characters
- Must be different from current email address

### Password Validation - Current Password

- Required field (cannot be empty)
- Minimum length: 8 characters
- No maximum length restriction
- Display as masked field (dots/asterisks)
- Validated against user's current password on submit

### Password Validation - New Password

- Required field (cannot be empty)
- Minimum length: 8 characters
- Must contain at least one uppercase letter (A-Z)
- Must contain at least one lowercase letter (a-z)
- Must contain at least one number (0-9)
- Must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
- Cannot be the same as current password
- Display as masked field (dots/asterisks)

### Password Validation - Confirm Password

- Required field (cannot be empty)
- Must match new password exactly
- Character-by-character comparison
- Display as masked field (dots/asterisks)
- Matched validation message: "Passwords do not match" when confirm differs from new password

### Password Error Display

- All password validation errors (current, new, confirm) MUST be displayed inside the Change Password Modal
- Error location: Inside ModalBody, below or adjacent to the corresponding input field
- Error styling: Consistent with Update Email Modal error display (text-only, no visual indicators)
- Real-time validation: Display errors as user types, clearing errors immediately when corrected
- Error messages MUST be visibly rendered and dismissible

### Password Change Security

- Maximum 5 failed attempts allowed for incorrect current password
- Display remaining attempts count after each failure (e.g., "4 attempts remaining")
- After 5 failed attempts, lock account for 15 minutes
- Require verification to unlock account after lockout period

### Name Validation

- First Name and Last Name cannot be empty
- Minimum length: 1 character
- Maximum length: 50 characters
- No special validation (allow unicode characters for international names)
- Leading and trailing whitespace should be trimmed

## Technical Implementation Guidelines *(mandatory)*

### State Management

- Use Redux Toolkit for modal state management (follow auth module pattern)
- Store user profile data in Redux store with proper slice structure
- Handle loading states for all async operations (loading, success, error)
- Implement proper state cleanup when modals close
- Use selectors to access profile data from state
- Implement cross-tab communication using BroadcastChannel API (preferred) with localStorage event listener fallback
  - Create channel: `const channel = new BroadcastChannel('profile-updates')`
  - Broadcast on profile update: `channel.postMessage({ type: 'PROFILE_UPDATED', timestamp: Date.now() })`
  - Listen in all tabs: `channel.onmessage = (event) => { /* show notification */ }`
  - Fallback: Use `window.addEventListener('storage', handler)` for browsers without BroadcastChannel
- Store modal context in sessionStorage with key 'profile-modal-context' for session expiry recovery
- Track password attempt count in Redux state from API response (display only, not enforcement)

### API Integration

- Reference existing auth module for API calling patterns and structure
- Use existing API service layer/utilities for HTTP requests
- Implement consistent error handling using try-catch blocks in async thunks
- Implement automatic retry logic: retry once on network failure before showing error to user
- Preserve user form data during network failures to enable easy retry via "Retry" button (EXCEPT password fields - never preserve passwords)
- Pass `accessToken` via headers: `Authorization: Bearer ${accessToken}`
- Implement session expiry detection:
  - Proactive: Check JWT token expiry before form submission (decode token, check `exp` claim, warn if expires within 5 minutes)
  - Reactive: Handle 401 Unauthorized responses by redirecting to login with session expired message
- Handle HTTP status codes appropriately:
  - 200/201: Success
  - 400: Validation errors
  - 401: Unauthorized (session expired OR incorrect password - check error message)
  - 403: Forbidden
  - 404: Resource not found
  - 409: Conflict (duplicate email)
  - 429: Too Many Requests (account locked - extract lockoutDuration from response)
  - 500: Server error
- Parse API error responses for user-friendly display:
  - 401 with `attemptsRemaining`: Show "Incorrect password. X attempts remaining."
  - 429 with `lockoutDuration`: Show "Account locked for X minutes due to too many failed attempts."
  - 409: Show "This email is already in use."
- Implement request timeout handling

### Component Reuse

- **ErrorMessage**: Use for all error scenarios with consistent styling (text-only, red-700 text color, danger type)
- **BaseModalWithIcon**: Use for all confirmations and success messages with specific configurations:
  - Success modals: Use CheckCircle icon from @untitledui/icons, green/success theme (green-50 background, green-600 icon), success background pattern
  - Warning modals: Use AlertTriangle icon, yellow/warning theme (yellow-50 background, yellow-600 icon), warning background pattern
  - Confirmation modals: Use AlertCircle icon, red/danger theme (red-50 background, red-600 icon), danger background pattern
- **UpdateYourEmailModal**: Existing modal component (do not recreate) - errors displayed inside ModalBody
- **ChangePasswordModal**: Existing modal component (do not recreate) - 3 password fields, errors displayed inside ModalBody
- **Settings Page**: Existing page component (do not recreate) - integrate modals and handle state

### File Naming Convention for md file

All files must use `profile.` prefix:

- `profile.spec.md` - This specification document
- `profile.plan.md` - Implementation plan
- `profile.task.md` - Task breakdown
- `profileSlice.ts` - Redux slice for profile state (if creating)
- `profileService.ts` - API service layer (if creating)
- `profileTypes.ts` - TypeScript types/interfaces
- `profile.test.tsx` - Component tests

### Code Quality Standards

- Follow existing TypeScript/React coding standards in the codebase
- Use proper type definitions for all API requests/responses
- Implement proper error boundaries
- Write comprehensive unit tests for all components (TDD approach - tests BEFORE implementation)
- Follow accessibility best practices (WCAG 2.1 Level AA - see Accessibility Requirements section)
- Ensure responsive design works on all screen sizes
- All interactive elements MUST meet 44×44px minimum touch target size
- Color contrast MUST meet 4.5:1 ratio for normal text, 3:1 for large text
- Keyboard navigation MUST be fully functional (Tab, Shift+Tab, Enter, Escape)

## Navigation & Redirects *(mandatory)*

### Success Redirects

- **After Profile Update Success**: Redirect to `/settings`
- **After Email Update Success**: Redirect to `/settings` (link changes to "Resend Verification Email")
- **After Password Change Success**: Redirect to `/settings`
- **After Retake Assessment Confirmation (API Success)**: Redirect to `/assessment`
- **After Account Deletion Success**: Redirect to `/account-deleted-success` page with confirmation message "Your account has been successfully deleted" and links to homepage or sign-up page

### Modal Close Behavior

- All modals should close and remain on current page unless redirect is specified
- Clicking "Cancel" button should close modal without any action
- Clicking outside modal (backdrop) should close modal without any action
- Pressing ESC key should close modal without any action
- Success modals should only close via "Back to Settings" button (no backdrop/ESC close)

### Navigation Guards

- Settings page requires authentication - redirect to login if not authenticated
- Detect session expiry proactively during modal interactions and redirect to login with session expired warning
- After re-authentication, restore user context (which modal was open) but clear sensitive fields (passwords)
- Preserve form state if navigation is interrupted
- Confirm navigation away if unsaved changes exist (optional enhancement)

## Design Constraints *(mandatory)*

- **DC-001**: NO changes to existing UI design are permitted
- **DC-002**: All pages and modals already exist - do NOT create new ones
- **DC-003**: Use existing component styling and layouts exactly as provided
- **DC-004**: Follow existing design system patterns for consistency
- **DC-005**: Maintain existing color schemes, typography, and spacing
- **DC-006**: Use existing icon sets and asset libraries
- **DC-007**: Preserve existing responsive breakpoints and mobile layouts

## Accessibility Requirements *(mandatory)*

**WCAG 2.1 Level AA Compliance**: All profile settings features MUST meet Web Content Accessibility Guidelines 2.1 Level AA standards.

### Form Accessibility

- All form inputs MUST have associated `<label>` elements with explicit `for` attributes OR `aria-label` attributes
- Input fields MUST have `aria-required="true"` for required fields
- Validation error messages MUST be announced to screen readers using `aria-live="polite"` regions
- Error messages MUST use `aria-describedby` to associate with their input fields
- Input placeholders MUST NOT be the only form of labeling

### Modal Accessibility

- All modal dialogs MUST have `role="dialog"` attribute
- Modals MUST have `aria-labelledby` pointing to the modal title
- Modals MUST have `aria-describedby` pointing to the modal description (if present)
- Focus MUST be trapped within modal when open (Tab cycles through modal elements only)
- Focus MUST return to triggering element when modal closes
- Modals MUST be dismissible via Escape key

### Keyboard Navigation

- All interactive elements MUST be keyboard accessible (Tab, Shift+Tab)
- Focus order MUST follow logical reading order (top to bottom, left to right)
- Focus indicators MUST be clearly visible (minimum 2px border, 3:1 contrast ratio)
- Submit actions MUST be triggerable via Enter key when appropriate
- Cancel actions MUST be triggerable via Escape key
- Custom components MUST implement ARIA keyboard patterns (e.g., aria-expanded for dropdowns)

### Visual Accessibility

- Text MUST meet minimum contrast ratio of 4.5:1 for normal text, 3:1 for large text (18pt or 14pt bold)
- Error messages MUST use color AND text/icons (not color alone) to convey meaning
- Link text MUST be distinguishable from body text (not by color alone)
- Interactive elements MUST have minimum touch target size of 44×44 CSS pixels

### Screen Reader Support

- Page title MUST update when navigating to Settings page
- Dynamic content changes MUST be announced (e.g., "Profile updated successfully")
- Loading states MUST be announced (e.g., "Saving profile information")
- Error states MUST be announced with clear context
- Success states MUST be announced with confirmation message

### Testing Requirements

- Manual keyboard navigation testing MUST pass (Tab through all forms/modals)
- Automated accessibility scan MUST pass using axe DevTools or similar
- Screen reader testing MUST pass on at least one platform (NVDA, JAWS, or VoiceOver)
- Color contrast audit MUST verify all text meets WCAG AA standards

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view their complete profile information (first name, last name, email) within 2 seconds of navigating to the Settings page
- **SC-002**: Users can successfully update their first name and last name with confirmation appearing within 3 seconds of clicking "Save"
- **SC-003**: Users can successfully update their email address with confirmation and link change appearing within 3 seconds of submission
- **SC-004**: Users can successfully change their password with confirmation appearing within 3 seconds of submission
- **SC-005**: System prevents invalid email formats from being submitted with immediate validation feedback (within 500ms of input)
- **SC-006**: System prevents weak or invalid passwords from being submitted with immediate validation feedback (within 500ms of input)
- **SC-007**: All error scenarios display clear, actionable error messages to users within 2 seconds of failure
- **SC-008**: 95% of users successfully complete profile updates on their first attempt without encountering errors
- **SC-009**: Users receive confirmation prompts before any destructive actions (retake assessment, delete account) with 100% consistency
- **SC-010**: System maintains consistent modal behavior and styling across all confirmation and success scenarios as defined by the BaseModalWithIcon component
- **SC-011**: All API requests include proper authentication headers with 100% consistency
- **SC-012**: Users can complete the entire profile update workflow (from settings page to confirmation and back) in under 1 minute


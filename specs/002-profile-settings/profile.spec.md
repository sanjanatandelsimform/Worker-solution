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
2. **Given** the Update Email modal is open, **When** the user enters a valid new email address and submits, **Then** the system updates the email and displays a success modal with confirmation message
3. **Given** the email update was successful, **When** the user returns to the settings page, **Then** the "Update Email" link is replaced with "Resend Verification Email" link
4. **Given** the Update Email modal is open, **When** the user enters an invalid email format, **Then** validation feedback is displayed preventing submission
5. **Given** the email update fails, **When** the error response is received, **Then** an error message component displays the failure details

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

A user wants to retake their workforce assessment to update their profile results or skills evaluation. Before proceeding, they should be warned that this action may affect their existing results.

**Why this priority**: Feature-specific functionality that enhances user experience but is not core to profile management. Users who need to retake assessments represent a subset of use cases.

**Independent Test**: Can be fully tested by clicking "Retake the Assessment" button, confirming the warning modal appears with appropriate buttons, clicking "Yes, Retake Assessment", and verifying redirection to the dashboard.

**Acceptance Scenarios**:

1. **Given** a user is on the settings page, **When** they click the "Retake the Assessment" button, **Then** a confirmation modal appears with warning styling and "Yes, Retake Assessment" and "Cancel" buttons
2. **Given** the retake confirmation modal is open, **When** the user clicks "Yes, Retake Assessment", **Then** they are redirected to the dashboard to begin the assessment
3. **Given** the retake confirmation modal is open, **When** the user clicks "Cancel", **Then** the modal closes and they remain on the settings page

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

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST retrieve and display user's current profile information (first name, last name, email, password status) when the Settings page loads
- **FR-002**: System MUST send authenticated API requests using the accessToken in headers for all profile operations
- **FR-003**: Email field MUST be displayed as disabled (read-only) on the initial settings page view
- **FR-004**: Password field MUST be displayed as a masked placeholder "••••••••" (read-only, disabled) with a "Change Password" link next to it - do NOT show an actual password input field
- **FR-004a**: Clicking the "Change Password" link next to the password field MUST open the ChangePasswordModal
- **FR-005**: Users MUST be able to edit their First Name and Last Name fields
- **FR-006**: System MUST validate that First Name and Last Name are not empty before allowing save
- **FR-007**: System MUST send profile updates (first name, last name) to the backend via PATCH request when user clicks "Save"
- **FR-008**: System MUST display a success modal (BaseModalWithIcon) with "Update Complete" title, success styling, checkmark icon, and "Back to Settings" button after successful profile update
- **FR-009**: System MUST redirect user back to settings page when they click "Back to Settings" in any success modal
- **FR-010**: System MUST display an error message (ErrorMessage component) with details when any API request fails
- **FR-010a**: System MUST automatically retry failed API requests once before displaying error, and provide a "Retry" button that preserves user's form data
- **FR-011**: Users MUST be able to open the Update Email modal by clicking "Update Email" link
- **FR-012**: Update Email modal MUST display the current email address in a disabled field
- **FR-013**: Update Email modal MUST provide an input field for the new email address with validation
- **FR-014**: System MUST validate email format before allowing submission of email update
- **FR-014a**: System MUST check for duplicate email addresses and display error message "This email is already in use" if the email is already registered to another account
- **FR-015**: System MUST send email update to backend via PATCH request when user submits new email
- **FR-016**: System MUST change "Update Email" link to "Resend Verification Email" link after successful email update
- **FR-017**: Users MUST be able to open the Change Password modal by clicking "Change Password" link
- **FR-018**: Change Password modal MUST provide fields for current password and new password with validation
- **FR-019**: System MUST validate password fields (format, strength requirements) before allowing submission
- **FR-020**: System MUST send password update to backend via PATCH request when user submits password change
- **FR-021**: Users MUST be able to trigger retake assessment by clicking "Retake the Assessment" button
- **FR-022**: System MUST display a confirmation modal (BaseModalWithIcon) with warning styling, explanatory message, and "Yes, Retake Assessment" and "Cancel" buttons before allowing retake
- **FR-023**: System MUST redirect user to dashboard when they confirm retake assessment
- **FR-024**: Users MUST be able to trigger account deletion by clicking "Delete my Account" button
- **FR-025**: System MUST display a confirmation modal (BaseModalWithIcon) with warning styling, explanatory message, and "Yes, Delete my account" and "Cancel" buttons before allowing deletion
- **FR-026**: System MUST send account deletion request to backend via DELETE request when user confirms deletion
- **FR-027**: System MUST clear all user data from Redux store after successful account deletion
- **FR-027a**: System MUST clear all authentication tokens after successful account deletion
- **FR-027b**: System MUST redirect user to `/account-deleted-success` page after successful account deletion
- **FR-027c**: Account deleted success page MUST display confirmation message "Your account has been successfully deleted"
- **FR-027d**: Account deleted success page MUST provide links to homepage or sign-up page and prevent navigation back to authenticated pages
- **FR-027e**: System MUST prevent deleted user credentials from being used to log back in
- **FR-028**: System MUST manage modal visibility state using Redux Toolkit for all modals (UpdateYourEmailModal, ChangePasswordModal, confirmation modals)
- **FR-029**: System MUST use existing ErrorMessage component consistently for all error scenarios
- **FR-030**: System MUST use existing BaseModalWithIcon component for all confirmation and success messages
- **FR-031**: System MUST follow the API calling patterns established in the existing auth module
- **FR-032**: System MUST detect session expiry and show warning message before redirecting to login
- **FR-033**: System MUST restore the user's modal context (which modal was open) after successful re-authentication, but must clear any sensitive data (passwords) from the form
- **FR-034**: System MUST detect when profile data is updated in another browser tab and display notification "Profile updated in another tab" with a refresh button
- **FR-035**: System MUST reload profile data when user clicks the refresh button in the concurrent update notification
- **FR-036**: System MUST track failed password change attempts and allow maximum of 5 attempts
- **FR-037**: System MUST display error message with remaining attempts count after each failed password change attempt
- **FR-038**: System MUST lock the account for 15 minutes after 5 failed password change attempts and require verification to unlock

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
  icon={<CheckCircle className="size-6" />}
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

### Password Validation (New Password)

- Minimum length: 8 characters
- Must contain at least one uppercase letter (A-Z)
- Must contain at least one lowercase letter (a-z)
- Must contain at least one number (0-9)
- Must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
- Cannot be the same as current password

### Password Change Security

- Maximum 5 failed attempts allowed for incorrect current password
- Display remaining attempts count after each failure
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
- Implement cross-tab communication (e.g., BroadcastChannel or localStorage events) to detect profile updates in other tabs and show notification with refresh button

### API Integration

- Reference existing auth module for API calling patterns and structure
- Use existing API service layer/utilities for HTTP requests
- Implement consistent error handling using try-catch blocks in async thunks
- Implement automatic retry logic: retry once on network failure before showing error to user
- Preserve user form data during network failures to enable easy retry via "Retry" button
- Pass `accessToken` via headers: `Authorization: Bearer ${accessToken}`
- Handle HTTP status codes appropriately:
  - 200/201: Success
  - 400: Validation errors
  - 401: Unauthorized (redirect to login)
  - 403: Forbidden
  - 404: Resource not found
  - 500: Server error
- Implement request timeout handling
- Parse error responses and display user-friendly messages

### Component Reuse

- **ErrorMessage**: Use for all error scenarios with consistent styling
- **BaseModalWithIcon**: Use for all confirmations and success messages
- **UpdateYourEmailModal**: Existing modal component (do not recreate)
- **ChangePasswordModal**: Existing modal component (do not recreate)
- **Settings Page**: Existing page component (do not recreate)

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
- Write comprehensive unit tests for all components
- Follow accessibility best practices (ARIA labels, keyboard navigation)
- Ensure responsive design works on all screen sizes

## Navigation & Redirects *(mandatory)*

### Success Redirects

- **After Profile Update Success**: Redirect to `/settings`
- **After Email Update Success**: Redirect to `/settings` (link changes to "Resend Verification Email")
- **After Password Change Success**: Redirect to `/settings`
- **After Retake Assessment Confirmation**: Redirect to `/dashboard`
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


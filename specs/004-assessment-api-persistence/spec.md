# Feature Specification: Assessment Data Persistence via API

**Feature Branch**: `004-assessment-api-persistence`  
**Created**: 2026-02-13  
**Status**: Draft  
**Input**: User description: "Remove storage-based persistence and restore previously filled assessment data only from /assessment API response. Fix bugs: STRUCTURED_ARRAY first write initialization, SINGLE_SELECT_DROPDOWN first selection binding, and validation red border handling for required fields. Application has 4 assessment tabs (WorkforceTab, CompensationTab, BenefitsTab, GoalsTab) that submit data via API and navigate between tabs with Back button support. Do not change any existing UI or functionality."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate Assessment Tabs With Data Persistence (Priority: P1)

A user completes the assessment across multiple tabs and can navigate back to review previously entered data without losing progress. Data is restored from the server rather than local storage.

**Why this priority**: Core functionality required for assessment completion. Users need confidence that their data persists as they move between tabs, and this persistence must come from the authoritative source (API) rather than client-side storage.

**Independent Test**: Can be fully tested by completing WorkforceTab, navigating to CompensationTab, then clicking Back button. Previously entered workforce data should be visible and populated from API response. Delivers immediate value by ensuring users don't lose work.

**Acceptance Scenarios**:

1. **Given** user is on WorkforceTab, **When** user fills out workforce questions and clicks Next, **Then** data is submitted via POST /assessment/workforce and user navigates to CompensationTab
2. **Given** user is on CompensationTab, **When** user clicks Back button, **Then** system calls GET /assessment and user returns to WorkforceTab with previously filled data restored from API response
3. **Given** user is on CompensationTab, **When** user fills out compensation questions and clicks Next, **Then** data is submitted via POST /assessment/compensation and user navigates to BenefitsTab
4. **Given** user is on BenefitsTab, **When** user clicks Back button, **Then** system calls GET /assessment and user returns to CompensationTab with previously filled data restored from API response
5. **Given** user is on BenefitsTab, **When** user fills out benefits questions and clicks Next, **Then** data is submitted via POST /assessment/benefits and user navigates to GoalsTab
6. **Given** user is on GoalsTab, **When** user clicks Back button, **Then** system calls GET /assessment and user returns to BenefitsTab with previously filled data restored from API response
7. **Given** user refreshes browser during assessment, **When** user returns to assessment page, **Then** system calls GET /assessment and previously completed sections show data from response
8. **Given** localStorage contains old assessment data, **When** user navigates between tabs, **Then** displayed data comes only from GET /assessment API response, not localStorage

---

### User Story 2 - Validation Feedback on Required Fields (Priority: P2)

A user sees clear visual indicators when required fields are missing or invalid before attempting to proceed to the next tab, ensuring they can correct errors immediately.

**Why this priority**: Critical for user experience and data quality. Users need inline validation feedback to complete the assessment successfully without frustration from hidden errors.

**Independent Test**: Can be fully tested by leaving required fields empty on any tab and clicking Next. Red borders appear on invalid fields, inline error messages display via ErrorMessage component, and user remains on current tab to fix errors.

**Acceptance Scenarios**:

1. **Given** user is on WorkforceTab with empty required fields, **When** user clicks Next, **Then** red borders appear on all required empty fields and inline error messages display
2. **Given** validation errors exist, **When** user fills in a previously invalid field, **Then** red border and error message disappear for that field
3. **Given** user clicks Next with validation errors, **When** validation fails, **Then** no modal appears and user sees only inline ErrorMessage components
4. **Given** required field types include STRUCTURED_ARRAY, TEXT_INPUT, SINGLE_SELECT_DROPDOWN, NUMERIC, NUMBER_INPUT, and PARTICIPATION_RATES, **When** any are invalid, **Then** each shows red border appropriately
5. **Given** validation errors are displayed, **When** user corrects all errors and clicks Next, **Then** data submits successfully and user navigates to next tab

---

### User Story 3 - Form Input Reliability on First Interaction (Priority: P2)

Users can successfully enter data into form inputs on their first attempt, with array fields initializing properly and dropdown selections displaying immediately.

**Why this priority**: Eliminates frustrating bugs that force users to interact twice with form controls. Essential for smooth assessment completion and positive user experience.

**Independent Test**: Can be fully tested by interacting with STRUCTURED_ARRAY and SINGLE_SELECT_DROPDOWN fields for the first time. First array entry should persist, first dropdown selection should display correctly. Delivers immediate value by removing friction from data entry.

**Acceptance Scenarios**:

1. **Given** user encounters empty STRUCTURED_ARRAY field, **When** user adds first array item, **Then** item is saved to state and remains visible
2. **Given** user encounters SINGLE_SELECT_DROPDOWN field, **When** user selects first option, **Then** selected value displays immediately in dropdown
3. **Given** STRUCTURED_ARRAY field has been initialized, **When** user adds multiple items, **Then** all items persist and display in order
4. **Given** user selects dropdown option then navigates away and back via Back button, **When** data is restored from API, **Then** dropdown shows previously selected value
5. **Given** user interacts with any form field type, **When** first interaction occurs, **Then** state updates correctly without requiring second interaction

---

### User Story 4 - Assessment Completion Flow (Priority: P3)

A user completes all four assessment tabs and receives appropriate feedback upon final submission, either confirming success or alerting them to empty submission.

**Why this priority**: Provides closure to the assessment flow and guides users toward next steps. Lower priority because it depends on all previous tabs functioning correctly.

**Independent Test**: Can be fully tested by completing GoalsTab (last tab) and clicking final submit. Success modal appears with "Go to Dashboard" button if data was submitted, or empty submission warning appears if no data entered. Delivers value by completing the user journey.

**Acceptance Scenarios**:

1. **Given** user completes GoalsTab with valid data, **When** API returns success, **Then** BaseModalWithIcon appears with title "You're done!", subtitle about dashboard recommendations, and "Go to Dashboard" button
2. **Given** user completes GoalsTab but submitted empty data across all tabs, **When** API processes empty submission, **Then** BaseModalWithIcon appears with title "Uh-oh", subtitle warning about accuracy, and Cancel/Continue buttons
3. **Given** success modal is displayed, **When** user clicks "Go to Dashboard" button, **Then** user navigates to dashboard page
4. **Given** empty submission warning is displayed, **When** user clicks Cancel, **Then** modal closes and user remains on GoalsTab
5. **Given** empty submission warning is displayed, **When** user clicks Continue, **Then** user proceeds despite empty submission

---

### Edge Cases

- What happens when user navigates back to a tab after GET /assessment returns updated data from another session (e.g., dual device editing)?
- How does system handle API timeout or network errors when calling GET /assessment to restore previous tab data?
- What happens when GET /assessment response structure doesn't match expected format for a specific section?
- How does system handle race conditions when user clicks Next rapidly before previous POST /assessment/{section} call completes?
- What happens when user manually edits localStorage/sessionStorage while assessment is open (should be ignored)?
- How does system handle partial GET /assessment response where only some sections have data?
- What happens when POST /assessment/{section} fails midway through the assessment (e.g., user completes workforce and compensation, but benefits POST fails)?
- How does system handle Back button clicks while POST /assessment/{section} is in progress?

## Requirements *(mandatory)*

### Functional Requirements

#### Data Persistence & API Integration

- **FR-001**: System MUST restore previously filled tab data exclusively from GET /assessment API response
- **FR-002**: System MUST NOT use localStorage, sessionStorage, or in-memory client-side cache for restoring assessment data across tab navigation
- **FR-003**: System MUST submit WorkforceTab data via POST /assessment/workforce when user clicks Next
- **FR-004**: System MUST submit CompensationTab data via POST /assessment/compensation when user clicks Next
- **FR-005**: System MUST submit BenefitsTab data via POST /assessment/benefits when user clicks Next
- **FR-006**: System MUST submit GoalsTab data via POST /assessment/goals when user clicks Next
- **FR-007**: System MUST navigate to next tab only after successful POST API response
- **FR-008**: System MUST call GET /assessment to retrieve previously filled data when user clicks Back button
- **FR-009**: System MUST populate form fields from GET /assessment response when navigating back to any tab
- **FR-010**: System MUST NOT re-submit data to POST endpoints when user navigates back to previous tabs
- **FR-036**: System MUST automatically call GET /assessment when assessment page loads (initial visit or browser refresh)
- **FR-037**: System MUST populate form fields with previously saved data from GET /assessment response on page load

#### Validation & Error Handling

- **FR-011**: System MUST display validation errors using existing ErrorMessage component
- **FR-012**: System MUST show red border on required fields that fail validation when user clicks Next
- **FR-013**: System MUST apply red border validation to: STRUCTURED_ARRAY, TEXT_INPUT, SINGLE_SELECT_DROPDOWN, NUMERIC, NUMBER_INPUT, PARTICIPATION_RATES field types when they are required fields
- **FR-014**: System MUST NOT display "Error Saving Assessment" modal for validation failures
- **FR-015**: System MUST clear validation errors for a field when user corrects the invalid input
- **FR-016**: System MUST prevent navigation to next tab while validation errors exist
- **FR-030**: System MUST display error message inline when POST /assessment/{section} fails
- **FR-031**: System MUST keep user on current tab when POST /assessment/{section} fails, allowing them to edit and retry submission
- **FR-032**: System MUST preserve user's entered data in form fields when POST /assessment/{section} fails
- **FR-033**: System MUST display error message when GET /assessment fails during back navigation
- **FR-034**: System MUST keep user on current tab when GET /assessment fails, preventing navigation until GET succeeds
- **FR-035**: System MUST provide "Retry" button to attempt GET /assessment again when it fails
- **FR-038**: System MUST trigger validation ONLY when user clicks Next button (NOT on field blur)
- **FR-039**: System MUST display error messages in red text when validation fails
- **FR-040**: System MUST show red borders on invalid fields for the 6 specified field types when validation fails

#### User Feedback & Loading States

- **FR-027**: System MUST display loading indicator (spinner) while POST /assessment/{section} or GET /assessment API calls are in progress
- **FR-028**: System MUST disable Next and Back buttons while API calls are in progress to prevent duplicate submissions
- **FR-029**: System MUST re-enable Next and Back buttons after API calls complete (success or failure)

#### Bug Fixes

- **FR-017**: System MUST properly initialize STRUCTURED_ARRAY fields on first data entry
- **FR-018**: System MUST bind SINGLE_SELECT_DROPDOWN selected value correctly on first selection
- **FR-019**: System MUST display selected dropdown value immediately after first user selection

#### UI & Behavior Preservation

- **FR-020**: System MUST preserve existing UI components, layouts, and visual designs without modification
- **FR-021**: System MUST preserve existing working navigation logic and tab transition behavior
- **FR-022**: System MUST maintain assessment state consistency across all four tabs during navigation

- **FR-041**: System MUST treat GET /assessment response as authoritative on tab mount/activation — always display server-side data if present; do not merge or prefer local unsaved edits.

#### Completion Flow

- **FR-023**: System MUST display BaseModalWithIcon with success message after POST /assessment/goals returns success (title: "You're done!", subtitle: "See your results and recommendations on your dashboard", button: "Go to Dashboard")
- **FR-024**: System MUST display BaseModalWithIcon with error message when POST /assessment/goals returns error (title: "Uh-oh", subtitle: "You have not filled anything out. Your recommendations will not be as accurate. Are you sure you want to proceed?", buttons: Cancel, Continue)
- **FR-025**: System MUST handle API errors gracefully using existing error handling patterns
- **FR-026**: System MUST maintain form data structure compatibility with existing API contract

### Key Entities *(include if feature involves data)*

- **Assessment Data**: Server-side representation of user's complete assessment across all four tabs. Retrieved via GET /assessment, contains previously submitted data for workforce, compensation, benefits, and goals sections.
- **Workforce Section**: Data submitted via POST /assessment/workforce, contains all workforce-related question responses.
- **Compensation Section**: Data submitted via POST /assessment/compensation, contains all compensation-related question responses.
- **Benefits Section**: Data submitted via POST /assessment/benefits, contains all benefits-related question responses.
- **Goals Section**: Data submitted via POST /assessment/goals, contains all goals-related question responses and triggers completion flow.
- **Form State**: Client-side representation of current tab's form data, validation status, and error messages. Populated from GET /assessment response when navigating back to a tab.
- **Validation Error**: Represents a failed validation rule for a specific field, displayed via ErrorMessage component with red border on affected input.
- **Tab Navigation State**: Tracks which tabs user has visited, current active tab, and whether forward navigation is allowed based on validation status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can navigate back to any completed assessment tab and see previously filled data without data loss
- **SC-002**: Assessment data persists correctly across tab navigation for 100% of valid API responses
- **SC-003**: STRUCTURED_ARRAY fields accept and persist first data entry successfully on first interaction
- **SC-004**: SINGLE_SELECT_DROPDOWN fields display selected value immediately after first selection in 100% of cases
- **SC-005**: Required field validation displays red borders and inline error messages for all 6 field types (STRUCTURED_ARRAY, TEXT_INPUT, SINGLE_SELECT_DROPDOWN, NUMERIC, NUMBER_INPUT, PARTICIPATION_RATES) when validation fails
- **SC-006**: Users see validation feedback within 100ms of clicking Next button
- **SC-007**: No localStorage or sessionStorage access occurs for assessment data restoration (verifiable via browser DevTools)
- **SC-008**: Assessment completion flow shows appropriate success or empty submission modal based on submission result
- **SC-009**: Zero UI or functional regressions occur in existing working features
- **SC-010**: All four assessment tabs maintain existing functionality while gaining API-based persistence

## Clarifications

### Session 2026-02-13

- Q: When API calls (POST /assessment/{section} or GET /assessment) are in progress, how should the UI provide feedback to users? → A: Show loading indicator (spinner) and disable Next/Back buttons until API completes
- Q: When POST /assessment/{section} fails (network error, server error, validation error from server), what should happen? → A: Display error message inline, user stays on current tab, can edit and retry submission
- Q: When GET /assessment fails (network error, server error, timeout) during back navigation, what should happen? → A: Display error message, user stays on current tab, provide "Retry" button to call GET /assessment again
- Q: When user lands on assessment page initially (first visit or after browser refresh), should the system automatically call GET /assessment to check for previously saved data? → A: Yes, automatically call GET /assessment on page load and populate any previously saved tab data
- Q: When should client-side validation be triggered to show red borders and error messages on required fields? → A: Trigger validation ONLY on Next button click (NOT on blur). Show error messages in red text. For STRUCTURED_ARRAY, TEXT_INPUT, SINGLE_SELECT_DROPDOWN, NUMERIC, NUMBER_INPUT, PARTICIPATION_RATES field types, show red border when these required fields fail validation.

### Session 2026-02-14

- Q: When GET /assessment or POST /assessment/{section} API calls fail, which error types should allow user retry vs. which should be treated as fatal errors? → A: All errors allow retry with "Retry" button. Display all errors using ErrorMessage component to show user what went wrong. User can retry any failed API call.
- Q: When user navigates back to a tab and GET /assessment returns data that differs from what they previously entered (e.g., they edited on another device, or another user session modified it), how should the system handle this conflict? → A: Always overwrite form with server data from GET /assessment response. Show notification: "Data has been updated from another session" using ErrorMessage component or similar notification mechanism.
- Q: When user clicks Next button rapidly multiple times before the POST /assessment/{section} call completes, how should the system prevent duplicate submissions? → A: Disable Next button immediately on first click, show spinner, re-enable after API response (success or failure).

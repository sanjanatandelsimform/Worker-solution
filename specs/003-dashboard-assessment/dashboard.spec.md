# Feature Specification: Dashboard Assessment Module

**Feature Branch**: `003-dashboard-assessment`  
**Created**: 06 February 2026  
**Status**: Draft  
**Input**: User description: "Dashboard Assessment Module - multi-tab assessment form with sequential API integration, completion tracking, and post-assessment results display"

## Clarifications

dy### Session 2026-02-06

- Q: Should assessment data auto-save as users type in each field? → A: Yes, implement auto-save on field change (follow Profile Settings module pattern)
- Q: What happens if a user closes the browser mid-assessment? → A: Data persists in storage using existing Auth/Profile Settings pattern. On return, user continues from last incomplete tab
- Q: Should users be able to skip tabs or jump ahead? → A: No, sequential access only. Users must complete tabs in order: Workforce → Compensation → Benefits → Goals
- Q: If an API call fails, should the user be blocked from progressing? → A: Show error modal with Cancel (stay on tab) or Continue (proceed anyway) options. User decides whether to proceed
- Q: What validation rules apply to percentage fields in WorkforceTab? → A: hourlyEmployeesPercentage + salaryEmployeesPercentage must sum to exactly 100%. Defined in question.json sumValidation rule
- Q: Should the completion counter display on the button even when count is 0? → A: When count is 0, show "Take the Assessment" without counter. When count > 0, show "[count] Take the Assessment" with "Continue" button text
- Q: Are Recommendations and Benchmark sections displayed with static data initially? → A: Yes, use existing designs with static data. API integration for dynamic data will come in future phase
- Q: Should feedback validation match registration form exactly? → A: Yes, copy exact validation rules from Auth module registration form (firstName, lastName, email, phone patterns)
- Q: What is the actual JSON structure for assessment questions? → A: Located at /src/question.json with sections array containing name, displayOrder, description, and questions array
- Q: What field types are supported? → A: SINGLE_SELECT, MULTIPLE_CHOICE, MULTI_SELECT, YES_NO, STRUCTURED_ARRAY, NUMERIC, NUMBER_INPUT, TEXT_INPUT, PARTICIPATION_RATES, RANKING
- Q: Should conditional field logic be implemented? → A: Yes, question.json defines conditionalOn, conditionalValue, and conditionalRequired properties. Fields show/hide and validate based on parent field values
- Q: What are the max items for array fields? → A: All STRUCTURED_ARRAY fields have maxItems: 5. workforceGoals has minItems: 3, maxItems: 14. workforceGoalsRanking requires exactly 3
- Q: Do healthPlanParticipationRates percentages need to sum to 100%? → A: No, these are independent range selections ("<25%", "26-50%", etc.) not exact percentages

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start Assessment from Dashboard (Priority: P1)

A business owner logs into the dashboard and sees a "Take the Assessment" button. They want to begin their workforce quality assessment to get personalized recommendations. When they click the button, they should be taken to the first assessment tab (WorkforceTab) with a clean form ready to fill out.

**Why this priority**: This is the entry point to the core value proposition of the platform - workforce quality assessment. Without this, users cannot access the primary feature that drives recommendations and insights.

**Independent Test**: A user can log in, see the "Take the Assessment" button on their dashboard, click it, and be navigated to the WorkforceTab with all form fields rendered correctly from the provided JSON structure. The tab should show all required fields in the correct format.

**Acceptance Scenarios**:

1. **Given** the user is on the dashboard with no assessment started (completionCount = 0), **When** they view the assessment section, **Then** they see a "Take the Assessment" button without any counter prefix
2. **Given** the user has not started the assessment, **When** they click "Take the Assessment", **Then** they are navigated to the assessment form with WorkforceTab displayed as the active tab
3. **Given** the WorkforceTab is displayed, **When** the page loads, **Then** all form fields from the JSON configuration are rendered correctly with appropriate input types (text, select, checkbox, number, multi-select, etc.)
4. **Given** the assessment form is loaded, **When** the user views the tab navigation, **Then** only WorkforceTab is accessible (active), while CompensationTab, BenefitsTab, and GoalsTab are visually disabled/locked
5. **Given** the user is on WorkforceTab, **When** they check for a back button, **Then** no back button is displayed (since this is the first tab)

---

### User Story 2 - Complete WorkforceTab with API Submission (Priority: P1)

A user is filling out the WorkforceTab assessment. They enter information about their company's headcount, employee types, locations, education levels, and turnover rates. As they fill out fields, the data auto-saves. When they complete all required fields and click "Next", the data should be validated, submitted to the workforce API endpoint, and upon success, they should see a success modal and be able to progress to CompensationTab.

**Why this priority**: Core assessment functionality that collects critical workforce data. This is the first of four data collection points required for generating recommendations. Without this, the assessment cannot proceed.

**Independent Test**: Can be fully tested by navigating to WorkforceTab, filling all required fields with valid data (including ensuring commonJobTitles percentages sum to 100), clicking Next, verifying API call to `/api/v1/assessment/workforce`, and confirming success modal displays with option to continue to CompensationTab.

**Acceptance Scenarios**:

1. **Given** the user is on WorkforceTab, **When** they fill in any form field and move to the next field, **Then** the data is automatically saved to storage (following Profile Settings auto-save pattern)
2. **Given** the user has partially filled out WorkforceTab, **When** they navigate away from the page and return later, **Then** all previously entered data is loaded from storage and displayed in the form fields
3. **Given** the user is filling out commonJobTitles field, **When** they enter job title percentages that do not sum to 100% (e.g., 30% + 40% + 20% = 90%), **Then** validation error "Percentages must sum to 100%" displays in red below the field
4. **Given** the user has filled all required fields correctly, **When** they click the "Next" button, **Then** the form data is validated client-side before API submission
5. **Given** validation passes on WorkforceTab, **When** the form submits, **Then** a POST request is made to `/api/v1/assessment/workforce` with body structure: `{ "responses": { ...all form fields... } }`
6. **Given** the API call to workforce endpoint succeeds (200/201 response), **When** the response is received, **Then** a success modal (BaseModalWithIcon) appears with title "You're done!" and subtitle "See your results and recommendations on your dashboard"
7. **Given** the success modal is displayed after WorkforceTab completion, **When** the user clicks the modal button, **Then** the modal closes, completionCount increments to 1, CompensationTab unlocks, and user navigates to CompensationTab
8. **Given** the API call to workforce endpoint fails (4xx/5xx response), **When** the error occurs, **Then** an error modal (BaseModalWithIcon) appears with title "Uh-oh" and options to Cancel (stay on tab) or Continue (proceed anyway)
9. **Given** the error modal is displayed, **When** the user clicks "Cancel", **Then** the modal closes and the user remains on WorkforceTab with their data preserved
10. **Given** the error modal is displayed, **When** the user clicks "Continue", **Then** the modal closes, the user proceeds to CompensationTab (even without API success), but tab is marked as incomplete

---

### User Story 3 - Sequential Tab Progression (Compensation, Benefits, Goals) (Priority: P1)

After completing WorkforceTab, the user continues through CompensationTab, BenefitsTab, and GoalsTab in sequence. Each tab has its own set of form fields, validation rules, and API endpoint. Users must complete each tab before progressing to the next. The completion counter updates after each successful tab submission.

**Why this priority**: Essential for structured data collection across all four assessment dimensions. Sequential progression ensures users provide comprehensive data while preventing confusion from jumping around tabs.

**Independent Test**: Can be tested by completing WorkforceTab, verifying CompensationTab unlocks, filling it out, submitting to `/api/v1/assessment/compensation`, seeing success modal, checking counter increments to 2, repeating for BenefitsTab (counter to 3) and GoalsTab (counter to 4), and verifying dashboard display changes after all tabs complete.

**Acceptance Scenarios**:

1. **Given** the user has successfully completed WorkforceTab (API success), **When** they navigate away and return to dashboard, **Then** the assessment button displays "1 Take the Assessment" with button text "Continue"
2. **Given** the user clicks "Continue" on dashboard with completionCount = 1, **When** they are navigated to the assessment form, **Then** CompensationTab is displayed as active and WorkforceTab shows a checkmark/completed indicator
3. **Given** the user is on CompensationTab, **When** they look at the tab navigation, **Then** WorkforceTab is accessible (completed), CompensationTab is active, and BenefitsTab/GoalsTab are locked/disabled
4. **Given** the user is on any tab except WorkforceTab, **When** they look for navigation controls, **Then** a back button is visible at the top of the form
5. **Given** the user clicks the back button from CompensationTab, **When** the navigation occurs, **Then** they are taken to WorkforceTab with previously saved data loaded and displayed
6. **Given** the user completes CompensationTab with all required fields, **When** they click "Next", **Then** data is validated and POST request is made to `/api/v1/assessment/compensation` with structure: `{ "responses": { ...compensation fields... } }`
7. **Given** CompensationTab API call succeeds, **When** the success modal button is clicked, **Then** completionCount increments to 2, BenefitsTab unlocks, and user navigates to BenefitsTab
8. **Given** the user completes BenefitsTab with all required fields, **When** they submit successfully, **Then** POST request goes to `/api/v1/assessment/benefits`, completionCount increments to 3, GoalsTab unlocks
9. **Given** the user is on GoalsTab (the final tab), **When** they view the submit button, **Then** it displays "Submit" instead of "Next"
10. **Given** the user completes GoalsTab successfully, **When** they submit, **Then** POST request goes to `/api/v1/assessment/goals`, completionCount increments to 4, success modal shows "Go to Dashboard" button
11. **Given** all 4 tabs are completed (completionCount = 4), **When** user clicks "Go to Dashboard" in final success modal, **Then** they are redirected to dashboard where Recommendations and Benchmark sections are now visible

---

### User Story 4 - Dashboard Display After Assessment Completion (Priority: P2)

After completing all four assessment tabs, the user returns to their dashboard. They should no longer see the "Take the Assessment" button or email verification prompts. Instead, they see their personalized Recommendations and Benchmark sections with static data, plus a "Share Feedback" button to provide input about their experience.

**Why this priority**: Demonstrates value delivery after assessment completion and provides users with immediate insights. While important for user satisfaction, it depends on completing the assessment flow (P1 stories).

**Independent Test**: Can be tested by completing all 4 assessment tabs (or mocking completionCount = 4 in storage), navigating to dashboard, verifying the assessment button is hidden, email verification section is hidden, and both Recommendations and Benchmark sections are visible with existing static data.

**Acceptance Scenarios**:

1. **Given** the user has completed all 4 assessment tabs (completionCount = 4), **When** they view the dashboard, **Then** the "Take the Assessment" button section is completely hidden/removed
2. **Given** the user has completed the assessment and email verification section was showing, **When** they view the dashboard after completion, **Then** the email verification section is also hidden
3. **Given** the assessment is complete, **When** the user views the dashboard, **Then** the Recommendations section is displayed with existing static data and design (no redesign)
4. **Given** the assessment is complete, **When** the user views the dashboard, **Then** the Benchmark section is displayed with existing static data and design (no redesign)
5. **Given** the Recommendations section is displayed, **When** the user interacts with it, **Then** they see the existing static recommendations content formatted according to current design
6. **Given** the Benchmark section is displayed, **When** the user interacts with it, **Then** they see the existing static benchmark data formatted according to current design
7. **Given** the user views the completed assessment dashboard, **When** they look for additional actions, **Then** a "Share Feedback" button is visible and accessible

---

### User Story 5 - Share Feedback After Assessment (Priority: P2)

After completing their assessment, a user wants to share feedback about their experience with the platform. They click the "Share Feedback" button, which opens the GetInTouchModal with a form containing First Name, Last Name, Email, and Phone fields. The form validates input using the same rules as the registration form. Upon successful submission, the feedback is sent to the backend API, and the user sees a success confirmation.

**Why this priority**: Valuable for product improvement and customer engagement, but not critical for core assessment functionality. Depends on assessment completion (P1 stories).

**Independent Test**: Can be tested by clicking "Share Feedback" button on completed dashboard, verifying GetInTouchModal opens with correct fields, entering valid data matching registration validation patterns, submitting to `/api/v1/feedback`, and confirming success modal displays with "Back to Dashboard" button.

**Acceptance Scenarios**:

1. **Given** the user is on the dashboard after completing all assessments, **When** they click the "Share Feedback" button, **Then** the GetInTouchModal component opens with fields for First Name, Last Name, Email, Phone
2. **Given** the GetInTouchModal is open, **When** the user views the form, **Then** all fields display with the same styling and layout as the registration form
3. **Given** the user is filling out the feedback form, **When** they enter an invalid first name (e.g., "J" - too short, or "John123" - contains numbers), **Then** validation error displays: "Please enter a valid first name" (using exact registration form validation)
4. **Given** the user is filling out the feedback form, **When** they enter an invalid email (e.g., "notanemail"), **Then** validation error displays: "Please enter a valid email address" (using exact registration form validation)
5. **Given** the user is filling out the feedback form, **When** they enter an invalid phone number, **Then** validation error displays: "Please enter a valid phone number" (using exact registration form validation)
6. **Given** the user fills all fields with valid data in GetInTouchModal, **When** they click "Share Feedback" button, **Then** validation passes and POST request is made to `/api/v1/feedback` with body: `{ firstName, lastName, email, phone, message? }`
7. **Given** the feedback API call succeeds, **When** the response is received, **Then** GetInTouchModal closes and success modal (BaseModalWithIcon) displays with title "Feedback sent" and subtitle "Thanks for sharing your feedback! We really appreciate you taking the time to help us improve."
8. **Given** the feedback success modal is displayed, **When** the user clicks "Back to Dashboard" button, **Then** the modal closes and the user remains on the dashboard view (no page reload)
9. **Given** the feedback API call fails, **When** the error response is received, **Then** an error message displays in the GetInTouchModal (inline or at top), and the modal remains open for user to retry
10. **Given** the GetInTouchModal is open with an error, **When** the user corrects the data and resubmits, **Then** the form attempts submission again with corrected data

---

## Functional Requirements

### FR-001: Assessment Initiation (User Story 1)
**Priority**: P1  
**Given**: User is logged in and viewing dashboard  
**Then**: System displays "Take the Assessment" button when completionCount = 0  
**Acceptance**: Button click navigates to WorkforceTab with all form fields rendered from JSON configuration

### FR-002: Completion Counter Display (User Story 1, 3)
**Priority**: P1  
**Given**: User has completed 1 or more assessment tabs  
**Then**: System displays "[count] Take the Assessment" on button, where count = number of completed tabs (1-4)  
**Acceptance**: Counter updates after each successful tab API response. Button text changes to "Continue" when count > 0

### FR-003: Sequential Tab Access Control (User Story 1, 3)
**Priority**: P1  
**Given**: User is on assessment form  
**Then**: System enforces sequential tab access - Tab N+1 unlocks only after Tab N successful API submission  
**Acceptance**: Users cannot click/access locked tabs. Visual indication (disabled/grayed out) for locked tabs

### FR-004: WorkforceTab Form Rendering (User Story 2)
**Priority**: P1  
**Given**: User navigates to WorkforceTab  
**Then**: System renders all form fields from provided JSON with correct input types  
**Acceptance**: Supports text, select, radio, checkbox, number, multi-select, nested arrays/objects. All fields display with proper labels and placeholders

### FR-005: Auto-Save on Field Change (User Story 2, 3)
**Priority**: P1  
**Given**: User enters/modifies any field on any assessment tab  
**Then**: System saves data to storage immediately after blur event  
**Acceptance**: Follows Profile Settings module auto-save pattern. Data persists across page refreshes and browser sessions

### FR-006: Data Persistence and Restoration (User Story 2, 3)
**Priority**: P1  
**Given**: User navigates away mid-assessment and returns later  
**Then**: System loads all previously saved form data from storage  
**Acceptance**: Uses existing storage pattern from Auth/Profile Settings modules. No new storage configuration added

### FR-007: WorkforceTab Validation - Percentage Sum (User Story 2)
**Priority**: P1  
**Given**: User fills commonJobTitles field with percentages  
**Then**: System validates that all percentages sum to exactly 100%  
**Acceptance**: Shows inline error "Percentages must sum to 100%" if validation fails. Prevents form submission

### FR-008: WorkforceTab API Submission (User Story 2)
**Priority**: P1  
**Given**: User completes WorkforceTab and clicks "Next"  
**Then**: System sends POST request to `/api/v1/assessment/workforce` with body: `{ "responses": { ...fields } }`  
**Acceptance**: Request includes Authorization header with existing auth token. Timeout after 10 seconds

### FR-009: Success Modal After Tab Completion (User Story 2, 3)
**Priority**: P1  
**Given**: Assessment tab API call succeeds (200/201 response)  
**Then**: System displays BaseModalWithIcon with type 'success', title "You're done!", subtitle "See your results and recommendations on your dashboard"  
**Acceptance**: Modal button action increments counter, unlocks next tab, and navigates to next tab (or dashboard if last tab)

### FR-010: Error Modal on API Failure (User Story 2, 3)
**Priority**: P1  
**Given**: Assessment tab API call fails (4xx/5xx response)  
**Then**: System displays BaseModalWithIcon with type 'error', title "Uh-oh", subtitle explaining incomplete data, with Cancel and Continue buttons  
**Acceptance**: Cancel closes modal and stays on tab. Continue closes modal and proceeds to next tab anyway

### FR-011: CompensationTab API Submission (User Story 3)
**Priority**: P1  
**Given**: User completes CompensationTab and clicks "Next"  
**Then**: System sends POST request to `/api/v1/assessment/compensation` with body: `{ "responses": { ...fields } }`  
**Acceptance**: Same validation, success/error modal flow as WorkforceTab. Counter increments to 2 on success

### FR-012: BenefitsTab API Submission (User Story 3)
**Priority**: P1  
**Given**: User completes BenefitsTab and clicks "Next"  
**Then**: System sends POST request to `/api/v1/assessment/benefits` with body: `{ "responses": { ...fields } }`  
**Acceptance**: Same validation, success/error modal flow as previous tabs. Counter increments to 3 on success

### FR-013: GoalsTab API Submission (User Story 3)
**Priority**: P1  
**Given**: User completes GoalsTab (final tab) and clicks "Submit"  
**Then**: System sends POST request to `/api/v1/assessment/goals` with body: `{ "responses": { ...fields } }`  
**Acceptance**: Button text is "Submit" not "Next". Counter increments to 4 on success. Success modal button says "Go to Dashboard"

### FR-014: Back Button Navigation (User Story 3)
**Priority**: P1  
**Given**: User is on any tab except WorkforceTab (first tab)  
**Then**: System displays back button at top of form  
**Acceptance**: Click navigates to previous tab. Loads saved data from storage. Back button not shown on WorkforceTab

### FR-015: Tab Completion Indicators (User Story 3)
**Priority**: P1  
**Given**: User has completed one or more tabs  
**Then**: System shows visual indicators (checkmark/icon) on completed tab labels  
**Acceptance**: Completed tabs remain accessible. User can click to view/edit previously submitted data

### FR-016: Dashboard State After Assessment Completion (User Story 4)
**Priority**: P2  
**Given**: User completes all 4 tabs (completionCount = 4)  
**Then**: System hides "Take the Assessment" button and email verification sections on dashboard  
**Acceptance**: Changes apply immediately after final tab success modal closes and user navigates to dashboard

### FR-017: Display Recommendations Section (User Story 4)
**Priority**: P2  
**Given**: Assessment is complete (completionCount = 4)  
**Then**: System displays Recommendations section with existing static data and design  
**Acceptance**: Uses current component/design without modifications. Static data displayed correctly

### FR-018: Display Benchmark Section (User Story 4)
**Priority**: P2  
**Given**: Assessment is complete (completionCount = 4)  
**Then**: System displays Benchmark section with existing static data and design  
**Acceptance**: Uses current component/design without modifications. Static data displayed correctly

### FR-019: Share Feedback Button Visibility (User Story 4, 5)
**Priority**: P2  
**Given**: Assessment is complete (completionCount = 4)  
**Then**: System displays "Share Feedback" button on dashboard  
**Acceptance**: Button is visible and clickable. Opens GetInTouchModal on click

### FR-020: Feedback Form Validation (User Story 5)
**Priority**: P2  
**Given**: User opens GetInTouchModal and fills feedback form  
**Then**: System applies EXACT same validation rules as registration form (Auth module)  
**Acceptance**: firstName, lastName, email, phone validation patterns match registration. Inline errors display on invalid input

### FR-021: Feedback API Submission (User Story 5)
**Priority**: P2  
**Given**: User completes feedback form with valid data and clicks "Share Feedback"  
**Then**: System sends POST request to `/api/v1/feedback` with body: `{ firstName, lastName, email, phone, message? }`  
**Acceptance**: Request includes Authorization header. Timeout after 10 seconds

### FR-022: Feedback Success Modal (User Story 5)
**Priority**: P2  
**Given**: Feedback API call succeeds  
**Then**: System closes GetInTouchModal and displays success modal (BaseModalWithIcon) with title "Feedback sent" and subtitle "Thanks for sharing your feedback!"  
**Acceptance**: Modal button "Back to Dashboard" closes modal and returns to dashboard (no reload)

### FR-023: Feedback Error Handling (User Story 5)
**Priority**: P2  
**Given**: Feedback API call fails  
**Then**: System displays error message in GetInTouchModal (inline or top), keeps modal open  
**Acceptance**: User can correct data and retry submission without losing form state

---

## Success Criteria

### SC-001: Assessment Completion Rate Measurement (P1)
**Metric**: Percentage of users who complete all 4 assessment tabs  
**Target**: ≥70% of users who start assessment complete all tabs  
**Measurement**: Track completionCount transitions (0→1→2→3→4) over 30-day period  
**Why**: Core platform value depends on assessment completion. Low completion indicates UX/technical issues

### SC-002: Tab Submission Success Rate (P1)
**Metric**: Percentage of API calls (per tab) that succeed on first attempt  
**Target**: ≥95% success rate for each of 4 endpoints  
**Measurement**: Log API response status codes for all tab submissions over 30-day period  
**Why**: API reliability directly impacts user experience. Frequent failures cause frustration and abandonment

### SC-003: Form Validation Error Rate (P1)
**Metric**: Average number of validation errors per tab before successful submission  
**Target**: ≤2 validation errors per tab on average  
**Measurement**: Track validation failures in client-side logs before each successful submit  
**Why**: High error rates indicate unclear field requirements or poor UX. Should guide improvement priorities

### SC-004: Assessment Restart Rate (P1)
**Metric**: Percentage of users who abandon mid-assessment and never return  
**Target**: ≤15% abandonment rate after starting first tab  
**Measurement**: Track users with completionCount > 0 who don't progress for 7+ days  
**Why**: Indicates whether sequential flow and auto-save patterns effectively retain users

### SC-005: Average Time to Complete Assessment (P1)
**Metric**: Median time from starting WorkforceTab to completing GoalsTab  
**Target**: ≤20 minutes median completion time  
**Measurement**: Track timestamps for first field edit on WorkforceTab and final submit on GoalsTab  
**Why**: Lengthy assessments reduce completion rates. Helps validate that form complexity is manageable

### SC-006: Data Persistence Success Rate (P1)
**Metric**: Percentage of users whose saved data loads correctly after page refresh/return  
**Target**: 100% data persistence (critical requirement)  
**Measurement**: Track instances where savedData !== loadedData in client-side error logs  
**Why**: Data loss destroys user trust and forces re-entry, causing immediate abandonment

### SC-007: Feedback Submission Rate (P2)
**Metric**: Percentage of users who complete assessment and submit feedback  
**Target**: ≥25% of completed assessments include feedback  
**Measurement**: Track feedback API calls vs. completionCount=4 events over 30-day period  
**Why**: High feedback rate indicates user satisfaction and engagement. Provides valuable product insights

### SC-008: Recommendations Section Visibility (P2)
**Metric**: Percentage of users who view Recommendations after assessment completion  
**Target**: ≥90% of completed users view Recommendations  
**Measurement**: Track page views/scroll events for Recommendations section among completionCount=4 users  
**Why**: Validates that users recognize value delivery. Low visibility indicates design/placement issues

---

## Non-Functional Requirements

### NFR-001: Form Rendering Performance
**Requirement**: All form fields must render within 1 second of tab navigation  
**Validation**: Measure time from route change to all fields visible in DOM  
**Priority**: P1  
**Rationale**: Slow rendering creates perception of poor quality and technical issues

### NFR-002: Auto-Save Responsiveness
**Requirement**: Field data must save within 500ms of blur event, without blocking user interaction  
**Validation**: Monitor storage write operations in performance profiler  
**Priority**: P1  
**Rationale**: Visible lag during typing/navigation creates friction and doubt about data persistence

### NFR-003: API Request Timeout
**Requirement**: All assessment API calls must timeout after 10 seconds with error modal  
**Validation**: Simulate slow network (throttle to 3G) and verify timeout behavior  
**Priority**: P1  
**Rationale**: Prevents indefinite waiting states. Aligns with Auth module standard (10s timeout)

### NFR-004: Storage Size Limit
**Requirement**: Assessment form data must not exceed 50KB in storage per user  
**Validation**: Calculate serialized JSON size for max-complexity form data  
**Priority**: P1  
**Rationale**: Excessive storage usage risks localStorage quota issues and performance degradation

### NFR-005: Validation Feedback Speed
**Requirement**: Client-side validation errors must display within 200ms of blur/submit  
**Validation**: Measure time from event trigger to error message render  
**Priority**: P1  
**Rationale**: Delayed feedback disrupts user flow and creates uncertainty about form state

### NFR-006: Accessibility - Keyboard Navigation
**Requirement**: All form fields, buttons, tabs must be fully navigable via keyboard (Tab, Enter, Arrow keys)  
**Validation**: Complete entire assessment using only keyboard, verify all actions accessible  
**Priority**: P1  
**Rationale**: WCAG 2.1 Level AA compliance required (aligns with Auth module standard)

### NFR-007: Accessibility - Screen Reader Support
**Requirement**: All form fields must have proper ARIA labels, error messages announced, tab states described  
**Validation**: Test with NVDA/JAWS screen readers on Windows, VoiceOver on Mac  
**Priority**: P1  
**Rationale**: WCAG 2.1 Level AA compliance required (aligns with Auth module standard)

### NFR-008: Responsive Design - Mobile Support
**Requirement**: Assessment form must be fully functional on screens 320px-2560px wide  
**Validation**: Test on iPhone SE (320px), iPad (768px), Desktop (1920px+)  
**Priority**: P1  
**Rationale**: Mobile users are significant portion of workforce management decision-makers

### NFR-009: Browser Compatibility
**Requirement**: Assessment form must function identically on Chrome, Firefox, Safari, Edge (latest 2 versions)  
**Validation**: Manual testing on all browsers with automated Playwright tests  
**Priority**: P1  
**Rationale**: Multi-browser support is business requirement (matches Auth module standard)

### NFR-010: Data Security - No Plain Text Storage of Sensitive Data
**Requirement**: Assessment responses must not include PII in plain text in storage  
**Validation**: Inspect localStorage/sessionStorage contents for sensitive data  
**Priority**: P1  
**Rationale**: While assessment data is less sensitive than auth credentials, best practice is to minimize exposure

---

## Technical Requirements

### TR-001: Use Existing Storage Pattern
**Requirement**: Assessment data storage must follow exact pattern established in Auth and Profile Settings modules  
**Implementation**: Import and use existing storage utility functions. DO NOT create new storage configuration  
**Priority**: P1  
**Rationale**: Consistency across modules reduces complexity and maintenance burden

### TR-002: Form Field Dynamic Rendering from JSON
**Requirement**: All form fields for 4 tabs must render dynamically based on provided JSON configuration file  
**Implementation**: Parse JSON, map field types to React components, handle nested structures (arrays, objects)  
**Priority**: P1  
**Rationale**: Allows non-developer stakeholders to modify questions without code changes

### TR-003: API Request Format Standardization
**Requirement**: All 4 assessment API calls must wrap form data in `{ "responses": {...} }` structure  
**Implementation**: Transform form state object into API-compliant format before submission  
**Priority**: P1  
**Rationale**: Backend expects consistent request body format across all assessment endpoints

### TR-004: Validation Schema Reuse from Auth Module
**Requirement**: Feedback form validation must import and use exact Zod schemas from Auth module registration  
**Implementation**: Import validation schemas from `src/services/validation/authSchemas.ts`  
**Priority**: P1  
**Rationale**: Ensures validation consistency and prevents duplication/divergence

### TR-005: Modal Component Reuse
**Requirement**: All success/error modals must use existing BaseModalWithIcon component without modification  
**Implementation**: Pass correct props (type, title, subtitle, buttons) to BaseModalWithIcon  
**Priority**: P1  
**Rationale**: Maintains design consistency and avoids proliferation of modal components

### TR-006: GetInTouchModal Component Reuse
**Requirement**: Feedback feature must use existing GetInTouchModal component without modification  
**Implementation**: Trigger modal open on "Share Feedback" button click, handle submission  
**Priority**: P1  
**Rationale**: Existing component already has correct fields and styling

### TR-007: Sequential Tab State Management
**Requirement**: Tab access control must be managed via `completedTabs` array and `apiSuccess` flags in storage  
**Implementation**: Check `apiSuccess.{tabName}` before allowing tab navigation. Update on successful API response  
**Priority**: P1  
**Rationale**: Enforces business rule that users must complete tabs in order

### TR-008: Completion Counter Calculation
**Requirement**: Counter value must be calculated from `completedTabs.length` in storage, not hardcoded  
**Implementation**: Read `completedTabs` array on dashboard mount, display count dynamically  
**Priority**: P1  
**Rationale**: Single source of truth prevents counter/state desync

### TR-009: No Redesign of Recommendations/Benchmark
**Requirement**: Existing Recommendations and Benchmark components must display without any design changes  
**Implementation**: Conditionally render existing components when `completionCount === 4`  
**Priority**: P1  
**Rationale**: Saves development time and maintains design consistency across platform

### TR-010: API Error Handling Pattern from Auth Module
**Requirement**: All API calls must follow error handling pattern established in Auth module  
**Implementation**: Use same Axios interceptor, error modal patterns, retry logic  
**Priority**: P1  
**Rationale**: Consistent error UX across platform. Reduces cognitive load for users

---

## Out of Scope (Explicitly Excluded)

### OS-001: Recommendations API Integration
**What**: Fetching dynamic recommendations data from backend API  
**Why Excluded**: Static data sufficient for MVP. API integration planned for future release  
**Impact**: Users see placeholder/example recommendations, not personalized data

### OS-002: Benchmark API Integration
**What**: Fetching dynamic benchmark data from backend API  
**Why Excluded**: Static data sufficient for MVP. API integration planned for future release  
**Impact**: Users see generic benchmark data, not industry-specific comparisons

### OS-003: Assessment Progress Bar
**What**: Visual progress indicator showing completion percentage across all tabs  
**Why Excluded**: Counter display on button provides sufficient progress feedback for MVP  
**Impact**: Users may not have clear visual sense of overall progress beyond counter

### OS-004: Assessment Draft Saving with Named Versions
**What**: Ability to save multiple named versions of in-progress assessments  
**Why Excluded**: Auto-save provides sufficient persistence. Multi-version support adds complexity  
**Impact**: Users cannot compare different assessment scenarios or revert to earlier states

### OS-005: Export Assessment Data
**What**: Download assessment responses as PDF/CSV for offline review  
**Why Excluded**: Not required for core assessment flow. Can be added based on user demand  
**Impact**: Users cannot share or review responses outside platform

### OS-006: Assessment Editing After Completion
**What**: Modify and resubmit individual tabs after all 4 tabs completed  
**Why Excluded**: MVP focuses on linear completion flow. Editing UX requires additional design  
**Impact**: Users must retake entire assessment if they want to change responses

### OS-007: Multi-Language Support
**What**: Translate assessment form fields and validation messages to languages beyond English  
**Why Excluded**: MVP targets English-speaking US market. i18n planned for future expansion  
**Impact**: Non-English speakers cannot use assessment feature

### OS-008: Conditional Field Logic
**What**: Show/hide fields based on previous answers (e.g., hide retirement questions if "No" to offers retirement)  
**Why Excluded**: JSON structure doesn't define conditional logic. Requires significant complexity  
**Impact**: All users see all fields regardless of relevance. May increase form fatigue

### OS-009: Field-Level Help Text/Tooltips
**What**: Contextual explanations for complex fields (e.g., what is "ICHRA"?)  
**Why Excluded**: MVP assumes users understand HR/benefits terminology. Can add based on support requests  
**Impact**: Users unfamiliar with terms may provide inaccurate responses or abandon form

### OS-010: Real-Time Collaboration
**What**: Multiple users from same business editing assessment simultaneously  
**Why Excluded**: MVP assumes single user completing assessment. Collaboration requires complex sync logic  
**Impact**: Team-based assessment completion requires manual coordination (e.g., email sharing)

---

## Dependencies

### Internal Dependencies
- **Auth Module** (Status: Complete): Provides authentication tokens for API calls, storage patterns, validation schemas
- **Profile Settings Module** (Status: Complete): Provides auto-save pattern, form field update patterns, error handling
- **BaseModalWithIcon Component** (Status: Exists): Required for success/error modals after each tab submission
- **GetInTouchModal Component** (Status: Exists): Required for feedback feature
- **Existing Dashboard Page** (Status: Exists): Container for assessment CTA button, recommendations, benchmark sections

### External Dependencies
- **Backend Assessment APIs**: Four endpoints must be available and functional:
  - `POST /api/v1/assessment/workforce`
  - `POST /api/v1/assessment/compensation`
  - `POST /api/v1/assessment/benefits`
  - `POST /api/v1/assessment/goals`
- **Backend Feedback API**: Endpoint must be available:
  - `POST /api/v1/feedback`
- **Assessment JSON Configuration**: JSON file with all form fields, types, validation rules for 4 tabs

### Third-Party Dependencies
- React Hook Form (form state management)
- Zod (validation schema library)
- Axios (HTTP client for API calls)
- React Router (navigation between tabs)

---

## Risk Assessment

### Risk 1: High Assessment Abandonment Rate
**Likelihood**: Medium | **Impact**: High | **Severity**: 🔴 Critical  
**Description**: Users start assessment but abandon before completing all 4 tabs due to length, complexity, or unclear value proposition  
**Mitigation**:
- Display clear progress indicator (counter on button)
- Auto-save ensures no data loss if users leave mid-assessment
- Success modals after each tab provide positive reinforcement
- Sequential access prevents overwhelming users with all questions at once
**Contingency**: If abandonment >30%, conduct user testing to identify friction points. Consider breaking into shorter assessments

---

### Risk 2: API Endpoint Reliability Issues
**Likelihood**: Medium | **Impact**: High | **Severity**: 🔴 Critical  
**Description**: One or more assessment API endpoints fail frequently (>5% error rate), blocking user progression  
**Mitigation**:
- Implement 10-second timeout to prevent indefinite waiting
- Error modal allows users to "Continue" even on API failure
- Auto-saved data prevents loss if users retry later
- Client-side validation reduces invalid API calls
**Contingency**: If API error rate >10%, add local-only mode where responses save without submission. Sync when endpoints recover

---

### Risk 3: Form Field JSON Schema Changes Break UI
**Likelihood**: Medium | **Impact**: Medium | **Severity**: 🟡 Moderate  
**Description**: Backend team modifies JSON schema (field names, types, structure) without coordinating with frontend, causing rendering errors  
**Mitigation**:
- Version the JSON schema file and validate on app load
- Add error boundary to catch rendering failures gracefully
- Document expected schema structure in codebase
- Establish change management process with backend team
**Contingency**: If schema breaks UI, fall back to hardcoded form fields while schema compatibility is restored

---

### Risk 4: Storage Quota Exceeded on Large Assessments
**Likelihood**: Low | **Impact**: Medium | **Severity**: 🟡 Moderate  
**Description**: Users with complex assessments (many job titles, locations) exceed localStorage quota (~5-10MB), causing storage failures  
**Mitigation**:
- Monitor serialized data size on each save
- Compress data before storing (if approaching limits)
- Limit array fields (e.g., max 10 job titles)
- Clear old/stale assessment data on new start
**Contingency**: If quota issues occur, migrate to IndexedDB (larger capacity) or implement server-side draft saving

---

### Risk 5: Validation Rules Too Strict, Causing User Frustration
**Likelihood**: Medium | **Impact**: Medium | **Severity**: 🟡 Moderate  
**Description**: Percentage sum validation (must equal 100%), email format validation, etc. too rigid, preventing legitimate submissions  
**Mitigation**:
- Copy exact validation patterns from Auth module (battle-tested)
- Display clear error messages explaining requirements
- Allow error modal "Continue" option to proceed despite validation warnings
- Collect analytics on validation failure rates to identify problem fields
**Contingency**: If validation failure rate >20% for specific field, relax constraints (e.g., allow 99-101% for percentage sums)

---

### Risk 6: Performance Degradation on Slower Devices
**Likelihood**: Low | **Impact**: Medium | **Severity**: 🟢 Low  
**Description**: Form rendering/validation slow on older mobile devices or low-end hardware  
**Mitigation**:
- Lazy load form fields (render on scroll/demand)
- Debounce auto-save to reduce write frequency
- Optimize React Hook Form configuration (mode: onBlur not onChange)
- Test on low-end devices (e.g., older Android phones)
**Contingency**: If performance issues reported, implement virtualization for long field lists or reduce auto-save frequency

---

## Glossary

**Assessment**: The 4-tab form users complete to provide workforce, compensation, benefits, and goals data for generating recommendations

**Tab**: One of four sequential sections of the assessment form (WorkforceTab, CompensationTab, BenefitsTab, GoalsTab)

**Completion Count**: Number of assessment tabs successfully submitted (0-4). Displayed on dashboard button as "[count] Take the Assessment"

**Sequential Access**: Navigation restriction that requires users to complete tabs in order. Tab N+1 unlocks only after Tab N API success

**Auto-Save**: Automatic storage of form field data to localStorage/sessionStorage on blur event, following Profile Settings module pattern

**API Success Flag**: Boolean stored per tab indicating successful API response (`apiSuccess.WorkforceTab: true`). Controls tab unlocking

**Completion Counter**: UI element displaying assessment progress (e.g., "2 Take the Assessment"). Updates after each successful tab submission

**BaseModalWithIcon**: Existing reusable modal component for success/error messages. Used for all tab submission confirmations

**GetInTouchModal**: Existing reusable modal component for user feedback form. Triggered by "Share Feedback" button

**Static Data**: Placeholder/example content displayed in Recommendations and Benchmark sections before API integration

**Storage Pattern**: Existing data persistence approach established in Auth and Profile Settings modules. NO new storage config added

**Validation Schema**: Zod schema defining field requirements (required, minLength, pattern, etc.). Reused from Auth module registration

**Inline Error**: Validation error message displayed directly below the relevant form field in red text

**Back Button**: Navigation control allowing users to return to previously completed tabs without losing data

**Sequential Progression**: Workflow where users must complete current tab before accessing next tab. No jumping ahead allowed

**P1/P2 Priority**: Priority classification for user stories and requirements. P1 = Critical/MVP, P2 = Important but not blocking


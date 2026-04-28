# Feature Specification: Additional Questions Test Coverage Update

**Feature Branch**: `023-addl-questions-tests`  
**Created**: 2026-04-27  
**Status**: Draft  
**Input**: User description: "Update all test cases for the Additional Questions module (AdditionalQuestions.tsx) to match the latest refactored code with section components and cover all new scenarios"

## Background

The `AdditionalQuestions` page has been significantly refactored across features 016–021. It was decomposed into four independent section components: `WorkforceSection`, `CompensationSection`, `BenefitsRetirementSection`, and `GoalsSection`. New fields were added (health premium, retirement match percentage) and new validation rules were introduced. The existing test files (`AdditionalQuestions.test.tsx` and `AdditionalQuestionsHealthPremium.test.tsx`) only cover redirect behaviour and the health premium field. The full validation logic, submission flow, field interactions, and conditional UI branches are untested.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Redirect and Guard Behaviour (Priority: P1)

A developer or QA engineer verifies that the page correctly redirects users who should not be on the Additional Questions screen — specifically when Finch is already completed or when the user is not connected to Finch.

**Why this priority**: Guard behaviour is the first thing executed on mount and must never regress; broken redirects could expose incomplete forms to ineligible users.

**Independent Test**: Run the existing redirect tests and extend them to confirm no redirect fires under edge loading states. Fully testable in isolation by mocking `useAssessmentStatus` and `useFinchStatus`.

**Acceptance Scenarios**:

1. **Given** `isFinchCompleted` is `true`, **When** the page mounts, **Then** `navigate("/dashboard")` is called exactly once.
2. **Given** `isFinchCompleted` is `false` and `isConnected` is `false` and `isLoading` is `false`, **When** the page mounts, **Then** `navigate("/dashboard")` is called.
3. **Given** `isConnected` is `false` but `isLoading` is `true`, **When** the page mounts, **Then** no navigation occurs (loading state suppresses redirect).
4. **Given** `isFinchCompleted` is `false` and `isConnected` is `true`, **When** the page mounts, **Then** no navigation occurs and the form is rendered.
5. **Given** submission succeeds (`success: true`), **When** the hook returns success, **Then** `navigate("/dashboard")` is called.
6. **Given** the user clicks the X (close) button, **When** clicked, **Then** `navigate("/dashboard")` is called.

---

### User Story 2 - Form Validation on Submit (Priority: P1)

A developer verifies that clicking "Next" without filling required fields shows inline validation errors for every required field.

**Why this priority**: Validation is the primary guard before any data reaches the API. Untested validation means regressions go undetected.

**Independent Test**: Render the page, click Next without filling anything, assert all expected error messages appear. Fully testable without network calls.

**Acceptance Scenarios**:

1. **Given** no fields are filled, **When** the user clicks "Next", **Then** error messages appear for: benefits updates, deskless employees, annual raises, payroll provider, benefits broker, benefits enrollment month, health premium, retirement vesting period, retirement employer match, retirement auto-enroll, retirement hardship withdrawals, and selected goals (minimum 3 required).
2. **Given** "annual-raises" is answered "yes-raises" but no raise month is selected, **When** the user clicks "Next", **Then** an error appears for the raise month field.
3. **Given** "annual-raises" is answered "no-raises", **When** the user clicks "Next", **Then** no raise month error appears.
4. **Given** "retirement-employer-match" is answered "yes-match" but no percentage is entered, **When** the user clicks "Next", **Then** an error appears for the percentage field.
5. **Given** "retirement-employer-match" is answered "yes-match" and a percentage greater than 100 is entered, **When** the user clicks "Next", **Then** an error appears saying "Percentage must be 100 or less."
6. **Given** "retirement-employer-match" is answered "no-match", **When** the user clicks "Next", **Then** no percentage error appears.
7. **Given** fewer than 3 goals are selected, **When** the user clicks "Next", **Then** an error appears for selected goals.
8. **Given** all required fields are filled and at least 3 goals are selected, **When** the user clicks "Next", **Then** no field errors appear and `submit()` is called.

---

### User Story 3 - Field Interaction and Inline Error Clearing (Priority: P2)

A developer verifies that filling a field after validation fires clears the associated inline error immediately, without requiring a re-submit.

**Why this priority**: Clearing errors on input is a UX requirement and ensures the error state machinery works correctly end-to-end.

**Independent Test**: Trigger validation, then simulate typing or selecting a value for one field and assert its error disappears. Testable per-field independently.

**Acceptance Scenarios**:

1. **Given** an inline error is shown for "health-plan-monthly-premium", **When** the user enters a value, **Then** the error clears immediately.
2. **Given** an inline error is shown for "annual-raises", **When** the user selects an answer, **Then** the error clears.
3. **Given** "retirement-employer-match" is changed from "yes-match" to "no-match", **When** the change occurs, **Then** the `retirementMatchPercentage` state is reset to an empty string.
4. **Given** an inline error is shown for "selectedGoals", **When** a goal is toggled, **Then** the error clears.

---

### User Story 4 - Submission Payload Construction (Priority: P2)

A developer verifies that when all required fields are completed and the user submits, `buildFinchAssessmentPayload` is called with the correct arguments and `submit()` is invoked with the resulting payload.

**Why this priority**: Payload correctness is critical; incorrect field mapping would silently send wrong data to the API.

**Independent Test**: Fill all required fields with known values, click Next, assert `buildFinchAssessmentPayload` is called with matching arguments and `submit` is called with the returned payload.

**Acceptance Scenarios**:

1. **Given** all required fields are filled with specific values, **When** the user clicks "Next", **Then** `buildFinchAssessmentPayload` is called with `answers`, `goalsAnswers`, `annualRaiseMonth`, `payrollProvider`, `benefitsEnrollmentMonth`, a boolean for retirement match, `retirementMatchPercentage`, and `healthPremiumMonthly`.
2. **Given** `buildFinchAssessmentPayload` returns a payload object, **When** the user clicks "Next", **Then** `submit()` is called with that exact payload.
3. **Given** "retirement-employer-match" is "no-match", **When** the payload is built, **Then** the retirement match boolean argument passed is `false`.
4. **Given** "retirement-employer-match" is "yes-match" with a percentage of "5", **When** the payload is built, **Then** the retirement match boolean argument passed is `true` and the percentage argument is `"5"`.
5. **Given** `healthPremiumMonthly` is "300", **When** the payload is built, **Then** the last argument to `buildFinchAssessmentPayload` is `"300"`.

---

### User Story 5 - Error and Success Message Display (Priority: P2)

A developer verifies that API errors and success states from `useSubmitFinchAssessment` are surfaced correctly in the UI.

**Why this priority**: Users must see meaningful feedback when submission fails or succeeds; this is currently untested.

**Independent Test**: Mock `useSubmitFinchAssessment` to return error or success states, render the page, assert the correct message appears.

**Acceptance Scenarios**:

1. **Given** `error` is a non-empty string (e.g., "Something went wrong"), **When** the page renders, **Then** an error message with that text is displayed.
2. **Given** `success` is `true`, **When** the page renders, **Then** a success message is displayed and `navigate("/dashboard")` is called.
3. **Given** `isSubmitting` is `true`, **When** the page renders, **Then** the Next button displays "Submitting..." and is disabled.
4. **Given** an error is displayed and the user dismisses it, **When** the close handler fires, **Then** `clearError()` is called.

---

### User Story 6 - Existing Health Premium Tests Alignment (Priority: P3)

A developer updates the existing `AdditionalQuestionsHealthPremium.test.tsx` tests to match current component structure (section-based rendering, updated prop interfaces, correct mock signatures).

**Why this priority**: Existing tests may be passing against stale mocks. Ensuring they exercise the current rendering path prevents false positives.

**Independent Test**: Run the existing health premium test file and confirm all tests pass after mock alignment. Fully independent of new test cases.

**Acceptance Scenarios**:

1. **Given** the current section-based component structure, **When** the health premium tests run, **Then** all tests pass without modification to production code.
2. **Given** the `Label` mock supports `isRequired`, **When** the required label test runs, **Then** it finds the required indicator.
3. **Given** the numeric input has placeholder "Enter amount", **When** the input test runs, **Then** it finds the input by that placeholder.

---

### Edge Cases

- What happens when `useFinchStatus` returns `isLoading: true` with `isConnected: false`? No redirect should fire.
- What happens when `retirementMatchPercentage` is exactly `"100"`? No error should appear.
- What happens when `retirementMatchPercentage` is `"101"`? An error message "Percentage must be 100 or less." should appear.
- What happens when exactly 3 goals are selected? No goals validation error should appear.
- What happens when `success` transitions from `false` to `true`? Navigation to `/dashboard` must fire via the `useEffect`.
- What happens when `healthPremiumMonthly` is `"0"`? It is truthy as a string, so no validation error should fire (empty string `""` triggers the error).
- What if the annual-raises conditional month field is shown but then hidden (user switches back to "no-raises")? The month state persists but the field is not validated.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: All test cases in `AdditionalQuestions.test.tsx` MUST align with the current component source code, including the section-component-based rendering structure.
- **FR-002**: All test cases in `AdditionalQuestionsHealthPremium.test.tsx` MUST pass without modification to production code.
- **FR-003**: Tests MUST cover all required-field validation paths in `handleSubmit`, including the 11 distinct required-field checks.
- **FR-004**: Tests MUST cover conditional validation: annual raise month (when "yes-raises"), retirement match percentage (when "yes-match"), and retirement match percentage over-100 error.
- **FR-005**: Tests MUST cover the `success` state navigation — when `useSubmitFinchAssessment` returns `success: true`, `navigate("/dashboard")` is called.
- **FR-006**: Tests MUST cover the "Submitting…" button state and disabled state when `isSubmitting` is `true`.
- **FR-007**: Tests MUST cover that `buildFinchAssessmentPayload` is called with the correct arguments when a full valid submission is made.
- **FR-008**: Tests MUST cover that `submit()` is called with the payload returned by `buildFinchAssessmentPayload`.
- **FR-009**: Tests MUST cover the close button (X) triggering `navigate("/dashboard")`.
- **FR-010**: Tests MUST cover inline error clearing when a field value changes after validation fires.
- **FR-011**: Tests MUST cover the goals minimum-selection validation (fewer than 3 → error; exactly 3 → no error).
- **FR-012**: Tests MUST cover the `retirementMatchPercentage` reset to `""` when "retirement-employer-match" is changed to "no-match".
- **FR-013**: Tests MUST use component mocking consistent with the current section structure (WorkforceSection, CompensationSection, BenefitsRetirementSection, GoalsSection mocked as needed for unit isolation).

### Key Entities

- **AdditionalQuestions (page component)**: Orchestrates all form state (`answers`, `goalsAnswers`, `annualRaiseMonth`, `payrollProvider`, `benefitsEnrollmentMonth`, `retirementMatchPercentage`, `healthPremiumMonthly`), validation (`fieldErrors`), and navigation guards.
- **Section components**: `WorkforceSection`, `CompensationSection`, `BenefitsRetirementSection`, `GoalsSection` — each receives slices of state and event handlers as props. May be mocked in page-level tests.
- **useSubmitFinchAssessment**: Provides `isSubmitting`, `error`, `success`, `submit`, `clearError`. All test mocks must expose all five fields.
- **useAssessmentStatus**: Provides `isFinchCompleted` and `sectionCompletion`. Test mocks must include full shape.
- **useFinchStatus**: Provides `isConnected` and `isLoading`. Test mocks must include full shape including `connectionStatus` and `syncJobStatus`.
- **buildFinchAssessmentPayload**: Pure function called with 8 arguments in order: `answers`, `goalsAnswers`, `annualRaiseMonth`, `payrollProvider`, `benefitsEnrollmentMonth`, `retirementPlanHasMatch` (boolean), `retirementMatchPercentage`, `healthPremiumMonthly`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All existing tests in both test files pass after the update — 0 failing tests.
- **SC-002**: Test coverage for `AdditionalQuestions.tsx` reaches 90% or above for statements and branches.
- **SC-003**: Every required field validation path (11 required checks + 2 conditional checks) has at least one covering test.
- **SC-004**: The submission payload test verifies `buildFinchAssessmentPayload` receives correct arguments for at least one complete valid form submission.
- **SC-005**: No production code is modified as part of this feature — all changes are confined to test files.
- **SC-006**: Tests run in under 10 seconds total (fast unit tests, no real network or timers).

## Assumptions

- Section components (`WorkforceSection`, `CompensationSection`, `BenefitsRetirementSection`, `GoalsSection`) will be mocked at the page-level test boundary to keep unit tests focused on the orchestration logic in `AdditionalQuestions.tsx`. Integration-style tests that render sections unmocked may be added as optional extras but are not required.
- The test runner is Vitest with React Testing Library, consistent with existing test files.
- The 11 required fields are: `benefits-updates`, `deskless-employees`, `annual-raises`, `payroll-provider` (via `payrollProvider` state), `benefits-broker`, `benefits-enrollment-period` (via `benefitsEnrollmentMonth` state), `health-plan-monthly-premium` (via `healthPremiumMonthly` state), `retirement-vesting-period`, `retirement-employer-match`, `retirement-auto-enroll`, `retirement-hardship-withdrawals`, plus `selectedGoals` (minimum 3).
- The existing `AdditionalQuestionsHealthPremium.test.tsx` file will be updated in-place (not deleted) to preserve traceability to spec 001-add-health-premium-question.
- `buildFinchAssessmentPayload` accepts `healthPremiumMonthly` as its 8th (last) argument as a string; numeric conversion occurs inside the utility function.

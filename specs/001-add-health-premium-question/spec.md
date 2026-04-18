# Feature Specification: Add Health Premium Question to Benefits Section

**Feature Branch**: `001-add-health-premium-question`  
**Created**: 2026-04-18  
**Status**: Draft  
**Input**: User description: "Add a 3rd new question in the benefits section — What is the employee-only monthly premium for the lowest-cost health plan your company offers? The input field accepts a numeric dollar amount (e.g. $300)."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Employer Enters Health Premium Amount (Priority: P1)

An employer completing the Additional Questions form navigates to the Benefits section and sees a new required question asking for the employee-only monthly premium for the lowest-cost health plan their company offers. They type a dollar amount into the numeric input field and continue filling out the rest of the form.

**Why this priority**: This is the entire scope of the feature — the question must be visible, enterable, and saved before anything else is possible.

**Independent Test**: Can be fully tested by loading the Additional Questions page, scrolling to the Benefits section, and verifying the question appears as question #3 with a numeric input that accepts a dollar amount — delivers the complete feature value.

**Acceptance Scenarios**:

1. **Given** the user is on the Additional Questions page, **When** they view the Benefits section, **Then** a third question labelled "What is the employee-only monthly premium for the lowest-cost health plan your company offers?" is displayed with a required indicator.
2. **Given** the question is displayed, **When** the user types a numeric value (e.g. 300), **Then** the input accepts the value and a placeholder of "Enter amount" is shown when empty.
3. **Given** the question is displayed, **When** the user sees helper text below the input, **Then** the text reads "i.e. $300".
4. **Given** the user attempts to submit the form without answering this required question, **When** validation runs, **Then** an inline error message is shown below the input field.

---

### User Story 2 - Form Data Is Captured for Submission (Priority: P2)

When the employer submits the Additional Questions form, the value entered for the health premium question is captured alongside the other answers and sent to the back end.

**Why this priority**: Without persisting the answer, the data collection has no effect. However, the UI can be delivered and validated independently first.

**Independent Test**: Can be verified by submitting the form with a valid premium value and confirming the payload includes the health premium field.

**Acceptance Scenarios**:

1. **Given** the user has entered a valid numeric premium amount, **When** the form is submitted, **Then** the premium value is included in the submitted data alongside other Benefits answers.
2. **Given** the user entered a value and then navigates away and back, **Then** the previously entered value is still present (consistent with how other fields in the section behave).

---

### Edge Cases

- What happens when the user enters 0? The system should accept 0 as a valid monetary value.
- What happens when the user enters a non-numeric value? The input must restrict entry to numeric characters only.
- What happens when the user enters a very large number (e.g. 99999)? The system should accept any reasonable positive integer without an upper cap unless business rules specify one.
- What happens when the field is left blank on submission? An inline validation error must appear indicating the field is required.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The Benefits section on the Additional Questions page MUST display a third question: "What is the employee-only monthly premium for the lowest-cost health plan your company offers?"
- **FR-002**: The question MUST be marked as required with a visible required indicator (e.g., asterisk).
- **FR-003**: The input control for the question MUST accept only numeric values (whole dollar amounts; no cents required).
- **FR-004**: The input MUST display placeholder text "Enter amount" when no value has been entered.
- **FR-005**: Helper text "i.e. $300" MUST be displayed below the input field to guide the user.
- **FR-006**: The system MUST show an inline validation error when the form is submitted and this field is empty.
- **FR-007**: The entered value MUST be included in the form submission payload for downstream processing.
- **FR-008**: The new question MUST appear after the existing two Benefits questions (positioned as question #3 in the Benefits section).

### Key Entities

- **Health Premium Answer**: A required numeric dollar amount representing the employee-only monthly premium for the employer's lowest-cost health plan. Captured as part of the Additional Questions form submission.

## Assumptions

- The question numbering in the Benefits section is sequential; the new question appears as the third item after the existing "Do you work with a benefits broker?" and "When is your benefits enrollment period?" questions.
- No conditional follow-up questions are triggered by the premium amount (no branching logic required).
- The dollar amount is a whole number (no cents). If the back-end API requires a specific field name, that is a planning/implementation concern outside this spec.
- Validation behaviour (error display timing, error message text) follows the same pattern already used by other required fields in the Benefits/Retirement section.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The new question is visible on the Benefits section for 100% of users who open the Additional Questions page.
- **SC-002**: Users can enter and submit a health premium amount in under 30 seconds from first seeing the question.
- **SC-003**: Attempting to submit without a value shows a validation error in 100% of cases, preventing silent data loss.
- **SC-004**: The submitted form payload correctly includes the health premium field value in 100% of successful submissions.

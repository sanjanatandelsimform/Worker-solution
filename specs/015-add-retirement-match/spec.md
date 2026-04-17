# Feature Specification: Add Retirement Employer Match Question

**Feature Branch**: `015-add-retirement-match`  
**Created**: 2026-04-17  
**Status**: Draft  
**Input**: User description: "Add a new question in retirementQuestions after 'retirement-vesting-period': Does your retirement plan feature an employer match? Yes/No. If yes, show a number input for match percentage. Update benefits payload to include retirementPlanHasMatch and retirementMatchPercentage."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Answer Employer Match Question (Priority: P1)

An employer filling out the Additional Questions form reaches the Retirement section. After answering the vesting period question, they see a new question: "Does your retirement plan feature an employer match?" with Yes/No options. If they select Yes, a number input appears for them to enter the match percentage (e.g. 3%). If they select No, the percentage input is hidden/irrelevant. The answer is included in the submitted benefits payload.

**Why this priority**: This is the entire feature — without this question and its conditional input, nothing else has value.

**Independent Test**: Navigate to `/additional-questions`, reach the Retirement section, answer the employer match question. Select Yes and verify the percentage input appears; enter a value and submit — confirm `retirementPlanHasMatch: true` and `retirementMatchPercentage: <value>` appear in the submitted payload. Select No and verify no percentage is submitted.

**Acceptance Scenarios**:

1. **Given** the user is on the Additional Questions form in the Retirement section, **When** the form renders, **Then** the question "Does your retirement plan feature an employer match?" appears immediately after the "retirement-vesting-period" question and before "retirement-auto-enroll".
2. **Given** the user selects "No" for employer match, **When** they view the form, **Then** no percentage input is shown and the submitted payload contains `retirementPlanHasMatch: false` with no `retirementMatchPercentage` field (or `null`/`0`).
3. **Given** the user selects "Yes" for employer match, **When** they view the form, **Then** a number-only input field appears asking for the match percentage.
4. **Given** the user has entered a percentage value and submits, **When** the payload is sent, **Then** it includes `retirementPlanHasMatch: true` and `retirementMatchPercentage: <entered number>`.
5. **Given** the user selects "Yes" but leaves the percentage input blank, **When** they submit, **Then** the form shows a validation error on the percentage field.
6. **Given** the user types non-numeric characters in the percentage input, **When** they type, **Then** only numeric values are accepted (input is restricted to numbers only).

---

### Edge Cases

- What happens when the user selects Yes, enters a percentage, then switches to No? The percentage input should hide and any stored value should be cleared/ignored from the payload.
- What happens if the user enters 0 as the match percentage? It should be accepted as a valid numeric value (edge case: 0% is technically valid input even if unusual).
- What happens if the user enters a very large number (e.g. 999)? No explicit max is specified; accept any positive integer for now.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The form MUST display a new Yes/No question "Does your retirement plan feature an employer match?" positioned after "retirement-vesting-period" and before "retirement-auto-enroll" in the Retirement section.
- **FR-002**: When the user selects "Yes", the form MUST reveal a number input field prompting for the match percentage (e.g. placeholder or label "How much? e.g. 3%").
- **FR-003**: The percentage input MUST accept numeric values only; non-numeric characters MUST be rejected.
- **FR-004**: The percentage input MUST be required when the employer match answer is "Yes"; the form MUST prevent submission and show a validation error if it is left empty while Yes is selected.
- **FR-005**: When the user selects "No" (or switches back from Yes to No), the percentage input MUST be hidden and its value MUST be excluded from the submitted payload.
- **FR-006**: The submitted benefits payload MUST include `retirementPlanHasMatch: boolean` reflecting the Yes/No answer.
- **FR-007**: When `retirementPlanHasMatch` is `true`, the payload MUST include `retirementMatchPercentage: number`.
- **FR-008**: The employer match question MUST be a required field; the form MUST prevent submission if it is unanswered.

### Key Entities

- **Benefits Payload**: The object sent on form submission. Gains two new fields: `retirementPlanHasMatch: boolean` and `retirementMatchPercentage: number` (present only when match is true).
- **Retirement Question**: A new entry in `retirementQuestions` array with id `retirement-employer-match`, options Yes/No, and a `hasConditional` flag triggering the percentage input.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The employer match question renders in the correct position (after vesting period, before auto-enroll) on 100% of form loads.
- **SC-002**: Selecting Yes always reveals the percentage input; selecting No always hides it — no intermediate states visible.
- **SC-003**: Form submission with Yes + a percentage value produces a payload containing both `retirementPlanHasMatch: true` and `retirementMatchPercentage` equal to the entered number.
- **SC-004**: Form submission is blocked (with a visible error) if Yes is selected and the percentage field is empty.
- **SC-005**: The percentage field rejects all non-numeric input — letters, symbols, and spaces are not accepted.

## Assumptions

- The percentage input accepts any non-negative integer (no upper bound validation required beyond what the server enforces).
- The label/placeholder for the percentage input is "How much? e.g. 3%" consistent with the screenshot hint.
- `retirementMatchPercentage` is stored as a plain number (not a string) in the payload.
- When the user answers No, `retirementMatchPercentage` is omitted from the payload (not sent as null/0), consistent with the existing pattern for optional conditional fields.
- Validation for the employer match question follows the same required-field pattern already in place for `retirement-vesting-period`, `retirement-auto-enroll`, and `retirement-hardship-withdrawals`.
- The `buildFinchAssessmentPayload` utility function must be updated to map the new fields into the `benefits` object.

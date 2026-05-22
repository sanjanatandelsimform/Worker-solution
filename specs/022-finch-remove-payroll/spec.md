# Feature Specification: Remove Payroll Provider Question from Finch Flow

**Feature Branch**: `022-finch-remove-payroll`
**Created**: 2026-04-24
**Status**: Draft
**Input**: User description: "Remove the payroll provider question from the Finch flow only, not from the manual flow."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Finch Flow Excludes Payroll Provider Question (Priority: P1)

A user who connects via Finch and navigates to the Additional Questions form should complete the Compensation section without being asked which payroll provider they use. Since Finch already provides payroll data programmatically, asking for it manually is redundant and must be removed from this flow.

**Why this priority**: This is the sole goal of the feature. Removing the question from the Finch form is the primary deliverable.

**Independent Test**: Open the Additional Questions page while in an active Finch connection. The Compensation section should no longer contain a "Who is your company's payroll provider?" dropdown. Submitting the form should succeed without providing a payroll provider value.

**Acceptance Scenarios**:

1. **Given** a user has connected their company via Finch, **When** they navigate to the Additional Questions page, **Then** the "Who is your company's payroll provider?" question is absent from the Compensation section.
2. **Given** a user is on the Finch Additional Questions form, **When** they submit the form without selecting a payroll provider, **Then** no validation error appears for that field and the submission succeeds.
3. **Given** the form is submitted via the Finch flow, **When** the submission payload is sent to the backend, **Then** the payload does not include a payrollProvider field.

---

### User Story 2 - Manual Flow Is Unaffected (Priority: P1)

A user who goes through the standard (non-Finch) manual assessment flow must still see and answer the "Who is your company's payroll provider?" question. The removal must be strictly scoped to the Finch Additional Questions form.

**Why this priority**: Equal in priority to the removal � breaking the manual flow would be a regression.

**Independent Test**: Navigate through the manual assessment flow (dashboard assessment path). Confirm the payroll provider question still appears and is still required in the Compensation section there.

**Acceptance Scenarios**:

1. **Given** a user is on the manual assessment flow, **When** they reach the Compensation section, **Then** the "Who is your company's payroll provider?" question is still present and required.
2. **Given** a user submits the manual assessment without selecting a payroll provider, **When** the form is validated, **Then** a validation error appears for the payroll provider field.

---

### Edge Cases

- If a previously submitted Finch assessment already recorded a payroll provider value, that historical data must remain intact in the backend. Only new Finch submissions going forward are affected.
- The CompensationSection component is shared between flows. The removal must target the Finch-specific entry point (AdditionalQuestions.tsx) and the question definition array in CompensationSection.tsx, without impacting the manual assessment path.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The "Who is your company's payroll provider?" question MUST NOT appear in the Compensation section when a user is in the Finch Additional Questions flow.
- **FR-002**: The Finch form submission payload MUST NOT include a `payrollProvider` field.
- **FR-003**: Validation in the Finch flow MUST NOT require a payroll provider value; submitting without it MUST succeed.
- **FR-004**: The payroll provider question MUST continue to appear and be required in the manual (non-Finch) assessment flow.
- **FR-005**: All `payrollProvider`-related state, props, and validation logic scoped exclusively to the Finch flow MUST be removed from `AdditionalQuestions.tsx`.
- **FR-006**: The `CompensationPayload` data contract for Finch submissions MUST be updated to remove the `payrollProvider` field.
- **FR-007**: The `CompensationSection` component props for payroll provider (state value and change handler) MUST be removed since they are only passed from the Finch flow.
- **FR-008**: No other questions or form sections in the Finch Additional Questions form MUST be altered.

### Key Entities

- **Finch Assessment Payload**: The data object submitted to the backend when a user completes the Finch Additional Questions form. Must no longer carry a `payrollProvider` property.
- **CompensationSection**: The UI component rendering compensation-related questions. The payroll provider question definition is embedded here and must be removed from its internal question list.
- **AdditionalQuestions page**: The page rendered exclusively during the Finch connection flow. This is the primary entry point for all state and validation changes.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The payroll provider question is absent from the rendered Finch Additional Questions form, verifiable by visual inspection and automated test.
- **SC-002**: A Finch assessment form submission completes without any payroll provider data and with zero validation errors related to that field.
- **SC-003**: The manual assessment flow continues to include and enforce the payroll provider question, verifiable by existing and new tests.
- **SC-004**: No regressions in any other question or section of either the Finch or manual flows, verifiable by the full test suite passing.
- **SC-005**: The submitted Finch payload, when inspected in network traffic or unit tests, contains no `payrollProvider` key.

# Feature Specification: API Integration for the Additional Questions Form

**Feature Branch**: `008-additional-questions-api`  
**Created**: 2026-04-13  
**Status**: Draft  
**Input**: User description: "API Integration For the Additional questions form — POST /api/v1/assessment/finch"

## Overview

When a user completes the Additional Questions form (Workforce, Compensation, Benefits/Retirement, and Goals sections), clicking the "Next" button must collect all form answers, transform them into the API expected payload shape, submit them to `POST /api/v1/assessment/finch`, and then show a success banner and navigate to `/dashboard`. The `workforceGoalsRanking` field is hardcoded to a static value for this release; it will be made dynamic in a future feature.

## Clarifications

### Session 2026-04-13

- Q: Where does the user navigate after a successful `POST /api/v1/assessment/finch` response? → A: Navigate to `/dashboard`, preceded by a success toast using the shared `ErrorMessage` component with `errorType="success"` (auto-dismisses after 5 seconds).
- Q: What is the API string value for the "Personal device" communication method option? → A: `"personal_email"`. All form option `id` values in the static `questions` array will be updated to directly match API payload values (snake_case), eliminating a separate mapping layer. The `id` field becomes the API value.
- Q: Should form answers survive navigation (Redux store) or be local component state only? → A: Local component state only. Answers are reset every time the page is visited.
- Q: How should API errors be surfaced to the user? → A: Inline `ErrorMessage` banner with `errorType="danger"` rendered at the top of the form, auto-dismisses after 5 seconds or is manually closed. Consistent with the success path and existing codebase patterns.
- Q: What should happen when the user selects "Yes" for annual raises but leaves the month dropdown empty and clicks "Next"? → A: Block submission. `annualRaiseMonth` is treated as a required field whenever `offersAnnualRaises` is `true`. Show a validation error near the dropdown until a month is selected.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Successful Form Submission (Priority: P1)

A user fills out all required fields across the Workforce, Compensation, Benefits/Retirement, and Goals sections and clicks "Next." The application collects all answers, maps the form internal option IDs to the values the API expects, and submits the assembled payload. On a successful API response the user is navigated to the next screen in the flow.

**Why this priority**: This is the core happy path — without it the form is a no-op and no assessment data reaches the backend.

**Independent Test**: Fill every required field, click "Next," confirm the correct JSON payload is sent to `POST /api/v1/assessment/finch`, and verify the user lands on the next designated screen.

**Acceptance Scenarios**:

1. **Given** all required fields are filled, **When** the user clicks "Next," **Then** exactly one POST request is sent to `/api/v1/assessment/finch` with a payload matching the specified schema.
2. **Given** a successful API response (HTTP 2xx), **When** submission completes, **Then** a success banner is shown using `ErrorMessage` with `errorType="success"` and the user is navigated to `/dashboard` (banner auto-dismisses after 5 seconds).
3. **Given** the user selected "Yes" for annual raises and chose a month, **When** the payload is assembled, **Then** `compensation.annualRaiseMonth` is populated with that month s name and `compensation.offersAnnualRaises` is `true`.
4. **Given** the user selected "No" for annual raises, **When** the payload is assembled, **Then** `compensation.offersAnnualRaises` is `false` and `compensation.annualRaiseMonth` is omitted or `null`.

---

### User Story 2 - API Error Handling (Priority: P2)

A user submits the form but the API returns an error (network failure, validation error, server error). The user must receive clear feedback and remain on the form so they can retry without losing their answers.

**Why this priority**: Without error handling the form silently fails, breaking trust in the onboarding flow.

**Independent Test**: Simulate an API error (e.g., 422 or 500 response), submit the form, and confirm an error message is displayed and all form answers are preserved.

**Acceptance Scenarios**:

1. **Given** the API returns a non-2xx response, **When** submission completes, **Then** an error message is shown describing that submission failed and asking the user to try again.
2. **Given** an API error occurs, **When** the error is displayed, **Then** all previously entered answers remain intact in the form.
3. **Given** a network timeout or connectivity issue, **When** the user clicks "Next," **Then** the same error feedback behavior applies as for a server error.

---

### User Story 3 - Loading / In-Progress Feedback (Priority: P3)

While the API request is in flight the "Next" button must enter a loading/disabled state to prevent duplicate submissions and give the user visual confirmation that their submission is being processed.

**Why this priority**: Prevents duplicate submissions and provides expected UX feedback during async operations.

**Independent Test**: Click "Next" and confirm the button is disabled/loading until the API response resolves, then resumes its normal state.

**Acceptance Scenarios**:

1. **Given** the user clicks "Next," **When** the API call is in flight, **Then** the "Next" button is visually disabled with a loading indicator and cannot be clicked again.
2. **Given** the API call completes (success or failure), **When** the response is received, **Then** the button returns to its active state (or navigation occurs on success).

---

### Edge Cases

- What happens when the user has not selected any optional multi-select fields (e.g., commute methods)? Those arrays should be submitted as empty arrays `[]`.
- What happens when the conditional annual raise month dropdown is not selected even though "Yes" was chosen? Submission is blocked. `annualRaiseMonth` is a required field when `offersAnnualRaises` is `true`; a validation error is shown near the dropdown.
- What happens if the Goals section has no selected goals? `workforceGoals` submits as `[]`; submission proceeds (non-required field).
- What happens if the user navigates away and returns? The form resets — local component state only, no Redux persistence. Answers are lost on navigation (by design for this one-shot onboarding step).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The "Next" button MUST trigger the assembly and submission of the form payload to `POST /api/v1/assessment/finch` when clicked.
- **FR-002**: The static `questions` / `compensationQuestions` / `benefitsQuestions` / `retirementQuestions` arrays MUST use option `id` values that directly match the API payload string values (snake_case). No runtime string transformation is needed for option IDs — the `id` IS the API value.
- **FR-003**: The system MUST include an authenticated Bearer token on every request to this endpoint (consistent with existing `assessmentApi.ts` pattern).
- **FR-004**: The system MUST display a loading indicator on the "Next" button while the API request is in flight and prevent re-submission.
- **FR-005**: On a successful API response (HTTP 2xx), the system MUST display a success banner using the shared `ErrorMessage` component (`errorType="success"`) and then navigate the user to `/dashboard`.
- **FR-006**: On a non-2xx API response or network error, the system MUST render an inline `ErrorMessage` component with `errorType="danger"` at the top of the form. The banner MUST auto-dismiss after 5 seconds (matching existing component behaviour) and all form answers MUST remain intact.
- **FR-007**: The `workforceGoalsRanking` field MUST be sent as a static hardcoded value for this release (see Assumptions).
- **FR-008**: When `offersAnnualRaises` is `true`, `annualRaiseMonth` MUST be treated as a required field. Submission MUST be blocked and a validation error shown near the month dropdown until a month is selected. When `offersAnnualRaises` is `false`, `annualRaiseMonth` MUST be omitted from the payload.
- **FR-009**: Multi-select fields with no selection MUST be submitted as empty arrays `[]`.
- **FR-010**: The assembled payload MUST conform to the four-section schema: `workforce`, `compensation`, `benefits`, `goals`.

### Payload Assembly

Option `id` values in the static form data arrays will be updated to directly match the API payload string values. The `id` IS the API value. No runtime string transformation is required for option IDs.

The assembly layer is responsible only for:

1. Collecting selected option IDs from form state (arrays for multi-select, single string for radio, boolean coercion for Yes/No pairs, string label for dropdowns).
2. Mapping Yes/No radio answers to `true`/`false` booleans.
3. Including `annualRaiseMonth` only when `offersAnnualRaises` is `true`.
4. Injecting the static `workforceGoalsRanking` array.
5. Passing selected goal IDs directly as `workforceGoals` — IDs equal API value strings.

#### Updated Option ID → API Value Reference

**Workforce — communicationMethods** (multi-select, option IDs = API values)

| Form Label                          | Option ID (= API value) |
| ----------------------------------- | ----------------------- |
| Work (email and/or text)            | `work_email`            |
| Personal device (email and/or text) | `personal_email`        |
| Office flyer, in-office experience  | `office_signs`          |

**Workforce — commuteMethods** (multi-select, option IDs = API values)

| Form Label           | Option ID (= API value) |
| -------------------- | ----------------------- |
| Train                | `train`                 |
| Bus                  | `bus`                   |
| Car                  | `car`                   |
| Bike                 | `bike`                  |
| Walking              | `walking`               |
| Group Transportation | `group_transportation`  |

**Workforce — commuteTime** (radio, option IDs = API values)

| Form Label | Option ID (= API value) |
| ---------- | ----------------------- |
| > 15min    | `<15min`                |
| 15-30min   | `15-30min`              |
| 30-1hr min | `30-1hr`                |
| 1hr +      | `1hr+`                  |

**Compensation — shortTermIncentives** (multi-select, option IDs = API values)

| Form Label     | Option ID (= API value) |
| -------------- | ----------------------- |
| Cash bonuses   | `cash_bonuses`          |
| Profit sharing | `profit_sharing`        |
| Commissions    | `commissions`           |

**Compensation — longTermIncentives** (multi-select, option IDs = API values)

| Form Label                            | Option ID (= API value) |
| ------------------------------------- | ----------------------- |
| Stock options                         | `stock_options`         |
| Restricted Stock Units (RSUs)         | `rsus`                  |
| Employee Stock Purchase Plans (ESPPs) | `espps`                 |
| Deferred compensation                 | `deferred_compensation` |
| Pension plans                         | `pension_plans`         |

**Boolean radio pairs** (assembled by the payload builder, not stored as option IDs)

| Field                           | Yes option ID    | No option ID    | API field                       | Boolean value    |
| ------------------------------- | ---------------- | --------------- | ------------------------------- | ---------------- |
| deskless-employees              | `yes-deskless`   | `no-deskless`   | `hasDesklessEmployees`          | `true` / `false` |
| annual-raises                   | `yes-raises`     | `no-raises`     | `offersAnnualRaises`            | `true` / `false` |
| shift-differentials             | `yes-shift-diff` | `no-shift-diff` | `shiftDifferentials`            | `true` / `false` |
| retirement-auto-enroll          | `yes-autoenroll` | `no-autoenroll` | `retirementAutoEnroll`          | `true` / `false` |
| retirement-hardship-withdrawals | `yes-hardship`   | `no-hardship`   | `retirementHardshipWithdrawals` | `true` / `false` |

**Dropdown string-passthrough fields** (label used as-is)

| Field                            | API field                | Value format                          |
| -------------------------------- | ------------------------ | ------------------------------------- |
| payroll-provider                 | `payrollProvider`        | Provider label string (e.g., `"ADP"`) |
| benefits-enrollment-period       | `benefitEnrollmentMonth` | Full month name (e.g., `"November"`)  |
| annual-raise-month (conditional) | `annualRaiseMonth`       | Full month name (e.g., `"March"`)     |

**Benefits broker** (radio, ID maps to capitalised string)

| Option ID       | API value  |
| --------------- | ---------- |
| `yes-broker`    | `"Yes"`    |
| `no-broker`     | `"No"`     |
| `unsure-broker` | `"Unsure"` |

**Retirement vesting period** (radio, option IDs = API values)

| Form Label                     | Option ID (= API value) |
| ------------------------------ | ----------------------- |
| 6 months or less               | `<6m`                   |
| Greater than 6 months - 1 year | `6m_1yr`                |
| Greater than 1 year - 2 years  | `1yr_2yr`               |
| Greater than 2 years - 4 years | `2yr_4yr`               |
| Greater than 4 years           | `>4yr`                  |

**Goals** (goal IDs sent directly as API values)

- `workforceGoals`: array of selected goal IDs sent directly — IDs equal API value strings (e.g., `"Attract Talent"`, `"Reduce 401k Withdrawals"`).
- `workforceGoalsRanking`: static hardcoded array (see Assumptions).

### Key Entities

- **Assessment Payload**: Top-level object submitted to the API. Contains four sub-objects: `workforce`, `compensation`, `benefits`, `goals`.
- **Workforce**: Communication methods, deskless status, commute methods, commute duration.
- **Compensation**: Annual raise flag and month, payroll provider, shift differentials, short-term and long-term incentives.
- **Benefits**: Benefits broker flag, enrollment month, retirement vesting period, auto-enroll flag, hardship withdrawals flag.
- **Goals**: Array of selected workforce goal API value strings, static ranking array.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can complete the Additional Questions form and successfully submit it in under 3 minutes on a standard connection.
- **SC-002**: 100% of form submissions result in a correctly shaped payload delivered to the API with correct value types for all fields.
- **SC-003**: API errors are surfaced to the user within 15 seconds of the request being sent (matching the existing 10-second API timeout plus rendering time).
- **SC-004**: Zero duplicate submissions are possible — the "Next" button is always disabled while a request is in flight.
- **SC-005**: On success, the user reaches the next screen in under 1 second after the API responds.

## Assumptions

- `workforceGoalsRanking` is sent as a static array matching the sample payload (e.g., `["Retain Talent", "Attract Talent", "Reduce Absenteeism"]`) until the dynamic ranking UI is implemented.
- Form option `id` values in the static data arrays will be updated to directly equal the API payload string values. No runtime string mapping is needed for option IDs.
- Goal `id` fields in `goalsData` equal the API value strings directly (e.g., `"Attract Talent"`, `"Reduce 401k Withdrawals"`). Selected IDs are sent as-is; no label lookup is performed.
- `annualRaiseMonth` uses the full human-readable month name (e.g., `"March"`) matching the sample payload.
- Optional multi-select fields with no selection are submitted as empty arrays `[]` rather than being omitted.
- The existing `assessmentApi.ts` Axios instance (with Bearer token interceptor) will be reused for this endpoint call.
- On success: show `ErrorMessage` with `errorType="success"` (auto-dismisses after 5 s), then navigate to `/dashboard`.

## Out of Scope

- Dynamic `workforceGoalsRanking` UX (drag-to-rank / top-3 selection) — deferred to a future feature.
- Inline form validation (field-level error messages) — beyond disabling submission when required fields are missing.
- Offline or draft saving of partially completed form answers across page reloads.

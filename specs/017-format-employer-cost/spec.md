# Feature Specification: Format Employer Cost Display

**Feature Branch**: `017-format-employer-cost`  
**Created**: 2026-04-20  
**Status**: Draft  
**Input**: User description: "In the workforce API's response there is a value called employerCost that is now a number. Update the interfaces and show it formatted as '$11,240/yr' in the FE card. Cover worst case scenarios."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Formatted Employer Cost on Card (Priority: P1)

A user viewing the Compensation tab of the Workforce page sees the "Employer Cost Per Employee (Avg)" card displaying a properly formatted dollar-per-year value (e.g., `$11,240/yr`) sourced from the numeric `employerCost` field returned by the API.

**Why this priority**: Core feature — without formatting the raw number, the card either shows an unformatted integer or crashes. This is the primary deliverable.

**Independent Test**: Navigate to the Workforce → Compensation tab with a real or mocked API response containing `benefitsCost.employerCost: 11240`. The card labeled "Employer Cost Per Employee (Avg)" must display `$11,240/yr`.

**Acceptance Scenarios**:

1. **Given** the API returns `benefitsCost.employerCost: 11240`, **When** the user views the Compensation tab, **Then** the card shows `$11,240/yr`.
2. **Given** the API returns `benefitsCost.employerCost: 1000000`, **When** the user views the Compensation tab, **Then** the card shows `$1,000,000/yr` (thousands separator applied correctly).
3. **Given** the API returns `benefitsCost.employerCost: 0`, **When** the user views the Compensation tab, **Then** the card shows `$0/yr`.

---

### User Story 2 - Graceful Handling of Missing or Invalid Employer Cost (Priority: P2)

A user viewing the Compensation tab when `employerCost` is absent, null, or a non-positive value sees a safe fallback (`--`) instead of a broken or misleading display.

**Why this priority**: Prevents blank screens, JavaScript errors, and misleading data. Guards real-world edge cases in live API responses.

**Independent Test**: Render the card with API payloads where `employerCost` is `null`, `undefined`, missing from the response, or a negative number. The card must show `--` in all such cases.

**Acceptance Scenarios**:

1. **Given** the API returns `benefitsCost.employerCost: null`, **When** the user views the Compensation tab, **Then** the card shows `--`.
2. **Given** the API response omits `employerCost` entirely, **When** the user views the Compensation tab, **Then** the card shows `--`.
3. **Given** the API returns `benefitsCost.employerCost: -500`, **When** the user views the Compensation tab, **Then** the card shows `--` (negative costs are not meaningful to end users).
4. **Given** the workforce data has not yet loaded, **When** the page renders, **Then** the card shows `--` until data arrives.

---

### Edge Cases

- What happens when `employerCost` is `0`? → Display `$0/yr` (zero is a valid value distinct from missing data).
- What happens when `employerCost` is a very large number (e.g., `999999999`)? → Apply locale formatting with thousands separators; display `$999,999,999/yr`.
- What happens when `employerCost` is `null` or `undefined`? → Display `--`.
- What happens when `employerCost` is negative? → Display `--` (guard against bad data).
- What happens when the API payload type does not match (e.g., a string is returned instead of a number)? → Treat as invalid; display `--`.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The `BenefitsCost` data contract MUST type `employerCost` as `number` (replacing the current `string` type).
- **FR-002**: The system MUST format a valid `employerCost` number using locale-aware thousands separators and the `$` prefix, followed by `/yr` suffix (e.g., `11240` → `$11,240/yr`).
- **FR-003**: The system MUST display `--` when `employerCost` is `null`, `undefined`, absent, or negative.
- **FR-004**: The system MUST display `$0/yr` when `employerCost` is exactly `0`.
- **FR-005**: All existing tests that reference `employerCost` as a pre-formatted string MUST be updated to provide a numeric value and assert the formatted output.

### Key Entities

- **BenefitsCost**: Nested object within `CompensationSection` in the workforce API response. Holds `employerCost` (currently `string`, changing to `number`), `employeeContribution` (number), `graph`, and `table`.
- **Employer Cost Card**: UI card on the Compensation tab titled "Employer Cost Per Employee (Avg)" that renders the formatted `employerCost` value.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A valid positive integer from the API (e.g., `11240`) renders as `$11,240/yr` on the card — visually verifiable in the browser.
- **SC-002**: All four invalid-value scenarios (`null`, `undefined`, missing field, negative number) render `--` without a JavaScript error or blank card.
- **SC-003**: Zero (`0`) renders as `$0/yr`, confirming the zero-value branch is handled distinctly from missing data.
- **SC-004**: All existing unit and integration tests pass after the interface and formatting changes are applied.

## Assumptions

- The API team will ship `employerCost` as a plain integer (whole dollars, no cents). If cents are ever returned, the formatting rule `$X,XXX/yr` will need a decimal extension.
- Negative values are treated as data errors and displayed as `--`. If the business later requires showing cost savings as negative figures, the fallback rule must be revisited.
- No change is required to the `employerCostPerPaycheck` field in `BenefitsCostTableRow` — it is already typed as `number | null` and handled separately.
- The formatting pattern (`$` + locale integer + `/yr`) matches the existing pattern used for `employerCostPerEmployee` in the Overview tab, ensuring visual consistency.

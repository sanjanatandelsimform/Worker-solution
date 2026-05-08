# Feature Specification: Rename Seasonal to Other in Workforce Demographics

**Feature Branch**: `034-rename-seasonal-to-other`  
**Created**: 2026-05-07  
**Status**: Draft  
**Input**: User description: "Here in this section, the 3rd item In the chart would be 'Other' instead of 'Seasonal'. And the key from BE would be 'other'. Make sure to update the test cases and run all the testcases so no other test cases are failing."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Employment Type Relabeled as Other (Priority: P1)

A workforce dashboard user viewing the Demographics section sees three employment type donut charts: Full Time, Part Time, and Other. The third chart previously labeled "Seasonal" is now labeled "Other" to match the backend API key `other`.

**Why this priority**: Directly visible to end users — a mislabeled chart creates confusion between UI and backend data. This is the core deliverable.

**Independent Test**: Navigate to the Workforce page > Demographics section. Verify the third donut chart is labeled "Other" and that its data is driven by the `other` field from the API response, not `seasonal`.

**Acceptance Scenarios**:

1. **Given** a user is on the Workforce Demographics page, **When** the employment type donut charts load, **Then** the third chart displays the label "Other" (not "Seasonal").
2. **Given** the API returns an employment type object with an `other` key, **When** the demographics config is computed, **Then** the `other` field value is used to populate the third donut chart's percentage.
3. **Given** the user selects an employment type from the Age Breakdown dropdown, **When** the dropdown items are rendered, **Then** the third option is "Other" (not "Seasonal") and its internal key is `other`.

---

### User Story 2 - Type Safety and Consistency (Priority: P2)

All TypeScript type definitions, data shapes, and internal identifiers that previously referenced `seasonal` are updated to `other` so the codebase is consistent with the backend contract.

**Why this priority**: Without type updates, the app may silently fail to map data — but the user-visible change (P1) is more urgent.

**Independent Test**: Running `pnpm run type-check` produces zero errors related to `seasonal` vs `other`. The `EmploymentType` union type no longer contains `"seasonal"`.

**Acceptance Scenarios**:

1. **Given** a developer runs `pnpm run type-check`, **When** all seasonal-to-other changes are applied, **Then** no TypeScript errors are reported.
2. **Given** the workforce API type definitions, **When** inspecting `EmploymentTypeBreakdown`, **Then** the field name is `other` (not `seasonal`).

---

### User Story 3 - All Tests Pass (Priority: P3)

Existing test suites are updated to reflect the renamed key and label so `pnpm run test` passes without failures.

**Why this priority**: Test coverage must stay green after the rename — secondary to the functional change but required for CI health.

**Independent Test**: `pnpm run test` completes with 0 failing tests after the rename.

**Acceptance Scenarios**:

1. **Given** the test suite for `useWorkforceDemographicsConfig`, **When** run after the rename, **Then** all assertions reference `other` instead of `seasonal` and all tests pass.
2. **Given** the test suite for workforce store selectors, **When** run after the rename, **Then** all fixture data uses `other` and tests pass.

---

### Edge Cases

- What happens when the API still returns a `seasonal` key (legacy data)? The UI will show 0% or undefined for the "Other" chart — acceptable until the backend is updated to match.
- What happens to existing filter state if a user had `selectedEmploymentType === "seasonal"` in local/session state? The type now only accepts `"other"`, so the value would be invalid. Since employment type selection is not persisted (it's component-level React state), this is not a concern.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The third employment type option in the donut chart section of `WorkforceDemographics` MUST be labeled "Other" and have the id `"other"`.
- **FR-002**: The `EmploymentType` union type MUST be updated from `"fullTime" | "partTime" | "seasonal"` to `"fullTime" | "partTime" | "other"` across all source files.
- **FR-003**: The `EmploymentTypeBreakdown` type in `workforceTypes.ts` MUST rename the `seasonal` field to `other`.
- **FR-004**: The `useWorkforceDemographicsConfig` hook MUST read from the `other` key (not `seasonal`) when building the donut chart configuration for the third chart.
- **FR-005**: All test fixtures referencing the `seasonal` key in workforce-related test files MUST be updated to `other`.
- **FR-006**: All tests MUST pass after the changes are applied (`pnpm run test` exits with code 0).
- **FR-007**: `pnpm run type-check` MUST pass with no errors after the changes.

### Key Entities

- **EmploymentType**: The TypeScript union type used throughout the workforce page to represent the three employment categories. After this change: `"fullTime" | "partTime" | "other"`.
- **EmploymentTypeBreakdown**: The API response shape for per-department employment percentages. Contains `fullTime`, `partTime`, and `other` (renamed from `seasonal`) string fields.
- **AgeBreakdown**: The API response shape for age-group employment counts. Contains `fullTime`, `partTime`, and `other` (renamed from `seasonal`) numeric fields.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The third donut chart in the Demographics > Employment Type section displays the label "Other" for all users.
- **SC-002**: `pnpm run test` completes with 0 test failures.
- **SC-003**: `pnpm run type-check` reports 0 TypeScript errors.
- **SC-004**: No occurrences of the string `"seasonal"` remain as a key identifier in the workforce source or test files (display labels for unrelated features like `contractorsSeasonalEmployees` in assessment schemas are unaffected).

## Assumptions

- The backend API has already been (or will simultaneously be) updated to return `other` instead of `seasonal` in the employment type breakdown objects.
- The `contractorsSeasonalEmployees` field in `assessmentSchemas.ts` is unrelated to this change and must NOT be modified.
- The `CompensationTab.tsx` and `useWorkforceCompensationConfig.ts` files are unrelated to employment type charting and must NOT be modified.
- Component-level employment type selection state is not persisted, so no migration of stored state is needed.

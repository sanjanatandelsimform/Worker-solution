# Feature Specification: Update `industryAverageWage` to Object Type

**Feature Branch**: `036-industry-average-wage`  
**Created**: 2026-05-12  
**Status**: Draft

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Accurate Industry Wage in Recommendations (Priority: P1)

A dashboard user viewing the Recommendations page sees the "National Industry Median Wage" card under Company at a Glance. The backend now returns industry average wage as an object with both `hourly` and `salary` sub-values instead of a flat number. The user should continue to see the annual salary value formatted as currency (e.g., "$56,770") without any change in the visual experience.

**Why this priority**: This is the sole user-visible surface affected by the backend contract change. Displaying the wrong value (or no value) directly impacts data accuracy for employers evaluating compensation.

**Independent Test**: Can be fully tested by loading the Recommendations page with mocked industry data returning `{ hourly: 27.29, salary: 56770 }` and asserting the card shows `$56,770`.

**Acceptance Scenarios**:

1. **Given** the industry API returns `industryAverageWage: { hourly: 27.29, salary: 56770 }`, **When** the Recommendations page renders, **Then** the National Industry Median Wage card displays `$56,770`.
2. **Given** the industry API returns `industryAverageWage: { hourly: 27.29, salary: 56770 }`, **When** the Recommendations page renders, **Then** no runtime type errors or console warnings are produced.
3. **Given** the industry data is null or unavailable, **When** the Recommendations page renders, **Then** the National Industry Median Wage card displays "N/A".

---

### User Story 2 - All Tests Pass After Type Change (Priority: P2)

Developers running the test suite after the backend contract update should see all existing tests pass with updated fixtures that reflect the new object shape for `industryAverageWage`.

**Why this priority**: Type safety and test coverage are prerequisites for a safe deployment. Failing tests block CI and hide regressions.

**Independent Test**: Can be fully tested by running `pnpm run test` and observing zero failures related to `industryAverageWage` fixtures or type assertions.

**Acceptance Scenarios**:

1. **Given** the `IndustryOverview` type has been updated, **When** `pnpm run type-check` is run, **Then** it reports zero errors.
2. **Given** test fixtures have been updated to the object shape, **When** `pnpm run test` is run, **Then** all tests pass with no failures.
3. **Given** a test mocks `industryAverageWage` as the old flat number, **When** the test runs, **Then** TypeScript compilation fails — ensuring outdated mocks are caught at compile time.

---

### Edge Cases

- What happens when `industryAverageWage` is present but `salary` is `0`? → Display `$0` (valid value, not N/A).
- What happens when `industryAverageWage` is `null` or `undefined`? → Display "N/A" in the card.
- What happens when `salary` field is missing from the object? → Treat as null and display "N/A".

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The `industryAverageWage` field on `IndustryOverview` MUST be typed as an object with `hourly: number` and `salary: number` sub-fields (not a plain number).
- **FR-002**: The Recommendations page MUST extract the `salary` sub-field from `industryAverageWage` when composing the data passed to the Company at a Glance component.
- **FR-003**: The Company at a Glance component's `industryAverageWage` prop type remains `string | number | null` — only the source extraction changes, not the display contract.
- **FR-004**: All test fixtures that reference `industryAverageWage` as a plain number MUST be updated to use the new object shape `{ hourly: number; salary: number }`.
- **FR-005**: `pnpm run type-check` MUST pass with zero errors after changes.
- **FR-006**: `pnpm run test` MUST pass with zero failures after changes.
- **FR-007**: No other components or pages that consume `CompanyAtGlance.industryAverageWage` require changes — they receive the already-extracted salary value.

### Key Entities

- **`IndustryOverview.industryAverageWage`**: Previously a flat `number`, now an object `{ hourly: number; salary: number }` representing the industry average wage in both hourly and annual salary forms.
- **`CompanyAtGlance.industryAverageWage`**: The display-ready value passed to the UI card — remains `string | number | null`. The extraction of `salary` from the new object happens in `RecommendationsFinchPage`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All existing test cases continue to pass (`pnpm run test` exits with code 0, zero failures).
- **SC-002**: TypeScript type-check passes with zero errors (`pnpm run type-check` exits with code 0).
- **SC-003**: The National Industry Median Wage card on the Recommendations page displays the annual salary value correctly when industry data is available.
- **SC-004**: The National Industry Median Wage card displays "N/A" when industry data is unavailable — same behavior as before the change.

## Assumptions

- Only `salary` is displayed in the UI; `hourly` is available in the type for completeness but is not rendered on any existing page in this feature.
- `CompanyAtAGlance.test.tsx` tests that pass `industryAverageWage` as a plain number directly to the component props do not need to change, since the component's own prop type (`string | number | null`) is unchanged.
- The `dashboardTypes.ts` `CompanyAtGlance` interface does not need modification — the salary number is extracted before being passed.
- No other page or hook directly reads `IndustryOverview.industryAverageWage` other than `RecommendationsFinchPage.tsx`.

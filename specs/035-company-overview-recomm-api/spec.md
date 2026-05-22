# Feature Specification: Company Overview Dual-Source Data

**Feature Branch**: `035-company-overview-recomm-api`  
**Created**: 2026-05-07  
**Status**: Draft  
**Input**: User description: "Company overview fields (totalWorkforce, avgHourlyRate, avgSalary) sourced from workforce API when Finch-connected and from recommendation API companyOverview object when not connected"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Non-Finch User Sees Company Overview on Recommendations Page (Priority: P1)

A user who completed the manual assessment (not connected via Finch) visits the Recommendations tab. The "Company at a Glance" section should display their total workforce count, average hourly wage, and average salary — sourced from the recommendations API response, which now includes a `companyOverview` object.

**Why this priority**: This is the core new behaviour. Without it, non-Finch users see no company overview data on the Recommendations page because the workforce API is not called for them.

**Independent Test**: Log in as a manual-assessment user (non-Finch connected), navigate to the Recommendations tab, and verify the Company at a Glance cards display the three company overview values returned by the recommendations API.

**Acceptance Scenarios**:

1. **Given** a user has completed the manual assessment (not Finch connected) and the recommendations API returns a `companyOverview` object, **When** the Recommendations tab loads, **Then** the total workforce, average hourly wage, and average salary values displayed in the "Company at a Glance" section match the values from `recommendation.companyOverview`.
2. **Given** a non-Finch user whose recommendations API response is missing `companyOverview` (e.g., older backend), **When** the Recommendations tab loads, **Then** those three fields display in a loading/skeleton or empty state rather than crashing.

---

### User Story 2 - Finch-Connected User Still Sees Workforce API Data (Priority: P2)

A user who connected their payroll provider via Finch visits the Recommendations tab. Their company overview data must still come from the workforce API, exactly as before, with no regression.

**Why this priority**: Preserving the Finch-connected path is critical to avoid breaking existing users.

**Independent Test**: Log in as a Finch-connected user and verify the Company at a Glance section displays data from the workforce API (unchanged from current behaviour).

**Acceptance Scenarios**:

1. **Given** a Finch-connected user, **When** the Recommendations tab loads, **Then** `totalWorkforce`, `averageHourlyWage`, and `averageSalary` are sourced from the workforce API data, not from `recommendation.companyOverview`.
2. **Given** a Finch-connected user whose workforce API has not yet loaded, **When** the tab loads, **Then** the Company at a Glance section shows skeleton/loading state until data arrives.

---

### Edge Cases

- What happens when `recommendation.companyOverview` is absent from the API response for a non-connected user? → Each missing field should render as null/empty (skeleton or dash), no crash.
- What happens when `totalWorkforce` is `0`? → Display `0` (falsy-zero must not be treated as missing data).
- What if `avgHourlyRate` or `avgSalary` is `null` in the API response? → Fall back to `null`, display formatted as empty/dash.
- What if a user transitions from non-connected to connected within the same session? → Re-render source switches to workforce API data.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST add a `companyOverview` field to the recommendations API response type, containing `totalWorkforce` (number), `avgHourlyRate` (number), and `avgSalary` (number).
- **FR-002**: The system MUST expose a selector that reads `companyOverview` from the recommendations Redux slice.
- **FR-003**: The Recommendations page MUST source `totalWorkforce`, `averageHourlyWage`, and `averageSalary` for the "Company at a Glance" component from the **workforce API** when the user is Finch-connected (`isConnected === true`).
- **FR-004**: The Recommendations page MUST source `totalWorkforce`, `averageHourlyWage`, and `averageSalary` for the "Company at a Glance" component from `recommendation.companyOverview` when the user is **not** Finch-connected (`isConnected === false`).
- **FR-005**: When `companyOverview` fields are absent or null from the recommendations API, each individual field MUST fall back to `null` without causing a runtime error.
- **FR-006**: The `industryAverageWage` field displayed in Company at a Glance is NOT part of this feature — it remains sourced from the industry API in all cases.

### Key Entities

- **CompanyOverview**: New data object within the recommendation API response containing `totalWorkforce`, `avgHourlyRate`, and `avgSalary`. Represents workforce size and compensation summary for the employer.
- **RecommendationData**: Existing root object in the recommendations API response; gains the new optional `companyOverview` field.
- **isConnected flag**: Derived from assessment type (Finch = connected); determines which API source populates the Company at a Glance company overview fields.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Non-Finch users see company overview values (workforce count, hourly wage, salary) on the Recommendations page whenever the recommendations API provides `companyOverview` data — 100% of the time with no manual intervention.
- **SC-002**: Finch-connected users experience zero regression: company overview values are identical to the current implementation sourced from the workforce API.
- **SC-003**: No uncaught runtime errors occur when `companyOverview` is missing or partially populated in the API response.
- **SC-004**: All existing automated tests continue to pass after the change; new tests cover the non-connected data path for the company overview selector and the Recommendations page component.

## Assumptions

- The backend will include `companyOverview` at the root of the `recommendation` object in the GET /dashboard/recommendation response (i.e., `response.recommendation.companyOverview`).
- Field names from the backend match exactly: `totalWorkforce`, `avgHourlyRate`, `avgSalary`.
- The `companyOverview` field may be absent on older API versions; the frontend must handle its absence gracefully.
- `industryAverageWage` is not part of `companyOverview` and continues to come from the industry API regardless of connection state.
- No changes are needed to the workforce API or its existing selectors.

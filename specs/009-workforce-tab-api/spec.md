# Feature Specification: Dashboard Workforce Tab API Integration

**Feature Branch**: `009-workforce-tab-api`  
**Created**: 2026-04-14  
**Status**: Draft  
**Input**: User description: "In the Dashboard, We have a Tab called Workforce. There we have to Call the API and bring the data. Currently the BE is not ready, so use static data, and once the BE is running and up, we'll remove the static data. Call the API under the slice."

## Overview

The Dashboard's **Workforce** tab (`WorkforcePage.tsx`) currently renders entirely from locally-hardcoded static data arrays. This feature replaces that static data with live data fetched from `GET /api/v1/dashboard/workforce`. Because the backend is not yet deployed, a static fallback dataset — shaped identically to the API response — must be wired into the Redux slice so that UI behaviour can be developed and tested end-to-end now. When the backend goes live, removing the static fallback and pointing the slice at the real endpoint requires a one-line change.

The feature follows the existing patterns established by `dashboardSlice.ts` / `dashboardApi.ts` for Redux async thunks and authenticated API calls.

## Clarifications

### Session 2026-04-14

- Q: When a user re-visits the Workforce tab after previously loading it, should `fetchWorkforce` run again or use cached data? → A: Re-fetch on every dashboard visit — `fetchWorkforce` is dispatched from the Dashboard page on every mount (same timing as other dashboard data fetches), not guarded by `isLoaded`.
- Q: How should the static-vs-live toggle be implemented? → A: The static dataset is inlined directly in the `fetchWorkforce` thunk body in `workforceSlice.ts`. The real `workforceApi` call is present but commented out immediately below the static block. Removing the static block and uncommenting the API call is the complete migration step — all in one place in the slice.
- Q: Should the department dropdown options be hardcoded or derived from the API response? → A: Derived from `demographics.employementType` array returned by the API. Dropdown options are built dynamically from the department entries in that array.
- Q: Should the workforce breakdown table support expanding department rows to show job title sub-rows? → A: No. Flat department rows only — `empNumber`, `partTime`, `fullTime`, `salaryRange` per department. Job title sub-rows (`jobTitles` array) are out of scope for this feature.
- Q: What should the benefits cost table display when `employerCostPerPaycheck` is `null`? → A: Display `"$xx.xx"` as a string placeholder, matching the existing hardcoded value already shown in the current component.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Workforce Data from API (Priority: P1)

A dashboard user navigates to the **Workforce** tab. The application fetches data from `GET /api/v1/dashboard/workforce`, stores it in Redux, and `WorkforcePage` renders the fetched values for all four data groups: Workforce Overview, Participation, Demographics, and Compensation.

**Why this priority**: This is the core objective — the page must display real (or real-shaped) data from the store, not hardcoded literals scattered in the component file.

**Independent Test**: With the static fallback active, load the Workforce tab and confirm all cards, charts, and tables render values that match the static dataset defined in the slice. Replace the static fallback with a mock API returning the same shape and confirm the same values still appear.

**Acceptance Scenarios**:

1. **Given** the user is authenticated and navigates to the Workforce tab, **When** the page mounts, **Then** a `fetchWorkforce` dispatch is triggered and a loading skeleton is shown.
2. **Given** data has loaded successfully, **When** the page renders, **Then** all Workforce Overview metric cards display values sourced from `workforce.*` in the response.
3. **Given** data has loaded successfully, **When** the page renders, **Then** Participation enrollment percentages and benefit breakdowns display values from `participation.*`.
4. **Given** data has loaded successfully, **When** the page renders, **Then** Demographics charts (employment type donut, gender breakdown, age breakdown bar chart) display values from `demographics.*`.
5. **Given** data has loaded successfully, **When** the page renders, **Then** Compensation section (salary breakdown cards, workforce breakdown table, benefits cost graph and table) display values from `compensation.*`.

---

### User Story 2 - Static Fallback While Backend Is Unavailable (Priority: P2)

Until the `GET /api/v1/dashboard/workforce` endpoint is deployed, the Redux slice returns the pre-defined static dataset that exactly mirrors the API response schema. No UI code changes are needed when the backend goes live — only the slice's data source is swapped.

**Why this priority**: Enables the full UI to be built, reviewed, and tested without a live backend. Ensures zero-friction migration once the backend is ready.

**Independent Test**: Set the slice to use static mode (env flag or comment-based switch), load the Workforce tab, and confirm all sections render with the expected static values. Document the exact one-line change needed to enable the real API call.

**Acceptance Scenarios**:

1. **Given** the backend is unavailable and the slice is in static-data mode, **When** `fetchWorkforce` is dispatched, **Then** the slice resolves immediately with the static dataset and sets `isLoaded: true`.
2. **Given** the static dataset is active, **When** the UI renders, **Then** every field that will later be driven by the API is visibly populated (no "N/A", "--", or undefined values).
3. **Given** the backend becomes available later, **When** the static fallback is removed (single point of change in the slice), **Then** the UI continues to work without modification because the API response and static dataset share the same TypeScript type.

---

### User Story 3 - Error Handling for API Failure (Priority: P3)

If the workforce API call fails (network error, non-2xx response), the tab must degrade gracefully and not leave the user looking at broken or empty sections.

**Why this priority**: Prevents a silent broken state that undermines trust in the dashboard.

**Independent Test**: Mock a failed API response (500 or network timeout), navigate to the Workforce tab, and confirm an appropriate error state is rendered without a blank screen or JS exception.

**Acceptance Scenarios**:

1. **Given** the API returns a non-2xx error, **When** the tab loads, **Then** an error message component is shown and loading skeletons are removed.
2. **Given** a network timeout occurs, **When** the tab loads, **Then** the same error state is shown as for a server error.
3. **Given** an error is shown, **When** the user re-visits the tab or triggers a retry, **Then** the fetch is attempted again.

---

### Edge Cases

- What if `fetchWorkforce` is called while a previous call is still in flight? The slice must not issue duplicate requests (guard via `loading` flag or RTK's condition).
- What if a numeric field in the API response is `null` or missing? UI must not crash — display a safe fallback value (e.g., `0` or `"N/A"`).
- What if `demographics.employementType` array is empty? The employment-type chart renders an empty/placeholder state instead of crashing, and the department dropdown shows only a disabled "All" option.
- What if `compensation.workforceBreakdown.departments` is empty? The workforce breakdown table renders an empty rows state.
- What if the user logs out and logs back in? The workforce state must be reset on logout (matching existing slice patterns).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: A new Redux slice `workforceSlice.ts` MUST be created under `src/store/slices/` following the same structure as `dashboardSlice.ts`.
- **FR-002**: The slice MUST expose an async thunk `fetchWorkforce` that calls `GET /api/v1/dashboard/workforce` with an authenticated Bearer token.
- **FR-003**: While the backend is not ready, the `fetchWorkforce` thunk MUST return a hard-wired static dataset (mirroring the exact API response schema) instead of making an HTTP call. The real `workforceApi` call MUST be present immediately below the static block, commented out with a clear migration comment (e.g., `// TODO: remove static data and uncomment when backend is live`). When the backend is ready, deleting the static block and uncommenting the API call is the sole change required — both actions are in a single location within `workforceSlice.ts`.
- **FR-004**: A new API service `workforceApi.ts` MUST be created under `src/services/api/` following the same structure as `dashboardApi.ts` (token extraction from `localStorage`, axios client, error normalisation).
- **FR-005**: TypeScript types for the full API response MUST be defined in `src/types/workforceTypes.ts`, covering all four top-level keys: `workforce`, `participation`, `demographics`, and `compensation`.
- **FR-006**: Selectors MUST be created in `src/store/selectors/workforceSelectors.ts` exposing at minimum: `selectWorkforceData`, `selectWorkforceLoading`, `selectWorkforceError`, and individual section selectors for `workforce`, `participation`, `demographics`, `compensation`.
- **FR-007**: `fetchWorkforce` MUST be dispatched from `DashboardPage.tsx` on every dashboard mount (alongside `fetchDashboard`), not from `WorkforcePage.tsx`. `WorkforcePage` reads exclusively from the Redux store via selectors.
- **FR-013**: The workforce breakdown table MUST display flat department-level rows only (`label`, `empNumber`, `partTime`, `fullTime`, `salaryRange`). The nested `jobTitles` array returned by the API MUST be stored in the Redux state (to avoid data loss) but is NOT rendered in this feature. Expandable job-title sub-rows are explicitly out of scope.
- **FR-008**: Loading skeletons (already present in `WorkforcePage.tsx`) MUST be controlled by `selectWorkforceLoading` instead of a local `setTimeout`-based flag.
- **FR-009**: On API error, the page MUST render an error message using the shared `ErrorMessage` component consistent with existing dashboard error handling.
- **FR-010**: The workforce slice reducer MUST reset to `initialState` on user logout (matching the `auth/logout` action matcher already used in `dashboardSlice.ts`).
- **FR-011**: The slice MUST be registered in `src/store/store.ts` under the key `workforce`.

### Key Entities

- **WorkforceResponse**: Top-level API response type containing `workforce`, `participation`, `demographics`, and `compensation` sub-objects.
- **WorkforceOverview**: Numeric totals — `totalWorkforce`, `enrolledBenefits`, `avgEmployeeCost`, `employerCostPerEmployee`.
- **Participation**: Enrollment percentages for retirement, healthcare, FSA, EAP, wellness, plus per-benefit-type breakdowns (`benefits`, `retirement`, `insurance`).
- **Demographics**: `employementType` (array by department), `gender`, `employmentBreakdownByAge` (array by age group).
- **Compensation**: `salaryBreakdown` (median, avg, hourly), `workforceBreakdown.departments` (array with job titles), `benefitsCost` (employee/employer contribution, range graph data, range table data).
- **WorkforceState**: Redux state shape `{ data: WorkforceResponse | null, loading: boolean, error: string | null, lastFetched: number | null, isLoaded: boolean }`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All data currently hardcoded in `WorkforcePage.tsx` is driven exclusively from the Redux store — zero hardcoded display values remain in the component after this change.
- **SC-002**: Switching from static data to the live API requires changing only one location in a single file (the static-vs-API toggle) with no component changes required.
- **SC-003**: The Workforce tab renders correctly (all sections populated, no console errors) when using the static fallback dataset.
- **SC-004**: TypeScript compilation passes with zero new errors (`pnpm run type-check` clean).
- **SC-005**: Loading skeletons appear on initial fetch and are replaced by content within the same user-visible frame as data arrives — no flash of empty content.
- **SC-006**: When the API call fails, users see a descriptive error message rather than a blank or broken page within the Workforce tab.

## Assumptions

- The API endpoint path is exactly `GET /api/v1/dashboard/workforce` as specified.
- The response JSON schema is stable (as provided in the feature description); no additional transformation is needed beyond mapping to TypeScript types.
- The `apiClient` from `src/services/api/authApi.ts` (axios instance) is reused as-is, consistent with other API services in this project.
- The `employementType` key in the `demographics` object is intentionally misspelled in the backend schema (as provided); the TypeScript type will mirror this spelling to match the API exactly.
- `benefitsCost.employerCostPerPaycheck` can be `null` in the table rows, as shown in the provided schema; the UI displays `"$xx.xx"` as a string placeholder for null values (matches existing component behaviour).
- The intent of `benefitsCost.employerCost: "$11000/yr"` is to render it as a string label without numeric parsing.
- No pagination or filtering is required for the initial release; all data is returned in a single response.

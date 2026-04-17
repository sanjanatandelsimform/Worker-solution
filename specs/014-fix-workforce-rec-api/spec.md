# Feature Specification: Live APIs – Update Workforce & Recommendations Endpoints and Interfaces

**Feature Branch**: `014-fix-workforce-rec-api`  
**Created**: 2026-04-17  
**Status**: Draft  
**Input**: User description: "Fix: Live APIs Instead of Static Data For Workforce and Recommendation API — update API endpoints and TypeScript interfaces for workforceApi.ts and recommendationsApi.ts. Workforce endpoint: /dashboard/workforce (was /api/v1/dashboard/workforce). Recommendation endpoint: /dashboard/recommendation (was /api/v1/dashboard/recommendations). Response shapes updated."

## User Scenarios & Testing _(mandatory)_

### User Story 1 – Workforce page loads live data from updated endpoint (Priority: P1)

A business user navigates to the Workforce tab. The frontend calls the live `/dashboard/workforce` endpoint (not the old `/api/v1/dashboard/workforce` path) and renders the workforce overview, participation, demographics, and compensation sections using the data returned in the updated response shape.

**Why this priority**: The Workforce page is currently using the wrong endpoint and out-of-date type definitions, which means live data cannot be consumed correctly. This is the highest-impact fix.

**Independent Test**: Can be fully tested by loading the Workforce tab while connected to the backend, verifying the correct API URL appears in network requests, and confirming all sections render without console type errors or missing data.

**Acceptance Scenarios**:

1. **Given** the user is logged in and on the Workforce tab, **When** the page loads, **Then** the frontend sends a `GET` request to `/dashboard/workforce` (not `/api/v1/dashboard/workforce`)
2. **Given** the API returns the new response shape `{ assessmentType, workforce: { dataStatus, workforce, participation, demographics, compensation } }`, **When** the Redux slice processes the response, **Then** all Workforce UI sections render the nested data without errors
3. **Given** the API returns `dataStatus: "available"`, **When** the page loads, **Then** all sections display live values instead of static/empty placeholders
4. **Given** the API returns `dataStatus: "pending"` or a network error, **When** the page loads, **Then** the existing loading/error states are shown as before

---

### User Story 2 – Recommendations page loads live data from updated endpoint (Priority: P2)

A business user navigates to the Recommendations tab. The frontend calls the live `/dashboard/recommendation` endpoint (not the old `/api/v1/dashboard/recommendations` path) and renders the strategic recommendations list using the updated response shape.

**Why this priority**: The Recommendations page shares the same endpoint/interface regression as Workforce. Both must be fixed for the live-data milestone to be complete.

**Independent Test**: Can be fully tested by loading the Recommendations tab while connected to the backend, verifying the correct API URL in network requests, and confirming the recommendations list renders all items without console errors.

**Acceptance Scenarios**:

1. **Given** the user is logged in and on the Recommendations tab, **When** the page loads, **Then** the frontend sends a `GET` request to `/dashboard/recommendation` (not `/api/v1/dashboard/recommendations`)
2. **Given** the API returns the new response shape `{ assessmentType, recommendation: { strategicRecommendations, autoEnroll, nonElectiveMatch, healthcareAffordability, dataStatus } }`, **When** the Redux slice processes the response, **Then** the recommendations list renders all strategic recommendations correctly
3. **Given** the response no longer includes a `companyAtGlance` field, **When** the page renders, **Then** no UI element attempts to access `companyAtGlance` and no runtime errors occur

---

### Edge Cases

- What happens when the workforce `dataStatus` field is `"pending"` or `"unavailable"`?  
  → Existing loading/error UI should continue to handle this without changes.
- What happens when `strategicRecommendations` is an empty array?  
  → The UI renders an empty state; existing empty-state handling must not break.
- What happens if a consumer code path still references removed interface fields (e.g., `companyAtGlance`)?  
  → TypeScript compilation must fail loudly so no silent runtime issues exist.
- What happens when `benefitsCost.employerCostPerPaycheck` is `null` in the workforce response?  
  → The interface already types this as `number | null`; rendering logic must tolerate `null`.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The workforce API call MUST target the endpoint `/dashboard/workforce` (removing the `/api/v1` prefix)
- **FR-002**: The top-level workforce response type MUST reflect the new envelope: `{ assessmentType: string; workforce: WorkforceEnvelope }`
- **FR-003**: The `WorkforceEnvelope` type MUST include `dataStatus: string` alongside the nested `workforce`, `participation`, `demographics`, and `compensation` sub-objects
- **FR-004**: The inner `workforce` sub-object (headcount and cost metrics) MUST remain typed with `totalWorkforce`, `enrolledBenefits`, `avgEmployeeCost`, `employerCostPerEmployee`
- **FR-005**: All existing sub-interfaces (`Participation`, `Demographics`, `Compensation`, and their children) MUST remain structurally unchanged because the new response uses the same field shapes for those sections
- **FR-006**: The recommendations API call MUST target the endpoint `/dashboard/recommendation` (removing the `/api/v1` prefix and the trailing `s`)
- **FR-007**: The top-level recommendations response type MUST reflect the new envelope: `{ assessmentType: string; recommendation: RecommendationData }`
- **FR-008**: The `RecommendationData` interface MUST remove the `companyAtGlance` field, which is absent from the updated API response
- **FR-009**: All remaining fields of `RecommendationData` (`strategicRecommendations`, `autoEnroll`, `nonElectiveMatch`, `healthcareAffordability`, `dataStatus`) MUST remain structurally unchanged
- **FR-010**: The Redux slices and selectors for both workforce and recommendations MUST be updated to access data at the new nesting level introduced by the envelope change
- **FR-011**: Any component or page that reads workforce or recommendations data from the Redux store MUST be updated to use the new accessor paths without breaking existing rendering behaviour
- **FR-012**: After all changes, `pnpm run type-check` MUST complete with zero TypeScript errors

### Key Entities

- **WorkforceApiResponse**: New top-level API response type wrapping `assessmentType: string` and `workforce: WorkforceEnvelope`
- **WorkforceEnvelope**: New intermediate type holding `dataStatus: string`, `workforce: WorkforceOverview`, `participation: Participation`, `demographics: Demographics`, `compensation: Compensation`
- **RecommendationsApiResponse**: Updated top-level type wrapping `assessmentType: string` and `recommendation: RecommendationData`
- **RecommendationData**: Updated to remove `companyAtGlance`; all other fields unchanged

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Both Workforce and Recommendations pages display live data from the backend with zero JavaScript or TypeScript runtime errors in the browser console
- **SC-002**: Network requests from both pages target the correct endpoints (`/dashboard/workforce` and `/dashboard/recommendation`); no requests are sent to the former `/api/v1/*` paths
- **SC-003**: `pnpm run type-check` passes with zero errors after all changes are applied
- **SC-004**: All existing visual elements and user interactions on the Workforce and Recommendations pages continue to function identically — no regression in rendered output
- **SC-005**: The `companyAtGlance` field and all references to it are fully removed without any orphaned usages remaining in the codebase

## Assumptions

- The backend is already deployed and serving the updated endpoints and response shapes exactly as provided in the feature request
- Only the endpoint paths and TypeScript interfaces (plus any dependent Redux/selector/component accessor code) require changes; no new UI components or pages are introduced
- The new workforce response wraps data one level deeper — code currently reading `response.workforce` for overview stats will need to read `response.workforce.workforce` and similarly for other sections
- The `assessmentType` field is informational and does not drive any conditional UI rendering logic
- Static mock data files (if any) should be updated to reflect the new shape but are not the primary delivery concern of this feature

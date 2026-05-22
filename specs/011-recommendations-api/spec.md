# Feature Specification: Recommendations Finch Tab API Integration

**Feature Branch**: `011-recommendations-api`  
**Created**: 2026-04-16  
**Status**: Draft  
**Input**: User description: "In the Recommendation-Finch Tab, We need to Integrate API. Currently there is an API integrated but we need to change the source/api. Remove the selectors from the Module (RecommendationsFinchPage.tsx). For Company Overview and Benefits Overview, fetch data from the already integrated workforce API slice. For Core Benefits Enhancement, fetch from a new API (GET /api/v1/dashboard/recommendations). For Proven Strategies, check nonElectiveMatch, healthcareAffordability, autoEnroll flags and show X/3 with progress bar. For Strategic Solutions, get data from strategicRecommendations object in the new API response."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Company & Benefits Overview from Workforce Data (Priority: P1)

A logged-in employer navigates to the Recommendations (Finch) tab. The "Your Company at a Glance" section — including Company Overview cards and Benefits Overview cards — shows live workforce data fetched from the existing workforce API integration (not the dashboard API). The data includes total workforce count, average hourly wage, average salary, eligible employees, enrolled employees, enrolled in retirement, and enrolled in healthcare.

**Why this priority**: This is the primary data-display section of the tab. Removing a dependency on the wrong selector (dashboardSelectors) and wiring to the correct workforce slice is foundational; all other sections build on the same data loading pattern.

**Independent Test**: Navigate to the Recommendations tab. Verify that Company Overview cards display values from the workforce API (e.g., total workforce count and wage data). Can be fully tested independently of the new recommendations API.

**Acceptance Scenarios**:

1. **Given** the user is on the Recommendations tab and workforce data has loaded, **When** the section renders, **Then** each Company Overview card displays the corresponding value from the workforce API response (totalWorkforce, averageHourlyWage, averageSalary, industryAverageWage).
2. **Given** workforce data is still loading, **When** the section renders, **Then** skeleton placeholder cards are shown instead of real values.
3. **Given** the workforce API returns null for a field (e.g., `totalWorkforce: null`), **When** the card renders, **Then** the card displays "N/A" gracefully.
4. **Given** the `RecommendationsFinchPage` component, **When** inspecting imports, **Then** there are no imports from `dashboardSelectors` — only workforce selectors or the new recommendations slice are used.

---

### User Story 2 - View Proven Strategies Progress from Recommendations API (Priority: P2)

An employer viewing the Core Benefits Enhancement section sees a "Proven Strategies" progress indicator. The indicator shows how many of the three proven strategies (Non-elective Match, Auto Enrollment, Healthcare Affordability) have been implemented, as a fraction (e.g., 2/3) and a proportional progress bar. These values come from the `nonElectiveMatch`, `autoEnroll`, and `healthcareAffordability` boolean flags returned by the new recommendations API.

**Why this priority**: This is the primary value-add of the Core Benefits Enhancement section. Employers use this to gauge adoption of proven strategies.

**Independent Test**: Render the section with mocked API data where specific flag combinations are true/false. Verify the correct fraction label and progress bar percentage are shown.

**Acceptance Scenarios**:

1. **Given** the recommendations API returns `autoEnroll: true`, `nonElectiveMatch: true`, `healthcareAffordability: true`, **When** the Proven Strategies section renders, **Then** the label shows "3/3" and the progress bar is at 100%.
2. **Given** the API returns exactly two flags as true, **When** the section renders, **Then** the label shows "2/3" and the progress bar is at 66%.
3. **Given** the API returns exactly one flag as true, **When** the section renders, **Then** the label shows "1/3" and the progress bar is at 33%.
4. **Given** the API returns all flags as false, **When** the section renders, **Then** the label shows "0/3" and the progress bar is at 0%.
5. **Given** the recommendations API is loading, **When** the section renders, **Then** a skeleton placeholder is shown for the progress area.

---

### User Story 3 - View Strategic Solutions from Recommendations API (Priority: P2)

An employer viewing the Strategic Solutions section sees a list of benefit solution cards populated from the `strategicRecommendations` array in the new recommendations API response. Each card shows the recommendation title, description, and key features. Cards are ordered by the `order` field.

**Why this priority**: This section directly drives employer action by surfacing tailored benefit solutions. It was previously wired to the dashboard slice (wrong source) and must now come from the dedicated recommendations endpoint.

**Independent Test**: Render the page with mocked recommendations API data containing 3 strategic recommendations. Verify 3 cards appear with correct titles, descriptions, and key features from the API response.

**Acceptance Scenarios**:

1. **Given** the API returns 3 `strategicRecommendations` items, **When** the section renders, **Then** 3 benefit cards are displayed, each showing the `title`, `description`, and `keyFeatures` from the corresponding recommendation object.
2. **Given** the API returns an empty `strategicRecommendations` array, **When** the section renders, **Then** a "No recommendations available at this time" message is shown.
3. **Given** the API returns recommendations with varying `order` values, **When** the section renders, **Then** cards are displayed in ascending `order` sequence.
4. **Given** the recommendations API is loading, **When** the section renders, **Then** 3 skeleton cards are shown in place of real recommendation cards.

---

### User Story 4 - Stub/Fake API While Backend is Not Live (Priority: P3)

The new recommendations API endpoint (`GET /api/v1/dashboard/recommendations`) is not yet deployed. The system uses a static data stub (following the same pattern as the workforce slice stub) to return the sample response data so that the UI can be developed and tested end-to-end before the real backend is available.

**Why this priority**: Development must proceed without a live backend. The stub must be easily swappable for the real API call when it becomes available, with minimal code changes.

**Independent Test**: Run the app locally. The Recommendations tab displays data matching the static stub response. No network request fails. A clear code comment marks the migration path to the live API.

**Acceptance Scenarios**:

1. **Given** the app runs locally without a live backend, **When** the Recommendations tab loads, **Then** all sections display data from the static stub (3 strategic recommendations, flag values from stub, companyAtGlance from workforce stub).
2. **Given** a developer wants to migrate to the live API, **When** they follow the TODO comments in the slice file, **Then** swapping to the real API call requires removing the static constant and uncommenting 2 lines (same pattern as workforceSlice.ts).

---

### Edge Cases

- What happens when `strategicRecommendations` is missing or `null` in the API response? → Falls back to empty array; "No recommendations available" message is shown.
- What happens when `companyAtGlance` fields are `null` (as in the sample response)? → Cards display "N/A".
- What happens when all three strategy flags (`nonElectiveMatch`, `autoEnroll`, `healthcareAffordability`) are missing/undefined from the API response? → Treated as `false`; score is 0/3.
- What happens when the recommendations API call fails with an error? → An error state is stored in the slice; the page shows a generic error message or falls back gracefully (consistent with workforce slice error handling).
- What happens when the workforce slice has not yet loaded when the Recommendations tab is visited? → Workforce-sourced cards show skeleton state until the workforce data is available.

## Requirements _(mandatory)_

### Functional Requirements

#### Data Source Migration

- **FR-001**: The `RecommendationsFinchPage` component MUST NOT import or use any selectors from `dashboardSelectors`. All data MUST come from either the workforce slice selectors or the new recommendations slice.
- **FR-002**: The Redux slice, API service file, and type definitions for the recommendations API MUST NOT be removed; only the selector imports inside `RecommendationsFinchPage.tsx` are removed/replaced.

#### Company at a Glance Section (Workforce Slice)

- **FR-003**: The Company Overview cards (Total Workforce, Average Hourly Wage, Average Salary, National Industry Average Wage) MUST source their data from the **workforce Redux slice** (via workforce selectors), not from the dashboard slice.
- **FR-004**: The Benefits Overview cards (Eligible Employees, Enrolled Employees, Enrolled in Retirement, Enrolled in Healthcare) MUST source their data from the **workforce Redux slice** participation section.

#### New Recommendations API Slice

- **FR-005**: A new Redux slice (`recommendationsSlice`) MUST be created following the same structure as `workforceSlice.ts`, managing `loading`, `error`, `data`, `lastFetched`, and `isLoaded` state.
- **FR-006**: A new API service function (`getRecommendations`) MUST be created pointing to `GET /api/v1/dashboard/recommendations`, following the same pattern as `workforceApi.ts`.
- **FR-007**: While the backend endpoint is not live, the slice MUST return the following static stub data and include a TODO comment with migration instructions identical in format to `workforceSlice.ts`:

  ```json
  {
    "recommendation": {
      "strategicRecommendations": [
        {
          "order": 1,
          "title": "Emergency Savings",
          "category": "General",
          "matchScore": 1.83,
          "description": "A financial safety net that helps frontline workers manage everyday expenses and unexpected costs.",
          "keyFeatures": ["Reduces turnover", "Reduces absenteeism"],
          "matchedGoals": ["Reduce Absenteeism", "Retain Talent", "Attract Talent"],
          "providerName": "Sunny Day Fund",
          "workerRanking": 1,
          "priorityLevelUsed": 1
        },
        {
          "order": 2,
          "title": "Medical Financing",
          "category": "General",
          "matchScore": 1.33,
          "description": "On-demand access to funds for high-cost medical expenses.",
          "keyFeatures": ["Reduces financial strain", "Helps employees stay focused at work"],
          "matchedGoals": ["Reduce Absenteeism", "Retain Talent"],
          "providerName": "medZERO",
          "workerRanking": 3,
          "priorityLevelUsed": 1
        },
        {
          "order": 3,
          "title": "Financial Coaching",
          "category": "General",
          "matchScore": 1.33,
          "description": "Financial coaching that lowers employee stress.",
          "keyFeatures": ["Improves productivity", "Supports a more resilient workforce"],
          "matchedGoals": ["Reduce Absenteeism", "Retain Talent"],
          "providerName": "TrustPlus",
          "workerRanking": 4,
          "priorityLevelUsed": 1
        }
      ],
      "autoEnroll": true,
      "nonElectiveMatch": false,
      "healthcareAffordability": false,
      "dataStatus": "available",
      "companyAtGlance": {
        "totalWorkforce": null,
        "averageHourlyWage": null,
        "averageSalary": null
      }
    }
  }
  ```

- **FR-008**: The new slice MUST be registered in the Redux store.
- **FR-009**: Typed selectors for the recommendations slice MUST be created in a new `recommendationsSelectors.ts` file.

#### Proven Strategies Section

- **FR-010**: The Proven Strategies progress label MUST dynamically compute the count of implemented strategies by evaluating how many of the three flags (`nonElectiveMatch`, `autoEnroll`, `healthcareAffordability`) are `true` in the recommendations API response.
- **FR-011**: The progress bar value MUST correspond to the implemented count: 0 flags → 0%, 1 flag → 33%, 2 flags → 66%, 3 flags → 100%.
- **FR-012**: The summary text in the progress card MUST reference the dynamically computed count (e.g., "You have already implemented X of 3 proven strategies").

#### Strategic Solutions Section

- **FR-013**: The Strategic Solutions section MUST display benefit cards sourced from the `strategicRecommendations` array in the new recommendations API response.
- **FR-014**: Cards MUST be sorted in ascending `order` field sequence before rendering.
- **FR-015**: Each card MUST display at minimum: `title`, `description`, and `keyFeatures` from the recommendation object.
- **FR-016**: When `strategicRecommendations` is empty or unavailable, the section MUST show the existing "No recommendations available at this time" fallback.

#### Loading & Error States

- **FR-017**: All four sections MUST show skeleton placeholders while their respective data sources are loading.
- **FR-018**: When the recommendations API returns an error, the page MUST display an error state or graceful fallback message in the affected sections without crashing.

### Key Entities

- **RecommendationResponse**: Top-level wrapper from `GET /api/v1/dashboard/recommendations`. Contains `recommendation` object.
- **Recommendation**: Core data object. Fields: `strategicRecommendations` (array), `autoEnroll` (boolean), `nonElectiveMatch` (boolean), `healthcareAffordability` (boolean), `dataStatus` (string), `companyAtGlance` (object with `totalWorkforce`, `averageHourlyWage`, `averageSalary`).
- **StrategicRecommendation**: Individual recommendation item. Fields: `order` (number), `title` (string), `category` (string), `matchScore` (number), `description` (string), `keyFeatures` (string[]), `matchedGoals` (string[]), `providerName` (string), `workerRanking` (number), `priorityLevelUsed` (number).
- **ProvenStrategiesScore**: Derived value (not stored, computed on render) representing the count of `true` flags among `nonElectiveMatch`, `autoEnroll`, `healthcareAffordability`. Range: 0–3.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The Recommendations tab loads and displays all four sections (Company Overview, Benefits Overview, Proven Strategies, Strategic Solutions) without any runtime errors.
- **SC-002**: All data in Company Overview and Benefits Overview cards matches values from the workforce API slice — no values are sourced from the dashboard API slice.
- **SC-003**: The Proven Strategies label and progress bar accurately reflect the exact count of `true` flags returned by the recommendations API (verified for all four combinations: 0/3, 1/3, 2/3, 3/3).
- **SC-004**: Strategic Solutions cards display the title, description, and key features exactly as returned in `strategicRecommendations`, in ascending order. With 3 stub items, exactly 3 cards render.
- **SC-005**: `RecommendationsFinchPage.tsx` contains zero imports from `dashboardSelectors` after this change.
- **SC-006**: The static stub is the sole data source in the absence of a live backend, and the full page renders correctly using stub data alone.
- **SC-007**: A developer can migrate from stub to live API by following the TODO comments in the slice file without needing to modify any component files.

## Assumptions

- The workforce slice is already dispatched and populated when the Recommendations tab is visited (existing behavior from feature 009).
- The new recommendations Redux slice will dispatch its fetch thunk on component mount (similar to how the workforce slice is triggered).
- The `companyAtGlance` object inside the recommendations API response is informational only and is NOT used for the Company Overview/Benefits Overview cards on this tab — those continue to come from the workforce slice. The `companyAtGlance` in the recommendations response may be used in a future feature.
- The three `ProvenStrategiesCard` components (non-elective match, auto enrollment, healthcare affordability) remain purely presentational; their ordering on screen matches the order of the flag checks.
- No visual or behavioral changes beyond the data source migration are in scope. Existing skeleton, loading, and error UI patterns are reused as-is.

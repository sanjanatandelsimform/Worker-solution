# Feature Specification: Dashboard API Integration

**Feature Branch**: `001-dashboard-api-integration`  
**Created**: 2026-02-24  
**Status**: Draft  
**Input**: User description: "Integrate the GET /dashboard API into the Dashboard flow using Spec Driven Development. Call API once after Goals API call when user clicks go to dashboard button. Store response in application state. Map API response to RecommendationsPage (companyAtGlance, strategicRecommendations) and BenchmarkPage (industryOverview, turnoverVoluntaryVsInvoluntary, rateOfSeparation, areaMedianWage, housingCost). No UI/styling/layout/navigation changes."

## Clarifications

### Session 2026-02-24

- Q: API Request Timeout Duration - What specific timeout duration should the system enforce before showing a timeout error to the user? → A: 30 seconds
- Q: Error Retry Mechanism - When the API call fails (network error, timeout, server error), should the retry be automatic or manual (user-initiated)? → A: Manual retry with button
- Q: Dashboard Data Persistence After Page Refresh - If the user refreshes their browser while viewing the dashboard, should the system preserve the dashboard data or require them to reload it? → A: Auto-reload from API
- Q: Empty Array Section Display Behavior - When areaMedianWage or housingCost arrays are completely empty (zero elements), should the corresponding sections in the Benchmark tab be hidden entirely or shown with placeholder text? → A: Show section with placeholder message
- Q: Numeric Value Display Formatting - How should numeric values like totalWorkforce, averageHourlyWage, and averageSalary be formatted for display? → A: Locale-aware formatting with currency
- Q: ZIP Code Selection Persistence Mechanism - How should the system persist the user's ZIP code selection when navigating between tabs (component state, session storage, local storage, or Redux)? → A: Component state (React useState)
- Q: Loading Indicator During ZIP Code Selection - Should the system display any visual feedback (loading indicator) when the user changes ZIP code selection? → A: No loading indicator
- Q: Multiple ZIP Codes with Same Value Handling - When areaMedianWage or housingCost arrays contain multiple entries with the same zipcode value, how should the system handle the duplicates? → A: Use first matching entry only
- Q: Data Availability Message Scope - When a selected ZIP code has no matching data, should the "Data not available for selected ZIP code" message appear per section independently, all sections together, or should sections be hidden? → A: Per section independently
- Q: ZIP Code Dropdown with Single Entry - Should the system display the ZIP code dropdown when only one ZIP code is available in the API response? → A: Show dropdown with single entry

## API Timeout Details

- **Timeout Duration**: The system enforces a 30-second timeout for all API requests.
- **Retry Mechanism**: If the API call fails due to a timeout, the system displays a user-friendly error message with a "Retry" button. Users can manually retry the API call by clicking the button.

## Placeholder Behavior

- **Data Not Available**: When data is unavailable for a section (e.g., areaMedianWage, housingCost), the system displays a placeholder message: "Data not available for selected ZIP code."
- **UI Design**: Placeholder messages are styled with the following:
  - Font: Italic, gray color (#6B7280).
  - Alignment: Centered within the section.
  - Icon: Optional warning icon (16px) to the left of the message.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dashboard Data Retrieval (Priority: P1)

After completing the Goals assessment, users click "Go to Dashboard" and expect to see their personalized company insights loaded from the server, not static placeholder data.

**Why this priority**: This is the foundational capability - without API integration, all data shown would be static/mock, providing no actual value to users.

**Independent Test**: Can be fully tested by completing a Goals assessment, clicking "Go to Dashboard", and verifying that a network request is made to GET /dashboard and the response is stored in the application state.

**Acceptance Scenarios**:

1. **Given** user has completed Goals assessment and sees success modal, **When** user clicks "Go to Dashboard" button, **Then** system makes one GET /dashboard API call
2. **Given** API returns dashboard data, **When** data is received, **Then** system stores complete response in application state for reuse
3. **Given** user navigates between Recommendations and Benchmark tabs, **When** switching tabs, **Then** system reuses stored data without making additional API calls

---

### User Story 2 - Company Overview Display (Priority: P2)

Users view their Recommendations tab to see key company metrics (total workforce, average wages, average salary) and personalized strategic recommendations based on their assessment data.

**Why this priority**: Provides immediate actionable insights to users - the "at a glance" metrics and recommendations are the primary value proposition of the dashboard.

**Independent Test**: Can be fully tested by loading the Dashboard and verifying that Recommendations tab displays companyAtGlance metrics and sorted strategicRecommendations cards with correct data from the API response.

**Acceptance Scenarios**:

1. **Given** dashboard data is loaded, **When** user views Recommendations tab, **Then** Total Workforce displays value from companyAtGlance.totalWorkforce
2. **Given** dashboard data is loaded, **When** user views Recommendations tab, **Then** Average Hourly Wage displays value from companyAtGlance.averageHourlyWage
3. **Given** dashboard data is loaded, **When** user views Recommendations tab, **Then** Average Salary displays value from companyAtGlance.averageSalary
4. **Given** dashboard data is loaded, **When** user views Recommendations tab, **Then** Recommended Solutions cards display strategicRecommendations sorted by order (ascending) showing category, title, description, and keyFeatures for each

---

### User Story 3 - Industry Benchmark Insights (Priority: P3)

Users view their Benchmark tab to compare their company's metrics against industry standards across multiple dimensions: turnover rates, separation metrics, wage comparisons, and housing cost analysis.

**Why this priority**: Provides comprehensive competitive intelligence - helps users understand their position relative to market standards and identify improvement opportunities.

**Independent Test**: Can be fully tested by loading the Dashboard, switching to Benchmark tab, and verifying all sections display correct data mapped from industryOverview, turnoverVoluntaryVsInvoluntary, rateOfSeparation, areaMedianWage, and housingCost arrays.

**Acceptance Scenarios**:

1. **Given** dashboard data is loaded, **When** user views Benchmark tab, **Then** Industry Overview section displays industryOverview.turnoverRate, avgTurnover, and avgCostOfTurnover
2. **Given** dashboard data is loaded, **When** user views Benchmark tab, **Then** Turnover Voluntary vs Involuntary section displays data from turnoverVoluntaryVsInvoluntary
3. **Given** dashboard data is loaded, **When** user views Benchmark tab, **Then** Rate of Separation section displays data from rateOfSeparation
4. **Given** dashboard data is loaded, **When** user views Benchmark tab, **Then** Area Median Wage section displays first element from areaMedianWage array including graph values (stateAverage, yourCompany, nationalAverage)
5. **Given** dashboard data is loaded, **When** user views Benchmark tab, **Then** Housing Cost sections display first element from housingCost array for Burdened Owners, Renters, Working Class metrics and graph

---

### User Story 4 - ZIP Code-Driven Data Binding (Priority: P3)

Users select different ZIP codes from a dropdown to dynamically view area-specific wage and housing data for different geographic locations without making additional API calls.

**Why this priority**: Enables users to compare metrics across multiple locations using data already provided in the API response, adding significant analytical value without performance cost.

**Independent Test**: Can be fully tested by loading the Dashboard, selecting different ZIP codes from the dropdown in Benchmark tab, and verifying that Area Median Wage and Housing Cost sections update to show data matching the selected ZIP code without triggering new API calls.

**Acceptance Scenarios**:

1. **Given** dashboard data is loaded, **When** user views Benchmark tab, **Then** ZIP code dropdown displays all values from zipCodes array in API response
2. **Given** ZIP code dropdown is populated, **When** page loads, **Then** first ZIP code in zipCodes array is selected by default
3. **Given** user selects a different ZIP code from dropdown, **When** selection changes, **Then** Area Median Wage section updates to display data from areaMedianWage array where zipcode matches selected value
4. **Given** user selects a different ZIP code from dropdown, **When** selection changes, **Then** Housing Cost Burdened Owners section updates to display data from housingCost array where zipcode matches selected value
5. **Given** user selects a different ZIP code from dropdown, **When** selection changes, **Then** Housing Cost Burdened Renters section updates to display data from housingCost array where zipcode matches selected value
6. **Given** user selects a different ZIP code from dropdown, **When** selection changes, **Then** Working Class Housing Cost Burden section (metrics and graph) updates to display data from housingCost array where zipcode matches selected value
7. **Given** user changes ZIP code selection, **When** data updates occur, **Then** system does NOT make any additional API calls (data comes from cached response)
8. **Given** selected ZIP code has no matching data in areaMedianWage or housingCost arrays, **When** rendering sections, **Then** system displays "Data not available for selected ZIP code" placeholder

---

### User Story 5 - Graceful Error Handling (Priority: P4)

Users experience smooth interactions even when API calls fail, data is incomplete, or network issues occur, with clear feedback about system state.

**Why this priority**: Ensures professional user experience and prevents confusion or data inconsistencies - critical for production readiness but can be added after core data flows work.

**Independent Test**: Can be fully tested by simulating API failures (network offline, 500 error, timeout) and verifying appropriate loading states, error messages, and fallback displays without breaking the UI.

**Acceptance Scenarios**:

1. **Given** user clicks "Go to Dashboard", **When** API call is in progress, **Then** system displays loading indicator without blocking navigation
2. **Given** API call fails with network error, **When** error occurs, **Then** system displays user-friendly error message with a "Retry" button
3. **Given** user clicks "Retry" button after API failure, **When** button is clicked, **Then** system re-attempts the GET /dashboard API call
4. **Given** API returns empty or null data fields, **When** rendering page sections, **Then** system displays appropriate fallback content (e.g., "No data available") without breaking layout
5. **Given** API returns malformed data, **When** processing response, **Then** system handles gracefully with error boundaries and logs issue for debugging

### Edge Cases

- What happens when the API returns an empty strategicRecommendations array?
  - System should display a "No recommendations available" message while maintaining layout structure
  
- What happens when areaMedianWage or housingCost arrays are empty?
  - System should display sections with "Data not available" placeholder message while maintaining section structure and layout
  
- What happens when numeric values (totalWorkforce, averageHourlyWage, averageSalary) are null or undefined?
  - System should display a dash (-) or "N/A" placeholder instead of showing "null" or causing rendering errors
  
- What happens when user refreshes the page while on Dashboard?
  - System should detect the page refresh, automatically re-fetch dashboard data from the GET /dashboard API, and restore the user's view
  
- What happens when API response takes longer than expected (slow network)?
  - System should show loading indicator for up to 30 seconds, then display timeout error with retry option
  
- What happens when user rapidly switches between tabs before data loads?
  - System should handle race conditions gracefully, ensuring the same data set is used consistently across tabs
  
- What happens when strategicRecommendations have missing fields (category, title, description, keyFeatures)?
  - System should handle partial data gracefully, displaying available fields and hiding or showing placeholders for missing ones

- What happens when zipCodes array is empty in API response?
  - System should hide ZIP code dropdown and display area-specific sections using first available data from areaMedianWage and housingCost arrays
  
- What happens when zipCodes array contains only one ZIP code?
  - System should display the ZIP code dropdown with the single entry selected, maintaining UI consistency
  
- What happens when selected ZIP code has no matching data in areaMedianWage or housingCost arrays?
  - System should display "Data not available for selected ZIP code" message in affected sections while maintaining layout structure
  
- What happens when areaMedianWage or housingCost arrays contain multiple entries with the same zipcode?
  - System should use the first matching entry in array order for data display
  
- What happens when user switches to a different tab and returns to Benchmark tab?
  - System should preserve the user's previously selected ZIP code when returning to the tab

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST call GET /dashboard API exactly once when user clicks "Go to Dashboard" button after completing Goals assessment
- **FR-002**: System MUST store the complete API response in application state for reuse across tabs
- **FR-003**: System MUST NOT make additional API calls when user switches between Recommendations and Benchmark tabs
- **FR-004**: System MUST display loading indicator while API call is in progress
- **FR-004a**: System MUST enforce a 30-second timeout for the GET /dashboard API call
- **FR-005**: System MUST display user-friendly error message if API call fails, with a manual retry button allowing user to re-attempt the request
- **FR-006**: System MUST map companyAtGlance.totalWorkforce to Total Workforce display in Recommendations tab
- **FR-006a**: System MUST format numeric values using locale-aware formatting with thousand separators for totalWorkforce, currency format for averageHourlyWage and averageSalary
- **FR-007**: System MUST map companyAtGlance.averageHourlyWage to Average Hourly Wage display in Recommendations tab
- **FR-008**: System MUST map companyAtGlance.averageSalary to Average Salary display in Recommendations tab
- **FR-009**: System MUST display strategicRecommendations sorted by order field (ascending) as Recommended Solutions cards in Recommendations tab
- **FR-010**: System MUST display category, title, description, and keyFeatures for each strategic recommendation card
- **FR-011**: System MUST map industryOverview.turnoverRate, avgTurnover, and avgCostOfTurnover to Industry Overview section in Benchmark tab
- **FR-012**: System MUST map turnoverVoluntaryVsInvoluntary data to Turnover Voluntary vs Involuntary section in Benchmark tab
- **FR-013**: System MUST map rateOfSeparation data to Rate of Separation section in Benchmark tab
- **FR-014**: System MUST map first element of areaMedianWage array to Area Median Wage section in Benchmark tab, including graph values (stateAverage, yourCompany, nationalAverage)
- **FR-015**: System MUST map first element of housingCost array to Housing Cost sections (Burdened Owners, Renters, Working Class, and graph) in Benchmark tab
- **FR-016**: System MUST handle null, undefined, or missing data fields with appropriate fallback displays (placeholders, dashes, or "N/A" messages) without breaking layout
- **FR-016a**: System MUST display sections with "Data not available" placeholder message when areaMedianWage or housingCost arrays are empty, maintaining section structure and visibility
- **FR-017**: System MUST NOT modify existing UI structure, styling, layouts, navigation, or component hierarchy
- **FR-018**: System MUST NOT introduce new third-party libraries or dependencies
- **FR-019**: System MUST preserve all existing functionality and user interactions in Dashboard, Recommendations, and Benchmark pages
- **FR-020**: System MUST automatically re-fetch dashboard data from the API when user refreshes the page while on the Dashboard
- **FR-021**: System MUST populate ZIP code dropdown with all values from zipCodes array in API response
- **FR-022**: System MUST select the first ZIP code from zipCodes array as the default selection when page loads
- **FR-023**: System MUST dynamically update Area Median Wage section to display data from areaMedianWage array element where zipcode field matches selected ZIP code
- **FR-024**: System MUST dynamically update Housing Cost Burdened Owners section to display data from housingCost array element where zipcode field matches selected ZIP code
- **FR-025**: System MUST dynamically update Housing Cost Burdened Renters section to display data from housingCost array element where zipcode field matches selected ZIP code
- **FR-026**: System MUST dynamically update Working Class Housing Cost Burden section (metrics and graph) to display data from housingCost array element where zipcode field matches selected ZIP code
- **FR-027**: System MUST NOT make any additional API calls when user changes ZIP code selection (data must come from cached API response)
- **FR-028**: System MUST display "Data not available for selected ZIP code" placeholder independently in each section (Area Median Wage, Housing Cost Burdened Owners, Housing Cost Burdened Renters, Working Class Housing Cost Burden) when that specific section lacks matching data for the selected ZIP code
- **FR-029**: System MUST hide ZIP code dropdown when zipCodes array is empty and display area-specific sections using first available data from areaMedianWage and housingCost arrays
- **FR-030**: System MUST preserve user's selected ZIP code when navigating away from and returning to Benchmark tab using component state (React useState), resetting on page refresh

### Key Entities

- **Dashboard Data**: Complete API response containing company insights, recommendations, and benchmark data
  - Attributes: companyAtGlance, strategicRecommendations, industryOverview, turnoverVoluntaryVsInvoluntary, rateOfSeparation, areaMedianWage (array), housingCost (array)
  
- **Company At Glance**: Summary metrics of the company's workforce and compensation
  - Attributes: totalWorkforce, averageHourlyWage, averageSalary
  
- **Strategic Recommendation**: Actionable recommendation for the company based on assessment
  - Attributes: order, category, title, description, keyFeatures
  - Relationship: Multiple recommendations per dashboard, sorted by order
  
- **Industry Overview**: Aggregate industry benchmark metrics
  - Attributes: turnoverRate, avgTurnover, avgCostOfTurnover
  
- **Area Median Wage**: Wage comparison data across geographic levels
  - Attributes: zipcode, medianHourlyWages, medianLivingWage, nationalAverage, graph (stateAverage, yourCompany, nationalAverage)
  - Note: Data filtered by selected ZIP code from dropdown; first matching element used for display
  - Relationship: Multiple area median wage entries per dashboard (one per ZIP code)
  
- **Housing Cost**: Housing affordability metrics for different worker categories
  - Attributes: zipcode, burdenedOwnersPercentage, burdenedRentersPercentage, workingClassHousingCost, workingClassHousingGraph
  - Note: Data filtered by selected ZIP code from dropdown; first matching element used for display
  - Relationship: Multiple housing cost entries per dashboard (one per ZIP code)

- **ZIP Codes**: Array of geographic identifiers for area-specific data filtering
  - Attributes: Array of ZIP code strings
  - Usage: Populates dropdown for user selection; drives filtering of areaMedianWage and housingCost arrays
  - Default: First ZIP code in array selected on page load

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users see personalized dashboard data (not static placeholders) within 3 seconds of clicking "Go to Dashboard" button under normal network conditions
- **SC-002**: System makes exactly 1 network request to dashboard endpoint per user session, regardless of tab switches between Recommendations and Benchmark
- **SC-003**: 100% of valid API response fields are correctly mapped to their corresponding UI sections in both Recommendations and Benchmark tabs
- **SC-004**: Dashboard remains fully functional and maintains existing layout/styling when API returns empty arrays or null values for optional fields
- **SC-005**: Users can successfully retry dashboard load if initial API call fails, with success rate of >95% on second attempt
- **SC-006**: Strategic recommendations display in correct priority order (sorted by order field) 100% of the time
- **SC-007**: Tab switching between Recommendations and Benchmark completes instantly (<100ms) by reusing cached data
- **SC-008**: Zero UI layout breaks or styling regressions occur when integrating API data compared to current static implementation
- **SC-009**: All existing dashboard functionality (navigation, filtering, interactions) continues to work without modification
- **SC-010**: Users receive clear feedback during all system states: loading (progress indicator), error (actionable message with retry), and success (data display)
- **SC-011**: ZIP code selection updates all area-specific sections (Area Median Wage, Housing Cost) instantly (<100ms) without triggering API calls
- **SC-012**: ZIP code dropdown displays 100% of ZIP codes from API response and correctly filters areaMedianWage and housingCost data based on user selection
- **SC-013**: Users' ZIP code selection persists when navigating between tabs and returning to Benchmark tab during the same session

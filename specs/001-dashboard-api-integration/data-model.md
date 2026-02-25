# Data Model: Dashboard API Integration

**Feature**: 001-dashboard-api-integration  
**Date**: 2026-02-24  
**Status**: Complete

## Overview

This document defines the data structure for dashboard information in the WorkQuality Platform. The model represents company insights, strategic recommendations, and industry benchmark data returned from the GET /dashboard API endpoint.

---

## Entity Definitions

### 1. DashboardResponse (Root Entity)

**Purpose**: Complete API response containing all dashboard data sections

**Attributes**:
- `companyAtGlance`: CompanyAtGlance - Summary metrics of company's workforce and compensation
- `strategicRecommendations`: StrategicRecommendation[] - Ordered list of actionable recommendations
- `industryOverview`: IndustryOverview - Aggregate industry benchmark metrics
- `turnoverVoluntaryVsInvoluntary`: TurnoverMetrics - Breakdown of voluntary vs involuntary turnover
- `rateOfSeparation`: SeparationMetrics - Employee separation rate data
- `areaMedianWage`: AreaMedianWage[] - Array of wage comparison data (first element used)
- `housingCost`: HousingCost[] - Array of housing affordability data (first element used)

**Relationships**:
- Has one CompanyAtGlance
- Has many StrategicRecommendations (0..n)
- Has one IndustryOverview
- Has one TurnoverMetrics
- Has one SeparationMetrics
- Has many AreaMedianWage entries (display first)
- Has many HousingCost entries (display first)

**Validation Rules**:
- All fields may be null/undefined (graceful degradation required per FR-016)
- Arrays may be empty (display placeholders per FR-016a)
- Response must be valid JSON
- Timeout if response not received within 30 seconds (FR-004a)

---

### 2. CompanyAtGlance

**Purpose**: High-level company workforce and compensation snapshot

**Attributes**:
- `totalWorkforce`: number | null - Total number of employees
- `averageHourlyWage`: number | null - Average hourly wage across workforce (USD)
- `averageSalary`: number | null - Average annual salary across workforce (USD)

**Display Mapping** (RecommendationsPage):
- `totalWorkforce` → "Total Workforce" (formatted with thousand separators)
- `averageHourlyWage` → "Average Hourly Wage" (formatted as currency with cents)
- `averageSalary` → "Average Salary" (formatted as currency, integer)

**Validation Rules**:
- Numeric values >= 0 when present
- Null values display as "N/A" or dash (FR-016)
- Format using Intl.NumberFormat for locale-aware display (FR-006a)

---

###3. StrategicRecommendation

**Purpose**: Actionable recommendation for company based on assessment results

**Attributes**:
- `order`: number - Sort priority (ascending = higher priority)
- `category`: string - Recommendation category/type
- `title`: string - Brief recommendation title
- `description`: string - Detailed explanation of recommendation
- `keyFeatures`: string | string[] - Primary benefits or implementation points

**Display Mapping** (RecommendationsPage):
- Sorted by `order` ascending (FR-009)
- Displayed as cards showing category, title, description, keyFeatures (FR-010)

**Relationships**:
- Belongs to DashboardResponse
- Multiple recommendations can exist per dashboard

**Validation Rules**:
- `order` must be numeric for sorting
- Empty array displays "No recommendations available" (edge case handling)
- Missing fields (category, title, description, keyFeatures) gracefully handled with partial display

**State Transitions**:
- Recommendations are read-only after fetch
- Order determines display priority
- No user mutation allowed

---

### 4. IndustryOverview

**Purpose**: Aggregate industry-wide benchmark metrics for comparison

**Attributes**:
- `turnoverRate`: number | null - Industry average turnover rate (percentage)
- `avgTurnover`: number | null - Average turnover count
- `avgCostOfTurnover`: number | null - Average cost per turnover event (USD)

**Display Mapping** (BenchmarkPage - Industry Overview section):
- All three attributes displayed in Industry Overview section (FR-011)

**Validation Rules**:
- Numeric values when present
- Null values display as "N/A" with placeholder (FR-016)
- Rates displayed as percentages
- Costs formatted as currency

---

### 5. TurnoverMetrics (turnoverVoluntaryVsInvoluntary)

**Purpose**: Breakdown of employee departures by voluntary vs involuntary classification

**Attributes**:
- `voluntary`: number | null - Count of voluntary departures
- `involuntary`: number | null - Count of involuntary departures
- `voluntaryPercentage`: number | null - Percentage of voluntary departures
- `involuntaryPercentage`: number | null - Percentage of involuntary departures

**Display Mapping** (BenchmarkPage - Turnover Voluntary vs Involuntary section):
- Data from `turnoverVoluntaryVsInvoluntary` object (FR-012)

**Validation Rules**:
- Numeric values >= 0 when present
- Percentages should sum to ~100% when both present
- Null handling with "N/A" fallback

---

### 6. SeparationMetrics (rateOfSeparation)

**Purpose**: Employee separation rate metrics

**Attributes**:
- `rate`: number | null - Separation rate (percentage or ratio)
- `count`: number | null - Total separation count
- `period`: string | null - Time period for measurements (e.g., "monthly", "annual")

**Display Mapping** (BenchmarkPage - Rate of Separation section):
- Data from `rateOfSeparation` object (FR-013)

**Validation Rules**:
- Numeric values >= 0 when present
- Null handling with "N/A" fallback
- Rate formatted as percentage

---

### 7. AreaMedianWage

**Purpose**: Wage comparison across geographic levels (state, company, national)

**Attributes**:
- `stateAverage`: number | null - State-level average wage (USD)
- `yourCompany`: number | null - Company's average wage (USD)
- `nationalAverage`: number | null - National average wage (USD)
- `region`: string | null - Geographic region identifier (optional)

**Display Mapping** (BenchmarkPage - Area Median Wage section):
- **First element** of `areaMedianWage` array used for display (FR-014)
- Graph displays stateAverage, yourCompany, nationalAverage
- Empty array shows "Data not available" placeholder (FR-016a)

**Relationships**:
- Belongs to DashboardResponse (array element)
- Only first element consumed for display

**Validation Rules**:
- Array may be empty (show placeholder per clarification #4)
- Numeric values >= 0 when present
- Currency formatting for display

---

### 8. HousingCost

**Purpose**: Housing affordability metrics for workers

**Attributes**:
- `burdenedOwnersPercentage`: number | null - Percentage of cost-burdened homeowners
- `burdenedRentersPercentage`: number | null - Percentage of cost-burdened renters
- `workingClassHousingCost`: number | null - Average housing cost for working class (USD)
- `workingClassHousingGraph`: GraphDataPoint[] | null - Time-series or categorical graph data
- `region`: string | null - Geographic region identifier (optional)

**Display Mapping** (BenchmarkPage - Housing Cost sections):
- **First element** of `housingCost` array used for display (FR-015)
- Burdened Owners section: `burdenedOwnersPercentage`
- Burdened Renters section: `burdenedRentersPercentage`
- Working Class Housing Cost section: `workingClassHousingCost`
- Working Class Housing Graph section: `workingClassHousingGraph`
- Empty array shows "Data not available" placeholder (FR-016a)

**Relationships**:
- Belongs to DashboardResponse (array element)
- Contains GraphDataPoint sub-entities
- Only first element consumed for display

**Validation Rules**:
- Array may be empty (show placeholder per clarification #4)
- Percentages displayed as 0-100 range
- Currency formatting for costs
- Graph data may be null (graceful degradation)

---

### 9. GraphDataPoint (sub-entity)

**Purpose**: Individual data point for graph visualization

**Attributes**:
- `label`: string - X-axis label or category
- `value`: number - Y-axis value
- `timestamp`: number | null - Unix timestamp if time-series data (optional)
- `category`: string | null - Data category if categorical (optional)

**Relationships**:
- Belongs to HousingCost (nested in workingClassHousingGraph array)

**Validation Rules**:
- Label required for display
- Value must be numeric
- Null handling for optional fields

---

## Redux State Shape

The dashboard data is stored in Redux following this normalized structure:

```typescript
interface DashboardState {
  data: DashboardResponse | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null; // Unix timestamp for cache management
}
```

**State Management Rules**:
- `data` is null on initial load
- `loading` is true during API fetch
- `error` contains error message string on failure, null on success
- `lastFetched` timestamp used for refresh detection
- State updates are immutable via Redux Toolkit's Immer integration
- Single source of truth - no data duplication across tabs

---

## Data Flow

```
User Action (Click "Go to Dashboard")
  ↓
DashboardPage component dispatches fetchDashboard() thunk
  ↓
dashboardApi.getDashboard() makes HTTP GET request
  ↓
API responds with DashboardResponse JSON
  ↓
Redux store updates: loading=false, data=response, error=null
  ↓
RecommendationsPage selector reads: companyAtGlance, strategicRecommendations
BenchmarkPage selector reads: industryOverview, turnover*, rateOfSeparation, areaMedianWage[0], housingCost[0]
  ↓
Components render with formatted data
```

**Tab Switching**:
- No additional API calls (data cached in Redux)
- Components re-read from selector (memoized)
- Instant rendering (<100ms per SC-007)

**Page Refresh**:
- Redux state cleared (browser refresh)
- DashboardPage detects missing data
- Auto-dispatches fetchDashboard() (clarification #3)
- Loading state shown during re-fetch

---

## Null Handling Strategy

All numeric and string fields may be null/undefined. Display fallbacks:

| Field Type | Null Value Display |
|------------|-------------------|
| Numbers (workforce) | "N/A" or dash (—) |
| Currency | "N/A" or dash (—) |
| Percentages | "N/A" or dash (—) |
| Strings | Empty or "—" |
| Arrays (empty) | "Data not available" placeholder |
| Missing recommendation fields | Display available fields, hide missing |

This ensures layout stability and prevents rendering errors (FR-016, FR-016a).

---

## Summary

**Entity Count**: 9 entities (1 root, 8 subordinate)  
**Array Fields**: 3 (strategicRecommendations, areaMedianWage, housingCost)  
**Nullable Fields**: All fields may be null for graceful degradation  
**Relationships**: Hierarchical (DashboardResponse → child entities)  
**State Management**: Redux Toolkit with normalized state shape  
**Display Locations**: 2 pages (RecommendationsPage, BenchmarkPage)

**Data Model Complete**: Ready for contract generation (OpenAPI schema).

# Data Model: Conditional Industry API Call Based on Status Response

**Feature**: 009-industry-status-api  
**Date**: 2026-04-15

## Entities

### 1. FinchConnection (MODIFIED — existing entity)

Extend the existing `FinchConnection` interface with the `industry` field.

| Field | Type | Description |
|-------|------|-------------|
| id | `string` | Connection identifier (existing) |
| status | `FinchConnectionStatus` | Connection status (existing) |
| providerId | `string` | Provider identifier (existing) |
| lastSyncedAt | `string \| null` | Last sync timestamp (existing) |
| createdAt | `string` | Creation timestamp (existing) |
| **industry** | `"fetch" \| null` | **NEW** — Signals whether industry data is ready to be fetched |

**Validation**: `industry` is always present in the response. If missing or unexpected value, treat as `null`.

### 2. IndustryData (NEW)

Root entity returned by the Industry API. Contains all industry benchmark data.

| Field | Type | Description |
|-------|------|-------------|
| industryOverview | `IndustryOverview` | High-level industry metrics |
| industry | `IndustryTurnoverComparison` | Turnover rate breakdown (industry vs. company) |
| areaMedianWage | `AreaMedianWage` | Wage data across zip codes |
| housingBurden | `HousingBurden` | Housing cost burden across zip codes |

### 3. IndustryOverview

| Field | Type | Description |
|-------|------|-------------|
| turnoverRate | `{ rate: string; month: string; year: number }` | Current turnover rate with period |
| avgTurnover | `{ rate: number; sinceYear: number }` | Average turnover since a given year |
| industryWideCostOfTurnover | `{ amount: number; formatted: string; year: number }` | Industry-wide cost |
| rates | `{ hire: number; seperation: number }` | Hire/separation rates |

### 4. IndustryTurnoverComparison

| Field | Type | Description |
|-------|------|-------------|
| turnOverRate | `TurnoverBreakdown` | Voluntary/involuntary turnover (industry + company) |
| separationRate | `SeparationBreakdown` | Separation/hiring rates (industry + company) |

**TurnoverBreakdown**:

| Field | Type | Description |
|-------|------|-------------|
| industry | `{ involuntary: number; voluntary: number }` | Industry averages |
| company | `{ involuntary: number; voluntary: number }` | Company-specific values |

**SeparationBreakdown**:

| Field | Type | Description |
|-------|------|-------------|
| industry | `{ seperation: number; hiring: number }` | Industry averages |
| company | `{ seperation: number; hiring: number }` | Company-specific values |

### 5. AreaMedianWage

| Field | Type | Description |
|-------|------|-------------|
| availableZipcodes | `string[]` | Zip codes with data available |
| nationalAvgSalary | `number` | National average salary |
| companyMedianHourlyWage | `number` | Company's median hourly wage |
| companyGraph | `{ salary: number; hourly: number }` | Company graph data |
| stateData | `StateWageData[]` | Per-zipcode wage data |

**StateWageData**:

| Field | Type | Description |
|-------|------|-------------|
| zipcode | `string` | Zip code identifier |
| city | `string` | City, State display name |
| medianLivingWage | `number` | Median living wage for the area |
| graph | `{ state: SalaryHourly; national: SalaryHourly }` | State vs national comparison |
| avgSalary | `{ salary: number; year: number }` | Average salary with year |

**SalaryHourly**: `{ salary: number; hourly: number }`

### 6. HousingBurden

| Field | Type | Description |
|-------|------|-------------|
| availableZipcodes | `string[]` | Zip codes with data available |
| data | `HousingBurdenEntry[]` | Per-zipcode housing data |

**HousingBurdenEntry**:

| Field | Type | Description |
|-------|------|-------------|
| zipcode | `string` | Zip code identifier |
| city | `string` | City, State display name |
| owners | `HousingTenureData` | Owner housing burden data |
| renters | `HousingTenureData` | Renter housing burden data |
| workingClass | `WorkingClassData` | Working class housing data |

**HousingTenureData**:

| Field | Type | Description |
|-------|------|-------------|
| period | `{ quarter: number; year: number }` | Reporting period |
| burdened | `{ metroArea: number; yourEmployees: number }` | Burdened percentages |
| severelyBurdened | `{ metroArea: number; yourEmployees: number }` | Severely burdened percentages |

**WorkingClassData**:

| Field | Type | Description |
|-------|------|-------------|
| homeOwnershipRate | `number` | Home ownership percentage |
| medianHomeValue | `number` | Median home value in USD |
| medianRent | `number` | Median rent in USD |
| graph | `WorkingClassGraphEntry[]` | Income distribution graph data |

**WorkingClassGraphEntry**:

| Field | Type | Description |
|-------|------|-------------|
| incomeCategory | `string` | Category key (e.g., `"lowIncome"`) |
| label | `string` | Display label |
| range | `string` | Income range description |
| burdened | `number` | Burdened percentage |
| severelyBurdened | `number` | Severely burdened percentage |

### 7. IndustryState (Redux slice state)

| Field | Type | Description |
|-------|------|-------------|
| data | `IndustryData \| null` | Fetched industry data |
| loading | `boolean` | Whether fetch is in progress |
| error | `string \| null` | Error message if fetch failed |
| isLoaded | `boolean` | Whether data has been successfully loaded (for session caching) |

## State Transitions

```
[Initial State]  data=null, loading=false, isLoaded=false
       │
       ▼  (user clicks Industry/Finch Industry tab AND industry === "fetch" AND !isLoaded)
[Fetching]       data=null, loading=true, isLoaded=false
       │
       ├── success ──▶ [Loaded]  data=IndustryData, loading=false, isLoaded=true
       │
       └── failure ──▶ [Error]   data=null, loading=false, error="...", isLoaded=false
       │
       ▼  (logout action dispatched)
[Reset → Initial State]
```

## Relationships

- `FinchConnection.industry` → drives whether `IndustryState` transitions from Initial to Fetching
- `IndustryState.data` → consumed by `BenchmarkPage` and `BenchmarkFinchPage` via selectors
- `IndustryState.loading` → drives skeleton loader visibility in both pages
- `IndustryState.isLoaded` → prevents re-fetch on tab re-activation (session cache)

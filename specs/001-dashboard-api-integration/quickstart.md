# Quickstart Guide: Dashboard API Integration

**Feature**: 001-dashboard-api-integration  
**Target Audience**: Developers implementing the dashboard API integration  
**Est. Time**: 30 minutes (reading + setup)

## Overview

This guide provides a quick introduction to implementing the Dashboard API integration feature. It covers the essential steps to add GET /dashboard API support to the WorkQuality Platform frontend.

---

## Prerequisites

Before starting, ensure you have:

- [x] Node.js 18+ and pnpm installed
- [x] Project cloned and dependencies installed (`pnpm install`)
- [x] Access to the API documentation (see `contracts/dashboard-api.yaml`)
- [x] Read the [feature specification](./spec.md) and [data model](./data-model.md)
- [x] Familiarity with Redux Toolkit patterns (review `src/store/slices/authSlice.ts`)

---

## Quick Architecture Overview

```
User clicks "Go to Dashboard"
        ↓
DashboardPage.tsx
   dispatches → fetchDashboard() thunk (dashboardSlice.ts)
                        ↓
                   dashboardApi.getDashboard() (axios HTTP GET)
                        ↓
                   API Response (DashboardResponse JSON)
                        ↓
                   Redux Store updated (data + loading + error state)
                        ↓
        ┌───────────────┴────────────────┐
        ↓                                 ↓
RecommendationsPage.tsx          BenchmarkPage.tsx
(selects companyAtGlance,        (selects industryOverview,
 strategicRecommendations)        turnover metrics, wages,
                                  housing cost data)
```

**Key Points**:
- Single API call on dashboard load
- Redux stores complete response
- Both tabs read from same Redux state (no duplicate API calls)
- Auto-reload on page refresh

---

## Implementation Checklist

### Phase 1: Types & Contracts (TDD Foundation)

1. **✅ Create TypeScript interfaces** (`src/types/dashboardTypes.ts`)
   - **Status**: Implemented with 10 interfaces
   - **Files**: [src/types/dashboardTypes.ts](../../../src/types/dashboardTypes.ts)
   - **Key interfaces**: `DashboardResponse`, `CompanyAtGlance`, `StrategicRecommendation`, `IndustryOverview`, `TurnoverMetrics`, `SeparationMetrics`, `AreaMedianWage`, `HousingCost`, `GraphDataPoint`, `DashboardState`
   - Reference: `contracts/dashboard-api.yaml`
   - All fields nullable for graceful degradation per FR-016

---

### Phase 2: API Service Layer

2. **✅ Create API service** (`src/services/api/dashboardApi.ts`)
   - **Status**: Implemented with `getDashboard()` function
   - **Files**: [src/services/api/dashboardApi.ts](../../../src/services/api/dashboardApi.ts)
   - **Features**:
     - 30-second timeout (per spec clarification #1)
     - Bearer token authentication from localStorage
     - Error message extraction and user-friendly error handling
     - ECONNABORTED detection for timeout errors
   - Pattern: Follows `authApi.ts` structure

3. **✅ Write API service tests** (`tests/services/dashboardApi.test.ts`)
   - **Status**: Implemented with 8 test cases
   - **Files**: [tests/services/dashboardApi.test.ts](../../../tests/services/dashboardApi.test.ts)
   - **Coverage**:
     - ✅ Successful fetch with proper Authorization header
     - ✅ 30-second timeout verification
     - ✅ No auth token error handling
     - ✅ Timeout error (ECONNABORTED)
     - ✅ 401 unauthorized error
     - ✅ 500 server error
     - ✅ Network error handling
   - **Note**: Test infrastructure (vitest) needs to be configured in project

---

### Phase 3: Redux State Management

4. **✅ Create Redux slice** (`src/store/slices/dashboardSlice.ts`)
   - **Status**: Implemented with async thunk and reducers
   - **Files**: [src/store/slices/dashboardSlice.ts](../../../src/store/slices/dashboardSlice.ts)
   - **State shape**: `{ data: DashboardResponse | null, loading: boolean, error: string | null, lastFetched: number | null }`
   - **Async thunk**: `fetchDashboard` - calls `getDashboard()` API
   - **Reducers**:
     - `clearDashboard` - resets data, error, and lastFetched
     - `clearDashboardError` - clears only error (for retry flows)
   - **Extra reducers**: Handles pending/fulfilled/rejected states
   - Pattern: Follows `authSlice.ts` and `profileSlice.ts`

5. **✅ Create selectors** (`src/store/selectors/dashboardSelectors.ts`)
   - **Status**: Implemented with 13 typed selectors
   - **Files**: [src/store/selectors/dashboardSelectors.ts](../../../src/store/selectors/dashboardSelectors.ts)
   - **Selectors**:
     - `selectDashboardData`, `selectDashboardLoading`, `selectDashboardError`, `selectLastFetched`
     - `selectCompanyAtGlance` - for company metrics
     - `selectStrategicRecommendations` - **memoized with sort by order ascending**
     - `selectIndustryOverview`, `selectTurnoverMetrics`, `selectSeparationMetrics`
     - `selectAreaMedianWage`, `selectPrimaryAreaMedianWage` - selects first element
     - `selectHousingCost`, `selectPrimaryHousingCost` - selects first element
   - **Memoization**: Uses `createSelector` for `selectStrategicRecommendations`
   - **Null safety**: All selectors handle null data gracefully

6. **✅ Register reducer in store** (`src/store/store.ts`)
   - **Status**: Implemented - dashboardReducer registered
   - **Files**: [src/store/store.ts](../../../src/store/store.ts)
   - **Changes**: Added `dashboard: dashboardReducer` to rootReducer and RootState type

7. **✅ Write Redux tests** (`tests/store/dashboardSlice.test.ts`)
   - **Status**: Implemented with 7 test cases
   - **Files**: [tests/store/dashboardSlice.test.ts](../../../tests/store/dashboardSlice.test.ts)
   - **Coverage**:
     - ✅ Initial state verification
     - ✅ `clearDashboard` reducer resets all data
     - ✅ `clearDashboardError` only clears error
     - ✅ `fetchDashboard.pending` sets loading and clears error
     - ✅ `fetchDashboard.fulfilled` sets data, lastFetched, clears error
     - ✅ `fetchDashboard.rejected` sets error message
     - ✅ Retry scenario (pending clears previous error)
   - **Note**: Test infrastructure (vitest) needs to be configured in project

---

### Phase 4: Utility Functions

8. **✅ Create formatters** (`src/utils/formatters.ts`)
   - **Status**: Implemented with 5 locale-aware formatters
   - **Files**: [src/utils/formatters.ts](../../../src/utils/formatters.ts)
   - **Functions**:
     - `formatNumber(value)` - formats with commas (e.g., 1250 → "1,250")
     - `formatCurrency(value)` - formats as USD without cents (e.g., 52000 → "$52,000")
     - `formatCurrencyWithCents(value)` - formats as USD with cents (e.g., 18.5 → "$18.50")
     - `formatPercentage(value)` - formats as percentage (e.g., 22.5 → "22.5%")
     - `formatCompactNumber(value)` - formats in compact form (e.g., 1500000 → "1.5M")
   - **Implementation**: Uses native `Intl.NumberFormat` API (zero dependencies)
   - **Null handling**: All formatters return "N/A" for null/undefined values
     return new Intl.NumberFormat('en-US', {
       style: 'currency',
       currency: 'USD',
       minimumFractionDigits: 0,
     }).format(value);
   };
   ```
   - Locale-aware: Uses Intl.NumberFormat API
   - Null handling: Returns "N/A" for missing values

10. **Write formatter tests** (`src/utils/formatters.test.ts`)
    - Test number formatting (1250 → "1,250")
    - Test currency formatting (52000 → "$52,000")
    - Test null handling (null → "N/A")
    - Test edge cases (0, negative, very large numbers)

---

### Phase 5: UI Integration

9. **✅ Update DashboardPage** (`src/pages/dashboard/DashboardPage.tsx`)
   - **Status**: Implemented with fetch on mount and error handling
   - **Files**: [src/pages/dashboard/DashboardPage.tsx](../../../src/pages/dashboard/DashboardPage.tsx)
   - **Implementation**:
     - Dispatches `fetchDashboard()` in `useEffect` when `completionCount === 4` (existing logic)
     - Displays `<LoadingSpinner />` while `dashboardLoading` is true
     - Shows error with retry button when `dashboardError` is present
     - Retry button dispatches `fetchDashboard()` again (changes text to "Retrying..." while loading)
     - Conditionally renders Tabs with RecommendationsPage/BenchmarkPage when data is loaded
   - **Pattern**: Follows existing component patterns with `useAppSelector` and `useAppDispatch`

10. **✅ Update RecommendationsPage** (`src/pages/recommendations/RecommendationsPage.tsx`)
    - **Status**: Fully integrated with Redux selectors
    - **Files**: [src/pages/recommendations/RecommendationsPage.tsx](../../../src/pages/recommendations/RecommendationsPage.tsx)
    - **Data sources**:
      - `selectCompanyAtGlance` for totalWorkforce, averageHourlyWage, averageSalary
      - `selectStrategicRecommendations` for sorted recommendations (by order)
    - **Formatters applied**:
      - `formatNumber(totalWorkforce)` → "1,250"
      - `formatCurrencyWithCents(averageHourlyWage)` → "$18.50"
      - `formatCurrency(averageSalary)` → "$52,000"
    - **Null handling**: All values use ternary operators `data ? formatter(data.value) : "N/A"`
    - **Empty array handling**: Recommendations map over sorted array (selector returns [] if null)

11. **✅ Update BenchmarkPage** (`src/pages/benchmark/BenchmarkPage.tsx`)
    - **Status**: Fully integrated with Redux selectors
    - **Files**: [src/pages/benchmark/BenchmarkPage.tsx](../../../src/pages/benchmark/BenchmarkPage.tsx)
    - **Data sources**:
      - `selectIndustryOverview` for turnoverRate, avgTurnover, avgCostOfTurnover
      - `selectTurnoverMetrics` for voluntaryPercentage, involuntaryPercentage
      - `selectSeparationMetrics` for separationRate, separationCount
      - `selectPrimaryAreaMedianWage` for first areaMedianWage element
      - `selectPrimaryHousingCost` for first housingCost element
    - **Formatters applied**:
      - Industry Overview: `formatPercentage(turnoverRate)`, `formatNumber(avgTurnover)`, `formatCurrency(avgCostOfTurnover)`
      - Turnover: `formatPercentage(voluntaryPercentage)`, `formatPercentage(involuntaryPercentage)`
      - Separation: `formatPercentage(separationRate)`, `formatNumber(separationCount)`
      - Housing Cost: `formatPercentage(burdenedOwnersPercentage)`, `formatPercentage(burdenedRentersPercentage)`
    - **Null handling**: All values use ternary operators for graceful degradation
    - **Array handling**: Uses `selectPrimaryAreaMedianWage` and `selectPrimaryHousingCost` to safely get first element

---

### Phase 6: Testing Implementation

12. **✅ Write component tests**
    - **DashboardErrorHandling.test.tsx**: [tests/pages/DashboardErrorHandling.test.tsx](../../../tests/pages/DashboardErrorHandling.test.tsx)
      - ✅ Timeout error display and retry
      - ✅ 500 server error display and retry
      - ✅ Network error display and retry
      - ✅ Retry button click dispatches fetchDashboard
      - ✅ Loading state during retry ("Retrying..." text)
    
    - **RecommendationsPage.test.tsx**: [tests/pages/RecommendationsPage.test.tsx](../../../tests/pages/RecommendationsPage.test.tsx)
      - ✅ Formatted number display (1,250)
      - ✅ Formatted currency with cents ($18.50)
      - ✅ Formatted currency without cents ($52,000)
      - ✅ Strategic recommendations sorted by order ascending
      - ✅ N/A display when companyAtGlance is null
      - ✅ Empty recommendations array handling
      - ✅ Null individual fields handling
    
    - **BenchmarkPage.test.tsx**: [tests/pages/BenchmarkPage.test.tsx](../../../tests/pages/BenchmarkPage.test.tsx)
      - ✅ Formatted industry overview metrics (22.5%, 1.5M, 980K)
      - ✅ N/A when industryOverview is null
      - ✅ Formatted turnover percentages (62.5%, 37.5%)
      - ✅ N/A when turnover metrics are null
      - ✅ Formatted separation rate and count
      - ✅ Empty areaMedianWage array handling
      - ✅ First areaMedianWage element display
      - ✅ Formatted housing cost percentages
      - ✅ Empty housingCost array handling
      - ✅ Null dashboard data handling

---

## Testing Your Implementation

### Local Development

1. **Start dev server**:
   ```bash
   pnpm dev
   ```

2. **Test the flow**:
   - Complete Goals assessment
   - Click "Go to Dashboard" button
   - Verify API call in Network tab (should be exactly 1 call)
   - Check Redux DevTools for state updates
   - Switch between Recommendations and Benchmark tabs (no additional API calls)
   - Refresh page (should auto-reload data)

3. **Test edge cases**:
   - Mock empty `strategicRecommendations` array → "No recommendations available"
   - Mock empty `areaMedianWage` array → "Data not available" placeholder
   - Mock null numeric values → "N/A" display
   - Simulate network error → Error message + Retry button
   - Simulate slow network (30s+ timeout) → Timeout error

4. **Run tests**:
   ```bash
   pnpm test
   pnpm run type-check
   pnpm lint:fix
   pnpm format
   ```

---

## Performance Verification

Verify success criteria:

- [ ] **SC-001**: Dashboard loads within 3 seconds (Network tab)
- [ ] **SC-002**: Only 1 network request (Network tab, filter by `/dashboard`)
- [ ] **SC-007**: Tab switching < 100ms (Performance tab)
- [ ] **SC-008**: No layout shifts or styling regressions (visual inspection)

---

## Common Pitfalls

⚠️ **Don't**:
- Call API on every tab switch (store in Redux!)
- Modify UI/styling/layouts (preserve existing design)
- Add new libraries (use existing axios, Redux Toolkit)
- Forget null handling (all fields may be null)
- Skip testing (TDD required by constitution)

✅ **Do**:
- Follow existing patterns (authSlice, profileSlice, authApi)
- Use typed selectors for state access
- Format numbers with Intl.NumberFormat
- Handle empty arrays with placeholders
- Write tests before implementation

---

## Next Steps

After completing implementation:

1. **Review Constitution Compliance** (`.specify/memory/constitution.md`)
   - Component-first architecture
   - Test-driven development
   - Type safety
   - Performance standards

2. **Run Full Test Suite**:
   ```bash
   pnpm test
   pnpm run type-check
   pnpm lint:fix
   ```

3. **Submit Pull Request**:
   - Reference spec and plan in PR description
   - Include screenshots of successful data load
   - Note any deviations from spec (should be none)

4. **Review Checklist**:
   - All tests passing ✅
   - No TypeScript errors ✅
   - Performance goals met ✅
   - Constitution principles satisfied ✅

---

## Additional Resources

- **Feature Spec**: [spec.md](./spec.md) - User stories and requirements
- **Data Model**: [data-model.md](./data-model.md) - Entity definitions
- **API Contract**: [contracts/dashboard-api.yaml](./contracts/dashboard-api.yaml) - OpenAPI schema
- **Research**: [research.md](./research.md) - Technical decisions
- **Constitution**: `.specify/memory/constitution.md` - Project principles
- **Existing Patterns**:
  - API: `src/services/api/authApi.ts`
  - Redux: `src/store/slices/authSlice.ts`, `src/store/slices/profileSlice.ts`
  - Components: `src/pages/dashboard/DashboardPage.tsx`

---

**Estimated Effort**: 6-8 hours for full TDD implementation + testing

**Questions?** Review the [spec clarifications](./spec.md#clarifications) or consult the team.

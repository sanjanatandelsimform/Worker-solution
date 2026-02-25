# Research: Dashboard API Integration

**Feature**: 001-dashboard-api-integration  
**Date**: 2026-02-24  
**Status**: Complete

## Overview

This document captures technical research for integrating the GET /dashboard API into the existing React application. All technical decisions follow established patterns from the codebase (authApi.ts, authSlice.ts, profileSlice.ts) to ensure consistency and maintainability.

## Research Areas

### 1. API Service Pattern

**Decision**: Follow existing axios-based API service pattern from authApi.ts and profileApi.ts

**Rationale**:
- Existing codebase uses axios 1.13.2 for HTTP requests (see package.json)
- Patterns are well-established in authApi.ts, profileApi.ts, assessmentApi.ts
- Centralizes API configuration (base URL, headers, interceptors)
- Provides consistent error handling across all API calls
- TypeScript interfaces ensure type-safe request/response handling

**Implementation Pattern**:
```typescript
// src/services/api/dashboardApi.ts
import axios from 'axios';
import { DashboardResponse } from '@/types/dashboardTypes';

const API_BASE_URL = process.env.VITE_API_BASE_URL;

export const dashboardApi = {
  getDashboard: async (): Promise<DashboardResponse> => {
    const response = await axios.get<DashboardResponse>(
      `${API_BASE_URL}/dashboard`,
      { timeout: 30000 } // 30-second timeout per spec clarifications
    );
    return response.data;
  },
};
```

**Alternatives Considered**:
- **Fetch API**: Rejected - requires manual timeout handling and error parsing; axios provides these out-of-box
- **React Query**: Rejected - would require new library (violates FR-018: no new dependencies)
- **Custom fetch wrapper**: Rejected - duplicates axios functionality already in use

---

### 2. Redux State Management Pattern

**Decision**: Use Redux Toolkit with async thunk pattern matching authSlice.ts and profileSlice.ts

**Rationale**:
- Redux Toolkit 2.11.2 already configured in project (see package.json)
- Existing slices (authSlice, profileSlice, userSlice) provide proven patterns
- createAsyncThunk handles loading/error states automatically
- Immer integration ensures immutable updates without boilerplate
- Typed selectors provide type-safe state access across components
- Centralized state prevents prop drilling across Dashboard → Recommendations/Benchmark

**Implementation Pattern**:
```typescript
// src/store/slices/dashboardSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardApi } from '@/services/api/dashboardApi';
import { DashboardResponse } from '@/types/dashboardTypes';

interface DashboardState {
  data: DashboardResponse | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardApi.getDashboard();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: { data: null, loading: false, error: null, lastFetched: null },
  reducers: {
    clearDashboard: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
```

**Alternatives Considered**:
- **Component-local state (useState)**: Rejected - requires prop passing through DashboardPage → tabs; causes re-renders on tab switches
- **Context API**: Rejected - less performant for frequent updates; Redux already integrated
- **React Query**: Rejected - new dependency (violates FR-018)

---

### 3. Number and Currency Formatting

**Decision**: Use Intl.NumberFormat API for locale-aware formatting with thousand separators and currency display

**Rationale**:
- Native browser API (no dependencies, zero bundle size increase)
- Automatic locale detection via `navigator.language`
- Handles thousand separators, decimal points, currency symbols correctly per locale
- Specification requires locale-aware formatting with currency (clarification #5)
- Consistent with modern web standards and accessibility best practices

**Implementation Pattern**:
```typescript
// src/utils/formatters.ts
export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatCurrencyWithCents = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
```

**Usage Examples**:
- `totalWorkforce: 1250` → "1,250"
- `averageHourlyWage: 18.50` → "$18.50"
- `averageSalary: 52000` → "$52,000"

**Alternatives Considered**:
- **Manual string manipulation**: Rejected - error-prone, doesn't handle locales, requires maintenance
- **Third-party library (numeral.js, accounting.js)**: Rejected - violates FR-018 (no new dependencies)
- **Template literals with regex**: Rejected - doesn't handle edge cases, less maintainable

---

### 4. Error Handling Strategy

**Decision**: Use existing errorHandler utility with manual retry UI button

**Rationale**:
- Existing `src/utils/errorHandler.ts` provides centralized error processing
- Manual retry (clarification #2) gives users control and prevents endless retry loops
- Consistent with existing error handling in authSlice, profileSlice
- Clear user feedback via error messages + retry button meets UX standards

**Implementation Pattern**:
```typescript
// In component
const handleRetry = () => {
  dispatch(fetchDashboard());
};

// In render
{error && (
  <div className="error-container">
    <p className="error-message">{error}</p>
    <button onClick={handleRetry} className="retry-button">
      Retry
    </button>
  </div>
)}
```

**Alternatives Considered**:
- **Automatic retry with exponential backoff**: Rejected - clarification #2 specifies manual retry
- **Toast notifications**: Rejected - would require new library or custom implementation; inline error more appropriate for critical flow
- **Error boundary only**: Rejected - needs user-actionable retry mechanism

---

### 5. Loading State Management

**Decision**: Display loading spinner from existing LoadingSpinner component during API fetch

**Rationale**:
- Existing `src/components/common/LoadingSpinner.tsx` provides consistent loading UX
- 30-second timeout (clarification #1) ensures users aren't waiting indefinitely
- Loading state in Redux automatically managed by createAsyncThunk
- Meets FR-004 requirement for loading indicator during API calls

**Implementation Pattern**:
```typescript
// In DashboardPage.tsx
{loading && <LoadingSpinner />}
{!loading && data && <TabContent data={data} />}
```

**Alternatives Considered**:
- **Skeleton screens**: Rejected - requires UI changes (violates FR-017)
- **Progress bar**: Rejected - API response time unpredictable, spinner more appropriate
- **Inline spinners per section**: Rejected - data fetched as single unit, one loading state sufficient

---

### 6. Data Refresh Strategy

**Decision**: Auto-reload dashboard data from API on page refresh (clarification #3)

**Rationale**:
- Ensures users always see fresh data after browser refresh
- API call is fast (<3s per SC-001), minimal UX impact
- Prevents stale data issues from cached state
- Consistent with user expectations for data-driven applications

**Implementation Pattern**:
```typescript
// In DashboardPage.tsx
useEffect(() => {
  if (!data || shouldRefresh) {
    dispatch(fetchDashboard());
  }
}, [dispatch, data]);
```

**Alternatives Considered**:
- **Persist to localStorage**: Rejected - clarification #3 specifies auto-reload for freshness
- **Redirect to entry point**: Rejected - poor UX; users expect to stay on dashboard
- **Stale-while-revalidate**: Rejected - adds complexity; simple refresh sufficient

---

### 7. Empty Array Handling

**Decision**: Display sections with "Data not available" placeholder when arrays are empty (clarification #4)

**Rationale**:
- Maintains consistent layout structure (prevents shifting/jumping)
- Clear communication to users that feature exists but data unavailable
- Prevents confusion from disappearing sections
- Meets FR-016a requirement

**Implementation Pattern**:
```typescript
{areaMedianWage.length > 0 ? (
  <WageSection data={areaMedianWage[0]} />
) : (
  <div className="placeholder">Data not available</div>
)}
```

**Alternatives Considered**:
- **Hide sections completely**: Rejected - clarification #4 specifies show with placeholder
- **Show empty structure**: Rejected - less clear than explicit message
- **Collapsible placeholder**: Rejected - adds UI complexity (violates FR-017)

---

## Summary of Key Decisions

| Area | Decision | Primary Justification |
|------|----------|----------------------|
| API Service | axios with existing pattern | Consistency with authApi.ts, profileApi.ts |
| State Management | Redux Toolkit async thunks | Existing infrastructure, proven pattern |
| Formatting | Intl.NumberFormat API | Native API, zero dependencies, locale-aware |
| Error Handling | Manual retry button | Clarification #2, user control |
| Loading State | LoadingSpinner component | Existing component, consistent UX |
| Page Refresh | Auto-reload API data | Clarification #3, data freshness |
| Empty Arrays | Show placeholder message | Clarification #4, layout consistency |

---

## Dependencies Required

**No new dependencies needed.**

All functionality implemented using:
- Existing: @reduxjs/toolkit, axios, react, react-router-dom
- Native browser APIs: Intl.NumberFormat
- Existing utilities: errorHandler, LoadingSpinner

This satisfies FR-018: "System MUST NOT introduce new third-party libraries or dependencies."

---

## Performance Considerations

**Bundle Impact**: Minimal (~5KB gzipped)
- New files: dashboardApi.ts (~1KB), dashboardSlice.ts (~2KB), dashboardTypes.ts (~1KB), formatters.ts (~0.5KB), selectors (~0.5KB)
- No new dependencies added
- Well within performance goal: <200KB bundle chunk

**Runtime Performance**:
- API call: <3s target (SC-001)
- Tab switching: <100ms via Redux cached data (SC-007)
- Formatting: Intl.NumberFormat caches formatters, negligible overhead

---

## Testing Strategy

Tests will cover:
1. **Unit Tests**: dashboardApi service, formatters utility, Redux slice reducers
2. **Integration Tests**: async thunk actions with mock axios responses
3. **Component Tests**: DashboardPage with loading/error/success states, RecommendationsPage/BenchmarkPage with mock data
4. **Selector Tests**: dashboard selectors return correctly shaped data

Follows existing test patterns in authSlice.test.ts and component test structure.

---

**Research Complete**: All technical approaches defined. Ready to proceed to Phase 1 (data modeling and contracts).

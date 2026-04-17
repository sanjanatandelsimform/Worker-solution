# Research: Conditional Industry API Call Based on Status Response

**Feature**: 009-industry-status-api  
**Date**: 2026-04-15  
**Status**: Complete

## Research Tasks

### R1: How does the existing Finch Status API + Redux flow work?

**Decision**: Extend the existing `finchStatusSlice` / `useFinchStatus` pattern to expose `connection.industry`.

**Rationale**: The `/finch/status` endpoint is already polled every 15 seconds via `useFinchStatus` → `fetchFinchStatus` thunk → `finchStatusSlice`. The `FinchConnection` type in `finchStatusTypes.ts` needs a single new field: `industry: "fetch" | null`. The `connection` object is already stored in Redux at `state.finchStatus.connection`. No new endpoint, no new polling — just read the field.

**Alternatives considered**:
- New `/status` endpoint: Rejected — adds unnecessary infrastructure when existing endpoint is being extended.
- Assessment status endpoint: Rejected — different domain; assessment status tracks question completion, not data readiness.

### R2: What is the established API calling pattern (Profile Settings reference)?

**Decision**: Follow the `service → createAsyncThunk → slice → selector → hook → component` pattern.

**Rationale**: The codebase consistently uses this pattern across all features:
- `dashboardApi.ts` → `getDashboard()` → `dashboardSlice.ts` → `fetchDashboard` thunk → `dashboardSelectors.ts` → consumed in components via `useAppSelector`.
- `finchApi.ts` → `getFinchStatus()` → `finchStatusSlice.ts` → `fetchFinchStatus` thunk → `finchStatusSelectors.ts` → `useFinchStatus` hook.
- `profileApi.ts` → `updateProfileData()` → `profileSlice.ts` → `updateProfileData` thunk → `profileSelectors.ts` → consumed in components.

The Industry API will follow the same pattern: `industryApi.ts` → `industrySlice.ts` → `industrySelectors.ts` → `useIndustry` hook.

**Alternatives considered**:
- React Query: Rejected per constitution — this project uses Redux Toolkit for server state (established pattern). Mixing in React Query would add a second state management paradigm.
- Direct `useEffect` + local state in component: Rejected — doesn't support session-scoped caching or deduplication across tabs.

### R3: How do BenchmarkPage and BenchmarkFinchPage currently consume data?

**Decision**: Both pages read from `state.dashboard.data` via Redux selectors. The new industry data will be stored in a separate `state.industry` slice with its own selectors. Pages will switch from reading industry data from `dashboardSelectors` to reading from `industrySelectors`.

**Rationale**: Currently `BenchmarkPage` uses:
- `selectIndustryOverview(state)` → `state.dashboard.data?.industryOverview`
- `selectZipCodes(state)` → zip codes from dashboard data
- `selectIndustry(state)` → `state.dashboard.data?.industry` (code/name)
- `selectDashboardData(state)` → full dashboard data including `areaMedianWage`, `housingCost`

The new Industry API returns a different, richer payload than what's currently in the dashboard response. The industry data from the new API will populate the new `state.industry` slice. The existing skeleton components (`OverviewCardSkeleton`, `TurnoverRateCardSkeleton`, `SalaryHourlySkeleton`, etc.) already exist in the file for exactly this purpose — they're currently shown for 5 seconds via a `setTimeout` timer. The timer will be replaced with actual API loading state.

**Alternatives considered**:
- Store industry data inside `dashboardSlice`: Rejected — industry data has its own fetch lifecycle (conditional on status) and caching behavior (session-scoped). Mixing it into dashboard state would complicate the slice.
- Create a new `benchmarkSlice`: Rejected — the data is "industry" data, not "benchmark" data. Naming matters for long-term maintainability.

### R4: How should the conditional fetch be triggered?

**Decision**: Create a `useIndustry` hook that accepts the `connection.industry` value and triggers `fetchIndustry` when `industry === "fetch"` and data hasn't been loaded yet. The hook returns `{ data, isLoading, error, isLoaded }`.

**Rationale**: The hook encapsulates:
1. Reading `connection.industry` from the finch status state
2. Dispatching `fetchIndustry()` when `industry === "fetch"` and `!isLoaded`
3. Returning loading/data/error state for the consuming component

This aligns with how `useFinchStatus` works (hook wraps dispatch + selector reads). The hook is called inside `BenchmarkPage` and `BenchmarkFinchPage`. Since both are rendered inside `<Tabs.Panel>` which only mounts the active panel, the hook naturally triggers on tab activation.

**Alternatives considered**:
- Trigger fetch in `DashboardPage` and pass data as props: Rejected — over-couples the parent to the child's data needs. The tab panels are direct children but should manage their own data fetching.
- Trigger fetch on all tab items regardless of which tab is active: Rejected — unnecessary API calls; spec requires conditional fetch only when tab is activated.

### R5: Session-scoped caching strategy

**Decision**: Use an `isLoaded` flag in the industry slice. Once `fetchIndustry.fulfilled`, set `isLoaded = true`. The `useIndustry` hook skips dispatch when `isLoaded === true`. The slice resets on logout (via `addMatcher` for logout actions, matching `finchStatusSlice` pattern).

**Rationale**: This exactly matches `dashboardSlice.ts` which uses `isLoaded: boolean` + `lastFetched: number | null` for the same purpose. Simplest approach; no TTL or re-validation needed per spec clarification (session-scoped, survives polling changes).

**Alternatives considered**:
- TTL-based cache with `lastFetched` timestamp: Rejected — spec explicitly states session-scoped, no re-fetch on status change.
- Store in localStorage: Rejected — no persistence requirements; Redux store is sufficient.

### R6: Extending FinchConnection type with `industry` field

**Decision**: Add `industry: "fetch" | null` to the `FinchConnection` interface in `finchStatusTypes.ts`. Add a new selector `selectFinchIndustryStatus` in `finchStatusSelectors.ts`.

**Rationale**: Minimal change to existing types. The field is optional in the sense that it can be `null`, but it's always present in the response shape (either `"fetch"` or `null`). No changes needed to the finch status slice or API service — the existing `getFinchStatus()` already returns the full connection object; adding a field to the type is sufficient.

**Alternatives considered**:
- Create a separate type for the extended response: Rejected — over-engineering for a single field addition.

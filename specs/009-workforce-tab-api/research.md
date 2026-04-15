# Research: Dashboard Workforce Tab API Integration

**Branch**: `009-workforce-tab-api` | **Date**: 2026-04-14

This document resolves every unknown identified in the Technical Context section of `plan.md`. No NEEDS CLARIFICATION items remain after this phase.

---

## Decision 1: HTTP Client & Token Pattern

**Decision**: Reuse `apiClient` (axios instance) from `src/services/api/authApi.ts` with the same token-from-localStorage pattern used by `dashboardApi.ts`.

**Rationale**: Every API service in this codebase (`dashboardApi.ts`, `profileApi.ts`, `finchApi.ts`) follows the same pattern: extract `accessToken` from `localStorage.getItem("userDetail")` → `auth.tokens.accessToken`, then pass it as `Authorization: Bearer <token>` on the request. Deviating would create inconsistency and require separate interceptor maintenance.

**Alternatives considered**: React Query with a shared query client — rejected because the entire codebase uses Redux Toolkit async thunks for server state; mixing patterns adds cognitive overhead without benefit.

---

## Decision 2: Static Data Toggle Strategy

**Decision**: The `fetchWorkforce` thunk inside `workforceSlice.ts` will immediately return a `STATIC_WORKFORCE_DATA` constant (typed as `WorkforceResponse`) that mirrors the exact API response schema. The real `await getWorkforce()` call is present but commented out immediately below, with a migration comment.

**Implementation pattern**:

```typescript
// TODO: Remove static data block and uncomment the API call below when BE is live
const STATIC_WORKFORCE_DATA: WorkforceResponse = { /* full dataset */ };

export const fetchWorkforce = createAsyncThunk<WorkforceResponse, void, { rejectValue: string }>(
  "workforce/fetchWorkforce",
  async (_, { rejectWithValue }) => {
    try {
      // Static data — remove when backend is live:
      return STATIC_WORKFORCE_DATA;

      // Live API call — uncomment when backend is live:
      // const response = await getWorkforce();
      // return response;
    } catch (error) { ... }
  }
);
```

**Rationale**: The entire toggle lives in one function in one file. No env variables to configure, no build flags, no conditional imports. A single diff removes the static block and uncomments one line.

**Alternatives considered**: `USE_STATIC_DATA` boolean constant in `workforceApi.ts` — rejected by user preference; env variable `VITE_WORKFORCE_USE_STATIC` — rejected by user preference.

---

## Decision 3: Fetch Trigger Location & Pattern

**Decision**: `fetchWorkforce` is dispatched from `DashboardPage.tsx` on every mount, inside the existing `fetchWithModal` async function, alongside `fetchDashboard`. Workforce fetch failures do NOT block the dashboard loading flow — they are surfaced exclusively inside `WorkforcePage.tsx`.

**Rationale**: The user confirmed "we need to call the workforce API when user comes to the dashboard screen." The existing `hasRunDashboardFetchRef` guard means the first render dispatches both. Keeping workforce errors non-blocking avoids a regression in the main dashboard UX when the workforce endpoint is temporarily unavailable.

**Implementation note**: In the `fetchWithModal` async function, add `dispatch(fetchWorkforce())` as a fire-and-forget call (no `await`, no result matching). `WorkforcePage` handles its own error state.

---

## Decision 4: Department Dropdown Options

**Decision**: Dropdown options in `WorkforcePage.tsx` (the "Department" selector in the Demographics section) are built dynamically from `demographics.employementType` array. Each entry's `department` field becomes the item `id`; the capitalised form becomes the `label`. The `"all"` entry maps to `{ id: "all", label: "All" }` and is selected by default.

**Rationale**: Hardcoding department names in the component contradicts the goal of zero hardcoded display values and would diverge if the backend adds or renames departments.

**Implementation pattern**:

```typescript
const departmentItems =
  demographicsSection?.employementType.map(entry => ({
    id: entry.department,
    label:
      entry.department === "all"
        ? "All"
        : entry.department.charAt(0).toUpperCase() + entry.department.slice(1),
  })) ?? [];
```

---

## Decision 5: SalaryChart Data Prop Refactor

**Decision**: `SalaryChart.tsx` is changed to accept a `data: ChartItem[]` prop instead of using an internal `const data`. `WorkforcePage.tsx` maps `compensation.benefitsCost.graph` to `ChartItem[]` using `boxStart = min`, `boxEnd = max` (API does not provide quartile values).

**Rationale**: The chart's internal hardcoded dataset must be replaced with live data. Since the API provides only `min` and `max` per salary range, the box whisker range collapses to a single bar (box = full range). This is acceptable for the initial release.

**Implementation pattern**:

```typescript
// In WorkforcePage.tsx
const salaryChartData: ChartItem[] = (compensationSection?.benefitsCost.graph ?? []).map(g => ({
  label: g.salaryRange,
  min: g.min,
  boxStart: g.min,
  boxEnd: g.max,
  max: g.max,
}));
```

---

## Decision 6: Missing API Fields (PTO / Sick Days)

**Decision**: The `employeeCardsConfig` rows "Avg. PTO Taken" and "Avg. Sick Days Taken" are not present in the `GET /api/v1/dashboard/workforce` response schema. These two cards will display `"--"` as their count value. The card structure and UI layout remain intact for when the API adds these fields.

**Rationale**: Removing the cards would change the UI layout. Displaying `"--"` is a clear "not yet available" signal to users without breaking the grid.

---

## Decision 7: String Percentage Helper

**Decision**: A small pure helper `parsePercentage(value: string): number` will be defined in `WorkforcePage.tsx` (local helper, not a shared util — single use). It strips the `%` suffix and returns `0` for any non-numeric value including `"N/A"`.

```typescript
const parsePercentage = (value: string): number => {
  const num = parseFloat(value.replace("%", ""));
  return isNaN(num) ? 0 : num;
};
```

**Rationale**: The API returns string percentages like `"64%"`, `"N/A"`. The `ProgressCard` component expects numeric `percentage` values. This helper is straightforward and covered by the existing TDD test for the slice/selectors.

---

## Decision 8: Workforce State — No localStorage Persistence

**Decision**: The `workforce` slice state is NOT added to the `saveState` / `loadState` functions in `store.ts`. It resets on every page load and is re-fetched on each dashboard mount.

**Rationale**: Workforce data is server state (fresh from the API on each visit). Persisting it would show stale data on return visits. This matches how the `dashboard` slice is handled (dashboard data also not serialized to localStorage in `saveState`).

---

## Decision 9: API Timeout

**Decision**: Use the same `600000` ms timeout as `dashboardApi.ts`.

**Rationale**: Consistency with the existing codebase. The dashboard API timeout is deliberately generous for large data payloads; the workforce endpoint is similar in character.

---

## Decision 10: `employementType` Spelling

**Decision**: The TypeScript interface field is named `employementType` (matching the backend's typo) to avoid any runtime mismatch. A JSDoc `@note` comment documents the intentional misspelling.

**Rationale**: The backend schema uses this spelling (as confirmed in the feature description). Correcting it client-side would require a runtime key transform, adding unnecessary complexity.

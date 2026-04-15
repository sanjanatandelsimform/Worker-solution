# Implementation Plan: Dashboard Workforce Tab API Integration

**Branch**: `009-workforce-tab-api` | **Date**: 2026-04-14 | **Spec**: [spec.md](./spec.md)

## Summary

Replace all hardcoded static data in `WorkforcePage.tsx` with live data from `GET /api/v1/dashboard/workforce`. A new Redux slice (`workforceSlice.ts`) holds the fetched state; its `fetchWorkforce` thunk serves the static dataset while the real API call sits commented out directly below it — one comment-removal equals full migration. `fetchWorkforce` is dispatched from `DashboardPage.tsx` on every dashboard mount alongside the existing `fetchDashboard` call. `WorkforcePage.tsx` is refactored to read exclusively from typed selectors, and its `setTimeout`-based loading flag is replaced by `selectWorkforceLoading`.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) + React 19.2  
**Primary Dependencies**: Redux Toolkit 2.x, axios 1.13.2 (`apiClient` from `authApi.ts`), react-router-dom 7, Vitest + React Testing Library  
**Storage**: Redux store (server state, not persisted to localStorage)  
**Testing**: Vitest unit tests + React Testing Library; TDD (tests before implementation)  
**Target Platform**: Web (Vite SPA)  
**Project Type**: Web application (single frontend)  
**Performance Goals**: API call within existing 600 000 ms timeout (matching `dashboardApi.ts`); loading skeletons visible immediately on mount  
**Constraints**: Reuse `apiClient` from `authApi.ts`; reuse `ErrorMessage` component; no new React Query — follow existing Redux Toolkit async thunk pattern; workforce state NOT persisted to localStorage (server state only)  
**Scale/Scope**: Single Redux slice, one API endpoint, one refactored page component, one edited dashboard page

## Constitution Check

| Principle                       | Status | Notes                                                                                                                                                           |
| ------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Component-First Architecture | PASS   | New slice, selectors, and API service are self-contained with explicit TypeScript interfaces. `WorkforcePage` composition unchanged — only data source swapped. |
| II. User-Centric Design         | PASS   | Spec has P1/P2/P3 stories with independent acceptance criteria and measurable success criteria.                                                                 |
| III. Test-Driven Development    | PASS   | Test files for slice, selectors, and API service written before implementation (TDD Red → Green).                                                               |
| IV. Type Safety                 | PASS   | New `workforceTypes.ts` covers the full API schema; `workforceSelectors.ts` uses typed `RootState`; no `any` types.                                             |
| V. Performance & Accessibility  | PASS   | Loading skeletons driven by Redux state (no artificial timeout); no new a11y regressions — existing skeleton/content pattern preserved.                         |
| VI. State Management Discipline | PASS   | Server state managed via Redux Toolkit async thunk; state shape follows `DashboardState` precedent; workforce state resets on logout.                           |

## Project Structure

### Documentation (this feature)

```text
specs/009-workforce-tab-api/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── workforce-get.md # Phase 1 output
└── checklists/
    └── requirements.md
```

### Source Code Changes

```text
src/
├── types/
│   └── workforceTypes.ts              NEW  WorkforceResponse + all sub-interfaces + WorkforceState
├── services/api/
│   └── workforceApi.ts                NEW  getWorkforce() — follows dashboardApi.ts pattern
├── store/
│   ├── slices/
│   │   └── workforceSlice.ts          NEW  fetchWorkforce thunk (static inline, real API commented out)
│   ├── selectors/
│   │   └── workforceSelectors.ts      NEW  selectWorkforceData / Loading / Error + section selectors
│   └── store.ts                       EDIT add workforce reducer
└── pages/
    ├── dashboard/
    │   └── DashboardPage.tsx          EDIT dispatch fetchWorkforce on mount
    └── workforce/
        ├── WorkforcePage.tsx          REFACTOR remove all hardcoded data, wire selectors + loading
        └── SalaryChart.tsx            EDIT accept data prop (ChartItem[]) instead of internal const

tests/
├── store/
│   ├── workforceSlice.test.ts         NEW  thunk + reducer unit tests
│   └── workforceSelectors.test.ts     NEW  selector unit tests
└── services/
    └── workforceApi.test.ts           NEW  API service unit tests
```

**Structure Decision**: Web single-project. All changes inside `src/` following the established feature-based layout. No backend changes in this repo. Three new source files, two existing files edited, one page component refactored.

## Phase 0: Research (Complete)

See [research.md](./research.md) for full findings. Key decisions:

- **HTTP client**: `apiClient` from `authApi.ts` — token-refresh interceptor; codebase standard for all API services.
- **Token extraction**: Same `localStorage` pattern as `dashboardApi.ts` (`userDetail` → `auth.tokens.accessToken`).
- **Slice location**: `src/store/slices/workforceSlice.ts` — follows `dashboardSlice.ts` structure exactly.
- **Static toggle**: Static dataset inlined as `STATIC_WORKFORCE_DATA` const at the top of `workforceSlice.ts`. Real API call (`await getWorkforce()`) present but commented out immediately after. Migration = delete static block + uncomment API call.
- **Fetch trigger**: `fetchWorkforce` dispatched in `DashboardPage.tsx` inside the same `useEffect` that guards on `assessmentData?.data?.status === "completed"`, alongside the existing `fetchDashboard` dispatch. Errors are non-blocking (workforce errors shown inside `WorkforcePage`, not as dashboard-level blocking errors).
- **Loading control**: `selectWorkforceLoading` replaces the existing `setTimeout(5000)` pattern in `WorkforcePage.tsx`.
- **Department dropdown**: Options built from `demographics.employementType` array, mapping `department` to both `id` and `label` (capitalised). The "all" entry becomes the default/placeholder.
- **SalaryChart refactor**: `SalaryChart.tsx` is changed to accept a `data: ChartItem[]` prop. `WorkforcePage` passes `compensation.benefitsCost.graph` mapped to `ChartItem` shape (`boxStart = min`, `boxEnd = max` since API only provides min/max).
- **Missing API fields**: `Avg. PTO Taken` and `Avg. Sick Days Taken` card counts are not present in the API response. These two cards display `"--"` until a future API expansion adds those fields. Card structure stays intact.
- **String percentage parsing**: Fields like `"64%"`, `"N/A"` from the API are parsed by a small pure helper `parsePercentage(value: string): number` that strips `%` and returns `0` for `"N/A"`.
- **Timeout**: 600 000 ms — matches `dashboardApi.ts`.

## Phase 1: Design Artifacts (Complete)

- [x] [data-model.md](./data-model.md) — TypeScript interfaces, state shape, field mapping table
- [x] [contracts/workforce-get.md](./contracts/workforce-get.md) — Full API contract with request/response shapes and error handling
- [x] [quickstart.md](./quickstart.md) — Step-by-step implementation guide with code snippets

## Implementation Phases

### Phase A — Foundation (Types + TDD scaffolding)

**Goal**: All new test files created in TDD Red state before any production code is written.

**Tasks**:

- **A1**: Create `src/types/workforceTypes.ts` with all interfaces (see data-model.md)
- **A2**: Create `tests/store/workforceSlice.test.ts` with 6 test cases (TDD Red)
- **A3**: Create `tests/store/workforceSelectors.test.ts` with 6 test cases (TDD Red)
- **A4**: Create `tests/services/workforceApi.test.ts` with 4 test cases (TDD Red)

**Gate**: `pnpm run type-check` passes. All 4 new test files exist. New tests fail (expected Red state).

---

### Phase B — Core Infrastructure (Service + Slice + Selectors + Store)

**Goal**: All Phase A test files turn Green. Store is wired.

**Tasks**:

- **B1**: Create `src/services/api/workforceApi.ts` — `getWorkforce()` following `dashboardApi.ts` pattern; `tests/services/workforceApi.test.ts` Green
- **B2**: Create `src/store/slices/workforceSlice.ts` — `fetchWorkforce` thunk with `STATIC_WORKFORCE_DATA` + commented-out `getWorkforce()` call; logout matcher; `tests/store/workforceSlice.test.ts` Green
- **B3**: Create `src/store/selectors/workforceSelectors.ts` — `selectWorkforceData`, `selectWorkforceLoading`, `selectWorkforceError`, `selectWorkforceSection`, `selectParticipationSection`, `selectDemographicsSection`, `selectCompensationSection`; `tests/store/workforceSelectors.test.ts` Green
- **B4**: Edit `src/store/store.ts` — import `workforceReducer`, add `workforce: workforceReducer` to `rootReducer`, add `WorkforceState` to `RootState` type

**Gate**: `pnpm test` — all Phase A test files pass. `pnpm run type-check` passes.

---

### Phase C — DashboardPage Integration

**Goal**: `fetchWorkforce` dispatched on every dashboard mount.

**Tasks**:

- **C1**: Edit `src/pages/dashboard/DashboardPage.tsx` — import `fetchWorkforce` from `workforceSlice`; inside the `fetchWithModal` async function (where `fetchDashboard` is dispatched), add `dispatch(fetchWorkforce())` as a parallel or sequential fire-and-forget call. Workforce errors do not block the dashboard flow — they are surfaced inside `WorkforcePage` only.

**Gate**: `pnpm run type-check` passes. `pnpm dev` — navigating to `/dashboard` triggers `fetchWorkforce` dispatch (visible in Redux DevTools).

---

### Phase D — WorkforcePage Refactor

**Goal**: All hardcoded data removed from `WorkforcePage.tsx`; page driven entirely by Redux selectors.

**Tasks**:

- **D1**: Edit `SalaryChart.tsx` — change internal `const data` to a `data` prop of type `ChartItem[]`; update `SalaryRangeChart` component signature accordingly
- **D2**: Update imports in `WorkforcePage.tsx` — add workforce selectors; remove unused dashboard selectors (keep any that are still needed)
- **D3**: Replace `isLoadingCards` / `setTimeout` state with `const isLoadingCards = useAppSelector(selectWorkforceLoading)`; add `const workforceError = useAppSelector(selectWorkforceError)`; remove the `useEffect` timer
- **D4**: Add `selectWorkforceSection` / `selectParticipationSection` / `selectDemographicsSection` / `selectCompensationSection` calls
- **D5**: Replace `overviewCardsConfig` hardcoded counts with values from `workforceSection` (`totalWorkforce`, `enrolledBenefits`, `avgEmployeeCost`)
- **D6**: Replace `employeeCardsConfig` — `employerCostPerEmployee` from `workforceSection`; PTO and sick days cards show `"--"` (not in API response)
- **D7**: Replace `participationCardsConfig` counts with `participationSection` values (`totalWorkforce`, `enrolledBenefits`, `retirementEnrollment`, `healthcareEnrollment`)
- **D8**: Replace Benefits / Retirement / Insurance `ProgressCard` sections with `participationSection.benefits`, `.retirement`, `.insurance` values; use `parsePercentage()` helper to convert string percentages to numbers
- **D9**: Replace `demographicsCardsConfig` gender counts with `demographicsSection.gender.women` and `.men`
- **D10**: Replace department `<Select>` items with options derived from `demographicsSection.employementType`; change `selectedGraphType` type from `"owners" | "renters"` to `string`; add state for selected department (default `"all"`)
- **D11**: Replace `donutChartsConfig` with percentages derived from the selected department row in `demographicsSection.employementType`; parse string percentages to numbers
- **D12**: Replace `ageBreakdownConfig` with entries from `demographicsSection.employmentBreakdownByAge`; each bar shows `fullTime` value
- **D13**: Replace `compensationCardsConfig` salary counts with `compensationSection.salaryBreakdown` values (format numbers as currency strings)
- **D14**: Replace `salaryBreakdownCardsConfig` with `compensationSection.benefitsCost.employeeContribution` and `.employerCost`
- **D15**: Replace `users` array with `compensationSection.workforceBreakdown.departments.map(d => ({ department: d.label, employeeNumber: String(d.empNumber), partTime: String(d.partTime), fullTime: String(d.fullTime), salaryRange: d.salaryRange }))`
- **D16**: Replace `salary` array with `compensationSection.benefitsCost.table.map(row => ({ salaryRange: row.salaryRange, avgEmployeeCostPerPaycheck: \`${row.avgEmployeeCostPerPaycheck} (${row.avgEmployeeCostPercentage}%)\`, employerCostPerPaycheck: row.employerCostPerPaycheck ?? "$xx.xx" }))`
- **D17**: Pass mapped `SalaryChart` data from `compensationSection.benefitsCost.graph`
- **D18**: Add error state rendering — if `workforceError` is non-null, render `<ErrorMessage>` at the top of the page content

**Gate**: `pnpm run type-check` passes. `pnpm dev` smoke test — Workforce tab displays all sections with static data values. No console errors. Loading skeletons appear briefly on mount. No hardcoded display values remain in `WorkforcePage.tsx`.

---

### Phase E — Quality Gate

**Tasks**:

- **E1**: `pnpm run type-check` — zero errors
- **E2**: `pnpm lint:fix` then `pnpm format`
- **E3**: `pnpm test` — all tests pass (including new workforceSlice, workforceSelectors, workforceApi tests)
- **E4**: Smoke test `pnpm dev` — `/dashboard` loads normally, Workforce tab shows data, loading skeletons appear then data appears

**Gate**: All checks pass. PR ready.

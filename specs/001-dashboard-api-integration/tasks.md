---

description: "Task list for Dashboard API Integration"

---

# Tasks: Dashboard API Integration

**Input**: Design documents from `specs/001-dashboard-api-integration/`

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Create `specs/001-dashboard-api-integration/tasks.md` (this task file)
- [X] T002 [P] Verify required design docs exist in `specs/001-dashboard-api-integration/` (plan.md, spec.md, research.md, data-model.md, contracts/)
- [X] T003 [P] Confirm OpenAPI contract presence `specs/001-dashboard-api-integration/contracts/dashboard-api.yaml` and align fields with `specs/001-dashboard-api-integration/data-model.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T004 [P] Create TypeScript interfaces for dashboard API in `src/types/dashboardTypes.ts`
- [X] T005 [P] Add API service wrapper for GET /dashboard in `src/services/api/dashboardApi.ts` (axios client, 30s timeout)
- [X] T006 [P] Add Redux slice skeleton `src/store/slices/dashboardSlice.ts` (state, reducers, async thunk placeholder)
- [X] T007 Update `src/store/store.ts` to register `dashboardReducer` from `src/store/slices/dashboardSlice.ts`
- [X] T008 [P] Create typed selectors in `src/store/selectors/dashboardSelectors.ts`
- [X] T009 [P] Add locale-aware formatters in `src/utils/formatters.ts` (number/currency helpers used by pages)
- [X] T010 [P] Add test scaffolding files: `tests/services/dashboardApi.test.ts` and `tests/store/dashboardSlice.test.ts`

---

## Phase 3: User Story 1 - Dashboard Data Retrieval (Priority: P1) 🎯 MVP

**Goal**: Fetch the GET /dashboard response once after Goals completion and store it in Redux for reuse across tabs.

**Independent Test**: Complete Goals flow, click "Go to Dashboard", assert a single GET /dashboard request is made and response stored in Redux.

- [X] T011 [P] [US1] Write contract/unit test for GET /dashboard in `tests/services/dashboardApi.test.ts` (mock axios, assert timeout and error cases)
- [X] T012 [US1] Implement `getDashboard()` in `src/services/api/dashboardApi.ts` returning typed `DashboardResponse` (use 30s timeout)
- [X] T013 [US1] Implement `fetchDashboard` async thunk in `src/store/slices/dashboardSlice.ts` and handle loading/error/success states
- [X] T014 [US1] Update `src/pages/dashboard/DashboardPage.tsx` to dispatch `fetchDashboard` on mount when user has completed Goals and show loading/error states (use existing `ErrorMessage` and `LoadingSpinner`)
- [X] T015 [US1] Add Redux slice tests `tests/store/dashboardSlice.test.ts` for state transitions and reducers

---

## Phase 4: User Story 2 - Company Overview Display (Priority: P2)

**Goal**: Map `companyAtGlance` and `strategicRecommendations` into `RecommendationsPage` UI.

**Independent Test**: Load Dashboard (with mocked store) and assert `RecommendationsPage` renders `totalWorkforce`, `averageHourlyWage`, `averageSalary`, and sorted `strategicRecommendations`.

- [X] T016 [US2] Update `src/pages/recommendations/RecommendationsPage.tsx` to consume selectors from `src/store/selectors/dashboardSelectors.ts`
- [X] T017 [US2] Implement unit tests `tests/pages/RecommendationsPage.test.tsx` verifying number formatting and recommendation sort order

---

## Phase 5: User Story 3 - Industry Benchmark Insights (Priority: P3)

**Goal**: Map benchmark arrays (`industryOverview`, `turnoverVoluntaryVsInvoluntary`, `rateOfSeparation`, `areaMedianWage`, `housingCost`) into `BenchmarkPage`.

**Independent Test**: Load Dashboard (with mocked store) and assert `BenchmarkPage` renders the industry overview metrics, first `areaMedianWage` element and first `housingCost` element graphs/placeholders.

- [X] T018 [US3] Update `src/pages/benchmark/BenchmarkPage.tsx` to consume selectors from `src/store/selectors/dashboardSelectors.ts`
- [X] T019 [US3] Implement unit tests `tests/pages/BenchmarkPage.test.tsx` verifying fallback behavior when arrays are empty and graph data mapping

---

## Phase 6: User Story 4 - Graceful Error Handling (Priority: P4)

**Goal**: Provide clear loading/error UX and manual retry for failed GET /dashboard calls.

**Independent Test**: Simulate API failures and verify retry button re-dispatches `fetchDashboard` and UI shows appropriate messages without layout breaks.

- [X] T020 [US4] Wire retry behavior in `src/pages/dashboard/DashboardPage.tsx` (show error with retry button that dispatches `fetchDashboard`)
- [X] T021 [US4] Add tests `tests/pages/DashboardErrorHandling.test.tsx` covering timeout, 500, and network failure flows and retry

---

## Phase 6: User Story 4 - ZIP Code-Driven Data Binding (Priority: P3)

**Goal**: Enable dynamic updates to Benchmark sections based on selected ZIP code without additional API calls.

**Independent Test**: Load Dashboard, select different ZIP codes in Benchmark tab, and verify Area Median Wage and Housing Cost sections update dynamically without triggering new API calls.

- [X] T020 [US4] Add `selectZipCodes` selector in `src/store/selectors/dashboardSelectors.ts` to expose `zipCodes` array from API response
- [X] T021 [US4] Add `makeSelectAreaMedianByZip` and `makeSelectHousingCostByZip` selector factories in `src/store/selectors/dashboardSelectors.ts` for per-ZIP filtering
- [X] T022 [US4] Update `src/pages/benchmark/BenchmarkPage.tsx` to bind ZIP dropdown to `zipCodes` and dynamically update sections based on selected ZIP
- [X] T023 [US4] Write unit tests `tests/pages/BenchmarkPage.test.tsx` for ZIP-driven updates and fallback behavior (e.g., "Data not available")
- [X] T024 [US4] Write integration tests `tests/integration/BenchmarkPage.integration.test.tsx` to verify no additional API calls on ZIP change

---

## Phase 7: Edge Case Testing and Retry Implementation

**Goal**: Ensure robust handling of API errors and edge cases.

**Independent Test**: Simulate various API failure scenarios and verify appropriate UI behavior.

- [ ] T025 [US5] Add unit tests for API error handling in `tests/services/dashboardApi.test.ts` (e.g., timeout, 500 error, malformed data).
- [ ] T026 [US5] Implement retry button in `src/pages/dashboard/DashboardPage.tsx` to re-dispatch `fetchDashboard` on click.
- [ ] T027 [US5] Write integration tests `tests/pages/DashboardErrorHandling.integration.test.tsx` for retry button functionality and edge cases.
- [ ] T028 [US5] Add tests for placeholder behavior in `tests/pages/BenchmarkPage.test.tsx` (e.g., "Data not available" message).

---

## Requirement Coverage

- **FR-005**: Show retry button on API failure → T026, T027
- **FR-015**: Handle null/undefined data gracefully → T028
- **FR-016**: Display "Data not available" placeholders → T028
- **FR-020**: Auto-reload dashboard data on page refresh → Add task for implementation and testing.

---

## Final Phase: Polish & Cross-Cutting Concerns

- [X] T022 [P] Update `specs/001-dashboard-api-integration/quickstart.md` with exact developer steps referencing created files
- [X] T023 [P] Run type-check and lint on changed files: update `package.json` scripts if needed and run `pnpm run type-check` and `pnpm lint:fix`
- [X] T024 [P] Add documentation and inline usage in `src/types/dashboardTypes.ts` and `src/services/api/dashboardApi.ts`

---

## Dependencies & Execution Order

- Run Phase 1 tasks (T001-T003) first to confirm docs and contract alignment
- Complete all Foundational tasks (T004-T010) before implementing any user story
- After Foundational phase, implement User Stories in priority order (US1 → US2 → US3 → US4) or in parallel if multiple developers are available

## Parallel Opportunities

- Foundational tasks `T004`, `T005`, `T006`, `T008`, `T009`, and `T010` can be worked on in parallel by different engineers
- Tests for different stories and pages (`T011`, `T015`, `T017`, `T019`, `T021`) can be implemented in parallel once their targets exist

## Implementation Notes

- Follow TDD: write tests first for each story/task and ensure they fail before implementing
- Use existing patterns in `src/services/api/*.ts`, `src/store/slices/*.ts`, and `src/store/selectors/*` for consistency
- Keep all UI and styling unchanged — update only data wiring
- Enforce 30s timeout at axios instance/function level for `getDashboard()`

---

## TDD Enforcement

- [X] T029 [P] Write unit tests for `selectZipCodes` selector before implementation.
- [X] T030 [P] Write unit tests for `makeSelectAreaMedianByZip` and `makeSelectHousingCostByZip` before implementation.
- [X] T031 [P] Write unit tests for ZIP-driven updates in `BenchmarkPage` before implementation.

---

Generated by: `/speckit.tasks` command

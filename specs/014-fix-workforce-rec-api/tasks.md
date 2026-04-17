# Tasks: Live APIs â€“ Update Workforce & Recommendations Endpoints and Interfaces

**Branch**: `014-fix-workforce-rec-api`  
**Input**: Design documents from `specs/014-fix-workforce-rec-api/`  
**Prerequisites**: plan.md âœ… spec.md âœ… research.md âœ… data-model.md âœ… contracts/ âœ… quickstart.md âœ…

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependency)
- **[Story]**: Which user story the task belongs to (US1 or US2)
- Exact file paths are included in all descriptions

---

## Phase 1: Setup

**Purpose**: Confirm the development baseline before making any changes

- [x] T001 Verify baseline â€” run `pnpm run type-check` and confirm zero pre-existing TypeScript errors before any edits

---

## Phase 2: Foundational (Blocking Prerequisites)

> No shared foundational dependencies exist between US1 and US2. Both user stories operate on entirely separate type/slice/selector/test files. Phase 3 and Phase 4 may begin immediately after Phase 1.

---

## Phase 3: User Story 1 â€“ Workforce Live API (Priority: P1) ðŸŽ¯ MVP

**Goal**: Switch the Workforce page from static mock data to the live `/dashboard/workforce` endpoint; update types to match the new response envelope.

**Independent Test**: Load the Workforce tab in a browser connected to the backend â€” the network tab must show a request to `/dashboard/workforce` (not `/api/v1/...`), and all four Workforce page sections must render with live data and no console errors.

### Implementation for User Story 1

- [x] T002 [US1] Update `src/types/workforceTypes.ts` â€” rename `WorkforceResponse` â†’ `WorkforceEnvelope`; add `dataStatus: string` field to `WorkforceEnvelope`; add new `WorkforceApiResponse { assessmentType: string; workforce: WorkforceEnvelope }` interface; update `WorkforceState.data` type from `WorkforceResponse | null` to `WorkforceApiResponse | null`

- [x] T003 [P] [US1] Update `src/services/api/workforceApi.ts` â€” change import from `WorkforceResponse` to `WorkforceApiResponse`; change endpoint from `/api/v1/dashboard/workforce` to `/dashboard/workforce`; update `apiClient.get` generic type and function return type to `WorkforceApiResponse`

- [x] T004 [P] [US1] Update `src/store/slices/workforceSlice.ts` â€” uncomment `import { getWorkforce } from "@/services/api/workforceApi"`; change type import from `WorkforceResponse` to `WorkforceApiResponse`; delete entire `STATIC_WORKFORCE_DATA` constant block (~330 lines) and all static-mode TODO comments; replace thunk body with `const response = await getWorkforce(); return response;`; update thunk generic from `WorkforceResponse` to `WorkforceApiResponse`; update `PayloadAction<WorkforceResponse>` â†’ `PayloadAction<WorkforceApiResponse>` in `fulfilled` case

- [x] T005 [US1] Update `src/store/selectors/workforceSelectors.ts` â€” change import from `WorkforceResponse` to `WorkforceApiResponse`; update `selectWorkforceData` return type annotation to `WorkforceApiResponse | null`; fix four data-section selector access paths: `data?.workforce` â†’ `data?.workforce.workforce`, `data?.participation` â†’ `data?.workforce.participation`, `data?.demographics` â†’ `data?.workforce.demographics`, `data?.compensation` â†’ `data?.workforce.compensation`

### Tests for User Story 1

- [x] T006 [P] [US1] Update `tests/services/workforceApi.test.ts` â€” change import from `WorkforceResponse` to `WorkforceApiResponse`; wrap `mockWorkforceResponse` in the new envelope shape `{ assessmentType: "finch", workforce: { dataStatus: "available", workforce: {...}, participation: {...}, demographics: {...}, compensation: {...} } }`; update URL assertion from `/api/v1/dashboard/workforce` to `/dashboard/workforce`

- [x] T007 [P] [US1] Update `tests/store/workforceSlice.test.ts` â€” change import from `WorkforceResponse` to `WorkforceApiResponse` (or add `WorkforceApiResponse`); wrap all `mockData` objects in the `WorkforceApiResponse` envelope shape (add `assessmentType` at root and nest workforce data under `workforce: { dataStatus: "available", workforce: {...}, ... }`)

- [x] T008 [US1] Update `tests/store/workforceSelectors.test.ts` â€” change import from `WorkforceResponse` to `WorkforceApiResponse`; wrap `mockWorkforceData` in `WorkforceApiResponse` envelope; update `makeState` to use `WorkforceApiResponse` as data type; fix `selectWorkforceSection` test assertions to reference `mockData.workforce.workforce` instead of `mockData.workforce`

**Checkpoint âœ…**: User Story 1 complete â€” run `pnpm run type-check` (zero errors) and `pnpm test` (all workforce tests pass). Workforce tab must load live data.

---

## Phase 4: User Story 2 â€“ Recommendations Live API (Priority: P2)

**Goal**: Switch the Recommendations page from static mock data to the live `/dashboard/recommendation` endpoint; update types to remove `companyAtGlance` and add `assessmentType`.

**Independent Test**: Load the Recommendations tab in a browser connected to the backend â€” the network tab must show a request to `/dashboard/recommendation` (not `/api/v1/...`), and the strategic recommendations list must render with live data and no console errors.

### Implementation for User Story 2

- [x] T009 [US2] Update `src/types/recommendationsTypes.ts` â€” add `assessmentType: string` field to `RecommendationsApiResponse`; remove `companyAtGlance: RecommendationCompanyAtGlance` field from `RecommendationData`; delete the entire `RecommendationCompanyAtGlance` interface

- [x] T010 [US2] Update `src/store/slices/recommendationsSlice.ts` â€” uncomment `import { getRecommendations } from "@/services/api/recommendationsApi"`; delete entire `STATIC_RECOMMENDATIONS_DATA` constant block and all static-mode TODO comments; replace thunk body with `const response = await getRecommendations(); return response;`

- [x] T011 [P] [US2] Update JSDoc comment in `src/store/selectors/recommendationsSelectors.ts` â€” remove stale `companyAtGlance` reference from `selectRecommendationItem` JSDoc (comment currently says "Contains flags, strategicRecommendations array, and companyAtGlance")

### Tests for User Story 2

- [x] T012 [P] [US2] Update `tests/store/recommendationsSlice.test.ts` â€” remove `companyAtGlance` object from `mockData.recommendation`; add `assessmentType: "finch"` at the root of `mockData`

- [x] T013 [P] [US2] Update `tests/store/recommendationsSelectors.test.ts` â€” remove `companyAtGlance` from any mock `RecommendationData` objects used in the test file; add `assessmentType` at root level where full `RecommendationsApiResponse` objects are constructed

**Checkpoint âœ…**: User Story 2 complete â€” run `pnpm run type-check` (zero errors) and `pnpm test` (all recommendations tests pass). Recommendations tab must load live data.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification that both user stories work together and all project quality gates pass

- [x] T014 Run `pnpm run type-check` across the full project and fix any remaining TypeScript errors introduced by the type renames or interface removals

- [x] T015 Run `pnpm test` and confirm all test files pass â€” pay particular attention to `WorkforcePage` and `RecommendationsPage` integration tests for regressions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies â€” start immediately
- **Foundational (Phase 2)**: N/A â€” no shared prerequisites exist
- **US1 (Phase 3)**: Starts after Phase 1; independent of US2
- **US2 (Phase 4)**: Starts after Phase 1; independent of US1 â€” can run in **parallel with Phase 3** if two developers are available
- **Polish (Phase 5)**: Depends on both Phase 3 and Phase 4 being complete

### Within User Story 1 (Phase 3)

```
T002 (types)
  â”œâ”€â”€ T003 [P] (api service)  â”€â”both can start simultaneously after T002
  â””â”€â”€ T004 [P] (slice)        â”€â”˜
        â”œâ”€â”€ T005 (selectors)    â† after T003 + T004
        â”œâ”€â”€ T006 [P] (test api) â† after T003; parallel with T007
        â”œâ”€â”€ T007 [P] (test slice) â† after T004; parallel with T006
        â””â”€â”€ T008 (test selectors) â† after T005
```

### Within User Story 2 (Phase 4)

```
T009 (types)
  â”œâ”€â”€ T010 (slice)              â† after T009
  â”œâ”€â”€ T011 [P] (selector comment) â† after T009; parallel with T010
  â”œâ”€â”€ T012 [P] (test slice)    â† after T010; parallel with T013
  â””â”€â”€ T013 [P] (test selectors) â† after T009; parallel with T012
```

### Parallel Opportunities

- **Phase 3 + Phase 4 together (two devs)**: Developer A works T002â€“T008; Developer B works T009â€“T013 simultaneously
- **Within Phase 3**: T003 and T004 in parallel after T002; T006 and T007 in parallel after their prerequisites
- **Within Phase 4**: T011 in parallel with T010; T012 and T013 in parallel after T010

---

## Parallel Example: User Story 1 (Single Developer)

```
Step 1: T002 â€” types (must be first, blocks everything)
Step 2: T003 [P] + T004 [P] â€” api service and slice simultaneously
Step 3: T005 â€” selectors (after step 2 completes)
Step 4: T006 [P] + T007 [P] â€” test api + test slice simultaneously
Step 5: T008 â€” test selectors (after step 3 and step 4)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 3: User Story 1 (T002â€“T008)
3. **STOP and VALIDATE**: Workforce tab loads live data with zero errors
4. Then proceed to Phase 4 (US2) and Phase 5

### Full Delivery (Both Stories â€” Single Developer)

1. T001 â†’ T002 â†’ T003+T004 â†’ T005 â†’ T006+T007 â†’ T008 â†’ T009 â†’ T010+T011 â†’ T012+T013 â†’ T014 â†’ T015

### Full Delivery (Two Developers)

1. Both: T001
2. Dev A: T002 â†’ T003+T004 â†’ T005 â†’ T006+T007 â†’ T008
3. Dev B (simultaneously): T009 â†’ T010+T011 â†’ T012+T013
4. Both: T014 â†’ T015

---

## Notes

- **`recommendationsApi.ts` is NOT in the task list** â€” the file already contains the correct endpoint (`/dashboard/recommendation`). Only the slice needs the live-call enabled.
- **No consumer hooks or page components change** â€” `useWorkforceXxxConfig` hooks and all Workforce/Recommendations page components are insulated from this change by the selector layer.
- All [P] tasks operate on distinct files with no write conflicts
- Commit after each checkpoint (end of Phase 3 and Phase 4) to enable clean rollback

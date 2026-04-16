# Tasks: Recommendations Finch Tab API Integration

**Input**: Design documents from `/specs/011-recommendations-api/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: Not explicitly requested in spec — test tasks are included for selectors and slice reducers only (constitution Principle III requires test coverage for state management).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the TypeScript type definitions that all other files depend on.

- [x] T001 Create `src/types/recommendationsTypes.ts` with interfaces: `StrategicRecommendation`, `RecommendationCompanyAtGlance`, `RecommendationData`, `RecommendationsApiResponse`, `RecommendationsState` (see data-model.md#typescript-interfaces)

**Checkpoint**: Types file created and compiles — all other files can now import from it.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infrastructure that all user stories depend on — the Redux slice, API service, and selectors must exist before any component wiring can happen.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 [P] Create `src/services/api/recommendationsApi.ts` — export `getRecommendations(): Promise<RecommendationsApiResponse>` following the exact pattern of `workforceApi.ts` (auth token, timeout 600000, re-throw auth errors, wrap others via `getErrorMessage`)
- [x] T003 [P] Create `src/store/slices/recommendationsSlice.ts` — Redux slice with `STATIC_RECOMMENDATIONS_DATA` constant (3 items stub from data-model.md), `fetchRecommendations` async thunk returning static data, live API call commented out with TODO migration comments identical to `workforceSlice.ts`; slice reducers: `clearRecommendations`, `clearRecommendationsError`, `resetRecommendations`; `addMatcher` for `auth/logout`
- [x] T004 Create `src/store/selectors/recommendationsSelectors.ts` — export all 7 selectors: `selectRecommendationsState`, `selectRecommendationsData`, `selectRecommendationItem`, `selectRecommStrategicRecommendations` (sorted by `order` asc via `createSelector`), `selectProvenStrategiesFlags` (object with 3 booleans, defaults `false`), `selectRecommendationsLoading`, `selectRecommendationsError`, `selectRecommendationsIsLoaded` (depends on T003 for slice name)
- [x] T005 Register recommendations reducer in `src/store/store.ts`: import `recommendationsReducer` + `RecommendationsState`; add to `rootReducer`; add `recommendations: RecommendationsState` to exported `RootState` type (depends on T003)

**Checkpoint**: Redux slice is wired. `pnpm run type-check` must pass with zero errors before proceeding to user story phases.

---

## Phase 3: User Story 1 - Company & Benefits Overview from Workforce Data (Priority: P1) 🎯 MVP

**Goal**: Remove `selectCompanyAtGlance` and `selectStrategicRecommendations` from `dashboardSelectors` imports; wire workforce slice selectors to Company Overview + Benefits Overview card sections.

**Independent Test**: Navigate to the Recommendations tab with workforce static data loaded. Verify Company Overview cards display total workforce (3120), avg hourly rate ($30.00), avg salary ($65,000) — matching the workforce slice stub. Benefits Overview cards show 5345, 2450, 64%, 78%.

### Implementation for User Story 1

- [x] T006 [US1] In `src/pages/recommendations/RecommendationsFinchPage.tsx`: remove the entire `dashboardSelectors` import block (`selectCompanyAtGlance`, `selectStrategicRecommendations`); add import of `useAppDispatch` from `@/store/hooks`; add imports for `selectWorkforceSection`, `selectCompensationSection`, `selectParticipationSection`, `selectWorkforceLoading` from `@/store/selectors/workforceSelectors`
- [x] T007 [US1] In `RecommendationsFinchPage.tsx`: replace the two removed selector calls with workforce selector calls: `workforceSection`, `compensationSection`, `participationSection`, `workforceIsLoading`; build `companyGlanceData` synthetic shape object mapping workforce fields to existing format-function expectations (see quickstart.md §6e)
- [x] T008 [US1] In `RecommendationsFinchPage.tsx`: update Company Overview card render to pass `companyGlanceData` to `card.format()`; update Benefits Overview cards to derive `count` values from `participationSection` (totalWorkforce, enrolledBenefits, retirementEnrollment, healthcareEnrollment) with hardcoded config values as fallback; define `benefitsGlanceData` shape
- [x] T009 [US1] In `RecommendationsFinchPage.tsx`: replace `isLoadingCards` skeleton guards with `isAnyLoading` combining `isLoadingCards || workforceIsLoading` for Company Overview and Benefits Overview sections

**Checkpoint**: US1 independently testable. No `dashboardSelectors` imports remain. Company/Benefits cards render values from workforce slice.

---

## Phase 4: User Story 2 — Proven Strategies Progress from Recommendations API (Priority: P2)

**Goal**: Wire `nonElectiveMatch`, `autoEnroll`, `healthcareAffordability` flags from the recommendations slice; compute dynamic X/3 count and percent; update the Proven Strategies label, description, and progress bar.

**Independent Test**: With static stub (`autoEnroll: true`, others `false`), the section renders "Strategies Implemented: 1/3" and `<ProgressBar value={33} />`. Temporarily flip all three flags to `true` in the stub; label shows "3/3" and progress bar is at 100%.

### Implementation for User Story 2

- [x] T010 [US2] In `RecommendationsFinchPage.tsx`: add imports from `recommendationsSelectors` (`selectProvenStrategiesFlags`, `selectRecommendationsLoading`, `selectRecommendationsIsLoaded`) and from `recommendationsSlice` (`fetchRecommendations`); add `useAppDispatch` usage if not already added in T006
- [x] T011 [US2] In `RecommendationsFinchPage.tsx`: add `useEffect` to dispatch `fetchRecommendations()` on mount guarded by `recommendationsIsLoaded`; read `provenStrategyFlags` from `selectProvenStrategiesFlags`; compute `provenStrategiesCount` and `provenStrategiesPercent` (see data-model.md#proven-strategies-computed-values)
- [x] T012 [US2] In `RecommendationsFinchPage.tsx`: replace hardcoded `"2/3"` label string with `{provenStrategiesCount}/3`; replace hardcoded `"2 of 3"` in paragraph text with `{provenStrategiesCount} of 3`; replace `<ProgressBar value={66} />` with `<ProgressBar value={provenStrategiesPercent} />`; extend `isAnyLoading` to also include `recommendationsIsLoading`

**Checkpoint**: US2 independently testable. Stub renders 1/3 | 33% correctly. Changing stub flags updates the display without code changes outside the slice.

---

## Phase 5: User Story 3 — Strategic Solutions from Recommendations API (Priority: P2)

**Goal**: Replace the Strategic Solutions section's data source from `dashboardSelectors.selectStrategicRecommendations` to `recommendationsSelectors.selectRecommStrategicRecommendations`.

**Independent Test**: Strategic Solutions section renders 3 cards with titles "Emergency Savings", "Medical Financing", "Financial Coaching" in order; key features listed under each.

### Implementation for User Story 3

- [x] T013 [US3] In `RecommendationsFinchPage.tsx`: add import of `selectRecommStrategicRecommendations` from `@/store/selectors/recommendationsSelectors`; replace `useAppSelector(selectStrategicRecommendations)` (old dashboard call) with `useAppSelector(selectRecommStrategicRecommendations)` — variable name `strategicRecommendations` can remain the same so JSX requires no changes

**Checkpoint**: US3 independently testable. Strategic Solutions renders 3 cards from stub in correct order. Empty-array fallback message still works.

---

## Phase 6: User Story 4 — Stub/Fake API While Backend is Not Live (Priority: P3)

**Goal**: Verify the static stub is complete, the migration path is documented, and the app works end-to-end with no live backend.

**Independent Test**: `pnpm dev` → navigate to `/dashboard` and open the Recommendations tab → all four sections render with data → no network errors in console.

### Implementation for User Story 4

- [x] T014 [US4] Verify `recommendationsSlice.ts` TODO migration comments exactly match the format from `workforceSlice.ts` (JSDoc header + TO MIGRATE block + commented-out import + commented-out `getRecommendations()` call); confirm `STATIC_RECOMMENDATIONS_DATA` matches the exact sample JSON from the feature request
- [x] T015 [US4] Run `pnpm run type-check` — zero TypeScript errors; run `pnpm lint:fix` — zero ESLint errors/warnings; smoke test the Recommendations tab in `pnpm dev`

**Checkpoint**: App runs with stub data end-to-end. Any developer can migrate to the live API by following the TODO comments.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality gate, final type check, and optional unit tests for new state management code.

- [x] T016 [P] Create `tests/store/slices/recommendationsSlice.test.ts` — unit tests: initial state shape, `fetchRecommendations.fulfilled` populates state correctly, `fetchRecommendations.rejected` sets error, `clearRecommendations` resets to initial state, `auth/logout` action resets slice
- [x] T017 [P] Create `tests/store/selectors/recommendationsSelectors.test.ts` — unit tests: `selectRecommStrategicRecommendations` returns empty array when data is null, returns items sorted by `order` asc, `selectProvenStrategiesFlags` defaults all flags to `false` when data is null, returns correct values when data present
- [x] T018 Run full quality gate: `pnpm run type-check` (zero errors) → `pnpm lint:fix` → `pnpm format` → verify all test files pass

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (T001: Types)
  └─► Phase 2 (T002-T005: Service + Slice + Selectors + Store) ← BLOCKS all stories
        ├─► Phase 3: US1 (T006-T009) — Company/Benefits Overview
        ├─► Phase 4: US2 (T010-T012) — Proven Strategies     [requires T004, T005]
        ├─► Phase 5: US3 (T013)       — Strategic Solutions   [requires T004, T005]
        └─► Phase 6: US4 (T014-T015) — Stub validation        [all above complete]
              └─► Phase 7 (T016-T018) — Polish & tests
```

### User Story Dependencies

| User Story                      | Depends On             | Can start after         |
| ------------------------------- | ---------------------- | ----------------------- |
| US1 — Company/Benefits Overview | T001, T005             | Phase 2 complete        |
| US2 — Proven Strategies         | T001, T003, T004, T005 | Phase 2 complete        |
| US3 — Strategic Solutions       | T001, T003, T004, T005 | Phase 2 complete        |
| US4 — Stub validation           | US1, US2, US3 complete | All phases 3-5 complete |

### Within Each Phase

- Phase 2: T002 and T003 are [P] (different files, no inter-dependency); T004 depends on T003 (needs slice name); T005 depends on T003
- Phase 3: T006 → T007 → T008 → T009 (sequential edits to same file)
- Phases 4 and 5: Can be worked in parallel (different selector imports, minimal overlap in file edits)
- Phase 7: T016 and T017 are [P]

---

## Parallel Opportunities

```bash
# Phase 2 - two files in parallel:
T002: src/services/api/recommendationsApi.ts
T003: src/store/slices/recommendationsSlice.ts
# Then sequentially:
T004: src/store/selectors/recommendationsSelectors.ts  (needs T003)
T005: src/store/store.ts                               (needs T003)

# Phases 4 and 5 share the same file (RecommendationsFinchPage.tsx)
# but can be reviewed independently if batching commits:
T010-T012: Proven Strategies section edits
T013: Strategic Solutions one-line selector swap

# Phase 7 - both test files in parallel:
T016: tests/store/slices/recommendationsSlice.test.ts
T017: tests/store/selectors/recommendationsSelectors.test.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Types (T001)
2. Complete Phase 2: Foundational (T002–T005)
3. Complete Phase 3: US1 (T006–T009)
4. **STOP and VALIDATE**: Navigate to Recommendations tab — Company/Benefits cards show workforce data, zero TypeScript errors

### Incremental Delivery

1. Setup + Foundational → Redux wired, type-check passes
2. - US1 → Company/Benefits Overview shows real workforce data (**MVP!**)
3. - US2 → Proven Strategies shows dynamic X/3 count and progress bar
4. - US3 → Strategic Solutions populated from recommendations stub
5. - US4 + Polish → Everything smoke-tested and quality-gated

---

## Notes

- **Zero visual changes**: This is a pure data-source migration. If the Recommendations tab looks different after this work, something is wrong.
- **Migration safeguard**: Never delete `getRecommendations()` function from `recommendationsApi.ts` — it is only commented out in the slice, not removed.
- **Selector naming collision**: `selectStrategicRecommendations` exists in `dashboardSelectors.ts` — do NOT use that name in `recommendationsSelectors.ts`. Use `selectRecommStrategicRecommendations`.
- All [P] tasks can run in parallel; [Story] label maps each task back to a specific user story for traceability.

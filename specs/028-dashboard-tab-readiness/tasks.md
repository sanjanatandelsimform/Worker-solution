# Tasks: Dashboard Tab Readiness, Skeletons & Shared "Did You Know" Content

**Input**: Design documents from `/specs/028-dashboard-tab-readiness/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, quickstart.md ✓

**Tests**: Not explicitly requested in this feature spec. Omitted.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and shared constant that all user stories depend on

- [ ] T001 [P] Extend `UseDashboardStatusPollingReturn` interface with readiness flags and processing window flag in `src/types/dashboardStatusTypes.ts`
- [ ] T002 [P] Create shared `didYouKnowSlides` constant and `DidYouKnowSlide` type in `src/constants/didYouKnowSlides.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Hook logic that exposes the readiness flags consumed by all three user stories

**⚠️ CRITICAL**: Tab pages cannot receive `isReady` until this phase is complete

- [ ] T003 Add `isRecommendationTabReady`, `isWorkforceTabReady`, `isIndustryTabReady` derived flags (useMemo) to `src/hooks/useDashboardStatusPolling.ts`
- [ ] T004 Add `hasExceededProcessingWindow` flag with 10-second interval timer to `src/hooks/useDashboardStatusPolling.ts`
- [ ] T005 Return all four new flags from the hook's return object in `src/hooks/useDashboardStatusPolling.ts`

**Checkpoint**: Hook now exposes all readiness and processing-window data. Downstream consumers can proceed.

---

## Phase 3: User Story 1 — Per-tab skeleton while data pending (Priority: P1) 🎯 MVP

**Goal**: Each dashboard tab shows its own skeleton independently when its section data is not yet ready.

**Independent Test**: Mock `useDashboardStatusPolling` to return mixed readiness (one ready, two pending). Verify the ready tab shows content and the pending tabs show skeletons. Tab switching works without errors.

### Implementation for User Story 1

- [ ] T006 [P] [US1] Add optional `isReady` prop to `RecommendationsFinchPage` and merge with existing `isLoading` guard in `src/pages/recommendations/RecommendationsFinchPage.tsx`
- [ ] T007 [P] [US1] Add optional `isReady` prop to `BenchmarkFinchPage` and merge with existing `isLoadingCards` in `src/pages/benchmark/BenchmarkFinchPage.tsx`
- [ ] T008 [P] [US1] Add optional `isReady` prop to `WorkforcePage` and merge with existing `isLoadingCards` in `src/pages/workforce/WorkforcePage.tsx`
- [ ] T009 [US1] Destructure readiness flags from `useDashboardStatusPolling` in `src/pages/dashboard/DashboardPage.tsx` and pass `isReady` prop to each tab panel component

**Checkpoint**: Each tab renders its skeleton when its corresponding readiness flag is `false`. Tabs switch freely. User Story 1 is complete and independently testable.

---

## Phase 4: User Story 2 — Shared "Did you know?" content (Priority: P2)

**Goal**: Both the Recommendations carousel and the dashboard loading modal consume the same canonical content list.

**Independent Test**: Verify `Carousel.tsx` renders entries from the shared list. Verify `DynamicLoadingModal` cycles through the same shared entries with source attribution.

### Implementation for User Story 2

- [ ] T010 [P] [US2] Remove inline `didYouKnowSlides` array and unused icon imports from `src/pages/recommendations/Carousel.tsx`; import from `@/constants/didYouKnowSlides`
- [ ] T011 [P] [US2] Remove internal `labels` array from `src/components/dashboard/DynamicLoadingModal.tsx`; import `didYouKnowSlides` from `@/constants/didYouKnowSlides` and map `slide.content` → `contentDescription`, `Source: ${slide.source}` → `contentNote`

**Checkpoint**: Both surfaces render from the single shared list. Updating one entry in `didYouKnowSlides.tsx` is reflected in both the carousel and the modal.

---

## Phase 5: User Story 3 — Loading modal auto-dismiss after 5 minutes (Priority: P2)

**Goal**: The loading modal is shown only while at least one tab is pending AND within the 5-minute processing window. After 5 minutes (or all tabs ready), the modal is hidden.

**Independent Test**: Mock `createdAt` > 5 minutes in the past with pending tabs. Verify modal is NOT shown. Mock `createdAt` < 5 minutes with pending tabs. Verify modal IS shown. Advance fake timers past 5 minutes; verify modal auto-hides.

### Implementation for User Story 3

- [ ] T012 [US3] Import `DynamicLoadingModal` in `src/pages/dashboard/DashboardPage.tsx`, compute `showLoadingModal` from `allTabsReady` and `hasExceededProcessingWindow`, render `<DynamicLoadingModal shouldShow={showLoadingModal} />`

**Checkpoint**: Modal appears only during processing window and hides automatically when 5 minutes elapse or all tabs are ready. User Story 3 is complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation, cleanup, formatting

- [ ] T013 [P] Run `pnpm run type-check` and fix any TypeScript errors across modified files
- [ ] T014 [P] Run `pnpm lint:fix` and `pnpm format` to ensure code style compliance
- [ ] T015 Smoke-test full flow: start dev server, verify Recommendations/Workforce/Industry tabs with mixed ready states, verify modal shows and auto-dismisses

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T001 (type interface) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion (hook must expose flags)
- **User Story 2 (Phase 4)**: Depends on T002 only (shared constant) — can run in parallel with US1
- **User Story 3 (Phase 5)**: Depends on Phase 2 (needs `hasExceededProcessingWindow`) and T009 (DashboardPage wiring)
- **Polish (Phase 6)**: Depends on all previous phases

### User Story Dependencies

- **User Story 1 (P1)**: Requires Phase 2 complete. No dependency on US2 or US3.
- **User Story 2 (P2)**: Requires T002 only. Independent of US1 and US3.
- **User Story 3 (P2)**: Requires Phase 2 + T009. Builds on US1 wiring.

### Within Each User Story

- T006, T007, T008 are independent ([P]) — different files
- T009 depends on T006–T008 (passes props to modified components)
- T010, T011 are independent ([P]) — different files
- T012 depends on T009 (DashboardPage must already have flags destructured)

### Parallel Opportunities

```
Phase 1:  T001 ─┐
          T002 ─┤ (parallel — different files)
                │
Phase 2:  T003 → T004 → T005 (sequential — same file)
                │
Phase 3:  T006 ─┐
          T007 ─┤ (parallel — different files)
          T008 ─┘
                │
          T009 (depends on T006–T008)
                │
Phase 4:  T010 ─┐ (can overlap with Phase 3 since T002 is complete)
          T011 ─┘ (parallel — different files)
                │
Phase 5:  T012 (depends on T009)
                │
Phase 6:  T013 ─┐
          T014 ─┘ (parallel)
          T015 (depends on T013–T014)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001, T002)
2. Complete Phase 2: Foundational (T003–T005)
3. Complete Phase 3: User Story 1 (T006–T009)
4. **STOP and VALIDATE**: Each tab independently shows skeleton vs. content based on polling status
5. Deploy/demo if ready — users already benefit from per-tab feedback

### Incremental Delivery

1. Setup + Foundational → Hook exposes all flags
2. User Story 1 → Tabs show skeletons → Deploy (MVP!)
3. User Story 2 → Content consolidated → Deploy
4. User Story 3 → Modal auto-dismiss → Deploy
5. Polish → Clean build, lint, smoke-test

### Single Developer (Sequential)

T001 → T002 → T003 → T004 → T005 → T006/T007/T008 → T009 → T010/T011 → T012 → T013 → T014 → T015

---

## Notes

- Total tasks: **15**
- Tasks per user story: US1 = 4, US2 = 2, US3 = 1, Setup = 2, Foundational = 3, Polish = 3
- Parallel opportunities: 5 parallelizable groups identified
- Independent test criteria documented per story
- Suggested MVP scope: Phase 1 + Phase 2 + Phase 3 (User Story 1) — delivers primary user value
- Format validation: ✅ ALL tasks follow `- [ ] [TaskID] [P?] [Story?] Description with file path` format

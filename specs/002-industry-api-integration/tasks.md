# Tasks: Dynamic Industry Lookup Integration

**Input**: Design documents from `/specs/002-industry-api-integration/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/industry-lookup.api.md

**Tests**: NOT included - test infrastructure not yet configured (see research.md decision #6)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `src/` at repository root
- All paths shown use frontend structure per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

**Status**: ✅ **COMPLETE** - Project already initialized with React 19.2.0, TypeScript 5.x, Vite, and all dependencies

No tasks required for this phase.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core API infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T001 [P] Add Industry interface to src/types/auth.ts (if not already present with correct structure: id: number, name: string)
- [X] T002 Implement getIndustries() API function in src/services/api/authApi.ts following existing patterns (GET /industry/lookup with 10s timeout, empty array validation, error handling)

**Checkpoint**: API function ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Current Industry Options (Priority: P1) 🎯 MVP

**Goal**: Dynamically load industries from API and populate dropdown, replacing hardcoded INDUSTRIES constant

**Independent Test**: Open registration form and verify dropdown displays industries from API (Network tab shows GET /industry/lookup request, dropdown populated with API data, no hardcoded values)

### Implementation for User Story 1

- [X] T003 [P] [US1] Add component state variables in src/components/auth/RegistrationForm.tsx (industries: Industry[], isLoadingIndustries: boolean, industryError: string | null)
- [X] T004 [US1] Implement useEffect hook in src/components/auth/RegistrationForm.tsx to fetch industries on component mount using getIndustries()
- [X] T005 [US1] Update industry dropdown in src/components/auth/RegistrationForm.tsx to map API data (industries.map(i => ({id: i.id.toString(), label: i.name})))
- [X] T006 [P] [US1] Comment out or remove INDUSTRIES constant in src/constants/formOptions.ts and remove import from RegistrationForm.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - dropdown populated from API with no hardcoded fallback

---

## Phase 4: User Story 2 - Handle Loading State (Priority: P2)

**Goal**: Display loading indicator while fetching industries to provide smooth UX

**Independent Test**: Throttle network to slow 3G in DevTools, reload form, verify "Loading industries..." text appears and dropdown is disabled during fetch

### Implementation for User Story 2

- [X] T007 [US2] Add disabled prop to dropdown in src/components/auth/RegistrationForm.tsx based on isLoadingIndustries state
- [X] T008 [US2] Add loading indicator below dropdown in src/components/auth/RegistrationForm.tsx (conditional text: "Loading industries..." displayed when isLoadingIndustries is true)
- [X] T009 [US2] Verify loading state properly set in useEffect hook (setIsLoadingIndustries(true) before fetch, false in finally block)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - loading state visible, then dropdown populates

---

## Phase 5: User Story 3 - Handle API Failure Gracefully (Priority: P3)

**Goal**: Display inline error message when API fails and keep dropdown disabled to prevent invalid submission

**Independent Test**: Simulate API failure (stop backend, modify API URL, or use Network tab to block request), verify error message appears below dropdown and dropdown remains disabled

### Implementation for User Story 3

- [X] T010 [US3] Update getIndustries() error handling in src/services/api/authApi.ts to validate non-empty array and use getErrorMessage() helper
- [X] T011 [US3] Add error message display in src/components/auth/RegistrationForm.tsx below dropdown (conditional inline error text displayed when industryError is not null)
- [X] T012 [US3] Update dropdown disabled condition in src/components/auth/RegistrationForm.tsx to include error state (disabled={isLoadingIndustries || !!industryError})
- [X] T013 [US3] Add error state handling in useEffect catch block in src/components/auth/RegistrationForm.tsx to set industryError with user-friendly message

**Checkpoint**: All user stories should now be independently functional - happy path, loading state, and error handling all work

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T014 [P] Verify TypeScript types are correct across all modified files (no any types, explicit return types, strict mode compliance)
- [ ] T015 Manually test all three user stories using quickstart.md testing checklist
- [X] T016 [P] Verify no console errors or warnings in browser DevTools
- [ ] T017 Test form submission with selected industry to ensure end-to-end flow works
- [X] T018 [P] Code review checklist: verify constitution compliance (component-first, type safety, no new dependencies, maintains UX)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: ✅ Complete - no action needed
- **Foundational (Phase 2)**: No dependencies - can start immediately - **BLOCKS all user stories**
- **User Stories (Phase 3-5)**: All depend on Foundational phase (T001, T002) completion
  - User stories can then proceed in parallel (if team capacity allows)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories (Phase 3-5) being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on T001 (Industry interface) and T002 (getIndustries function) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on T001, T002, AND T003-T005 (US1 state/fetch logic) - Extends US1 with loading UI
- **User Story 3 (P3)**: Depends on T001, T002, AND T003-T005 (US1 state/fetch logic) - Extends US1 with error UI

### Within Each User Story

**User Story 1:**
- T003 and T006 can run in parallel (different concerns: state setup vs constant removal)
- T004 depends on T003 (needs state variables defined)
- T005 depends on T003 and T004 (needs state and fetch logic)
- T006 independent but should complete before testing US1

**User Story 2:**
- T007, T008, T009 are sequential edits to same component but different sections - best done in order

**User Story 3:**
- T010 can start independently (API file)
- T011, T012, T013 are sequential edits to RegistrationForm - best done in order

### Parallel Opportunities

- **Within Foundational**: T001 and T002 can run in parallel (different files: types/auth.ts vs services/api/authApi.ts)
- **Within US1**: T003 and T006 can run in parallel (different files: RegistrationForm.tsx vs formOptions.ts)
- **Across User Stories** (if team capacity): After Foundational complete, one developer can work on US1 while another prepares US2/US3 changes (though US2/US3 need US1 state setup first)
- **Within Polish**: T014, T016, T018 can run in parallel (different files/activities: type checking, console verification, code review)

---

## Parallel Example: Foundational Phase

```bash
# Launch both foundational tasks together:
Developer A: "Add Industry interface to src/types/auth.ts"
Developer B: "Implement getIndustries() API function in src/services/api/authApi.ts"

# Both complete independently, then merge before starting user stories
```

---

## Parallel Example: User Story 1

```bash
# Launch tasks that touch different files:
Developer A: "Add component state variables in src/components/auth/RegistrationForm.tsx"
Developer B: "Comment out or remove INDUSTRIES constant in src/constants/formOptions.ts"

# Then Developer A continues with T004, T005 sequentially
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - RECOMMENDED

1. Complete Phase 2: Foundational (~15 minutes)
   - T001: Add/verify Industry interface (~3 min)
   - T002: Implement getIndustries() function (~12 min)
2. Complete Phase 3: User Story 1 (~35 minutes)
   - T003: Add state variables (~5 min)
   - T004: Implement fetch logic (~10 min)
   - T005: Update dropdown (~15 min)
   - T006: Remove constant (~5 min)
3. **STOP and VALIDATE**: Test User Story 1 independently per quickstart.md
4. Deploy/demo if ready - **MVP COMPLETE! 🎉**

**Total MVP Time**: ~50 minutes

### Incremental Delivery (Full Feature)

1. Complete Foundational (~15 min) → Foundation ready
2. Add User Story 1 (~35 min) → Test independently → **Deploy/Demo (MVP!)**
3. Add User Story 2 (~15 min) → Test independently → Deploy/Demo
4. Add User Story 3 (~20 min) → Test independently → Deploy/Demo
5. Polish (~20 min) → Final validation → Deploy/Demo

**Total Time**: ~105 minutes (~1.75 hours)

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With 2 developers:

1. **Together**: Complete Foundational (T001-T002) - ~15 min
2. **Split after Foundational**:
   - Developer A: User Story 1 (T003-T006) - ~35 min
   - Developer B: Prepare User Story 2 & 3 changes (review code, plan edits) - ~35 min
3. **Merge US1**, then:
   - Developer A: User Story 2 (T007-T009) - ~15 min
   - Developer B: User Story 3 (T010-T013) - ~20 min
4. **Merge all**, then together: Polish (T014-T018) - ~20 min

**Total Parallel Time**: ~70 minutes

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently testable after completion
- Commit after each task or logical group for easy rollback
- Stop at any checkpoint to validate story independently
- Tests NOT included - test infrastructure not yet configured (project-wide gap documented in research.md)
- See quickstart.md for detailed step-by-step implementation guide
- See contracts/industry-lookup.api.md for API endpoint specification
- Constitutional compliance: No new components, no new dependencies, maintains type safety, component-first architecture preserved

---

## Task Summary

| Phase | Task Count | Estimated Time | Can Start After |
|-------|------------|----------------|-----------------|
| Setup | 0 | 0 min | N/A (complete) |
| Foundational | 2 | 15 min | Immediately |
| User Story 1 (P1) | 4 | 35 min | Foundational |
| User Story 2 (P2) | 3 | 15 min | US1 complete |
| User Story 3 (P3) | 4 | 20 min | US1 complete |
| Polish | 5 | 20 min | All stories |
| **Total** | **18** | **~105 min** | |

**Critical Path**: Setup (0m) → Foundational (15m) → US1 (35m) → US2 (15m) → US3 (20m) → Polish (20m) = **~105 minutes**

**MVP Path**: Setup (0m) → Foundational (15m) → US1 (35m) = **~50 minutes**

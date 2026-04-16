# Tasks: Dynamic Participation Breakdown Items

**Input**: Design documents from `specs/012-participation-dynamic-items/`  
**Prerequisites**: [plan.md](./plan.md) ✅ | [spec.md](./spec.md) ✅ | [research.md](./research.md) ✅ | [data-model.md](./data-model.md) ✅ | [contracts/workforce-participation-update.md](./contracts/workforce-participation-update.md) ✅ | [quickstart.md](./quickstart.md) ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this belongs to (US1, US2)
- All paths are relative to repository root

---

## Phase 1: Setup

**Purpose**: No new project infrastructure required — pure type + logic change within existing structure. This phase is trivially empty; work begins directly in Phase 2 (Foundational).

_No setup tasks needed — no new dependencies, no new directories, no configuration changes._

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Update the TypeScript interface contract first, since every other change in this feature depends on the new `EnrollmentItem` type being defined. Until `workforceTypes.ts` is updated, all downstream files are in a TypeScript error state.

**⚠️ CRITICAL**: Tasks T001 and T002 must be complete before test fixture tasks (T003–T006) are attempted. T001 must precede T002.

- [x] T001 Add `EnrollmentItem` interface, update `Participation` interface fields to `EnrollmentItem[]`, and remove `BenefitsEnrollment`, `RetirementEnrollment`, `InsuranceEnrollment` interfaces in `src/types/workforceTypes.ts`
- [x] T002 Replace the three hardcoded `useMemo` blocks in `src/hooks/useWorkforceParticipationConfig.tsx` with `.map()` calls over `benefits`, `retirement`, and `insurance` arrays; remove hardcoded EAP tooltip

**Checkpoint**: `pnpm run type-check` should report errors only in test files and `workforceSlice.ts` (mock data still uses old shape). Hook output type (`ProgressItem[]`) is unchanged.

---

## Phase 3: User Story 1 — Dynamic Participation Items Rendered (Priority: P1) 🎯 MVP

**Goal**: Both the item labels and enrollment percentages in the Benefits, Retirement, and Insurance sections are driven entirely by the backend response arrays. Adding or removing an item on the backend side is reflected in the UI with zero frontend changes.

**Independent Test**: Update `STATIC_WORKFORCE_DATA` in the slice to include a 4th benefit item (e.g., `{ name: "Pet Insurance", enrollment: "12%" }`). Open the app with `pnpm dev`, navigate to the Workforce page, and confirm a 4th row appears in the Benefits section without any other code changes.

### Implementation for User Story 1

- [x] T003 [P] [US1] Update `STATIC_WORKFORCE_DATA.participation` in `src/store/slices/workforceSlice.ts` to use the new array format: `benefits`, `retirement`, `insurance` become `EnrollmentItem[]` arrays matching the sample API response from the spec
- [x] T004 [P] [US1] Update the two mock `participation` objects in `tests/store/workforceSlice.test.ts` (one in the `fulfilled` test, one in the `clearWorkforce` test) to use `EnrollmentItem[]` array format
- [x] T005 [P] [US1] Update the `mockWorkforceData` constant in `tests/store/workforceSelectors.test.ts` to use `EnrollmentItem[]` array format for `benefits`, `retirement`, `insurance`
- [x] T006 [P] [US1] Update the `mockWorkforceResponse` constant in `tests/services/workforceApi.test.ts` to use `EnrollmentItem[]` array format for `benefits`, `retirement`, `insurance`

**Checkpoint**: At this point all TypeScript errors are resolved. `pnpm run type-check` passes with zero errors; `pnpm test` passes with all tests green.

---

## Phase 4: User Story 2 — Graceful Loading and Error States (Priority: P2)

**Goal**: The Participation Breakdown section's loading skeleton and error state are unchanged by the data shape migration. Empty arrays from the backend render zero items without errors.

**Independent Test**: In `workforceSlice.ts`, temporarily set `benefits: []`, `retirement: []`, `insurance: []` in `STATIC_WORKFORCE_DATA`. Load the Workforce page — the participation section renders with empty progress card groups and no console errors.

_No new implementation tasks_ — this story's behavior is guaranteed by the array-safe `?? []` fallbacks in T002 (`(participationSection?.benefits ?? []).map(...)`). The existing loading skeleton in `WorkforceParticipation.tsx` is already driven by the `isLoading` prop and is unaffected.

**Verification only**: After T003–T006 pass, manually confirm:

- Loading skeleton still renders while `isLoadingCards` is `true`
- Empty array for any category silently renders zero items (no JS errors in console)

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T007 Run `pnpm run type-check` and confirm zero TypeScript errors
- [x] T008 Run `pnpm lint:fix` and `pnpm format` across changed files
- [x] T009 Run `pnpm test` and confirm all tests pass with zero failures

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No external dependencies — start immediately
- **User Story 1 (Phase 3)**: Depends on T001 + T002 (Phase 2) — T003–T006 can run in parallel with each other once foundation is done
- **User Story 2 (Phase 4)**: No additional implementation tasks — verified after US1 is complete
- **Polish (Phase 5)**: Depends on T001–T006 all complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on T001 → T002 → then T003/T004/T005/T006 in parallel
- **User Story 2 (P2)**: No tasks — automatically satisfied by the `?? []` guards written in T002

### Within Phase 3 (US1)

- T003, T004, T005, T006 all touch different files → fully parallelizable
- All four depend on T001 and T002 being complete (TypeScript must compile)

---

## Parallel Execution Example: Phase 3 (US1)

Once T001 and T002 are complete, all four Phase 3 tasks can run simultaneously:

```text
Developer / Agent 1: T003 — src/store/slices/workforceSlice.ts
Developer / Agent 2: T004 — tests/store/workforceSlice.test.ts
Developer / Agent 3: T005 — tests/store/workforceSelectors.test.ts
Developer / Agent 4: T006 — tests/services/workforceApi.test.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001: Update TypeScript interfaces in `workforceTypes.ts`
2. Complete T002: Update hook to use `.map()` in `useWorkforceParticipationConfig.tsx`
3. Complete T003–T006 in parallel: Update static mock and test fixtures
4. **STOP and VALIDATE**: `pnpm run type-check` + `pnpm test` both pass → MVP complete

### Incremental Delivery

1. T001 + T002 → Foundation complete (compile-time contract established)
2. T003 → Static data updated → App renders dynamic items when run locally
3. T004 + T005 + T006 → All test fixtures aligned → CI green
4. T007 + T008 + T009 → Polish complete → Ready for PR

---

## Notes

- [P] tasks touch different files — safe to run in parallel with no merge conflicts
- T001 must precede T002 (hook references `EnrollmentItem` implicitly via the updated `Participation` type)
- T002 must precede T003–T006 (mock data must satisfy the new TypeScript type)
- No new files are created — all 6 changes are edits to existing files
- `WorkforceParticipation.tsx`, `WorkforcePage.tsx`, `workforceSelectors.ts`, and `workforceApi.ts` require **zero changes** per research.md
- See [quickstart.md](./quickstart.md) for exact before/after code snippets for every task

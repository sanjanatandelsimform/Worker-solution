---
description: "Task list for 036-industry-average-wage"
---

# Tasks: Update `industryAverageWage` to Object Type

**Branch**: `036-industry-average-wage`  
**Input**: [spec.md](./spec.md) · [plan.md](./plan.md) · [data-model.md](./data-model.md) · [quickstart.md](./quickstart.md)  
**Total tasks**: 5 across 4 phases  
**Parallel opportunities**: T002 and T003 can run in parallel after T001

---

## Phase 1: Foundational — Type Definition Update

**Purpose**: Update the TypeScript type for `IndustryOverview.industryAverageWage`. This is the single blocking prerequisite — US1 and US2 both depend on this change being in place first.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete. A type error from this change is expected to propagate until US1 (extraction fix) is applied.

- [x] T001 Update `industryAverageWage` field type in `IndustryOverview` from `number` to `SalaryHourly` in `src/types/industryTypes.ts` (line 33: `industryAverageWage: number` → `industryAverageWage: SalaryHourly`)

**Checkpoint**: `pnpm run type-check` will show a type error in `RecommendationsFinchPage.tsx` after this change — that is expected and will be fixed in Phase 2. All other files should remain error-free.

---

## Phase 2: User Story 1 — Fix Extraction in Recommendations Page (Priority: P1) 🎯 MVP

**Goal**: The Recommendations page correctly reads `salary` from the new object so the National Industry Median Wage card displays the annual salary (e.g., `$56,770`) as before.

**Independent Test**: Mock `useIndustry` to return `industryAverageWage: { hourly: 27.29, salary: 56770 }` and assert the card renders `$56,770`. Null industry data still renders "N/A".

### Implementation for User Story 1

- [x] T002 [US1] Append `.salary` to the `industryAverageWage` optional chain in `src/pages/recommendations/RecommendationsFinchPage.tsx` (line ~54: `?.industryAverageWage` → `?.industryAverageWage?.salary`)

**Checkpoint**: `pnpm run type-check` must pass with 0 errors after T002. The Recommendations page correctly resolves salary from the new object type.

---

## Phase 3: User Story 2 — Update Test Fixture (Priority: P2)

**Goal**: The test fixture in `RecommendationsFinchPage.test.tsx` that mocks `industryAverageWage` as a flat number is updated to the new object shape so the test continues to assert `$45,000` correctly.

**Independent Test**: `pnpm run test` passes with 0 failures. The test `"displays formatted industryAverageWage from useIndustry hook"` still asserts `screen.getByText("$45,000")`.

### Implementation for User Story 2

- [x] T003 [P] [US2] Update fixture in `tests/pages/RecommendationsFinchPage.test.tsx` (line ~358): change `industryAverageWage: 45000` to `industryAverageWage: { salary: 45000, hourly: 21.63 }` inside the `"displays formatted industryAverageWage from useIndustry hook"` test mock

> Note: T002 and T003 can be worked in parallel (different files, no inter-dependency after T001). T003 works in the test file; T002 in the source file.

**Checkpoint**: All three changed files compile cleanly. The test assertion `$45,000` passes because `.salary` is now extracted in the component.

---

## Phase 4: Polish & Validation

**Purpose**: Confirm the full quality gate passes end-to-end.

- [x] T004 Run `pnpm run type-check` and confirm exit code 0 with 0 errors
- [x] T005 [P] Run `pnpm run test` and confirm exit code 0 with 0 failures — fix any remaining failures before marking complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately
- **User Story 1 (Phase 2)**: Depends on T001 (type change must exist for the extraction to be type-valid)
- **User Story 2 (Phase 3)**: Depends on T001 (fixture type must match the new interface); can run in parallel with T002
- **Polish (Phase 4)**: Depends on T001 + T002 + T003 all being complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational (T001) — no dependency on US2
- **US2 (P2)**: Depends on Foundational (T001) — no dependency on US1 (different file)

### Within Each User Story

- Each user story is a single task in a single file — no intra-story ordering needed

### Parallel Opportunities

- **T002 and T003** can run in parallel once T001 is complete (different files)
- **T004 and T005** must run after all implementation tasks — T004 and T005 can run in parallel

---

## Parallel Example: After T001 completes

```
T001 complete
├── T002 [US1] RecommendationsFinchPage.tsx (extraction fix)
└── T003 [US2] RecommendationsFinchPage.test.tsx (fixture update)
         ↓ (both complete)
   T004 pnpm run type-check
   T005 pnpm run test
```

---

## Implementation Strategy

**MVP scope**: T001 + T002 (Phases 1 and 2) constitute the functional fix. The page will render correctly. T003 (Phase 3) makes the test suite green. T004/T005 validate quality gates.

**Recommended order for a solo developer**: T001 → T002 → T003 → T004 → T005 (sequential, ~10 min total).

---

## Format Validation

All tasks follow the required checklist format:

| Task | Checkbox | ID  | [P]                       | [Story]          | File path |
| ---- | -------- | --- | ------------------------- | ---------------- | --------- |
| T001 | ✅       | ✅  | — (sequential)            | — (foundational) | ✅        |
| T002 | ✅       | ✅  | — (sequential after T001) | ✅ US1           | ✅        |
| T003 | ✅       | ✅  | ✅                        | ✅ US2           | ✅        |
| T004 | ✅       | ✅  | — (validation gate)       | —                | ✅        |
| T005 | ✅       | ✅  | ✅                        | —                | ✅        |

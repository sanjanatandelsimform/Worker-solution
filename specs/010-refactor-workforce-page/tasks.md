---
description: "Task list for 010-refactor-workforce-page"
---

# Tasks: Refactor WorkforcePage into Smaller Modules

**Input**: Design documents from `specs/010-refactor-workforce-page/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅, contracts/ ✅  
**Branch**: `009-workforce-tab-api`  
**Tests**: Not included — pure structural refactor; no new behaviors; existing test suite is regression safety net (research.md RQ-2)

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (independent files, no dependency on sibling tasks)
- **[Story]**: User story this task belongs to (US1, US2, US3)
- No story label → Setup or Foundational phase

---

## Phase 1: Setup

**Purpose**: Extract shared utility before any section file imports it.  
No blockers — start immediately.

- [x] T001 Create `src/pages/workforce/workforceUtils.ts` with exported `parsePercentage(value: string): number` function (move exact implementation from `WorkforcePage.tsx`; add JSDoc `@example` comments per data-model.md §1)

**Checkpoint ✅ T001 done**: Run `pnpm run type-check` — must pass with zero errors.

---

## Phase 2: Foundational — Skeleton Loaders (US2)

**Purpose**: Consolidate all 8 skeleton loading components into one named-export file.  
**⚠️ CRITICAL**: This phase MUST be complete before any Phase 3 section component is created — all section files import from `WorkforceSkeletons.tsx`.

**Goal (US2)**: `WorkforceSkeletons.tsx` exists with all 8 skeleton components exported by name; any section file can do `import { OverviewCardSkeleton } from "@/pages/workforce/WorkforceSkeletons"`.

**Independent Test for US2**: Open `src/pages/workforce/WorkforceSkeletons.tsx` and confirm 8 named exports: `OverviewCardSkeleton`, `WagesCardSkeleton`, `ProgressCardSkeleton`, `ProgressCardSkeletonOne`, `ProgressCardSkeletonFour`, `DonutChartSkeleton`, `BreakDownCardSkeleton`, `BreakDownChartSkeleton`. Each renders the same animated-pulse JSX as currently in `WorkforcePage.tsx`.

- [x] T002 [US2] Create `src/pages/workforce/WorkforceSkeletons.tsx`: move all 8 skeleton components verbatim from `WorkforcePage.tsx`, converting them from local `const` declarations to named `export const` declarations (data-model.md §2); no `"use client"` directive; all imports use `@/` alias

**Checkpoint ✅ T002 done**: Run `pnpm run type-check` — must pass. Verify `WorkforcePage.tsx` still builds (skeletons are still defined there until Phase 4; T002 only adds the new file).

---

## Phase 3: User Story 1 — Section Components (Priority: P1) 🎯 MVP

**Goal (US1)**: All four workforce page sections exist as independent, purely presentational components in `src/pages/workforce/`. Each is identifiable by name, contains only its section's JSX and config interfaces, and has a typed props interface matching data-model.md.

**Independent Test for US1**: Navigate to `src/pages/workforce/` and confirm the four files exist. Open each and confirm: (a) no Redux imports, (b) correct prop interface, (c) all JSX for that section is present, (d) `pnpm run type-check` passes.

> All T003–T006 tasks are independent of each other and can be worked in parallel after T002.

- [x] T003 [P] [US1] Create `src/pages/workforce/WorkforceOverview.tsx`: define `OverviewCardConfig` + `WorkforceOverviewProps` interfaces inline; render 4-column overview cards grid, 3-column employee cards grid, and "Did you know?" banner; import skeletons from `@/pages/workforce/WorkforceSkeletons`; import `StaticCard` from `@/pages/recommendations/StaticCard`; import `didHeroImg` from `@/assets/employees-reported.jpg`; default export with one-line JSDoc; all imports use `@/` alias (data-model.md §3)

- [x] T004 [P] [US1] Create `src/pages/workforce/WorkforceParticipation.tsx`: define `ParticipationCardConfig` + `WorkforceParticipationProps` interfaces inline (accepts `participationCardsConfig`, `benefitsItems`, `retirementItems`, `insuranceItems` as typed props); render section heading + description, 2×4 participation count grid, three `<ProgressCard>` rows (Benefits / Retirement / Insurance) with skeleton fallbacks; import `ProgressItem` type from `@/pages/benchmark/ProgressCard`; import skeletons from `@/pages/workforce/WorkforceSkeletons`; default export with one-line JSDoc (data-model.md §4)

- [x] T005 [P] [US1] Create `src/pages/workforce/WorkforceDemographics.tsx`: define `DemographicsCardConfig`, `DonutChartConfig`, `AgeBreakdownConfig`, `DropdownItem`, `WorkforceDemographicsProps` interfaces inline; define `employmentTypeItems` static array as module-level constant; render section heading + department `<Select>`, 2-column gender card grid, "Employment Type" card with 3 `<DonutChart>` rings, "Employment Breakdown by Age" card with employment-type `<Select>` and `<ProgressBar>` rows; import `DonutChart` from `@/pages/workforce/EmployTypeChart`; import skeletons from `@/pages/workforce/WorkforceSkeletons`; accepts filter state pairs as props (`selectedDepartment`/`setSelectedDepartment`, `selectedEmploymentType`/`setSelectedEmploymentType`); default export with one-line JSDoc (data-model.md §5)

- [x] T006 [P] [US1] Create `src/pages/workforce/WorkforceCompensation.tsx`: define `CompensationCardConfig`, `SalaryBreakdownCardConfig`, `DropdownItem`, `ChartItem`, `WorkforceCompensationProps` interfaces inline; render section heading, 3-column compensation cards grid, "Workforce Breakdown" sub-section with department `<Select>` + `<Table>` (or empty-state image), "Benefits Cost Breakdown" heading, 2-column salary breakdown cards, `<SalaryChart>`, and benefits cost `<Table>`; import `Table` + `TableColumn` from `@/components/base/table`; import `SalaryChart` from `@/pages/workforce/SalaryChart`; import `emptyStateWorkforce` from `@/assets/placeholder.svg`; import skeletons from `@/pages/workforce/WorkforceSkeletons`; accepts `selectedWorkforceDept`/`setSelectedWorkforceDept` + all pre-computed table and chart arrays as props; default export with one-line JSDoc (data-model.md §6)

**Checkpoint ✅ T003–T006 done**: Run `pnpm run type-check` — must pass. Each of the four new files compiles independently.

---

## Phase 4: User Story 3 — Trim Parent & Regression Validation (Priority: P1)

**Goal (US3)**: `WorkforcePage.tsx` is reduced to < 150 lines; the page renders identically to before; all interactive elements (dropdowns, table filtering) function exactly as before.

**Independent Test for US3**: (a) `wc -l WorkforcePage.tsx` (or line-count check) shows < 150 lines. (b) Load `/dashboard` → Workforce tab in the running app. (c) Exercise all dropdowns and confirm no visual/behavioral change. (d) `pnpm run type-check` passes.

- [x] T007 [US3] Trim `src/pages/workforce/WorkforcePage.tsx`: (1) remove the 8 inline skeleton `const` definitions (now in `WorkforceSkeletons.tsx`); (2) remove the `parsePercentage` local definition and add `import { parsePercentage } from "@/pages/workforce/workforceUtils"`; (3) remove the `employmentTypeItems` array definition; (4) add imports for `WorkforceOverview`, `WorkforceParticipation`, `WorkforceDemographics`, `WorkforceCompensation` from `@/pages/workforce/`; (5) in the JSX `return`, replace the four section JSX blocks with the four section component calls passing all pre-computed config arrays and state as typed props; (6) keep all `useState`, all `useAppSelector` calls, all config array computations, page header h2/p, `<ErrorMessage>`, footer disclaimer, and `<GetInTouchModal>` exactly as-is (spec FR-008, FR-015, quickstart.md Step 7); target: < 150 lines

- [x] T008 [US3] Run `pnpm run type-check` in the terminal and confirm zero TypeScript errors across all 7 modified/created files in `src/pages/workforce/` (SC-004)

- [x] T009 [US3] Smoke test: run `pnpm dev`, navigate to the Workforce page, verify (a) all four sections render with correct layout, (b) Demographics department dropdown updates donut charts and age breakdown, (c) Demographics employment type dropdown updates age bars, (d) Compensation workforce breakdown dropdown switches table between department and job-title views, (e) loading skeletons appear on first load (SC-003, US3 acceptance scenarios 1–3)

**Checkpoint ✅ T007–T009 done**: All US3 acceptance criteria met. Page is visually and functionally identical to pre-refactoring state.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Code quality gate and final SC-001 line-count verification.

- [x] T010 [P] Run `pnpm lint:fix` then `pnpm format` — resolve any ESLint warnings or Prettier formatting issues introduced by the new files; commit clean
- [x] T011 [P] Verify `src/pages/workforce/WorkforcePage.tsx` line count is ≤ 150 (SC-001); if over, identify and move any remaining inline JSX blocks to their appropriate section file

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational/US2)**: Depends on Phase 1 (T001 helpful for context but T002 has no hard import dependency on T001)
- **Phase 3 (US1)**: ALL tasks (T003–T006) depend on T002 being complete; T003–T006 are independent of each other
- **Phase 4 (US3)**: T007 depends on T003 + T004 + T005 + T006 all being complete; T008 depends on T007; T009 depends on T008
- **Phase 5 (Polish)**: Depends on Phase 4 completion

### User Story Dependencies

- **US2 (P2 → Foundational)**: Prerequisite for US1. Must be complete before section files can import skeletons.
- **US1 (P1, × 4 tasks)**: All four tasks are independent of each other after US2. Can be implemented in parallel.
- **US3 (P1)**: Depends on US1 and US2 being complete. Final integration and validation step.

### Within Each Phase

- Phase 3 tasks (T003–T006): No ordering constraint between them; any order or complete in parallel
- Phase 4 tasks: T007 → T008 → T009 (sequential)
- Phase 5 tasks: T010 and T011 can run in parallel

---

## Parallel Execution Examples

### Phase 3 — US1 (run all in parallel if team allows)

```text
T002 done ──┬──► T003 WorkforceOverview.tsx
            ├──► T004 WorkforceParticipation.tsx
            ├──► T005 WorkforceDemographics.tsx
            └──► T006 WorkforceCompensation.tsx
                 (all four complete)
                       │
                       ▼
                    T007 Trim WorkforcePage.tsx
                       │
                       ▼
                    T008 type-check
                       │
                       ▼
                    T009 Smoke test
```

### Single-developer sequence (recommended)

```text
T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011
```

---

## Implementation Strategy

**MVP Scope**: US1 alone (T001–T006 + T007 trim + T008 type-check) delivers the primary developer-experience value — a readable, modular codebase. US3 validation (T009 smoke test) and Polish (T010–T011) complete the definition of done.

**Suggested delivery order**:

1. T001 + T002 (foundation, ~15 min)
2. T003–T006 in parallel or sequence (~60–90 min total)
3. T007–T009 (trim + validate, ~30 min)
4. T010–T011 (polish, ~5 min)

**Total estimated tasks**: 11  
**New files**: 6 (`workforceUtils.ts`, `WorkforceSkeletons.tsx`, `WorkforceOverview.tsx`, `WorkforceParticipation.tsx`, `WorkforceDemographics.tsx`, `WorkforceCompensation.tsx`)  
**Modified files**: 1 (`WorkforcePage.tsx`)  
**Unchanged files**: `SalaryChart.tsx`, `EmployTypeChart.tsx`, all Redux/store files, all other `src/` files

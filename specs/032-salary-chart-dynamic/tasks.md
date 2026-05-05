# Tasks: Dynamic Salary Chart Scale & Null Handling

**Branch**: `032-salary-chart-dynamic`
**Input**: [spec.md](./spec.md)
**Date**: 2026-05-04

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files or no inter-task dependency)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Exact file paths included in every task description

---

## Phase 1: Foundational (Blocking Prerequisite)

**Purpose**: Update the `ChartItem` type to allow `null` on numeric fields. Both user stories depend on this: US1 needs to skip null values when computing `maxValue`, and US2 needs to guard against null when drawing bars.

**⚠️ CRITICAL**: Both user story implementation tasks depend on this phase being complete.

- [ ] T001 Update `ChartItem` type in `src/pages/workforce/SalaryChart.tsx` to allow `null` on `boxStart`, `boxEnd`, `max`, and `min` fields (`number | null`)

**Checkpoint**: `ChartItem` type now reflects real backend data shape — proceed to US1 and US2 in parallel.

---

## Phase 2: User Story 1 — Dynamic Chart Scale (Priority: P1) 🎯 MVP

**Goal**: Replace the hardcoded `maxValue = 700` and `for (let i = 0; i <= 7; i++)` with values derived from the actual data range, so the Y-axis and grid lines always fit the data.

**Independent Test**: Render the chart with data whose maximum value differs from 700 (e.g., max 545) and verify that `fillText` is called with `$600` as the top grid label and that exactly 6 grid-line `beginPath` / `stroke` pairs are made.

### Implementation for User Story 1

- [x] T002 [US1] Compute `maxValue` dynamically in `drawChart` in `src/pages/workforce/SalaryChart.tsx`: collect all non-null numeric values from `data`, find the overall max, round up to the nearest 100, then if the gap between `rounded` and `dataMax` is less than 70, add another 100 — ensuring at least a 70-unit visual gap above the tallest bar. Fall back to `100` when no valid value exists.
- [ ] T003 [US1] Derive `rowCount = maxValue / 100` in `drawChart` and update `drawGrid` loop in `src/pages/workforce/SalaryChart.tsx`: change `for (let i = 0; i <= 7; i++)` to `for (let i = 1; i <= rowCount; i++)` so grid lines are drawn at `$100` through `$maxValue`

### Tests for User Story 1

- [ ] T004 [P] [US1] Add a `"dynamic scale"` describe block in `tests/pages/SalaryChart.test.tsx` with these cases:
  - Data with max 545 → top `fillText` grid call is `$600`, exactly 6 grid-line strokes
  - Data with max exactly 700 → top label `$700`, 7 grid-line strokes
  - Empty data `[]` → top label `$100`, 1 grid-line stroke (fallback minimum)
  - Data with max that is already a multiple of 100 (e.g., 600) → top label `$600`, no over-rounding

**Checkpoint**: US1 is fully functional and independently testable. Chart scale matches data for any dataset.

---

## Phase 3: User Story 2 — Null Data Item Suppression (Priority: P1)

**Goal**: Skip drawing (no whisker, no box, no labels) for any `ChartItem` where at least one numeric field (`boxStart`, `boxEnd`, `min`, `max`) is `null` or `undefined`, so no "$null" text appears and no broken partial shapes are rendered.

**Independent Test**: Render the chart with one all-null item and verify `fillRect` and `strokeRect` are never called for that item, and no `fillText` call contains the string `"null"`.

### Implementation for User Story 2

- [ ] T005 [US2] Add an `isValidItem` guard at the top of the `data.forEach` loop inside `drawBars` in `src/pages/workforce/SalaryChart.tsx`: if `item.min == null || item.max == null || item.boxStart == null || item.boxEnd == null`, return early (skip all drawing for that item)

### Tests for User Story 2

- [ ] T006 [P] [US2] Add a `"null data suppression"` describe block in `tests/pages/SalaryChart.test.tsx` with these cases:
  - All-null item (`{ label: "X", boxStart: null, boxEnd: null, max: null, min: null }`) → `fillRect` never called, `strokeRect` never called
  - All-null item → no `fillText` call contains the substring `"null"`
  - Mixed dataset (1 null item + 2 valid items) → `fillRect` called exactly 2 times (only valid items)
  - Fully valid dataset (no nulls) → existing behaviour unchanged, `fillRect` called for every item

**Checkpoint**: US2 is fully functional. No null artefacts appear on the chart regardless of backend data.

---

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T007 [P] Run `pnpm run type-check` and resolve any TypeScript errors introduced by the `ChartItem` null union change in `src/pages/workforce/SalaryChart.tsx` (e.g., `scaleY` receives `number`, so it must only be called after null guard)
- [ ] T008 [P] Run `pnpm run test tests/pages/SalaryChart.test.tsx` and confirm all tests pass — both pre-existing tests and the new ones added in T004 and T006

---

## Dependency Graph

```
T001 (ChartItem type)
 ├── T002 (compute maxValue)
 │    └── T003 (rowCount + drawGrid loop)
 │         └── T004 [P] (US1 tests)
 └── T005 (isValidItem guard in drawBars)
      └── T006 [P] (US2 tests)

T007 + T008 depend on T003 and T005 both complete
```

## Parallel Execution Opportunities

Once T001 is done, T002–T003 (US1) and T005 (US2) are independent:

| Stream A (US1)           | Stream B (US2)         |
| ------------------------ | ---------------------- |
| T002 compute maxValue    | T005 isValidItem guard |
| T003 rowCount + drawGrid | —                      |
| T004 US1 tests           | T006 US2 tests         |

Both streams converge at T007/T008 (polish).

## Implementation Strategy

**MVP scope**: T001 → T002 → T003 → T005 (4 tasks, one file) delivers both user stories with no tests. Add T004 + T006 for full TDD coverage. T007 + T008 validate correctness.

**Suggested order for single developer**: T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008

## Total Task Count

| Phase              | Tasks | Story |
| ------------------ | ----- | ----- |
| Foundational       | 1     | —     |
| US1 Implementation | 2     | US1   |
| US1 Tests          | 1     | US1   |
| US2 Implementation | 1     | US2   |
| US2 Tests          | 1     | US2   |
| Polish             | 2     | —     |
| **Total**          | **8** |       |

**Parallelizable**: T004, T006, T007, T008 (4 tasks)
**Files touched**: `src/pages/workforce/SalaryChart.tsx` (1 source), `tests/pages/SalaryChart.test.tsx` (1 test)

# Tasks: Keep Salary Band Label When No Data

**Branch**: `034-keep-salary-band-label`  
**Input**: Design documents from `specs/034-keep-salary-band-label/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Exact file paths included in every task description

---

## Phase 1: Setup

**Purpose**: No project initialization needed — this feature modifies two existing files. Phase 1 is a no-op; proceed directly to Phase 2.

_(No tasks — feature modifies existing files only, no scaffolding required)_

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Verify the baseline tests pass before any change is made, so regressions can be detected unambiguously.

**⚠️ CRITICAL**: Must complete before Phase 3.

- [x] T001 Run `pnpm run test -- --reporter=verbose tests/pages/SalaryChart.test.tsx` and confirm all existing tests pass (baseline green)

**Checkpoint**: Baseline confirmed green — implementation can begin.

---

## Phase 3: User Story 1 — Salary Band Label Always Visible (Priority: P1) 🎯 MVP

**Goal**: The salary band label at the bottom of each chart column renders regardless of whether that column's numeric data is null, while bars and value labels remain suppressed for null-data items.

**Independent Test**: Render `<SalaryRangeChart>` with one all-null item `{ label: "X", boxStart: null, boxEnd: null, max: null, min: null }`. Confirm `fillRect` is NOT called but `fillText` IS called with `"X"`.

### Tests for User Story 1

> **Write these tests FIRST — they must FAIL before implementation (TDD Red step)**

- [x] T002 [US1] Add test `"renders the salary band label for an all-null item"` to the `"null data suppression"` describe block in `tests/pages/SalaryChart.test.tsx` — assert `mockCtx.fillText.mock.calls.map(([text]) => String(text))` contains `"X"` when data is `[{ label: "X", boxStart: null, boxEnd: null, max: null, min: null }]`
- [x] T003 [US1] Add test `"renders all labels in a mixed null/valid dataset"` to the `"null data suppression"` describe block in `tests/pages/SalaryChart.test.tsx` — assert `fillText` calls contain `"Null"`, `"IT"`, and `"HR"` when dataset has one null item and two valid items
- [x] T004 [US1] Run `pnpm run test -- tests/pages/SalaryChart.test.tsx` and confirm T002 and T003 FAIL (Red) while all pre-existing tests still pass

### Implementation for User Story 1

- [x] T005 [US1] In `src/pages/workforce/SalaryChart.tsx`, inside `drawBars()`: move `const x = chartLeft + columnSpacing * (index + 0.75);` to BEFORE the null guard `if (item.min == null || …)` block
- [x] T006 [US1] In `src/pages/workforce/SalaryChart.tsx`, inside the null guard body (before `return`): add the three label-rendering statements — `ctx.fillStyle = "#111827"`, `ctx.textAlign = "center"`, `ctx.font = "14px Inter Regular, sans-serif"`, `ctx.fillText(item.label, x, 420)` — then `return`
- [x] T007 [US1] In `src/pages/workforce/SalaryChart.tsx`: update the inline comment from `// Skip items with any null numeric field — no box, whisker, or label drawn` to `// Skip items with any null numeric field — no box, whisker, or value labels drawn`
- [x] T008 [US1] Run `pnpm run test -- tests/pages/SalaryChart.test.tsx` and confirm T002 and T003 now PASS (Green) and all pre-existing tests still pass

**Checkpoint**: `SalaryRangeChart` now always renders salary band labels. User Story 1 fully testable.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gate across the full test suite and type checking.

- [x] T009 [P] Run `pnpm run type-check` — confirm 0 TypeScript errors
- [x] T010 [P] Run `pnpm run test` (full suite) — confirm 0 failures across all test files
- [x] T011 Run `pnpm lint:fix` then `pnpm format` — confirm no lint or format errors remain

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: N/A — skipped, no scaffolding needed
- **Phase 2 (Foundational)**: No dependencies — start immediately (T001)
- **Phase 3 (User Story 1)**: Depends on Phase 2 completion
  - Tests (T002, T003) must be written first and confirmed FAILING (T004)
  - Implementation (T005, T006, T007) follows
  - Green gate (T008) confirms story complete
- **Phase 4 (Polish)**: Depends on Phase 3 completion

### User Story Dependencies

- **US1**: Only story. No inter-story dependencies.

### Within Phase 3

```
T002 → T003 → T004 (new tests written + confirmed RED)
                  ↓
            T005 → T006 → T007 (implementation)
                              ↓
                           T008 (confirm GREEN)
```

T002 and T003 can be written in parallel (different `it()` blocks, same file). T005, T006, T007 are sequential edits to the same function; apply as one diff for simplicity.

### Phase 4 Parallel Opportunities

T009 and T010 can run in parallel (independent commands). T011 runs after both pass.

---

## Parallel Execution Example: Phase 3

```bash
# Step 1: Write both new tests simultaneously (both in same describe block)
# T002 + T003: add two it() blocks to tests/pages/SalaryChart.test.tsx

# Step 2: Confirm RED
# T004:
pnpm run test -- tests/pages/SalaryChart.test.tsx

# Step 3: Apply implementation (single focused diff)
# T005 + T006 + T007: edit src/pages/workforce/SalaryChart.tsx

# Step 4: Confirm GREEN
# T008:
pnpm run test -- tests/pages/SalaryChart.test.tsx
```

---

## Implementation Strategy

**MVP scope**: Phase 3 (US1) is the entire feature. Completing it delivers 100% of user value.

**Incremental delivery**:

1. T001 — confirm baseline green (< 1 min)
2. T002–T004 — write failing tests first (TDD Red) (< 5 min)
3. T005–T007 — apply the implementation diff (< 5 min)
4. T008 — confirm all tests green (< 1 min)
5. T009–T011 — final quality gate (< 2 min)

**Total estimated effort**: ~15 minutes of active work.

---

## Format Validation

All tasks follow the required checklist format:

| Task | Checkbox | ID  | [P] marker     | [Story] label    | File path                                |
| ---- | -------- | --- | -------------- | ---------------- | ---------------------------------------- |
| T001 | ✅       | ✅  | — (sequential) | — (foundational) | implied (test command)                   |
| T002 | ✅       | ✅  | — (sequential) | ✅ [US1]         | ✅ `tests/pages/SalaryChart.test.tsx`    |
| T003 | ✅       | ✅  | — (sequential) | ✅ [US1]         | ✅ `tests/pages/SalaryChart.test.tsx`    |
| T004 | ✅       | ✅  | — (sequential) | ✅ [US1]         | ✅ `tests/pages/SalaryChart.test.tsx`    |
| T005 | ✅       | ✅  | — (sequential) | ✅ [US1]         | ✅ `src/pages/workforce/SalaryChart.tsx` |
| T006 | ✅       | ✅  | — (sequential) | ✅ [US1]         | ✅ `src/pages/workforce/SalaryChart.tsx` |
| T007 | ✅       | ✅  | — (sequential) | ✅ [US1]         | ✅ `src/pages/workforce/SalaryChart.tsx` |
| T008 | ✅       | ✅  | — (sequential) | ✅ [US1]         | ✅ `tests/pages/SalaryChart.test.tsx`    |
| T009 | ✅       | ✅  | ✅ [P]         | — (polish)       | implied (type-check command)             |
| T010 | ✅       | ✅  | ✅ [P]         | — (polish)       | implied (full test suite)                |
| T011 | ✅       | ✅  | — (sequential) | — (polish)       | implied (lint + format)                  |

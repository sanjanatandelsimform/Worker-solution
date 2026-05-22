# Tasks: Format Employer Cost Display

**Branch**: `017-format-employer-cost`  
**Input**: Design documents from `specs/017-format-employer-cost/`  
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete-task dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- File paths are exact per data-model.md

---

## Phase 1: Setup

> **Status**: Complete — branch `017-format-employer-cost` is active, no new dependencies required, `tests/utils/` directory already exists. No setup tasks needed.

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Update the TypeScript interface to match the new API shape. This is the single blocking change — all hook updates and test fixture corrections depend on it resolving TypeScript compile errors first.

**⚠️ CRITICAL**: Hook update (T004) and fixture corrections (T005–T007) cannot be completed until T001 lands.

- [x] T001 Update `BenefitsCost.employerCost` from `string` to `number | null` with updated JSDoc in `src/types/workforceTypes.ts`

**Checkpoint**: `pnpm run type-check` will report compile errors in test fixture files — expected and intentional (resolved in T005–T007).

---

## Phase 3: User Story 1 — Formatted Employer Cost Display (Priority: P1) 🎯 MVP

**Goal**: The "Employer Cost Per Employee (Avg)" card on the Workforce → Compensation tab displays `$11,240/yr` for a valid API value.

**Independent Test**: With `benefitsCost.employerCost: 11240` in the Redux store (mock or live), the card shows `$11,240/yr`. With `11240` replaced by `1000000`, it shows `$1,000,000/yr`. With `0`, it shows `$0/yr`.

### Tests for User Story 1 (TDD — write BEFORE implementation) ⚠️

> **NOTE: T002 MUST be committed and failing before T003 is written**

- [x] T002 [P] [US1] Create `tests/utils/formatters.test.ts` with 6 failing unit tests covering all `formatEmployerCostPerYear` scenarios: `11240 → "$11,240/yr"`, `0 → "$0/yr"`, `1000000 → "$1,000,000/yr"`, `null → "--"`, `undefined → "--"`, `-500 → "--"` — confirm Red phase with `pnpm test tests/utils/formatters.test.ts`

### Implementation for User Story 1

- [x] T003 [US1] Add `formatEmployerCostPerYear(value: number | null | undefined): string` to `src/utils/formatters.ts` — all 6 tests in T002 must turn Green
- [x] T004 [US1] Import `formatEmployerCostPerYear` and replace `compensationSection?.benefitsCost.employerCost ?? "--"` with `formatEmployerCostPerYear(compensationSection?.benefitsCost.employerCost)` in `src/hooks/useWorkforceCompensationConfig.ts` (depends on T001 + T003)

**Checkpoint**: At this point, User Story 1 is fully functional and independently testable:

- `pnpm test tests/utils/formatters.test.ts` → 6 passing
- `pnpm dev` → navigate to `/dashboard` → Workforce → Compensation tab → "Employer Cost Per Employee (Avg)" card shows formatted value

---

## Phase 4: User Story 2 — Graceful Handling of Invalid Values (Priority: P2)

**Goal**: The card shows `--` (never crashes, never shows raw bad data) when `employerCost` is `null`, `undefined`, absent, or negative, and shows `--` until workforce data has loaded.

**Independent Test**: The 3 edge-case tests in `tests/utils/formatters.test.ts` (`null`, `undefined`, `-500` → `"--"`) all pass. The card shows `--` in the browser before the API call completes.

### Implementation for User Story 2

_The formatter implemented in T003 already satisfies all US2 edge-case guards. The tasks below fix existing test fixtures that now have TypeScript compile errors due to T001's interface change — they also serve as regression coverage confirming US2 behavior in existing suite contexts._

- [x] T005 [P] [US2] Update `tests/services/workforceApi.test.ts` line ~74: change `employerCost: "$11000/yr"` → `employerCost: 11000` to match updated `BenefitsCost` interface (depends on T001)
- [x] T006 [P] [US2] Update `tests/store/workforceSlice.test.ts` — two occurrences: `employerCost: "$11000/yr"` → `11000` (~line 83) and `employerCost: "$0"` → `0` (~line 148) (depends on T001)
- [x] T007 [P] [US2] Update `tests/store/workforceSelectors.test.ts` line ~59: change `employerCost: "$11000/yr"` → `employerCost: 11000` (depends on T001)

**Checkpoint**: At this point, User Stories 1 AND 2 are both independently functional:

- `pnpm run type-check` → 0 errors
- `pnpm test` → all suites passing (including the 6 new formatter tests)
- Browser smoke test: card shows `--` before API resolves, then shows formatted value once data loads

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gate to confirm all tests pass end-to-end and code meets project style standards.

- [x] T008 Run full quality gate: `pnpm run type-check` (0 errors) → `pnpm test` (all suites) → `pnpm lint:fix` → `pnpm format`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — can start immediately
- **User Story 1 (Phase 3)**: T002 can start immediately (new file, no dependency on T001); T003 depends on T002; T004 depends on T001 + T003
- **User Story 2 (Phase 4)**: T005/T006/T007 all depend on T001; can start as soon as T001 is done; run in parallel
- **Polish (Final Phase)**: Depends on T003–T007 complete

### User Story Dependencies

- **User Story 1 (P1)**: T002 starts immediately; T003 after T002 (Red → Green); T004 after T001 + T003
- **User Story 2 (P2)**: T005/T006/T007 after T001 — can all run in parallel; no dependency on US1

### Within Each User Story

- Tests (T002) MUST be written and FAILING before implementation (T003)
- T003 implements the formatter; both US1 and US2 guards live in a single function
- T004 depends on T001 (type safety) and T003 (formatter exists)
- T005/T006/T007 are independent of each other (different files)

---

## Parallel Opportunities

### Immediate (no prerequisites)

```
T001   Update workforceTypes.ts interface
T002   Create formatters.test.ts (new file, no dependency)
```

Both can start simultaneously on day one.

### After T001 completes

```
T005   Fix workforceApi.test.ts mock
T006   Fix workforceSlice.test.ts mocks
T007   Fix workforceSelectors.test.ts mock
```

All three run in parallel (different files).

### Sequential chain (US1 implementation)

```
T002 → T003 → T004
(tests Red) → (formatter Green) → (hook updated)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: T001 (interface change)
2. Complete Phase 3: T002 → T003 → T004 (formatter tests → implement → hook)
3. **STOP and VALIDATE**: `pnpm test tests/utils/formatters.test.ts` (6 passing) + browser smoke test on Compensation tab
4. Deploy/demo if ready

### Incremental Delivery

1. T001 → Foundation (interface updated)
2. T002 + T003 + T004 → US1 MVP: card displays formatted cost ✅
3. T005 + T006 + T007 → US2: existing test suite fully type-safe ✅ + edge case regression coverage confirmed
4. T008 → Full quality gate ✅

### Solo Developer Order

```
T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008
```

Total estimate: ~1 hour (per quickstart.md)

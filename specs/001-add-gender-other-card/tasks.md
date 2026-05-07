# Tasks: Add "Other" Gender Card with Tooltip

**Input**: Design documents from `/specs/001-add-gender-other-card/`  
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅ · quickstart.md ✅

**Organization**: Tasks are grouped by user story. US1 (display the card) and US2 (graceful fallback) are independently testable. The type change (T001) is a shared prerequisite that blocks both stories.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependency)
- **[US1]**: User Story 1 — View "Other" Gender Card in Demographics (P1)
- **[US2]**: User Story 2 — Graceful Fallback When "Other" Data Is Missing (P2)

---

## Phase 1: Foundational — Extend the Data Contract

**Purpose**: Add `other?: string` to `GenderBreakdown`. This is a shared type used by both user stories; all subsequent tasks depend on it being in place first.

**⚠️ CRITICAL**: Both user story phases depend on this phase being complete.

- [ ] T001 Add `other?: string` field to `GenderBreakdown` interface in `src/types/workforceTypes.ts`

**Checkpoint**: `pnpm run type-check` passes with the new optional field — ready to implement hook and tests.

---

## Phase 2: User Story 1 — View "Other" Gender Card in Demographics (Priority: P1) 🎯 MVP

**Goal**: A third "Other" gender card appears in the Workforce Demographics section, sourcing its value from `gender.other`, with a tooltip explaining inclusive identification.

**Independent Test**: Run the hook tests (`pnpm run test -- useWorkforceDemographicsConfig`) and verify the "Other" card entry exists with the correct `id`, `title`, `count`, and `tooltipText`. No browser session required.

### Tests for User Story 1

> **Write BEFORE implementation — ensure they FAIL first, then pass after T003.**

- [ ] T002 [P] [US1] In `tests/hooks/useWorkforceDemographicsConfig.test.ts` — add `other: "5%"` to `sampleDemographics.gender` fixture
- [ ] T003 [P] [US1] In `tests/hooks/useWorkforceDemographicsConfig.test.ts` — update `"demographicsCardsConfig has correct ids and titles"` test: destructure `[women, men, other]` and assert `other.id === "other"`, `other.title === "Other"`
- [ ] T004 [P] [US1] In `tests/hooks/useWorkforceDemographicsConfig.test.ts` — update `"demographicsCardsConfig shows gender percentages from data"` test: destructure `[women, men, other]` and assert `other.count === "5%"`
- [ ] T005 [P] [US1] In `tests/hooks/useWorkforceDemographicsConfig.test.ts` — add new test: `"other card has correct tooltip text"` — assert `other.tooltipText === "Other includes individuals that choose not to identify or do not identify as man or woman."`
- [ ] T006 [P] [US1] In `tests/hooks/useWorkforceDemographicsConfig.test.ts` — add new test: `"women and men cards have no tooltipText"` — assert both `women.tooltipText` and `men.tooltipText` are `undefined`

### Implementation for User Story 1

- [ ] T007 [US1] In `src/hooks/useWorkforceDemographicsConfig.ts` — add the "other" card entry inside `demographicsCardsConfig` `useMemo` (after the "men" entry), with `id: "other"`, `title: "Other"`, `count: demographicsSection?.gender.other ?? "--"`, `tooltipText: "Other includes individuals that choose not to identify or do not identify as man or woman."`, `getCountClass: () => COUNT_CLASS` (depends on T001)

**Checkpoint**: `pnpm run test -- useWorkforceDemographicsConfig` passes for all US1 tests. The "Other" card renders in the browser with a percentage value and tooltip icon when `gender.other` is present in the store.

---

## Phase 3: User Story 2 — Graceful Fallback When "Other" Data Is Missing (Priority: P2)

**Goal**: The "Other" card always renders; when `gender.other` is absent or the entire demographics section is null, the count displays `"--"`.

**Independent Test**: Run the hook tests (`pnpm run test -- useWorkforceDemographicsConfig`). Verify the two fallback tests pass: missing `other` field yields `"--"`, and null demographics state yields 3 cards all with `"--"`.

### Tests for User Story 2

> **Write BEFORE implementation — both tests should FAIL before T007 is done, pass after.**

- [ ] T008 [P] [US2] In `tests/hooks/useWorkforceDemographicsConfig.test.ts` — add new test: `"other card shows '--' fallback when gender.other is absent"` — build store state with `gender: { men: "55%", women: "40%" }` (no `other`) and assert the third card `count === "--"`
- [ ] T009 [US2] In `tests/hooks/useWorkforceDemographicsConfig.test.ts` — update the null-state test `"returns empty arrays when demographicsSection is null"`: change `toHaveLength(2)` to `toHaveLength(3)` (depends on T007 producing 3 cards)

### Implementation for User Story 2

> Implementation is already delivered by T007 — the `?? "--"` nullish coalescing covers all fallback scenarios. This phase is test-only.

**Checkpoint**: `pnpm run test -- useWorkforceDemographicsConfig` passes for all US2 tests. The "Other" card shows `"--"` when data is absent.

---

## Phase 4: Polish & Quality Gates

**Purpose**: Verify no regressions across the full test suite; enforce lint and format.

- [ ] T010 [P] Run `pnpm run type-check` — must exit with code 0, zero errors
- [ ] T011 [P] Run `pnpm lint:fix` then `pnpm format` — auto-fix any lint/format issues introduced
- [ ] T012 Run `pnpm run test` — full test suite must exit with code 0, zero failures (depends on T010, T011)

**Checkpoint**: All quality gates green — feature is ready for PR.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (T001 — type change)
  └─► Phase 2 (T002–T007 — US1 tests + hook implementation)
        └─► Phase 3 (T008–T009 — US2 tests)
              └─► Phase 4 (T010–T012 — quality gates)
```

### Within Each Phase

- **Phase 1**: Single task (T001). Must complete first.
- **Phase 2**: Tests (T002–T006) can all be written in parallel with each other before T007. T007 (implementation) depends on T001.
- **Phase 3**: T008 can be written in parallel with Phase 2 work; T009 depends on T007.
- **Phase 4**: T010 and T011 can run in parallel; T012 depends on both.

### Parallel Opportunities

- T002, T003, T004, T005, T006 — write all test stubs in parallel (same file, independent `it` blocks)
- T008 — can be written while Phase 2 implementation is in progress
- T010, T011 — run simultaneously in two terminals

---

## Parallel Example: User Story 1

When implementing US1 (a single developer):

```
T001  →  T002+T003+T004+T005+T006 (parallel test stubs)  →  T007 (implementation)
```

When pair-programming:

```
Developer A: T001 → T007
Developer B: T002 → T003 → T004 → T005 → T006 (written while A implements)
```

---

## Implementation Strategy

**MVP = Phase 1 + Phase 2** (T001–T007)

Start with the type extension and the "Other" card implementation. This alone delivers the full visible feature. Phase 3 adds the explicit fallback-scenario tests; Phase 4 verifies no regressions.

**Total task count**: 12  
**Tasks per user story**: US1 → 6 (T002–T007) · US2 → 2 (T008–T009)  
**Foundational**: 1 (T001)  
**Polish**: 3 (T010–T012)  
**Parallel opportunities**: T002–T006 in Phase 2; T010–T011 in Phase 4

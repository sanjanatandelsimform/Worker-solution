# Tasks: Fix `employmentType` Typo in Workforce API

**Input**: Design documents from `specs/013-fix-employment-type-typo/`  
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: No new test tasks — existing tests are updated in-place (spec does not request TDD/new tests).  
**Organization**: Tasks grouped by user story. US1 (type definition) is the blocking prerequisite for US2 (all consumers). All US2 tasks target different files and are fully parallelizable.

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Parallelizable — targets a different file; no dependency on an incomplete sibling task
- **[US1] / [US2]**: Maps to user story in spec.md

---

## Phase 1: Setup

**Purpose**: Confirm starting state — no new dependencies or files are required for this feature.

- [X] T001 Verify current branch is `013-fix-employment-type-typo` and working tree is clean (`git status`)

---

## Phase 2: User Story 1 — Developer Sees Correct Field Name (Priority: P1) 🎯 MVP

**Goal**: Rename `employementType` → `employmentType` in the `Demographics` TypeScript interface and remove the outdated `@note` comment that described the misspelling as intentional.

**Independent Test**: Open `src/types/workforceTypes.ts` and confirm the `Demographics` interface declares `employmentType: EmploymentTypeEntry[]` with no `@note` comment above it. (Note: `pnpm run type-check` will emit errors in consumer files until Phase 3 is complete — that is expected.)

- [X] T002 [US1] Rename `employementType` → `employmentType` and remove the `@note` comment in `src/types/workforceTypes.ts` (FR-001, FR-002)

**Checkpoint**: Type definition is correct. TypeScript will now flag all remaining consumers — use those errors as a guide for Phase 3.

---

## Phase 3: User Story 2 — All Consuming Code Uses Corrected Name (Priority: P2)

**Goal**: Update every consumer of `Demographics.employmentType` — the Redux slice static fixture, the demographics hook (3 accesses), the selector JSDoc, and all test fixtures — so the entire codebase is consistent with the corrected spelling.

**Independent Test**: After all tasks in this phase are complete, run `pnpm run type-check` (must exit 0) and `pnpm run test` (must pass with zero regressions). Grep `src/` and `tests/` for `employementType` — must return zero matches.

> All tasks in this phase target different files and can be executed in parallel.

- [X] T003 [P] [US2] Rename `demographics.employementType` object key → `employmentType` in `STATIC_WORKFORCE_DATA` in `src/store/slices/workforceSlice.ts` (FR-003)
- [X] T004 [P] [US2] Fix all three `demographicsSection?.employementType` property accesses → `.employmentType` in `src/hooks/useWorkforceDemographicsConfig.ts` (FR-004)
- [X] T005 [P] [US2] Update JSDoc on `selectDemographicsSection` — remove `(note: intentional typo matching backend schema)` and correct spelling to `employmentType` in `src/store/selectors/workforceSelectors.ts` (FR-005)
- [X] T006 [P] [US2] Fix both test fixture object keys `employementType` → `employmentType` (lines ~71 and ~134) in `tests/store/workforceSlice.test.ts` (FR-006)
- [X] T007 [P] [US2] Fix test fixture object key `employementType` → `employmentType` (line ~64) in `tests/services/workforceApi.test.ts` (FR-006)
- [X] T008 [P] [US2] Fix test fixture object key `employementType` → `employmentType` (line ~49) in `tests/store/workforceSelectors.test.ts` (FR-006)

**Checkpoint**: All source and test files now use `employmentType`. TypeScript should compile cleanly and tests should pass.

---

## Phase 4: Polish & Quality Gate

**Purpose**: Verify all success criteria are met before the PR is opened.

- [X] T009 Run `pnpm run type-check` and confirm exit code 0 with zero TypeScript errors (SC-003, FR-007)
- [X] T010 [P] Run `pnpm run test` and confirm all tests pass with zero regressions (SC-004, FR-008)
- [X] T011 [P] Search `src/` and `tests/` for `employementType` and confirm zero matches — on PowerShell: `Select-String -Path src/**/*.ts,tests/**/*.ts -Pattern "employementType" -Recurse` (SC-001, SC-002)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** → No dependencies; start immediately
- **US1 (Phase 2)** → Depends on Setup (T001); T002 is the single blocking prerequisite for all of Phase 3
- **US2 (Phase 3)** → ALL tasks (T003–T008) depend on T002 completing; they are independent of each other
- **Polish (Phase 4)** → Depends on T002–T008 all completing

### User Story Dependencies

- **US1 (P1)**: Start after T001 — no dependency on US2
- **US2 (P2)**: Start after T002 (type definition corrected) — all 6 tasks are mutually independent

### Within Each User Story

- T002 must complete before any Phase 3 task begins (TypeScript type is the source of truth all consumers reference)
- T003–T008 can all run in parallel once T002 is done
- T009–T011 run after T002–T008 are all complete; T010 and T011 are parallelizable with T009

---

## Parallel Execution Example — Phase 3 (User Story 2)

After T002 is merged/staged, launch all Phase 3 tasks simultaneously:

```bash
# These 6 tasks can be executed in parallel (different files, no cross-dependencies):
Task T003: src/store/slices/workforceSlice.ts
Task T004: src/hooks/useWorkforceDemographicsConfig.ts
Task T005: src/store/selectors/workforceSelectors.ts
Task T006: tests/store/workforceSlice.test.ts
Task T007: tests/services/workforceApi.test.ts
Task T008: tests/store/workforceSelectors.test.ts
```

---

## Implementation Strategy

### MVP (only option — atomically consistent rename)

This feature cannot be partially deployed. All 11 locations must be updated in a single PR because TypeScript strict mode will refuse to compile a codebase where the type definition and any consumer disagree on the field name. The full sequence is:

1. ✅ T001 — Verify starting state
2. ✅ T002 — Fix type definition (US1 complete)
3. ✅ T003–T008 — Fix all consumers in parallel (US2 complete)
4. ✅ T009–T011 — Quality gate passes → PR ready

### Reference: quickstart.md

For exact before/after code snippets for each task, see [`quickstart.md`](quickstart.md).

---

## Notes

- `EmploymentTypeEntry` interface is **not renamed** — only the field name on `Demographics` changes
- Files under `specs/009-workforce-tab-api/` are **out of scope** — they are historical record
- The `[P]` marker on T003–T008 means all can be done in a single `multi_replace_string_in_file` call by an agent
- Total task count: **11** (1 setup + 1 US1 + 6 US2 + 3 polish)

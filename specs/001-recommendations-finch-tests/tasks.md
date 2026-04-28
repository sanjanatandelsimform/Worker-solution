---
description: "Task list for RecommendationsFinchPage test coverage"
---

# Tasks: RecommendationsFinchPage Test Coverage

**Input**: Design documents from `/specs/001-recommendations-finch-tests/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Deliverable**: One new file — `tests/pages/RecommendationsFinchPage.test.tsx`
**Source files**: Read-only (no modifications to `src/`)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US7)
- All test cases live in a single file: `tests/pages/RecommendationsFinchPage.test.tsx`

---

## Phase 1: Setup (Test File Scaffold)

**Purpose**: Create the test file with all module-level mocks, helpers, and shared state — the foundation every user story's tests depend on.

**⚠️ CRITICAL**: All subsequent phases write into this single file. Complete Phase 1 before writing any test cases.

- [x] T001 Create test file `tests/pages/RecommendationsFinchPage.test.tsx` with header comment block documenting all covered scenarios
- [x] T002 Add module-level `vi.mock` for `@/hooks/useAssessmentStatus` (bare mock — implementation in beforeEach) in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T003 [P] Add module-level `vi.mock` for `@/hooks/useIndustry` (bare mock — implementation in beforeEach) in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T004 [P] Add module-level `vi.mock` for `@/hooks/useFinchStatus` returning `{ isConnected: true, connectionStatus: "connected", syncJobStatus: null, isLoading: false, error: null }` in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T005 [P] Add module-level `vi.mock` for `@/hooks/useModalConfig` returning `{}` in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T006 [P] Add module-level `vi.mock` for `@/assets/did-hero.jpg` returning `{ default: "did-hero.jpg" }` in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T007 Implement `defaultWorkforceData` factory constant with `totalWorkforce: 100`, `avgHourlyRate: 18.5`, `avgSalary: 52000`, participation `totalWorkforce: 100`, `enrolledBenefits: 80` in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T008 [P] Implement `defaultRecommendationsData` factory constant with all three proven strategy flags `false` and empty `strategicRecommendations` array in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T009 Implement `createTestStore(overrides?)` helper using `configureStore` with `workforceReducer`, `recommendationsReducer`, `industryReducer` and typed `preloadedState` merging `defaultWorkforceData` / `defaultRecommendationsData` per `data-model.md` in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T010 Implement `renderPage(store?, onNavigateToWorkforce?)` helper wrapping `RecommendationsFinchPage` in `<Provider>` + `<MemoryRouter>` in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T011 Add `beforeEach` block resetting `vi.mocked(useAssessmentStatus)` to `{ isFinchAssessmentIncomplete: false, isFinchCompleted: true, completionCount: 4, ... }` and `vi.mocked(useIndustry)` to `{ isLoading: false, data: null, error: null, isLoaded: true }` in `tests/pages/RecommendationsFinchPage.test.tsx`

**Checkpoint**: File compiles, `pnpm run type-check` passes, `renderPage()` can be called without errors

---

## Phase 2: Foundational (Infrastructure Verification)

**Purpose**: Verify the test scaffold renders the component at all before adding story-specific assertions. One smoke test to confirm mock wiring is correct.

**⚠️ CRITICAL**: Must pass before writing story-specific tests

- [x] T012 Add smoke test: `"renders without crashing"` — calls `renderPage()` and asserts `screen.getByText("Your Company At A Glance")` is present in `tests/pages/RecommendationsFinchPage.test.tsx`

**Checkpoint**: `pnpm test -- RecommendationsFinchPage` runs 1 passing test

---

## Phase 3: User Story 1 — Loading State Feedback (Priority: P1) 🎯 MVP

**Goal**: Verify that setting any single loading flag to `true` prevents data text from appearing, and that when all flags are `false` the page renders normally.

**Independent Test**: Run `pnpm test -- RecommendationsFinchPage` and check the `"loading states"` describe block passes independently.

- [x] T013 [US1] Add `describe("RecommendationsFinchPage — loading states")` block in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T014 [P] [US1] Add test: `"renders skeleton placeholders when workforce is loading"` — creates store with `{ workforce: { data: null, loading: true, isLoaded: false } }` and asserts known data values like `"100"` and `"$18.50"` are absent in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T015 [P] [US1] Add test: `"renders skeleton placeholders when recommendations is loading"` — creates store with `{ recommendations: { data: null, loading: true, isLoaded: false } }` and asserts `"Strategies Impemented:"` text is absent in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T016 [P] [US1] Add test: `"renders skeleton placeholders when industry is loading"` — mocks `useIndustry` with `{ isLoading: true, data: null }` and asserts `"$45,000"` is absent in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T017 [US1] Add test: `"renders Company At A Glance heading when all loading flags are false"` — calls `renderPage()` with defaults and asserts `"Your Company At A Glance"` heading is present in `tests/pages/RecommendationsFinchPage.test.tsx`

**Checkpoint**: `describe("loading states")` block has 4 passing tests

---

## Phase 4: User Story 2 — Finch Assessment Completeness Gate (Priority: P1)

**Goal**: Verify `CoreBenefitsEnhancement` and `StrategicSolutions` are conditionally rendered based on `isFinchAssessmentIncomplete`, while `CompanyAtAGlance` always renders.

**Independent Test**: Isolate the `"assessment completeness gate"` describe block — no loading flags needed.

- [x] T018 [US2] Add `describe("RecommendationsFinchPage — assessment completeness gate")` block in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T019 [P] [US2] Add test: `"hides CoreBenefitsEnhancement when isFinchAssessmentIncomplete = true"` — mocks `useAssessmentStatus` with `isFinchAssessmentIncomplete: true` and uses `queryByText("Core Benefits Enhancement")` to assert absence in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T020 [P] [US2] Add test: `"hides StrategicSolutions when isFinchAssessmentIncomplete = true"` — same mock setup, asserts `queryByText("Strategic Solutions")` is `null` in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T021 [US2] Add test: `"shows CoreBenefitsEnhancement and StrategicSolutions when assessment is complete"` — uses default `isFinchAssessmentIncomplete: false` and asserts both headings are present in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T022 [US2] Add test: `"always shows Your Company At A Glance heading regardless of assessment status"` — mocks `isFinchAssessmentIncomplete: true`, asserts heading still present in `tests/pages/RecommendationsFinchPage.test.tsx`

**Checkpoint**: `describe("assessment completeness gate")` block has 4 passing tests

---

## Phase 5: User Story 3 — Company At A Glance Data Mapping (Priority: P2)

**Goal**: Verify workforce, compensation, and industry data from the store and `useIndustry` hook are correctly formatted and rendered in the Company Overview cards.

**Independent Test**: Isolate the `"company at a glance data mapping"` describe block using `createTestStore` overrides.

- [x] T023 [US3] Add `describe("RecommendationsFinchPage — company at a glance data mapping")` block in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T024 [P] [US3] Add test: `"displays formatted totalWorkforce from store"` — preloads store with `totalWorkforce: 1250`, asserts `screen.getByText("1,250")` in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T025 [P] [US3] Add test: `"displays formatted avgHourlyRate from compensation section"` — preloads store with `avgHourlyRate: 18.5`, asserts `screen.getByText("$18.50")` in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T026 [P] [US3] Add test: `"displays formatted industryAverageWage from useIndustry hook"` — mocks `useIndustry` returning `industryOverview.industryAverageWage: 45000`, asserts `screen.getByText("$45,000")` in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T027 [P] [US3] Add test: `"shows N/A for industryAverageWage when industry data is null"` — mocks `useIndustry` returning `data: null`, asserts `screen.getAllByText("N/A").length` is greater than 0 in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T028 [US3] Add test: `"shows N/A for workforce fields when workforce data is null"` — preloads store with `{ workforce: { data: null } }`, asserts `getAllByText("N/A").length` greater than 0 in `tests/pages/RecommendationsFinchPage.test.tsx`

**Checkpoint**: `describe("company at a glance data mapping")` block has 5 passing tests

---

## Phase 6: User Story 4 — Benefits Overview Data Mapping (Priority: P2)

**Goal**: Verify that `participationSection` fields map correctly to the benefits overview cards, and that a `null` participation section does not crash the component.

**Independent Test**: Isolate the `"benefits overview data mapping"` describe block using store overrides targeting `participation`.

- [x] T029 [US4] Add `describe("RecommendationsFinchPage — benefits overview data mapping")` block in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T030 [P] [US4] Add test: `"displays totalWorkforce from participation section as eligible employees count"` — preloads store with `participation.totalWorkforce: 500`, asserts `screen.getByText("500")` is present in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T031 [US4] Add test: `"renders without crash when participationSection is null"` — preloads store with `{ workforce: { data: null } }` (makes `selectParticipationSection` return `null`), asserts heading still renders and no errors thrown in `tests/pages/RecommendationsFinchPage.test.tsx`

**Checkpoint**: `describe("benefits overview data mapping")` block has 2 passing tests

---

## Phase 7: User Story 5 — Proven Strategies Count and Percent (Priority: P2)

**Goal**: Verify all four combinations of proven strategy flags (0, 1, 2, 3 flags `true`) produce the correct count and percent text in `CoreBenefitsEnhancement`.

**Independent Test**: Isolate the `"proven strategies count and percent"` describe block — requires `isFinchAssessmentIncomplete: false` (default).

- [x] T032 [US5] Add `describe("RecommendationsFinchPage — proven strategies count and percent")` block in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T033 [P] [US5] Add test: `"passes count=0 and percent=0 when all flags are false"` — uses default store (all flags `false`), asserts `screen.getByText("Strategies Impemented: 0/3")` in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T034 [P] [US5] Add test: `"passes count=1 and percent=33 when nonElectiveMatch=true"` — preloads recommendations with `nonElectiveMatch: true, autoEnroll: false, healthcareAffordability: false`, asserts `"Strategies Impemented: 1/3"` in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T035 [P] [US5] Add test: `"passes count=2 and percent=67 when two flags are true"` — preloads with `nonElectiveMatch: true, autoEnroll: true, healthcareAffordability: false`, asserts `"Strategies Impemented: 2/3"` in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T036 [P] [US5] Add test: `"passes count=3 and percent=100 when all flags are true"` — preloads with all three flags `true`, asserts `"Strategies Impemented: 3/3"` in `tests/pages/RecommendationsFinchPage.test.tsx`

**Checkpoint**: `describe("proven strategies count and percent")` block has 4 passing tests; Math.round logic verified for all edge cases

---

## Phase 8: User Story 6 — Static Sections Always Rendered (Priority: P3)

**Goal**: Verify that `CarouselSection` and `Declarations` are unconditionally rendered regardless of assessment status or loading state.

**Independent Test**: Isolate the `"static sections always rendered"` describe block with both `isFinchAssessmentIncomplete` true and false variants.

- [x] T037 [US6] Add `describe("RecommendationsFinchPage — static sections always rendered")` block in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T038 [P] [US6] Add test: `"renders Carousel section regardless of store state"` — calls `renderPage()` with defaults, asserts `screen.getByText("Did you know?")` is present in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T039 [P] [US6] Add test: `"renders Declarations text when assessment is incomplete"` — mocks `isFinchAssessmentIncomplete: true`, asserts `screen.getByText(/This product provides informational insights/)` is present in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T040 [P] [US6] Add test: `"renders Declarations text when assessment is complete"` — uses default mock, asserts same Declarations text is present in `tests/pages/RecommendationsFinchPage.test.tsx`

**Checkpoint**: `describe("static sections always rendered")` block has 3 passing tests

---

## Phase 9: User Story 7 — Navigate to Workforce Callback (Priority: P3)

**Goal**: Verify the `onNavigateToWorkforce` optional prop does not crash when absent, and is accepted without error when provided.

**Independent Test**: Isolate the `"onNavigateToWorkforce callback"` describe block.

- [x] T041 [US7] Add `describe("RecommendationsFinchPage — onNavigateToWorkforce callback")` block in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T042 [US7] Add test: `"renders without error when onNavigateToWorkforce is not provided"` — calls `renderPage()` with no callback arg, wraps in `expect(() => renderPage()).not.toThrow()`, asserts heading is present in `tests/pages/RecommendationsFinchPage.test.tsx`

**Checkpoint**: `describe("onNavigateToWorkforce callback")` block has 1 passing test

---

## Phase 10: Edge Cases & Strategic Recommendations (Polish)

**Goal**: Cover the two edge case scenarios from spec.md that don't belong to a specific user story — empty strategic recommendations fallback and a rendered recommendation card.

- [x] T043 Add `describe("RecommendationsFinchPage — strategic recommendations")` block in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T044 [P] Add test: `"shows no-recommendations fallback when strategicRecommendations is empty"` — uses default store (empty array), asserts `screen.getByText("No recommendations available at this time.")` in `tests/pages/RecommendationsFinchPage.test.tsx`
- [x] T045 [P] Add test: `"renders recommendation card title and description when strategicRecommendations has items"` — preloads store with one `StrategicRecommendation` object (`title: "Emergency Savings"`, `description: "Help employees build financial resilience."`), asserts both texts appear in `tests/pages/RecommendationsFinchPage.test.tsx`

---

## Phase 11: Acceptance Gate

**Purpose**: Validate all tests pass, type check is clean, and no existing tests regress.

- [x] T046 Run `pnpm test -- RecommendationsFinchPage` and confirm all tests in the file pass (target: ≥28 tests passing) in terminal
- [x] T047 Run `pnpm run type-check` and confirm exit code 0 (no TypeScript errors) in terminal
- [x] T048 Run `pnpm test` (full suite) and confirm exit code 0 — no pre-existing tests are broken in terminal

---

## Dependency Graph

```
Phase 1 (T001–T011)
  └── Phase 2 (T012) ← smoke test
        ├── Phase 3 (T013–T017) [US1 — parallel within]
        ├── Phase 4 (T018–T022) [US2 — parallel within, independent of US1]
        ├── Phase 5 (T023–T028) [US3 — parallel within, independent of US1/US2]
        ├── Phase 6 (T029–T031) [US4 — independent of US3]
        ├── Phase 7 (T032–T036) [US5 — parallel within, requires assessment gate works]
        ├── Phase 8 (T037–T040) [US6 — fully independent]
        └── Phase 9 (T041–T042) [US7 — fully independent]
              └── Phase 10 (T043–T045) [Polish — parallel within]
                    └── Phase 11 (T046–T048) [Acceptance gate]
```

**Key**: Phases 3–9 are **independent of each other** — each describe block can be written in any order after Phase 2 completes.

---

## Parallel Execution Examples

### Example: Writing Phases 3 and 4 simultaneously (after Phase 2)

Since US1 (loading states) and US2 (assessment gate) test completely different behaviours and touch no shared data factories:

- **Developer A**: Writes T013–T017 (loading state tests)
- **Developer B**: Writes T018–T022 (assessment gate tests)
- Both sets of tests pass independently

### Example: Writing Phases 5, 6, and 7 simultaneously

- **Developer A**: Writes T023–T028 (company data mapping)
- **Developer B**: Writes T029–T031 (benefits overview mapping)
- **Developer C**: Writes T032–T036 (proven strategies count)

All three describe blocks use the same `createTestStore` helper but set different preloaded state overrides — no conflicts.

---

## Implementation Strategy

**MVP Scope**: Complete Phases 1–4 first (T001–T022). This delivers:

- The full test infrastructure scaffold
- All P1 user story coverage (loading states + assessment gate)
- 12+ passing tests covering the highest-risk regressions

**Increment 2**: Complete Phases 5–7 (T023–T036) — adds all P2 data-mapping and computation tests.

**Increment 3**: Complete Phases 8–11 (T037–T048) — adds P3 stories, edge cases, and acceptance gate.

---

## Format Validation

All tasks follow the required checklist format:

- ✅ Start with `- [X]` checkbox
- ✅ Sequential Task ID (`T001` … `T048`)
- ✅ `[P]` marker only on parallelizable tasks
- ✅ `[US#]` label on all user story phase tasks (Phases 3–9); absent in Phases 1–2, 10–11
- ✅ Exact file path in every description
- ✅ No tasks without Task ID, no tasks without file path

**Total**: 48 tasks across 11 phases covering 7 user stories (US1–US7) + polish edge cases.

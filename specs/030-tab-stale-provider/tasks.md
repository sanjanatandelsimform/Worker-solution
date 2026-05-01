# Tasks: Tab Stale State & Provider-Aware Preparing Messages

**Input**: Design documents from `specs/030-tab-stale-provider/`  
**Branch**: `030-tab-stale-provider`  
**Generated**: 2026-05-01  
**Prerequisites**: [plan.md](./plan.md) ✅ | [spec.md](./spec.md) ✅ | [research.md](./research.md) ✅ | [data-model.md](./data-model.md) ✅ | [quickstart.md](./quickstart.md) ✅

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (touches different files, no incomplete dependencies)
- **[US#]**: User story this task belongs to
- File paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the shared constants module that all user stories depend on.

- [x] T001 Create message constants file `src/constants/preparingDashboardMessages.ts` — export `PREPARING_MSG_AUTOMATED` ("…24-36 hours…") and `PREPARING_MSG_NON_AUTOMATED` ("…up to 2 weeks…")

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Type extension and component prop changes that MUST land before any user story implementation can begin. T002 and T003 touch different files and can run in parallel.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 [P] Add `isAutomatedProvider: boolean` to `UseDashboardStatusPollingReturn` interface in `src/types/dashboardStatusTypes.ts`
- [x] T003 [P] Update `PreparingDashboard` component in `src/pages/recommendations/PreparingDashboard.tsx` — add `description?: string` prop with default `PREPARING_MSG_NON_AUTOMATED`; render `{description}` in the `<p>` tag instead of the hardcoded string

**Checkpoint**: Type contract extended; `PreparingDashboard` is prop-driven — user story implementation can now begin.

---

## Phase 3: User Story 1 — Finch-Connected Guard (Priority: P1) 🎯 MVP

**Goal**: Ensure the "Preparing your dashboard" screen is only shown to users who have completed the Finch connection flow. Non-Finch users always see the standard skeleton.

**Independent Test**: Render each tab with `isStale=true` and `isConnected=false` → Preparing screen must NOT appear. Render with `isStale=true` and `isConnected=true` → Preparing screen appears.

### Implementation for User Story 1

- [x] T004 [US1] Add `isAutomatedProvider` `useMemo` to `src/hooks/useDashboardStatusPolling.ts` — compute `status?.providerType === "automated"`; include in the return object (depends on T002)
- [x] T005 [US1] Update `src/pages/dashboard/DashboardPage.tsx` — destructure `isAutomatedProvider` from `useDashboardStatusPolling`; change all three `isStale` props to `isXxxTabStale && isConnected`; forward `isAutomatedProvider` to each tab (depends on T004)

### Tests for User Story 1

- [x] T006 [P] [US1] Add `isAutomatedProvider` describe block to `tests/hooks/useDashboardStatusPolling.test.ts` — cover: returns `false` when not enabled; `false` when `providerType` is `null`; `false` when `"assisted"`; `true` when `"automated"` (depends on T004)
- [x] T007 [P] [US1] Add stale-guard tests to `tests/pages/RecommendationsFinchPage.test.tsx` — verify Preparing screen NOT shown when `isStale=true` but `isConnected=false` (gating logic verified at integration level) (depends on T005)
- [x] T008 [P] [US1] Add stale-guard tests to `tests/pages/BenchmarkFinchPage.test.tsx` — same stale-guard assertions as T007 (depends on T005)
- [x] T009 [P] [US1] Create `tests/pages/WorkforcePage.test.tsx` — smoke test + stale-guard tests: `isStale=true` shows Preparing screen; `isStale=false` shows content (depends on T005)

**Checkpoint**: User Story 1 complete and independently verified — non-Finch users never see the Preparing screen.

---

## Phase 4: User Story 2 — Provider-Aware Processing Time Message (Priority: P2)

**Goal**: Display the correct processing-time message in the Preparing screen based on provider type. T010, T011, T012 touch different tab files and can run in parallel.

**Independent Test**: Pass `isStale=true, isAutomatedProvider=true` → "24-36 hours" message visible. Pass `isStale=true, isAutomatedProvider=false` → "up to 2 weeks" message visible.

### Implementation for User Story 2

- [x] T010 [P] [US2] Update `src/pages/recommendations/RecommendationsFinchPage.tsx` — add `isAutomatedProvider?: boolean` prop (default `false`); import message constants; select correct message with ternary; pass as `description` to `<PreparingDashboard>` in the `isStale` branch (depends on T001, T003, T005)
- [x] T011 [P] [US2] Update `src/pages/benchmark/BenchmarkFinchPage.tsx` — same pattern as T010: `isAutomatedProvider` prop, message selection, pass `description` to `<PreparingDashboard>` (depends on T001, T003, T005)
- [x] T012 [P] [US2] Update `src/pages/workforce/WorkforcePage.tsx` — same pattern as T010: `isAutomatedProvider` prop, message selection, pass `description` to `<PreparingDashboard>` (depends on T001, T003, T005)

### Tests for User Story 2

- [x] T013 [P] [US2] Add message-selection tests to `tests/pages/RecommendationsFinchPage.test.tsx` — `isStale=true, isAutomatedProvider=true` shows "24-36 hours"; `isStale=true, isAutomatedProvider=false` shows "up to 2 weeks"; `isStale=true` with no `isAutomatedProvider` shows "up to 2 weeks" default (depends on T010)
- [x] T014 [P] [US2] Add message-selection tests to `tests/pages/BenchmarkFinchPage.test.tsx` — same three assertions as T013 (depends on T011)
- [x] T015 [P] [US2] Add message-selection tests to `tests/pages/WorkforcePage.test.tsx` — same three assertions as T013 (depends on T012)

**Checkpoint**: User Story 2 complete and independently verified — automated and non-automated provider users see the correct processing-time message.

---

## Phase 5: User Story 3 — Per-Tab Custom Preparing Message (Priority: P3)

**Goal**: Verify that `PreparingDashboard` correctly renders any arbitrary description passed to it, enabling future tab-specific copy divergence.

**Independent Test**: Render `<PreparingDashboard description="Custom text" />` and verify "Custom text" appears; render with no prop and verify the non-automated default appears.

### Tests for User Story 3

- [x] T016 [US3] Add unit tests for `PreparingDashboard` in `tests/pages/PreparingDashboard.test.tsx` — verify: heading "Preparing your dashboard" always renders; custom `description` prop text renders in `<p>`; omitting `description` renders the `PREPARING_MSG_NON_AUTOMATED` default (depends on T003)

**Checkpoint**: User Story 3 complete — `PreparingDashboard` is fully prop-driven and each tab independently controls its message copy.

---

## Phase 6: Polish & Quality Gate

**Purpose**: Ensure the entire change set is lint-clean, type-safe, fully tested, and builds successfully.

- [x] T017 Run quality gate in order: `pnpm run type-check` (zero errors) → `pnpm lint:fix` → `pnpm format` → `pnpm run test` (all pass) → `pnpm run build`

---

## Dependency Graph

```
T001 (constants)
 └── T010, T011, T012 (tab pages — need message constants)

T002 (type extension)
 └── T004 (hook — must satisfy new return type)
      └── T005 (DashboardPage — destructures isAutomatedProvider)
           ├── T007, T008, T009 (stale-guard tests)
           └── T010, T011, T012 (tab pages — receive isAutomatedProvider)
                ├── T013, T014, T015 (message-selection tests)
                └── T015 (WorkforcePage tests — covers US2 + stale)

T003 (PreparingDashboard description prop)
 ├── T010, T011, T012 (tab pages — call PreparingDashboard with description)
 └── T016 (PreparingDashboard unit test)

T004 → T006 (isAutomatedProvider hook tests)

T017 (quality gate — runs after all tasks complete)
```

**Parallel execution opportunities per phase**:

- Phase 2: T002 ∥ T003
- US1 tests: T006 ∥ T007 ∥ T008 ∥ T009
- US2 implementation: T010 ∥ T011 ∥ T012
- US2 tests: T013 ∥ T014 ∥ T015

---

## Implementation Strategy

**MVP scope**: Phases 1–3 (US1) deliver correctness — non-Finch users no longer incorrectly see the Preparing screen. This is independently shippable.

**Full delivery**: Phases 4–5 (US2 + US3) add provider-aware messaging and component flexibility — natural continuation after US1 is validated.

**Suggested execution order for a single developer**:
T001 → T002 ∥ T003 → T004 → T005 → T006 → T007 ∥ T008 ∥ T009 → T010 ∥ T011 ∥ T012 → T013 ∥ T014 ∥ T015 → T016 → T017

---

## Task Count Summary

| Phase                       | Tasks  | User Story |
| --------------------------- | ------ | ---------- |
| Phase 1: Setup              | 1      | —          |
| Phase 2: Foundational       | 2      | —          |
| Phase 3: US1 implementation | 2      | US1        |
| Phase 3: US1 tests          | 4      | US1        |
| Phase 4: US2 implementation | 3      | US2        |
| Phase 4: US2 tests          | 3      | US2        |
| Phase 5: US3 tests          | 1      | US3        |
| Phase 6: Polish             | 1      | —          |
| **Total**                   | **17** |            |

**Parallel opportunities identified**: 5 groups across phases 2, 3, 4  
**Independent test criteria**:

- US1: Stale + not-connected → skeleton (no Preparing screen)
- US2: `isAutomatedProvider=true` → "24-36 hours"; `false`/default → "up to 2 weeks"
- US3: `description` prop renders correctly; default renders non-automated message

**Suggested MVP scope**: Complete Phases 1–3 (US1) — T001 through T009 (9 tasks)

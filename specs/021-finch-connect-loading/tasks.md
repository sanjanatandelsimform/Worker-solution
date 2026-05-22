---
description: "Task list for 021-finch-connect-loading"
---

# Tasks: Finch Connect Loading Spinner

**Input**: Design documents from `/specs/021-finch-connect-loading/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Feature summary**: Add a full-screen `<LoadingSpinner>` early-return guard to `DashboardPage.tsx` while the Finch connection flow is active. Single file, single insertion — no new files, no new imports, no hook or test changes.

---

## Phase 1: Setup

> No project initialization needed — this is an in-place change to an existing file in a running project. No setup tasks required.

---

## Phase 2: Foundational (Blocking Prerequisites)

> No foundational infrastructure is needed. All prerequisites (`isFinchLoading`, `LoadingSpinner` import, existing hook lifecycle) are already in place in the codebase.

---

## Phase 3: User Story 1 - Loading State During Finch Connect (Priority: P1) 🎯 MVP

**Goal**: Display a full-screen loading spinner on `DashboardPage` from the moment the user clicks "Start with Finch" until the flow resolves (success → redirect, error → error message shown, cancel → idle state restored).

**Independent Test**: Navigate to `/dashboard` in a browser (with an un-connected Finch account), click "Start with Finch", and observe that the full-screen spinner appears immediately and clears on any terminal event (redirect, error, cancel).

### Implementation for User Story 1

- [x] T001 [US1] Add `if (isFinchLoading)` early-return guard with `<LoadingSpinner height={80} width={80} bgClass="bg-secondary" ariaLabel="oval-loading" />` immediately after the `isLoadingAssessment` guard in `src/pages/dashboard/DashboardPage.tsx`

**Checkpoint**: After T001 the feature is fully functional and independently testable. Clicking "Start with Finch" on the dashboard must show the spinner immediately, and the spinner must clear on success (redirect), error (error message shown), or cancel (dashboard restored).

---

## Phase 4: Polish & Cross-Cutting Concerns

- [x] T002 [P] Run `pnpm run type-check` — verify 0 TypeScript errors
- [x] T003 [P] Run `pnpm lint:fix` then `pnpm format` — verify no linting or formatting violations
- [ ] T004 Smoke-test the Finch connect flow on `pnpm dev` at `/dashboard`: confirm spinner appears on click and clears correctly on cancel, error, and success paths

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: N/A — skipped (no initialization needed)
- **Phase 2 (Foundational)**: N/A — skipped (all prerequisites already exist)
- **Phase 3 (US1)**: Can start immediately — T001 has no blocking dependencies
- **Phase 4 (Polish)**: Depends on T001 completion

### User Story Dependencies

- **User Story 1 (P1)**: Starts immediately. No inter-story dependencies (only story).

### Within User Story 1

- T001 → T002, T003 (parallel) → T004 (serial smoke test)

### Parallel Opportunities

- T002 and T003 (type-check and lint) can run in parallel after T001.

---

## Parallel Example: User Story 1

```bash
# Step 1 — implement (serial, ~5 min)
T001: Edit src/pages/dashboard/DashboardPage.tsx

# Step 2 — quality gate (parallel, ~1 min)
T002: pnpm run type-check  &
T003: pnpm lint:fix && pnpm format  &
wait

# Step 3 — smoke test (serial)
T004: pnpm dev → open /dashboard → click "Start with Finch"
```

---

## Implementation Strategy

**MVP scope = entire feature = T001.** This is a single-task feature. All spec requirements (FR-001 through FR-006) are satisfied by one early-return guard. Deliver T001, pass the quality gate (T002–T003), smoke-test (T004), and the feature is complete.

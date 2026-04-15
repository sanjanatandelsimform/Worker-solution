# Implementation Plan: Refactor WorkforcePage into Smaller Modules

**Branch**: `009-workforce-tab-api` | **Date**: 2026-04-15 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/010-refactor-workforce-page/spec.md`

---

## Summary

Split the ~1,100-line `WorkforcePage.tsx` into 6 co-located modules: a utility file (`workforceUtils.ts`), a skeleton components file (`WorkforceSkeletons.tsx`), and four purely presentational section components (`WorkforceOverview`, `WorkforceParticipation`, `WorkforceDemographics`, `WorkforceCompensation`). The parent `WorkforcePage` retains all Redux selector calls and state management, computing config arrays and passing typed props down. **Zero behavioral or visual changes.**

---

## Technical Context

**Language/Version**: TypeScript 5.x + React 19  
**Primary Dependencies**: Redux Toolkit (`@reduxjs/toolkit`), React Router v7, Tailwind CSS v4, shadcn/ui  
**Storage**: N/A — pure UI structural refactoring, no new data persistence  
**Testing**: Vitest + React Testing Library (existing test suite is regression safety net; no new TDD required for structural refactor)  
**Target Platform**: Web SPA (Vite)  
**Project Type**: Single web frontend  
**Performance Goals**: N/A — no new render paths, no new network calls  
**Constraints**: Zero behavioral/visual regressions; `pnpm run type-check` must pass; `WorkforcePage.tsx` < 150 lines after extraction  
**Scale/Scope**: 7 files modified/created within `src/pages/workforce/`

---

## Constitution Check

_GATE: Must pass before implementation._

| Principle                       | Gate                                                                                    | Status           | Notes                                                                                                                                                                            |
| ------------------------------- | --------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Component-First Architecture | Each extracted component has clear TypeScript props interface and single responsibility | ✅ PASS          | 4 section components + 1 skeleton file + 1 utility; each has one purpose; JSDoc on default exports                                                                               |
| II. User-Centric Design         | User stories documented with acceptance criteria                                        | ✅ PASS          | 3 user stories with AC in spec.md                                                                                                                                                |
| III. Test-Driven Development    | Tests written before implementation for new behaviors                                   | ✅ PASS (scoped) | No new behaviors introduced; existing test suite (`tests/pages/`) serves as regression safety net; `WorkforcePage` has no direct tests to update (confirmed in research.md RQ-2) |
| IV. Type Safety & Code Quality  | No TypeScript errors; prop types via interfaces                                         | ✅ PASS          | All section components have typed props interfaces; no `any` added; type-check gate enforced at each step                                                                        |
| V. Performance & Accessibility  | No regressions in WCAG / CWV                                                            | ✅ PASS          | Identical render tree; no new bundle size impact (same components, no new dependencies)                                                                                          |
| VI. State Management Discipline | Redux access centralized; local state minimized                                         | ✅ PASS          | All `useAppSelector` calls remain in `WorkforcePage`; section components are purely presentational (RQ-1)                                                                        |

**Post-design re-check**: No violations found. Complexity Tracking table not required.

---

## Project Structure

### Documentation (this feature)

```text
specs/010-refactor-workforce-page/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output — prop interfaces for all section components
├── quickstart.md        # Phase 1 output — step-by-step implementation guide
├── contracts/
│   └── internal-contracts.md  # Phase 1 output — module boundary contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist (all items pass)
└── tasks.md             # Phase 2 output (/speckit.tasks command — NOT created here)
```

### Source Code (affected files only)

```text
src/pages/workforce/
├── workforceUtils.ts          # NEW — parsePercentage helper
├── WorkforceSkeletons.tsx     # NEW — 8 named skeleton components
├── WorkforceOverview.tsx      # NEW — overview cards + banner section
├── WorkforceParticipation.tsx # NEW — participation count cards + progress rows
├── WorkforceDemographics.tsx  # NEW — gender/donut/age-breakdown section
├── WorkforceCompensation.tsx  # NEW — compensation stats + tables + chart
├── WorkforcePage.tsx          # MODIFIED — trimmed to < 150 lines
├── SalaryChart.tsx            # UNTOUCHED
└── EmployTypeChart.tsx        # UNTOUCHED
```

**No other src/ files are modified.** The router, Redux store, selectors, and API layer are unchanged.

**Structure Decision**: Single web frontend (Option 1). All new files live alongside the existing `WorkforcePage.tsx` in `src/pages/workforce/` — consistent with the project's page-co-location pattern, as explicitly permitted by FR-001.

---

## Design Decisions

### D1 — Section components are purely presentational

Parent (`WorkforcePage`) owns all Redux selector calls and computes all config arrays. Section components receive typed props only. This enables isolated testing, mirrors the existing `SalaryChart`/`EmployTypeChart` co-located file pattern, and satisfies Constitution Principle VI.

→ See [research.md RQ-1](./research.md#rq-1-config-array-ownership)

### D2 — `parsePercentage` co-located in `workforceUtils.ts`

The function is workforce-specific (parses API string values like `"45%"` or `"N/A"`) with no reuse value globally. Co-location in `src/pages/workforce/workforceUtils.ts` is cleaner than adding a domain-specific parser to `src/utils/formatters.ts`.

→ See [research.md RQ-3](./research.md#rq-3-parsepercentage--is-there-already-a-similar-util-in-srcutils)

### D3 — `employmentTypeItems` defined in `WorkforceDemographics.tsx`

Static array, only used by Demographics. Defining it as a module-level constant there avoids unnecessary exports.

→ See [research.md RQ-5](./research.md#rq-5-employmenttypeitems--static-or-derived)

### D4 — JSDoc one-liner on each section's default export

Constitution Principle I requires JSDoc. For page-level components, a single-line `/** Brief description */` above the default export is consistent with the project norm and sufficient.

→ See [research.md RQ-4](./research.md#rq-4-jsdoc-requirement-constitution-principle-i)

### D5 — No new tests required

No new behaviors are introduced. No existing tests break (confirmed: `WorkforcePage` has zero direct unit tests). The existing `tests/pages/` suite is the regression safety net.

→ See [research.md RQ-2](./research.md#rq-2-existing-tests--do-any-tests-import-workforcepage-directly)

---

## Implementation Order

Follow [quickstart.md](./quickstart.md) step by step:

| Step | Action                              | Type-check gate     |
| ---- | ----------------------------------- | ------------------- |
| 1    | Create `workforceUtils.ts`          | ✅ after step       |
| 2    | Create `WorkforceSkeletons.tsx`     | ✅ after step       |
| 3    | Create `WorkforceOverview.tsx`      | ✅ after step       |
| 4    | Create `WorkforceParticipation.tsx` | ✅ after step       |
| 5    | Create `WorkforceDemographics.tsx`  | ✅ after step       |
| 6    | Create `WorkforceCompensation.tsx`  | ✅ after step       |
| 7    | Trim `WorkforcePage.tsx`            | ✅ after step       |
| 8    | Smoke test in browser               | Visual verification |

Each step creates a new file before the corresponding code is removed from `WorkforcePage.tsx`. TypeScript will report no unused imports until Step 7, so the type-check gate exercises the new file's types — it does not catch dead code in the parent until trimming happens.

---

## Artifacts

| Artifact      | Path                                                                     | Purpose                               |
| ------------- | ------------------------------------------------------------------------ | ------------------------------------- |
| Spec          | [spec.md](./spec.md)                                                     | Requirements and acceptance criteria  |
| Research      | [research.md](./research.md)                                             | 6 resolved research questions         |
| Data Model    | [data-model.md](./data-model.md)                                         | Prop interfaces for all 6 new modules |
| Contracts     | [contracts/internal-contracts.md](./contracts/internal-contracts.md)     | Module boundary contracts             |
| Quickstart    | [quickstart.md](./quickstart.md)                                         | 8-step implementation guide           |
| Agent Context | [.github/copilot-instructions.md](../../.github/copilot-instructions.md) | Updated `specify:agent` block         |

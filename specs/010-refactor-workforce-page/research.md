# Research: Refactor WorkforcePage into Smaller Modules

**Feature**: `010-refactor-workforce-page`  
**Branch**: `009-workforce-tab-api`  
**Phase**: Phase 0 — Outline & Research  
**Date**: 2026-04-15

---

## Research Questions

The spec was fully resolved in the clarification phase. Three structural decisions were confirmed before Phase 0 executed. The research below validates those decisions against the actual codebase and documents findings for the implementation phase.

---

## RQ-1: Config array ownership — are there Redux imports scattered through child components?

**Question**: Do any files in `src/pages/workforce/` already import Redux selectors directly, setting a precedent for section components?

**Finding**: `WorkforcePage.tsx` (the single file in that directory) holds all Redux selector imports. The two co-located files (`SalaryChart.tsx`, `EmployTypeChart.tsx`) accept only plain props — no Redux imports. This confirms the Option A pattern (parent owns Redux, passes props) is already the local convention.

**Decision**: Parent (`WorkforcePage`) computes all config arrays from Redux data and passes typed props to section components. Section components are purely presentational.

**Rationale**: Consistent with existing file conventions; enables isolated unit testing of sections with simple prop mocks.

**Alternatives considered**: Each section imports selectors directly (Option B) — rejected because it would make sections harder to test in isolation and scatter Redux coupling across files.

---

## RQ-2: Existing tests — do any tests import `WorkforcePage` directly?

**Question**: Do the files in `tests/pages/` test `WorkforcePage` directly, and will they break if imports change?

**Finding**: `tests/pages/WorkforceTab.test.tsx` tests `@/pages/assessmentWorkforce/WorkforceTab` — a completely different component (the assessment form tab, not the workforce data page). No test file directly imports or renders `WorkforcePage`. Searching `tests/` confirms zero references to `WorkforcePage` in test files.

**Decision**: No test files need to be updated as a direct result of the refactoring. The extraction of section components into new files will not break any existing test.

**Rationale**: Section component files are new additions; `WorkforcePage` itself stays exportable from the same path. Only internal composition changes.

**Alternatives considered**: Writing new tests for each section component — valuable but out of scope for a pure structural refactor per FR-012; will be a follow-up task.

---

## RQ-3: `parsePercentage` — is there already a similar util in `src/utils/`?

**Question**: Does `src/utils/formatters.ts` or another utility already have a percent-parsing function that could replace the local `parsePercentage`?

**Finding**: `src/utils/formatters.ts` contains `formatNumber`, `formatCurrency`, `formatPercentage` (formats a number _to_ a percent string) and similar display helpers — none that strip `%` and return a raw number. The existing utils format _for display_, not parse _from strings_. No existing util is equivalent to `parsePercentage`.

**Decision**: Extract `parsePercentage` to `src/pages/workforce/workforceUtils.ts` as confirmed in clarification. Do not place it in `src/utils/` — the use case is workforce-specific (parsing API string values like `"45%"` or `"N/A"`).

**Rationale**: Adding a workforce-specific parser to `src/utils/` would pollute the global utility namespace with a domain-specific function with no reuse value outside this feature.

**Alternatives considered**: Adding to `src/utils/formatters.ts` (rejected — domain-specific, no reuse elsewhere).

---

## RQ-4: JSDoc requirement (Constitution Principle I)

**Question**: Does the codebase consistently apply JSDoc on all components? What format is expected?

**Finding**: Examining `src/store/selectors/workforceSelectors.ts` and `src/utils/formatters.ts` shows JSDoc comments on all exported functions with `@param`, `@returns`, and `@example` blocks. `SalaryChart.tsx` and `EmployTypeChart.tsx` (the two existing workforce colocated files) do not have JSDoc. Page-level components in `src/pages/` generally omit JSDoc at the component level.

**Decision**: Add concise one-line JSDoc (`/** Brief description */`) on the default-exported component function in each new section file. Full `@param`/`@example` blocks are not required for React components (they are self-documenting via TypeScript prop types). This satisfies Constitution Principle I without over-engineering.

**Rationale**: Balances the constitution requirement with the existing page-component convention.

---

## RQ-5: `employmentTypeItems` — static or derived?

**Question**: The `employmentTypeItems` array (`[fullTime, partTime, seasonal]`) is defined inside `WorkforcePage`. Should it be a constant in `workforceUtils.ts` or simply defined in `WorkforceDemographics`?

**Finding**: The array is static (not derived from Redux data) and only consumed by the `WorkforceDemographics` section. It has no use anywhere else.

**Decision**: Define `employmentTypeItems` as a module-level constant inside `WorkforceDemographics.tsx`. It does not need to be lifted to `workforceUtils.ts`.

**Rationale**: Co-locating a static constant with the only component that uses it is cleaner than exporting it from a utils file.

---

## RQ-6: `isGetInTouchModalOpen` state — is the trigger button present?

**Question**: The modal open/close button appears removed from the JSX. Should the state and modal call be preserved or cleaned up?

**Finding**: The `GetInTouchModal` render at the bottom of `WorkforcePage` is present in the current JSX. The button that sets `setIsGetInTouchModalOpen(true)` is not visible in the current JSX. The state and modal render must be preserved per FR-015 (the feature is likely meant for future re-addition).

**Decision**: Keep `isGetInTouchModalOpen` state and the `<GetInTouchModal>` render in `WorkforcePage.tsx`. Do not remove either. Do not add new trigger buttons.

---

## Summary of Decisions

| ID   | Decision                                                                             | Rationale                                                                   |
| ---- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| RQ-1 | Parent owns Redux; sections are purely presentational                                | Matches existing co-located file conventions; enables isolated testing      |
| RQ-2 | No existing tests of `WorkforcePage`; no test updates needed by the refactor         | Zero risk of test regressions from module splits                            |
| RQ-3 | `parsePercentage` → `src/pages/workforce/workforceUtils.ts`                          | Workforce-specific; no reuse value in global `src/utils/`                   |
| RQ-4 | Add concise one-line JSDoc on each new section's default export                      | Satisfies Constitution Principle I at appropriate scope for page components |
| RQ-5 | `employmentTypeItems` defined as module constant in `WorkforceDemographics.tsx`      | Static, only used there                                                     |
| RQ-6 | Preserve `isGetInTouchModalOpen` state and modal render as-is in `WorkforcePage.tsx` | FR-015; likely pending button re-addition                                   |

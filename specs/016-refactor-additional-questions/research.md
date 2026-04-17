# Research: Refactor Additional Questions Module

**Feature**: `016-refactor-additional-questions`  
**Date**: 2026-04-17  
**Status**: Complete — all unknowns resolved

---

## Decision 1: File Layout for Sub-Components

**Decision**: Co-locate all section sub-components as siblings inside `src/pages/additionalQuestions/`, matching the existing `WorkforcePage` pattern exactly.

**Rationale**: The `WorkforcePage` page (`src/pages/workforce/WorkforcePage.tsx`) already uses this pattern: parent holds all state + hooks, sibling files export presentational section components. This is the established architectural precedent in this repo. Placing section components elsewhere (e.g. `src/features/`, `src/components/assessment/`) would create an inconsistency.

**Alternatives considered**:

- `src/features/additional-questions/` — No `features/` directory exists; would introduce an orphan structure.
- `src/components/assessment/` — These are page-specific, not reusable across the app. The `components/` folder is reserved for shared UI primitives.
- Inline in one file — The current state; rejected because it causes the high complexity.

**Files**:

```
src/pages/additionalQuestions/
├── AdditionalQuestions.tsx        (orchestrator — trimmed to ~150 lines)
├── WorkforceSection.tsx           (new)
├── CompensationSection.tsx        (new)
├── BenefitsRetirementSection.tsx  (new)
├── GoalsSection.tsx               (new)
└── index.ts                       (barrel — existing or new, re-export default only)
```

---

## Decision 2: Shared Question Primitive Components

**Decision**: Extract three shared primitives into `src/components/common/`:

- `FieldError.tsx` — the `<InputInfo> + <span>` error display (currently duplicated ~8 times)
- `QuestionRadioGroup.tsx` — label + optional error + `<RadioGroup>` with mapped options
- `QuestionCheckboxGroup.tsx` — label + optional error + mapped `<Checkbox>` options

**Rationale**:

- `FieldError` is a 4-line JSX pattern duplicated ~8 times. Extracting it eliminates 100% of that duplication with zero behaviour change.
- `QuestionRadioGroup` encapsulates the `<Label>` + `<FieldError>` + `<RadioGroup>` pattern repeated for every radio question. Same markup used in three of four sections.
- `QuestionCheckboxGroup` is the checkbox analogue used in the Workforce section (benefits-updates, commute-methods, short-term-incentives, long-term-incentives).

**Alternatives considered**:

- A single generic `Question.tsx` component with a `type` prop — rejected as over-engineering; the conditional rendering logic makes it harder to read than two separate small components.
- Leaving duplication inline per section — rejected; it conflicts with FR-003/SC-005 and constitution Principle I (Component-First).

---

## Decision 3: State Ownership — Everything in Parent

**Decision**: All state (`answers`, `goalsAnswers`, `annualRaiseMonth`, `payrollProvider`, `benefitsEnrollmentMonth`, `retirementMatchPercentage`, `fieldErrors`) and all handlers (`handleAnswerChange`, `handleMultiSelectToggle`, `handleGoalToggle`) remain in `AdditionalQuestions.tsx`. Section components are fully presentational.

**Rationale**:

- `handleSubmit` validation spans all four sections; it must read every piece of state. Moving state into children would require lifting back up or using context — both are more complex than passing props.
- The `handleAnswerChange` function cross-cuts sections (clearing `retirementMatchPercentage` when employer-match answer changes). Keeping it in the parent keeps the cross-cutting logic visible in one place.
- Matches WorkforcePage precedent exactly.

**Alternatives considered**:

- React Context for fieldErrors — Rejected; adds indirection with no benefit for a single-page form.
- Section-local state merged upward on submit — Rejected; would require `useImperativeHandle` or other complex patterns for validation.

---

## Decision 4: Question Data Arrays — Keep Module-Level in their Own Section File

**Decision**: Move each question data array into the file for the section that owns it:

- `questions` → `WorkforceSection.tsx` (module-level const)
- `compensationQuestions`, `monthOptions` → `CompensationSection.tsx`
- `benefitsQuestions`, `retirementQuestions` → `BenefitsRetirementSection.tsx`
- `goalsData` is already imported from `@/data/goalsData` → stays as-is in `GoalsSection.tsx`

**Rationale**: Co-locating data with the component that renders it makes each file self-contained. A developer editing retirement questions only opens `BenefitsRetirementSection.tsx`. This directly satisfies FR-006 and US2.

**Alternatives considered**:

- A dedicated `src/pages/additionalQuestions/questionData.ts` barrel — Reasonable alternative, but splits data from its consumer unnecessarily.
- Keeping all arrays in `AdditionalQuestions.tsx` — Rejected; defeating the purpose of decomposition.

---

## Decision 5: TypeScript Interface Definitions

**Decision**: Define section-specific `Props` interfaces inside each section file. Share the `QuestionAnswer` and `GoalsAnswer` interfaces via a new slim `src/types/additionalQuestionsTypes.ts`.

**Rationale**: `QuestionAnswer` and `GoalsAnswer` are used across multiple section files and the parent. Duplicating them would violate type safety. A dedicated types file follows the existing naming convention (`*Types.ts`).

**Alternatives considered**:

- Export interfaces from `AdditionalQuestions.tsx` and import them in section files — Creates a circular-looking dependency and conflates the page orchestrator with type source-of-truth.
- Inline interfaces per section file — Can't share types; leads to duplication.

---

## Decision 6: Test Strategy — No Changes to Existing Tests

**Decision**: The existing `tests/pages/AdditionalQuestions.test.tsx` requires zero changes. The test imports `default` from `@/pages/additionalQuestions/AdditionalQuestions` and mocks sub-components and hooks. After refactor, `AdditionalQuestions.tsx` remains the default export from the same path; it simply renders section sub-components which are also mocked.

**Rationale**: The test already stubs all base components and heavy dependencies. Section sub-components will automatically be rendered (or easily mockable if needed). The test suite covers redirect behaviour, not form rendering, so internal decomposition is transparent.

**New tests warranted**:

- Unit tests for `FieldError.tsx`, `QuestionRadioGroup.tsx`, `QuestionCheckboxGroup.tsx` shared primitives — small component tests to validate they render correctly.
- No new integration tests required; existing tests cover the orchestrator.

---

## Decision 7: Barrel Export

**Decision**: Create `src/pages/additionalQuestions/index.ts` that re-exports only `default` from `AdditionalQuestions.tsx`. Section sub-components do NOT need explicit barrel exports because they are internal implementation details of the page.

**Rationale**: The router imports `AdditionalQuestions` by default export from its path. Sub-components are only consumed by the parent; no external consumer needs to know they exist.

---

## Summary Table

| Decision          | Chosen                                                                                  | Key Reason                                      |
| ----------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------- |
| File layout       | Siblings in `src/pages/additionalQuestions/`                                            | Matches WorkforcePage precedent                 |
| Shared primitives | `FieldError`, `QuestionRadioGroup`, `QuestionCheckboxGroup` in `src/components/common/` | Eliminate duplication; constitution Principle I |
| State ownership   | All state + handlers in parent                                                          | Cross-section validation; WorkforcePage pattern |
| Data arrays       | In owning section file                                                                  | FR-006 co-location requirement                  |
| TypeScript types  | New `src/types/additionalQuestionsTypes.ts`                                             | Shared across section files                     |
| Tests             | Existing tests unchanged                                                                | Default export path preserved                   |
| Barrel            | `index.ts` re-exports default only                                                      | Router compatibility                            |

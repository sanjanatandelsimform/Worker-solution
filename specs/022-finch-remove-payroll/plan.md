# Implementation Plan: Remove Payroll Provider Question from Finch Flow

**Branch**: `022-finch-remove-payroll` | **Date**: 2026-04-24 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/022-finch-remove-payroll/spec.md`

## Summary

Remove the "Who is your company's payroll provider?" question from the Finch Additional Questions form (`AdditionalQuestions.tsx`). Since Finch already provides payroll data programmatically, the question is redundant in the Finch flow. The removal covers the UI question, associated component props, form state, inline validation, and the `payrollProvider` field in the submission payload type and builder function. The manual assessment flow (`assessmentSchemas.ts`) is not touched.

## Technical Context

**Language/Version**: TypeScript 5.x + React 19  
**Primary Dependencies**: Vite, React Router v7, Vitest, React Testing Library  
**Storage**: N/A (pure UI change)  
**Testing**: Vitest + React Testing Library  
**Target Platform**: Web (Vite SPA)  
**Project Type**: Single web application (`src/`)  
**Performance Goals**: N/A — no runtime logic added  
**Constraints**: Must not affect manual assessment flow; no new imports; no new components  
**Scale/Scope**: 4 source files + 4 test files; minimal change surface

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design._

| Principle                       | Status | Notes                                                                                     |
| ------------------------------- | ------ | ----------------------------------------------------------------------------------------- |
| I. Component-First Architecture | PASS   | Removing dead props from a well-scoped component                                          |
| II. User-Centric Design         | PASS   | Reduces redundant data entry for Finch users                                              |
| III. Test-Driven Development    | PASS   | 4 existing test files updated to reflect removal; no new untested behavior                |
| IV. Type Safety                 | PASS   | `CompensationPayload` type updated; TypeScript will enforce consistency across all usages |
| V. Performance & Accessibility  | PASS   | One fewer DOM element rendered; no regression                                             |
| VI. State Management Discipline | PASS   | Removing unused state variable; reduces component complexity                              |

**Post-design re-evaluation**: No violations. The design is the minimum change set required.

## Project Structure

### Documentation (this feature)

```text
specs/022-finch-remove-payroll/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/           ← empty (no API contract changes)
└── tasks.md             ← Phase 2 output (created by /speckit.tasks)
```

### Source Code (files modified)

```text
src/
├── types/
│   └── finchAssessmentTypes.ts       # Remove payrollProvider from CompensationPayload
├── utils/
│   └── finchAssessmentPayload.ts     # Remove parameter + field from buildFinchAssessmentPayload
└── pages/
    └── additionalQuestions/
        ├── AdditionalQuestions.tsx   # Remove state, validation, prop passing
        └── CompensationSection.tsx   # Remove question, props, isDropdown render branch

tests/
├── utils/
│   └── finchAssessmentPayload.test.ts
├── hooks/
│   └── useSubmitFinchAssessment.test.ts
├── pages/
│   └── AdditionalQuestionsHealthPremium.test.tsx
└── services/
    └── finchAssessmentApi.test.ts
```

**Structure Decision**: Single-project web application. All changes are within `src/` and `tests/`.

## Phase 0: Research Summary

All unknowns resolved. See [research.md](research.md) for full decisions.

**Key findings**:

1. `CompensationSection` is only imported in `AdditionalQuestions.tsx` — safe to remove the question outright from the component.
2. `buildFinchAssessmentPayload` has exactly one call site — clean parameter removal.
3. `assessmentSchemas.ts` uses a different validation path (manual flow) — do not touch.
4. Four test files contain `payrollProvider` in Finch-flow fixtures — all must be updated.
5. No backend or API contract changes are in scope.

## Phase 1: Design Summary

See [data-model.md](data-model.md) for full type diff and [quickstart.md](quickstart.md) for step-by-step implementation guide.

**Change set (ordered by dependency)**:

| Order | File                                                    | Change                                                              |
| ----- | ------------------------------------------------------- | ------------------------------------------------------------------- |
| 1     | `src/types/finchAssessmentTypes.ts`                     | Remove `payrollProvider: string \| null` from `CompensationPayload` |
| 2     | `src/utils/finchAssessmentPayload.ts`                   | Remove `payrollProvider` param + field                              |
| 3     | `src/pages/additionalQuestions/AdditionalQuestions.tsx` | Remove state, validation, call-site arg, props                      |
| 4     | `src/pages/additionalQuestions/CompensationSection.tsx` | Remove question, props, `isDropdown` render branch                  |
| 5     | `tests/utils/finchAssessmentPayload.test.ts`            | Update call args and payload assertions                             |
| 6     | `tests/hooks/useSubmitFinchAssessment.test.ts`          | Remove `payrollProvider` from fixture                               |
| 7     | `tests/pages/AdditionalQuestionsHealthPremium.test.tsx` | Remove `_payrollProvider`                                           |
| 8     | `tests/services/finchAssessmentApi.test.ts`             | Remove `payrollProvider` from fixture                               |

**Order rationale**: Types first (1) allows TypeScript to immediately flag all downstream usages (2–4) as errors, making the implementation self-guided. Tests updated last (5–8) after source is clean.

## Complexity Tracking

No constitution violations. No complexity justification needed.

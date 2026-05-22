# Implementation Plan: Add Health Premium Question to Benefits Section

**Branch**: `001-add-health-premium-question` | **Date**: 2026-04-18 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-add-health-premium-question/spec.md`

## Summary

Add a third required question to the Benefits section of `AdditionalQuestions.tsx`: "What is the employee-only monthly premium for the lowest-cost health plan your company offers?" The question uses a numeric text input field with placeholder "Enter amount" and helper text "i.e. $300". The entered value is validated on submit and included in the assessment payload. All changes are additive to the existing `BenefitsRetirementSection` component pattern — no existing questions are modified.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19 / Vite  
**Primary Dependencies**: React, React Router v7, Tailwind CSS v4, `@/components/common/FieldError`  
**Storage**: N/A (form state only; persisted via existing `useSubmitFinchAssessment` hook)  
**Testing**: Vitest + React Testing Library (TDD — tests written before implementation)  
**Target Platform**: Web (Vite SPA, client-side routing)  
**Project Type**: web  
**Performance Goals**: No new performance concerns; additive change to an existing form  
**Constraints**: No CSS Modules; Tailwind v4 semantic tokens only; no arbitrary values; no `any` types  
**Scale/Scope**: 1 new form field, 5 file edits, 1 new test file

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — all gates pass._

| Principle                       | Status  | Notes                                                                                                                       |
| ------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| I. Component-First Architecture | ✅ PASS | New `isNumericInput` render branch added to existing component; no new component needed; props interface extended cleanly   |
| II. User-Centric Design         | ✅ PASS | Spec has P1/P2 stories with acceptance criteria; Figma design referenced                                                    |
| III. Test-Driven Development    | ✅ PASS | New test file `AdditionalQuestionsHealthPremium.test.tsx` must be written BEFORE implementation                             |
| IV. Type Safety & Code Quality  | ✅ PASS | `QuestionDefinition` extended with optional flag; `BenefitsPayload` extended with optional field; no `any` types introduced |
| V. Performance & Accessibility  | ✅ PASS | Semantic `<input type="number">` with label; placeholder and helper text present; no performance impact                     |
| VI. State Management Discipline | ✅ PASS | New `useState<string>("")` variable follows existing pattern (`retirementMatchPercentage`); no global state changes         |

## Project Structure

### Documentation (this feature)

```text
specs/001-add-health-premium-question/
├── plan.md              ← this file
├── research.md          ← Phase 0: all decisions documented
├── data-model.md        ← Phase 1: type changes, state shape, render branch
├── quickstart.md        ← Phase 1: step-by-step implementation guide
└── checklists/
    └── requirements.md  ← spec quality checklist (already complete)
```

### Source Code (files changed)

```text
src/
├── types/
│   ├── additionalQuestionsTypes.ts     # Add isNumericInput?: boolean to QuestionDefinition
│   └── finchAssessmentTypes.ts         # Add healthPremiumMonthly?: number to BenefitsPayload
├── utils/
│   └── finchAssessmentPayload.ts       # Add healthPremiumMonthly param; wire into benefits object
└── pages/
    └── additionalQuestions/
        ├── AdditionalQuestions.tsx     # Add state, validation, props pass-through
        └── BenefitsRetirementSection.tsx  # Add 3rd question entry + isNumericInput render branch

tests/
└── pages/
    └── AdditionalQuestionsHealthPremium.test.tsx  # NEW: TDD tests for the new field
```

**Structure Decision**: Single web application (standard React SPA). All changes are within the existing `src/` and `tests/` layout.

## Phase 0: Research Summary

All unknowns resolved. See [research.md](./research.md) for full decision log.

Key decisions:

- **State**: New `healthPremiumMonthly: string` state variable (mirrors `retirementMatchPercentage`)
- **Render**: Extend `benefitsQuestions` map with `isNumericInput?: boolean` flag on `QuestionDefinition`
- **Payload field name**: `healthPremiumMonthly: number` (⚠ confirm with backend before merge)
- **Validation**: Empty → `"Enter an amount"`; no upper bound

## Phase 1: Design

Full contracts in [data-model.md](./data-model.md). Implementation steps in [quickstart.md](./quickstart.md).

### Implementation Steps (ordered by dependency)

1. **`additionalQuestionsTypes.ts`** — add `isNumericInput?: boolean` to `QuestionDefinition`
2. **`finchAssessmentTypes.ts`** — add `healthPremiumMonthly?: number` to `BenefitsPayload`
3. **`BenefitsRetirementSection.tsx`** — add 3rd question + extend props + add render branch
4. **`AdditionalQuestions.tsx`** — add state + validation + updated JSX props + payload call
5. **`finchAssessmentPayload.ts`** — add `healthPremiumMonthly` param + wire into `benefits`
6. **`AdditionalQuestionsHealthPremium.test.tsx`** — write tests (TDD: write first, then implement steps 1–5)

### Open Questions Before Merge

| #   | Question                                                                                            | Owner   | Blocking                                                     |
| --- | --------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------ |
| 1   | What is the exact API field name for the health premium? Current assumption: `healthPremiumMonthly` | Backend | No (UI works independently; only payload field name changes) |

## Complexity Tracking

No constitution violations. No complexity justification required.

# Quickstart: Refactor Additional Questions Module

**Feature**: `016-refactor-additional-questions`  
**Branch**: `016-refactor-additional-questions`

This guide is the implementation reference for an agent or developer executing this refactor. It describes exactly what to create, what to move, and what to preserve.

---

## Overview

`AdditionalQuestions.tsx` (~930 lines) is decomposed into:

- 3 shared UI primitive components (in `src/components/common/`)
- 1 shared TypeScript types file (in `src/types/`)
- 4 section components (in `src/pages/additionalQuestions/`)
- 1 slimmed-down orchestrator (`AdditionalQuestions.tsx` itself, ~150 lines)

**Zero user-observable changes.** All validation, conditional rendering, and navigation behaviour is preserved exactly.

---

## Phase 1 — Shared Types

### Create `src/types/additionalQuestionsTypes.ts`

Export these interfaces (no other content):

- `QuestionAnswer` — `{ [key: string]: string | string[] }`
- `GoalsAnswer` — `{ selectedGoals: string[]; topThreeGoals: string[] }`
- `QuestionOption` — `{ id: string; label: string }`
- `QuestionTooltip` — `{ title: string; description: string }`
- `QuestionDefinition` — full question shape with all optional fields

See [data-model.md](./data-model.md#1-new-shared-types-file) for exact field list.

**Note**: After creating this file, update `AdditionalQuestions.tsx` to import `QuestionAnswer` and `GoalsAnswer` from `@/types/additionalQuestionsTypes` instead of defining them inline.

---

## Phase 2 — Shared Primitive Components

Create these three files. Each is small (~30 lines max).

### `src/components/common/FieldError.tsx`

```tsx
import { InputInfo } from "@/assets/icons/inputInfo";

interface FieldErrorProps {
  message: string | undefined;
}

export function FieldError({ message }: FieldErrorProps): JSX.Element | null {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2">
      <InputInfo className="text-ws-error-600" />
      <span className="text-sm text-ws-error-600">{message}</span>
    </div>
  );
}
```

### `src/components/common/QuestionRadioGroup.tsx`

Import `RadioGroup`, `RadioButton` from `@/components/base/radio-buttons/radio-buttons`, `Label` from `@/components/base/input/label`, `FieldError` from `./FieldError`, `QuestionDefinition` from `@/types/additionalQuestionsTypes`.

Renders: numbered `<Label>` + `<FieldError>` + `<RadioGroup>` with one `<RadioButton>` per option.

Props: `question`, `displayIndex`, `value`, `onChange`, `error?` — see [data-model.md](./data-model.md#questionradiogroup).

### `src/components/common/QuestionCheckboxGroup.tsx`

Import `Checkbox` from `@/components/base/checkbox/checkbox`, `Label`, `FieldError`, `QuestionDefinition`.

Renders: numbered `<Label>` + `<FieldError>` + stacked `<Checkbox>` + label rows.

Props: `question`, `displayIndex`, `selectedValues`, `onToggle`, `error?` — see [data-model.md](./data-model.md#questioncheckboxgroup).

---

## Phase 3 — Section Components

All four section components live in `src/pages/additionalQuestions/`. They are presentational — no hooks, no state, no side effects. All data (question arrays) is declared as module-level `const` inside each file.

### `WorkforceSection.tsx`

- Move the `questions` array into this file (from `AdditionalQuestions.tsx` lines 29–75).
- Render the "Workforce" card (`bg-ws-base-white rounded-lg...` section) including title, description, and question loop.
- Each question: use `QuestionRadioGroup` for radio questions, `QuestionCheckboxGroup` for multi-select questions.
- Props: see [data-model.md](./data-model.md#workforcesection).

### `CompensationSection.tsx`

- Move `compensationQuestions` and `monthOptions` arrays into this file.
- Render the "Compensation" card including the conditional annual-raise month dropdown and the payroll-provider dropdown.
- The conditional month `<Select>` appears when `answers["annual-raises"] === "yes-raises"`. Render it with `annualRaiseMonth` + `onAnnualRaiseMonthChange`.
- The payroll provider `<Select>` always appears for the `payroll-provider` question.
- Props: see [data-model.md](./data-model.md#compensationsection).

### `BenefitsRetirementSection.tsx`

- Move `benefitsQuestions`, `retirementQuestions`, and `monthOptions` arrays into this file (or import `monthOptions` from a shared location if preferred — see note below).
- Render the combined "Benefits" card (includes the Retirement sub-section heading).
- Benefits enrollment `<Select>` uses `benefitsEnrollmentMonth` + `onBenefitsEnrollmentMonthChange`.
- Retirement employer-match conditional number input rendered when `answers["retirement-employer-match"] === "yes-match"`. Uses `retirementMatchPercentage` + `onRetirementMatchPercentageChange`.
- All field error display delegated to `<FieldError>` primitive.
- Props: see [data-model.md](./data-model.md#benefitsretirementsection).

> **Note**: `monthOptions` is used by both `CompensationSection` and `BenefitsRetirementSection`. Options:
>
> 1. Duplicate the array in each file (12 lines, acceptable for short const data).
> 2. Move to `src/data/monthOptions.ts` and import from there.
>    Option 2 is preferred if the array is ever likely to change.

### `GoalsSection.tsx`

- Renders the "Goals" card including the category checkboxes and `<RankingList>`.
- Imports `goalsData` from `@/data/goalsData` (unchanged import).
- Props: see [data-model.md](./data-model.md#goalssection).

---

## Phase 4 — Slim Down `AdditionalQuestions.tsx`

After creating section components, replace the four large JSX blocks in the `return` statement with section component calls:

```tsx
return (
  <div className="flex min-h-screen flex-col bg-ws-navy-25">
    {/* Top nav */}
    <div className="flex h-14 items-center justify-end ...">
      <Button onClick={handleClose} ... />
    </div>

    <div className="mx-auto w-full max-w-4xl flex-1 space-y-3 py-8 px-4">
      {/* Banners */}
      {success && <ErrorMessage ... />}
      {error && <ErrorMessage ... />}

      <div className="space-y-6">
        {/* Header */}
        <div className="w-full">
          <h2>Almost there!</h2>
          <p>...</p>
        </div>

        <WorkforceSection
          answers={answers}
          fieldErrors={fieldErrors}
          onAnswerChange={handleAnswerChange}
          onMultiSelectToggle={handleMultiSelectToggle}
        />

        <CompensationSection
          answers={answers}
          fieldErrors={fieldErrors}
          annualRaiseMonth={annualRaiseMonth}
          payrollProvider={payrollProvider}
          onAnswerChange={handleAnswerChange}
          onMultiSelectToggle={handleMultiSelectToggle}
          onAnnualRaiseMonthChange={month => { setAnnualRaiseMonth(month); handleClearFieldError("annualRaiseMonth"); }}
          onPayrollProviderChange={provider => { setPayrollProvider(provider); handleClearFieldError("payroll-provider"); }}
          onClearFieldError={handleClearFieldError}
        />

        <BenefitsRetirementSection
          answers={answers}
          fieldErrors={fieldErrors}
          benefitsEnrollmentMonth={benefitsEnrollmentMonth}
          retirementMatchPercentage={retirementMatchPercentage}
          onAnswerChange={handleAnswerChange}
          onBenefitsEnrollmentMonthChange={month => { setBenefitsEnrollmentMonth(month); handleClearFieldError("benefits-enrollment-period"); }}
          onRetirementMatchPercentageChange={value => { setRetirementMatchPercentage(value); handleClearFieldError("retirementMatchPercentage"); }}
          onClearFieldError={handleClearFieldError}
        />

        <GoalsSection
          goalsAnswers={goalsAnswers}
          fieldErrors={fieldErrors}
          onGoalToggle={handleGoalToggle}
          onTopThreeGoalsChange={value => setGoalsAnswers(prev => ({ ...prev, topThreeGoals: value }))}
        />
      </div>

      {/* Submit */}
      <div className="flex gap-8 my-6 justify-end">
        <Button ... onClick={handleSubmit} isDisabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Next"}
        </Button>
      </div>
    </div>
  </div>
);
```

**Keep in `AdditionalQuestions.tsx`**:

- All `useState` declarations
- `useNavigate`, `useAssessmentStatus`, `useFinchStatus`, `useSubmitFinchAssessment` hook calls
- Both `useEffect` hooks (redirect on completion / redirect when not connected)
- `handleClose`, `handleSubmit` (with all validation), `handleAnswerChange`, `handleMultiSelectToggle`, `handleGoalToggle`
- The `handleClearFieldError` helper: `(key: string) => setFieldErrors(prev => ({ ...prev, [key]: "" }))`

---

## Phase 5 — Barrel and Cleanup

1. Create/update `src/pages/additionalQuestions/index.ts`:

```ts
export { default } from "./AdditionalQuestions";
```

2. Verify `AdditionalQuestions.tsx` imports are cleaned up — remove imports of `InputInfo`, `RadioGroup`, `RadioButton`, `Checkbox`, `Label` if no longer used directly in the parent (they'll live in section components).

3. Remove the inline `QuestionAnswer` and `GoalsAnswer` interface definitions from `AdditionalQuestions.tsx` — they now live in `@/types/additionalQuestionsTypes`.

---

## Verification Checklist

Run these after all changes:

```powershell
# Type check — must produce zero errors
pnpm run type-check

# Lint and format
pnpm lint:fix
pnpm format

# Run all tests — must all pass
pnpm test --run
```

Expected test outcome: All existing suites pass. The `AdditionalQuestions.test.tsx` tests continue to pass because:

- Default export path is unchanged (`@/pages/additionalQuestions/AdditionalQuestions`)
- The test mocks all base components already; section sub-components render them, which are mocked
- No new hook logic introduced in the parent

---

## File Change Summary

| File                                                          | Action                | Notes                                                   |
| ------------------------------------------------------------- | --------------------- | ------------------------------------------------------- |
| `src/types/additionalQuestionsTypes.ts`                       | **Create**            | Shared type definitions                                 |
| `src/components/common/FieldError.tsx`                        | **Create**            | Inline error primitive                                  |
| `src/components/common/QuestionRadioGroup.tsx`                | **Create**            | Shared radio-group primitive                            |
| `src/components/common/QuestionCheckboxGroup.tsx`             | **Create**            | Shared checkbox-group primitive                         |
| `src/pages/additionalQuestions/WorkforceSection.tsx`          | **Create**            | Workforce questions section                             |
| `src/pages/additionalQuestions/CompensationSection.tsx`       | **Create**            | Compensation questions section                          |
| `src/pages/additionalQuestions/BenefitsRetirementSection.tsx` | **Create**            | Benefits + Retirement section                           |
| `src/pages/additionalQuestions/GoalsSection.tsx`              | **Create**            | Goals section                                           |
| `src/pages/additionalQuestions/AdditionalQuestions.tsx`       | **Modify**            | Slim to ~150 lines; replace JSX with section components |
| `src/pages/additionalQuestions/index.ts`                      | **Create**            | Barrel export                                           |
| `src/data/monthOptions.ts`                                    | **Create (optional)** | Shared month options array                              |

# Data Model: Refactor Additional Questions Module

**Feature**: `016-refactor-additional-questions`  
**Date**: 2026-04-17

This is a pure UI refactor — no new API endpoints, no new Redux slices, no new server-side entities. The "data model" for this feature describes the TypeScript interfaces and component props contracts.

---

## 1. New Shared Types File

### `src/types/additionalQuestionsTypes.ts`

```typescript
/** Generic answer map keyed by question ID */
export interface QuestionAnswer {
  [key: string]: string | string[];
}

/** Goals section state shape */
export interface GoalsAnswer {
  selectedGoals: string[];
  topThreeGoals: string[];
}

/** Shape of a single question option */
export interface QuestionOption {
  id: string;
  label: string;
}

/** Shape of a tooltip attached to a question */
export interface QuestionTooltip {
  title: string;
  description: string;
}

/** Shape of a standard question definition used in question data arrays */
export interface QuestionDefinition {
  id: string;
  question: string;
  required: boolean;
  options: QuestionOption[];
  isMultiSelect?: boolean;
  isDropdown?: boolean;
  hasConditional?: boolean;
  tooltip?: QuestionTooltip;
}
```

---

## 2. Shared Primitive Component Props

### `FieldError` — `src/components/common/FieldError.tsx`

**Purpose**: Renders the icon + error text combination currently duplicated ~8× in the file.

```typescript
interface FieldErrorProps {
  /** Error message to display. Component renders nothing if falsy. */
  message: string | undefined;
}
```

**Renders**: `<div className="flex items-center gap-2"><InputInfo .../><span ...>{message}</span></div>` only when `message` is truthy.

---

### `QuestionRadioGroup` — `src/components/common/QuestionRadioGroup.tsx`

**Purpose**: Renders a labelled radio-button question with optional inline error.

```typescript
interface QuestionRadioGroupProps {
  /** Question definition including id, question text, required flag, options */
  question: QuestionDefinition;
  /** 1-based display index shown before the question text */
  displayIndex: number;
  /** Currently selected value for this question */
  value: string;
  /** Called when user selects a radio option */
  onChange: (questionId: string, value: string) => void;
  /** Error message for this field, if any */
  error?: string;
}
```

**Renders**: `<Label>` + `<FieldError>` + `<RadioGroup>` with mapped `<RadioButton>` options.

---

### `QuestionCheckboxGroup` — `src/components/common/QuestionCheckboxGroup.tsx`

**Purpose**: Renders a labelled checkbox-group question with optional inline error.

```typescript
interface QuestionCheckboxGroupProps {
  /** Question definition including id, question text, required flag, options */
  question: QuestionDefinition;
  /** 1-based display index shown before the question text */
  displayIndex: number;
  /** Currently selected option IDs */
  selectedValues: string[];
  /** Called when a checkbox is toggled */
  onToggle: (questionId: string, optionId: string) => void;
  /** Error message for this field, if any */
  error?: string;
}
```

**Renders**: `<Label>` + `<FieldError>` + `<div>` with mapped `<Checkbox>` + label elements.

---

## 3. Section Component Props

### `WorkforceSection` — `src/pages/additionalQuestions/WorkforceSection.tsx`

```typescript
interface WorkforceSectionProps {
  answers: QuestionAnswer;
  fieldErrors: Record<string, string>;
  onAnswerChange: (questionId: string, value: string) => void;
  onMultiSelectToggle: (questionId: string, optionId: string) => void;
}
```

**Owns data**: `questions` array (the 4 workforce questions — benefits-updates, deskless-employees, commute-methods, commute-duration).

---

### `CompensationSection` — `src/pages/additionalQuestions/CompensationSection.tsx`

```typescript
interface CompensationSectionProps {
  answers: QuestionAnswer;
  fieldErrors: Record<string, string>;
  annualRaiseMonth: string;
  payrollProvider: string;
  onAnswerChange: (questionId: string, value: string) => void;
  onMultiSelectToggle: (questionId: string, optionId: string) => void;
  onAnnualRaiseMonthChange: (month: string) => void;
  onPayrollProviderChange: (provider: string) => void;
  onClearFieldError: (key: string) => void;
}
```

**Owns data**: `compensationQuestions` array, `monthOptions` array.

---

### `BenefitsRetirementSection` — `src/pages/additionalQuestions/BenefitsRetirementSection.tsx`

```typescript
interface BenefitsRetirementSectionProps {
  answers: QuestionAnswer;
  fieldErrors: Record<string, string>;
  benefitsEnrollmentMonth: string;
  retirementMatchPercentage: string;
  onAnswerChange: (questionId: string, value: string) => void;
  onBenefitsEnrollmentMonthChange: (month: string) => void;
  onRetirementMatchPercentageChange: (value: string) => void;
  onClearFieldError: (key: string) => void;
}
```

**Owns data**: `benefitsQuestions` array, `retirementQuestions` array, `monthOptions` array (imported or re-used from shared data).

---

### `GoalsSection` — `src/pages/additionalQuestions/GoalsSection.tsx`

```typescript
interface GoalsSectionProps {
  goalsAnswers: GoalsAnswer;
  fieldErrors: Record<string, string>;
  onGoalToggle: (goalId: string) => void;
  onTopThreeGoalsChange: (topThreeGoals: string[]) => void;
}
```

**Uses data**: `goalsData` imported from `@/data/goalsData` (unchanged).

---

## 4. State Ownership Map

All state lives in `AdditionalQuestions.tsx` and is passed down as props:

| State                       | Type                     | Passed to Section(s)                          |
| --------------------------- | ------------------------ | --------------------------------------------- |
| `answers`                   | `QuestionAnswer`         | All 4 sections (read-only)                    |
| `goalsAnswers`              | `GoalsAnswer`            | GoalsSection                                  |
| `annualRaiseMonth`          | `string`                 | CompensationSection                           |
| `payrollProvider`           | `string`                 | CompensationSection                           |
| `benefitsEnrollmentMonth`   | `string`                 | BenefitsRetirementSection                     |
| `retirementMatchPercentage` | `string`                 | BenefitsRetirementSection                     |
| `fieldErrors`               | `Record<string, string>` | All 4 sections (read-only)                    |
| `setFieldErrors`            | setter                   | NOT passed (via `onClearFieldError` callback) |

> **Note**: Sections do not receive the raw `setFieldErrors` setter. Instead, they receive a narrow `onClearFieldError(key: string)` callback so they cannot accidentally replace the entire errors map. The parent provides this as `key => setFieldErrors(prev => ({ ...prev, [key]: "" }))`.

---

## 5. Callback Contract Summary

All callbacks defined in `AdditionalQuestions.tsx` parent:

| Callback                                | Signature                                        | Used by                                        |
| --------------------------------------- | ------------------------------------------------ | ---------------------------------------------- |
| `handleAnswerChange`                    | `(questionId: string, value: string) => void`    | All 4 sections                                 |
| `handleMultiSelectToggle`               | `(questionId: string, optionId: string) => void` | WorkforceSection, CompensationSection          |
| `handleGoalToggle`                      | `(goalId: string) => void`                       | GoalsSection                                   |
| `handleClearFieldError`                 | `(key: string) => void`                          | CompensationSection, BenefitsRetirementSection |
| `handleAnnualRaiseMonthChange`          | `(month: string) => void`                        | CompensationSection                            |
| `handlePayrollProviderChange`           | `(provider: string) => void`                     | CompensationSection                            |
| `handleBenefitsEnrollmentMonthChange`   | `(month: string) => void`                        | BenefitsRetirementSection                      |
| `handleRetirementMatchPercentageChange` | `(value: string) => void`                        | BenefitsRetirementSection                      |

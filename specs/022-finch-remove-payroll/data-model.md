# Data Model: Remove Payroll Provider from Finch Flow

**Feature**: `022-finch-remove-payroll`
**Date**: 2026-04-24

## Entity Changes

### CompensationPayload (MODIFIED)

Location: `src/types/finchAssessmentTypes.ts`

**Before**:
```typescript
export interface CompensationPayload {
  offersAnnualRaises: boolean;
  annualRaiseMonth?: string;
  payrollProvider: string | null;   // <-- REMOVE
  shiftDifferentials: boolean;
  shortTermIncentives: string[];
  longTermIncentives: string[];
}
```

**After**:
```typescript
export interface CompensationPayload {
  offersAnnualRaises: boolean;
  annualRaiseMonth?: string;
  shiftDifferentials: boolean;
  shortTermIncentives: string[];
  longTermIncentives: string[];
}
```

**Rationale**: Finch already provides payroll provider data via its API integration. The field is redundant in the Finch assessment payload.

---

### buildFinchAssessmentPayload (MODIFIED)

Location: `src/utils/finchAssessmentPayload.ts`

**Before** (signature):
```typescript
export function buildFinchAssessmentPayload(
  answers: QuestionAnswer,
  goalsAnswers: GoalsAnswer,
  annualRaiseMonth: string,
  payrollProvider: string,       // <-- REMOVE
  benefitsEnrollmentMonth: string,
  retirementPlanHasMatch?: boolean,
  retirementMatchPercentage?: string,
  healthPremiumMonthly?: string,
): FinchAssessmentPayload
```

**After** (signature):
```typescript
export function buildFinchAssessmentPayload(
  answers: QuestionAnswer,
  goalsAnswers: GoalsAnswer,
  annualRaiseMonth: string,
  benefitsEnrollmentMonth: string,
  retirementPlanHasMatch?: boolean,
  retirementMatchPercentage?: string,
  healthPremiumMonthly?: string,
): FinchAssessmentPayload
```

---

### compensationQuestions array in CompensationSection (MODIFIED)

Location: `src/pages/additionalQuestions/CompensationSection.tsx`

Remove the entire `payroll-provider` question entry (the dropdown). No remaining question uses `isDropdown: true`, so the `if (question.isDropdown)` rendering branch can be removed as well.

---

### CompensationSectionProps (MODIFIED)

Location: `src/pages/additionalQuestions/CompensationSection.tsx`

**Before**:
```typescript
interface CompensationSectionProps {
  answers: QuestionAnswer;
  fieldErrors: Record<string, string>;
  annualRaiseMonth: string;
  payrollProvider: string;             // <-- REMOVE
  onAnswerChange: (questionId: string, value: string) => void;
  onMultiSelectToggle: (questionId: string, optionId: string) => void;
  onAnnualRaiseMonthChange: (month: string) => void;
  onPayrollProviderChange: (provider: string) => void;  // <-- REMOVE
  onClearFieldError: (key: string) => void;
}
```

**After**:
```typescript
interface CompensationSectionProps {
  answers: QuestionAnswer;
  fieldErrors: Record<string, string>;
  annualRaiseMonth: string;
  onAnswerChange: (questionId: string, value: string) => void;
  onMultiSelectToggle: (questionId: string, optionId: string) => void;
  onAnnualRaiseMonthChange: (month: string) => void;
  onClearFieldError: (key: string) => void;
}
```

---

## State Changes in AdditionalQuestions.tsx

| State variable | Action |
|---|---|
| `payrollProvider` (useState) | Remove |
| validation check `if (!payrollProvider)` | Remove |
| `payrollProvider` arg in `buildFinchAssessmentPayload(...)` | Remove |
| `payrollProvider` prop on `<CompensationSection>` | Remove |
| `onPayrollProviderChange` prop on `<CompensationSection>` | Remove |

## Imports to clean up

- `CompensationSection.tsx`: If removing the dropdown `if` branch also removes all usages of `Label`, `Select`, `SelectItem`, `FieldError`, check whether those imports are still used by other branches and remove if not.
- The `annualRaiseMonth` path still uses `Select`, `SelectItem`, `Label`, and `FieldError` so those imports remain.

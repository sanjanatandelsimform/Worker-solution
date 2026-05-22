# Data Model: Add Health Premium Question

**Feature**: `001-add-health-premium-question`  
**Branch**: `001-add-health-premium-question`

---

## 1. Type Changes

### `src/types/additionalQuestionsTypes.ts` — extend `QuestionDefinition`

Add one optional field to the existing `QuestionDefinition` interface:

```ts
export interface QuestionDefinition {
  id: string;
  question: string;
  required: boolean;
  options: QuestionOption[];
  tooltip?: QuestionTooltip;
  isDropdown?: boolean;
  hasConditional?: boolean;
  isNumericInput?: boolean; // ← NEW: renders a numeric <input> instead of radio/dropdown
}
```

No other type changes in this file.

---

### `src/types/finchAssessmentTypes.ts` — extend `BenefitsPayload`

```ts
export interface BenefitsPayload {
  workWithBenefitsBroker: "Yes" | "No" | "Unsure" | null;
  benefitEnrollmentMonth: string | null;
  retirementVestingPeriod: string;
  retirementPlanHasMatch: boolean;
  retirementMatchPercentage?: number;
  retirementAutoEnroll: boolean;
  retirementHardshipWithdrawals: boolean;
  healthPremiumMonthly?: number; // ← NEW; omitted when empty
}
```

---

## 2. State Shape in `AdditionalQuestions.tsx`

Add one new `useState` alongside the existing Benefits/Retirement state:

| Variable               | Type     | Default | Existing analogue           |
| ---------------------- | -------- | ------- | --------------------------- |
| `healthPremiumMonthly` | `string` | `""`    | `retirementMatchPercentage` |

Passed into `BenefitsRetirementSection` as:

| Prop                           | Type                      | Handler                          |
| ------------------------------ | ------------------------- | -------------------------------- |
| `healthPremiumMonthly`         | `string`                  | setter `setHealthPremiumMonthly` |
| `onHealthPremiumMonthlyChange` | `(value: string) => void` | wraps `setHealthPremiumMonthly`  |

---

## 3. `BenefitsRetirementSectionProps` Interface

```ts
interface BenefitsRetirementSectionProps {
  answers: QuestionAnswer;
  fieldErrors: Record<string, string>;
  benefitsEnrollmentMonth: string;
  retirementMatchPercentage: string;
  healthPremiumMonthly: string; // ← NEW
  onAnswerChange: (questionId: string, value: string) => void;
  onBenefitsEnrollmentMonthChange: (month: string) => void;
  onRetirementMatchPercentageChange: (value: string) => void;
  onHealthPremiumMonthlyChange: (value: string) => void; // ← NEW
  onClearFieldError: (key: string) => void;
}
```

---

## 4. Benefits Questions Array — 3rd Entry

The new entry in the `benefitsQuestions: QuestionDefinition[]` array:

```ts
{
  id: "health-plan-monthly-premium",
  question: "What is the employee-only monthly premium for the lowest-cost health plan your company offers?",
  required: true,
  isNumericInput: true,        // triggers numeric <input> branch in renderer
  options: [],                 // required by interface; unused for numeric inputs
}
```

**Question IDs in benefits section after this change:**

1. `"benefits-broker"` — radio group
2. `"benefits-enrollment-period"` — dropdown (isDropdown: true)
3. `"health-plan-monthly-premium"` — numeric input (isNumericInput: true)

---

## 5. Render Branch in `BenefitsRetirementSection.tsx`

Inside `benefitsQuestions.map()`, add an `else if` branch after the existing `isDropdown` check:

```tsx
} else if (question.isNumericInput) {
  // Numeric dollar amount input (e.g. health premium)
  return (
    <>
      <FieldError message={fieldErrors[question.id]} />
      <input
        type="number"
        min="0"
        step="1"
        placeholder="Enter amount"
        value={healthPremiumMonthly}
        onChange={e => {
          onHealthPremiumMonthlyChange(e.target.value);
          onClearFieldError(question.id);
        }}
        className="w-full max-w-xs rounded-lg border border-ws-border-primary bg-ws-base-white px-3 py-2 text-sm text-ws-text-primary placeholder:text-ws-gray-40 focus:border-ws-navy-800 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <p className="text-sm text-ws-text-tertiary">i.e. $300</p>
    </>
  );
}
```

> Note: The `[appearance:textfield]` Tailwind utility removes the browser-native number spinners (matching the `retirementMatchPercentage` input style).

---

## 6. Validation in `AdditionalQuestions.tsx`

Add to `handleSubmit`, alongside existing benefits field validations:

```ts
if (!healthPremiumMonthly) {
  newErrors["health-plan-monthly-premium"] = "Enter an amount";
}
```

Position: after the `benefitsEnrollmentMonth` check, before retirement validations.

---

## 7. Payload Builder Changes

### Function signature (`buildFinchAssessmentPayload`)

Add new parameter:

```ts
export function buildFinchAssessmentPayload(
  answers: QuestionAnswer,
  goalsAnswers: GoalsAnswer,
  annualRaiseMonth: string,
  payrollProvider: string,
  benefitsEnrollmentMonth: string,
  retirementPlanHasMatch: boolean = false,
  retirementMatchPercentage: string = "",
  healthPremiumMonthly: string = "" // ← NEW (last position, default "")
): FinchAssessmentPayload;
```

### `benefits` object

```ts
const benefits: BenefitsPayload = {
  // ... existing fields ...
  ...(healthPremiumMonthly ? { healthPremiumMonthly: Number(healthPremiumMonthly) } : {}),
};
```

### Call site in `AdditionalQuestions.tsx`

```ts
const payload = buildFinchAssessmentPayload(
  answers,
  goalsAnswers,
  annualRaiseMonth,
  payrollProvider,
  benefitsEnrollmentMonth,
  answers["retirement-employer-match"] === "yes-match",
  retirementMatchPercentage,
  healthPremiumMonthly // ← NEW last argument
);
```

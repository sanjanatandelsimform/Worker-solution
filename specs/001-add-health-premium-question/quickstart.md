# Quickstart: Add Health Premium Question

**Feature**: `001-add-health-premium-question`  
**Branch**: `001-add-health-premium-question`

This guide is the step-by-step implementation reference. Make changes in this order to avoid TypeScript errors at each save.

---

## Step 1 — Extend `QuestionDefinition` type

**File**: `src/types/additionalQuestionsTypes.ts`

Add `isNumericInput?: boolean` to the `QuestionDefinition` interface. This flag tells the renderer to use a number input instead of radio buttons or a dropdown.

```ts
export interface QuestionDefinition {
  // ...existing fields...
  isNumericInput?: boolean; // ADD THIS
}
```

---

## Step 2 — Extend `BenefitsPayload` type

**File**: `src/types/finchAssessmentTypes.ts`

Add the new optional field to `BenefitsPayload`:

```ts
export interface BenefitsPayload {
  // ...existing fields...
  healthPremiumMonthly?: number; // ADD THIS
}
```

> ⚠ Confirm the exact field name with the backend team before merging. Updating only this file and `finchAssessmentPayload.ts` is sufficient if the name changes.

---

## Step 3 — Update `BenefitsRetirementSection.tsx`

**File**: `src/pages/additionalQuestions/BenefitsRetirementSection.tsx`

### 3a — Add the 3rd question to `benefitsQuestions`

```ts
const benefitsQuestions: QuestionDefinition[] = [
  // ...question 1 (benefits-broker)...
  // ...question 2 (benefits-enrollment-period)...
  {
    id: "health-plan-monthly-premium",
    question:
      "What is the employee-only monthly premium for the lowest-cost health plan your company offers?",
    required: true,
    isNumericInput: true,
    options: [],
  },
];
```

### 3b — Extend the props interface

```ts
interface BenefitsRetirementSectionProps {
  // ...existing props...
  healthPremiumMonthly: string; // ADD
  onHealthPremiumMonthlyChange: (value: string) => void; // ADD
}
```

Destructure the two new props in the function signature.

### 3c — Add a render branch inside `benefitsQuestions.map()`

After the `} else {` dropdown branch (`<Select>...</Select>`), add a third `else if`:

```tsx
} else if (question.isNumericInput) {
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

> Note: Wrap the three items in a fragment since they replace the existing single-element return.

The full conditional structure inside the map becomes:

```
if (!question.isDropdown && !question.isNumericInput)  → <RadioGroup>
else if (question.isDropdown)                          → <Select>
else if (question.isNumericInput)                      → <input type="number">
```

---

## Step 4 — Update `AdditionalQuestions.tsx`

**File**: `src/pages/additionalQuestions/AdditionalQuestions.tsx`

### 4a — Add state

```ts
const [healthPremiumMonthly, setHealthPremiumMonthly] = useState<string>("");
```

Place alongside `retirementMatchPercentage`.

### 4b — Add validation in `handleSubmit`

After the `benefitsEnrollmentMonth` validation check, add:

```ts
if (!healthPremiumMonthly) {
  newErrors["health-plan-monthly-premium"] = "Enter an amount";
}
```

### 4c — Pass new props to `BenefitsRetirementSection`

```tsx
<BenefitsRetirementSection
  answers={answers}
  fieldErrors={fieldErrors}
  benefitsEnrollmentMonth={benefitsEnrollmentMonth}
  retirementMatchPercentage={retirementMatchPercentage}
  healthPremiumMonthly={healthPremiumMonthly}                           {/* ADD */}
  onAnswerChange={handleAnswerChange}
  onBenefitsEnrollmentMonthChange={setBenefitsEnrollmentMonth}
  onRetirementMatchPercentageChange={setRetirementMatchPercentage}
  onHealthPremiumMonthlyChange={setHealthPremiumMonthly}                {/* ADD */}
  onClearFieldError={handleClearFieldError}
/>
```

### 4d — Pass to payload builder

Update the `buildFinchAssessmentPayload` call:

```ts
const payload = buildFinchAssessmentPayload(
  answers,
  goalsAnswers,
  annualRaiseMonth,
  payrollProvider,
  benefitsEnrollmentMonth,
  answers["retirement-employer-match"] === "yes-match",
  retirementMatchPercentage,
  healthPremiumMonthly // ADD as final argument
);
```

---

## Step 5 — Update `finchAssessmentPayload.ts`

**File**: `src/utils/finchAssessmentPayload.ts`

### 5a — Add parameter to function signature

```ts
export function buildFinchAssessmentPayload(
  // ...existing params...
  retirementMatchPercentage: string = "",
  healthPremiumMonthly: string = "" // ADD
): FinchAssessmentPayload;
```

### 5b — Wire into `benefits` object

```ts
const benefits: BenefitsPayload = {
  workWithBenefitsBroker: brokerRaw ? (brokerMap[brokerRaw] ?? null) : null,
  benefitEnrollmentMonth: benefitsEnrollmentMonth ? capitalise(benefitsEnrollmentMonth) : null,
  retirementVestingPeriod: (answers["retirement-vesting-period"] as string) ?? "",
  retirementPlanHasMatch,
  ...(retirementPlanHasMatch && retirementMatchPercentage
    ? { retirementMatchPercentage: Number(retirementMatchPercentage) }
    : {}),
  retirementAutoEnroll: answers["retirement-auto-enroll"] === "yes-autoenroll",
  retirementHardshipWithdrawals: answers["retirement-hardship-withdrawals"] === "yes-hardship",
  ...(healthPremiumMonthly // ADD
    ? { healthPremiumMonthly: Number(healthPremiumMonthly) }
    : {}),
};
```

---

## Step 6 — Tests

**New test file**: `tests/pages/AdditionalQuestionsHealthPremium.test.tsx`

Write tests BEFORE implementation (TDD — Constitution Principle III):

1. **Renders new question label** — assert `"What is the employee-only monthly premium..."` appears when visiting the Benefits section.
2. **Accepts numeric input** — fire `change` on the input, assert value updates.
3. **Shows validation error when empty** — submit form without filling the field, assert error text `"Enter an amount"` appears.
4. **Clears error on input** — type a value after seeing an error, assert error disappears.
5. **Payload includes field** — spy on `submit` and assert `benefits.healthPremiumMonthly` equals the entered value as a number.

The existing `tests/pages/AdditionalQuestions.test.tsx` does NOT need changes.

---

## Quality Gate

After all edits:

```
pnpm run type-check   # must pass with 0 errors
pnpm lint:fix
pnpm format
pnpm dev              # smoke-test /additional-questions route
```

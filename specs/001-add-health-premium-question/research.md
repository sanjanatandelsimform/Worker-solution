# Research: Add Health Premium Question to Benefits Section

**Feature**: `001-add-health-premium-question`  
**Date**: 2026-04-18  
**Branch**: `001-add-health-premium-question`

---

## Research Questions Answered

### 1. Where does the new question live in the component tree?

**Decision**: Add to the `benefitsQuestions` array inside `BenefitsRetirementSection.tsx`.  
**Rationale**: The first two Benefits questions (`benefits-broker`, `benefits-enrollment-period`) are already declared in this array. The third question is a sibling and belongs in the same location.  
**Alternatives considered**: Adding it as a standalone block outside the `benefitsQuestions` map — rejected because the existing map already handles label + error rendering, and adding a third mapped entry requires minimal change.

---

### 2. What input control pattern to use for the numeric amount?

**Decision**: Use a plain HTML `<input type="number">` with `min="0"` and `step="1"`, styled with Tailwind, following the exact same pattern as `retirementMatchPercentage` in `BenefitsRetirementSection.tsx` (lines ~208–240).  
**Rationale**: The retirement match percentage field is the closest existing analogue — numeric, required, validated on submit, with an inline error. Its pattern is already established and tested.  
**Alternatives considered**:

- shadcn `Input` component — not used anywhere in this form; would introduce unnecessary divergence.
- `type="text"` with pattern validation — unnecessary complexity when `type="number"` natively restricts to numeric input.

---

### 3. How is a standalone numeric input wired into state vs. the `answers` map?

**Decision**: Add a new top-level state variable in `AdditionalQuestions.tsx`: `healthPremiumMonthly` (`string`, default `""`). Pass it down as a prop to `BenefitsRetirementSection` with a corresponding setter callback. This mirrors exactly how `retirementMatchPercentage` is handled.  
**Rationale**: The `answers` map is typed as `QuestionAnswer = { [key: string]: string | string[] }` and is primarily used for radio/checkbox questions that map to a question ID. Standalone numeric inputs (retirement match %, enrollment month) use dedicated state variables. Consistency demands the same approach here.  
**Alternatives considered**:

- Storing in `answers["health-plan-monthly-premium"]` — technically possible but inconsistent with how the two other numeric/dropdown standalone fields are handled (`retirementMatchPercentage`, `benefitsEnrollmentMonth`, `annualRaiseMonth`). Rejected.

---

### 4. What is the API/payload field name?

**Decision**: `healthPremiumMonthly: number` in `BenefitsPayload`.  
**Rationale**: Follows the existing camelCase convention of `BenefitsPayload` fields (e.g., `retirementMatchPercentage`, `benefitEnrollmentMonth`). The value is sent as a `number` (integer) to match `retirementMatchPercentage` which is also sent as `Number(string)`.  
**⚠ Assumption**: The exact API field name must be confirmed with the backend team before merging. If the backend expects a different name, only `finchAssessmentTypes.ts` and `finchAssessmentPayload.ts` need to be updated. The UI is decoupled from the wire format.  
**Alternatives considered**:

- `healthPlanMonthlyPremium` — shorter but less descriptive.
- `employeeOnlyMonthlyPremium` — describes the employee perspective but loses the "lowest-cost plan" context.

---

### 5. What does the `BenefitsRetirementSection` prop interface need?

**Decision**: Add two props to `BenefitsRetirementSectionProps`:

```ts
healthPremiumMonthly: string;
onHealthPremiumMonthlyChange: (value: string) => void;
```

**Rationale**: Follows the naming established by `retirementMatchPercentage` / `onRetirementMatchPercentageChange` and `benefitsEnrollmentMonth` / `onBenefitsEnrollmentMonthChange`.

---

### 6. How is the question rendered in `benefitsQuestions.map()`?

**Decision**: The third question is a new entry in `benefitsQuestions` with `isNumericInput: true`. Inside the map, add an `else if (question.isNumericInput)` branch that renders the numeric `<input>` with placeholder, helper text, and `<FieldError>`.  
**Rationale**: Extending `QuestionDefinition` with an optional `isNumericInput?: boolean` flag allows the existing map loop to handle all three Benefits questions without breaking the first two. The approach is additive and won't affect rendered output for questions 1 and 2.  
**Alternatives considered**:

- Adding the field completely outside the `benefitsQuestions.map()` loop — simpler but would break sequential numbering (index-based `index + 1` labels).
- A separate dedicated render block below the loop — same numbering problem; also requires duplicating the label/error wrappers.

---

### 7. Validation rule

**Decision**: If `healthPremiumMonthly` is empty on submit → error `"Enter an amount"`. No upper bound validation.  
**Rationale**: The spec states no business upper cap. The lower bound is 0 (the browser enforces this via `min="0"`). Error message wording matches the form's existing style ("Select an option", "Enter a percentage.").

---

## Files That Need to Change

| File                                                          | Change Type | Reason                                                                                |
| ------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------- |
| `src/types/additionalQuestionsTypes.ts`                       | Edit        | Add `isNumericInput?: boolean` to `QuestionDefinition`                                |
| `src/types/finchAssessmentTypes.ts`                           | Edit        | Add `healthPremiumMonthly?: number` to `BenefitsPayload`                              |
| `src/utils/finchAssessmentPayload.ts`                         | Edit        | Wire new value into `benefits` payload object; accept new param in function signature |
| `src/pages/additionalQuestions/AdditionalQuestions.tsx`       | Edit        | Add state + validation + pass props to `BenefitsRetirementSection`                    |
| `src/pages/additionalQuestions/BenefitsRetirementSection.tsx` | Edit        | Add new question to array, extend props interface, add render branch                  |

## Files That Do NOT Need to Change

| File                                       | Reason                                                         |
| ------------------------------------------ | -------------------------------------------------------------- |
| `tests/pages/AdditionalQuestions.test.tsx` | Default export path unchanged; existing mocks continue to work |
| All other section components               | Unrelated                                                      |
| `src/components/common/FieldError.tsx`     | Already exists and is sufficient                               |

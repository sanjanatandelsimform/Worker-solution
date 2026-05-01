# Quickstart: Remove Payroll Provider from Finch Flow

**Branch**: `022-finch-remove-payroll`  
**Files changed**: 4 source files + 4 test files  
**No new dependencies. No new imports. No new components.**

## Overview

Remove the "Who is your company's payroll provider?" question from the Finch Additional Questions form, its associated state and validation in `AdditionalQuestions.tsx`, and its field in the Finch submission payload. The manual assessment flow (`assessmentSchemas.ts`, `CompensationTab.tsx`) is untouched.

---

## Step 1 — Type: `src/types/finchAssessmentTypes.ts`

Remove `payrollProvider: string | null` from `CompensationPayload`.

```diff
 export interface CompensationPayload {
   offersAnnualRaises: boolean;
   annualRaiseMonth?: string;
-  payrollProvider: string | null;
   shiftDifferentials: boolean;
   shortTermIncentives: string[];
   longTermIncentives: string[];
 }
```

---

## Step 2 — Payload builder: `src/utils/finchAssessmentPayload.ts`

a) Remove `payrollProvider: string` (4th parameter) from the function signature.  
b) Remove `payrollProvider: payrollProvider || null,` from the `compensation` object.

```diff
 export function buildFinchAssessmentPayload(
   answers: QuestionAnswer,
   goalsAnswers: GoalsAnswer,
   annualRaiseMonth: string,
-  payrollProvider: string,
   benefitsEnrollmentMonth: string,
   retirementPlanHasMatch: boolean = false,
   retirementMatchPercentage: string = "",
   healthPremiumMonthly: string = "",
 ): FinchAssessmentPayload {
```

```diff
   const compensation: CompensationPayload = {
     offersAnnualRaises,
     ...(offersAnnualRaises && annualRaiseMonth ? { annualRaiseMonth: capitalise(annualRaiseMonth) } : {}),
-    payrollProvider: payrollProvider || null,
     shiftDifferentials: answers["shift-differentials"] === "yes-shift-diff",
```

---

## Step 3 — Form page: `src/pages/additionalQuestions/AdditionalQuestions.tsx`

Remove the following:

1. State: `const [payrollProvider, setPayrollProvider] = useState<string>("");`
2. Validation block:
   ```typescript
   if (!payrollProvider) {
     newErrors["payroll-provider"] = "Select an option";
   }
   ```
3. The `payrollProvider` argument (4th arg) in the `buildFinchAssessmentPayload(...)` call.
4. Props on `<CompensationSection>`:
   - `payrollProvider={payrollProvider}`
   - `onPayrollProviderChange={setPayrollProvider}`

---

## Step 4 — Component: `src/pages/additionalQuestions/CompensationSection.tsx`

a) Remove the entire `payroll-provider` question entry from the `compensationQuestions` array (lines 22–45 in the current file).

b) Remove from `CompensationSectionProps` interface:

- `payrollProvider: string;`
- `onPayrollProviderChange: (provider: string) => void;`

c) Remove from the destructured function parameters:

- `payrollProvider,`
- `onPayrollProviderChange,`

d) Remove the entire `if (question.isDropdown) { ... }` rendering branch — no remaining question has `isDropdown: true`.

e) Imports `Label`, `Select`, `SelectItem`, and `FieldError` remain — they are still used by the `annualRaiseMonth` conditional. No import changes needed.

---

## Step 5 — Test files (4 files)

### `tests/utils/finchAssessmentPayload.test.ts`

- Remove `payrollProvider` argument from every `buildFinchAssessmentPayload(...)` call.
- Remove `payrollProvider: "ADP"` (or any value) from expected `compensation` assertions.

### `tests/hooks/useSubmitFinchAssessment.test.ts`

- Remove `payrollProvider: null` from any `FinchAssessmentPayload` / `CompensationPayload` fixture.

### `tests/pages/AdditionalQuestionsHealthPremium.test.tsx`

- Remove `_payrollProvider` destructuring.
- Remove any related payroll provider assertion or call argument.

### `tests/services/finchAssessmentApi.test.ts`

- Remove `payrollProvider: null` from the test payload fixture.

---

## Verification

```bash
pnpm run type-check   # zero errors
pnpm test             # all tests pass
pnpm lint:fix         # no lint issues
```

Smoke test: `pnpm dev` → navigate to Additional Questions page → confirm Compensation section has no payroll provider dropdown.

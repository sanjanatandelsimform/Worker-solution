# Quickstart: API Integration for the Additional Questions Form

**Branch**: `008-additional-questions-api` | **Date**: 2026-04-13  
**Spec**: [spec.md](./spec.md) | **Data Model**: [data-model.md](./data-model.md) | **Contract**: [contracts/finch-assessment-post.md](./contracts/finch-assessment-post.md)

---

## What This Feature Does

Wires the "Next" button on `AdditionalQuestions.tsx` to `POST /api/v1/assessment/finch`. On success the user sees a `success` banner and is navigated to `/dashboard`. On failure an `error` banner is shown and the form stays intact. The `workforceGoalsRanking` field is static for this release.

---

## Files Changed / Created

| File                                                    | Action     | Purpose                                       |
| ------------------------------------------------------- | ---------- | --------------------------------------------- |
| `src/types/finchAssessmentTypes.ts`                     | **Create** | TypeScript payload and response types         |
| `src/utils/finchAssessmentPayload.ts`                   | **Create** | Pure payload-builder function                 |
| `src/hooks/useSubmitFinchAssessment.ts`                 | **Create** | `isSubmitting` / `error` / `success` hook     |
| `src/services/api/assessmentApi.ts`                     | **Edit**   | Add `submitFinchAssessment()`                 |
| `src/pages/additionalQuestions/AdditionalQuestions.tsx` | **Edit**   | Wire selects, update option IDs, connect hook |
| `tests/hooks/useSubmitFinchAssessment.test.ts`          | **Create** | TDD unit tests for the hook                   |
| `tests/services/finchAssessmentApi.test.ts`             | **Create** | Unit tests for `submitFinchAssessment`        |
| `tests/utils/finchAssessmentPayload.test.ts`            | **Create** | Unit tests for payload builder                |

---

## Step 1 — Create Types (`src/types/finchAssessmentTypes.ts`)

Create the file with the `FinchAssessmentPayload`, section sub-types, and `FinchAssessmentResponse`. See [data-model.md](./data-model.md) for the full type definitions.

```typescript
// Key export:
export interface FinchAssessmentPayload {
  workforce: WorkforcePayload;
  compensation: CompensationPayload;
  benefits: BenefitsPayload;
  goals: GoalsPayload;
}
```

---

## Step 2 — TDD: Write Payload Builder Tests First

Create `tests/utils/finchAssessmentPayload.test.ts` **before** writing the util. Test cases cover:

1. Full happy-path: all fields selected → verify all four sections of the output.
2. `offersAnnualRaises = false` → `annualRaiseMonth` is absent from the payload.
3. `offersAnnualRaises = true` + month set → `annualRaiseMonth` is capitalised month name.
4. Empty multi-select → field is `[]`.
5. No `payrollProvider` selected → `payrollProvider: null`.
6. No `benefitsEnrollmentMonth` → `benefitEnrollmentMonth: null`.
7. `goalsData` IDs equal API value strings; selected IDs are sent directly in `workforceGoals`.
8. `workforceGoalsRanking` is always the static array.

---

## Step 3 — Build Payload Utility (`src/utils/finchAssessmentPayload.ts`)

```typescript
import type { FinchAssessmentPayload } from "@/types/finchAssessmentTypes";
import type { QuestionAnswer, GoalsAnswer } from "@/pages/additionalQuestions/AdditionalQuestions";
// Note: goalsData is NOT imported here; goal IDs already equal API value strings.

const STATIC_GOALS_RANKING = ["Retain Talent", "Attract Talent", "Reduce Absenteeism"];

const capitalise = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const toBoolean = (yesId: string, value: string | string[] | undefined): boolean => value === yesId;

const brokerMap: Record<string, "Yes" | "No" | "Unsure"> = {
  "yes-broker": "Yes",
  "no-broker": "No",
  "unsure-broker": "Unsure",
};

export function buildFinchAssessmentPayload(
  answers: QuestionAnswer,
  goalsAnswers: GoalsAnswer,
  annualRaiseMonth: string,
  payrollProvider: string,
  benefitsEnrollmentMonth: string
): FinchAssessmentPayload {
  const offersAnnualRaises = toBoolean("yes-raises", answers["annual-raises"] as string);

  return {
    workforce: {
      communicationMethods: (answers["benefits-updates"] as string[]) ?? [],
      hasDesklessEmployees: toBoolean("yes-deskless", answers["deskless-employees"] as string),
      commuteMethods: (answers["commute-methods"] as string[]) ?? [],
      commuteTime: (answers["commute-duration"] as string) ?? "",
    },
    compensation: {
      offersAnnualRaises,
      ...(offersAnnualRaises && annualRaiseMonth
        ? { annualRaiseMonth: capitalise(annualRaiseMonth) }
        : {}),
      payrollProvider: payrollProvider || null,
      shiftDifferentials: toBoolean("yes-shift-diff", answers["shift-differentials"] as string),
      shortTermIncentives: (answers["short-term-incentives"] as string[]) ?? [],
      longTermIncentives: (answers["long-term-incentives"] as string[]) ?? [],
    },
    benefits: {
      workWithBenefitsBroker: brokerMap[answers["benefits-broker"] as string] ?? null,
      benefitEnrollmentMonth: benefitsEnrollmentMonth ? capitalise(benefitsEnrollmentMonth) : null,
      retirementVestingPeriod: (answers["retirement-vesting-period"] as string) ?? "",
      retirementAutoEnroll: toBoolean(
        "yes-autoenroll",
        answers["retirement-auto-enroll"] as string
      ),
      retirementHardshipWithdrawals: toBoolean(
        "yes-hardship",
        answers["retirement-hardship-withdrawals"] as string
      ),
    },
    goals: {
      workforceGoals: [...goalsAnswers.selectedGoals],
      workforceGoalsRanking: STATIC_GOALS_RANKING,
    },
  };
}
```

---

## Step 4 — TDD: Write Hook Tests

Create `tests/hooks/useSubmitFinchAssessment.test.ts` **before** creating the hook:

1. `submit()` with a valid payload → calls `submitFinchAssessment`, sets `success = true`.
2. API error response → sets `error` with message, `success` remains `false`.
3. While submitting → `isSubmitting === true`, button disabled.
4. `clearError()` → `error` becomes `null`.
5. Second call while `isSubmitting` → no-op (duplicate submission prevention).

---

## Step 5 — Create Hook (`src/hooks/useSubmitFinchAssessment.ts`)

```typescript
import { useState, useCallback } from "react";
import { submitFinchAssessment } from "@/services/api/assessmentApi";
import type { FinchAssessmentPayload } from "@/types/finchAssessmentTypes";

export interface UseSubmitFinchAssessmentReturn {
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  submit: (payload: FinchAssessmentPayload) => Promise<void>;
  clearError: () => void;
}

export function useSubmitFinchAssessment(): UseSubmitFinchAssessmentReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const clearError = useCallback(() => setError(null), []);

  const submit = useCallback(
    async (payload: FinchAssessmentPayload) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      const result = await submitFinchAssessment(payload);

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error ?? "Submission failed. Please try again.");
      }
      setIsSubmitting(false);
    },
    [isSubmitting]
  );

  return { isSubmitting, error, success, submit, clearError };
}
```

---

## Step 6 — TDD: Write Service Tests

Create `tests/services/finchAssessmentApi.test.ts`:

1. Successful POST → returns `{ success: true, data: ... }`.
2. 422 response → returns `{ success: false, error: "..." }`.
3. Network error → returns `{ success: false, error: "..." }`.
4. Auth token is included in the request header.

---

## Step 7 — Add Service Function (`src/services/api/assessmentApi.ts`)

Add to the bottom of the file:

```typescript
import type { FinchAssessmentPayload, FinchAssessmentResponse } from "@/types/finchAssessmentTypes";
import apiClient from "@/services/api/authApi";

export const submitFinchAssessment = async (
  payload: FinchAssessmentPayload
): Promise<ApiResponse<FinchAssessmentResponse>> => {
  try {
    const response = await apiClient.post<FinchAssessmentResponse>("/assessment/finch", payload);
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};
```

---

## Step 8 — Update `AdditionalQuestions.tsx`

### 8a. Update option IDs in static arrays

Update all 18 option IDs listed in [data-model.md](./data-model.md) — replace kebab-case IDs with API values and fix goal label capitalisation.

### 8b. Update conditional render check for annual raises

The current code checks `answers[question.id] === "yes-raises"`. After updating the option ID stays `"yes-raises"` (it's a boolean radio, not an API value) — no change needed here.

### 8c. Add three new state variables

```typescript
const [annualRaiseMonth, setAnnualRaiseMonth] = useState<string>("");
const [payrollProvider, setPayrollProvider] = useState<string>("");
const [benefitsEnrollmentMonth, setBenefitsEnrollmentMonth] = useState<string>("");
```

### 8d. Wire `Select` components

Add `onSelectionChange` to each `Select`:

```tsx
// Annual raise month dropdown
<Select
  items={monthOptions}
  selectedKey={annualRaiseMonth}
  onSelectionChange={key => setAnnualRaiseMonth(String(key))}
  ...
>

// Payroll provider dropdown
<Select
  items={question.options}
  selectedKey={payrollProvider}
  onSelectionChange={key => setPayrollProvider(String(key))}
  ...
>

// Benefits enrollment period dropdown
<Select
  items={question.options}
  selectedKey={benefitsEnrollmentMonth}
  onSelectionChange={key => setBenefitsEnrollmentMonth(String(key))}
  ...
>
```

### 8e. Import and use hook + payload builder

```typescript
import { useSubmitFinchAssessment } from "@/hooks/useSubmitFinchAssessment";
import { buildFinchAssessmentPayload } from "@/utils/finchAssessmentPayload";
import ErrorMessage from "@/components/common/ErrorMessage";
import { CheckCircle } from "@untitledui/icons"; // or whichever success icon is used in the codebase

const { isSubmitting, error, success, submit, clearError } = useSubmitFinchAssessment();
```

### 8f. Add `handleSubmit` with validation

```typescript
const handleSubmit = async () => {
  // Required field validation
  if (!answers["deskless-employees"]) {
    setValidationError("Please answer whether employees are deskless.");
    return;
  }
  if (!answers["annual-raises"]) {
    setValidationError("Please answer the annual raises question.");
    return;
  }
  if (answers["annual-raises"] === "yes-raises" && !annualRaiseMonth) {
    setValidationError("Please select the month for annual raises.");
    return;
  }
  if (
    !answers["retirement-vesting-period"] ||
    !answers["retirement-auto-enroll"] ||
    !answers["retirement-hardship-withdrawals"]
  ) {
    setValidationError("Please answer all retirement questions.");
    return;
  }
  setValidationError(null);

  const payload = buildFinchAssessmentPayload(
    answers,
    goalsAnswers,
    annualRaiseMonth,
    payrollProvider,
    benefitsEnrollmentMonth
  );
  await submit(payload);
};
```

### 8g. Navigate on success

```typescript
useEffect(() => {
  if (success) {
    const timer = setTimeout(() => navigate("/dashboard"), 1500);
    return () => clearTimeout(timer);
  }
}, [success, navigate]);
```

### 8h. Render error / success banners

At the top of the form content area (before the Workforce card) and near the "Next" button:

```tsx
{
  (error || validationError) && (
    <ErrorMessage
      errorType="danger"
      errorMessage={error ?? validationError}
      onClose={error ? clearError : () => setValidationError(null)}
    />
  );
}
{
  success && (
    <ErrorMessage
      errorType="success"
      errorMessage="Assessment submitted successfully!"
      onClose={() => {}}
    />
  );
}
```

### 8i. Disable "Next" button while submitting

```tsx
<Button
  color="primary"
  size="md"
  iconTrailing={<ChevronRight data-icon />}
  isDisabled={isSubmitting}
  onPress={handleSubmit}
  className="..."
>
  {isSubmitting ? "Submitting..." : "Next"}
</Button>
```

---

## Step 9 — Type Check and Lint

```bash
pnpm run type-check   # must pass with zero errors
pnpm lint:fix
pnpm format
```

---

## Step 10 — Smoke Test

```bash
pnpm dev
```

1. Navigate to the Additional Questions form.
2. Fill all required fields.
3. Click "Next" — network tab should show `POST /api/v1/assessment/finch` with correct payload.
4. Verify success banner appears, then navigation to `/dashboard`.
5. Test error: mock a 500 response → verify danger banner, form intact.
6. Test validation: select "Yes" for annual raises, leave month empty → click "Next" → verify validation error near button.

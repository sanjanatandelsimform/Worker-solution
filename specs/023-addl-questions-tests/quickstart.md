# Quickstart: Additional Questions Test Coverage Update

**Feature**: 023-addl-questions-tests  
**Branch**: `023-addl-questions-tests`  
**Date**: 2026-04-27

---

## Overview

This feature adds comprehensive test coverage to `AdditionalQuestions.tsx`. All changes are in `tests/pages/`. No production code is modified.

**Files to change:**

| File                                                    | Action                               |
| ------------------------------------------------------- | ------------------------------------ |
| `tests/pages/AdditionalQuestions.test.tsx`              | Update — add section component mocks |
| `tests/pages/AdditionalQuestionsHealthPremium.test.tsx` | Update — add section component mocks |
| `tests/pages/AdditionalQuestionsValidation.test.tsx`    | Create — new comprehensive test file |

---

## Step 1: Update `AdditionalQuestions.test.tsx` (Redirect Tests)

The existing redirect tests are logically correct. They just need four new `vi.mock(...)` calls for the section components so the component can import without errors.

**Add these mocks** after the existing `vi.mock` block (before the `import` of `AdditionalQuestions`):

```tsx
vi.mock("@/pages/additionalQuestions/WorkforceSection", () => ({
  default: () => null,
}));
vi.mock("@/pages/additionalQuestions/CompensationSection", () => ({
  default: () => null,
}));
vi.mock("@/pages/additionalQuestions/BenefitsRetirementSection", () => ({
  default: () => null,
}));
vi.mock("@/pages/additionalQuestions/GoalsSection", () => ({
  default: () => null,
}));
```

**No other changes needed** to this file.

---

## Step 2: Update `AdditionalQuestionsHealthPremium.test.tsx`

Add the same four section mocks. Additionally, since `BenefitsRetirementSection` renders the health premium Input, we need a special mock for it that still renders the numeric input (to keep the existing tests passing).

**Replace** the BenefitsRetirementSection mock with a thin stub that renders a real `<input>`:

```tsx
vi.mock("@/pages/additionalQuestions/WorkforceSection", () => ({
  default: () => null,
}));
vi.mock("@/pages/additionalQuestions/CompensationSection", () => ({
  default: () => null,
}));
vi.mock("@/pages/additionalQuestions/BenefitsRetirementSection", () => ({
  default: ({
    healthPremiumMonthly,
    onHealthPremiumMonthlyChange,
    onClearFieldError,
    fieldErrors,
  }: {
    healthPremiumMonthly: string;
    onHealthPremiumMonthlyChange: (v: string) => void;
    onClearFieldError: (key: string) => void;
    fieldErrors: Record<string, string>;
  }) => (
    <div>
      <label>
        What is the employee-only monthly premium for the lowest-cost health plan your company
        offers? <span aria-label="required">*</span>
      </label>
      <input
        type="number"
        placeholder="Enter amount"
        value={healthPremiumMonthly}
        onChange={e => {
          onHealthPremiumMonthlyChange(e.target.value);
          onClearFieldError("health-plan-monthly-premium");
        }}
      />
      <span>i.e. $300</span>
      {fieldErrors["health-plan-monthly-premium"] && (
        <span>{fieldErrors["health-plan-monthly-premium"]}</span>
      )}
    </div>
  ),
}));
vi.mock("@/pages/additionalQuestions/GoalsSection", () => ({
  default: () => null,
}));
```

**Remove** the individual UI primitive mocks that are no longer needed (Select, SelectItem, RadioButton, RadioGroup, Label, Checkbox, InputInfo, RankingList, Tooltip, TooltipTrigger) because sections are now mocked at the section level.

**Keep** the existing `vi.mock("@/components/common/ErrorMessage", ...)` mock.  
**Keep** the existing `vi.mock("@/utils/finchAssessmentPayload", ...)` mock.  
**Keep** all three hook mocks and the Button mock.

---

## Step 3: Create `AdditionalQuestionsValidation.test.tsx`

This is the main new file. Use the following structure:

### File skeleton

```tsx
/**
 * Tests for AdditionalQuestions page – validation, submission, and state interactions.
 *
 * Covers:
 *   US2 – Full form validation (all required fields, conditional checks)
 *   US3 – Field interaction and inline error clearing
 *   US4 – Submission payload construction
 *   US5 – Error and success message display
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useSubmitFinchAssessment } from "@/hooks/useSubmitFinchAssessment";
import { buildFinchAssessmentPayload } from "@/utils/finchAssessmentPayload";

// ── Mocks ──────────────────────────────────────────────────────────────────
// [hook mocks, button mock, ErrorMessage mock, buildFinchAssessmentPayload mock]
// [Section component mocks — test-friendly stubs that expose trigger buttons and forward fieldErrors]
// [Dynamic import of AdditionalQuestions after all mocks]

// ── Test Suite 1: Validation with empty form ───────────────────────────────
describe("AdditionalQuestions – Validation (empty form)", () => { ... });

// ── Test Suite 2: Conditional validation ──────────────────────────────────
describe("AdditionalQuestions – Conditional validation", () => { ... });

// ── Test Suite 3: Error clearing ──────────────────────────────────────────
describe("AdditionalQuestions – Inline error clearing", () => { ... });

// ── Test Suite 4: Submission payload ──────────────────────────────────────
describe("AdditionalQuestions – Submission payload", () => { ... });

// ── Test Suite 5: Error and success display ───────────────────────────────
describe("AdditionalQuestions – Error and success display", () => { ... });
```

### Section mock pattern (use for all four sections)

Each section mock must:

1. Accept the correct typed props (see data-model.md for interfaces)
2. Render `fieldErrors` as queryable `data-testid` spans
3. Expose `data-testid` buttons to drive state

```tsx
vi.mock("@/pages/additionalQuestions/WorkforceSection", () => ({
  default: ({
    fieldErrors,
    onAnswerChange,
    onMultiSelectToggle,
  }: {
    answers: Record<string, string | string[]>;
    fieldErrors: Record<string, string>;
    onAnswerChange: (id: string, v: string) => void;
    onMultiSelectToggle: (id: string, optId: string) => void;
  }) => (
    <div data-testid="workforce-section">
      {/* Field errors */}
      {Object.entries(fieldErrors).map(([k, v]) =>
        v ? (
          <span key={k} data-testid={`field-error-${k}`}>
            {v}
          </span>
        ) : null
      )}
      {/* Trigger buttons */}
      <button
        data-testid="trigger-benefits-updates-work_email"
        onClick={() => onMultiSelectToggle("benefits-updates", "work_email")}
      >
        set benefits-updates
      </button>
      <button
        data-testid="trigger-deskless-employees-yes-deskless"
        onClick={() => onAnswerChange("deskless-employees", "yes-deskless")}
      >
        set deskless
      </button>
    </div>
  ),
}));
```

Apply same pattern for CompensationSection, BenefitsRetirementSection, GoalsSection — expose triggers for every required field and forward all fieldErrors.

### `fillAllRequiredFields()` helper

```ts
const fillAllRequiredFields = () => {
  fireEvent.click(screen.getByTestId("trigger-benefits-updates-work_email"));
  fireEvent.click(screen.getByTestId("trigger-deskless-employees-yes-deskless"));
  fireEvent.click(screen.getByTestId("trigger-annual-raises-no-raises"));
  fireEvent.click(screen.getByTestId("trigger-payroll-provider-ADP"));
  fireEvent.click(screen.getByTestId("trigger-benefits-broker-yes-broker"));
  fireEvent.click(screen.getByTestId("trigger-benefits-enrollment-month-january"));
  fireEvent.click(screen.getByTestId("trigger-health-premium-monthly-300"));
  fireEvent.click(screen.getByTestId("trigger-retirement-vesting-period-6mo_or_less"));
  fireEvent.click(screen.getByTestId("trigger-retirement-employer-match-no-match"));
  fireEvent.click(screen.getByTestId("trigger-retirement-auto-enroll-yes-autoenroll"));
  fireEvent.click(screen.getByTestId("trigger-retirement-hardship-withdrawals-yes-hardship"));
  // Goals: toggle 3 goal IDs
  fireEvent.click(screen.getByTestId("trigger-goal-goal1"));
  fireEvent.click(screen.getByTestId("trigger-goal-goal2"));
  fireEvent.click(screen.getByTestId("trigger-goal-goal3"));
};
```

Note: Goals require the `goalsData` mock to expose at least 3 goal IDs. Mock `@/data/goalsData` with:

```ts
vi.mock("@/data/goalsData", () => ({
  goalsData: [
    {
      category: "Test",
      goals: [
        { id: "goal1", label: "Goal 1" },
        { id: "goal2", label: "Goal 2" },
        { id: "goal3", label: "Goal 3" },
      ],
    },
  ],
}));
```

And the GoalsSection mock exposes trigger buttons per goal:

```tsx
<button data-testid={`trigger-goal-${goal.id}`} onClick={() => onGoalToggle(goal.id)}>
  toggle {goal.id}
</button>
```

---

## Step 4: Key Test Examples

### US2 – Empty form validation

```tsx
it("shows all required field errors when Next is clicked with empty form", async () => {
  renderPage();
  fireEvent.click(screen.getByRole("button", { name: /next/i }));
  await waitFor(() => {
    expect(
      screen.getByText("Please select at least 3 workforce goals to rank them.")
    ).toBeInTheDocument();
    expect(screen.getAllByText("Select an option").length).toBeGreaterThanOrEqual(8);
    expect(screen.getByText("Enter an amount")).toBeInTheDocument();
  });
});
```

### US2 – Conditional: raise month required when "yes-raises"

```tsx
it("requires raise month when annual-raises is yes-raises", async () => {
  renderPage();
  fireEvent.click(screen.getByTestId("trigger-annual-raises-yes-raises"));
  fireEvent.click(screen.getByRole("button", { name: /next/i }));
  await waitFor(() => {
    expect(screen.getByTestId("field-error-annualRaiseMonth")).toHaveTextContent(
      "Please select a month."
    );
  });
});
```

### US2 – Conditional: match % over 100

```tsx
it("shows percentage error when match % exceeds 100", async () => {
  renderPage();
  fireEvent.click(screen.getByTestId("trigger-retirement-employer-match-yes-match"));
  fireEvent.click(screen.getByTestId("trigger-retirement-match-percentage-101"));
  fireEvent.click(screen.getByRole("button", { name: /next/i }));
  await waitFor(() => {
    expect(screen.getByTestId("field-error-retirementMatchPercentage")).toHaveTextContent(
      "Percentage must be 100 or less."
    );
  });
});
```

### US3 – Error clears on field change

```tsx
it("clears selectedGoals error when a goal is toggled after validation", async () => {
  renderPage();
  fireEvent.click(screen.getByRole("button", { name: /next/i }));
  await waitFor(() => {
    expect(
      screen.getByText("Please select at least 3 workforce goals to rank them.")
    ).toBeInTheDocument();
  });
  fireEvent.click(screen.getByTestId("trigger-goal-goal1"));
  await waitFor(() => {
    expect(
      screen.queryByText("Please select at least 3 workforce goals to rank them.")
    ).not.toBeInTheDocument();
  });
});
```

### US4 – Payload construction

```tsx
it("calls buildFinchAssessmentPayload with correct args on valid submit", async () => {
  const mockBuild = vi.mocked(buildFinchAssessmentPayload);
  mockBuild.mockReturnValue({ workforce: {}, compensation: {}, benefits: {}, goals: {} } as never);
  renderPage();
  fillAllRequiredFields();
  fireEvent.click(screen.getByRole("button", { name: /next/i }));
  await waitFor(() => {
    expect(mockBuild).toHaveBeenCalledWith(
      expect.any(Object), // answers
      expect.any(Object), // goalsAnswers
      "", // annualRaiseMonth (no-raises path)
      "ADP", // payrollProvider
      "january", // benefitsEnrollmentMonth
      false, // retirementPlanHasMatch (no-match)
      "", // retirementMatchPercentage
      "300" // healthPremiumMonthly
    );
  });
});
```

### US5 – Error display

```tsx
it("renders API error message from hook", () => {
  mockUseSubmitFinchAssessment.mockReturnValue({
    isSubmitting: false,
    error: "Something went wrong",
    success: false,
    submit: vi.fn(),
    clearError: vi.fn(),
  });
  renderPage();
  expect(screen.getByTestId("error-message")).toHaveTextContent("Something went wrong");
});
```

---

## Step 5: Run and Validate

```bash
pnpm test -- --reporter=verbose 2>&1
pnpm run type-check
```

Expected outcome:

- 0 failing tests
- Coverage for `src/pages/additionalQuestions/AdditionalQuestions.tsx` ≥ 90% statements

---

## Gotchas

1. **Dynamic import order**: Keep all `vi.mock(...)` calls before the dynamic `await import(...)` of `AdditionalQuestions`. Vitest hoists `vi.mock` calls but the dynamic import must happen after the mocks are set up.
2. **`@untitledui/icons` is globally mocked** in `tests/setup.ts` — do not add a local mock for it in the new test file.
3. **`buildFinchAssessmentPayload` mock return value**: Mock it to return a valid `FinchAssessmentPayload` shape; the `submit` mock receives this value. If the return is `undefined`, `submit` is called with `undefined` and the payload assertion will fail.
4. **`retirementMatchPercentage` reset**: `handleAnswerChange("retirement-employer-match", "no-match")` calls `setRetirementMatchPercentage("")` internally. This is a React state update — assert on subsequent behaviour, not on the state value directly.
5. **`data-field-error` scroll**: `handleSubmit` calls `document.querySelector("[data-field-error]")?.scrollIntoView(...)`. In jsdom this is a no-op (scrollIntoView is not implemented). Add to setup or spy if needed, but it won't throw.
6. **GoalsSection mock and goalsData**: The GoalsSection mock reads from `goalsData` to render goal trigger buttons. Mock `@/data/goalsData` with at least 3 goals so the trigger buttons exist.

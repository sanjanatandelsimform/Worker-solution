# Research: Additional Questions Test Coverage Update

**Phase**: 0 — Outline & Research  
**Date**: 2026-04-27  
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## Decision 1: Mock Strategy for Section Components

**Question**: Should `AdditionalQuestions.test.tsx` mock the four section components at the section level or mock individual UI primitives and render sections in full?

**Decision**: Two-tier strategy:

- **Redirect/guard tests** (`AdditionalQuestions.test.tsx`): Mock all four section components to `null` stubs — these tests only care about navigation side-effects, not rendered content.
- **Validation/submission tests** (`AdditionalQuestionsValidation.test.tsx`): Mock sections with **thin, test-friendly stubs** that (a) forward `fieldErrors` as `data-testid` spans so error text is queryable, and (b) expose `data-testid` buttons/inputs that call the prop handlers so state can be driven in tests.

**Rationale**: Mocking at the section level for page-level tests is the correct unit boundary — `AdditionalQuestions.tsx` is responsible for orchestration (state, validation, navigation), not for rendering form fields. Section components already have their own test surface. Rendering sections unmocked would pull in `react-aria-components` rendering details and make tests brittle to section refactors.

**Alternatives considered**:

- _Render sections with individual primitive mocks (current approach in HealthPremium test)_: Works for the health premium input because Input renders a real `<input>` element. But for RadioButton/Select (mocked to null), you cannot drive state changes. Unusable for full-submission tests. Kept for `AdditionalQuestionsHealthPremium.test.tsx` since it was already working there.
- _Use `userEvent` with real components_: Would require un-mocking RadioButton and Select, which trigger complex react-aria internals that are unreliable in jsdom.

---

## Decision 2: How to Drive State Changes in Validation Tests

**Question**: Since RadioButton and Select are mocked to null (or to stubs), how do validation tests set form state to test conditional validation and full submission?

**Decision**: Section component mocks expose `data-testid="trigger-{questionId}-{value}"` buttons. Clicking these buttons calls the `onAnswerChange(questionId, value)` handler passed as a prop. For string-state fields (annualRaiseMonth, payrollProvider, etc.), mocks call `onAnnualRaiseMonthChange` / `onPayrollProviderChange` etc. via buttons.

**Rationale**: This simulates user interactions at the correct abstraction level — the parent component doesn't care how the field renders, only that its handler was called with valid args. Test-friend stubs are a standard RTL pattern for complex components.

**Alternatives considered**:

- _Direct state mutation via enzyme/test-utils_: Not available — RTL philosophy; no enzyme in this project.
- _Integration tests with real sections_: Possible as separate tests but overkill for unit isolation of orchestration logic.

---

## Decision 3: Test File Organization

**Question**: Update existing files in-place, or create a new comprehensive test file?

**Decision**:

1. Update `AdditionalQuestions.test.tsx` in-place (small changes — add `WorkforceSection`, `CompensationSection`, `BenefitsRetirementSection`, `GoalsSection` mocks).
2. Update `AdditionalQuestionsHealthPremium.test.tsx` in-place (add section-level mocks to prevent section component import errors).
3. Create **new** `AdditionalQuestionsValidation.test.tsx` for all validation, submission, error/success, and state interaction tests.

**Rationale**: Splitting avoids mega-files; keeps existing test descriptions intact for git blame / traceability to their originating specs; new test file clearly signals its scope. The `HealthPremium` test file is preserved as-is to maintain traceability to spec 001-add-health-premium-question.

**Alternatives considered**:

- _Single mega-file_: Would exceed 500 lines; hard to navigate; violates single-responsibility for test files.
- _Delete and rewrite both existing files_: Would lose git history and break traceability to earlier specs.

---

## Decision 4: How to Assert on Field Errors

**Question**: `FieldError` renders a `<span>` with the error message. If sections are mocked, how do tests see these spans?

**Decision**: Section mocks render `fieldErrors` as `data-testid="field-error-{key}"` spans directly in their stub output:

```tsx
vi.mock("@/pages/additionalQuestions/WorkforceSection", () => ({
  default: ({ fieldErrors }: { fieldErrors: Record<string, string> }) => (
    <div data-testid="workforce-section">
      {Object.entries(fieldErrors).map(([k, v]) =>
        v ? (
          <span key={k} data-testid={`field-error-${k}`}>
            {v}
          </span>
        ) : null
      )}
      {/* trigger buttons for onAnswerChange */}
    </div>
  ),
}));
```

This lets tests use `screen.getByText("Select an option")` or `screen.getByTestId("field-error-deskless-employees")` to assert errors.

**Rationale**: The actual `FieldError` component renders a `<span className="text-sm text-ws-error-600">{message}</span>`. The text content is what the user sees; the test mirrors that. Using `data-testid` for precision avoids false positives from duplicate error messages across fields.

---

## Decision 5: Testing `handleSubmit` — Full Valid Submission

**Question**: How do we construct a fully valid form state to test successful submission?

**Decision**: Section mocks include trigger buttons for every required field. The test utility function `fillAllRequiredFields()` clicks each trigger in sequence. After filling, clicking "Next" should pass validation and call `submit(payload)`.

Required field triggers needed:

- `data-testid="trigger-benefits-updates-work_email"` → calls `onMultiSelectToggle("benefits-updates", "work_email")`
- `data-testid="trigger-deskless-employees-yes-deskless"` → calls `onAnswerChange("deskless-employees", "yes-deskless")`
- `data-testid="trigger-annual-raises-no-raises"` → calls `onAnswerChange("annual-raises", "no-raises")`
- `data-testid="trigger-payroll-provider-ADP"` → calls `onPayrollProviderChange("ADP")`
- `data-testid="trigger-benefits-broker-yes-broker"` → calls `onAnswerChange("benefits-broker", "yes-broker")`
- `data-testid="trigger-benefits-enrollment-month-january"` → calls `onBenefitsEnrollmentMonthChange("january")`
- `data-testid="trigger-health-premium-monthly-300"` → calls `onHealthPremiumMonthlyChange("300")`
- `data-testid="trigger-retirement-vesting-period-6mo_or_less"` → calls `onAnswerChange("retirement-vesting-period", "6mo_or_less")`
- `data-testid="trigger-retirement-employer-match-no-match"` → calls `onAnswerChange("retirement-employer-match", "no-match")`
- `data-testid="trigger-retirement-auto-enroll-yes-autoenroll"` → calls `onAnswerChange("retirement-auto-enroll", "yes-autoenroll")`
- `data-testid="trigger-retirement-hardship-withdrawals-yes-hardship"` → calls `onAnswerChange("retirement-hardship-withdrawals", "yes-hardship")`
- Goals: 3 goal toggles via `onGoalToggle` buttons in the GoalsSection mock

**Rationale**: This is the standard RTL pattern — find a button, click it, assert outcome. The complexity is in the mock, not in the test.

---

## Decision 6: `success` Navigation Test

**Question**: The `success` navigation is driven by a `useEffect`. How do we test it?

**Decision**: Mock `useSubmitFinchAssessment` to return `{ success: true, ... }` from the start (not from a click). The `useEffect` watching `success` will fire on mount and call `navigate("/dashboard")`. Assert with `waitFor`.

**Rationale**: This is exactly how the existing redirect tests work for `isFinchCompleted`. Same pattern applies.

---

## Decision 7: `retirementMatchPercentage` Reset on "no-match"

**Question**: When the user changes `retirement-employer-match` to "no-match", `handleAnswerChange` resets `retirementMatchPercentage` to `""`. How is this tested?

**Decision**: Call `onAnswerChange("retirement-employer-match", "no-match")` via the CompensationSection mock trigger. Then verify via the next validation click that no percentage error appears even without the percentage field being set. More precisely, verify that after switching to "no-match" → "yes-match" (without entering %), clicking Next shows the percentage error again, confirming the reset worked (no leftover stale value).

**Rationale**: The reset is a state side-effect of `handleAnswerChange`. The only way to observe it is through subsequent validation behaviour.

---

## Resolved Unknowns Summary

| Unknown                    | Resolution                                                                    |
| -------------------------- | ----------------------------------------------------------------------------- |
| Mock strategy for sections | Two-tier: null stubs for redirect tests, thin test stubs for validation tests |
| How to drive state         | Section mock trigger buttons calling prop handlers                            |
| Test file organization     | 2 existing updated in-place + 1 new file                                      |
| FieldError assertion       | Section mocks forward fieldErrors as testid spans                             |
| Full submission test       | `fillAllRequiredFields()` helper clicks all triggers                          |
| Success navigation         | Mock `success: true` from hook; `useEffect` fires; assert navigate            |
| Match % reset              | Verified via validation behaviour after toggle                                |

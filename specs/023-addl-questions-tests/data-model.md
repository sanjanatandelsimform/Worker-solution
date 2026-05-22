# Data Model: Additional Questions Test Coverage

**Phase**: 1 — Design  
**Date**: 2026-04-27  
**Feature**: 023-addl-questions-tests

---

## Component State Shape (source of truth for test mocks)

The `AdditionalQuestions` component manages the following state. Test mocks and assertions must align with these exact shapes.

### `answers: QuestionAnswer`

```ts
// QuestionAnswer = { [questionId: string]: string | string[] }

// Required field question IDs and their valid answer option IDs:
{
  "benefits-updates": string[]       // multi-select; at least 1 required; options: work_email, personal_email, office_signs
  "deskless-employees": string       // required; options: yes-deskless, no-deskless
  "annual-raises": string            // required; options: yes-raises, no-raises
  "benefits-broker": string          // required; options: yes-broker, no-broker, unsure-broker
  "retirement-vesting-period": string // required; options: 6mo_or_less, 6mo_1yr, 1yr_2yr, 2yr_4yr, 4yr_plus
  "retirement-employer-match": string // required; options: yes-match, no-match
  "retirement-auto-enroll": string   // required; options: yes-autoenroll, no-autoenroll
  "retirement-hardship-withdrawals": string // required; options: yes-hardship, no-hardship

  // Optional:
  "commute-methods": string[]
  "commute-duration": string
  "shift-differentials": string
  "short-term-incentives": string[]
  "long-term-incentives": string[]
}
```

### `goalsAnswers: GoalsAnswer`

```ts
// GoalsAnswer = { selectedGoals: string[]; topThreeGoals: string[] }
// Validation: selectedGoals.length must be >= 3
{
  selectedGoals: string[]   // goal IDs toggled by the user
  topThreeGoals: string[]   // ordered top 3 subset (from RankingList)
}
```

### String state fields (managed separately)

| Field                     | State variable                      | Prop passed to            | Validation                                                                          |
| ------------------------- | ----------------------------------- | ------------------------- | ----------------------------------------------------------------------------------- |
| Payroll provider          | `payrollProvider: string`           | CompensationSection       | Required (non-empty)                                                                |
| Annual raise month        | `annualRaiseMonth: string`          | CompensationSection       | Required only when `answers["annual-raises"] === "yes-raises"`                      |
| Benefits enrollment month | `benefitsEnrollmentMonth: string`   | BenefitsRetirementSection | Required (non-empty)                                                                |
| Health premium monthly    | `healthPremiumMonthly: string`      | BenefitsRetirementSection | Required (non-empty); numeric string                                                |
| Retirement match %        | `retirementMatchPercentage: string` | BenefitsRetirementSection | Required when `answers["retirement-employer-match"] === "yes-match"`; must be ≤ 100 |

---

## Validation Matrix (handleSubmit)

All 13 validation branches in `handleSubmit`. Tests must cover each row.

| #   | Condition that triggers error                                                             | Error key                         | Error message                                            |
| --- | ----------------------------------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------- |
| 1   | `goalsAnswers.selectedGoals.length < 3`                                                   | `selectedGoals`                   | "Please select at least 3 workforce goals to rank them." |
| 2   | `benefits-updates` empty or missing                                                       | `benefits-updates`                | "Select an option"                                       |
| 3   | `deskless-employees` missing                                                              | `deskless-employees`              | "Select an option"                                       |
| 4   | `annual-raises` missing                                                                   | `annual-raises`                   | "Select an option"                                       |
| 5   | `payrollProvider` empty                                                                   | `payroll-provider`                | "Select an option"                                       |
| 6   | `annual-raises === "yes-raises"` AND `annualRaiseMonth` empty                             | `annualRaiseMonth`                | "Please select a month."                                 |
| 7   | `benefits-broker` missing                                                                 | `benefits-broker`                 | "Select an option"                                       |
| 8   | `benefitsEnrollmentMonth` empty                                                           | `benefits-enrollment-period`      | "Select an option"                                       |
| 9   | `healthPremiumMonthly` empty                                                              | `health-plan-monthly-premium`     | "Enter an amount"                                        |
| 10  | `retirement-vesting-period` missing                                                       | `retirement-vesting-period`       | "Select an option"                                       |
| 11  | `retirement-employer-match` missing                                                       | `retirement-employer-match`       | "Select an option"                                       |
| 12  | `retirement-employer-match === "yes-match"` AND `retirementMatchPercentage` empty         | `retirementMatchPercentage`       | "Please enter a percentage."                             |
| 13  | `retirement-employer-match === "yes-match"` AND `Number(retirementMatchPercentage) > 100` | `retirementMatchPercentage`       | "Percentage must be 100 or less."                        |
| 14  | `retirement-auto-enroll` missing                                                          | `retirement-auto-enroll`          | "Select an option"                                       |
| 15  | `retirement-hardship-withdrawals` missing                                                 | `retirement-hardship-withdrawals` | "Select an option"                                       |

---

## State Transitions

### `handleAnswerChange(questionId, value)`

1. Sets `answers[questionId] = value`
2. Side-effect A: If `questionId === "retirement-employer-match"` AND `value === "no-match"` → sets `retirementMatchPercentage = ""`
3. Side-effect B: If `fieldErrors[questionId]` exists → clears it

### `handleMultiSelectToggle(questionId, optionId)`

1. Toggles `optionId` in `answers[questionId]` array (add if absent, remove if present)
2. If `fieldErrors[questionId]` exists → clears it

### `handleGoalToggle(goalId)`

1. Toggles `goalId` in `goalsAnswers.selectedGoals`
2. If `fieldErrors["selectedGoals"]` exists → clears it

### String state setters

- `setAnnualRaiseMonth`, `setPayrollProvider`, `setBenefitsEnrollmentMonth`, `setRetirementMatchPercentage`, `setHealthPremiumMonthly` — direct set, no side-effects

### Field error clearers (via `handleClearFieldError(key)`)

- Called from CompensationSection and BenefitsRetirementSection after dropdown/input change
- Clears `fieldErrors[key]`

---

## Hook Mock Shapes (required by tests)

### `useAssessmentStatus` mock shape

```ts
{
  isFinchCompleted: boolean,
  completionCount: number,
  isLoading: boolean,
  error: null | string,
  assessmentData: null,
  sectionCompletion: { workforce: boolean, compensation: boolean, benefits: boolean, goals: boolean },
  refetch: vi.fn(),
}
```

### `useFinchStatus` mock shape

```ts
{
  isConnected: boolean,
  isLoading: boolean,
  connectionStatus: string | null,
  syncJobStatus: null,
  error: null,
}
```

### `useSubmitFinchAssessment` mock shape

```ts
{
  isSubmitting: boolean,
  error: null | string,
  success: boolean,
  submit: vi.fn(),
  clearError: vi.fn(),
}
```

---

## `buildFinchAssessmentPayload` Argument Order

```ts
buildFinchAssessmentPayload(
  answers,                    // QuestionAnswer
  goalsAnswers,               // GoalsAnswer
  annualRaiseMonth,           // string
  payrollProvider,            // string
  benefitsEnrollmentMonth,    // string
  retirementPlanHasMatch,     // boolean (derived: answers["retirement-employer-match"] === "yes-match")
  retirementMatchPercentage,  // string
  healthPremiumMonthly        // string (8th / last arg)
): FinchAssessmentPayload
```

**Key mappings inside the utility** (for payload shape assertions):

- `healthPremiumMonthly` → `benefits.lowestHealthPlanPremium = Number(healthPremiumMonthly)` (when non-empty)
- `retirementMatchPercentage` → `benefits.retirementMatchPercentage = Number(retirementMatchPercentage)` (when `retirementPlanHasMatch === true`)
- `retirementPlanHasMatch` → `benefits.retirementPlanHasMatch`
- `payrollProvider` → `compensation.payrollProvider`

---

## Section Component Prop Interfaces (for mock type safety)

### WorkforceSection

```ts
interface WorkforceSectionProps {
  answers: QuestionAnswer;
  fieldErrors: Record<string, string>;
  onAnswerChange: (questionId: string, value: string) => void;
  onMultiSelectToggle: (questionId: string, optionId: string) => void;
}
```

### CompensationSection

```ts
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

### BenefitsRetirementSection

```ts
interface BenefitsRetirementSectionProps {
  answers: QuestionAnswer;
  fieldErrors: Record<string, string>;
  benefitsEnrollmentMonth: string;
  retirementMatchPercentage: string;
  healthPremiumMonthly: string;
  onAnswerChange: (questionId: string, value: string) => void;
  onBenefitsEnrollmentMonthChange: (month: string) => void;
  onRetirementMatchPercentageChange: (value: string) => void;
  onHealthPremiumMonthlyChange: (value: string) => void;
  onClearFieldError: (key: string) => void;
}
```

### GoalsSection

```ts
interface GoalsSectionProps {
  goalsAnswers: GoalsAnswer;
  fieldErrors: Record<string, string>;
  onGoalToggle: (goalId: string) => void;
  onTopThreeGoalsChange: (topThreeGoals: string[]) => void;
}
```

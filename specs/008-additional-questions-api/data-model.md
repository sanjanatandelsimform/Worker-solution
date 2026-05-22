# Data Model: API Integration for the Additional Questions Form

**Branch**: `008-additional-questions-api` | **Date**: 2026-04-13

---

## TypeScript Type Definitions

### Location: `src/types/finchAssessmentTypes.ts` (new file)

```typescript
// ── Payload sections ───────────────────────────────────────────────────────

export interface WorkforcePayload {
  communicationMethods: string[]; // API values: "work_email" | "personal_email" | "office_signs"
  hasDesklessEmployees: boolean;
  commuteMethods: string[]; // API values: "car" | "train" | "bus" | "bike" | "walking" | "group_transportation"
  commuteTime: string; // API values: "<15min" | "15-30min" | "30-1hr" | "1hr+"
}

export interface CompensationPayload {
  offersAnnualRaises: boolean;
  annualRaiseMonth?: string; // Full month name, present only when offersAnnualRaises === true
  payrollProvider: string | null; // Provider label e.g. "ADP"; null when not selected
  shiftDifferentials: boolean;
  shortTermIncentives: string[]; // API values: "cash_bonuses" | "profit_sharing" | "commissions"
  longTermIncentives: string[]; // API values: "stock_options" | "rsus" | "espps" | "deferred_compensation" | "pension_plans"
}

export interface BenefitsPayload {
  workWithBenefitsBroker: "Yes" | "No" | "Unsure" | null;
  benefitEnrollmentMonth: string | null; // Full month name e.g. "November"; null when not selected
  retirementVestingPeriod: string; // API values: "<6m" | "6m_1yr" | "1yr_2yr" | "2yr_4yr" | ">4yr"
  retirementAutoEnroll: boolean;
  retirementHardshipWithdrawals: boolean;
}

export interface GoalsPayload {
  workforceGoals: string[]; // API value strings sent directly e.g. ["Attract Talent", "Reduce 401k Withdrawals"]
  workforceGoalsRanking: string[]; // Static: ["Retain Talent", "Attract Talent", "Reduce Absenteeism"]
}

// ── Top-level payload ──────────────────────────────────────────────────────

export interface FinchAssessmentPayload {
  workforce: WorkforcePayload;
  compensation: CompensationPayload;
  benefits: BenefitsPayload;
  goals: GoalsPayload;
}

// ── API response ───────────────────────────────────────────────────────────

export interface FinchAssessmentResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}
```

---

## Form State Shape

The `AdditionalQuestions` component manages four independent state variables:

```typescript
// Existing
const [answers, setAnswers] = useState<QuestionAnswer>({});
// QuestionAnswer = { [questionId: string]: string | string[] }
// Captures all radio (string) and multi-select (string[]) answers.

const [goalsAnswers, setGoalsAnswers] = useState<GoalsAnswer>({
  selectedGoals: [], // IDs of selected goal checkboxes
  topThreeGoals: [], // Unused in this release
});

// New — separate state for uncontrolled-to-controlled dropdown migration
const [annualRaiseMonth, setAnnualRaiseMonth] = useState<string>("");
const [payrollProvider, setPayrollProvider] = useState<string>("");
const [benefitsEnrollmentMonth, setBenefitsEnrollmentMonth] = useState<string>("");
```

---

## Payload Builder Function

### Location: `src/utils/finchAssessmentPayload.ts` (new file)

**Signature**:

```typescript
export function buildFinchAssessmentPayload(
  answers: QuestionAnswer,
  goalsAnswers: GoalsAnswer,
  annualRaiseMonth: string,
  payrollProvider: string,
  benefitsEnrollmentMonth: string
): FinchAssessmentPayload;
```

**Transformation rules**:

| Source                                       | Transformation                                                                                | Target field                             |
| -------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `answers["benefits-updates"]`                | Cast to `string[]`, send as-is (IDs = API values)                                             | `workforce.communicationMethods`         |
| `answers["deskless-employees"]`              | `=== "yes-deskless"` → `true`, else `false`                                                   | `workforce.hasDesklessEmployees`         |
| `answers["commute-methods"]`                 | Cast to `string[]`, send as-is                                                                | `workforce.commuteMethods`               |
| `answers["commute-duration"]`                | Cast to `string`, send as-is (ID = API value)                                                 | `workforce.commuteTime`                  |
| `answers["annual-raises"]`                   | `=== "yes-raises"` → `true`, else `false`                                                     | `compensation.offersAnnualRaises`        |
| `annualRaiseMonth`                           | Capitalise first letter only (e.g., `"january"` → `"January"`), omit if falsy                 | `compensation.annualRaiseMonth`          |
| `payrollProvider`                            | Send as-is, `null` if empty                                                                   | `compensation.payrollProvider`           |
| `answers["shift-differentials"]`             | `=== "yes-shift-diff"` → `true`, else `false`                                                 | `compensation.shiftDifferentials`        |
| `answers["short-term-incentives"]`           | Cast to `string[]`                                                                            | `compensation.shortTermIncentives`       |
| `answers["long-term-incentives"]`            | Cast to `string[]`                                                                            | `compensation.longTermIncentives`        |
| `answers["benefits-broker"]`                 | `"yes-broker"` → `"Yes"`, `"no-broker"` → `"No"`, `"unsure-broker"` → `"Unsure"`, else `null` | `benefits.workWithBenefitsBroker`        |
| `benefitsEnrollmentMonth`                    | Capitalise first letter only, `null` if empty                                                 | `benefits.benefitEnrollmentMonth`        |
| `answers["retirement-vesting-period"]`       | Cast to `string`, send as-is (ID = API value)                                                 | `benefits.retirementVestingPeriod`       |
| `answers["retirement-auto-enroll"]`          | `=== "yes-autoenroll"` → `true`, else `false`                                                 | `benefits.retirementAutoEnroll`          |
| `answers["retirement-hardship-withdrawals"]` | `=== "yes-hardship"` → `true`, else `false`                                                   | `benefits.retirementHardshipWithdrawals` |
| `goalsAnswers.selectedGoals`                 | Send as-is — goal `id` fields equal API values directly                                       | `goals.workforceGoals`                   |
| Static                                       | `["Retain Talent", "Attract Talent", "Reduce Absenteeism"]`                                   | `goals.workforceGoalsRanking`            |

---

## Hook Shape

### Location: `src/hooks/useSubmitFinchAssessment.ts` (new file)

```typescript
interface UseSubmitFinchAssessmentReturn {
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  submit: (payload: FinchAssessmentPayload) => Promise<void>;
  clearError: () => void;
}
```

---

## Option ID Changes in Static Data

All changes are in `src/pages/additionalQuestions/AdditionalQuestions.tsx`.

### `questions` array

| Question ID        | Current option ID      | Updated option ID      |
| ------------------ | ---------------------- | ---------------------- |
| `benefits-updates` | `work-email`           | `work_email`           |
| `benefits-updates` | `personal-device`      | `personal_email`       |
| `benefits-updates` | `office-flyer`         | `office_signs`         |
| `commute-methods`  | `group-transportation` | `group_transportation` |
| `commute-duration` | `commute-under-15min`  | `<15min`               |
| `commute-duration` | `commute-15-30min`     | `15-30min`             |
| `commute-duration` | `commute-30-1hr`       | `30-1hr`               |
| `commute-duration` | `commute-1hr-plus`     | `1hr+`                 |

### `compensationQuestions` array

| Question ID             | Current option ID       | Updated option ID       |
| ----------------------- | ----------------------- | ----------------------- |
| `short-term-incentives` | `cash-bonuses`          | `cash_bonuses`          |
| `short-term-incentives` | `profit-sharing`        | `profit_sharing`        |
| `long-term-incentives`  | `stock-options`         | `stock_options`         |
| `long-term-incentives`  | `deferred-compensation` | `deferred_compensation` |
| `long-term-incentives`  | `pension-plans`         | `pension_plans`         |

### `retirementQuestions` array

| Question ID                 | Current option ID | Updated option ID |
| --------------------------- | ----------------- | ----------------- |
| `retirement-vesting-period` | `vesting-less-6m` | `<6m`             |
| `retirement-vesting-period` | `vesting-6m-1y`   | `6m_1yr`          |
| `retirement-vesting-period` | `vesting-1y-2y`   | `1yr_2yr`         |
| `retirement-vesting-period` | `vesting-2y-4y`   | `2yr_4yr`         |
| `retirement-vesting-period` | `vesting-4y`      | `>4yr`            |

### `goalsData` array — ID updated to API values

Goal `id` fields now equal the API `value` strings directly. The `label` field is display-only (UI checkboxes).

| Old ID (kebab)                     | New ID (= API value)             | Display label (UI)                                                    |
| ---------------------------------- | -------------------------------- | --------------------------------------------------------------------- |
| `improve-benefits-participation`   | `Improve Benefits Participation` | Improve Benefits Participation                                        |
| `reduce-401k-loans`                | `Reduce 401k Withdrawals`        | Reduce 401k Loans and Withdrawals                                     |
| `increase-worker-financial-health` | `Increase Financial Health`      | Increase Worker Financial Health                                      |
| `improve-employee-health-outcomes` | `Improve Health Outcomes`        | Improve Employee Health Outcomes                                      |
| `reduce-healthcare-costs`          | `Reduce Healthcare Costs`        | Reduce Healthcare Costs                                               |
| `address-caregiving-challenges`    | `Support Caregiving`             | Address Caregiving Challenges                                         |
| `attract-talent`                   | `Attract Talent`                 | Attract Talent                                                        |
| `reduce-time-to-hire`              | `Reduce Time-to-Hire`            | Reduce Time-to-Hire                                                   |
| `reduce-absenteeism`               | `Reduce Absenteeism`             | Reduce Absenteeism                                                    |
| `reduce-quick-quits`               | `Reduce Quick Quits`             | Reduce Quick Quits (Turnover in Under 90 Days)                        |
| `retain-talent`                    | `Retain Talent`                  | Retain Talent                                                         |
| `upskilling-training`              | `Upskilling/Training`            | Upskilling and Training                                               |
| `employee-satisfaction`            | `Employee Satisfaction`          | Employee Satisfaction                                                 |
| `support-employees-navigating`     | `Benefits/Resources Navigation`  | Support Employees Navigating Company Benefits and Community Resources |

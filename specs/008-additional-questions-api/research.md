# Research: API Integration for the Additional Questions Form

**Branch**: `008-additional-questions-api` | **Date**: 2026-04-13

---

## 1. HTTP Client — Which Axios Instance to Use

**Decision**: Use `apiClient` from `src/services/api/authApi.ts`.

**Rationale**:

- `apiClient` is the repo-wide standard for all new services: `finchApi.ts`, `profileApi.ts`, `dashboardApi.ts`, and `userApi.ts` all import from `authApi.ts`.
- `apiClient` has a full token-refresh interceptor (automatic 401 → refresh → retry) that the legacy `assessmentApi.ts` local `api` instance does not.
- The new `/assessment/finch` endpoint requires authentication; using `apiClient` ensures the token is valid and refreshed before the POST lands.

**Alternatives considered**:

- The local `api` instance in `assessmentApi.ts` — carries auth token but does not do automatic refresh. Rejected because all net-new services use `apiClient`.
- Standalone `axios.create()` — over-engineering for a single endpoint. Rejected.

---

## 2. Where Does the New Service Function Live?

**Decision**: New function `submitFinchAssessment` added to `src/services/api/assessmentApi.ts`.

**Rationale**:

- The endpoint is `/assessment/finch`; it belongs logically with other assessment API calls.
- `finchApi.ts` handles the Finch OAuth connect flow (`/finch/connect-session`, `/finch/callback`, `/finch/status`). The `/assessment/finch` endpoint is an assessment submission that happens to feed Finch data — it is not part of the OAuth flow.
- Co-locating with `assessmentApi.ts` keeps all form-submission logic in one service file.

---

## 3. Month Field Handling

**Decision**: Use the `label` from `monthOptions` directly (e.g., `"January"`, `"March"`) for both `annualRaiseMonth` and `benefitEnrollmentMonth`.

**Rationale**:

- The API sample payload uses full month names: `"annualRaiseMonth": "March"`, `"benefitEnrollmentMonth": "November"`.
- The existing `mapMonthToApiValue` utility converts to **abbreviations** (e.g., `"Mar"`, `"Nov"`) via `MONTH_MAP` — this is the wrong format for the Finch endpoint.
- `monthOptions` items have labels `"January"`, `"February"`, etc. — already the correct format.
- The `Select` component currently uses option `id` (`"january"`) to track state; the payload builder will capitalize the stored ID to produce the label string (e.g., `"january" → "January"`).

**Alternatives considered**:

- `mapMonthToApiValue` — produces 3-letter abbreviations, incompatible with this endpoint. Rejected.
- Storing the label directly in state — cleaner but requires changing how `handleAnswerChange` works for dropdown fields. The capitalization approach is minimal-change.

---

## 4. Option ID Strategy — "ID IS the API Value"

**Decision**: Update all form option `id` values in the static data arrays to directly equal the API payload string values. No runtime mapping object needed.

**Rationale**:

- Confirmed by user: "these are keys → please update as per the payload format" and "the format should be as per the payload provided".
- Reading IDs directly from state as API values is simple, deterministic, and testable.
- The multi-select handler already collects IDs into arrays — those arrays are submitted unchanged.

**IDs requiring updates** (current → new):

| Array                   | Question ID                 | Current option ID       | New option ID (= API value) |
| ----------------------- | --------------------------- | ----------------------- | --------------------------- |
| `questions`             | `benefits-updates`          | `work-email`            | `work_email`                |
| `questions`             | `benefits-updates`          | `personal-device`       | `personal_email`            |
| `questions`             | `benefits-updates`          | `office-flyer`          | `office_signs`              |
| `questions`             | `commute-methods`           | `group-transportation`  | `group_transportation`      |
| `questions`             | `commute-duration`          | `commute-under-15min`   | `<15min`                    |
| `questions`             | `commute-duration`          | `commute-15-30min`      | `15-30min`                  |
| `questions`             | `commute-duration`          | `commute-30-1hr`        | `30-1hr`                    |
| `questions`             | `commute-duration`          | `commute-1hr-plus`      | `1hr+`                      |
| `compensationQuestions` | `short-term-incentives`     | `cash-bonuses`          | `cash_bonuses`              |
| `compensationQuestions` | `short-term-incentives`     | `profit-sharing`        | `profit_sharing`            |
| `compensationQuestions` | `long-term-incentives`      | `stock-options`         | `stock_options`             |
| `compensationQuestions` | `long-term-incentives`      | `deferred-compensation` | `deferred_compensation`     |
| `compensationQuestions` | `long-term-incentives`      | `pension-plans`         | `pension_plans`             |
| `retirementQuestions`   | `retirement-vesting-period` | `vesting-less-6m`       | `<6m`                       |
| `retirementQuestions`   | `retirement-vesting-period` | `vesting-6m-1y`         | `6m_1yr`                    |
| `retirementQuestions`   | `retirement-vesting-period` | `vesting-1y-2y`         | `1yr_2yr`                   |
| `retirementQuestions`   | `retirement-vesting-period` | `vesting-2y-4y`         | `2yr_4yr`                   |
| `retirementQuestions`   | `retirement-vesting-period` | `vesting-4y`            | `>4yr`                      |

**IDs that stay unchanged** (already correct or boolean-converted in payload builder):

- `car`, `train`, `bus`, `bike`, `walking` — already match API values.
- `rsus`, `espps`, `commissions` — already match API values.
- All boolean radio pairs (`yes-deskless`/`no-deskless`, `yes-raises`/`no-raises`, etc.) — not submitted as strings; converted to booleans by the payload builder.
- `yes-broker`/`no-broker`/`unsure-broker` — converted to `"Yes"`/`"No"`/`"Unsure"` by payload builder.
- `monthly` payroll provider IDs — used as-is (they equal the label, e.g., `"ADP"`).

---

## 5. Uncontrolled Selects — Wiring Gap

**Finding**: Both `Select` components (payroll provider and annual raise month) currently render without `onSelectionChange` handlers — they are uncontrolled. Likewise the `benefits-enrollment-period` dropdown. All three need to be wired to state.

**Decision**: Add three separate, typed state variables:

- `annualRaiseMonth: string` — controlled by the conditional month `Select` in Compensation.
- `payrollProvider: string` — controlled by the payroll provider `Select`.
- `benefitsEnrollmentMonth: string` — controlled by the benefits enrollment period `Select`.

These are kept as discrete state rather than merged into the existing `answers` record to avoid type conflicts (`answers` is typed `string | string[]`) and to make the payload-building function signature explicit.

---

## 6. Payload Builder — Pure Function

**Decision**: Extract the payload assembly into a pure function `buildFinchAssessmentPayload` in `src/utils/finchAssessmentPayload.ts`.

**Rationale**:

- Pure function is unit-testable without rendering the component.
- Separates payload logic from component state management concerns.
- Pattern is consistent with existing utilities in `src/utils/` (`monthUtils.ts`, `dateFormatter.ts`, etc.).

---

## 7. Hook vs. Inline Async in Component

**Decision**: Create `src/hooks/useSubmitFinchAssessment.ts` to encapsulate `isSubmitting`, `error`, `success` state and the submit call.

**Rationale**:

- Constitution Principle I (component-first) and Principle VI (state management discipline) both push side-effect logic out of components.
- Consistent with existing hook patterns: `useAssessment.ts`, `useFinchConnect.ts`, `useFinchStatus.ts`.
- The hook exposes `{ isSubmitting, error, success, submit, clearError }` — narrow interface.

---

## 8. Static `workforceGoalsRanking` Value

**Decision**: Hardcode `["Retain Talent", "Attract Talent", "Reduce Absenteeism"]` to match the sample payload provided.

**Rationale**: User confirmed this is the static value for this release. Dynamic ranking is out of scope.

---

## 9. Goal ID Strategy

**Finding**: The API `workforceGoals` field expects the same value strings provided in the schema (e.g., `"Attract Talent"`, `"Retain Talent"`, `"Reduce 401k Withdrawals"`, `"Support Caregiving"`, `"Benefits/Resources Navigation"`).

**Decision**: The `id` fields in `goalsData` are set to equal the API value strings directly. The payload builder sends `[...goalsAnswers.selectedGoals]` as-is — no label lookup is performed. The `label` field in `goalsData` is used only for checkbox display text and is not sent to the API.

---

## 10. Validation — Required Required Fields Pre-Submit

**Decision**: Perform a synchronous validation check inside `handleSubmit` before calling the API:

1. `deskless-employees` radio is selected.
2. `annual-raises` radio is selected.
3. If `annual-raises === "yes-raises"`, `annualRaiseMonth` is non-empty.
4. All three `retirementQuestions` radios (`retirement-vesting-period`, `retirement-auto-enroll`, `retirement-hardship-withdrawals`) are selected.

Any failure sets a `validationError` string that renders in the `ErrorMessage` banner. The API call is never made.

**Note**: `benefits-updates` (communicationMethods) is `required: true` in the static data but since it is multi-select, the user may legitimately want to submit with no communication method selected if it is not applicable. Treating it as non-blocking for this release (empty array is valid per FR-009).

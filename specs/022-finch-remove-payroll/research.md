# Research: Remove Payroll Provider Question from Finch Flow

**Feature**: `022-finch-remove-payroll`
**Date**: 2026-04-24
**Status**: Complete — no NEEDS CLARIFICATION items remain

---

## Decision 1: Scope of CompensationSection changes

**Question**: Is `CompensationSection.tsx` used in any flow other than the Finch `AdditionalQuestions.tsx`?

**Finding**: `CompensationSection` (the component) is imported only in `src/pages/additionalQuestions/AdditionalQuestions.tsx`. The other files referencing "CompensationSection" (e.g. `CompensationTab.tsx`, `useWorkforceCompensationConfig.ts`) are referencing a Redux selector named `selectCompensationSection`, which is unrelated.

**Decision**: Remove the `payroll-provider` question from `compensationQuestions` array inside `CompensationSection.tsx` outright. Also remove the `payrollProvider` and `onPayrollProviderChange` props from the component interface and implementation. The dropdown rendering block (`if (question.isDropdown)`) can be removed entirely since no remaining question uses `isDropdown: true`.

**Rationale**: Removing the question from the single shared component is the simplest approach. No conditional rendering flag is needed because the component is exclusively used in the Finch flow.

**Alternatives considered**: Adding a prop `showPayrollProvider?: boolean` and conditionally skipping the question. Rejected — adds unnecessary complexity; the component is only ever rendered from `AdditionalQuestions.tsx`.

---

## Decision 2: finchAssessmentPayload.ts signature change

**Question**: What is the impact of removing `payrollProvider` from `buildFinchAssessmentPayload`?

**Finding**: The function currently accepts `payrollProvider: string` as its 4th argument and writes `payrollProvider: payrollProvider || null` into the `compensation` object. Removing it requires:
1. Removing the parameter from the function signature.
2. Removing the `payrollProvider` field from the `compensation` object literal.
3. Updating all call sites — there is exactly one: `AdditionalQuestions.tsx` line 221.
4. Updating tests: `tests/utils/finchAssessmentPayload.test.ts` and `tests/services/finchAssessmentApi.test.ts`.

**Decision**: Remove the parameter and the field. The `CompensationPayload` type will also drop `payrollProvider`.

**Rationale**: Cleaner API — the parameter is no longer needed.

**Alternatives considered**: Keeping the parameter but not including it in the payload (e.g. always passing `null`). Rejected — dead code adds confusion.

---

## Decision 3: assessmentSchemas.ts — do not touch

**Question**: Does the Zod validation schema in `assessmentSchemas.ts` apply to the Finch Additional Questions form?

**Finding**: The Finch Additional Questions form validates directly in `AdditionalQuestions.tsx` via an inline `handleSubmit` function — it does NOT use `assessmentSchemas.ts`. That schema is used by the manual assessment flow (dashboard assessment path). The `payrollProvider: requiredString` rule in `assessmentSchemas.ts` covers the manual flow and must remain untouched.

**Decision**: Do not modify `assessmentSchemas.ts`.

---

## Decision 4: Test files requiring updates

**Finding**: The following test files include `payrollProvider` in payload fixtures used for Finch-flow tests and will fail after the type change:

| Test file | Line | Change needed |
|---|---|---|
| `tests/utils/finchAssessmentPayload.test.ts` | 128 | Remove `payrollProvider: "ADP"` from expected payload assertion |
| `tests/hooks/useSubmitFinchAssessment.test.ts` | 16 | Remove `payrollProvider: null` from mock payload fixture |
| `tests/pages/AdditionalQuestionsHealthPremium.test.tsx` | 248 | Remove `_payrollProvider` destructuring / related assertions |
| `tests/services/finchAssessmentApi.test.ts` | 64 | Remove `payrollProvider: null` from test payload fixture |

**Not affected**: `tests/services/finchApi.test.ts` line 40 references "Payroll provider connected successfully" — this is about Finch's OAuth connection, not the question.

**Decision**: Update each of the four test files as part of the implementation.

---

## Decision 5: No backend / API contract changes required

**Finding**: The backend API endpoint `POST /assessment/finch` will simply receive a payload that no longer contains `payrollProvider`. Backend fields are typically optional and the API is not under this team's scope. The requirement is frontend-only.

**Decision**: No `contracts/` file is needed. No backend changes are in scope.

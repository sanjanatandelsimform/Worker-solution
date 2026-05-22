# Research: Format Employer Cost Display

**Branch**: `017-format-employer-cost`  
**Date**: 2026-04-20  
**Phase**: 0 — Unknowns resolved before design

---

## Q1: What is the current type and usage of `BenefitsCost.employerCost`?

**Decision**: Change from `string` to `number | null`.

**Findings (from source)**:

- `src/types/workforceTypes.ts` line 141: currently typed as `string` with JSDoc `/** Pre-formatted string, e.g. "$11000/yr" */`
- The hook `useWorkforceCompensationConfig.ts` line 95 passes it straight through: `count: compensationSection?.benefitsCost.employerCost ?? "--"` — no formatting applied at the consumer layer.
- The API team is now returning a raw number (e.g., `11000`) instead of a pre-formatted string. The FE must take ownership of formatting.

**Rationale**: Accepting the raw number gives the FE full control over locale formatting, edge-case fallbacks, and future changes to the display pattern without requiring API changes.

**Alternatives considered**: Leave as `string` and have API return pre-formatted value — rejected because FE loses control over null/negative/zero handling and formatting consistency.

---

## Q2: Where does the formatting logic belong?

**Decision**: Add a new `formatEmployerCostPerYear` utility to `src/utils/formatters.ts`.

**Findings (from source)**:

- `src/utils/formatters.ts` already contains `formatCurrency`, `formatCurrencyWithCents`, `formatNumber`, `formatPercentage`, `formatCompact` — all locale-aware, all handling null/undefined with an "N/A" fallback.
- The Compensation card uses `"--"` as its fallback (not `"N/A"`), which is specific to this display context. This means we can't reuse `formatCurrency` directly.
- The existing pattern for `employerCostPerEmployee` in `useWorkforceOverviewConfig.ts` line 43 is:  
  ``count: workforceSection ? `$${workforceSection.employerCostPerEmployee.toLocaleString()}/yr` : "--"``  
  This produces the required `$11,240/yr` format.
- The new utility needs to: accept `number | null | undefined`, return `"--"` for null/undefined/negative, return `"$0/yr"` for zero, and return `"$X,XXX/yr"` for positive values using `toLocaleString()`.

**Rationale**: Co-locating in `formatters.ts` follows the established pattern, makes the function unit-testable in isolation, and signals intent clearly to reviewers.

**Alternatives considered**:

- Inline ternary in hook — rejected; the spec has five edge cases (null, undefined, missing, negative, zero) making an inline expression messy and hard to test.
- Repurpose `formatCurrency` + append `/yr` — rejected; `formatCurrency` returns `"N/A"` not `"--"`, and it doesn't support negative value interception.

---

## Q3: Which test files reference `employerCost` as a string and must be updated?

**Decision**: Update three existing test files; create one new test file for the formatter.

**Findings (from source)**:

| File                                     | Line | Current value               | Required change       |
| ---------------------------------------- | ---- | --------------------------- | --------------------- |
| `tests/services/workforceApi.test.ts`    | 74   | `employerCost: "$11000/yr"` | `employerCost: 11000` |
| `tests/store/workforceSlice.test.ts`     | 83   | `employerCost: "$11000/yr"` | `employerCost: 11000` |
| `tests/store/workforceSlice.test.ts`     | 148  | `employerCost: "$0"`        | `employerCost: 0`     |
| `tests/store/workforceSelectors.test.ts` | 59   | `employerCost: "$11000/yr"` | `employerCost: 11000` |

No existing `tests/utils/formatters.test.ts` exists. The constitution mandates TDD, so a new test file must be created covering all five `formatEmployerCostPerYear` scenarios before implementation.

**Rationale**: Keeping mock data consistent with the updated interface prevents TypeScript compile errors and ensures tests continue to reflect production API shape.

---

## Q4: Does the `useWorkforceCompensationConfig` hook need any guard beyond calling the formatter?

**Decision**: No extra guard needed — the formatter handles all edge cases internally.

**Findings (from source)**:

- The hook's existing pattern for "no data": `compensationSection?.benefitsCost.employerCost ?? "--"` will be replaced by calling `formatEmployerCostPerYear(compensationSection?.benefitsCost.employerCost)`.
- When `compensationSection` is `null/undefined`, the optional chaining `?.benefitsCost.employerCost` produces `undefined`, which the formatter maps to `"--"`.
- The formatter's negative-value guard handles bad data from the API.

---

## Q5: Are there other consumers of `BenefitsCost.employerCost` that need updating?

**Decision**: Only `useWorkforceCompensationConfig.ts` reads `employerCost` from `BenefitsCost`. No other source files consume this specific field.

**Findings**: `grep employerCost src/` shows hits in `workforceTypes.ts` (definition), `useWorkforceCompensationConfig.ts` (consumer), and `useWorkforceOverviewConfig.ts` (uses `employerCostPerEmployee` — a different field on `WorkforceOverview`, not `BenefitsCost`). No additional consumers.

---

## Summary of decisions

| Decision                            | Chosen                                                      | Reason                                                  |
| ----------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------- |
| Type of `BenefitsCost.employerCost` | `number \| null`                                            | Raw number gives FE control; aligns with API change     |
| Formatter location                  | `src/utils/formatters.ts` — new `formatEmployerCostPerYear` | Follows existing pattern, unit-testable, reusable       |
| Fallback for invalid values         | `"--"` (null, undefined, negative)                          | Matches card UX convention; consistent with other cards |
| Zero handling                       | `"$0/yr"`                                                   | Zero is valid data; distinct from missing               |
| Tests                               | New `tests/utils/formatters.test.ts` + 3 updated files      | TDD constitution compliance                             |

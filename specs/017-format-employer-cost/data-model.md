# Data Model: Format Employer Cost Display

**Branch**: `017-format-employer-cost`  
**Date**: 2026-04-20  
**Phase**: 1 — Type contracts and entity design

---

## Modified Interface: `BenefitsCost`

**File**: `src/types/workforceTypes.ts`

### Before

```typescript
export interface BenefitsCost {
  employeeContribution: number;
  /** Pre-formatted string, e.g. "$11000/yr" */
  employerCost: string;
  graph: BenefitsCostGraphEntry[];
  table: BenefitsCostTableRow[];
}
```

### After

```typescript
export interface BenefitsCost {
  employeeContribution: number;
  /**
   * Raw annual employer cost in whole dollars (e.g., 11240).
   * Null when the API cannot compute a cost for this employer.
   * Formatted for display via `formatEmployerCostPerYear()` in formatters.ts.
   */
  employerCost: number | null;
  graph: BenefitsCostGraphEntry[];
  table: BenefitsCostTableRow[];
}
```

**No other interfaces change.** `BenefitsCostTableRow.employerCostPerPaycheck` is already `number | null`; `WorkforceOverview.employerCostPerEmployee` is a separate field and is unchanged.

---

## New Utility: `formatEmployerCostPerYear`

**File**: `src/utils/formatters.ts` — appended to existing file

### Signature

```typescript
/**
 * Format an annual employer cost number as a dollar-per-year string.
 *
 * Returns "--" for null, undefined, or negative values (guard against bad API data).
 * Returns "$0/yr" for zero (valid data; distinct from missing).
 * Uses locale-aware thousands separators (e.g., 11240 → "$11,240/yr").
 *
 * @param value - Annual cost in whole dollars, or null/undefined
 * @returns Formatted string e.g. "$11,240/yr", or "--"
 *
 * @example
 * formatEmployerCostPerYear(11240)    // "$11,240/yr"
 * formatEmployerCostPerYear(0)        // "$0/yr"
 * formatEmployerCostPerYear(null)     // "--"
 * formatEmployerCostPerYear(undefined)// "--"
 * formatEmployerCostPerYear(-500)     // "--"
 */
export const formatEmployerCostPerYear = (value: number | null | undefined): string => {
  if (value === null || value === undefined || value < 0) return "--";
  return `$${value.toLocaleString("en-US")}/yr`;
};
```

### Behaviour table

| Input       | Output              | Reason                      |
| ----------- | ------------------- | --------------------------- |
| `11240`     | `"$11,240/yr"`      | Happy path                  |
| `1000000`   | `"$1,000,000/yr"`   | Large value with separators |
| `0`         | `"$0/yr"`           | Zero is valid               |
| `null`      | `"--"`              | Missing data fallback       |
| `undefined` | `"--"`              | Missing data fallback       |
| `-500`      | `"--"`              | Bad data guard              |
| `999999999` | `"$999,999,999/yr"` | Extreme large value         |

---

## Hook Update: `useWorkforceCompensationConfig`

**File**: `src/hooks/useWorkforceCompensationConfig.ts`

### Before

```typescript
{
  id: "employer-cost",
  title: "Employer Cost Per Employee (Avg)",
  count: compensationSection?.benefitsCost.employerCost ?? "--",
  tooltipText: "The average amount each employee costs the company across benefits",
  getCountClass: () => COUNT_CLASS,
},
```

### After

```typescript
{
  id: "employer-cost",
  title: "Employer Cost Per Employee (Avg)",
  count: formatEmployerCostPerYear(compensationSection?.benefitsCost.employerCost),
  tooltipText: "The average amount each employee costs the company across benefits",
  getCountClass: () => COUNT_CLASS,
},
```

**Import addition**: `import { formatEmployerCostPerYear } from "@/utils/formatters";`

---

## Test Data Updates

All mock objects typed as `WorkforceApiResponse` that set `benefitsCost.employerCost` to a pre-formatted string must use a raw number instead.

| File                                     | Location                         | Old value     | New value |
| ---------------------------------------- | -------------------------------- | ------------- | --------- |
| `tests/services/workforceApi.test.ts`    | `mockWorkforceResponse`          | `"$11000/yr"` | `11000`   |
| `tests/store/workforceSlice.test.ts`     | `it("fetchWorkforce.fulfilled")` | `"$11000/yr"` | `11000`   |
| `tests/store/workforceSlice.test.ts`     | `it("clearWorkforce")`           | `"$0"`        | `0`       |
| `tests/store/workforceSelectors.test.ts` | `mockWorkforceData`              | `"$11000/yr"` | `11000`   |

---

## New Test File: `tests/utils/formatters.test.ts`

**Purpose**: Unit tests for `formatEmployerCostPerYear` written before implementation (TDD / Red phase).

### Test cases

```typescript
describe("formatEmployerCostPerYear", () => {
  it("formats a positive integer with thousands separator and '/yr' suffix", () => {
    expect(formatEmployerCostPerYear(11240)).toBe("$11,240/yr");
  });
  it("formats zero as '$0/yr'", () => {
    expect(formatEmployerCostPerYear(0)).toBe("$0/yr");
  });
  it("returns '--' for null", () => {
    expect(formatEmployerCostPerYear(null)).toBe("--");
  });
  it("returns '--' for undefined", () => {
    expect(formatEmployerCostPerYear(undefined)).toBe("--");
  });
  it("returns '--' for a negative number", () => {
    expect(formatEmployerCostPerYear(-500)).toBe("--");
  });
  it("formats a large number with correct separators", () => {
    expect(formatEmployerCostPerYear(1000000)).toBe("$1,000,000/yr");
  });
});
```

---

## File Impact Summary

| File                                          | Change type                        | LOC delta |
| --------------------------------------------- | ---------------------------------- | --------- |
| `src/types/workforceTypes.ts`                 | Modify — type change on one field  | ~2        |
| `src/utils/formatters.ts`                     | Modify — add one exported function | ~10       |
| `src/hooks/useWorkforceCompensationConfig.ts` | Modify — one line + one import     | ~2        |
| `tests/utils/formatters.test.ts`              | **Create** — new test file         | ~30       |
| `tests/services/workforceApi.test.ts`         | Modify — update one mock value     | ~1        |
| `tests/store/workforceSlice.test.ts`          | Modify — update two mock values    | ~2        |
| `tests/store/workforceSelectors.test.ts`      | Modify — update one mock value     | ~1        |

**Total**: 6 files modified, 1 file created. No new components, no new routes, no Redux changes.

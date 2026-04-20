# Quickstart: Format Employer Cost Display

**Branch**: `017-format-employer-cost`  
**Date**: 2026-04-20  
**Effort estimate**: ~1 hour  
**Files changed**: 6 modified, 1 created

---

## What this feature does

`BenefitsCost.employerCost` is changing from a pre-formatted string (`"$11000/yr"`) to a raw number (`11000`) in the API response. This feature:

1. Updates the TypeScript interface to match the new API shape.
2. Adds a `formatEmployerCostPerYear` formatter that handles all edge cases.
3. Updates the compensation hook to call the formatter.
4. Updates all test fixtures to use numeric values.

**User-visible change**: None. The card continues to display `$11,000/yr`. If `employerCost` is null, undefined, or negative the card shows `--`.

---

## Prerequisites

```bash
pnpm install          # no new deps
pnpm run type-check   # should pass on main before you start
```

---

## Implementation steps (TDD order)

### Step 1 — Write failing tests first

Create `tests/utils/formatters.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { formatEmployerCostPerYear } from "@/utils/formatters";

describe("formatEmployerCostPerYear", () => {
  it("formats a positive integer with thousands separator and /yr suffix", () => {
    expect(formatEmployerCostPerYear(11240)).toBe("$11,240/yr");
  });

  it("formats zero as $0/yr", () => {
    expect(formatEmployerCostPerYear(0)).toBe("$0/yr");
  });

  it("returns -- for null", () => {
    expect(formatEmployerCostPerYear(null)).toBe("--");
  });

  it("returns -- for undefined", () => {
    expect(formatEmployerCostPerYear(undefined)).toBe("--");
  });

  it("returns -- for a negative number", () => {
    expect(formatEmployerCostPerYear(-500)).toBe("--");
  });

  it("formats a large number with correct separators", () => {
    expect(formatEmployerCostPerYear(1000000)).toBe("$1,000,000/yr");
  });
});
```

Run:

```bash
pnpm test tests/utils/formatters.test.ts
# Expected: 6 failing tests (Red phase — function doesn't exist yet)
```

---

### Step 2 — Update the TypeScript interface

**File**: `src/types/workforceTypes.ts`

Change:

```typescript
export interface BenefitsCost {
  employeeContribution: number;
  /** Pre-formatted string, e.g. "$11000/yr" */
  employerCost: string;
  graph: BenefitsCostGraphEntry[];
  table: BenefitsCostTableRow[];
}
```

To:

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

---

### Step 3 — Add the formatter

**File**: `src/utils/formatters.ts` — append before the final export or after `formatCurrencyWithCents`:

````typescript
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
 * ```typescript
 * formatEmployerCostPerYear(11240)     // "$11,240/yr"
 * formatEmployerCostPerYear(0)         // "$0/yr"
 * formatEmployerCostPerYear(null)      // "--"
 * formatEmployerCostPerYear(undefined) // "--"
 * formatEmployerCostPerYear(-500)      // "--"
 * ```
 */
export const formatEmployerCostPerYear = (value: number | null | undefined): string => {
  if (value === null || value === undefined || value < 0) return "--";
  return `$${value.toLocaleString("en-US")}/yr`;
};
````

Run:

```bash
pnpm test tests/utils/formatters.test.ts
# Expected: 6 passing (Green phase)
```

---

### Step 4 — Update the hook

**File**: `src/hooks/useWorkforceCompensationConfig.ts`

Add import (alongside existing imports at top of file):

```typescript
import { formatEmployerCostPerYear } from "@/utils/formatters";
```

Change the `employer-cost` card `count` field:

```typescript
// Before:
count: compensationSection?.benefitsCost.employerCost ?? "--",

// After:
count: formatEmployerCostPerYear(compensationSection?.benefitsCost.employerCost),
```

---

### Step 5 — Update test fixtures (4 locations)

These tests will have TypeScript errors after Step 2 because `employerCost` no longer accepts a string.

**`tests/services/workforceApi.test.ts`** line ~74:

```typescript
// Before:
benefitsCost: { employeeContribution: 468, employerCost: "$11000/yr", graph: [], table: [] },
// After:
benefitsCost: { employeeContribution: 468, employerCost: 11000, graph: [], table: [] },
```

**`tests/store/workforceSlice.test.ts`** — two occurrences:

```typescript
// Occurrence 1 (~line 83): fetchWorkforce.fulfilled test
// Before:
benefitsCost: { employeeContribution: 468, employerCost: "$11000/yr", graph: [], table: [] },
// After:
benefitsCost: { employeeContribution: 468, employerCost: 11000, graph: [], table: [] },

// Occurrence 2 (~line 148): clearWorkforce test
// Before:
benefitsCost: { employeeContribution: 0, employerCost: "$0", graph: [], table: [] },
// After:
benefitsCost: { employeeContribution: 0, employerCost: 0, graph: [], table: [] },
```

**`tests/store/workforceSelectors.test.ts`** line ~59:

```typescript
// Before:
benefitsCost: { employeeContribution: 468, employerCost: "$11000/yr", graph: [], table: [] },
// After:
benefitsCost: { employeeContribution: 468, employerCost: 11000, graph: [], table: [] },
```

---

### Step 6 — Run full quality gate

```bash
pnpm run type-check          # must pass with zero errors
pnpm test                    # all existing + new formatter tests pass
pnpm lint:fix                # auto-fix any lint issues
pnpm format                  # prettier
pnpm dev                     # smoke-test: navigate to /dashboard → Workforce → Compensation tab
                             # card "Employer Cost Per Employee (Avg)" should show e.g. "$11,000/yr"
```

---

## Verification checklist

- [ ] `BenefitsCost.employerCost` typed as `number | null` in `workforceTypes.ts`
- [ ] `formatEmployerCostPerYear` present in `formatters.ts`
- [ ] 6 unit tests in `tests/utils/formatters.test.ts` all green
- [ ] Compensation card displays `$11,240/yr` for input `11240`
- [ ] Compensation card displays `$0/yr` for input `0`
- [ ] Compensation card displays `--` for null/undefined/negative inputs
- [ ] All existing tests pass (no regressions)
- [ ] `pnpm run type-check` exits cleanly

---

## Rollback

This change is contained entirely in 7 files with no routing, state, or API changes. To revert: restore the interface `employerCost: string`, remove the formatter, restore the hook line, and restore the four mock values.

# Quickstart: Fix `employmentType` Typo in Workforce API

**Feature**: `013-fix-employment-type-typo`  
**Date**: 2026-04-16  
**Estimated implementation time**: 15 minutes

---

## Prerequisites

- On branch `013-fix-employment-type-typo`
- `pnpm install` already run
- No uncommitted changes in `src/` or `tests/`

---

## Step 1 — Fix the TypeScript type definition

**File**: `src/types/workforceTypes.ts`

Find and replace the `Demographics` interface block:

```typescript
// BEFORE
export interface Demographics {
  /**
   * Employment type split by department.
   * @note "employementType" spelling intentionally mirrors the backend schema typo.
   */
  employementType: EmploymentTypeEntry[];
  gender: GenderBreakdown;
  employmentBreakdownByAge: AgeBreakdownEntry[];
}
```

```typescript
// AFTER
export interface Demographics {
  /** Employment type split by department. */
  employmentType: EmploymentTypeEntry[];
  gender: GenderBreakdown;
  employmentBreakdownByAge: AgeBreakdownEntry[];
}
```

**Why first**: This is the type definition. Changing it here causes TypeScript to immediately flag all remaining mismatches across the codebase, making Step 2–4 self-guided.

---

## Step 2 — Fix the static data fixture in the Redux slice

**File**: `src/store/slices/workforceSlice.ts`

In `STATIC_WORKFORCE_DATA.demographics`, rename the object key:

```typescript
// BEFORE
demographics: {
  employementType: [
    { department: "all", fullTime: "80%", partTime: "20%", seasonal: "5%" },
    ...
  ],
```

```typescript
// AFTER
demographics: {
  employmentType: [
    { department: "all", fullTime: "80%", partTime: "20%", seasonal: "5%" },
    ...
  ],
```

---

## Step 3 — Fix the demographics hook

**File**: `src/hooks/useWorkforceDemographicsConfig.ts`

Three property accesses to update (all on `demographicsSection`):

| Line | Old                                            | New                                           |
| ---- | ---------------------------------------------- | --------------------------------------------- |
| ~16  | `demographicsSection?.employementType.map(…)`  | `demographicsSection?.employmentType.map(…)`  |
| ~48  | `demographicsSection?.employementType.find(…)` | `demographicsSection?.employmentType.find(…)` |
| ~49  | `demographicsSection?.employementType[0]`      | `demographicsSection?.employmentType[0]`      |

---

## Step 4 — Fix the selector JSDoc comment

**File**: `src/store/selectors/workforceSelectors.ts`

Update the JSDoc for `selectDemographicsSection`:

```typescript
// BEFORE
/**
 * Select the `demographics` section of the API response.
 * Contains employementType (note: intentional typo matching backend schema), gender, age breakdown.
 */
```

```typescript
// AFTER
/**
 * Select the `demographics` section of the API response.
 * Contains employmentType, gender, age breakdown.
 */
```

---

## Step 5 — Fix test fixtures

**Files and locations**:

| File                                     | Approx. line | Change                                                 |
| ---------------------------------------- | ------------ | ------------------------------------------------------ |
| `tests/store/workforceSlice.test.ts`     | ~71          | `employementType: []` → `employmentType: []`           |
| `tests/store/workforceSlice.test.ts`     | ~134         | `employementType: []` → `employmentType: []`           |
| `tests/services/workforceApi.test.ts`    | ~64          | `employementType: []` → `employmentType: []`           |
| `tests/store/workforceSelectors.test.ts` | ~49          | `employementType: [{ … }]` → `employmentType: [{ … }]` |

Each is a single-key rename inside a `demographics:` object literal.

---

## Step 6 — Verify

```bash
# TypeScript must pass with zero errors
pnpm run type-check

# All tests must pass
pnpm run test

# Zero occurrences of the misspelling in src/ and tests/
# (run from repo root on Linux/macOS/Git Bash)
grep -r "employementType" src/ tests/
# Expected: no output
```

On Windows PowerShell:

```powershell
Select-String -Path src\**\*.ts,tests\**\*.ts -Pattern "employementType" -Recurse
# Expected: no matches
```

---

## Common Mistakes to Avoid

1. **Renaming `EmploymentTypeEntry`** — do NOT rename this interface. Only the field name on `Demographics` changes.
2. **Editing `specs/009-workforce-tab-api/` files** — these are historical; leave them as-is.
3. **Forgetting the `[0]` fallback on line ~49** — there are three accesses in the hook, not two.
4. **Mismatched static keys in the slice** — the `STATIC_WORKFORCE_DATA` is a typed object literal; TypeScript will error if the key is wrong, but double-check the object shape matches `WorkforceResponse`.

# Data Model: Fix `employmentType` Typo in Workforce API

**Feature**: `013-fix-employment-type-typo`  
**Date**: 2026-04-16  
**Status**: Final

---

## Overview

This feature renames a single field on the `Demographics` TypeScript interface from `employementType` to `employmentType`. No new entities, no removed entities, no shape changes.

---

## Corrected Interface: `Demographics`

**File**: `src/types/workforceTypes.ts`

```typescript
/**
 * Workforce demographic breakdown
 */
export interface Demographics {
  /** Employment type split by department. */
  employmentType: EmploymentTypeEntry[]; // ← corrected (was: employementType)
  gender: GenderBreakdown;
  employmentBreakdownByAge: AgeBreakdownEntry[];
}
```

**Change**: Field renamed from `employementType` → `employmentType`. The JSDoc `@note` comment that stated the misspelling was intentional is removed.

---

## Unchanged Interface: `EmploymentTypeEntry`

No changes. Included here for completeness.

```typescript
/** Full-time / part-time / seasonal percentages for a given department */
export interface EmploymentTypeEntry {
  /** "all" | "engineering" | "sales" | "hr" | etc. */
  department: string;
  /** e.g. "80%" */
  fullTime: string;
  /** e.g. "20%" */
  partTime: string;
  /** e.g. "5%" */
  seasonal: string;
}
```

---

## Field Rename Impact Map

| Location        | File                                                  | Symbol                                               | Old Value                                   | New Value                 |
| --------------- | ----------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------- | ------------------------- |
| Type definition | `src/types/workforceTypes.ts`                         | `Demographics.employementType`                       | field name                                  | `employmentType`          |
| Static fixture  | `src/store/slices/workforceSlice.ts`                  | `STATIC_WORKFORCE_DATA.demographics.employementType` | object key                                  | `employmentType`          |
| Hook — dept map | `src/hooks/useWorkforceDemographicsConfig.ts` line 16 | `demographicsSection?.employementType.map(…)`        | property access                             | `.employmentType.map(…)`  |
| Hook — find     | `src/hooks/useWorkforceDemographicsConfig.ts` line 48 | `demographicsSection?.employementType.find(…)`       | property access                             | `.employmentType.find(…)` |
| Hook — fallback | `src/hooks/useWorkforceDemographicsConfig.ts` line 49 | `demographicsSection?.employementType[0]`            | property access                             | `.employmentType[0]`      |
| Selector JSDoc  | `src/store/selectors/workforceSelectors.ts` line 53   | JSDoc comment text                                   | `employementType (note: intentional typo…)` | `employmentType`          |
| Test fixture #1 | `tests/store/workforceSlice.test.ts` line 71          | object key in fixture                                | `employementType`                           | `employmentType`          |
| Test fixture #2 | `tests/store/workforceSlice.test.ts` line 134         | object key in fixture                                | `employementType`                           | `employmentType`          |
| Test fixture #3 | `tests/services/workforceApi.test.ts` line 64         | object key in fixture                                | `employementType`                           | `employmentType`          |
| Test fixture #4 | `tests/store/workforceSelectors.test.ts` line 49      | object key in fixture                                | `employementType`                           | `employmentType`          |

---

## Validation Rules

No validation rules change. The `employmentType` array has the same shape constraints as before:

- Must be non-empty for the department dropdown to render options.
- First element's `department` value should be `"all"` (used as default selection).
- `fullTime`, `partTime`, `seasonal` values must be parseable by `parsePercentage()` (strings ending in `%`, e.g. `"80%"`).

---

## Backward Compatibility

This rename is a **breaking change at the TypeScript level only**. All consumers within `src/` and `tests/` are updated in the same PR. There are no external consumers of these TypeScript types (no published npm package). The runtime JSON field name returned by the live API must also be `employmentType` — this is coordinated with the backend team and documented in the Assumptions section of the spec.

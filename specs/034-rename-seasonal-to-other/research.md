# Research: Rename Seasonal → Other in Workforce Demographics

**Feature**: `034-rename-seasonal-to-other`  
**Phase**: 0 — Research  
**Date**: 2026-05-07

## Research Task 1: Scope of `seasonal` references across the codebase

### Question

Which files reference `seasonal` as an employment type key (vs. as a display label, schema field, or unrelated concept)?

### Findings

Full grep across `src/` and `tests/` revealed the following:

| File                                                 | Occurrence                                                                                                                                                             | Action                   |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `src/pages/workforce/WorkforceDemographics.tsx`      | `employmentTypeItems[2].id = "seasonal"`, `label = "Seasonal"`, `EmploymentType` union, cast in `onSelectionChange`                                                    | Rename all               |
| `src/pages/workforce/WorkforcePage.tsx`              | `useState<"fullTime" \| "partTime" \| "seasonal">`                                                                                                                     | Rename type              |
| `src/hooks/useWorkforceDemographicsConfig.ts`        | param type, `donutChartsConfig[2].id = "seasonal"`, `label = "Seasonal"`, `selectedDeptData.seasonal`                                                                  | Rename all               |
| `src/types/workforceTypes.ts`                        | `EmploymentTypeEntry.seasonal: string`, `AgeBreakdownEntry.seasonal: number`, JSDoc comment                                                                            | Rename both fields       |
| `tests/hooks/useWorkforceDemographicsConfig.test.ts` | All 3 `EmploymentTypeEntry` fixtures use `seasonal: "X%"`, all 5 `AgeBreakdownEntry` fixtures use `seasonal: N`, 4 test descriptions/assertions reference `"seasonal"` | Update fixtures and text |
| `tests/store/workforceSelectors.test.ts`             | `mockWorkforceData` fixture has `seasonal: "5%"` in one `EmploymentTypeEntry`                                                                                          | Update fixture           |

**Out of scope** (must NOT be touched):

- `src/services/validation/assessmentSchemas.ts` line 17: `contractorsSeasonalEmployees` — unrelated schema field for the manual assessment flow
- `src/pages/workforce/WorkforceCompensation*` and `useWorkforceCompensationConfig.ts` — unrelated to employment type charting
- Any display string "Seasonal" that describes `contractorsSeasonalEmployees`

### Decision

All six files listed above must be updated. No new files or helper abstractions needed.

---

## Research Task 2: TypeScript impact of renaming `AgeBreakdownEntry.seasonal`

### Question

The hook accesses `entry[selectedEmploymentType]` dynamically. Will renaming `seasonal → other` in the type and the union break or fix TypeScript inference?

### Findings

In `useWorkforceDemographicsConfig.ts`:

```ts
value: entry[selectedEmploymentType],
```

The expression `entry[selectedEmploymentType]` uses `selectedEmploymentType` as a key into `AgeBreakdownEntry`. TypeScript validates this via the mapped key lookup. Currently `selectedEmploymentType: "fullTime" | "partTime" | "seasonal"` and `AgeBreakdownEntry` has `fullTime`, `partTime`, `seasonal` — all keys exist so no TS error.

After the rename: `selectedEmploymentType: "fullTime" | "partTime" | "other"` and `AgeBreakdownEntry` has `fullTime`, `partTime`, `other` — keys still align, so no TS error. The rename is safe and the dynamic access continues to work correctly.

### Decision

Rename both simultaneously (type + hook param) in the same edit. No workarounds needed.

---

## Research Task 3: No backend mock or API changes needed

### Question

Do any mock server files, MSW handlers, or data fixtures outside `tests/` need updating?

### Findings

Searched for `seasonal` in `src/data/`, `src/services/`, and `public/`. No static JSON fixtures or MSW handlers reference `seasonal` as an employment type key.

The workforce selectors test (`workforceSelectors.test.ts`) contains one inline mock fixture — already captured in Task 1.

### Decision

No additional file changes beyond the six listed.

---

## Summary of Decisions

| Decision                                      | Rationale                                                               | Alternatives Considered                                                                       |
| --------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Rename in 6 files simultaneously              | Ensures TypeScript consistency; partial rename would break `type-check` | Rename only UI label (rejected: leaves type mismatch and data-access bug)                     |
| Keep `contractorsSeasonalEmployees` unchanged | Unrelated schema field; in-scope only for manual assessment flow        | N/A                                                                                           |
| No abstraction or constant for the string     | One-time rename; constant would add unnecessary indirection             | Create `EMPLOYMENT_TYPES` constant (rejected: over-engineering per implementation discipline) |

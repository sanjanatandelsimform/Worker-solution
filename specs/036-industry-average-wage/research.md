# Research: Update `industryAverageWage` to Object Type

**Feature**: `036-industry-average-wage`  
**Date**: 2026-05-12  
**Status**: Complete — all unknowns resolved

---

## R-001: What is the exact new BE shape for `industryAverageWage`?

**Decision**: The backend now returns:

```json
{ "hourly": 27.29, "salary": 56770 }
```

instead of the previous flat `number` (e.g., `56770`).

**Rationale**: Provided directly by the user (explicit BE API change). No clarification needed.

**Alternatives considered**: None — this is a dictated contract change.

---

## R-002: Which field from the new object is displayed in the UI?

**Decision**: The `salary` sub-field is displayed. The UI shows annual salary formatted as currency (e.g., `$56,770`).

**Rationale**: The component `CompanyAtAGlance` displays the "National Industry Median Wage" card. Annual salary (not hourly) is the value shown, consistent with the previous flat-number behavior.

**Evidence**: `RecommendationsFinchPage.tsx` line 79 passes `industryAverageWage` to `companyGlanceData.industryAverageWage`, which flows into `CompanyAtAGlance`'s `industryAverageWage: string | number | null` prop. The card uses `formatCurrency()` which formats integers as dollar amounts.

---

## R-003: Which files directly read `IndustryOverview.industryAverageWage`?

**Decision**: Only one source file:

- `src/pages/recommendations/RecommendationsFinchPage.tsx` line 54:
  ```typescript
  const industryAverageWage = industryData?.industryOverview?.industryAverageWage;
  ```

**Rationale**: Grep across the full workspace confirms all other uses are in:

- `src/types/dashboardTypes.ts` — the `CompanyAtGlance` interface (`string | number | null`), which is downstream of the extraction; unchanged.
- `tests/pages/CompanyAtAGlance.test.tsx` — passes values directly to the component prop (not to `IndustryOverview`); unchanged.
- `tests/pages/RecommendationsPage.test.tsx` — uses the legacy `CompanyAtGlance` dashboard slice mock; unchanged.
- Various spec files — documentation only; unchanged.

---

## R-004: Which test fixtures reference `IndustryOverview.industryAverageWage` as a flat number?

**Decision**: One test fixture must be updated:

- `tests/pages/RecommendationsFinchPage.test.tsx` line 358:
  ```typescript
  industryAverageWage: 45000,   // OLD — must become { hourly: X, salary: 45000 }
  ```

**Rationale**: This fixture mocks `useIndustry().data` as an `IndustryData` object, meaning it satisfies the `IndustryOverview` type directly. After the type change, TypeScript will fail to compile a plain number here. The cast `as unknown as IndustryData` currently used bypasses strict checking, but updating the fixture is still required for correctness and to avoid false-green tests.

**Test file uses `as unknown as IndustryData`**: Yes — however, the fixture will be updated to the correct object shape regardless, so the assertion (`$45,000`) continues to pass via `.salary`.

---

## R-005: Does `CompanyAtAGlance.industryAverageWage` prop type need to change?

**Decision**: **No.** The prop type in `dashboardTypes.ts` (`CompanyAtGlance.industryAverageWage: string | number | null`) remains unchanged. The extraction of `.salary` (a `number`) happens in `RecommendationsFinchPage` before the value is passed down. The component already accepts `number | null`, so the salary number passes through without any component changes.

---

## R-006: Does `RecommendationsPage.test.tsx`'s `industryAverageWage: 68000` need updating?

**Decision**: **No.** That fixture populates `mockCompanyAtGlance`, which feeds the `CompanyAtGlance` interface in `dashboardTypes.ts` (the display-ready prop, not the raw `IndustryOverview` type). It represents a pre-extracted value and does not change.

---

## R-007: Is there an existing `SalaryHourly` interface we can reuse?

**Decision**: Yes. `src/types/industryTypes.ts` already defines:

```typescript
export interface SalaryHourly {
  salary: number;
  hourly: number;
}
```

This matches the new shape exactly. We will reuse `SalaryHourly` for the `industryAverageWage` field type.

**Rationale**: Reusing an existing interface avoids duplication and keeps the type model DRY. The field order in `SalaryHourly` (`salary`, `hourly`) matches what the BE returns.

---

## Summary Table

| ID    | Question                                             | Decision                                                |
| ----- | ---------------------------------------------------- | ------------------------------------------------------- |
| R-001 | New BE shape                                         | `{ hourly: number; salary: number }`                    |
| R-002 | Which field to display                               | `salary`                                                |
| R-003 | Files reading `IndustryOverview.industryAverageWage` | 1 source file: `RecommendationsFinchPage.tsx`           |
| R-004 | Test fixtures requiring update                       | 1 fixture: `RecommendationsFinchPage.test.tsx` line 358 |
| R-005 | `CompanyAtGlance` prop type change needed            | No                                                      |
| R-006 | `RecommendationsPage.test.tsx` update needed         | No                                                      |
| R-007 | Reuse `SalaryHourly` interface                       | Yes — exact shape match                                 |

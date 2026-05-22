# Type Contract: `IndustryOverview.industryAverageWage`

**Feature**: `036-industry-average-wage`  
**Date**: 2026-05-12  
**Contract Type**: TypeScript type change (BE → FE interface update)

---

## Backend Response Shape (new)

The industry API's `industryOverview` object now returns `industryAverageWage` as:

```json
{
  "industryOverview": {
    "turnoverRate": { "rate": "15%", "month": "Jun", "year": 2025 },
    "avgTurnover": { "rate": 15.2, "sinceYear": 2020 },
    "industryWideCostOfTurnover": { "amount": 500000, "formatted": "$500,000", "year": 2025 },
    "rates": { "hire": 10.5, "seperation": 8.3 },
    "industryAverageWage": {
      "hourly": 27.29,
      "salary": 56770
    }
  }
}
```

## Previous Shape (deprecated)

```json
"industryAverageWage": 56770
```

## TypeScript Interface (after change)

```typescript
// src/types/industryTypes.ts

// Existing interface — UNCHANGED (already defined in file)
export interface SalaryHourly {
  salary: number;
  hourly: number;
}

export interface IndustryOverview {
  turnoverRate: {
    rate: string;
    month: string;
    year: number;
  };
  avgTurnover: {
    rate: number;
    sinceYear: number;
  };
  industryWideCostOfTurnover: {
    amount: number;
    formatted: string;
    year: number;
  };
  rates: {
    hire: number;
    seperation: number;
  };
  industryAverageWage: SalaryHourly; // ← CHANGED: was `number`, now `SalaryHourly`
}
```

## Field Semantics

| Field    | Type     | Unit         | Usage                                                                    |
| -------- | -------- | ------------ | ------------------------------------------------------------------------ |
| `salary` | `number` | Annual USD   | Displayed in "National Industry Median Wage" card via `formatCurrency()` |
| `hourly` | `number` | USD per hour | Available in type; not rendered in any current UI component              |

## Extraction Site

File: `src/pages/recommendations/RecommendationsFinchPage.tsx`

```typescript
// Line that changes:
const industryAverageWage = industryData?.industryOverview?.industryAverageWage?.salary;
//                                                                                ^^^^^^^
//                                                            append .salary to extract annual value
```

## Downstream Interface (unchanged)

```typescript
// src/types/dashboardTypes.ts — NOT MODIFIED
export interface CompanyAtGlance {
  industryAverageWage: string | number | null;
  // receives a number (salary) or null; already compatible
}
```

## Null Safety

Optional chaining (`?.salary`) means:

- If `industryData` is `null` → result is `undefined` → `?? null` → `null` → UI shows "N/A"
- If `industryAverageWage` object is missing → result is `undefined` → `?? null` → `null` → UI shows "N/A"
- If `salary` is `0` → result is `0` → `?? null` resolves to `0` → UI shows `$0`

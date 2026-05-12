# Data Model: Update `industryAverageWage` to Object Type

**Feature**: `036-industry-average-wage`  
**Date**: 2026-05-12

---

## 1. Changed Entity: `IndustryOverview`

### 1.1 Before (current)

```typescript
// src/types/industryTypes.ts
export interface IndustryOverview {
  turnoverRate: { rate: string; month: string; year: number };
  avgTurnover: { rate: number; sinceYear: number };
  industryWideCostOfTurnover: { amount: number; formatted: string; year: number };
  rates: { hire: number; seperation: number };
  industryAverageWage: number; // ← flat number
}
```

### 1.2 After (new)

```typescript
// src/types/industryTypes.ts
export interface IndustryOverview {
  turnoverRate: { rate: string; month: string; year: number };
  avgTurnover: { rate: number; sinceYear: number };
  industryWideCostOfTurnover: { amount: number; formatted: string; year: number };
  rates: { hire: number; seperation: number };
  industryAverageWage: SalaryHourly; // ← reuses existing { salary: number; hourly: number }
}
```

### 1.3 Validation rules

| Rule          | Detail                                                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `salary`      | Required `number`. Displayed as formatted currency. Treat as null / show "N/A" if the object is absent (`undefined`/`null`). |
| `hourly`      | Required `number`. Present in the object for type completeness; not currently rendered in any UI component.                  |
| Object itself | Optional-chained at the call site; `null`/`undefined` safely produces `null` in the composed glance data.                    |

---

## 2. Unchanged Entities (for reference)

### 2.1 `SalaryHourly` (reused, no change)

```typescript
// src/types/industryTypes.ts — UNCHANGED
export interface SalaryHourly {
  salary: number;
  hourly: number;
}
```

### 2.2 `CompanyAtGlance.industryAverageWage` (unchanged)

```typescript
// src/types/dashboardTypes.ts — UNCHANGED
export interface CompanyAtGlance {
  // ...
  industryAverageWage: string | number | null; // receives the extracted .salary number
}
```

---

## 3. Extraction Logic Change: `RecommendationsFinchPage.tsx`

### 3.1 Before

```typescript
const industryAverageWage = industryData?.industryOverview?.industryAverageWage;
// ...
industryAverageWage: industryAverageWage ?? null,
```

### 3.2 After

```typescript
const industryAverageWage = industryData?.industryOverview?.industryAverageWage?.salary;
// ...
industryAverageWage: industryAverageWage ?? null,
```

The only change is appending `.salary` to the optional chain. The composed `companyGlanceData` object and all downstream components remain identical.

---

## 4. Test Fixture Change: `RecommendationsFinchPage.test.tsx`

### 4.1 Fixture in `"displays formatted industryAverageWage from useIndustry hook"` test

#### Before

```typescript
vi.mocked(useIndustry).mockReturnValue({
  isLoading: false,
  data: {
    industryOverview: {
      industryAverageWage: 45000, // ← flat number
      turnoverRate: { rate: "15%", month: "Jan", year: 2025 },
      avgTurnover: { rate: 15, sinceYear: 2020 },
      industryWideCostOfTurnover: { amount: 50000, formatted: "$50,000", year: 2025 },
      rates: { hire: 10, seperation: 8 },
    },
  } as unknown as IndustryData,
  error: null,
  isLoaded: true,
});
```

#### After

```typescript
vi.mocked(useIndustry).mockReturnValue({
  isLoading: false,
  data: {
    industryOverview: {
      industryAverageWage: { salary: 45000, hourly: 21.63 }, // ← object shape
      turnoverRate: { rate: "15%", month: "Jan", year: 2025 },
      avgTurnover: { rate: 15, sinceYear: 2020 },
      industryWideCostOfTurnover: { amount: 50000, formatted: "$50,000", year: 2025 },
      rates: { hire: 10, seperation: 8 },
    },
  } as unknown as IndustryData,
  error: null,
  isLoaded: true,
});
```

The assertion `expect(screen.getByText("$45,000")).toBeInTheDocument()` continues to pass because `salary: 45000` is extracted and formatted identically.

---

## 5. State Transitions (N/A)

This feature has no state machine or async transitions to model. The change is purely a type and extraction update on already-fetched data.

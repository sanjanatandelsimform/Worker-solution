# Data Model: Rename Seasonal → Other in Workforce Demographics

**Feature**: `034-rename-seasonal-to-other`  
**Phase**: 1 — Design  
**Date**: 2026-05-07

## Affected Types

### `EmploymentType` (local type in WorkforceDemographics.tsx and WorkforcePage.tsx)

**Before**:

```ts
type EmploymentType = "fullTime" | "partTime" | "seasonal";
```

**After**:

```ts
type EmploymentType = "fullTime" | "partTime" | "other";
```

**Used in**:

- `WorkforceDemographicsProps.selectedEmploymentType`
- `WorkforceDemographicsProps.setSelectedEmploymentType`
- `WorkforcePage.tsx` local state type
- `useWorkforceDemographicsConfig` parameter type

---

### `EmploymentTypeEntry` (in `src/types/workforceTypes.ts`)

Represents a single row from the backend `demographics.employmentType` array.

**Before**:

```ts
export interface EmploymentTypeEntry {
  department: string;
  fullTime: string;
  partTime: string;
  seasonal: string; // ← rename
}
```

**After**:

```ts
export interface EmploymentTypeEntry {
  department: string;
  fullTime: string;
  partTime: string;
  other: string; // ← matches backend key
}
```

**Validation rules**: Values are percentage strings (e.g. `"5%"`). The `parsePercentage()` utility strips `%` and converts to number — no change needed there.

---

### `AgeBreakdownEntry` (in `src/types/workforceTypes.ts`)

Represents a single age-group row from the backend `demographics.employmentBreakdownByAge` array.

**Before**:

```ts
export interface AgeBreakdownEntry {
  ageGroup: string;
  fullTime: number;
  partTime: number;
  seasonal: number; // ← rename
}
```

**After**:

```ts
export interface AgeBreakdownEntry {
  ageGroup: string;
  fullTime: number;
  partTime: number;
  other: number; // ← matches backend key
}
```

**Validation rules**: Values are raw counts or percentages (number). No parsing change needed.

---

## Donut Chart Config Object (derived, not persisted)

The third donut chart entry built inside `useWorkforceDemographicsConfig` changes as follows:

**Before**:

```ts
{
  id: "seasonal",
  label: "Seasonal",
  percentage: parsePercentage(selectedDeptData.seasonal),
  progressColor: "color-ws-progress-turnery",
  backgroundColor: "bg-ws-progress-turnery",
}
```

**After**:

```ts
{
  id: "other",
  label: "Other",
  percentage: parsePercentage(selectedDeptData.other),
  progressColor: "color-ws-progress-turnery",
  backgroundColor: "bg-ws-progress-turnery",
}
```

Colors are unchanged. Only `id`, `label`, and the data-access key change.

---

## Employment Type Dropdown Items (UI constant)

**Before**:

```ts
const employmentTypeItems = [
  { id: "fullTime", label: "Full Time" },
  { id: "partTime", label: "Part Time" },
  { id: "seasonal", label: "Seasonal" },
];
```

**After**:

```ts
const employmentTypeItems = [
  { id: "fullTime", label: "Full Time" },
  { id: "partTime", label: "Part Time" },
  { id: "other", label: "Other" },
];
```

---

## State Transitions

The `selectedEmploymentType` state in `WorkforcePage` starts at `"fullTime"` (initial value unchanged). Users can select `"fullTime"`, `"partTime"`, or `"other"`. The selected value is passed to `useWorkforceDemographicsConfig` which uses it as a key into `AgeBreakdownEntry` to drive the progress bars. No state persistence — component-level React state only.

---

## Entity Relationships

```
WorkforcePage
  └─ selectedEmploymentType: EmploymentType  ←── "fullTime" | "partTime" | "other"
       │
       ▼
  useWorkforceDemographicsConfig(selectedDepartment, selectedEmploymentType)
       │
       ├─ donutChartsConfig ←── reads EmploymentTypeEntry.{fullTime, partTime, other}
       │
       └─ ageBreakdownConfig ←── reads AgeBreakdownEntry[selectedEmploymentType]
            │
            ▼
       WorkforceDemographics
         ├─ <DonutChart> ×3  (3rd shows "Other")
         └─ <InlineProgressBar> per age group  (values from entry.other when type="other")
```

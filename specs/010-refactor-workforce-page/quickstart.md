# Quickstart: Refactor WorkforcePage into Smaller Modules

**Feature**: `010-refactor-workforce-page`  
**Branch**: `009-workforce-tab-api`  
**Date**: 2026-04-15

---

## Overview

This guide walks through the exact steps to break `WorkforcePage.tsx` (~1,100 lines) into 6 smaller files with zero behavioral change. Follow the steps in order — each step is independently verifiable.

---

## Prerequisites

```bash
git branch --show-current   # must be: 009-workforce-tab-api
pnpm run type-check          # must pass before you start
```

---

## Step 1 — Create `workforceUtils.ts`

**File**: `src/pages/workforce/workforceUtils.ts`

Extract the `parsePercentage` helper from inside `WorkforcePage` and place it here.

```typescript
/**
 * Parses a percentage string from the workforce API.
 * Strips "%" and returns a number. Returns 0 for "N/A" or any invalid input.
 *
 * @example parsePercentage("45%") // 45
 * @example parsePercentage("N/A") // 0
 */
export const parsePercentage = (value: string): number => {
  const num = parseFloat(value.replace("%", ""));
  return isNaN(num) ? 0 : num;
};
```

**Verify**: `pnpm run type-check` — no new errors.

---

## Step 2 — Create `WorkforceSkeletons.tsx`

**File**: `src/pages/workforce/WorkforceSkeletons.tsx`

Move all 8 skeleton components out of `WorkforcePage.tsx` into this file. Change them from `const X = () =>` (local) to `export const X = () =>` (named exports). Remove the `"use client"` directive if present (not needed in this Vite project).

Skeletons to move:

- `OverviewCardSkeleton`
- `WagesCardSkeleton`
- `ProgressCardSkeleton`
- `ProgressCardSkeletonOne`
- `ProgressCardSkeletonFour`
- `DonutChartSkeleton`
- `BreakDownCardSkeleton`
- `BreakDownChartSkeleton`

The file needs only: `import React from "react";` (or no import if already using automatic JSX transform).

**Verify**: `pnpm run type-check` — no new errors.

---

## Step 3 — Create `WorkforceOverview.tsx`

**File**: `src/pages/workforce/WorkforceOverview.tsx`

### Props contract

```typescript
interface OverviewCardConfig {
  id: string;
  title: string;
  count: string;
  tooltipText: string;
  getDescriptionText: () => string;
  getCountClass: () => string;
}

interface WorkforceOverviewProps {
  isLoading: boolean;
  overviewCardsConfig: OverviewCardConfig[];
  employeeCardsConfig: OverviewCardConfig[];
}
```

### Content to move

- The 4-column `overviewCardsConfig` grid (with `<OverviewCardSkeleton />` fallback)
- The 3-column `employeeCardsConfig` grid (currently empty array — keep the JSX)
- The "Did you know?" banner (`bg-ws-light-teal-50` block with `didHeroImg`)

### Imports this file needs

```typescript
import StaticCard from "@/pages/recommendations/StaticCard";
import { OverviewCardSkeleton } from "@/pages/workforce/WorkforceSkeletons";
import didHeroImg from "@/assets/employees-reported.jpg";
```

### Export

```typescript
/** Renders the Workforce Information overview stat cards and "Did you know?" banner. */
export default function WorkforceOverview({ isLoading, overviewCardsConfig, employeeCardsConfig }: WorkforceOverviewProps) { ... }
```

**Verify**: `pnpm run type-check` — no new errors.

---

## Step 4 — Create `WorkforceParticipation.tsx`

**File**: `src/pages/workforce/WorkforceParticipation.tsx`

### Props contract

```typescript
import type { ProgressItem } from "@/pages/benchmark/ProgressCard";

interface ParticipationCardConfig {
  id: string;
  title: string;
  count: string;
  countIcon: React.ReactNode;
}

interface WorkforceParticipationProps {
  isLoading: boolean;
  participationCardsConfig: ParticipationCardConfig[];
  benefitsItems: ProgressItem[];
  retirementItems: ProgressItem[];
  insuranceItems: ProgressItem[];
}
```

### Content to move

The entire "Participation Breakdown" section:

- Section heading + description paragraph
- `grid grid-cols-2 xl:grid-cols-4` participation count cards (with `<WagesCardSkeleton>`)
- `<ProgressCard title="Benefits" ...>` block (with `<ProgressCardSkeleton>`)
- `<ProgressCard title="Retirement" ...>` block (with `<ProgressCardSkeletonOne>`)
- `<ProgressCard title="Insurance" ...>` block (with `<ProgressCardSkeletonFour>`)

The `sections` prop passed to each `<ProgressCard>` will be built from the already-computed `benefitsItems`, `retirementItems`, `insuranceItems` arrays received via props.

### In `WorkforcePage` (parent), compute these arrays:

```typescript
const benefitsItems: ProgressItem[] = [
  {
    label: "FSA",
    percentage: parsePercentage(participationSection?.benefits.FSA ?? "0"),
    progressColor: "bg-ws-navy-300",
  },
  {
    label: "Wellness",
    percentage: parsePercentage(participationSection?.benefits.wellness ?? "0"),
    progressColor: "bg-ws-navy-300",
  },
  {
    label: "Employee Assist",
    percentage: parsePercentage(participationSection?.benefits.EAP ?? "0"),
    progressColor: "bg-ws-navy-300",
  },
];
const retirementItems: ProgressItem[] = [
  {
    label: "401k",
    percentage: parsePercentage(participationSection?.retirement["401k"] ?? "0"),
    progressColor: "bg-ws-light-teal-400",
  },
];
const insuranceItems: ProgressItem[] = [
  {
    label: "Health",
    percentage: parsePercentage(participationSection?.insurance.health ?? "0"),
    progressColor: "bg-ws-light-teal-300",
  },
  {
    label: "Dental",
    percentage: parsePercentage(participationSection?.insurance.dental ?? "0"),
    progressColor: "bg-ws-light-teal-300",
  },
  {
    label: "Vision",
    percentage: parsePercentage(participationSection?.insurance.vision ?? "0"),
    progressColor: "bg-ws-light-teal-300",
  },
  {
    label: "Life",
    percentage: parsePercentage(participationSection?.insurance.life ?? "0"),
    progressColor: "bg-ws-light-teal-300",
  },
];
```

### Imports this file needs

```typescript
import StaticCard from "@/pages/recommendations/StaticCard";
import ProgressCard from "@/pages/benchmark/ProgressCard";
import type { ProgressItem } from "@/pages/benchmark/ProgressCard";
import {
  WagesCardSkeleton,
  ProgressCardSkeleton,
  ProgressCardSkeletonOne,
  ProgressCardSkeletonFour,
} from "@/pages/workforce/WorkforceSkeletons";
import { GlobeIcon } from "@/assets/icons/Globe";
import { EnrolledIcon } from "@/assets/icons/EnrolledIcon";
import { SavingIcon } from "@/assets/icons/SavingIcon";
import { HeartLineIcon } from "@/assets/icons/HeartLineIcon";
```

> Note: The icons are only needed if the `ParticipationCardConfig` interface uses `countIcon` as a pre-built `React.ReactNode`. Since the `countIcon` is passed as a prop (pre-built in parent), the section file does **not** need icon imports — the parent builds the icons and passes them in `participationCardsConfig`.

### Export

```typescript
/** Renders the Participation Breakdown section including enrollment counts and benefit participation rates. */
export default function WorkforceParticipation({ isLoading, participationCardsConfig, benefitsItems, retirementItems, insuranceItems }: WorkforceParticipationProps) { ... }
```

**Verify**: `pnpm run type-check` — no new errors.

---

## Step 5 — Create `WorkforceDemographics.tsx`

**File**: `src/pages/workforce/WorkforceDemographics.tsx`

### Module-level constant (static)

```typescript
const employmentTypeItems = [
  { id: "fullTime", label: "Full Time" },
  { id: "partTime", label: "Part Time" },
  { id: "seasonal", label: "Seasonal" },
] as const satisfies { id: string; label: string }[];
```

### Props contract

```typescript
interface DemographicsCardConfig {
  id: string;
  title: string;
  count: string;
  tooltipText: string;
  getCountClass: () => string;
}

interface DonutChartConfig {
  id: string;
  label: string;
  percentage: number;
  progressColor: string;
  backgroundColor: string;
}

interface AgeBreakdownConfig {
  id: string;
  label: string;
  value: number;
  customColor: string;
}

interface DropdownItem {
  id: string;
  label: string;
}

interface WorkforceDemographicsProps {
  isLoading: boolean;
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
  selectedEmploymentType: "fullTime" | "partTime" | "seasonal";
  setSelectedEmploymentType: (type: "fullTime" | "partTime" | "seasonal") => void;
  demographicsCardsConfig: DemographicsCardConfig[];
  donutChartsConfig: DonutChartConfig[];
  ageBreakdownConfig: AgeBreakdownConfig[];
  departmentItems: DropdownItem[];
}
```

### Content to move

The entire "Demographics" section:

- Section heading, description, department `<Select>` dropdown
- 2-column gender `<StaticCard>` grid (with `<OverviewCardSkeleton>`)
- "Employment Type" card with 3 `<DonutChart>` rings (with `<DonutChartSkeleton>`)
- "Employment Breakdown by Age" card with employment type `<Select>` and `<ProgressBar>` rows (with `<BreakDownCardSkeleton>`)

### Imports this file needs

```typescript
import StaticCard from "@/pages/recommendations/StaticCard";
import { Select } from "@/components/base/select/select";
import { Label } from "@/components/base/input/label";
import DonutChart from "@/pages/workforce/EmployTypeChart";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import {
  OverviewCardSkeleton,
  DonutChartSkeleton,
  BreakDownCardSkeleton,
} from "@/pages/workforce/WorkforceSkeletons";
```

### Export

```typescript
/** Renders the Demographics section: gender breakdown, employment type charts, and age breakdown. */
export default function WorkforceDemographics({ isLoading, selectedDepartment, setSelectedDepartment, ... }: WorkforceDemographicsProps) { ... }
```

**Verify**: `pnpm run type-check` — no new errors.

---

## Step 6 — Create `WorkforceCompensation.tsx`

**File**: `src/pages/workforce/WorkforceCompensation.tsx`

### Props contract

```typescript
import type { TableColumn } from "@/components/base/table";

interface CompensationCardConfig {
  id: string;
  title: string;
  count: string;
  tooltipText: string;
  getCountClass: () => string;
}

interface SalaryBreakdownCardConfig {
  id: string;
  title: string;
  count: string;
  tooltipText: string;
  getCountClass: () => string;
}

interface DropdownItem {
  id: string;
  label: string;
}

type ChartItem = {
  label: string;
  min: number;
  boxStart: number;
  boxEnd: number;
  max: number;
};

interface WorkforceCompensationProps {
  isLoading: boolean;
  selectedWorkforceDept: string;
  setSelectedWorkforceDept: (dept: string) => void;
  compensationCardsConfig: CompensationCardConfig[];
  salaryBreakdownCardsConfig: SalaryBreakdownCardConfig[];
  workforceDepartmentItems: DropdownItem[];
  columns: TableColumn[];
  users: Record<string, string>[];
  columnsOne: TableColumn[];
  salary: Record<string, string>[];
  salaryChartData: ChartItem[];
}
```

### Content to move

The entire "Compensation" section:

- Section heading and description
- 3-column `compensationCardsConfig` grid (with `<OverviewCardSkeleton>`)
- "Workforce Breakdown" sub-section: department `<Select>`, `<Table>` with `users`/`columns`, or empty state image
- "Benefits Cost Breakdown" heading
- 2-column `salaryBreakdownCardsConfig` grid (with `<OverviewCardSkeleton>`)
- `<SalaryChart data={salaryChartData}>` (with `<BreakDownChartSkeleton>`)
- `<Table data={salary} columns={columnsOne}>` or empty state image

### Key: pre-compute `salaryChartData` in parent

```typescript
const salaryChartData = (compensationSection?.benefitsCost.graph ?? []).map(g => ({
  label: g.salaryRange,
  min: g.min,
  boxStart: g.min,
  boxEnd: g.max,
  max: g.max,
}));
```

### Imports this file needs

```typescript
import StaticCard from "@/pages/recommendations/StaticCard";
import { Select } from "@/components/base/select/select";
import { Label } from "@/components/base/input/label";
import { Table } from "@/components/base/table";
import type { TableColumn } from "@/components/base/table";
import SalaryChart from "@/pages/workforce/SalaryChart";
import emptyStateWorkforce from "@/assets/placeholder.svg";
import { OverviewCardSkeleton, BreakDownChartSkeleton } from "@/pages/workforce/WorkforceSkeletons";
```

### Export

```typescript
/** Renders the Compensation section: salary stats, workforce breakdown table, benefits cost breakdown, and salary chart. */
export default function WorkforceCompensation({ isLoading, selectedWorkforceDept, ... }: WorkforceCompensationProps) { ... }
```

**Verify**: `pnpm run type-check` — no new errors.

---

## Step 7 — Trim `WorkforcePage.tsx`

Now that all section components exist:

1. Replace all four major section JSX blocks with calls to the section components.
2. Remove the 8 skeleton `const` definitions (now in `WorkforceSkeletons.tsx`).
3. Remove the `parsePercentage` definition (now in `workforceUtils.ts`); import it instead.
4. Remove the `employmentTypeItems` array (now in `WorkforceDemographics.tsx`).
5. Keep: all `useState`, all `useAppSelector` calls, all config array computations, page header h2/p, `<ErrorMessage>`, footer disclaimer, `<GetInTouchModal>`.

Import the new sections:

```typescript
import WorkforceOverview from "@/pages/workforce/WorkforceOverview";
import WorkforceParticipation from "@/pages/workforce/WorkforceParticipation";
import WorkforceDemographics from "@/pages/workforce/WorkforceDemographics";
import WorkforceCompensation from "@/pages/workforce/WorkforceCompensation";
import { parsePercentage } from "@/pages/workforce/workforceUtils";
```

**Target**: `WorkforcePage.tsx` should be under 150 lines.

**Verify**:

```bash
pnpm run type-check   # zero errors
pnpm lint:fix         # zero new warnings
```

---

## Step 8 — Smoke Test

```bash
pnpm dev
```

1. Navigate to the `/dashboard` route and then to the Workforce tab.
2. Verify the page loads with the correct layout — 4 overview cards, "Did you know?" banner, Participation section, Demographics section (with working dropdowns), Compensation section.
3. Change the Department dropdown in Demographics — donut charts and age breakdown update.
4. Change Employment Type in Demographics — age breakdown bars update.
5. Change Department in Compensation / Workforce Breakdown — table columns switch from department view to job-title view.
6. Confirm loading skeletons appear if you clear Redux state and refresh.

---

## File Summary

| File                                             | New / Modified     | Lines (approx) |
| ------------------------------------------------ | ------------------ | -------------- |
| `src/pages/workforce/workforceUtils.ts`          | New                | ~10            |
| `src/pages/workforce/WorkforceSkeletons.tsx`     | New                | ~110           |
| `src/pages/workforce/WorkforceOverview.tsx`      | New                | ~80            |
| `src/pages/workforce/WorkforceParticipation.tsx` | New                | ~110           |
| `src/pages/workforce/WorkforceDemographics.tsx`  | New                | ~130           |
| `src/pages/workforce/WorkforceCompensation.tsx`  | New                | ~170           |
| `src/pages/workforce/WorkforcePage.tsx`          | Modified (trimmed) | < 150          |

**Total line count after**: ~760 lines across 7 files vs. 1,100 in one file.  
No other files are modified.

# Data Model: Refactor WorkforcePage into Smaller Modules

**Feature**: `010-refactor-workforce-page`  
**Branch**: `009-workforce-tab-api`  
**Phase**: Phase 1 — Design  
**Date**: 2026-04-15

---

## Overview

This document defines the TypeScript prop interfaces for every new module produced by this refactoring. No new API types are introduced — all data shapes derive from the existing `WorkforceResponse` type in `src/types/workforceTypes.ts` and the existing Redux selectors in `src/store/selectors/workforceSelectors.ts`.

All interfaces below are defined **inline** in the section `.tsx` file that owns them (confirmed in clarification Q3).

---

## 1. `workforceUtils.ts`

**Location**: `src/pages/workforce/workforceUtils.ts`

```typescript
/**
 * Parses a percentage string from the workforce API.
 * Strips "%" and returns a number. Returns 0 for "N/A" or invalid input.
 *
 * @example parsePercentage("45%") // 45
 * @example parsePercentage("N/A") // 0
 */
export const parsePercentage = (value: string): number => {
  const num = parseFloat(value.replace("%", ""));
  return isNaN(num) ? 0 : num;
};
```

No other exports.

---

## 2. `WorkforceSkeletons.tsx`

**Location**: `src/pages/workforce/WorkforceSkeletons.tsx`

All exports are named (not default) — they are internal building blocks, not routable components.

```typescript
// Named exports
export const OverviewCardSkeleton: React.FC;
export const WagesCardSkeleton: React.FC;
export const ProgressCardSkeleton: React.FC;
export const ProgressCardSkeletonOne: React.FC;
export const ProgressCardSkeletonFour: React.FC;
export const DonutChartSkeleton: React.FC;
export const BreakDownCardSkeleton: React.FC;
export const BreakDownChartSkeleton: React.FC;
```

All are zero-prop stateless components returning JSX (no interface needed).

---

## 3. `WorkforceOverview.tsx`

**Location**: `src/pages/workforce/WorkforceOverview.tsx`

### Inline interfaces

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

### Default export

```typescript
export default function WorkforceOverview(props: WorkforceOverviewProps): JSX.Element;
```

### Renders

- 4-column grid of `<StaticCard>` (overview) or skeleton
- 3-column grid of `<StaticCard>` (employee — currently empty config array)
- "Did you know?" banner with `didHeroImg`

### No state, no Redux imports.

---

## 4. `WorkforceParticipation.tsx`

**Location**: `src/pages/workforce/WorkforceParticipation.tsx`

### Inline interfaces

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

### Default export

```typescript
export default function WorkforceParticipation(props: WorkforceParticipationProps): JSX.Element;
```

### Renders

- Section heading and description text
- 2×4 grid of participation count `<StaticCard>` or `<WagesCardSkeleton>`
- `<ProgressCard title="Benefits">` with `benefitsItems`
- `<ProgressCard title="Retirement">` with `retirementItems`
- `<ProgressCard title="Insurance">` with `insuranceItems`
- or corresponding `<ProgressCardSkeleton>` variants while loading

### No state, no Redux imports.

---

## 5. `WorkforceDemographics.tsx`

**Location**: `src/pages/workforce/WorkforceDemographics.tsx`

### Inline interfaces

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
  // Filter state (owned by parent, passed down)
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
  selectedEmploymentType: "fullTime" | "partTime" | "seasonal";
  setSelectedEmploymentType: (type: "fullTime" | "partTime" | "seasonal") => void;
  // Pre-computed config arrays
  demographicsCardsConfig: DemographicsCardConfig[];
  donutChartsConfig: DonutChartConfig[];
  ageBreakdownConfig: AgeBreakdownConfig[];
  departmentItems: DropdownItem[];
}
```

### Module-level constant (static, not a prop)

```typescript
// Defined inside WorkforceDemographics.tsx at module scope
const employmentTypeItems: DropdownItem[] = [
  { id: "fullTime", label: "Full Time" },
  { id: "partTime", label: "Part Time" },
  { id: "seasonal", label: "Seasonal" },
];
```

### Default export

```typescript
export default function WorkforceDemographics(props: WorkforceDemographicsProps): JSX.Element;
```

### Renders

- Section heading, description, department `<Select>` dropdown
- Gender 2-column `<StaticCard>` grid or skeleton
- "Employment Type" card with 3 `<DonutChart>` or `<DonutChartSkeleton>`
- "Employment Breakdown by Age" card with employment type `<Select>` and `<ProgressBar>` rows or `<BreakDownCardSkeleton>`

### No Redux imports. Receives filter state callbacks from parent.

---

## 6. `WorkforceCompensation.tsx`

**Location**: `src/pages/workforce/WorkforceCompensation.tsx`

### Inline interfaces

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
  // Workforce breakdown filter (owned by parent)
  selectedWorkforceDept: string;
  setSelectedWorkforceDept: (dept: string) => void;
  // Pre-computed config arrays
  compensationCardsConfig: CompensationCardConfig[];
  salaryBreakdownCardsConfig: SalaryBreakdownCardConfig[];
  workforceDepartmentItems: DropdownItem[];
  // Table data (pre-computed in parent)
  columns: TableColumn[];
  users: Record<string, string>[];
  columnsOne: TableColumn[];
  salary: Record<string, string>[];
  // Chart data (pre-computed in parent)
  salaryChartData: ChartItem[];
}
```

### Default export

```typescript
export default function WorkforceCompensation(props: WorkforceCompensationProps): JSX.Element;
```

### Renders

- Section heading and description
- 3-column compensation stat `<StaticCard>` grid or skeleton
- "Workforce Breakdown" sub-section with department `<Select>` and `<Table>` (or empty state) or loading skeleton
- "Benefits Cost Breakdown" sub-section heading
- 2-column salary breakdown `<StaticCard>` grid or skeleton
- `<SalaryChart>` or `<BreakDownChartSkeleton>`
- Benefits cost `<Table>` (salary data) or empty state

### No Redux imports.

---

## 7. Refactored `WorkforcePage.tsx`

**Location**: `src/pages/workforce/WorkforcePage.tsx` (trimmed)

### Responsibilities after refactoring

```typescript
export default function WorkforcePage(): JSX.Element {
  // ── State ──────────────────────────────────────────────────
  const [isGetInTouchModalOpen, setIsGetInTouchModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedWorkforceDept, setSelectedWorkforceDept] = useState<string>("all");
  const [selectedEmploymentType, setSelectedEmploymentType] =
    useState<"fullTime" | "partTime" | "seasonal">("fullTime");

  // ── Redux selectors ─────────────────────────────────────────
  const isLoadingCards = useAppSelector(selectWorkforceLoading);
  const workforceError = useAppSelector(selectWorkforceError);
  const workforceSection = useAppSelector(selectWorkforceSection);
  const participationSection = useAppSelector(selectParticipationSection);
  const demographicsSection = useAppSelector(selectDemographicsSection);
  const compensationSection = useAppSelector(selectCompensationSection);

  // ── Config arrays (computed here, passed as props) ──────────
  // overviewCardsConfig, employeeCardsConfig
  // participationCardsConfig, benefitsItems, retirementItems, insuranceItems
  // departmentItems, demographicsCardsConfig, donutChartsConfig, ageBreakdownConfig
  // workforceDepartmentItems, columns, users, columnsOne, salary, salaryChartData
  // compensationCardsConfig, salaryBreakdownCardsConfig

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="bg-ws-base-white py-10 px-6 space-y-6 shadow-xl rounded-b-xl">
      <div>  {/* Page header */} </div>
      {workforceError && <ErrorMessage ... />}

      <WorkforceOverview isLoading={...} overviewCardsConfig={...} employeeCardsConfig={...} />
      <WorkforceParticipation isLoading={...} participationCardsConfig={...}
        benefitsItems={...} retirementItems={...} insuranceItems={...} />
      <WorkforceDemographics isLoading={...} selectedDepartment={...}
        setSelectedDepartment={...} selectedEmploymentType={...}
        setSelectedEmploymentType={...} demographicsCardsConfig={...}
        donutChartsConfig={...} ageBreakdownConfig={...} departmentItems={...} />
      <WorkforceCompensation isLoading={...} selectedWorkforceDept={...}
        setSelectedWorkforceDept={...} compensationCardsConfig={...}
        salaryBreakdownCardsConfig={...} workforceDepartmentItems={...}
        columns={...} users={...} columnsOne={...} salary={...}
        salaryChartData={...} />

      <div>  {/* Footer disclaimer */} </div>
      <GetInTouchModal isOpen={isGetInTouchModalOpen} onClose={...} />
    </div>
  );
}
```

**Target size**: < 150 lines (SC-001).

---

## Entity Relationships

```
WorkforcePage (orchestrator)
├── owns: all useState, all useAppSelector calls
├── computes: all config arrays using parsePercentage from workforceUtils.ts
└── renders:
    ├── WorkforceOverview      (props: loading + 2 config arrays)
    ├── WorkforceParticipation (props: loading + 4 computed arrays)
    ├── WorkforceDemographics  (props: loading + 2 filter state pairs + 4 config arrays)
    └── WorkforceCompensation  (props: loading + 1 filter state pair + 7 computed arrays)

workforceUtils.ts
└── exports: parsePercentage (used only by WorkforcePage to compute config arrays)

WorkforceSkeletons.tsx
└── exports: 8 named skeleton components (used by section modules)
```

---

## State Transitions

This refactoring introduces no new state. Existing state flow:

```
Redux store
  └── workforceSlice (workforce.data / loading / error)
        ├── selectWorkforceLoading  ──► WorkforcePage: isLoadingCards ──► all sections via isLoading prop
        ├── selectWorkforceError    ──► WorkforcePage: renders <ErrorMessage>
        ├── selectWorkforceSection  ──► WorkforcePage: computes overviewCardsConfig
        ├── selectParticipationSection ─► WorkforcePage: computes participationCardsConfig, benefits/retirement/insurance items
        ├── selectDemographicsSection  ─► WorkforcePage: computes demographicsCardsConfig, donutChartsConfig, ageBreakdownConfig, departmentItems
        └── selectCompensationSection  ─► WorkforcePage: computes compensationCardsConfig, salaryBreakdownCardsConfig, table data, chart data

Local UI state (WorkforcePage)
  ├── selectedDepartment          ──► WorkforceDemographics (as prop + setter)
  ├── selectedWorkforceDept       ──► WorkforceCompensation (as prop + setter)
  ├── selectedEmploymentType      ──► WorkforceDemographics (as prop + setter)
  └── isGetInTouchModalOpen       ──► GetInTouchModal (stays in WorkforcePage)
```

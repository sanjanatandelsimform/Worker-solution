# Data Model: Dashboard Workforce Tab API Integration

**Branch**: `009-workforce-tab-api` | **Date**: 2026-04-14

---

## TypeScript Interfaces

File: `src/types/workforceTypes.ts`

### Top-Level Response

```typescript
/** Complete response from GET /api/v1/dashboard/workforce */
export interface WorkforceResponse {
  workforce: WorkforceOverview;
  participation: Participation;
  demographics: Demographics;
  compensation: Compensation;
}
```

### Workforce Overview

```typescript
/** High-level workforce headcount and cost metrics */
export interface WorkforceOverview {
  totalWorkforce: number;
  enrolledBenefits: number;
  avgEmployeeCost: number;
  employerCostPerEmployee: number;
}
```

### Participation

```typescript
/** Benefits participation rates and breakdowns */
export interface Participation {
  totalWorkforce: number;
  enrolledBenefits: number;
  /** e.g. "64%" */
  retirementEnrollment: string;
  /** e.g. "78%" */
  healthcareEnrollment: string;
  benefits: BenefitsEnrollment;
  retirement: RetirementEnrollment;
  insurance: InsuranceEnrollment;
}

/** FSA / Wellness / EAP enrollment — string percentage or "N/A" */
export interface BenefitsEnrollment {
  FSA: string;
  wellness: string;
  EAP: string;
}

/** Retirement plan enrollment rates */
export interface RetirementEnrollment {
  "401k": string;
}

/** Insurance enrollment rates */
export interface InsuranceEnrollment {
  health: string;
  dental: string;
  vision: string;
  life: string;
}
```

### Demographics

```typescript
/** Workforce demographic breakdown */
export interface Demographics {
  /**
   * Employment type split by department.
   * @note "employementType" spelling intentionally mirrors the backend schema typo.
   */
  employementType: EmploymentTypeEntry[];
  gender: GenderBreakdown;
  employmentBreakdownByAge: AgeBreakdownEntry[];
}

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

export interface GenderBreakdown {
  /** e.g. "55%" */
  men: string;
  /** e.g. "40%" */
  women: string;
}

export interface AgeBreakdownEntry {
  /** e.g. "> 30" | "30 - 40" | "40 - 50" | "50 - 60" | "60+" */
  ageGroup: string;
  fullTime: number;
  partTime: number;
  seasonal: number;
}
```

### Compensation

```typescript
/** Compensation, workforce breakdown, and benefits cost data */
export interface Compensation {
  salaryBreakdown: SalaryBreakdown;
  workforceBreakdown: WorkforceBreakdown;
  benefitsCost: BenefitsCost;
}

export interface SalaryBreakdown {
  medianSalary: number;
  avgSalary: number;
  avgHourlyRate: number;
}

export interface WorkforceBreakdown {
  departments: Department[];
}

export interface Department {
  id: string;
  label: string;
  empNumber: number;
  partTime: number;
  fullTime: number;
  salaryRange: string;
  /** Job title sub-rows stored in state but NOT rendered (out of scope for this feature) */
  jobTitles: JobTitle[];
}

export interface JobTitle {
  jobTitle: string;
  totalInRole: number;
  partTime: number;
  fullTime: number;
  salaryRange: string;
}

export interface BenefitsCost {
  employeeContribution: number;
  /** Pre-formatted string, e.g. "$11000/yr" */
  employerCost: string;
  graph: BenefitsCostGraphEntry[];
  table: BenefitsCostTableRow[];
}

export interface BenefitsCostGraphEntry {
  salaryRange: string;
  min: number;
  max: number;
}

export interface BenefitsCostTableRow {
  salaryRange: string;
  avgEmployeeCostPerPaycheck: number;
  avgEmployeeCostPercentage: number;
  /** null when employer cost data is not yet available; display as "$xx.xx" */
  employerCostPerPaycheck: number | null;
}
```

### Redux State Shape

```typescript
/** Redux slice state for workforce data */
export interface WorkforceState {
  data: WorkforceResponse | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  isLoaded: boolean;
}
```

---

## Field Mapping: API Response → UI

| UI Section            | UI Element                       | API Path                                              | Notes                                                 |
| --------------------- | -------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- |
| Overview row 1        | Total Workforce count            | `workforce.totalWorkforce`                            | Format: `toLocaleString()`                            |
| Overview row 1        | Enrolled in Benefits count       | `workforce.enrolledBenefits`                          | Format: `toLocaleString()`                            |
| Overview row 1        | Avg. Employee Cost count         | `workforce.avgEmployeeCost`                           | Format: `"$" + toLocaleString()`                      |
| Overview row 2        | Employer Cost Per Employee count | `workforce.employerCostPerEmployee`                   | Format: `"$" + toLocaleString() + "/yr"`              |
| Overview row 2        | Avg. PTO Taken                   | _not in API_                                          | Display: `"--"`                                       |
| Overview row 2        | Avg. Sick Days Taken             | _not in API_                                          | Display: `"--"`                                       |
| Participation         | Eligible Employees               | `participation.totalWorkforce`                        | Format: `toLocaleString()`                            |
| Participation         | Enrolled Employees               | `participation.enrolledBenefits`                      | Format: `toLocaleString()`                            |
| Participation         | Enrolled in retirement           | `participation.retirementEnrollment`                  | Already a string ("64%")                              |
| Participation         | Enrolled in healthcare           | `participation.healthcareEnrollment`                  | Already a string ("78%")                              |
| Benefits progress     | FSA                              | `participation.benefits.FSA`                          | `parsePercentage()` → number                          |
| Benefits progress     | Wellness                         | `participation.benefits.wellness`                     | `parsePercentage()` → `0` for "N/A"                   |
| Benefits progress     | Employee Assist                  | `participation.benefits.EAP`                          | `parsePercentage()` → `0` for "N/A"                   |
| Retirement progress   | 401k                             | `participation.retirement["401k"]`                    | `parsePercentage()`                                   |
| Insurance progress    | Health                           | `participation.insurance.health`                      | `parsePercentage()`                                   |
| Insurance progress    | Dental                           | `participation.insurance.dental`                      | `parsePercentage()`                                   |
| Insurance progress    | Vision                           | `participation.insurance.vision`                      | `parsePercentage()`                                   |
| Insurance progress    | Life                             | `participation.insurance.life`                        | `parsePercentage()`                                   |
| Demographics          | Women %                          | `demographics.gender.women`                           | Already a string ("40%")                              |
| Demographics          | Men %                            | `demographics.gender.men`                             | Already a string ("55%")                              |
| Demographics          | Department dropdown              | `demographics.employementType[*].department`          | Map to `{ id, label }`                                |
| Employment type donut | Full Time %                      | `demographics.employementType[selectedDept].fullTime` | `parsePercentage()`                                   |
| Employment type donut | Part Time %                      | `demographics.employementType[selectedDept].partTime` | `parsePercentage()`                                   |
| Employment type donut | Seasonal %                       | `demographics.employementType[selectedDept].seasonal` | `parsePercentage()`                                   |
| Age breakdown         | Bar value                        | `demographics.employmentBreakdownByAge[*].fullTime`   | Numeric already                                       |
| Compensation          | Median Base Salary               | `compensation.salaryBreakdown.medianSalary`           | Format: `"$" + toLocaleString() + "/yr"`              |
| Compensation          | Average Salary                   | `compensation.salaryBreakdown.avgSalary`              | Format: `"$" + toLocaleString() + "/yr"`              |
| Compensation          | Average Hourly Wage              | `compensation.salaryBreakdown.avgHourlyRate`          | Format: `"$" + toFixed(2)`                            |
| Salary breakdown      | Employee Contribution            | `compensation.benefitsCost.employeeContribution`      | Format: `"$" + toLocaleString()`                      |
| Salary breakdown      | Employer Cost                    | `compensation.benefitsCost.employerCost`              | Already a string ("$11000/yr")                        |
| SalaryChart           | Chart data                       | `compensation.benefitsCost.graph`                     | Map: `boxStart = min, boxEnd = max`                   |
| Workforce table       | Rows                             | `compensation.workforceBreakdown.departments`         | Map: `label → department, empNumber → employeeNumber` |
| Benefits cost table   | Rows                             | `compensation.benefitsCost.table`                     | `employerCostPerPaycheck ?? "$xx.xx"`                 |

---

## SalaryChart ChartItem Shape

`SalaryChart.tsx` uses this internal type (unchanged, but now accepted as a prop):

```typescript
type ChartItem = {
  label: string; // salaryRange e.g. "30k-50k"
  min: number; // lower whisker = API min
  boxStart: number; // Q1 = API min (API does not provide quartiles)
  boxEnd: number; // Q3 = API max
  max: number; // upper whisker = API max
};
```

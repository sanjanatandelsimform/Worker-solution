/**
 * Workforce API Types
 *
 * TypeScript interfaces for the GET /api/v1/dashboard/workforce API response.
 * Based on: specs/009-workforce-tab-api/data-model.md
 * Contract: specs/009-workforce-tab-api/contracts/workforce-get.md
 * Updated: specs/012-participation-dynamic-items/contracts/workforce-participation-update.md
 */

/**
 * Complete response from GET /api/v1/dashboard/workforce endpoint
 */
export interface WorkforceResponse {
  workforce: WorkforceOverview;
  participation: Participation;
  demographics: Demographics;
  compensation: Compensation;
}

/**
 * High-level workforce headcount and cost metrics
 */
export interface WorkforceOverview {
  totalWorkforce: number;
  enrolledBenefits: number;
  avgEmployeeCost: number;
  employerCostPerEmployee: number;
}

/** A single dynamic participation line item returned by the backend */
export interface EnrollmentItem {
  /** Display label, e.g. "FSA", "401k", "Health" — controlled fully by backend */
  name: string;
  /** Enrollment percentage string, e.g. "64%" or "N/A" */
  enrollment: string;
}

/**
 * Benefits participation rates and breakdowns
 */
export interface Participation {
  totalWorkforce: number;
  enrolledBenefits: number;
  /** e.g. "64%" */
  retirementEnrollment: string;
  /** e.g. "78%" */
  healthcareEnrollment: string;
  benefits: EnrollmentItem[];
  retirement: EnrollmentItem[];
  insurance: EnrollmentItem[];
}

/**
 * Workforce demographic breakdown
 */
export interface Demographics {
  /** Employment type split by department. */
  employmentType: EmploymentTypeEntry[];
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

/**
 * Compensation, workforce breakdown, and benefits cost data
 */
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
  /** Job title sub-rows stored in state but NOT rendered in this feature release */
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

/**
 * Redux slice state shape for workforce data
 */
export interface WorkforceState {
  data: WorkforceResponse | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  isLoaded: boolean;
}

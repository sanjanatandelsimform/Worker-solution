/**
 * Industry Data Types
 *
 * TypeScript interfaces for the Industry API response and Redux slice state.
 * Based on: specs/009-industry-status-api/data-model.md
 * Contract: specs/009-industry-status-api/contracts/industry-api.yaml
 */

// ── Nested value types ─────────────────────────────────────────────────────

export interface SalaryHourly {
  salary: number;
  hourly: number;
}

// ── Industry Overview ──────────────────────────────────────────────────────

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
}

// ── Turnover Comparison ────────────────────────────────────────────────────

export interface VoluntaryInvoluntary {
  involuntary: number;
  voluntary: number;
}

export interface SeparationHiring {
  seperation: number;
  hiring: number;
}

export interface IndustryTurnoverComparison {
  turnOverRate: {
    industry: VoluntaryInvoluntary;
    company: VoluntaryInvoluntary;
  };
  seperationRate: {
    industry: SeparationHiring;
    company: SeparationHiring;
  };
}

// ── Area Median Wage ───────────────────────────────────────────────────────

export interface StateWageData {
  zipcode: string;
  city: string;
  medianLivingWage: number;
  graph: {
    state: SalaryHourly;
    national: SalaryHourly;
  };
  avgSalary: {
    salary: number;
    year: number;
  };
}

export interface AreaMedianWage {
  availableZipcodes: string[];
  nationalAvgSalary: number;
  companyMedianHourlyWage: number;
  companyGraph: SalaryHourly;
  stateData: StateWageData[];
}

// ── Housing Burden ─────────────────────────────────────────────────────────

export interface BurdenMetrics {
  metroArea: number;
  yourEmployees: number;
}

export interface HousingTenureData {
  period: {
    quarter: number;
    year: number;
  };
  burdened: BurdenMetrics;
  severelyBurdened: BurdenMetrics;
}

export interface WorkingClassGraphEntry {
  incomeCategory: string;
  label: string;
  range: string;
  burdened: number;
  severelyBurdened: number;
}

export interface WorkingClassData {
  homeOwnershipRate: number;
  medianHomeValue: number;
  medianRent: number;
  graph: WorkingClassGraphEntry[];
}

export interface HousingBurdenEntry {
  zipcode: string;
  city: string;
  owners: HousingTenureData;
  renters: HousingTenureData;
  workingClass: WorkingClassData;
}

export interface HousingBurden {
  availableZipcodes: string[];
  data: HousingBurdenEntry[];
}

// ── Root Industry Data ─────────────────────────────────────────────────────

export interface IndustryData {
  industryOverview: IndustryOverview;
  industry: IndustryTurnoverComparison;
  areaMedianWage: AreaMedianWage;
  housingBurden: HousingBurden;
}

// ── API Envelope ───────────────────────────────────────────────────────────

export interface IndustryApiResponse {
  status: boolean;
  data: IndustryData;
}

// ── Redux Slice State ──────────────────────────────────────────────────────

export interface IndustryState {
  data: IndustryData | null;
  loading: boolean;
  error: string | null;
  isLoaded: boolean;
}

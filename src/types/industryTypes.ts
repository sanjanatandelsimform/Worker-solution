/**
 * Industry Data Types
 *
 * TypeScript interfaces for the Industry API response and Redux slice state.
 * Based on: specs/009-industry-status-api/data-model.md
 * Contract: specs/009-industry-status-api/contracts/industry-api.yaml
 */


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
}

export interface IndustryInfo {
  code: string;
  name: string;
}

export interface IndustryAvgTurnover {
  involuntary: number;
  voluntary: number;
  quarter: string;
  year: number;
}

export interface CompanyTurnover {
  industry: number;
  company: number;
  year: number;
}

export interface IndustryAvgSeparation {
  seperation: number;
  hiring: number;
  quarter: string;
  year: number;
}

export interface CompanySeparation {
  seperation: number;
  hiring: number;
}

export interface IndustryTurnoverData {
  turnOverRate: {
    industryAvg: IndustryAvgTurnover;
    company: CompanyTurnover;
  };
  seperationRate: {
    industryAvg: IndustryAvgSeparation;
    company: CompanySeparation;
  };
}

// ── Turnover Comparison (legacy — keep for BenchmarkFinchPage compatibility) ──

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

export interface AreaMedianWageEntry {
  zipcode: string;
  state: string;
  medianHourlyWages: number;
  medianLivingWage: number;
  nationalAverage: number;
  graph: {
    stateAverage: SalaryHourly;
    yourCompany: SalaryHourly;
    nationalAverage: SalaryHourly;
  };
  year: number;
}

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
  nationalAvgSalary: number;
  companyMedianHourlyWage: number;
  companyGraph: SalaryHourly;
  stateData: StateWageData[];
}


export interface HousingCostBurdenYear {
  year: number;
  burdened: number;
  severelyBurdened: number;
}

export interface IncomeLevelBurden {
  burdened: number;
  severelyBurdened: number;
}

export interface WorkingClassHousingGraph {
  renters: {
    lowIncome: IncomeLevelBurden;
    moderateIncome: IncomeLevelBurden;
    medianIncome: IncomeLevelBurden;
    upperIncome: IncomeLevelBurden;
  };
  owners: {
    lowIncome: IncomeLevelBurden;
    moderateIncome: IncomeLevelBurden;
    medianIncome: IncomeLevelBurden;
    upperIncome: IncomeLevelBurden;
  };
}

export interface HousingCostEntry {
  zipcode: string;
  housingCostBurdenedOwners: HousingCostBurdenYear[];
  housingCostBurdenedRenters: HousingCostBurdenYear[];
  workingClassHousingCostBurden: {
    homeOwnershipRate: number;
    medianHomeValue: string;
    medianRent: string;
  };
  workingClassHousingGraph: WorkingClassHousingGraph;
}


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


export interface IndustryData {
  industryOverview: IndustryOverview;
  industry: IndustryInfo;
  industryTurnover: IndustryTurnoverData;
  areaMedianWage: AreaMedianWageEntry[];
  housingCost: HousingCostEntry[];
  housingBurden?: HousingBurden;
}


export interface IndustryApiResponse {
  status: boolean;
  data: IndustryData;
}

export interface IndustryState {
  data: IndustryData | null;
  loading: boolean;
  error: string | null;
  isLoaded: boolean;
}

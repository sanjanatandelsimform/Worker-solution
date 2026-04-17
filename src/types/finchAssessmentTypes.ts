// ── Payload sections ───────────────────────────────────────────────────────

export interface WorkforcePayload {
  /** API values: "work_email" | "personal_email" | "office_signs" */
  communicationMethods: string[];
  hasDesklessEmployees: boolean;
  /** API values: "car" | "train" | "bus" | "bike" | "walking" | "group_transportation" */
  commuteMethods: string[];
  /** API values: "<15min" | "15-30min" | "30-1hr" | "1hr+" */
  commuteTime: string;
}

export interface CompensationPayload {
  offersAnnualRaises: boolean;
  /** Full month name; present only when offersAnnualRaises === true */
  annualRaiseMonth?: string;
  /** Provider label e.g. "ADP"; null when not selected */
  payrollProvider: string | null;
  shiftDifferentials: boolean;
  /** API values: "cash_bonuses" | "profit_sharing" | "commissions" */
  shortTermIncentives: string[];
  /** API values: "stock_options" | "rsus" | "espps" | "deferred_compensation" | "pension_plans" */
  longTermIncentives: string[];
}

export interface BenefitsPayload {
  workWithBenefitsBroker: "Yes" | "No" | "Unsure" | null;
  /** Full month name e.g. "November"; null when not selected */
  benefitEnrollmentMonth: string | null;
  /** API values: "<6m" | "6m_1yr" | "1yr_2yr" | "2yr_4yr" | ">4yr" */
  retirementVestingPeriod: string;
  retirementPlanHasMatch: boolean;
  /** Present only when retirementPlanHasMatch is true */
  retirementMatchPercentage?: number;
  retirementAutoEnroll: boolean;
  retirementHardshipWithdrawals: boolean;
}

export interface GoalsPayload {
  /** Goal label strings e.g. ["Attract Talent", "Retain Talent"] */
  workforceGoals: string[];
  /** Static: ["Retain Talent", "Attract Talent", "Reduce Absenteeism"] */
  workforceGoalsRanking: string[];
}

// ── Top-level payload ──────────────────────────────────────────────────────

export interface FinchAssessmentPayload {
  workforce: WorkforcePayload;
  compensation: CompensationPayload;
  benefits: BenefitsPayload;
  goals: GoalsPayload;
}

// ── API response ───────────────────────────────────────────────────────────

export interface FinchAssessmentResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

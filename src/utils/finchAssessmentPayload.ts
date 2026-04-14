import { capitalise } from "@/utils/capitalise";
import type {
  FinchAssessmentPayload,
  WorkforcePayload,
  CompensationPayload,
  BenefitsPayload,
  GoalsPayload,
} from "@/types/finchAssessmentTypes";

export interface QuestionAnswer {
  [key: string]: string | string[];
}

export interface GoalsAnswer {
  selectedGoals: string[];
  topThreeGoals: string[];
}

/**
 * Assembles the four-section FinchAssessmentPayload from local form state.
 * All option IDs in the static form data arrays directly equal API values — no runtime
 * string transformation is required for option IDs. Only boolean coercion, broker ID
 * mapping, month capitalisation, and goal-ID-to-label conversion are performed here.
 */
export function buildFinchAssessmentPayload(
  answers: QuestionAnswer,
  goalsAnswers: GoalsAnswer,
  annualRaiseMonth: string,
  payrollProvider: string,
  benefitsEnrollmentMonth: string
): FinchAssessmentPayload {
  const offersAnnualRaises = answers["annual-raises"] === "yes-raises";

  const workforce: WorkforcePayload = {
    communicationMethods: (answers["benefits-updates"] as string[]) ?? [],
    hasDesklessEmployees: answers["deskless-employees"] === "yes-deskless",
    commuteMethods: (answers["commute-methods"] as string[]) ?? [],
    commuteTime: (answers["commute-duration"] as string) ?? null,
  };

  const compensation: CompensationPayload = {
    offersAnnualRaises,
    ...(offersAnnualRaises && annualRaiseMonth
      ? { annualRaiseMonth: capitalise(annualRaiseMonth) }
      : {}),
    payrollProvider: payrollProvider || null,
    shiftDifferentials: answers["shift-differentials"] === "yes-shift-diff",
    shortTermIncentives: (answers["short-term-incentives"] as string[]) ?? [],
    longTermIncentives: (answers["long-term-incentives"] as string[]) ?? [],
  };

  const brokerRaw = answers["benefits-broker"] as string | undefined;
  const brokerMap: Record<string, "Yes" | "No" | "Unsure"> = {
    "yes-broker": "Yes",
    "no-broker": "No",
    "unsure-broker": "Unsure",
  };

  const benefits: BenefitsPayload = {
    workWithBenefitsBroker: brokerRaw ? (brokerMap[brokerRaw] ?? null) : null,
    benefitEnrollmentMonth: benefitsEnrollmentMonth ? capitalise(benefitsEnrollmentMonth) : null,
    retirementVestingPeriod: (answers["retirement-vesting-period"] as string) ?? "",
    retirementAutoEnroll: answers["retirement-auto-enroll"] === "yes-autoenroll",
    retirementHardshipWithdrawals: answers["retirement-hardship-withdrawals"] === "yes-hardship",
  };

  // goal IDs are API values — send them directly, no label lookup needed
  const goals: GoalsPayload = {
    workforceGoals: [...goalsAnswers.selectedGoals],
    workforceGoalsRanking: [...goalsAnswers.topThreeGoals],
  };

  return { workforce, compensation, benefits, goals };
}

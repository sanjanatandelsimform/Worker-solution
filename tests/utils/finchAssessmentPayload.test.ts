import { describe, it, expect } from "vitest";
import { buildFinchAssessmentPayload } from "@/utils/finchAssessmentPayload";
import type { QuestionAnswer, GoalsAnswer } from "@/utils/finchAssessmentPayload";

// Baseline helpers
const emptyAnswers: QuestionAnswer = {};
const emptyGoals: GoalsAnswer = { selectedGoals: [], topThreeGoals: [] };

describe("buildFinchAssessmentPayload", () => {
  it("passes workforce communicationMethods array through as-is", () => {
    const answers: QuestionAnswer = {
      "benefits-updates": ["work_email", "personal_email"],
    };
    const result = buildFinchAssessmentPayload(answers, emptyGoals, "", "", "");
    expect(result.workforce.communicationMethods).toEqual(["work_email", "personal_email"]);
  });

  it("coerces hasDesklessEmployees to true when answer is yes-deskless", () => {
    const answers: QuestionAnswer = { "deskless-employees": "yes-deskless" };
    const result = buildFinchAssessmentPayload(answers, emptyGoals, "", "", "");
    expect(result.workforce.hasDesklessEmployees).toBe(true);
  });

  it("coerces hasDesklessEmployees to false when answer is no-deskless", () => {
    const answers: QuestionAnswer = { "deskless-employees": "no-deskless" };
    const result = buildFinchAssessmentPayload(answers, emptyGoals, "", "", "");
    expect(result.workforce.hasDesklessEmployees).toBe(false);
  });

  it("capitalises annualRaiseMonth from lowercase month ID", () => {
    const answers: QuestionAnswer = { "annual-raises": "yes-raises" };
    const result = buildFinchAssessmentPayload(answers, emptyGoals, "january", "", "");
    expect(result.compensation.annualRaiseMonth).toBe("January");
  });

  it("omits annualRaiseMonth when offersAnnualRaises is false", () => {
    const answers: QuestionAnswer = { "annual-raises": "no-raises" };
    const result = buildFinchAssessmentPayload(answers, emptyGoals, "january", "", "");
    expect(result.compensation.annualRaiseMonth).toBeUndefined();
  });

  it("maps benefits broker option IDs to Yes/No/Unsure strings", () => {
    const yesResult = buildFinchAssessmentPayload(
      { "benefits-broker": "yes-broker" },
      emptyGoals,
      "",
      "",
      ""
    );
    expect(yesResult.benefits.workWithBenefitsBroker).toBe("Yes");

    const noResult = buildFinchAssessmentPayload(
      { "benefits-broker": "no-broker" },
      emptyGoals,
      "",
      "",
      ""
    );
    expect(noResult.benefits.workWithBenefitsBroker).toBe("No");

    const unsureResult = buildFinchAssessmentPayload(
      { "benefits-broker": "unsure-broker" },
      emptyGoals,
      "",
      "",
      ""
    );
    expect(unsureResult.benefits.workWithBenefitsBroker).toBe("Unsure");
  });

  it("submits multi-select fields as empty arrays when nothing is selected", () => {
    const result = buildFinchAssessmentPayload(emptyAnswers, emptyGoals, "", "", "");
    expect(result.workforce.communicationMethods).toEqual([]);
    expect(result.workforce.commuteMethods).toEqual([]);
    expect(result.compensation.shortTermIncentives).toEqual([]);
    expect(result.compensation.longTermIncentives).toEqual([]);
    expect(result.goals.workforceGoals).toEqual([]);
  });

  it("maps selected goal IDs (= API values) directly to workforceGoals", () => {
    const goals: GoalsAnswer = {
      selectedGoals: ["Attract Talent", "Retain Talent"],
      topThreeGoals: [],
    };
    const result = buildFinchAssessmentPayload(emptyAnswers, goals, "", "", "");
    expect(result.goals.workforceGoals).toEqual(["Attract Talent", "Retain Talent"]);
  });

  it("produces a complete payload matching FinchAssessmentPayload shape", () => {
    const answers: QuestionAnswer = {
      "benefits-updates": ["work_email"],
      "deskless-employees": "yes-deskless",
      "commute-methods": ["car"],
      "commute-duration": "15-30min",
      "annual-raises": "yes-raises",
      "shift-differentials": "yes-shift-diff",
      "short-term-incentives": ["cash_bonuses"],
      "long-term-incentives": ["stock_options"],
      "benefits-broker": "yes-broker",
      "retirement-vesting-period": "<6m",
      "retirement-auto-enroll": "yes-autoenroll",
      "retirement-hardship-withdrawals": "yes-hardship",
    };
    const goals: GoalsAnswer = {
      selectedGoals: ["Attract Talent"],
      topThreeGoals: ["Retain Talent", "Attract Talent", "Reduce Absenteeism"],
    };
    const result = buildFinchAssessmentPayload(answers, goals, "march", "ADP", "november");

    expect(result).toMatchObject({
      workforce: {
        communicationMethods: ["work_email"],
        hasDesklessEmployees: true,
        commuteMethods: ["car"],
        commuteTime: "15-30min",
      },
      compensation: {
        offersAnnualRaises: true,
        annualRaiseMonth: "March",
        payrollProvider: "ADP",
        shiftDifferentials: true,
        shortTermIncentives: ["cash_bonuses"],
        longTermIncentives: ["stock_options"],
      },
      benefits: {
        workWithBenefitsBroker: "Yes",
        benefitEnrollmentMonth: "November",
        retirementVestingPeriod: "<6m",
        retirementAutoEnroll: true,
        retirementHardshipWithdrawals: true,
      },
      goals: {
        workforceGoals: ["Attract Talent"],
        workforceGoalsRanking: ["Retain Talent", "Attract Talent", "Reduce Absenteeism"],
      },
    });
  });
});

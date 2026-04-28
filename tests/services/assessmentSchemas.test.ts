import { describe, it, expect } from "vitest";
import {
  workforceSchema,
  compensationSchema,
  benefitsSchema,
  goalsSchema,
  assessmentSchema,
} from "@/services/validation/assessmentSchemas";

// ── Valid base data builders ────────────────────────────────────────────
const validWorkforce = () => ({
  headCountSize: "50",
  benefitsUpdates: "Annually",
  desklessEmployees: true,
  commuteMoreThan15Miles: false,
  employeesResideInSameZipCodes: "Yes",
  hourlyEmployeesPercentage: 60,
  salaryEmployeesPercentage: 40,
});

const validCompensation = () => ({
  medianAnnualEarnings: "$50,000",
  offersAnnualRaises: false,
  handlesHRPayrollInHouse: "Yes",
  payrollProvider: "ADP",
});

const validBenefits = () => ({
  supplementalBenefits: ["PTO"],
  workWithBenefitsBroker: "No",
  benefitEnrollmentMonth: "January",
  offersRetirementBenefit: false,
  offersHealthInsurance: false,
});

const validGoals = () => ({
  workforceGoals: ["goal1", "goal2", "goal3"],
  workforceGoalsRanking: ["goal1", "goal2", "goal3"],
});

// ── workforceSchema ─────────────────────────────────────────────────────
describe("workforceSchema", () => {
  it("passes with valid data", () => {
    expect(workforceSchema.safeParse(validWorkforce()).success).toBe(true);
  });

  it("fails when headCountSize is empty", () => {
    const result = workforceSchema.safeParse({ ...validWorkforce(), headCountSize: "" });
    expect(result.success).toBe(false);
  });

  it("fails when hourly + salary != 100", () => {
    const result = workforceSchema.safeParse({
      ...validWorkforce(),
      hourlyEmployeesPercentage: 30,
      salaryEmployeesPercentage: 30,
    });
    expect(result.success).toBe(false);
    const issues = (result as any).error.issues;
    expect(issues.some((i: any) => i.path.includes("hourlyEmployeesPercentage"))).toBe(true);
    expect(issues.some((i: any) => i.path.includes("salaryEmployeesPercentage"))).toBe(true);
  });

  it("fails when commuteMoreThan15Miles=true but no averageCommuteTime", () => {
    const result = workforceSchema.safeParse({
      ...validWorkforce(),
      commuteMoreThan15Miles: true,
    });
    expect(result.success).toBe(false);
  });

  it("passes when commuteMoreThan15Miles=true and averageCommuteTime provided", () => {
    const result = workforceSchema.safeParse({
      ...validWorkforce(),
      commuteMoreThan15Miles: true,
      averageCommuteTime: "30 min",
    });
    expect(result.success).toBe(true);
  });

  it("fails when employeesResideInSameZipCodes=No but no locations", () => {
    const result = workforceSchema.safeParse({
      ...validWorkforce(),
      employeesResideInSameZipCodes: "No",
    });
    expect(result.success).toBe(false);
  });

  it("passes when employeesResideInSameZipCodes=No with locations", () => {
    const result = workforceSchema.safeParse({
      ...validWorkforce(),
      employeesResideInSameZipCodes: "No",
      employeeLivingZipCodes: [{ state: "CA", zipCode: "90210" }],
    });
    expect(result.success).toBe(true);
  });

  it("validates zipCode format in topWorkLocations", () => {
    const result = workforceSchema.safeParse({
      ...validWorkforce(),
      topWorkLocations: [{ state: "CA", zipCode: "ABC" }],
    });
    expect(result.success).toBe(false);
  });

  it("allows max 5 commonJobTitles", () => {
    const titles = Array.from({ length: 6 }, (_, i) => ({
      title: `Job ${i}`,
      percentage: 10,
    }));
    const result = workforceSchema.safeParse({
      ...validWorkforce(),
      commonJobTitles: titles,
    });
    expect(result.success).toBe(false);
  });
});

// ── compensationSchema ──────────────────────────────────────────────────
describe("compensationSchema", () => {
  it("passes with valid data", () => {
    expect(compensationSchema.safeParse(validCompensation()).success).toBe(true);
  });

  it("fails when offersAnnualRaises=true but no annualRaiseMonth", () => {
    const result = compensationSchema.safeParse({
      ...validCompensation(),
      offersAnnualRaises: true,
    });
    expect(result.success).toBe(false);
  });

  it("passes when offersAnnualRaises=true with annualRaiseMonth", () => {
    const result = compensationSchema.safeParse({
      ...validCompensation(),
      offersAnnualRaises: true,
      annualRaiseMonth: "March",
    });
    expect(result.success).toBe(true);
  });

  it("fails when payrollProvider=Other but no payrollProviderOther", () => {
    const result = compensationSchema.safeParse({
      ...validCompensation(),
      payrollProvider: "Other",
    });
    expect(result.success).toBe(false);
  });

  it("passes when payrollProvider=Other with payrollProviderOther", () => {
    const result = compensationSchema.safeParse({
      ...validCompensation(),
      payrollProvider: "Other",
      payrollProviderOther: "Custom Provider",
    });
    expect(result.success).toBe(true);
  });
});

// ── benefitsSchema ──────────────────────────────────────────────────────
describe("benefitsSchema", () => {
  it("passes with valid data", () => {
    expect(benefitsSchema.safeParse(validBenefits()).success).toBe(true);
  });

  it("fails when supplementalBenefits includes Other but no other text", () => {
    const result = benefitsSchema.safeParse({
      ...validBenefits(),
      supplementalBenefits: ["Other"],
    });
    expect(result.success).toBe(false);
  });

  it("passes when supplementalBenefits includes Other with text", () => {
    const result = benefitsSchema.safeParse({
      ...validBenefits(),
      supplementalBenefits: ["Other"],
      supplementalBenefitsOther: "Custom benefit",
    });
    expect(result.success).toBe(true);
  });

  it("fails when offersRetirementBenefit=true but no provider", () => {
    const result = benefitsSchema.safeParse({
      ...validBenefits(),
      offersRetirementBenefit: true,
    });
    expect(result.success).toBe(false);
  });

  it("fails when retirementProvider=Other but no other text", () => {
    const result = benefitsSchema.safeParse({
      ...validBenefits(),
      offersRetirementBenefit: true,
      retirementProvider: "Other",
    });
    expect(result.success).toBe(false);
  });

  it("fails when retirementPlanHasMatch=true but no percentage", () => {
    const result = benefitsSchema.safeParse({
      ...validBenefits(),
      offersRetirementBenefit: true,
      retirementProvider: "Fidelity",
      retirementPlanHasMatch: true,
    });
    expect(result.success).toBe(false);
  });

  it("fails when offersHealthInsurance=true but no healthPlanTypes", () => {
    const result = benefitsSchema.safeParse({
      ...validBenefits(),
      offersHealthInsurance: true,
    });
    expect(result.success).toBe(false);
  });

  it("passes full retirement + health config", () => {
    const result = benefitsSchema.safeParse({
      ...validBenefits(),
      offersRetirementBenefit: true,
      retirementProvider: "Fidelity",
      retirementPlanHasMatch: true,
      retirementMatchPercentage: 5,
      offersHealthInsurance: true,
      healthPlanTypes: ["PPO"],
    });
    expect(result.success).toBe(true);
  });
});

// ── goalsSchema ─────────────────────────────────────────────────────────
describe("goalsSchema", () => {
  it("passes with valid data", () => {
    expect(goalsSchema.safeParse(validGoals()).success).toBe(true);
  });

  it("fails when workforceGoals is empty", () => {
    const result = goalsSchema.safeParse({
      workforceGoals: [],
      workforceGoalsRanking: [],
    });
    expect(result.success).toBe(false);
  });

  it("fails when ranking has wrong count", () => {
    const result = goalsSchema.safeParse({
      workforceGoals: ["g1", "g2"],
      workforceGoalsRanking: ["g1"],
    });
    expect(result.success).toBe(false);
  });

  it("fails when ranking includes goals not in selection", () => {
    const result = goalsSchema.safeParse({
      workforceGoals: ["g1", "g2", "g3"],
      workforceGoalsRanking: ["g1", "g2", "INVALID"],
    });
    expect(result.success).toBe(false);
  });
});

// ── assessmentSchema ────────────────────────────────────────────────────
describe("assessmentSchema", () => {
  it("passes with all sections", () => {
    const result = assessmentSchema.safeParse({
      workforce: validWorkforce(),
      compensation: validCompensation(),
      benefits: validBenefits(),
      goals: validGoals(),
    });
    expect(result.success).toBe(true);
  });

  it("passes with empty object (all optional)", () => {
    expect(assessmentSchema.safeParse({}).success).toBe(true);
  });
});

import { z } from "zod";

// Base schemas for common validation patterns
const requiredString = z.string().min(1, "This field is required");
const requiredNumber = z.number({ message: "This field is required" });
const percentageSchema = z.number().min(0).max(100);
const zipCodeSchema = z.string().regex(/^\d{5}$/, "Zip code must be exactly 5 digits");

// Workforce Section Schema
export const workforceSchema = z
  .object({
    headCountSize: requiredString,
    benefitsUpdates: requiredString,
    desklessEmployees: z.boolean({ message: "This field is required" }),
    commuteMoreThan15Miles: z.boolean({ message: "This field is required" }),
    averageCommuteTime: z.string().max(100).optional(), // Changed from commuteTime array
    contractorsSeasonalEmployees: z.boolean().optional(),
    commonJobTitles: z
      .array(
        z.object({
          title: requiredString,
          percentage: percentageSchema,
        })
      )
      .max(5, "Maximum 5 job titles allowed")
      .optional(),
    hourlyEmployeesPercentage: requiredNumber.min(0).max(100),
    salaryEmployeesPercentage: requiredNumber.min(0).max(100),
    topWorkLocations: z
      .array(
        z.object({
          state: requiredString,
          zipCode: zipCodeSchema,
        })
      )
      .max(5, "Maximum 5 work locations allowed")
      .optional(),
    employeesResideInSameZipCodes: z.boolean({ message: "This field is required" }),
    employeeLivingZipCodes: z
      .array(
        z.object({
          state: requiredString,
          zipCode: zipCodeSchema,
        })
      )
      .max(5, "Maximum 5 locations allowed")
      .optional(),
    educationLevel: z.string().optional(),
    involuntaryTurnoverRate: percentageSchema.optional(),
    voluntaryTurnoverRate: percentageSchema.optional(),
  })
  .superRefine((data, ctx) => {
    // Validate sum of hourly and salary percentages equals 100
    const total = data.hourlyEmployeesPercentage + data.salaryEmployeesPercentage;
    if (total !== 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Hourly and salary percentages must sum to 100%",
        path: ["hourlyEmployeesPercentage"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Hourly and salary percentages must sum to 100%",
        path: ["salaryEmployeesPercentage"],
      });
    }

    // Validate conditional fields
    if (data.commuteMoreThan15Miles && !data.averageCommuteTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please provide the estimated average commute time",
        path: ["averageCommuteTime"],
      });
    }

    if (
      !data.employeesResideInSameZipCodes &&
      (!data.employeeLivingZipCodes || data.employeeLivingZipCodes.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please add at least one location",
        path: ["employeeLivingZipCodes"],
      });
    }
  });

// Compensation Section Schema
export const compensationSchema = z
  .object({
    medianAnnualEarnings: requiredString,
    hourlyMedianAnnualEarnings: z.string().optional(),
    salariedMedianAnnualEarnings: z.string().optional(),
    offersAnnualRaises: z.boolean({ message: "This field is required" }),
    handlesHRPayrollInHouse: requiredString,
    annualRaiseMonth: z.string().optional(),
    payrollProvider: requiredString,
    payrollProviderOther: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validate conditional required fields
    if (data.offersAnnualRaises && !data.annualRaiseMonth) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select the month when annual raises are given",
        path: ["annualRaiseMonth"],
      });
    }

    if (data.payrollProvider === "Other" && !data.payrollProviderOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify your payroll provider",
        path: ["payrollProviderOther"],
      });
    }
  });

// Benefits Section Schema
export const benefitsSchema = z
  .object({
    supplementalBenefits: z.array(z.string()).min(1, "Select at least one benefit"),
    supplementalBenefitsOther: z.string().optional(),
    workWithBenefitsBroker: requiredString,
    benefitsBrokerName: z.string().optional(),
    benefitEnrollmentMonth: requiredString,
    offersRetirementBenefit: z.boolean({ message: "This field is required" }),
    retirementProvider: z.string().optional(),
    retirementProviderOther: z.string().optional(),
    retirementEnrollmentRate: z.string().optional(),
    retirementPlanHasMatch: z.boolean().optional(),
    retirementMatchPercentage: z.number().min(0).max(100).optional(),
    retirementVestingPeriod: z.string().optional(),
    retirementAutoEnroll: z.boolean().optional(),
    retirementAllowsHardshipWithdrawals: z.boolean().optional(),
    offersHealthInsurance: z.boolean({ message: "This field is required" }),
    healthPlanTypes: z.array(z.string()).optional(),
    lowestHealthPlanPremium: z.number().min(0).optional(),
    healthPlanInsuranceType: z.string().optional(),
    reimbursementArrangements: z.array(z.string()).optional(),
    healthPlanParticipationRates: z
      .object({
        doNotParticipate: z.string().optional(),
        employeeOnly: z.string().optional(),
        employeeSpouse: z.string().optional(),
        employeeChildren: z.string().optional(),
        employeeFamily: z.string().optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Validate conditional fields for supplemental benefits
    if (data.supplementalBenefits?.includes("Other") && !data.supplementalBenefitsOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify other supplemental benefits when selecting 'Other'",
        path: ["supplementalBenefitsOther"],
      });
    }

    // Validate conditional fields for retirement
    if (data.offersRetirementBenefit && !data.retirementProvider) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select your retirement benefits provider",
        path: ["retirementProvider"],
      });
    }

    if (data.retirementProvider === "Other" && !data.retirementProviderOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify your retirement provider",
        path: ["retirementProviderOther"],
      });
    }

    if (data.retirementPlanHasMatch && !data.retirementMatchPercentage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter the employer match percentage",
        path: ["retirementMatchPercentage"],
      });
    }

    // Validate conditional fields for health insurance
    if (
      data.offersHealthInsurance &&
      (!data.healthPlanTypes || data.healthPlanTypes.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select at least one health plan type",
        path: ["healthPlanTypes"],
      });
    }
  });

// Goals Section Schema
export const goalsSchema = z
  .object({
    workforceGoals: z.array(z.string()).min(1, "Select at least one goal"),
    workforceGoalsRanking: z.array(z.string()).length(3, "Rank exactly 3 goals"),
  })
  .superRefine((data, ctx) => {
    // Validate that ranking choices are from selected goals
    if (data.workforceGoalsRanking && data.workforceGoals) {
      const invalidRankings = data.workforceGoalsRanking.filter(
        ranking => !data.workforceGoals.includes(ranking)
      );
      if (invalidRankings.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ranking must only include goals from your selected workforce goals",
          path: ["workforceGoalsRanking"],
        });
      }
    }
  });

// Combined assessment schema
export const assessmentSchema = z.object({
  workforce: workforceSchema.optional(),
  compensation: compensationSchema.optional(),
  benefits: benefitsSchema.optional(),
  goals: goalsSchema.optional(),
});

// Type exports for use in components
export type WorkforceFormData = z.infer<typeof workforceSchema>;
export type CompensationFormData = z.infer<typeof compensationSchema>;
export type BenefitsFormData = z.infer<typeof benefitsSchema>;
export type GoalsFormData = z.infer<typeof goalsSchema>;
export type AssessmentFormData = z.infer<typeof assessmentSchema>;

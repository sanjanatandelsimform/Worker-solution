/**
 * Tests for Zod validation schemas
 */
import { describe, it, expect } from "vitest";

// -------------------------------------------------------------------
// authSchemas
// -------------------------------------------------------------------
import {
  industrySchema,
  registrationSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/services/validation/authSchemas";

describe("industrySchema", () => {
  it("accepts valid industry values", () => {
    expect(industrySchema.safeParse("Manufacturing").success).toBe(true);
    expect(industrySchema.safeParse("Technology").success).toBe(true);
    expect(industrySchema.safeParse("Healthcare").success).toBe(true);
    expect(industrySchema.safeParse("Retail").success).toBe(true);
    expect(industrySchema.safeParse("Finance").success).toBe(true);
    expect(industrySchema.safeParse("Construction").success).toBe(true);
    expect(industrySchema.safeParse("Education").success).toBe(true);
    expect(industrySchema.safeParse("Hospitality").success).toBe(true);
    expect(industrySchema.safeParse("Transportation").success).toBe(true);
    expect(industrySchema.safeParse("Other").success).toBe(true);
  });

  it("rejects invalid industry values", () => {
    expect(industrySchema.safeParse("Unknown").success).toBe(false);
    expect(industrySchema.safeParse("").success).toBe(false);
  });
});

describe("registrationSchema", () => {
  const validData = {
    firstName: "Alice",
    lastName: "Smith",
    legalBusinessName: "Acme Corp",
    industry: "Technology",
    zipCode: "12345",
    businessEmail: "alice@example.com",
    businessPhone: "1234567890",
    password: "Str0ng!Pass",
    confirmPassword: "Str0ng!Pass",
  };

  it("accepts valid registration data", () => {
    expect(registrationSchema.safeParse(validData).success).toBe(true);
  });

  it("rejects empty firstName", () => {
    const result = registrationSchema.safeParse({ ...validData, firstName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects short firstName (< 2 chars)", () => {
    const result = registrationSchema.safeParse({ ...validData, firstName: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects firstName exceeding 20 chars", () => {
    const result = registrationSchema.safeParse({ ...validData, firstName: "A".repeat(21) });
    expect(result.success).toBe(false);
  });

  it("rejects empty lastName", () => {
    const result = registrationSchema.safeParse({ ...validData, lastName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects short legalBusinessName", () => {
    const result = registrationSchema.safeParse({ ...validData, legalBusinessName: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects legalBusinessName exceeding 50 chars", () => {
    const result = registrationSchema.safeParse({
      ...validData,
      legalBusinessName: "A".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty industry", () => {
    const result = registrationSchema.safeParse({ ...validData, industry: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid zipCode", () => {
    const result = registrationSchema.safeParse({ ...validData, zipCode: "1234" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid businessEmail", () => {
    const result = registrationSchema.safeParse({ ...validData, businessEmail: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid businessPhone (< 10 digits)", () => {
    const result = registrationSchema.safeParse({ ...validData, businessPhone: "123456789" });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registrationSchema.safeParse({ ...validData, password: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase", () => {
    const result = registrationSchema.safeParse({
      ...validData,
      password: "lowercase1!",
      confirmPassword: "lowercase1!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-matching confirmPassword", () => {
    const result = registrationSchema.safeParse({
      ...validData,
      confirmPassword: "DifferentPass1!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map(i => i.message);
      expect(messages).toContain("Passwords do not match");
    }
  });
});

describe("signInSchema", () => {
  const validData = {
    email: "user@example.com",
    password: "Str0ng!Pass",
    rememberMe: true,
  };

  it("accepts valid sign-in data", () => {
    expect(signInSchema.safeParse(validData).success).toBe(true);
  });

  it("accepts sign-in without rememberMe", () => {
    expect(
      signInSchema.safeParse({ email: validData.email, password: validData.password }).success
    ).toBe(true);
  });

  it("rejects empty email", () => {
    expect(signInSchema.safeParse({ ...validData, email: "" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(signInSchema.safeParse({ ...validData, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects empty password", () => {
    expect(signInSchema.safeParse({ ...validData, password: "" }).success).toBe(false);
  });

  it("rejects short password", () => {
    expect(signInSchema.safeParse({ ...validData, password: "short" }).success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "user@example.com" }).success).toBe(true);
  });

  it("rejects empty email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "invalid" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  const validData = {
    newPassword: "NewStr0ng!Pass",
    confirmPassword: "NewStr0ng!Pass",
  };

  it("accepts valid reset data", () => {
    expect(resetPasswordSchema.safeParse(validData).success).toBe(true);
  });

  it("rejects non-matching passwords", () => {
    const result = resetPasswordSchema.safeParse({ ...validData, confirmPassword: "Different1!" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map(i => i.message)).toContain("Passwords do not match");
    }
  });

  it("rejects weak password", () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: "weakpass",
      confirmPassword: "weakpass",
    });
    expect(result.success).toBe(false);
  });
});

// -------------------------------------------------------------------
// assessmentSchemas - just validate basic schema structures
// -------------------------------------------------------------------
import { workforceSchema } from "@/services/validation/assessmentSchemas";

describe("workforceSchema", () => {
  it("accepts valid minimal workforce data", () => {
    const data = {
      headCountSize: "50",
      benefitsUpdates: "email",
      desklessEmployees: false,
      commuteMoreThan15Miles: false,
      hourlyEmployeesPercentage: 30,
      salaryEmployeesPercentage: 70,
      employeesResideInSameZipCodes: "yes",
    };
    expect(workforceSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing required fields", () => {
    expect(workforceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects headCountSize as empty string", () => {
    const result = workforceSchema.safeParse({
      headCountSize: "",
      benefitsUpdates: "email",
      desklessEmployees: false,
      commuteMoreThan15Miles: false,
      hourlyEmployeesPercentage: 50,
      salaryEmployeesPercentage: 50,
      employeesResideInSameZipCodes: "yes",
    });
    expect(result.success).toBe(false);
  });

  it("rejects percentage out of range", () => {
    const result = workforceSchema.safeParse({
      headCountSize: "50",
      benefitsUpdates: "email",
      desklessEmployees: false,
      commuteMoreThan15Miles: false,
      hourlyEmployeesPercentage: 150,
      salaryEmployeesPercentage: 50,
      employeesResideInSameZipCodes: "yes",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid commonJobTitles array", () => {
    const result = workforceSchema.safeParse({
      headCountSize: "50",
      benefitsUpdates: "email",
      desklessEmployees: false,
      commuteMoreThan15Miles: false,
      hourlyEmployeesPercentage: 50,
      salaryEmployeesPercentage: 50,
      employeesResideInSameZipCodes: "yes",
      commonJobTitles: [{ title: "Engineer", percentage: 40 }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid topWorkLocations", () => {
    const result = workforceSchema.safeParse({
      headCountSize: "50",
      benefitsUpdates: "email",
      desklessEmployees: false,
      commuteMoreThan15Miles: false,
      hourlyEmployeesPercentage: 50,
      salaryEmployeesPercentage: 50,
      employeesResideInSameZipCodes: "yes",
      topWorkLocations: [{ state: "CA", zipCode: "90210" }],
    });
    expect(result.success).toBe(true);
  });
});

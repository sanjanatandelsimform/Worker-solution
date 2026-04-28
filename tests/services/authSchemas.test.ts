import { describe, it, expect } from "vitest";
import {
  registrationSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/services/validation/authSchemas";

const validReg = () => ({
  firstName: "Jane",
  lastName: "Doe",
  legalBusinessName: "Acme Corp",
  industry: "Technology",
  zipCode: "90210",
  businessEmail: "jane@acme.com",
  businessPhone: "1234567890",
  password: "Abcdef1!",
  confirmPassword: "Abcdef1!",
});

describe("registrationSchema", () => {
  it("passes with valid data", () => {
    expect(registrationSchema.safeParse(validReg()).success).toBe(true);
  });

  it("fails with empty firstName", () => {
    expect(registrationSchema.safeParse({ ...validReg(), firstName: "" }).success).toBe(false);
  });

  it("fails with short firstName", () => {
    expect(registrationSchema.safeParse({ ...validReg(), firstName: "A" }).success).toBe(false);
  });

  it("fails with mismatched passwords", () => {
    expect(
      registrationSchema.safeParse({ ...validReg(), confirmPassword: "Wrong1!" }).success
    ).toBe(false);
  });

  it("fails with invalid zipCode", () => {
    expect(registrationSchema.safeParse({ ...validReg(), zipCode: "ABC" }).success).toBe(false);
  });

  it("fails with invalid email", () => {
    expect(
      registrationSchema.safeParse({ ...validReg(), businessEmail: "notanemail" }).success
    ).toBe(false);
  });

  it("fails with weak password (no uppercase)", () => {
    expect(
      registrationSchema.safeParse({
        ...validReg(),
        password: "abcdef1!",
        confirmPassword: "abcdef1!",
      }).success
    ).toBe(false);
  });

  it("fails with invalid phone", () => {
    expect(registrationSchema.safeParse({ ...validReg(), businessPhone: "123" }).success).toBe(
      false
    );
  });

  it("fails with long legalBusinessName", () => {
    expect(
      registrationSchema.safeParse({ ...validReg(), legalBusinessName: "A".repeat(51) }).success
    ).toBe(false);
  });
});

describe("signInSchema", () => {
  it("passes valid", () => {
    expect(signInSchema.safeParse({ email: "a@b.com", password: "Abcdef1!" }).success).toBe(true);
  });

  it("fails empty email", () => {
    expect(signInSchema.safeParse({ email: "", password: "Abcdef1!" }).success).toBe(false);
  });

  it("fails weak password", () => {
    expect(signInSchema.safeParse({ email: "a@b.com", password: "weak" }).success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("passes valid", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
  });

  it("fails empty", () => {
    expect(forgotPasswordSchema.safeParse({ email: "" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("passes valid", () => {
    expect(
      resetPasswordSchema.safeParse({ newPassword: "Abcdef1!", confirmPassword: "Abcdef1!" })
        .success
    ).toBe(true);
  });

  it("fails mismatch", () => {
    expect(
      resetPasswordSchema.safeParse({ newPassword: "Abcdef1!", confirmPassword: "Xyz" }).success
    ).toBe(false);
  });
});

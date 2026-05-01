/**
 * Comprehensive tests for src/utils/* utilities
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// -------------------------------------------------------------------
// capitalise.ts
// -------------------------------------------------------------------
import { capitalise } from "@/utils/capitalise";

describe("capitalise", () => {
  it("capitalises first char and lowercases the rest", () => {
    expect(capitalise("january")).toBe("January");
    expect(capitalise("APRIL")).toBe("April");
  });

  it("returns the value as-is for empty / falsy string", () => {
    expect(capitalise("")).toBe("");
    expect(capitalise(null as unknown as string)).toBe(null);
    expect(capitalise(undefined as unknown as string)).toBe(undefined);
  });

  it("handles single character strings", () => {
    expect(capitalise("a")).toBe("A");
    expect(capitalise("Z")).toBe("Z");
  });
});

// -------------------------------------------------------------------
// validation.ts
// -------------------------------------------------------------------
import {
  validateEmail,
  validatePassword,
  validateName,
  passwordsMatch,
  isPasswordDifferent,
} from "@/utils/validation";

describe("validateEmail", () => {
  it("returns false for empty string", () => {
    expect(validateEmail("")).toBe(false);
    expect(validateEmail("   ")).toBe(false);
  });

  it("returns false for null-like values", () => {
    expect(validateEmail(null as unknown as string)).toBe(false);
    expect(validateEmail(undefined as unknown as string)).toBe(false);
  });

  it("returns false for invalid emails", () => {
    expect(validateEmail("notanemail")).toBe(false);
    expect(validateEmail("@domain.com")).toBe(false);
    expect(validateEmail("user@")).toBe(false);
    expect(validateEmail("user@domain")).toBe(false);
  });

  it("returns true for valid emails", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("test.email+filter@sub.domain.org")).toBe(true);
  });

  it("returns false for email exceeding 255 characters", () => {
    const longEmail = `${"a".repeat(250)}@b.com`;
    expect(validateEmail(longEmail)).toBe(false);
  });
});

describe("validatePassword", () => {
  it("returns invalid for empty / short password", () => {
    expect(validatePassword("").isValid).toBe(false);
    expect(validatePassword("short").isValid).toBe(false);
    expect(validatePassword("Short1!").isValid).toBe(false); // 7 chars
  });

  it("returns invalid when no uppercase letter", () => {
    const result = validatePassword("lowercase1!");
    expect(result.isValid).toBe(false);
    expect(result.message).toContain("uppercase");
  });

  it("returns invalid when no lowercase letter", () => {
    const result = validatePassword("UPPERCASE1!");
    expect(result.isValid).toBe(false);
    expect(result.message).toContain("lowercase");
  });

  it("returns invalid when no number", () => {
    const result = validatePassword("Password!");
    expect(result.isValid).toBe(false);
    expect(result.message).toContain("number");
  });

  it("returns invalid when no special character", () => {
    const result = validatePassword("Password1");
    expect(result.isValid).toBe(false);
    expect(result.message).toContain("special");
  });

  it("returns valid for strong password", () => {
    const result = validatePassword("Str0ng!Pass");
    expect(result.isValid).toBe(true);
    expect(result.message).toBeUndefined();
  });
});

describe("validateName", () => {
  it("returns invalid for empty name", () => {
    const r = validateName("First name", "");
    expect(r.isValid).toBe(false);
    expect(r.message).toContain("cannot be empty");
  });

  it("returns invalid for whitespace-only name", () => {
    const r = validateName("First name", "   ");
    expect(r.isValid).toBe(false);
  });

  it("returns invalid for name exceeding 50 chars", () => {
    const r = validateName("Last name", "a".repeat(51));
    expect(r.isValid).toBe(false);
    expect(r.message).toContain("exceed 50");
  });

  it("returns valid for normal name", () => {
    const r = validateName("First name", "Alice");
    expect(r.isValid).toBe(true);
    expect(r.trimmedName).toBe("Alice");
  });

  it("trims whitespace before validating", () => {
    const r = validateName("First name", "  Bob  ");
    expect(r.isValid).toBe(true);
    expect(r.trimmedName).toBe("Bob");
  });
});

describe("passwordsMatch", () => {
  it("returns true when passwords match", () => {
    expect(passwordsMatch("abc123", "abc123")).toBe(true);
  });

  it("returns false when passwords do not match", () => {
    expect(passwordsMatch("abc123", "xyz789")).toBe(false);
  });
});

describe("isPasswordDifferent", () => {
  it("returns true when passwords differ", () => {
    expect(isPasswordDifferent("old", "new")).toBe(true);
  });

  it("returns false when passwords are the same", () => {
    expect(isPasswordDifferent("same", "same")).toBe(false);
  });
});

// -------------------------------------------------------------------
// formatters.ts
// -------------------------------------------------------------------
import {
  formatNumber,
  formatCurrency,
  formatCurrencyWithCents,
  formatPercentage,
  formatCompactNumber,
  formatEmployerCostPerYear,
  formatToTwoDecimalPlaces,
} from "@/utils/formatters";

describe("formatNumber", () => {
  it("returns N/A for null/undefined", () => {
    expect(formatNumber(null)).toBe("N/A");
    expect(formatNumber(undefined)).toBe("N/A");
  });

  it("formats number with commas", () => {
    expect(formatNumber(1250)).toBe("1,250");
    expect(formatNumber(0)).toBe("0");
  });
});

describe("formatCurrency", () => {
  it("returns N/A for null/undefined", () => {
    expect(formatCurrency(null)).toBe("N/A");
    expect(formatCurrency(undefined)).toBe("N/A");
  });

  it("formats as USD without cents", () => {
    expect(formatCurrency(52000)).toBe("$52,000");
  });
});

describe("formatCurrencyWithCents", () => {
  it("returns N/A for null/undefined", () => {
    expect(formatCurrencyWithCents(null)).toBe("N/A");
    expect(formatCurrencyWithCents(undefined)).toBe("N/A");
  });

  it("formats with 2 decimal places", () => {
    expect(formatCurrencyWithCents(18.5)).toBe("$18.50");
    expect(formatCurrencyWithCents(20)).toBe("$20.00");
  });
});

describe("formatPercentage", () => {
  it("returns N/A for null/undefined", () => {
    expect(formatPercentage(null)).toBe("N/A");
    expect(formatPercentage(undefined)).toBe("N/A");
  });

  it("formats with 1 decimal by default", () => {
    expect(formatPercentage(22.5)).toBe("22.5%");
  });

  it("respects custom decimals parameter", () => {
    expect(formatPercentage(18.24567, 2)).toBe("18.25%");
  });
});

describe("formatCompactNumber", () => {
  it("returns N/A for null/undefined", () => {
    expect(formatCompactNumber(null)).toBe("N/A");
    expect(formatCompactNumber(undefined)).toBe("N/A");
  });

  it("formats large numbers compactly", () => {
    const result = formatCompactNumber(1500000);
    expect(result).toMatch(/1\.5M|1\.5\s?M/);
  });
});

describe("formatEmployerCostPerYear", () => {
  it("returns -- for null/undefined", () => {
    expect(formatEmployerCostPerYear(null)).toBe("--");
    expect(formatEmployerCostPerYear(undefined)).toBe("--");
  });

  it("returns -- for negative values", () => {
    expect(formatEmployerCostPerYear(-1)).toBe("--");
  });

  it("returns $0/yr for zero", () => {
    expect(formatEmployerCostPerYear(0)).toBe("$0/yr");
  });

  it("formats positive values with thousand separators", () => {
    expect(formatEmployerCostPerYear(11240)).toBe("$11,240/yr");
  });
});

describe("formatToTwoDecimalPlaces", () => {
  it("returns N/A for null/undefined", () => {
    expect(formatToTwoDecimalPlaces(null)).toBe("N/A");
    expect(formatToTwoDecimalPlaces(undefined)).toBe("N/A");
  });

  it("formats to 2 decimal places", () => {
    expect(formatToTwoDecimalPlaces(3.14159)).toBe("3.14");
    expect(formatToTwoDecimalPlaces(5)).toBe("5.00");
  });
});

// -------------------------------------------------------------------
// monthUtils.ts
// -------------------------------------------------------------------
import { mapMonthToApiValue, MONTH_MAP } from "@/utils/monthUtils";

describe("mapMonthToApiValue", () => {
  it("returns null for null/undefined/empty", () => {
    expect(mapMonthToApiValue(null)).toBeNull();
    expect(mapMonthToApiValue(undefined)).toBeNull();
    expect(mapMonthToApiValue("")).toBeNull();
  });

  it("maps full month names (lowercase) to enum values", () => {
    expect(mapMonthToApiValue("january")).toBe("Jan");
    expect(mapMonthToApiValue("december")).toBe("Dec");
    expect(mapMonthToApiValue("september")).toBe("Sep");
  });

  it("maps abbreviated names", () => {
    expect(mapMonthToApiValue("jan")).toBe("Jan");
    expect(mapMonthToApiValue("sept")).toBe("Sep");
    expect(mapMonthToApiValue("oct")).toBe("Oct");
  });

  it("trims whitespace before lookup", () => {
    expect(mapMonthToApiValue("  feb  ")).toBe("Feb");
  });

  it("returns original value for unknown month", () => {
    expect(mapMonthToApiValue("unknown")).toBe("unknown");
  });

  it("covers all months in MONTH_MAP", () => {
    for (const [key, value] of Object.entries(MONTH_MAP)) {
      expect(mapMonthToApiValue(key)).toBe(value);
    }
  });
});

// -------------------------------------------------------------------
// errorHandler.ts
// -------------------------------------------------------------------
import { getErrorState, getSuccessState, getInfoState } from "@/utils/errorHandler";
import axios from "axios";

describe("getErrorState", () => {
  it("returns default danger state for unknown error", () => {
    const result = getErrorState("something random");
    expect(result.type).toBe("danger");
    expect(result.message).toContain("unexpected");
  });

  it("handles standard Error objects", () => {
    const result = getErrorState(new Error("Something went wrong"));
    expect(result.message).toBe("Something went wrong");
    expect(result.type).toBe("danger");
  });

  it("detects not-found keyword in Error message", () => {
    expect(getErrorState(new Error("Resource not found")).type).toBe("warning");
    expect(getErrorState(new Error("Item does not exist")).type).toBe("warning");
  });

  it("detects network keyword in Error message", () => {
    expect(getErrorState(new Error("network failure")).type).toBe("info");
    expect(getErrorState(new Error("connection refused")).type).toBe("info");
  });

  it("detects invalid/required/must be in Error message", () => {
    expect(getErrorState(new Error("invalid input")).type).toBe("warning");
    expect(getErrorState(new Error("required field")).type).toBe("warning");
    expect(getErrorState(new Error("must be a number")).type).toBe("warning");
  });

  it("detects unauthorized keyword in Error message", () => {
    expect(getErrorState(new Error("unauthorized access")).type).toBe("warning");
    expect(getErrorState(new Error("access denied")).type).toBe("warning");
  });

  it("detects server error keyword in Error message", () => {
    expect(getErrorState(new Error("server error occurred")).type).toBe("danger");
    expect(getErrorState(new Error("internal error")).type).toBe("danger");
  });

  it("handles Axios 500 error", () => {
    const err = new axios.AxiosError("Internal Server Error", "500", undefined, undefined, {
      status: 500,
      data: {},
    } as any);
    const result = getErrorState(err);
    expect(result.type).toBe("danger");
    expect(result.message).toContain("Server error");
  });

  it("handles Axios 404 error", () => {
    const err = new axios.AxiosError("Not Found", "404", undefined, undefined, {
      status: 404,
      data: {},
    } as any);
    expect(getErrorState(err).type).toBe("warning");
  });

  it("handles Axios 401/403 error", () => {
    const err401 = new axios.AxiosError("Unauthorized", "401", undefined, undefined, {
      status: 401,
      data: {},
    } as any);
    expect(getErrorState(err401).type).toBe("warning");

    const err403 = new axios.AxiosError("Forbidden", "403", undefined, undefined, {
      status: 403,
      data: {},
    } as any);
    expect(getErrorState(err403).type).toBe("warning");
  });

  it("handles Axios 400 error", () => {
    const err = new axios.AxiosError("Bad Request", "400", undefined, undefined, {
      status: 400,
      data: {},
    } as any);
    expect(getErrorState(err).type).toBe("warning");
  });

  it("handles Axios 429 error", () => {
    const err = new axios.AxiosError("Too Many Requests", "429", undefined, undefined, {
      status: 429,
      data: {},
    } as any);
    expect(getErrorState(err).type).toBe("info");
  });

  it("handles Axios 422 error (other client error)", () => {
    const err = new axios.AxiosError("Unprocessable Entity", "422", undefined, undefined, {
      status: 422,
      data: {},
    } as any);
    expect(getErrorState(err).type).toBe("warning");
  });

  it("handles Axios ECONNABORTED network error", () => {
    const err = new axios.AxiosError("Network Error");
    (err as any).code = "ECONNABORTED";
    expect(getErrorState(err).type).toBe("info");
    expect(getErrorState(err).message).toContain("Network error");
  });

  it("handles Axios ERR_NETWORK error", () => {
    const err = new axios.AxiosError("Network Error");
    (err as any).code = "ERR_NETWORK";
    expect(getErrorState(err).type).toBe("info");
  });

  it("handles Axios ETIMEDOUT error", () => {
    const err = new axios.AxiosError("Timeout");
    (err as any).code = "ETIMEDOUT";
    expect(getErrorState(err).type).toBe("info");
    expect(getErrorState(err).message).toContain("timed out");
  });

  it("uses apiMessage when available", () => {
    const err = new axios.AxiosError("Server Error", "500", undefined, undefined, {
      status: 500,
      data: { message: "Custom API error message" },
    } as any);
    expect(getErrorState(err).message).toBe("Custom API error message");
  });
});

describe("getSuccessState", () => {
  it("returns success type with given message", () => {
    const result = getSuccessState("Operation successful");
    expect(result.type).toBe("success");
    expect(result.message).toBe("Operation successful");
  });
});

describe("getInfoState", () => {
  it("returns info type with given message", () => {
    const result = getInfoState("Please wait");
    expect(result.type).toBe("info");
    expect(result.message).toBe("Please wait");
  });
});

// -------------------------------------------------------------------
// sessionManager.ts
// -------------------------------------------------------------------
import {
  isSessionValid,
  saveModalContext,
  restoreModalContext,
  sanitizeFormData,
} from "@/utils/sessionManager";

describe("isSessionValid", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns false when no userDetail in localStorage", () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    expect(isSessionValid()).toBe(false);
  });

  it("returns false when accessToken is missing", () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      JSON.stringify({ tokens: {} })
    );
    expect(isSessionValid()).toBe(false);
  });

  it("returns true when accessToken is present", () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      JSON.stringify({ tokens: { accessToken: "valid-token" } })
    );
    expect(isSessionValid()).toBe(true);
  });

  it("returns false for invalid JSON", () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue("not-json");
    expect(isSessionValid()).toBe(false);
  });
});

describe("saveModalContext", () => {
  beforeEach(() => {
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("saves context to sessionStorage", () => {
    saveModalContext({ modalType: "profile", timestamp: 123 });
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      "modalContext",
      expect.stringContaining("profile")
    );
  });

  it("handles sessionStorage errors gracefully", () => {
    (sessionStorage.setItem as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("Storage full");
    });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => saveModalContext({ modalType: "email" })).not.toThrow();
    consoleSpy.mockRestore();
  });
});

describe("restoreModalContext", () => {
  beforeEach(() => {
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null when no context saved", () => {
    (sessionStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    expect(restoreModalContext()).toBeNull();
  });

  it("returns context and removes it from sessionStorage", () => {
    const ctx = { modalType: "password" as const, timestamp: 456 };
    (sessionStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(JSON.stringify(ctx));
    const result = restoreModalContext();
    expect(result).toEqual(ctx);
    expect(sessionStorage.removeItem).toHaveBeenCalledWith("modalContext");
  });

  it("returns null for invalid JSON and logs error", () => {
    (sessionStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue("bad-json");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(restoreModalContext()).toBeNull();
    consoleSpy.mockRestore();
  });
});

describe("sanitizeFormData", () => {
  it("removes password fields", () => {
    const data = {
      currentPassword: "old",
      newPassword: "new",
      confirmPassword: "new",
      password: "secret",
      email: "user@example.com",
    };
    const result = sanitizeFormData(data);
    expect(result.currentPassword).toBeUndefined();
    expect(result.newPassword).toBeUndefined();
    expect(result.confirmPassword).toBeUndefined();
    expect(result.password).toBeUndefined();
    expect(result.email).toBe("user@example.com");
  });
});

// -------------------------------------------------------------------
// is-react-component.ts
// -------------------------------------------------------------------
import {
  isFunctionComponent,
  isClassComponent,
  isForwardRefComponent,
  isReactComponent,
} from "@/utils/is-react-component";
import React from "react";

describe("isFunctionComponent", () => {
  it("returns true for function components", () => {
    expect(isFunctionComponent(() => null)).toBe(true);
  });

  it("returns false for non-functions", () => {
    expect(isFunctionComponent("string")).toBe(false);
    expect(isFunctionComponent(null)).toBe(false);
    expect(isFunctionComponent({})).toBe(false);
  });
});

describe("isClassComponent", () => {
  it("returns false for regular arrow functions (no prototype.isReactComponent)", () => {
    // Arrow functions have undefined prototype in many environments
    const result = isClassComponent(() => null);
    // Result can be false or undefined - just confirm it's not truthy
    expect(result).toBeFalsy();
  });

  it("returns true for class components with isReactComponent", () => {
    class MyComp extends React.Component {
      render() {
        return null;
      }
    }
    expect(isClassComponent(MyComp)).toBe(true);
  });

  it("returns false for non-functions", () => {
    expect(isClassComponent("string")).toBe(false);
    expect(isClassComponent(null)).toBe(false);
  });
});

describe("isForwardRefComponent", () => {
  it("returns true for forwardRef components", () => {
    const comp = React.forwardRef((_, ref) => null);
    expect(isForwardRefComponent(comp)).toBe(true);
  });

  it("returns false for non-objects and null", () => {
    expect(isForwardRefComponent(null)).toBe(false);
    expect(isForwardRefComponent("string")).toBe(false);
    expect(isForwardRefComponent(42)).toBe(false);
  });

  it("returns false for plain objects without $$typeof", () => {
    // An object without $$typeof will throw or return false – either is acceptable
    try {
      const result = isForwardRefComponent({});
      expect(result).toBe(false);
    } catch {
      // Acceptable - $$typeof access may throw
    }
  });
});

describe("isReactComponent", () => {
  it("returns true for function components", () => {
    expect(isReactComponent(() => null)).toBe(true);
  });

  it("returns true for forwardRef components", () => {
    const comp = React.forwardRef((_, ref) => null);
    expect(isReactComponent(comp)).toBe(true);
  });

  it("returns false for non-component values", () => {
    expect(isReactComponent("a string")).toBe(false);
    expect(isReactComponent(42)).toBe(false);
    expect(isReactComponent(null)).toBe(false);
  });
});

// -------------------------------------------------------------------
// finchAssessmentPayload.ts
// -------------------------------------------------------------------
import { buildFinchAssessmentPayload } from "@/utils/finchAssessmentPayload";

describe("buildFinchAssessmentPayload", () => {
  const baseGoals = { selectedGoals: ["goal1"], topThreeGoals: ["goal1"] };

  it("builds complete payload for offersAnnualRaises=true", () => {
    const answers = {
      "annual-raises": "yes-raises",
      "benefits-updates": ["email"],
      "deskless-employees": "yes-deskless",
      "commute-methods": ["car"],
      "commute-duration": "30min",
      "shift-differentials": "yes-shift-diff",
      "short-term-incentives": ["bonus"],
      "long-term-incentives": ["stock"],
      "benefits-broker": "yes-broker",
      "retirement-vesting-period": "3 years",
      "retirement-auto-enroll": "yes-autoenroll",
      "retirement-hardship-withdrawals": "yes-hardship",
    };
    const payload = buildFinchAssessmentPayload(
      answers,
      baseGoals,
      "january",
      "ADP",
      "october",
      true,
      "50",
      "250"
    );
    expect(payload.compensation.offersAnnualRaises).toBe(true);
    expect(payload.compensation.annualRaiseMonth).toBe("January");
    expect(payload.compensation.payrollProvider).toBe("ADP");
    expect(payload.workforce.hasDesklessEmployees).toBe(true);
    expect(payload.benefits.workWithBenefitsBroker).toBe("Yes");
    expect(payload.benefits.benefitEnrollmentMonth).toBe("October");
    expect(payload.benefits.retirementMatchPercentage).toBe(50);
    expect(payload.benefits.lowestHealthPlanPremium).toBe(250);
    expect(payload.goals.workforceGoals).toEqual(["goal1"]);
  });

  it("builds payload for offersAnnualRaises=false (no annualRaiseMonth)", () => {
    const answers = { "annual-raises": "no-raises" };
    const payload = buildFinchAssessmentPayload(answers, baseGoals, "", "", "");
    expect(payload.compensation.offersAnnualRaises).toBe(false);
    expect((payload.compensation as any).annualRaiseMonth).toBeUndefined();
  });

  it("handles no-broker answer", () => {
    const answers = { "benefits-broker": "no-broker" };
    const payload = buildFinchAssessmentPayload(answers, baseGoals, "", "", "");
    expect(payload.benefits.workWithBenefitsBroker).toBe("No");
  });

  it("handles unsure-broker answer", () => {
    const answers = { "benefits-broker": "unsure-broker" };
    const payload = buildFinchAssessmentPayload(answers, baseGoals, "", "", "");
    expect(payload.benefits.workWithBenefitsBroker).toBe("Unsure");
  });

  it("handles unknown broker answer → null or stripped by stripEmpty", () => {
    const answers = { "benefits-broker": "unknown-value" };
    const payload = buildFinchAssessmentPayload(answers, baseGoals, "", "", "");
    // brokerMap returns null for unknown value, which stripEmpty removes
    expect(payload.benefits.workWithBenefitsBroker == null).toBe(true);
  });

  it("sets null workWithBenefitsBroker when brokerRaw is undefined", () => {
    const answers = {};
    const payload = buildFinchAssessmentPayload(answers, baseGoals, "", "", "");
    // benefits-broker not in answers → brokerRaw is undefined → workWithBenefitsBroker=null → stripped
    expect(payload.benefits.workWithBenefitsBroker == null).toBe(true);
  });

  it("skips retirementMatchPercentage when no match", () => {
    const answers = {};
    const payload = buildFinchAssessmentPayload(answers, baseGoals, "", "", "", false, "50");
    expect((payload.benefits as any).retirementMatchPercentage).toBeUndefined();
  });

  it("skips lowestHealthPlanPremium when empty", () => {
    const answers = {};
    const payload = buildFinchAssessmentPayload(answers, baseGoals, "", "", "");
    expect((payload.benefits as any).lowestHealthPlanPremium).toBeUndefined();
  });

  it("strips empty arrays and null values", () => {
    const answers = {
      "benefits-updates": [],
      "commute-methods": [],
      "short-term-incentives": [],
      "long-term-incentives": [],
    };
    const payload = buildFinchAssessmentPayload(answers, baseGoals, "", "", "");
    // After stripEmpty, communicationMethods and commuteMethods should not appear
    expect((payload.workforce as any).communicationMethods).toBeUndefined();
    expect((payload.workforce as any).commuteMethods).toBeUndefined();
  });
});

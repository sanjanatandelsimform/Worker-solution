import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateName,
  passwordsMatch,
  isPasswordDifferent,
} from "@/utils/validation";

describe("validation utilities", () => {
  describe("validateEmail", () => {
    it("should return false for empty email", () => {
      expect(validateEmail("")).toBe(false);
    });

    it("should return false for whitespace-only email", () => {
      expect(validateEmail("   ")).toBe(false);
    });

    it("should return false for null/undefined", () => {
      expect(validateEmail(null as unknown as string)).toBe(false);
      expect(validateEmail(undefined as unknown as string)).toBe(false);
    });

    it("should return false for email without @ symbol", () => {
      expect(validateEmail("invalidemail.com")).toBe(false);
    });

    it("should return false for email without domain", () => {
      expect(validateEmail("invalid@")).toBe(false);
    });

    it("should return false for email without local part", () => {
      expect(validateEmail("@example.com")).toBe(false);
    });

    it("should return false for email with space", () => {
      expect(validateEmail("invalid @example.com")).toBe(false);
      expect(validateEmail("invalid@ example.com")).toBe(false);
    });

    it("should return false for email with multiple @ symbols", () => {
      expect(validateEmail("user@@example.com")).toBe(false);
    });

    it("should return false for email exceeding 255 characters", () => {
      const longEmail = "a".repeat(250) + "@example.com";
      expect(validateEmail(longEmail)).toBe(false);
    });

    it("should return true for valid email addresses", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name@example.co.uk")).toBe(true);
      expect(validateEmail("a@b.c")).toBe(true);
    });

    it("should return true for email with numbers", () => {
      expect(validateEmail("test123@example.com")).toBe(true);
    });

    it("should return true for email with hyphens and underscores", () => {
      expect(validateEmail("test_user-123@example-domain.com")).toBe(true);
    });

    it("should return true for email at 255 character limit", () => {
      const maxEmail = "a".repeat(243) + "@example.com";
      expect(validateEmail(maxEmail)).toBe(true);
    });
  });

  describe("validatePassword", () => {
    it("should return false for empty password", () => {
      const result = validatePassword("");
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("at least 8 characters");
    });

    it("should return false for password shorter than 8 characters", () => {
      const result = validatePassword("Pass1!");
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("at least 8 characters");
    });

    it("should return false for password without uppercase", () => {
      const result = validatePassword("password123!");
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("uppercase letter");
    });

    it("should return false for password without lowercase", () => {
      const result = validatePassword("PASSWORD123!");
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("lowercase letter");
    });

    it("should return false for password without number", () => {
      const result = validatePassword("Password!");
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("number");
    });

    it("should return false for password without special character", () => {
      const result = validatePassword("Password123");
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("special character");
    });

    it("should return true for valid password meeting all requirements", () => {
      const result = validatePassword("ValidPass123!");
      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it("should return true for password with various special characters", () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '-', '=', '[', ']', '{', '}', '|', ';', ':', ',', '.', '<', '>'];
      
      specialChars.forEach(char => {
        const result = validatePassword(`ValidPass123${char}`);
        expect(result.isValid).toBe(true, `Should accept special char: ${char}`);
      });
    });

    it("should return false for null/undefined", () => {
      expect(validatePassword(null as unknown as string).isValid).toBe(false);
      expect(validatePassword(undefined as unknown as string).isValid).toBe(false);
    });

    it("should return true for exactly 8 character valid password", () => {
      const result = validatePassword("Pass12!a");
      expect(result.isValid).toBe(true);
    });

    it("should return true for long password", () => {
      const result = validatePassword("VeryLongPassword123!@#$%");
      expect(result.isValid).toBe(true);
    });
  });

  describe("validateName", () => {
    it("should return invalid for empty name", () => {
      const result = validateName("First Name", "");
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("cannot be empty");
    });

    it("should return invalid for whitespace-only name", () => {
      const result = validateName("First Name", "   ");
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("cannot be empty");
    });

    it("should return invalid for name exceeding 50 characters", () => {
      const longName = "a".repeat(51);
      const result = validateName("First Name", longName);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("cannot exceed 50 characters");
    });

    it("should return valid and trim whitespace for valid name", () => {
      const result = validateName("First Name", "  John Doe  ");
      expect(result.isValid).toBe(true);
      expect(result.trimmedName).toBe("John Doe");
      expect(result.message).toBeUndefined();
    });

    it("should return valid for single character name", () => {
      const result = validateName("First Name", "A");
      expect(result.isValid).toBe(true);
      expect(result.trimmedName).toBe("A");
    });

    it("should return valid for exactly 50 character name", () => {
      const name50 = "a".repeat(50);
      const result = validateName("First Name", name50);
      expect(result.isValid).toBe(true);
      expect(result.trimmedName).toBe(name50);
    });

    it("should use custom key in error message", () => {
      const result = validateName("Last Name", "");
      expect(result.message).toContain("Last Name");
    });

    it("should use default key when not provided", () => {
      const result = validateName("", "");
      expect(result.message).toContain("Name");
    });

    it("should preserve inner whitespace", () => {
      const result = validateName("Name", "  Mary Anne  ");
      expect(result.trimmedName).toBe("Mary Anne");
    });

    it("should handle names with special characters", () => {
      const result = validateName("Name", "O'Brien-Smith");
      expect(result.isValid).toBe(true);
      expect(result.trimmedName).toBe("O'Brien-Smith");
    });

    it("should handle null/undefined", () => {
      expect(validateName("Name", null as unknown as string).isValid).toBe(false);
      expect(validateName("Name", undefined as unknown as string).isValid).toBe(false);
    });
  });

  describe("passwordsMatch", () => {
    it("should return true when passwords are identical", () => {
      expect(passwordsMatch("password123", "password123")).toBe(true);
    });

    it("should return false when passwords differ", () => {
      expect(passwordsMatch("password123", "password124")).toBe(false);
    });

    it("should return false for case-sensitive mismatch", () => {
      expect(passwordsMatch("Password123", "password123")).toBe(false);
    });

    it("should return false for whitespace difference", () => {
      expect(passwordsMatch("password 123", "password123")).toBe(false);
    });

    it("should return true for empty password match", () => {
      expect(passwordsMatch("", "")).toBe(true);
    });

    it("should return false for one empty password", () => {
      expect(passwordsMatch("password", "")).toBe(false);
      expect(passwordsMatch("", "password")).toBe(false);
    });

    it("should return true for special characters matching", () => {
      const pass = "P@ss!w0rd";
      expect(passwordsMatch(pass, pass)).toBe(true);
    });

    it("should return true for very long passwords matching", () => {
      const longPass = "a".repeat(100) + "B1!";
      expect(passwordsMatch(longPass, longPass)).toBe(true);
    });

    it("should return false for partial match", () => {
      expect(passwordsMatch("password123", "password")).toBe(false);
    });
  });

  describe("isPasswordDifferent", () => {
    it("should return true when passwords are different", () => {
      expect(isPasswordDifferent("oldPassword123!", "newPassword123!")).toBe(true);
    });

    it("should return false when passwords are identical", () => {
      expect(isPasswordDifferent("password123!", "password123!")).toBe(false);
    });

    it("should return true for case-sensitive difference", () => {
      expect(isPasswordDifferent("Password123!", "password123!")).toBe(true);
    });

    it("should return true for whitespace difference", () => {
      expect(isPasswordDifferent("password 123!", "password123!")).toBe(true);
    });

    it("should return false for both empty passwords", () => {
      expect(isPasswordDifferent("", "")).toBe(false);
    });

    it("should return true when one password is empty", () => {
      expect(isPasswordDifferent("password", "")).toBe(true);
      expect(isPasswordDifferent("", "password")).toBe(true);
    });

    it("should return true for single character difference", () => {
      expect(isPasswordDifferent("password1", "password2")).toBe(true);
    });

    it("should return true for special character difference", () => {
      expect(isPasswordDifferent("password!", "password@")).toBe(true);
    });

    it("should return false for very long identical passwords", () => {
      const longPass = "a".repeat(100) + "B1!";
      expect(isPasswordDifferent(longPass, longPass)).toBe(false);
    });
  });
});

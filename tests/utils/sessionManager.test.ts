import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  isSessionValid,
  saveModalContext,
  restoreModalContext,
  sanitizeFormData,
  type ModalType,
} from "@/utils/sessionManager";

describe("sessionManager utilities", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("isSessionValid", () => {
    it("should return false when userDetail is not in localStorage", () => {
      expect(isSessionValid()).toBe(false);
    });

    it("should return false when userDetail is invalid JSON", () => {
      localStorage.setItem("userDetail", "invalid-json");
      expect(isSessionValid()).toBe(false);
    });

    it("should return false when tokens are missing", () => {
      localStorage.setItem("userDetail", JSON.stringify({ userId: 123 }));
      expect(isSessionValid()).toBe(false);
    });

    it("should return false when accessToken is missing", () => {
      localStorage.setItem(
        "userDetail",
        JSON.stringify({
          userId: 123,
          tokens: {
            refreshToken: "refresh-token",
          },
        })
      );
      expect(isSessionValid()).toBe(false);
    });

    it("should return false when accessToken is empty", () => {
      localStorage.setItem(
        "userDetail",
        JSON.stringify({
          userId: 123,
          tokens: {
            accessToken: "",
            refreshToken: "refresh-token",
          },
        })
      );
      expect(isSessionValid()).toBe(false);
    });

    it("should return false when tokens is null", () => {
      localStorage.setItem(
        "userDetail",
        JSON.stringify({
          userId: 123,
          tokens: null,
        })
      );
      expect(isSessionValid()).toBe(false);
    });

    it("should return true when valid accessToken is present", () => {
      localStorage.setItem(
        "userDetail",
        JSON.stringify({
          userId: 123,
          tokens: {
            accessToken: "valid-token-123",
            refreshToken: "refresh-token",
          },
        })
      );
      expect(isSessionValid()).toBe(true);
    });

    it("should return true with minimal valid structure", () => {
      localStorage.setItem(
        "userDetail",
        JSON.stringify({
          tokens: {
            accessToken: "token",
          },
        })
      );
      expect(isSessionValid()).toBe(true);
    });
  });

  describe("saveModalContext", () => {
    it("should save modal context to sessionStorage", () => {
      const context = {
        modalType: "profile" as ModalType,
        formData: { name: "John" },
        timestamp: 1234567890,
      };

      saveModalContext(context);

      const saved = sessionStorage.getItem("modalContext");
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!)).toEqual(context);
    });

    it("should save modal context without formData", () => {
      const context = {
        modalType: "email" as ModalType,
      };

      saveModalContext(context);

      const saved = sessionStorage.getItem("modalContext");
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!)).toEqual(context);
    });

    it("should overwrite existing modal context", () => {
      const context1 = {
        modalType: "profile" as ModalType,
      };
      const context2 = {
        modalType: "password" as ModalType,
      };

      saveModalContext(context1);
      saveModalContext(context2);

      const saved = sessionStorage.getItem("modalContext");
      expect(JSON.parse(saved!)).toEqual(context2);
    });

    it("should handle error when sessionStorage is full", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.spyOn(sessionStorage, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

      const context = {
        modalType: "profile" as ModalType,
      };

      saveModalContext(context);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to save modal context:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should save context with complex formData", () => {
      const context = {
        modalType: "changePassword" as ModalType,
        formData: {
          userId: 123,
          role: "admin",
          settings: { theme: "dark" },
        },
        timestamp: Date.now(),
      };

      saveModalContext(context);

      const saved = sessionStorage.getItem("modalContext");
      expect(JSON.parse(saved!)).toEqual(context);
    });
  });

  describe("restoreModalContext", () => {
    it("should restore modal context from sessionStorage", () => {
      const context = {
        modalType: "email" as ModalType,
        formData: { email: "test@example.com" },
      };

      sessionStorage.setItem("modalContext", JSON.stringify(context));

      const restored = restoreModalContext();
      expect(restored).toEqual(context);
    });

    it("should clear modalContext after restoring", () => {
      const context = {
        modalType: "password" as ModalType,
      };

      sessionStorage.setItem("modalContext", JSON.stringify(context));
      restoreModalContext();

      const afterRestore = sessionStorage.getItem("modalContext");
      expect(afterRestore).toBeNull();
    });

    it("should return null when modalContext is not present", () => {
      const restored = restoreModalContext();
      expect(restored).toBeNull();
    });

    it("should return null when modalContext is invalid JSON", () => {
      sessionStorage.setItem("modalContext", "invalid-json");

      const restored = restoreModalContext();
      expect(restored).toBeNull();
    });

    it("should handle error gracefully", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.spyOn(sessionStorage, "getItem").mockImplementation(() => {
        throw new Error("Storage error");
      });

      const restored = restoreModalContext();

      expect(restored).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to restore modal context:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should restore null after multiple calls", () => {
      const context = {
        modalType: "deleteAccount" as ModalType,
      };

      sessionStorage.setItem("modalContext", JSON.stringify(context));

      // First restore
      const first = restoreModalContext();
      expect(first).toEqual(context);

      // Second restore should return null (already cleared)
      const second = restoreModalContext();
      expect(second).toBeNull();
    });
  });

  describe("sanitizeFormData", () => {
    it("should remove currentPassword field", () => {
      const formData = {
        email: "test@example.com",
        currentPassword: "secret123",
      };

      const sanitized = sanitizeFormData(formData);

      expect(sanitized).toEqual({ email: "test@example.com" });
      expect(sanitized).not.toHaveProperty("currentPassword");
    });

    it("should remove newPassword field", () => {
      const formData = {
        email: "test@example.com",
        newPassword: "newSecret123",
      };

      const sanitized = sanitizeFormData(formData);

      expect(sanitized).toEqual({ email: "test@example.com" });
      expect(sanitized).not.toHaveProperty("newPassword");
    });

    it("should remove confirmPassword field", () => {
      const formData = {
        email: "test@example.com",
        confirmPassword: "newSecret123",
      };

      const sanitized = sanitizeFormData(formData);

      expect(sanitized).toEqual({ email: "test@example.com" });
      expect(sanitized).not.toHaveProperty("confirmPassword");
    });

    it("should remove password field", () => {
      const formData = {
        email: "test@example.com",
        password: "secret123",
      };

      const sanitized = sanitizeFormData(formData);

      expect(sanitized).toEqual({ email: "test@example.com" });
      expect(sanitized).not.toHaveProperty("password");
    });

    it("should remove all password fields together", () => {
      const formData = {
        userId: "123",
        email: "test@example.com",
        currentPassword: "old",
        newPassword: "new",
        confirmPassword: "new",
        password: "pass",
        name: "John",
      };

      const sanitized = sanitizeFormData(formData);

      expect(sanitized).toEqual({
        userId: "123",
        email: "test@example.com",
        name: "John",
      });
      expect(sanitized).not.toHaveProperty("currentPassword");
      expect(sanitized).not.toHaveProperty("newPassword");
      expect(sanitized).not.toHaveProperty("confirmPassword");
      expect(sanitized).not.toHaveProperty("password");
    });

    it("should return copy of original object", () => {
      const formData = {
        email: "test@example.com",
        password: "secret",
      };

      const sanitized = sanitizeFormData(formData);

      // Original should not be modified
      expect(formData).toHaveProperty("password");
      expect(sanitized).not.toHaveProperty("password");
    });

    it("should handle empty object", () => {
      const formData = {};

      const sanitized = sanitizeFormData(formData);

      expect(sanitized).toEqual({});
    });

    it("should preserve all non-password fields", () => {
      const formData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "123-456-7890",
        address: "123 Main St",
        city: "Springfield",
        state: "IL",
        zipCode: "62701",
      };

      const sanitized = sanitizeFormData(formData);

      expect(sanitized).toEqual(formData);
    });

    it("should handle fields with empty string values", () => {
      const formData = {
        email: "",
        password: "",
        name: "",
      };

      const sanitized = sanitizeFormData(formData);

      expect(sanitized).toEqual({
        email: "",
        name: "",
      });
      expect(sanitized).not.toHaveProperty("password");
    });
  });
});

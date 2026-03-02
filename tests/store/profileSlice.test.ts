/**
 * Profile Redux Slice Tests
 *
 * Unit tests for profileSlice: reducers, actions, and async thunks.
 * Tests updateProfile, updateEmail, changePassword, deleteAccount, resendVerificationEmail.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import profileReducer, {
  updateProfileData,
  updateEmailAddress,
  changePassword,
  deleteUserAccount,
  resendVerificationEmail,
  clearProfileError,
  resetPasswordAttempts,
  clearProfileData,
} from "@/store/slices/profileSlice";
import type { ProfileState } from "@/types/profileTypes";

vi.mock("@/services/api/profileApi");

const initialState: ProfileState = {
  loading: false,
  error: null,
  passwordAttempts: 0,
  isAccountLocked: false,
  lockoutExpiry: null,
};

describe("profileSlice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("reducers", () => {
    it("should return initial state", () => {
      expect(profileReducer(undefined, { type: "unknown" })).toEqual(initialState);
    });

    it("should handle clearProfileError", () => {
      const stateWithError: ProfileState = {
        ...initialState,
        error: "Something went wrong",
      };
      const newState = profileReducer(stateWithError, clearProfileError());
      expect(newState.error).toBeNull();
    });

    it("should handle resetPasswordAttempts", () => {
      const stateLocked: ProfileState = {
        ...initialState,
        passwordAttempts: 5,
        isAccountLocked: true,
        lockoutExpiry: Date.now() + 60000,
      };
      const newState = profileReducer(stateLocked, resetPasswordAttempts());
      expect(newState.passwordAttempts).toBe(0);
      expect(newState.isAccountLocked).toBe(false);
      expect(newState.lockoutExpiry).toBeNull();
    });

    it("should handle clearProfileData", () => {
      const stateDirty: ProfileState = {
        ...initialState,
        loading: true,
        error: "Error",
        passwordAttempts: 3,
        isAccountLocked: true,
        lockoutExpiry: 123,
      };
      const newState = profileReducer(stateDirty, clearProfileData());
      expect(newState).toEqual(initialState);
    });
  });

  describe("updateProfileData async thunk", () => {
    it("should set loading and clear error on pending", () => {
      const stateWithError: ProfileState = { ...initialState, error: "Previous" };
      const newState = profileReducer(stateWithError, {
        type: updateProfileData.pending.type,
      });
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it("should clear loading and error on fulfilled", () => {
      const loadingState: ProfileState = { ...initialState, loading: true };
      const newState = profileReducer(loadingState, {
        type: updateProfileData.fulfilled.type,
      });
      expect(newState.loading).toBe(false);
      expect(newState.error).toBeNull();
    });

    it("should set error on rejected", () => {
      const loadingState: ProfileState = { ...initialState, loading: true };
      const newState = profileReducer(loadingState, {
        type: updateProfileData.rejected.type,
        payload: "Failed to update profile",
      });
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe("Failed to update profile");
    });
  });

  describe("updateEmailAddress async thunk", () => {
    it("should set loading on pending", () => {
      const newState = profileReducer(initialState, {
        type: updateEmailAddress.pending.type,
      });
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it("should clear loading on fulfilled", () => {
      const loadingState: ProfileState = { ...initialState, loading: true };
      const newState = profileReducer(loadingState, {
        type: updateEmailAddress.fulfilled.type,
        payload: { success: true },
      });
      expect(newState.loading).toBe(false);
    });

    it("should set error on rejected", () => {
      const loadingState: ProfileState = { ...initialState, loading: true };
      const newState = profileReducer(loadingState, {
        type: updateEmailAddress.rejected.type,
        payload: "Failed to update email",
      });
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe("Failed to update email");
    });
  });

  describe("changePassword async thunk", () => {
    it("should clear loading and reset lockout fields on fulfilled", () => {
      const loadingState: ProfileState = {
        ...initialState,
        loading: true,
        passwordAttempts: 2,
        isAccountLocked: true,
        lockoutExpiry: 123,
      };
      const newState = profileReducer(loadingState, {
        type: changePassword.fulfilled.type,
      });
      expect(newState.loading).toBe(false);
      expect(newState.passwordAttempts).toBe(0);
      expect(newState.isAccountLocked).toBe(false);
      expect(newState.lockoutExpiry).toBeNull();
    });

    it("should set error and passwordAttempts on rejected with attemptsRemaining", () => {
      const loadingState: ProfileState = { ...initialState, loading: true };
      const newState = profileReducer(loadingState, {
        type: changePassword.rejected.type,
        payload: {
          message: "Invalid password",
          attemptsRemaining: 2,
        },
      });
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe("Invalid password");
      expect(newState.passwordAttempts).toBe(3); // 5 - 2
    });

    it("should set isAccountLocked and lockoutExpiry when lockoutDuration in payload", () => {
      const loadingState: ProfileState = { ...initialState, loading: true };
      const lockoutDuration = 300; // seconds
      const newState = profileReducer(loadingState, {
        type: changePassword.rejected.type,
        payload: {
          message: "Account locked",
          attemptsRemaining: 0,
          lockoutDuration,
        },
      });
      expect(newState.isAccountLocked).toBe(true);
      expect(newState.lockoutExpiry).toBeGreaterThanOrEqual(Date.now());
    });
  });

  describe("deleteUserAccount async thunk", () => {
    it("should set loading on pending", () => {
      const newState = profileReducer(initialState, {
        type: deleteUserAccount.pending.type,
      });
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it("should clear state on fulfilled", () => {
      const loadingState: ProfileState = {
        ...initialState,
        loading: true,
        error: "Previous",
        passwordAttempts: 1,
      };
      const newState = profileReducer(loadingState, {
        type: deleteUserAccount.fulfilled.type,
      });
      expect(newState.loading).toBe(false);
      expect(newState.error).toBeNull();
      expect(newState.passwordAttempts).toBe(0);
    });

    it("should set error on rejected", () => {
      const loadingState: ProfileState = { ...initialState, loading: true };
      const newState = profileReducer(loadingState, {
        type: deleteUserAccount.rejected.type,
        payload: "Failed to delete account",
      });
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe("Failed to delete account");
    });
  });

  describe("resendVerificationEmail async thunk", () => {
    it("should set loading on pending", () => {
      const newState = profileReducer(initialState, {
        type: resendVerificationEmail.pending.type,
      });
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it("should clear loading on fulfilled", () => {
      const loadingState: ProfileState = { ...initialState, loading: true };
      const newState = profileReducer(loadingState, {
        type: resendVerificationEmail.fulfilled.type,
      });
      expect(newState.loading).toBe(false);
    });

    it("should set error on rejected", () => {
      const loadingState: ProfileState = { ...initialState, loading: true };
      const newState = profileReducer(loadingState, {
        type: resendVerificationEmail.rejected.type,
        payload: "Failed to resend verification email",
      });
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe("Failed to resend verification email");
    });
  });
});

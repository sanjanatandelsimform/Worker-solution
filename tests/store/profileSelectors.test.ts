/**
 * Profile Redux Selectors Tests
 *
 * Unit tests for profileSelectors: loading, error, passwordAttempts, lockout.
 */

import { describe, it, expect } from "vitest";
import {
  selectProfileLoading,
  selectProfileError,
  selectPasswordAttempts,
  selectIsAccountLocked,
  selectLockoutExpiry,
  selectProfileState,
} from "@/store/selectors/profileSelectors";
import type { RootState } from "@/store/store";
import type { ProfileState } from "@/types/profileTypes";

const createMockState = (profile: ProfileState): RootState =>
  ({
    auth: {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      authInitAttempted: false,
      tokens: { accessToken: null, refreshToken: null },
    },
    profile,
    registrationForm: {},
    user: {},
    dashboard: { data: null, loading: false, error: null, lastFetched: null },
  }) as RootState;

describe("Profile Selectors", () => {
  describe("selectProfileLoading", () => {
    it("should return true when profile is loading", () => {
      const state = createMockState({
        loading: true,
        error: null,
        passwordAttempts: 0,
        isAccountLocked: false,
        lockoutExpiry: null,
      });
      expect(selectProfileLoading(state)).toBe(true);
    });

    it("should return false when profile is not loading", () => {
      const state = createMockState({
        loading: false,
        error: null,
        passwordAttempts: 0,
        isAccountLocked: false,
        lockoutExpiry: null,
      });
      expect(selectProfileLoading(state)).toBe(false);
    });

    it("should return false when profile slice is undefined", () => {
      const state = createMockState(undefined as unknown as ProfileState);
      (state as { profile?: ProfileState }).profile = undefined;
      expect(selectProfileLoading(state)).toBe(false);
    });
  });

  describe("selectProfileError", () => {
    it("should return error message when present", () => {
      const state = createMockState({
        loading: false,
        error: "Update failed",
        passwordAttempts: 0,
        isAccountLocked: false,
        lockoutExpiry: null,
      });
      expect(selectProfileError(state)).toBe("Update failed");
    });

    it("should return null when no error", () => {
      const state = createMockState({
        loading: false,
        error: null,
        passwordAttempts: 0,
        isAccountLocked: false,
        lockoutExpiry: null,
      });
      expect(selectProfileError(state)).toBeNull();
    });
  });

  describe("selectPasswordAttempts", () => {
    it("should return passwordAttempts count", () => {
      const state = createMockState({
        loading: false,
        error: null,
        passwordAttempts: 3,
        isAccountLocked: false,
        lockoutExpiry: null,
      });
      expect(selectPasswordAttempts(state)).toBe(3);
    });

    it("should return 0 when profile is undefined", () => {
      const state = createMockState(undefined as unknown as ProfileState);
      (state as { profile?: ProfileState }).profile = undefined;
      expect(selectPasswordAttempts(state)).toBe(0);
    });
  });

  describe("selectIsAccountLocked", () => {
    it("should return true when account is locked", () => {
      const state = createMockState({
        loading: false,
        error: null,
        passwordAttempts: 5,
        isAccountLocked: true,
        lockoutExpiry: Date.now() + 60000,
      });
      expect(selectIsAccountLocked(state)).toBe(true);
    });

    it("should return false when not locked", () => {
      const state = createMockState({
        loading: false,
        error: null,
        passwordAttempts: 0,
        isAccountLocked: false,
        lockoutExpiry: null,
      });
      expect(selectIsAccountLocked(state)).toBe(false);
    });
  });

  describe("selectLockoutExpiry", () => {
    it("should return lockoutExpiry timestamp when set", () => {
      const expiry = Date.now() + 300000;
      const state = createMockState({
        loading: false,
        error: null,
        passwordAttempts: 5,
        isAccountLocked: true,
        lockoutExpiry: expiry,
      });
      expect(selectLockoutExpiry(state)).toBe(expiry);
    });

    it("should return null when no lockout", () => {
      const state = createMockState({
        loading: false,
        error: null,
        passwordAttempts: 0,
        isAccountLocked: false,
        lockoutExpiry: null,
      });
      expect(selectLockoutExpiry(state)).toBeNull();
    });
  });

  describe("selectProfileState", () => {
    it("should return full profile state", () => {
      const profileState: ProfileState = {
        loading: false,
        error: "Some error",
        passwordAttempts: 2,
        isAccountLocked: false,
        lockoutExpiry: null,
      };
      const state = createMockState(profileState);
      expect(selectProfileState(state)).toEqual(profileState);
    });
  });
});

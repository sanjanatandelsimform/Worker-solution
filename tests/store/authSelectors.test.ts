/**
 * Auth Redux Selectors Tests
 *
 * Unit tests for authSelectors: selectUser, selectIsAuthenticated, selectTokens, etc.
 */

import { describe, it, expect } from "vitest";
import {
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthInitAttempted,
  selectAccessToken,
  selectRefreshToken,
  selectUserFullName,
} from "@/store/selectors/authSelectors";
import type { RootState } from "@/store/store";
import type { UserAccount } from "@/types/auth";

const mockUser: UserAccount = {
  id: "user-1",
  firstName: "Jane",
  lastName: "Doe",
  businessName: "Acme Inc",
  phoneNumber: "+15551234567",
  industry: { id: 1, industry_name: "Tech", industry_code: "TECH" },
  zipCode: 94102,
  emailVerify: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const createMockState = (auth: RootState["auth"]): RootState =>
  ({
    auth,
    profile: {
      loading: false,
      error: null,
      passwordAttempts: 0,
      isAccountLocked: false,
      lockoutExpiry: null,
    },
    registrationForm: {},
    user: {},
    dashboard: { data: null, loading: false, error: null, lastFetched: null },
  }) as RootState;

describe("Auth Selectors", () => {
  describe("selectAuth", () => {
    it("should return the auth slice", () => {
      const state = createMockState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        authInitAttempted: true,
        tokens: { accessToken: "at", refreshToken: "rt" },
      });
      expect(selectAuth(state)).toEqual(state.auth);
    });
  });

  describe("selectUser", () => {
    it("should return user when authenticated", () => {
      const state = createMockState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        authInitAttempted: true,
        tokens: { accessToken: null, refreshToken: null },
      });
      expect(selectUser(state)).toEqual(mockUser);
    });

    it("should return null when not authenticated", () => {
      const state = createMockState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        authInitAttempted: true,
        tokens: { accessToken: null, refreshToken: null },
      });
      expect(selectUser(state)).toBeNull();
    });
  });

  describe("selectIsAuthenticated", () => {
    it("should return true when authenticated", () => {
      const state = createMockState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        authInitAttempted: true,
        tokens: { accessToken: null, refreshToken: null },
      });
      expect(selectIsAuthenticated(state)).toBe(true);
    });

    it("should return false when not authenticated", () => {
      const state = createMockState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        authInitAttempted: false,
        tokens: { accessToken: null, refreshToken: null },
      });
      expect(selectIsAuthenticated(state)).toBe(false);
    });
  });

  describe("selectIsLoading", () => {
    it("should return loading state", () => {
      const state = createMockState({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        authInitAttempted: false,
        tokens: { accessToken: null, refreshToken: null },
      });
      expect(selectIsLoading(state)).toBe(true);
    });
  });

  describe("selectAuthInitAttempted", () => {
    it("should return authInitAttempted", () => {
      const state = createMockState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        authInitAttempted: true,
        tokens: { accessToken: null, refreshToken: null },
      });
      expect(selectAuthInitAttempted(state)).toBe(true);
    });

    it("should return false when authInitAttempted is undefined", () => {
      const state = createMockState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        authInitAttempted: undefined as unknown as boolean,
        tokens: { accessToken: null, refreshToken: null },
      });
      expect(selectAuthInitAttempted(state)).toBe(false);
    });
  });

  describe("selectAccessToken", () => {
    it("should return access token when present", () => {
      const state = createMockState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        authInitAttempted: true,
        tokens: { accessToken: "access-123", refreshToken: "refresh-456" },
      });
      expect(selectAccessToken(state)).toBe("access-123");
    });

    it("should return undefined when tokens are null", () => {
      const state = createMockState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        authInitAttempted: true,
        tokens: { accessToken: null, refreshToken: null },
      });
      expect(selectAccessToken(state)).toBeNull();
    });
  });

  describe("selectRefreshToken", () => {
    it("should return refresh token when present", () => {
      const state = createMockState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        authInitAttempted: true,
        tokens: { accessToken: "at", refreshToken: "rt-789" },
      });
      expect(selectRefreshToken(state)).toBe("rt-789");
    });
  });

  describe("selectUserFullName", () => {
    it("should return full name when user exists", () => {
      const state = createMockState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        authInitAttempted: true,
        tokens: { accessToken: null, refreshToken: null },
      });
      expect(selectUserFullName(state)).toBe("Jane Doe");
    });

    it("should return empty string when user is null", () => {
      const state = createMockState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        authInitAttempted: true,
        tokens: { accessToken: null, refreshToken: null },
      });
      expect(selectUserFullName(state)).toBe("");
    });
  });
});

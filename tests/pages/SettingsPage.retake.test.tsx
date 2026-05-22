/**
 * Retake Assessment Integration Tests
 *
 * Tests the retake assessment flow at the Redux thunk and modal config level.
 * SettingsPage cannot be directly imported in jsdom due to react-aria-components
 * dependency chain hanging during module resolution, so we test the integration
 * pieces that power the retake flow:
 * 1. Redux thunk dispatch + state transitions (pending/fulfilled/rejected)
 * 2. Thunk unwrap() behavior for success navigation and error display
 * 3. API service -> thunk -> state integration
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";

// Mock authApi to prevent module-level interceptor setup
vi.mock("@/services/api/authApi", () => ({
  default: {
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
  refreshAccessToken: vi.fn(),
  signout: vi.fn(),
}));

// Mock transitive API dependencies
vi.mock("@/services/api/userApi", () => ({ getUserById: vi.fn() }));
vi.mock("@/services/api/dashboardApi", () => ({ getDashboard: vi.fn() }));

// Mock assessmentApi — control getAssessment behavior per test
const mockGetAssessment = vi.fn();
vi.mock("@/services/api/assessmentApi", () => ({
  getAssessment: (...args: unknown[]) => mockGetAssessment(...args),
  submitWorkforce: vi.fn(),
  submitCompensation: vi.fn(),
  submitBenefits: vi.fn(),
  submitGoals: vi.fn(),
  getAssessmentStatus: vi.fn(),
}));

// Mock assessmentCache to verify cache updates
const mockUpdateAssessmentCache = vi.fn();
vi.mock("@/hooks/assessmentCache", () => ({
  updateAssessmentCache: (...args: unknown[]) => mockUpdateAssessmentCache(...args),
  invalidateAssessmentCache: vi.fn(),
  fetchAssessmentWithCache: vi.fn(),
  getCachedAssessment: vi.fn(),
}));

// Mock profileApi — control retakeAssessment behavior per test
const mockRetakeAssessment = vi.fn();
vi.mock("@/services/api/profileApi", () => ({
  retakeAssessment: (...args: unknown[]) => mockRetakeAssessment(...args),
  updateProfile: vi.fn(),
  updateEmail: vi.fn(),
  updatePassword: vi.fn(),
  deleteAccount: vi.fn(),
  resendEmailVerification: vi.fn(),
  default: {},
}));

import profileReducer, { retakeAssessmentAction } from "@/store/slices/profileSlice";
import type { ProfileState } from "@/types/profileTypes";

const createTestStore = (overrides?: Partial<ProfileState>) =>
  configureStore({
    reducer: { profile: profileReducer },
    preloadedState: {
      profile: {
        loading: false,
        error: null,
        passwordAttempts: 0,
        isAccountLocked: false,
        lockoutExpiry: null,
        ...overrides,
      },
    },
  });

describe("Retake Assessment — Redux Thunk Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default successful response for getAssessment
    mockGetAssessment.mockResolvedValue({
      success: true,
      data: {
        assessmentType: "manual",
        data: {
          assessmentResponseId: 1,
          userId: "test-user",
          status: "in_progress",
          sections: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    });
  });

  describe("retakeAssessmentAction thunk state transitions", () => {
    it("should set loading=true and clear error on pending", () => {
      mockRetakeAssessment.mockReturnValue(new Promise(() => {}));
      const store = createTestStore({ error: "previous error" });

      store.dispatch(retakeAssessmentAction());

      const state = store.getState().profile;
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should set loading=false and error=null on fulfilled (success)", async () => {
      mockRetakeAssessment.mockResolvedValue({ success: true });
      const store = createTestStore();

      await store.dispatch(retakeAssessmentAction());

      const state = store.getState().profile;
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("should set loading=false and populate error on rejected (API failure)", async () => {
      mockRetakeAssessment.mockRejectedValue(new Error("API failure"));
      const store = createTestStore();

      await store.dispatch(retakeAssessmentAction());

      const state = store.getState().profile;
      expect(state.loading).toBe(false);
      expect(state.error).toBe("API failure");
    });

    it("should use default error message when error is not an Error instance", async () => {
      mockRetakeAssessment.mockRejectedValue("unknown error");
      const store = createTestStore();

      await store.dispatch(retakeAssessmentAction());

      const state = store.getState().profile;
      expect(state.error).toBe("Failed to retake assessment");
    });
  });

  describe("retakeAssessmentAction thunk API integration", () => {
    it("should call profileService.retakeAssessment() and getAssessment()", async () => {
      mockRetakeAssessment.mockResolvedValue({ success: true });
      const store = createTestStore();

      await store.dispatch(retakeAssessmentAction());

      expect(mockRetakeAssessment).toHaveBeenCalledTimes(1);
      expect(mockGetAssessment).toHaveBeenCalledTimes(1);
    });

    it("should call retakeAssessment with no arguments", async () => {
      mockRetakeAssessment.mockResolvedValue({ success: true });
      const store = createTestStore();

      await store.dispatch(retakeAssessmentAction());

      expect(mockRetakeAssessment).toHaveBeenCalledWith();
    });

    it("should call getAssessment after successful delete", async () => {
      mockRetakeAssessment.mockResolvedValue({ success: true });
      const store = createTestStore();

      await store.dispatch(retakeAssessmentAction());

      // Verify getAssessment was called after retakeAssessment
      expect(mockGetAssessment).toHaveBeenCalledWith();
    });

    it("should not call getAssessment if delete fails", async () => {
      mockRetakeAssessment.mockRejectedValue(new Error("Delete failed"));
      const store = createTestStore();

      await store.dispatch(retakeAssessmentAction());

      expect(mockRetakeAssessment).toHaveBeenCalledTimes(1);
      expect(mockGetAssessment).not.toHaveBeenCalled();
    });

    it("should fail if getAssessment returns success=false", async () => {
      mockRetakeAssessment.mockResolvedValue({ success: true });
      mockGetAssessment.mockResolvedValue({
        success: false,
        error: "Failed to fetch assessment",
      });
      const store = createTestStore();

      await store.dispatch(retakeAssessmentAction());

      const state = store.getState().profile;
      expect(state.loading).toBe(false);
      expect(state.error).toBe("Failed to fetch assessment");
    });

    it("should fail if getAssessment throws an error", async () => {
      mockRetakeAssessment.mockResolvedValue({ success: true });
      mockGetAssessment.mockRejectedValue(new Error("Network error"));
      const store = createTestStore();

      await store.dispatch(retakeAssessmentAction());

      const state = store.getState().profile;
      expect(state.loading).toBe(false);
      expect(state.error).toBe("Network error");
    });
  });

  describe("retakeAssessmentAction unwrap() for SettingsPage integration", () => {
    it("unwrap() should resolve on success — enables navigate('/assessment')", async () => {
      mockRetakeAssessment.mockResolvedValue({ success: true });
      const store = createTestStore();

      const result = store.dispatch(retakeAssessmentAction());
      await expect(result.unwrap()).resolves.toBeUndefined();
    });

    it("unwrap() should reject with error string — enables setRetakeError()", async () => {
      mockRetakeAssessment.mockRejectedValue(new Error("Server error"));
      const store = createTestStore();

      const result = store.dispatch(retakeAssessmentAction());
      await expect(result.unwrap()).rejects.toBe("Server error");
    });

    it("unwrap() should reject with default message for non-Error throws", async () => {
      mockRetakeAssessment.mockRejectedValue(42);
      const store = createTestStore();

      const result = store.dispatch(retakeAssessmentAction());
      await expect(result.unwrap()).rejects.toBe("Failed to retake assessment");
    });
  });

  describe("retakeAssessmentAction does not affect other profile state", () => {
    it("should not modify passwordAttempts on success", async () => {
      mockRetakeAssessment.mockResolvedValue({ success: true });
      const store = createTestStore({ passwordAttempts: 3 });

      await store.dispatch(retakeAssessmentAction());

      expect(store.getState().profile.passwordAttempts).toBe(3);
    });

    it("should not modify isAccountLocked on rejection", async () => {
      mockRetakeAssessment.mockRejectedValue(new Error("fail"));
      const store = createTestStore({ isAccountLocked: false });

      await store.dispatch(retakeAssessmentAction());

      expect(store.getState().profile.isAccountLocked).toBe(false);
    });
  });

  describe("retakeAssessmentAction cache update behavior", () => {
    it("should update assessment cache with fresh data on success", async () => {
      const freshAssessmentData = {
        assessmentType: "manual",
        data: {
          assessmentResponseId: 123,
          userId: "user-456",
          status: "in_progress",
          sections: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      mockRetakeAssessment.mockResolvedValue({ success: true });
      mockGetAssessment.mockResolvedValue({
        success: true,
        data: freshAssessmentData,
      });

      const store = createTestStore();
      await store.dispatch(retakeAssessmentAction());

      // Verify updateAssessmentCache was called
      expect(mockUpdateAssessmentCache).toHaveBeenCalledTimes(1);

      // Verify the updater function returns the fresh data
      const updaterFn = mockUpdateAssessmentCache.mock.calls[0][0];
      expect(typeof updaterFn).toBe("function");
      expect(updaterFn(null)).toEqual(freshAssessmentData);
    });

    it("should not update cache if getAssessment fails", async () => {
      mockRetakeAssessment.mockResolvedValue({ success: true });
      mockGetAssessment.mockResolvedValue({
        success: false,
        error: "Failed to fetch",
      });

      const store = createTestStore();
      await store.dispatch(retakeAssessmentAction());

      // Cache should not be updated on failure
      expect(mockUpdateAssessmentCache).not.toHaveBeenCalled();
    });

    it("should not update cache if getAssessment throws", async () => {
      mockRetakeAssessment.mockResolvedValue({ success: true });
      mockGetAssessment.mockRejectedValue(new Error("Network error"));

      const store = createTestStore();
      await store.dispatch(retakeAssessmentAction());

      // Cache should not be updated on error
      expect(mockUpdateAssessmentCache).not.toHaveBeenCalled();
    });
  });
});

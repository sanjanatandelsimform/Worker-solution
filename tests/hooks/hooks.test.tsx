/**
 * Comprehensive tests for custom hooks
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

// -------------------------------------------------------------------
// Mocks
// -------------------------------------------------------------------
vi.mock("@/services/api/assessmentApi", () => ({
  getAssessment: vi.fn(),
  submitWorkforce: vi.fn(),
  submitCompensation: vi.fn(),
  submitBenefits: vi.fn(),
  submitGoals: vi.fn(),
}));

vi.mock("@/services/api/authApi", () => ({
  default: { get: vi.fn(), post: vi.fn() },
  refreshAccessToken: vi.fn(),
  signout: vi.fn(),
}));

vi.mock("@/services/api/dashboardApi", () => ({ getDashboard: vi.fn() }));
vi.mock("@/services/api/industryApi", () => ({ getIndustry: vi.fn() }));
vi.mock("@/services/api/workforceApi", () => ({ getWorkforce: vi.fn() }));
vi.mock("@/services/api/recommendationsApi", () => ({ getRecommendations: vi.fn() }));
vi.mock("@/services/api/finchApi", () => ({ getFinchStatus: vi.fn() }));
vi.mock("@/services/api/profileApi", () => ({
  updateProfile: vi.fn(),
  updateEmail: vi.fn(),
  updatePassword: vi.fn(),
  deleteAccount: vi.fn(),
  resendEmailVerification: vi.fn(),
  retakeAssessment: vi.fn(),
}));
vi.mock("@/services/api/userApi", () => ({ getUserById: vi.fn() }));

import * as assessmentApi from "@/services/api/assessmentApi";
import { getFinchStatus } from "@/services/api/finchApi";
import { getIndustry } from "@/services/api/industryApi";

// Store slice imports
import authReducer from "@/store/slices/authSlice";
import profileReducer from "@/store/slices/profileSlice";
import userReducer from "@/store/slices/userSlice";
import dashboardReducer from "@/store/slices/dashboardSlice";
import industryReducer from "@/store/slices/industrySlice";
import workforceReducer from "@/store/slices/workforceSlice";
import recommendationsReducer from "@/store/slices/recommendationsSlice";
import finchStatusReducer from "@/store/slices/finchStatusSlice";
import registrationFormReducer from "@/store/slices/registrationFormSlice";

const createStore = (overrides: Record<string, any> = {}) =>
  configureStore({
    reducer: {
      auth: authReducer,
      profile: profileReducer,
      user: userReducer,
      dashboard: dashboardReducer,
      industry: industryReducer,
      workforce: workforceReducer,
      recommendations: recommendationsReducer,
      finchStatus: finchStatusReducer,
      registrationForm: registrationFormReducer,
    },
    preloadedState: overrides,
  });

const createWrapper = (store: ReturnType<typeof createStore>) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return Wrapper;
};

// -------------------------------------------------------------------
// useDebounce
// -------------------------------------------------------------------
import { useDebounce } from "@/hooks/useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("debounces value updates", async () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: "initial", delay: 300 },
    });
    rerender({ value: "updated", delay: 300 });
    // Still shows old value before timer fires
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("updated");
  });

  it("resets timer on rapid changes", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "a" },
    });
    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ value: "c" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    // Timer hasn't expired for "c" yet
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("c");
  });
});

// -------------------------------------------------------------------
// useBreakpoint
// -------------------------------------------------------------------
import { useBreakpoint } from "@/hooks/use-breakpoint";

describe("useBreakpoint", () => {
  it("returns matches from matchMedia", () => {
    const { result } = renderHook(() => useBreakpoint("md"));
    expect(typeof result.current).toBe("boolean");
  });

  it("updates when media query changes", () => {
    let changeHandler: ((e: any) => void) | null = null;
    const mockMQ = {
      matches: false,
      addEventListener: vi.fn((event: string, handler: (e: any) => void) => {
        if (event === "change") changeHandler = handler;
      }),
      removeEventListener: vi.fn(),
    };
    vi.spyOn(window, "matchMedia").mockReturnValue(mockMQ as any);

    const { result } = renderHook(() => useBreakpoint("lg"));
    expect(result.current).toBe(false);

    act(() => {
      changeHandler?.({ matches: true });
    });
    expect(result.current).toBe(true);
  });

  it("removes event listener on cleanup", () => {
    const mockMQ = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    vi.spyOn(window, "matchMedia").mockReturnValue(mockMQ as any);

    const { unmount } = renderHook(() => useBreakpoint("xl"));
    unmount();
    expect(mockMQ.removeEventListener).toHaveBeenCalled();
  });
});

// -------------------------------------------------------------------
// useAuthInit
// -------------------------------------------------------------------
import { useAuthInit } from "@/hooks/useAuthInit";

describe("useAuthInit", () => {
  it("returns isAuthReady from store authInitAttempted", () => {
    const store = createStore({
      auth: {
        authInitAttempted: true,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        tokens: { accessToken: null, refreshToken: null },
      },
    });
    const { result } = renderHook(() => useAuthInit(), { wrapper: createWrapper(store) });
    expect(result.current.isAuthReady).toBe(true);
  });

  it("returns false when auth not yet initialized", () => {
    const store = createStore();
    const { result } = renderHook(() => useAuthInit(), { wrapper: createWrapper(store) });
    expect(result.current.isAuthReady).toBe(false);
  });
});

// -------------------------------------------------------------------
// useAssessmentStatus
// -------------------------------------------------------------------
import { useAssessmentStatus } from "@/hooks/useAssessmentStatus";

describe("useAssessmentStatus", () => {
  it("returns loading initially", async () => {
    vi.mocked(assessmentApi.getAssessment).mockResolvedValue({ success: false, data: null });
    const { result } = renderHook(() => useAssessmentStatus());
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("sets assessmentData on success", async () => {
    const mockData = {
      assessmentType: "manual",
      data: {
        status: "pending",
        sections: {
          workforce: { employees: 10 },
          compensation: {},
          benefits: {},
          goals: {},
        },
      },
    };
    vi.mocked(assessmentApi.getAssessment).mockResolvedValue({
      success: true,
      data: mockData as any,
    });
    const { result } = renderHook(() => useAssessmentStatus());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.assessmentData).toEqual(mockData);
    expect(result.current.completionCount).toBeGreaterThan(0);
  });

  it("sets error on failure", async () => {
    vi.mocked(assessmentApi.getAssessment).mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useAssessmentStatus());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("Network error");
  });

  it("does not fetch when enabled=false", async () => {
    vi.clearAllMocks();
    const { result } = renderHook(() => useAssessmentStatus({ enabled: false }));
    expect(result.current.isLoading).toBe(false);
    expect(assessmentApi.getAssessment).not.toHaveBeenCalled();
  });

  it("reports isFinchCompleted correctly", async () => {
    vi.mocked(assessmentApi.getAssessment).mockResolvedValue({
      success: true,
      data: { assessmentType: "finch", data: { status: "completed", sections: {} } } as any,
    });
    const { result } = renderHook(() => useAssessmentStatus());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isFinchCompleted).toBe(true);
    expect(result.current.isFinchAssessmentIncomplete).toBe(false);
  });

  it("reports isFinchAssessmentIncomplete when finch not completed", async () => {
    vi.mocked(assessmentApi.getAssessment).mockResolvedValue({
      success: true,
      data: { assessmentType: "finch", data: { status: "in_progress", sections: {} } } as any,
    });
    const { result } = renderHook(() => useAssessmentStatus());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isFinchAssessmentIncomplete).toBe(true);
  });

  it("sets null assessmentData when success=false", async () => {
    vi.mocked(assessmentApi.getAssessment).mockResolvedValue({ success: false, data: null });
    const { result } = renderHook(() => useAssessmentStatus());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.assessmentData).toBeNull();
    expect(result.current.error).toBeNull();
  });
});

// -------------------------------------------------------------------
// useAssessment
// -------------------------------------------------------------------
import { useAssessment, useAssessmentNavigation } from "@/hooks/useAssessment";

describe("useAssessment", () => {
  beforeEach(() => {
    vi.mocked(assessmentApi.getAssessment).mockResolvedValue({ success: false, data: null });
  });

  it("loads progress on mount", async () => {
    const { result } = renderHook(() => useAssessment({ section: "workforce" }));
    await waitFor(() => expect(result.current.isLoadingGet).toBe(false));
    expect(assessmentApi.getAssessment).toHaveBeenCalled();
  });

  it("updateAnswer updates answers", async () => {
    const { result } = renderHook(() => useAssessment({ section: "workforce" }));
    await waitFor(() => expect(result.current.isLoadingGet).toBe(false));
    act(() => {
      result.current.updateAnswer("testKey", "testValue");
    });
    expect(result.current.answers.testKey).toBe("testValue");
  });

  it("updateAnswers merges answers", async () => {
    const { result } = renderHook(() => useAssessment({ section: "workforce" }));
    await waitFor(() => expect(result.current.isLoadingGet).toBe(false));
    act(() => {
      result.current.updateAnswers({ keyA: "a", keyB: "b" });
    });
    expect(result.current.answers.keyA).toBe("a");
    expect(result.current.answers.keyB).toBe("b");
  });

  it("clearError removes specific error", async () => {
    const { result } = renderHook(() => useAssessment({ section: "workforce" }));
    await waitFor(() => expect(result.current.isLoadingGet).toBe(false));
    act(() => {
      result.current.setErrors({ fieldA: "Error A", fieldB: "Error B" });
    });
    act(() => {
      result.current.clearError("fieldA");
    });
    expect(result.current.errors.fieldA).toBeUndefined();
    expect(result.current.errors.fieldB).toBe("Error B");
  });

  it("resetSection clears answers and errors", async () => {
    const { result } = renderHook(() => useAssessment({ section: "compensation" }));
    await waitFor(() => expect(result.current.isLoadingGet).toBe(false));
    act(() => {
      result.current.updateAnswer("k", "v");
    });
    act(() => {
      result.current.resetSection();
    });
    expect(result.current.answers).toEqual({});
    expect(result.current.errors).toEqual({});
    expect(result.current.isCompleted).toBe(false);
  });

  it("submitSection workforce success", async () => {
    vi.mocked(assessmentApi.submitWorkforce).mockResolvedValue({ success: true });
    const { result } = renderHook(() => useAssessment({ section: "workforce" }));
    await waitFor(() => expect(result.current.isLoadingGet).toBe(false));
    let response: any;
    await act(async () => {
      response = await result.current.submitSection();
    });
    expect(response?.success).toBe(true);
    expect(result.current.isCompleted).toBe(true);
  });

  it("submitSection compensation success", async () => {
    vi.mocked(assessmentApi.submitCompensation).mockResolvedValue({ success: true });
    const { result } = renderHook(() => useAssessment({ section: "compensation" }));
    await waitFor(() => expect(result.current.isLoadingGet).toBe(false));
    let response: any;
    await act(async () => {
      response = await result.current.submitSection();
    });
    expect(response?.success).toBe(true);
  });

  it("submitSection benefits success", async () => {
    vi.mocked(assessmentApi.submitBenefits).mockResolvedValue({ success: true });
    const { result } = renderHook(() => useAssessment({ section: "benefits" }));
    await waitFor(() => expect(result.current.isLoadingGet).toBe(false));
    let response: any;
    await act(async () => {
      response = await result.current.submitSection();
    });
    expect(response?.success).toBe(true);
  });

  it("submitSection goals success", async () => {
    vi.mocked(assessmentApi.submitGoals).mockResolvedValue({ success: true });
    const { result } = renderHook(() => useAssessment({ section: "goals" }));
    await waitFor(() => expect(result.current.isLoadingGet).toBe(false));
    let response: any;
    await act(async () => {
      response = await result.current.submitSection();
    });
    expect(response?.success).toBe(true);
  });

  it("submitSection sets field errors on failure", async () => {
    vi.mocked(assessmentApi.submitWorkforce).mockResolvedValue({
      success: false,
      fieldErrors: { field1: "Required" },
      message: "Validation failed",
    });
    const { result } = renderHook(() => useAssessment({ section: "workforce" }));
    await waitFor(() => expect(result.current.isLoadingGet).toBe(false));
    await act(async () => {
      await result.current.submitSection();
    });
    expect(result.current.errors.field1).toBe("Required");
    expect(result.current.apiError?.type).toBe("post");
  });

  it("submitSection handles thrown errors", async () => {
    vi.mocked(assessmentApi.submitWorkforce).mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useAssessment({ section: "workforce" }));
    await waitFor(() => expect(result.current.isLoadingGet).toBe(false));
    let response: any;
    await act(async () => {
      response = await result.current.submitSection();
    });
    expect(response?.success).toBe(false);
    expect(result.current.apiError?.message).toBe("Network error");
  });

  it("loadProgress sets apiError when getAssessment fails", async () => {
    vi.mocked(assessmentApi.getAssessment).mockRejectedValue(new Error("Load failed"));
    const { result } = renderHook(() => useAssessment({ section: "workforce" }));
    await waitFor(() => expect(result.current.isLoadingGet).toBe(false));
    expect(result.current.apiError?.type).toBe("get");
    expect(result.current.apiError?.message).toBe("Load failed");
  });

  it("loadProgress sets answers from API data", async () => {
    vi.mocked(assessmentApi.getAssessment).mockResolvedValue({
      success: true,
      data: {
        data: {
          sections: {
            workforce: { totalEmployees: 50 },
          },
        },
      } as any,
    });
    const { result } = renderHook(() => useAssessment({ section: "workforce" }));
    await waitFor(() => expect(result.current.isLoadingGet).toBe(false));
    expect(result.current.answers.totalEmployees).toBe(50);
    expect(result.current.isCompleted).toBe(true);
  });

  it("retryGetAssessment re-invokes loadProgress", async () => {
    vi.mocked(assessmentApi.getAssessment)
      .mockRejectedValueOnce(new Error("First failure"))
      .mockResolvedValueOnce({ success: false, data: null });
    const { result } = renderHook(() => useAssessment({ section: "workforce" }));
    await waitFor(() => expect(result.current.isLoadingGet).toBe(false));
    expect(result.current.apiError).toBeTruthy();

    await act(async () => {
      await result.current.retryGetAssessment();
    });
    expect(result.current.apiError).toBeNull();
  });
});

describe("useAssessmentNavigation", () => {
  it("initializes at workforce step", () => {
    const { result } = renderHook(() => useAssessmentNavigation());
    expect(result.current.currentStep).toBe("workforce");
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(false);
  });

  it("goToNextStep advances to next step", () => {
    const { result } = renderHook(() => useAssessmentNavigation());
    act(() => result.current.goToNextStep());
    expect(result.current.currentStep).toBe("compensation");
  });

  it("goToPreviousStep goes back", () => {
    const { result } = renderHook(() => useAssessmentNavigation());
    act(() => result.current.goToNextStep());
    act(() => result.current.goToPreviousStep());
    expect(result.current.currentStep).toBe("workforce");
  });

  it("does not go before first step", () => {
    const { result } = renderHook(() => useAssessmentNavigation());
    act(() => result.current.goToPreviousStep());
    expect(result.current.currentStep).toBe("workforce");
  });

  it("goes to last step and reports isLastStep", () => {
    const { result } = renderHook(() => useAssessmentNavigation());
    act(() => result.current.goToStep("goals"));
    expect(result.current.isLastStep).toBe(true);
    act(() => result.current.goToNextStep());
    expect(result.current.currentStep).toBe("goals"); // stays at last step
  });
});

// -------------------------------------------------------------------
// useIndustry
// -------------------------------------------------------------------
import { useIndustry } from "@/hooks/useIndustry";

describe("useIndustry", () => {
  it("fetches industry for manual assessment", async () => {
    vi.mocked(assessmentApi.getAssessment).mockResolvedValue({ success: false, data: null });
    vi.mocked(getFinchStatus).mockResolvedValue({ connection: null, latestSyncJob: null });
    vi.mocked(getIndustry).mockResolvedValue({ industry: { code: "c1", name: "Tech" } } as any);
    const store = createStore();
    renderHook(() => useIndustry(), { wrapper: createWrapper(store) });
    await waitFor(() => expect(getIndustry).toHaveBeenCalled());
  });

  it("returns loaded industry data from store", async () => {
    vi.mocked(assessmentApi.getAssessment).mockResolvedValue({ success: false, data: null });
    vi.mocked(getFinchStatus).mockResolvedValue({ connection: null, latestSyncJob: null });
    vi.mocked(getIndustry).mockResolvedValue({ industry: { code: "c1", name: "Tech" } } as any);
    const store = createStore();
    const { result } = renderHook(() => useIndustry(), { wrapper: createWrapper(store) });
    await waitFor(() => expect(getIndustry).toHaveBeenCalled());
    expect(result.current.error).toBeNull();
  });

  it("skips fetch when already loaded", async () => {
    vi.clearAllMocks();
    vi.mocked(assessmentApi.getAssessment).mockResolvedValue({ success: false, data: null });
    vi.mocked(getFinchStatus).mockResolvedValue({ connection: null, latestSyncJob: null });
    const store = createStore({
      industry: {
        data: { industry: { code: "c1", name: "Tech" } },
        loading: false,
        error: null,
        isLoaded: true,
      },
    });
    renderHook(() => useIndustry(), { wrapper: createWrapper(store) });
    await act(async () => {});
    expect(getIndustry).not.toHaveBeenCalled();
  });
});

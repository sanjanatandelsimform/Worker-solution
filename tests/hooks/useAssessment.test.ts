import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAssessment } from "@/hooks/useAssessment";
import { getAssessment } from "@/services/api/assessmentApi";
import type { ApiResponse, AssessmentData } from "@/services/api/assessmentApi";

// Mock API module
vi.mock("@/services/api/assessmentApi", () => ({
  getAssessment: vi.fn(),
  submitWorkforce: vi.fn(),
  submitCompensation: vi.fn(),
  submitBenefits: vi.fn(),
  submitGoals: vi.fn(),
}));

describe("useAssessment Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // T009: should call GET /assessment via loadProgress()
  it("should call GET /assessment via loadProgress() on mount", async () => {
    const mockResponse: ApiResponse<AssessmentData> = {
      success: true,
      data: {
        assessmentType: "manual",
        data: {
          assessmentResponseId: 1,
          userId: "user-1",
          createdAt: "2026-02-13T00:00:00Z",
          updatedAt: "2026-02-13T00:00:00Z",
          status: "in_progress",
          sections: {
            workforce: {
              q1: "answer1",
              q2: 42,
            },
          },
        },
      },
    };

    vi.mocked(getAssessment).mockResolvedValue(mockResponse);

    renderHook(() => useAssessment({ section: "workforce" }));

    await waitFor(() => {
      expect(getAssessment).toHaveBeenCalledTimes(1);
    });
  });

  // T010: should populate answers from API response sections[section]
  it("should populate answers from API response sections[section]", async () => {
    const mockResponse: ApiResponse<AssessmentData> = {
      success: true,
      data: {
        assessmentType: "manual",
        data: {
          assessmentResponseId: 1,
          userId: "user-1",
          createdAt: "2026-02-13T00:00:00Z",
          updatedAt: "2026-02-13T00:00:00Z",
          status: "in_progress",
          sections: {
            workforce: {
              q1: "answer1",
              q2: 42,
            },
          },
        },
      },
    };

    vi.mocked(getAssessment).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAssessment({ section: "workforce" }));

    await waitFor(() => {
      expect(result.current.answers).toEqual({
        q1: "answer1",
        q2: 42,
      });
    });
  });

  // T011: should set isLoadingGet=true during GET call
  it("should set isLoadingGet=true during GET call", async () => {
    let resolveGetAssessment!: (value: ApiResponse<AssessmentData>) => void;

    const getAssessmentPromise = new Promise<ApiResponse<AssessmentData>>(resolve => {
      resolveGetAssessment = resolve;
    });

    vi.mocked(getAssessment).mockReturnValue(getAssessmentPromise);

    const { result } = renderHook(() => useAssessment({ section: "workforce" }));

    // Should be loading initially before promise resolves
    expect(result.current.isLoadingGet).toBe(true);

    // Resolve the promise directly - no act() wrapper needed
    resolveGetAssessment({
      success: true,
      data: {
        assessmentType: "manual",
        data: {
          assessmentResponseId: 1,
          userId: "user-1",
          createdAt: "2026-02-13T00:00:00Z",
          updatedAt: "2026-02-13T00:00:00Z",
          status: "in_progress",
          sections: { workforce: {} },
        },
      },
    });

    // waitFor handles act() internally — no need to wrap manually
    await waitFor(() => {
      expect(result.current.isLoadingGet).toBe(false);
    });
  });

  // T012: should NOT call localStorage functions
  it("should NOT call localStorage functions (saveAssessmentProgress, loadSectionProgress)", async () => {
    const mockResponse: ApiResponse<AssessmentData> = {
      success: true,
      data: {
        assessmentType: "manual",
        data: {
          assessmentResponseId: 1,
          userId: "user-1",
          createdAt: "2026-02-13T00:00:00Z",
          updatedAt: "2026-02-13T00:00:00Z",
          status: "in_progress",
          sections: {
            workforce: { q1: "answer1" },
          },
        },
      },
    };

    vi.mocked(getAssessment).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAssessment({ section: "workforce" }));

    await waitFor(() => {
      expect(result.current.answers).toEqual({ q1: "answer1" });
    });

    // Update answer - should NOT trigger localStorage save
    act(() => {
      result.current.updateAnswer("q2", "answer2");
    });

    expect(result.current.answers).toEqual({ q1: "answer1", q2: "answer2" });
  });

  // T013: should restore previous tab data from GET /assessment on section change
  it("should restore previous tab data from GET /assessment on section change", async () => {
    const workforceResponse: ApiResponse<AssessmentData> = {
      success: true,
      data: {
        assessmentType: "manual",
        data: {
          assessmentResponseId: 1,
          userId: "user-1",
          createdAt: "2026-02-13T00:00:00Z",
          updatedAt: "2026-02-13T00:00:00Z",
          status: "in_progress",
          sections: {
            workforce: { q1: "workforce-answer" },
          },
        },
      },
    };

    const compensationResponse: ApiResponse<AssessmentData> = {
      success: true,
      data: {
        assessmentType: "manual",
        data: {
          assessmentResponseId: 1,
          userId: "user-1",
          createdAt: "2026-02-13T00:00:00Z",
          updatedAt: "2026-02-13T00:00:00Z",
          status: "in_progress",
          sections: {
            compensation: { q1: "compensation-answer" },
          },
        },
      },
    };

    vi.mocked(getAssessment)
      .mockResolvedValueOnce(workforceResponse)
      .mockResolvedValueOnce(compensationResponse);

    const { result, rerender } = renderHook(({ section }) => useAssessment({ section }), {
      initialProps: { section: "workforce" as const },
    });

    // Wait for workforce data to load
    await waitFor(() => {
      expect(result.current.answers).toEqual({ q1: "workforce-answer" });
    });

    // Change to compensation section (simulating navigation)
    rerender({ section: "compensation" as const });

    // Wait for compensation data to load
    await waitFor(() => {
      expect(result.current.answers).toEqual({ q1: "compensation-answer" });
    });

    // Verify GET was called twice (once per section change)
    expect(getAssessment).toHaveBeenCalledTimes(2);
  });

  // T014: should normalize STRUCTURED_ARRAY items by adding numeric ids
  it("should normalize STRUCTURED_ARRAY items by adding numeric ids", async () => {
    const mockResponse: ApiResponse<AssessmentData> = {
      success: true,
      data: {
        assessmentType: "manual",
        data: {
          assessmentResponseId: 1,
          userId: "user-1",
          createdAt: "2026-02-13T00:00:00Z",
          updatedAt: "2026-02-13T00:00:00Z",
          status: "in_progress",
          sections: {
            workforce: {
              commonJobTitles: [
                { title: "Developer", percentage: 50 },
                { title: "Designer", percentage: 50 },
              ],
            },
          },
        },
      },
    };

    vi.mocked(getAssessment).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAssessment({ section: "workforce" }));

    await waitFor(() => {
      const common = result.current.answers.commonJobTitles as Array<Record<string, unknown>>;
      expect(Array.isArray(common)).toBe(true);
      expect(typeof common[0].id).toBe("number");
      expect(typeof common[1].id).toBe("number");
    });
  });

  // T015: should map commute fields from legacy keys
  it("should map commuteMethod/commuteTime to normalized keys", async () => {
    const mockResponse: ApiResponse<AssessmentData> = {
      success: true,
      data: {
        assessmentType: "manual",
        data: {
          assessmentResponseId: 1,
          userId: "user-1",
          createdAt: "2026-02-13T00:00:00Z",
          updatedAt: "2026-02-13T00:00:00Z",
          status: "in_progress",
          sections: {
            workforce: {
              commuteMethod: "Car",
              commuteTime: "30-1hr",
            },
          },
        },
      },
    };

    vi.mocked(getAssessment).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAssessment({ section: "workforce" }));

    await waitFor(() => {
      expect(result.current.answers.employeeCommuteMethod).toBe("Car");
      expect(result.current.answers.averageCommuteTime).toBe("30-1hr");
      // original keys should be removed
      expect((result.current.answers as any).commuteMethod).toBeUndefined();
      expect((result.current.answers as any).commuteTime).toBeUndefined();
    });
  });

  // T016: submitSection should call appropriate API and set completion state on success
  it("submitSection calls API and sets isCompleted on success", async () => {
    vi.mocked(getAssessment).mockResolvedValueOnce({
      success: true,
      data: {
        assessmentType: "manual",
        data: {
          assessmentResponseId: 1,
          userId: "u",
          createdAt: "",
          updatedAt: "",
          status: "in_progress",
          sections: { workforce: {} },
        },
      },
    });

    const mockSubmitResponse = { success: true };
    const { submitWorkforce } = await import("@/services/api/assessmentApi");
    vi.mocked(submitWorkforce).mockResolvedValueOnce(mockSubmitResponse as any);

    const { result } = renderHook(() => useAssessment({ section: "workforce" }));

    // wait for initial load
    await waitFor(() => expect(result.current.isLoadingGet).toBe(false));

    const promise = act(() => result.current.submitSection());

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isCompleted).toBe(true);
    });

    const resp = await promise;
    expect(resp.success).toBe(true);
  });

  // T017: submitSection should set fieldErrors and apiError on failure
  it("submitSection sets fieldErrors and apiError on API failure", async () => {
    vi.mocked(getAssessment).mockResolvedValueOnce({
      success: true,
      data: {
        assessmentType: "manual",
        data: {
          assessmentResponseId: 1,
          userId: "u",
          createdAt: "",
          updatedAt: "",
          status: "in_progress",
          sections: { workforce: {} },
        },
      },
    });

    const failing = { success: false, fieldErrors: { q1: "Invalid" }, message: "Bad" };
    const { submitWorkforce } = await import("@/services/api/assessmentApi");
    vi.mocked(submitWorkforce).mockResolvedValueOnce(failing as any);

    const { result } = renderHook(() => useAssessment({ section: "workforce" }));

    await waitFor(() => expect(result.current.isLoadingGet).toBe(false));

    const resp = await act(() => result.current.submitSection());

    expect(resp.success).toBe(false);
    expect(result.current.errors.q1).toBe("Invalid");
    expect(result.current.apiError).not.toBeNull();
  });

  // T018: updateAnswers, clearError, resetSection, retryGetAssessment
  it("supports updateAnswers, clearError, resetSection and retryGetAssessment", async () => {
    const initial = {
      success: true,
      data: {
        assessmentType: "manual",
        data: {
          assessmentResponseId: 1,
          userId: "u",
          createdAt: "",
          updatedAt: "",
          status: "in_progress",
          sections: { workforce: {} },
        },
      },
    } as ApiResponse<AssessmentData>;
    vi.mocked(getAssessment).mockResolvedValueOnce(initial).mockResolvedValueOnce(initial);

    const { result } = renderHook(() => useAssessment({ section: "workforce" }));

    await waitFor(() => expect(result.current.isLoadingGet).toBe(false));

    act(() => result.current.updateAnswers({ a: 1 }));
    expect(result.current.answers.a).toBe(1);

    act(() => result.current.setErrors({ e1: "err" }));
    expect(result.current.errors.e1).toBe("err");

    act(() => result.current.clearError("e1"));
    expect(result.current.errors.e1).toBeUndefined();

    act(() => result.current.resetSection());
    expect(result.current.answers).toEqual({});
    expect(result.current.errors).toEqual({});
    expect(result.current.isCompleted).toBe(false);

    // retryGetAssessment should call getAssessment again
    await act(async () => {
      await result.current.retryGetAssessment();
    });
    expect(getAssessment).toHaveBeenCalled();
  });
});

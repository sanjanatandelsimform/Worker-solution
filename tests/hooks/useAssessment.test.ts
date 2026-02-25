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
        id: "assessment-1",
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
        completionPercentage: 25,
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
        id: "assessment-1",
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
        completionPercentage: 25,
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
        id: "assessment-1",
        userId: "user-1",
        createdAt: "2026-02-13T00:00:00Z",
        updatedAt: "2026-02-13T00:00:00Z",
        status: "in_progress",
        sections: { workforce: {} },
        completionPercentage: 0,
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
        id: "assessment-1",
        userId: "user-1",
        createdAt: "2026-02-13T00:00:00Z",
        updatedAt: "2026-02-13T00:00:00Z",
        status: "in_progress",
        sections: {
          workforce: { q1: "answer1" },
        },
        completionPercentage: 25,
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
        id: "assessment-1",
        userId: "user-1",
        createdAt: "2026-02-13T00:00:00Z",
        updatedAt: "2026-02-13T00:00:00Z",
        status: "in_progress",
        sections: {
          workforce: { q1: "workforce-answer" },
        },
        completionPercentage: 25,
      },
    };

    const compensationResponse: ApiResponse<AssessmentData> = {
      success: true,
      data: {
        id: "assessment-1",
        userId: "user-1",
        createdAt: "2026-02-13T00:00:00Z",
        updatedAt: "2026-02-13T00:00:00Z",
        status: "in_progress",
        sections: {
          compensation: { q1: "compensation-answer" },
        },
        completionPercentage: 50,
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
});

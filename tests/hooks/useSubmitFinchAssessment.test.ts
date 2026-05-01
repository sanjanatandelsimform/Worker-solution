import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSubmitFinchAssessment } from "@/hooks/useSubmitFinchAssessment";
import * as assessmentApi from "@/services/api/assessmentApi";
import type { FinchAssessmentPayload } from "@/types/finchAssessmentTypes";

const mockPayload: FinchAssessmentPayload = {
  workforce: {
    communicationMethods: [],
    hasDesklessEmployees: false,
    commuteMethods: [],
    commuteTime: "",
  },
  compensation: {
    offersAnnualRaises: false,
    shiftDifferentials: false,
    shortTermIncentives: [],
    longTermIncentives: [],
  },
  benefits: {
    workWithBenefitsBroker: null,
    benefitEnrollmentMonth: null,
    retirementVestingPeriod: "",
    retirementAutoEnroll: false,
    retirementHardshipWithdrawals: false,
  },
  goals: {
    workforceGoals: [],
    workforceGoalsRanking: ["Retain Talent", "Attract Talent", "Reduce Absenteeism"],
  },
};

describe("useSubmitFinchAssessment", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns initial state: isSubmitting=false, error=null, success=false", () => {
    const { result } = renderHook(() => useSubmitFinchAssessment());
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(false);
  });

  it("sets isSubmitting=true while API call is in flight", async () => {
    let resolve!: (value: { success: boolean }) => void;
    vi.spyOn(assessmentApi, "submitFinchAssessment").mockReturnValue(
      new Promise(r => (resolve = r))
    );

    const { result } = renderHook(() => useSubmitFinchAssessment());

    act(() => {
      result.current.submit(mockPayload);
    });

    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      resolve({ success: true });
    });
  });

  it("sets success=true after a 2xx response", async () => {
    vi.spyOn(assessmentApi, "submitFinchAssessment").mockResolvedValue({ success: true });
    const { result } = renderHook(() => useSubmitFinchAssessment());

    await act(async () => {
      await result.current.submit(mockPayload);
    });

    expect(result.current.success).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
  });

  it("sets error to message string after a non-2xx response", async () => {
    vi.spyOn(assessmentApi, "submitFinchAssessment").mockRejectedValue(new Error("Server error"));
    const { result } = renderHook(() => useSubmitFinchAssessment());

    await act(async () => {
      await result.current.submit(mockPayload);
    });

    expect(result.current.error).toBe("Server error");
    expect(result.current.success).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
  });

  it("clearError() resets error to null", async () => {
    vi.spyOn(assessmentApi, "submitFinchAssessment").mockRejectedValue(new Error("Server error"));
    const { result } = renderHook(() => useSubmitFinchAssessment());

    await act(async () => {
      await result.current.submit(mockPayload);
    });

    expect(result.current.error).toBe("Server error");

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});

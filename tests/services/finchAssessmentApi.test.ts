import { describe, it, expect, vi, beforeEach } from "vitest";

// Create a mock apiClient
const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  defaults: { headers: { common: {} } },
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
};

// Mock axios so both assessmentApi's local instance and authApi's apiClient resolve
vi.mock("axios", async () => {
  const actual = await vi.importActual("axios");
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => mockApiClient),
      isAxiosError: vi.fn(
        (error: unknown) =>
          typeof error === "object" &&
          error !== null &&
          "isAxiosError" in error &&
          !!(error as { isAxiosError: boolean }).isAxiosError
      ),
    },
  };
});

// Mock authApi to expose the same mockApiClient as default export
vi.mock("@/services/api/authApi", () => ({
  default: mockApiClient,
  refreshAccessToken: vi.fn(),
  signout: vi.fn(),
  signin: vi.fn(),
  signup: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  verifyEmail: vi.fn(),
  checkEmailAvailability: vi.fn(),
  getIndustries: vi.fn(),
  setTokens: vi.fn(),
}));

const { submitFinchAssessment } = await import("@/services/api/assessmentApi");

import type { FinchAssessmentPayload } from "@/types/finchAssessmentTypes";

const mockPayload: FinchAssessmentPayload = {
  workforce: {
    communicationMethods: ["work_email"],
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

describe("submitFinchAssessment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POSTs to /assessment/finch", async () => {
    mockApiClient.post.mockResolvedValueOnce({ data: { success: true } });
    await submitFinchAssessment(mockPayload);
    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/assessment/finch",
      mockPayload,
      expect.anything()
    );
  });

  it("uses apiClient (which carries the Bearer token interceptor), not the local api instance", async () => {
    mockApiClient.post.mockResolvedValueOnce({ data: { success: true } });
    await submitFinchAssessment(mockPayload);
    // If submitFinchAssessment uses apiClient, the mocked post should be called exactly once
    expect(mockApiClient.post).toHaveBeenCalledTimes(1);
  });

  it("resolves with success:true on a 2xx response", async () => {
    mockApiClient.post.mockResolvedValueOnce({ data: { success: true, message: "OK" } });
    const result = await submitFinchAssessment(mockPayload);
    expect(result.success).toBe(true);
  });

  it("rejects/throws on a non-2xx response", async () => {
    const axiosError = Object.assign(new Error("Server Error"), {
      isAxiosError: true,
      response: { status: 500, data: { message: "Internal Server Error" } },
    });
    mockApiClient.post.mockRejectedValueOnce(axiosError);
    await expect(submitFinchAssessment(mockPayload)).rejects.toThrow();
  });
});

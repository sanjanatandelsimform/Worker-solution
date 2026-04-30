/**
 * Tests for assessmentApi functions
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

// Mock axios.create to return a mock instance
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockInterceptors = {
  request: { use: vi.fn() },
  response: { use: vi.fn() },
};
const mockApi = {
  get: mockGet,
  post: mockPost,
  interceptors: mockInterceptors,
  defaults: { headers: { common: {} } },
};

vi.mock("axios", async () => {
  const actual = await vi.importActual("axios");
  return {
    ...actual,
    default: {
      ...(actual as any).default,
      create: vi.fn(() => mockApi),
      isAxiosError: (actual as any).default.isAxiosError,
    },
  };
});

vi.mock("@/services/api/authApi", () => ({
  default: {
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

vi.mock("@/utils/monthUtils", () => ({
  mapMonthToApiValue: vi.fn((v: string) => v),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("localStorage", {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  });
});

describe("assessmentApi", () => {
  it("getStates calls GET /lookup/states", async () => {
    mockGet.mockResolvedValue({ data: { data: { states: [{ stateAbbreviation: "CA" }] } } });
    const { getStates } = await import("@/services/api/assessmentApi");
    const result = await getStates();
    expect(result).toBeDefined();
  });

  it("submitWorkforce calls POST /assessment/workforce", async () => {
    mockPost.mockResolvedValue({ data: { success: true } });
    const { submitWorkforce } = await import("@/services/api/assessmentApi");
    const result = await submitWorkforce({ headCountSize: "50" });
    expect(result.success).toBe(true);
  });

  it("submitWorkforce transforms averageCommuteTime to commuteTime", async () => {
    mockPost.mockResolvedValue({ data: {} });
    const { submitWorkforce } = await import("@/services/api/assessmentApi");
    await submitWorkforce({ averageCommuteTime: "30 min", employeeCommuteMethod: "car" });
    const callArgs = mockPost.mock.calls[0];
    expect(callArgs[1].responses).toHaveProperty("commuteTime", "30 min");
    expect(callArgs[1].responses).toHaveProperty("commuteMethod", "car");
  });

  it("submitWorkforce handles API error", async () => {
    const axErr = new axios.AxiosError("fail", "ERR", undefined, {}, {
      status: 400,
      data: { message: "Bad input", errors: { "responses.zipCode": "Invalid zip" } },
      statusText: "Bad Request",
      headers: {},
      config: {} as any,
    } as any);
    mockPost.mockRejectedValue(axErr);
    const { submitWorkforce } = await import("@/services/api/assessmentApi");
    const result = await submitWorkforce({});
    expect(result.success).toBe(false);
    expect(result.fieldErrors).toBeDefined();
    expect(result.fieldErrors?.zipCode).toBe("Invalid zip");
  });

  it("submitCompensation calls POST /assessment/compensation", async () => {
    mockPost.mockResolvedValue({ data: {} });
    const { submitCompensation } = await import("@/services/api/assessmentApi");
    const result = await submitCompensation({ medianAnnualEarnings: "$50k" });
    expect(result.success).toBe(true);
  });

  it("submitCompensation returns validation error when raises=true but no month", async () => {
    const { submitCompensation } = await import("@/services/api/assessmentApi");
    const result = await submitCompensation({ offersAnnualRaises: true });
    expect(result.success).toBe(false);
  });

  it("submitCompensation normalizes offersAnnualRaises from string", async () => {
    mockPost.mockResolvedValue({ data: {} });
    const { submitCompensation } = await import("@/services/api/assessmentApi");
    await submitCompensation({
      offersAnnualRaises: "yes",
      annualRaiseMonth: "Jan",
      medianAnnualEarnings: "$50k",
      handlesHRPayrollInHouse: "Yes",
      payrollProvider: "ADP",
    });
    const callArgs = mockPost.mock.calls[0];
    expect(callArgs[1].responses.offersAnnualRaises).toBe(true);
  });

  it.each([
    { rawValue: "no", expected: false },
    { rawValue: "false", expected: false },
  ])(
    "submitCompensation normalizes offersAnnualRaises=$rawValue and does not require month",
    async ({ rawValue, expected }) => {
      mockPost.mockResolvedValue({ data: {} });
      const { submitCompensation } = await import("@/services/api/assessmentApi");
      const result = await submitCompensation({
        offersAnnualRaises: rawValue,
        medianAnnualEarnings: "$50k",
      });

      expect(result.success).toBe(true);
      expect(mockPost).toHaveBeenCalled();
      const payload = mockPost.mock.calls.at(-1)?.[1];
      expect(payload.responses.offersAnnualRaises).toBe(expected);
    }
  );

  it("submitBenefits calls POST /assessment/benefits", async () => {
    mockPost.mockResolvedValue({ data: {} });
    const { submitBenefits } = await import("@/services/api/assessmentApi");
    const result = await submitBenefits({ supplementalBenefits: ["PTO"] });
    expect(result.success).toBe(true);
  });

  it("submitGoals calls POST /assessment/goals", async () => {
    mockPost.mockResolvedValue({ data: {} });
    const { submitGoals } = await import("@/services/api/assessmentApi");
    const result = await submitGoals({ workforceGoals: ["g1"] });
    expect(result.success).toBe(true);
  });

  it("submitFeedback calls POST /assessment/feedback", async () => {
    mockPost.mockResolvedValue({ data: {} });
    const { submitFeedback } = await import("@/services/api/assessmentApi");
    const result = await submitFeedback(5, "Great!");
    expect(result.success).toBe(true);
  });

  it("getAssessmentStatus calls GET /assessment/status", async () => {
    mockGet.mockResolvedValue({ data: {} });
    const { getAssessmentStatus } = await import("@/services/api/assessmentApi");
    const result = await getAssessmentStatus();
    expect(result.success).toBe(true);
  });

  it("getAssessment calls GET /assessment", async () => {
    mockGet.mockResolvedValue({ data: { data: { sections: {} } } });
    const { getAssessment } = await import("@/services/api/assessmentApi");
    const result = await getAssessment();
    expect(result.success).toBe(true);
  });

  it("lookupZipCodes calls GET /lookup/zip-codes", async () => {
    mockGet.mockResolvedValue({ data: { success: true, data: { zipCodes: [] } } });
    const { lookupZipCodes } = await import("@/services/api/assessmentApi");
    const result = await lookupZipCodes("902");
    expect(result).toBeDefined();
    expect(mockGet).toHaveBeenCalledWith("/lookup/zip-codes", {
      params: { search: "902", limit: 5 },
    });
  });

  it("lookupZipCodes returns empty on error", async () => {
    mockGet.mockRejectedValue(new Error("fail"));
    const { lookupZipCodes } = await import("@/services/api/assessmentApi");
    const result = await lookupZipCodes("999");
    expect(result.success).toBe(false);
    expect(result.data.zipCodes).toEqual([]);
  });

  it("handleApiError handles no-response axios error", async () => {
    const axErr = new axios.AxiosError("fail", "ERR", undefined, {});
    // no response property
    mockPost.mockRejectedValue(axErr);
    const { submitGoals } = await import("@/services/api/assessmentApi");
    const result = await submitGoals({});
    expect(result.success).toBe(false);
    expect(result.message).toContain("Network");
  });

  it("handleApiError handles ECONNABORTED", async () => {
    const axErr = new axios.AxiosError("timeout", "ECONNABORTED");
    mockPost.mockRejectedValue(axErr);
    const { submitGoals } = await import("@/services/api/assessmentApi");
    const result = await submitGoals({});
    expect(result.success).toBe(false);
    expect(result.message).toContain("Timeout");
  });

  it("handleApiError handles non-axios error", async () => {
    mockPost.mockRejectedValue(new Error("Unknown"));
    const { submitGoals } = await import("@/services/api/assessmentApi");
    const result = await submitGoals({});
    expect(result.success).toBe(false);
    expect(result.error).toBe("Unknown");
  });
});

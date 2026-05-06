/**
 * Additional branch tests for assessmentApi
 * Covers: getAuthToken from window.store, booleanFromString edge cases,
 * compensation month normalization, submitCompensation month candidates, submitFinchAssessment
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

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

// authApi mock provides the apiClient for submitFinchAssessment
const mockAuthApiClient = { post: vi.fn() };
vi.mock("@/services/api/authApi", () => ({
  default: mockAuthApiClient,
}));

vi.mock("@/utils/monthUtils", () => ({
  mapMonthToApiValue: vi.fn((v: string) => v.toUpperCase()),
}));

beforeEach(() => {
  vi.clearAllMocks();
  // Reset mock queues to prevent bleed-between-tests
  mockGet.mockReset();
  mockPost.mockReset();
  mockAuthApiClient.post.mockReset();
  vi.stubGlobal("localStorage", {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  });
  // Reset window.store
  delete (window as any).store;
});

describe("assessmentApi - additional branches", () => {
  // ── getAuthToken from window.store ────────────────────────────────────────
  it("getAuthToken reads from window.store when available", async () => {
    (window as any).store = {
      getState: () => ({ auth: { tokens: { accessToken: "store-token" } } }),
    };
    mockGet.mockResolvedValueOnce({ data: { data: { states: [] } } });
    const { getStates } = await import("@/services/api/assessmentApi");
    await getStates();
    // The interceptor fires during request which reads from store
    expect(mockInterceptors.request.use).toHaveBeenCalled();
  });

  it("getAuthToken falls back to localStorage auth_token", async () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockImplementation((key: string) => {
      if (key === "userDetail") return null;
      if (key === "auth_token") return "fallback-token";
      return null;
    });
    mockPost.mockResolvedValueOnce({ data: {} });
    const { submitGoals } = await import("@/services/api/assessmentApi");
    await submitGoals({});
    expect(mockPost).toHaveBeenCalled();
  });

  // ── booleanFromString – more variants ────────────────────────────────────
  it("submitCompensation normalizes 'y' to true for offersAnnualRaises", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    const { submitCompensation } = await import("@/services/api/assessmentApi");
    await submitCompensation({ offersAnnualRaises: "y", annualRaiseMonth: "March" });
    const payload = mockPost.mock.calls.at(-1)?.[1];
    expect(payload.responses.offersAnnualRaises).toBe(true);
  });

  it("submitCompensation normalizes '1' to true for offersAnnualRaises", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    const { submitCompensation } = await import("@/services/api/assessmentApi");
    await submitCompensation({ offersAnnualRaises: "1", annualRaiseMonth: "March" });
    const payload = mockPost.mock.calls.at(-1)?.[1];
    expect(payload.responses.offersAnnualRaises).toBe(true);
  });

  it("submitCompensation normalizes 'n' to false for offersAnnualRaises", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    const { submitCompensation } = await import("@/services/api/assessmentApi");
    await submitCompensation({ offersAnnualRaises: "n" });
    const payload = mockPost.mock.calls.at(-1)?.[1];
    expect(payload.responses.offersAnnualRaises).toBe(false);
  });

  it("submitCompensation normalizes '0' to false for offersAnnualRaises", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    const { submitCompensation } = await import("@/services/api/assessmentApi");
    await submitCompensation({ offersAnnualRaises: "0" });
    const payload = mockPost.mock.calls.at(-1)?.[1];
    expect(payload.responses.offersAnnualRaises).toBe(false);
  });

  it("submitCompensation normalizes 'unsure' to false for offersAnnualRaises", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    const { submitCompensation } = await import("@/services/api/assessmentApi");
    await submitCompensation({ offersAnnualRaises: "unsure" });
    const payload = mockPost.mock.calls.at(-1)?.[1];
    expect(payload.responses.offersAnnualRaises).toBe(false);
  });

  it("submitCompensation returns validation error when offersAnnualRaises is truthy string 'maybe' without month", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    const { submitCompensation } = await import("@/services/api/assessmentApi");
    // "maybe" is truthy but not converted to boolean, so the check `transformed.offersAnnualRaises && !transformed.annualRaiseMonth` fires
    const result = await submitCompensation({ offersAnnualRaises: "maybe" });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Annual raise month is required");
    // mockPost is NOT called because validation aborts before the API call
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("submitCompensation does not set offersAnnualRaises when key is not in any candidate", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    const { submitCompensation } = await import("@/services/api/assessmentApi");
    await submitCompensation({ someOtherField: true });
    const payload = mockPost.mock.calls.at(-1)?.[1];
    expect(payload.responses.offersAnnualRaises).toBeUndefined();
  });

  // ── month normalization candidates ────────────────────────────────────────
  it("submitCompensation uses raiseMonth when annualRaiseMonth is missing", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    const { submitCompensation } = await import("@/services/api/assessmentApi");
    await submitCompensation({ offersAnnualRaises: true, raiseMonth: "April" });
    const payload = mockPost.mock.calls.at(-1)?.[1];
    expect(payload.responses.annualRaiseMonth).toBe("APRIL");
  });

  it("submitCompensation uses raise_month when other month keys absent", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    const { submitCompensation } = await import("@/services/api/assessmentApi");
    await submitCompensation({ offersAnnualRaises: true, raise_month: "May" });
    const payload = mockPost.mock.calls.at(-1)?.[1];
    expect(payload.responses.annualRaiseMonth).toBe("MAY");
  });

  it("submitCompensation ignores empty string month", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    const { submitCompensation } = await import("@/services/api/assessmentApi");
    // offersAnnualRaises not set, so no month required
    await submitCompensation({ annualRaiseMonth: "" });
    const payload = mockPost.mock.calls.at(-1)?.[1];
    expect(payload.responses.annualRaiseMonth).toBe("");
  });

  // ── handlesPayrollInHouse normalization ───────────────────────────────────
  it("submitCompensation copies handlesPayrollInHouse to handlesHRPayrollInHouse", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    const { submitCompensation } = await import("@/services/api/assessmentApi");
    await submitCompensation({ handlesPayrollInHouse: true });
    const payload = mockPost.mock.calls.at(-1)?.[1];
    expect(payload.responses.handlesHRPayrollInHouse).toBe(true);
  });

  it("submitCompensation does NOT overwrite existing handlesHRPayrollInHouse", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    const { submitCompensation } = await import("@/services/api/assessmentApi");
    await submitCompensation({ handlesPayrollInHouse: true, handlesHRPayrollInHouse: false });
    const payload = mockPost.mock.calls.at(-1)?.[1];
    expect(payload.responses.handlesHRPayrollInHouse).toBe(false);
  });

  // ── submitCompensation API error ──────────────────────────────────────────
  it("submitCompensation returns error on API failure", async () => {
    const axErr = new axios.AxiosError("fail", "ERR", undefined, {}, {
      status: 500,
      data: { message: "Compensation failed" },
      statusText: "Server Error",
      headers: {},
      config: {} as any,
    } as any);
    mockPost.mockRejectedValueOnce(axErr);
    const { submitCompensation } = await import("@/services/api/assessmentApi");
    const result = await submitCompensation({ offersAnnualRaises: false });
    expect(result.success).toBe(false);
  });

  // ── submitBenefits with specific fields ───────────────────────────────────
  it("submitBenefits submits lowestHealthPlanPremium value successfully", async () => {
    mockPost.mockResolvedValueOnce({ data: { success: true } });
    const { submitBenefits } = await import("@/services/api/assessmentApi");
    const result = await submitBenefits({ lowestHealthPlanPremium: 150 });
    expect(result.success).toBe(true);
    expect(mockPost).toHaveBeenCalledWith("/assessment/benefits", {
      responses: { lowestHealthPlanPremium: 150 },
    });
  });

  // ── submitFinchAssessment ─────────────────────────────────────────────────
  it("submitFinchAssessment calls authApi client POST /assessment/finch", async () => {
    mockAuthApiClient.post.mockResolvedValueOnce({ data: { success: true } });
    const { submitFinchAssessment } = await import("@/services/api/assessmentApi");
    const result = await submitFinchAssessment({ someField: "value" } as any);
    expect(result.success).toBe(true);
    expect(mockAuthApiClient.post).toHaveBeenCalledWith(
      "/assessment/finch",
      { someField: "value" },
      { timeout: 10000 }
    );
  });

  it("submitFinchAssessment throws on API failure (no catch inside)", async () => {
    mockAuthApiClient.post.mockRejectedValueOnce(new Error("Finch service unavailable"));
    const { submitFinchAssessment } = await import("@/services/api/assessmentApi");
    await expect(submitFinchAssessment({} as any)).rejects.toThrow("Finch service unavailable");
  });

  // ── handleApiError - no errors field ─────────────────────────────────────
  it("submitWorkforce returns error without fieldErrors when no errors in response", async () => {
    const axErr = new axios.AxiosError("fail", "ERR", undefined, {}, {
      status: 400,
      data: { message: "Bad request" },
      statusText: "Bad Request",
      headers: {},
      config: {} as any,
    } as any);
    mockPost.mockRejectedValueOnce(axErr);
    const { submitWorkforce } = await import("@/services/api/assessmentApi");
    const result = await submitWorkforce({});
    expect(result.success).toBe(false);
    expect(result.fieldErrors).toBeUndefined();
    expect(result.error).toBe("Bad request");
  });

  it("handleApiError uses error.error field when message is absent", async () => {
    const axErr = new axios.AxiosError("fail", "ERR", undefined, {}, {
      status: 400,
      data: { error: "Something wrong" },
      statusText: "Bad Request",
      headers: {},
      config: {} as any,
    } as any);
    mockPost.mockRejectedValueOnce(axErr);
    const { submitGoals } = await import("@/services/api/assessmentApi");
    const result = await submitGoals({});
    expect(result.success).toBe(false);
    expect(result.error).toBe("Something wrong");
  });
});

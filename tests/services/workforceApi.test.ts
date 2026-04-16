/**
 * Workforce API Service Tests
 *
 * Unit tests for workforceApi service layer.
 * Tests authentication, error handling, and response shape.
 * TDD: written before implementation (Red state expected initially).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";

// Mock axios FIRST
vi.mock("axios");

// Mock authApi to prevent apiClient initialization errors
vi.mock("@/services/api/authApi", () => {
  const mockApiClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  };
  return {
    default: mockApiClient,
    refreshAccessToken: vi.fn(),
  };
});

import apiClient from "@/services/api/authApi";
import { getWorkforce } from "@/services/api/workforceApi";
import type { WorkforceResponse } from "@/types/workforceTypes";

const mockWorkforceResponse: WorkforceResponse = {
  workforce: {
    totalWorkforce: 3120,
    enrolledBenefits: 2450,
    avgEmployeeCost: 2254,
    employerCostPerEmployee: 44000,
  },
  participation: {
    totalWorkforce: 3120,
    enrolledBenefits: 2450,
    retirementEnrollment: "64%",
    healthcareEnrollment: "78%",
    benefits: [
      { name: "FSA", enrollment: "31%" },
      { name: "Wellness", enrollment: "N/A" },
      { name: "EAP", enrollment: "N/A" },
    ],
    retirement: [{ name: "401k", enrollment: "64%" }],
    insurance: [
      { name: "Health", enrollment: "78%" },
      { name: "Dental", enrollment: "65%" },
      { name: "Vision", enrollment: "60%" },
      { name: "Life", enrollment: "45%" },
    ],
  },
  demographics: {
    employementType: [],
    gender: { men: "55%", women: "40%" },
    employmentBreakdownByAge: [],
  },
  compensation: {
    salaryBreakdown: { medianSalary: 60000, avgSalary: 65000, avgHourlyRate: 30 },
    workforceBreakdown: { departments: [] },
    benefitsCost: { employeeContribution: 468, employerCost: "$11000/yr", graph: [], table: [] },
  },
};

beforeEach(() => {
  localStorage.setItem(
    "userDetail",
    JSON.stringify({ auth: { tokens: { accessToken: "test-token-123" } } })
  );
});

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("workforceApi", () => {
  it("calls GET /api/v1/dashboard/workforce with Bearer token", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockWorkforceResponse });
    await getWorkforce();
    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/dashboard/workforce",
      expect.objectContaining({
        headers: { Authorization: "Bearer test-token-123" },
      })
    );
  });

  it("returns WorkforceResponse data on success", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockWorkforceResponse });
    const result = await getWorkforce();
    expect(result).toEqual(mockWorkforceResponse);
  });

  it("throws authentication error when no access token found in localStorage", async () => {
    localStorage.clear();
    await expect(getWorkforce()).rejects.toThrow("Authentication required. Please log in again.");
  });

  it("throws normalised error message on axios error", async () => {
    const axiosError = Object.assign(new Error("Network Error"), {
      isAxiosError: true,
      response: undefined,
      code: undefined,
    });
    vi.mocked(axios.isAxiosError).mockReturnValue(true);
    vi.mocked(apiClient.get).mockRejectedValue(axiosError);
    await expect(getWorkforce()).rejects.toThrow("Network Error");
  });
});

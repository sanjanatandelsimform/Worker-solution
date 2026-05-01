/**
 * useDashboardStatusPolling — New flag tests (feature 028)
 *
 * Covers:
 * - isRecommendationTabReady / isWorkforceTabReady / isIndustryTabReady derived from status
 * - hasExceededProcessingWindow based on createdAt timestamp
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("@/services/api/dashboardApi", () => ({
  getDashboardStatus: vi.fn(),
}));

import { getDashboardStatus } from "@/services/api/dashboardApi";
import { useDashboardStatusPolling } from "@/hooks/useDashboardStatusPolling";
import type { DashboardStatusResponse } from "@/types/dashboardStatusTypes";

const mockGetDashboardStatus = vi.mocked(getDashboardStatus);

/**
 * Returns a fully valid DashboardStatusResponse with allSettled=true so the
 * hook stops polling after the first call (prevents infinite setTimeout chains
 * from interfering with test assertions).
 */
function makeStatus(overrides: Partial<DashboardStatusResponse> = {}): DashboardStatusResponse {
  return {
    recommendation: { status: "pending", updatedAt: null },
    workforce: { status: "pending", updatedAt: null },
    industry: { status: "pending", updatedAt: null },
    allSettled: true, // stops polling immediately after first response
    suggestPollMs: 5000,
    updatedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 10_000).toISOString(),
    source: "test",
    providerType: null,
    ...overrides,
  };
}

describe("useDashboardStatusPolling — readiness flags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns false for all readiness flags when not enabled (no status)", () => {
    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: false }));
    expect(result.current.isRecommendationTabReady).toBe(false);
    expect(result.current.isWorkforceTabReady).toBe(false);
    expect(result.current.isIndustryTabReady).toBe(false);
  });

  it("returns false for all readiness flags when sections are pending", async () => {
    mockGetDashboardStatus.mockResolvedValue(makeStatus());

    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));

    await waitFor(() => expect(result.current.status).not.toBeNull());

    expect(result.current.isRecommendationTabReady).toBe(false);
    expect(result.current.isWorkforceTabReady).toBe(false);
    expect(result.current.isIndustryTabReady).toBe(false);
  });

  it("returns true for tabs with status=completed", async () => {
    mockGetDashboardStatus.mockResolvedValue(
      makeStatus({
        recommendation: { status: "completed", updatedAt: null },
        workforce: { status: "completed", updatedAt: null },
        industry: { status: "pending", updatedAt: null },
      })
    );

    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));

    await waitFor(() => expect(result.current.status).not.toBeNull());

    expect(result.current.isRecommendationTabReady).toBe(true);
    expect(result.current.isWorkforceTabReady).toBe(true);
    expect(result.current.isIndustryTabReady).toBe(false);
  });

  it("returns true for tabs with status=not_applicable", async () => {
    mockGetDashboardStatus.mockResolvedValue(
      makeStatus({
        recommendation: { status: "not_applicable", updatedAt: null },
        workforce: { status: "not_applicable", updatedAt: null },
        industry: { status: "not_applicable", updatedAt: null },
      })
    );

    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));

    await waitFor(() => expect(result.current.status).not.toBeNull());

    expect(result.current.isRecommendationTabReady).toBe(true);
    expect(result.current.isWorkforceTabReady).toBe(true);
    expect(result.current.isIndustryTabReady).toBe(true);
  });
});

describe("useDashboardStatusPolling — hasExceededProcessingWindow", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("is true when status is null (not enabled)", () => {
    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: false }));
    // No status loaded → hasExceededProcessingWindow starts as true (default)
    expect(result.current.hasExceededProcessingWindow).toBe(true);
  });

  it("is false when createdAt is within the 5-minute window", async () => {
    const recentCreatedAt = new Date(Date.now() - 10_000).toISOString(); // 10s ago
    mockGetDashboardStatus.mockResolvedValue(makeStatus({ createdAt: recentCreatedAt }));

    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));

    await waitFor(() => expect(result.current.status).not.toBeNull());
    await waitFor(() => expect(result.current.hasExceededProcessingWindow).toBe(false));
  });

  it("is true when createdAt is more than 5 minutes ago", async () => {
    const oldCreatedAt = new Date(Date.now() - 400_000).toISOString(); // 400s ago > 300s
    mockGetDashboardStatus.mockResolvedValue(makeStatus({ createdAt: oldCreatedAt }));

    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));

    await waitFor(() => expect(result.current.status).not.toBeNull());
    await waitFor(() => expect(result.current.hasExceededProcessingWindow).toBe(true));
  });
});

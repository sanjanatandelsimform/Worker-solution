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
    // No status loaded → createdAtMs is null → hasExceededProcessingWindow is true
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
    expect(result.current.hasExceededProcessingWindow).toBe(true);
  });
});

describe("useDashboardStatusPolling — stale flags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns false for all stale flags when not enabled (no status)", () => {
    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: false }));
    expect(result.current.isRecommendationTabStale).toBe(false);
    expect(result.current.isWorkforceTabStale).toBe(false);
    expect(result.current.isIndustryTabStale).toBe(false);
  });

  it("returns false for all stale flags when updatedAt is null (even if pending)", async () => {
    // makeStatus defaults all tabs to { status: "pending", updatedAt: null }
    mockGetDashboardStatus.mockResolvedValue(makeStatus());

    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));

    await waitFor(() => expect(result.current.status).not.toBeNull());

    expect(result.current.isRecommendationTabStale).toBe(false);
    expect(result.current.isWorkforceTabStale).toBe(false);
    expect(result.current.isIndustryTabStale).toBe(false);
  });

  it("returns true for isRecommendationTabStale when status=pending and updatedAt is > 5 min ago", async () => {
    const staleTime = new Date(Date.now() - 400_000).toISOString(); // 400s > 300s
    mockGetDashboardStatus.mockResolvedValue(
      makeStatus({
        recommendation: { status: "pending", updatedAt: staleTime },
      })
    );

    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));

    await waitFor(() => expect(result.current.status).not.toBeNull());

    expect(result.current.isRecommendationTabStale).toBe(true);
    // Other tabs have updatedAt: null → false
    expect(result.current.isWorkforceTabStale).toBe(false);
    expect(result.current.isIndustryTabStale).toBe(false);
  });

  it("returns false for isRecommendationTabStale when status=pending but updatedAt is recent (< 5 min)", async () => {
    const freshTime = new Date(Date.now() - 60_000).toISOString(); // 60s < 300s
    mockGetDashboardStatus.mockResolvedValue(
      makeStatus({
        recommendation: { status: "pending", updatedAt: freshTime },
      })
    );

    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));

    await waitFor(() => expect(result.current.status).not.toBeNull());

    expect(result.current.isRecommendationTabStale).toBe(false);
  });

  it("returns false for isRecommendationTabStale when status=completed regardless of updatedAt age", async () => {
    const staleTime = new Date(Date.now() - 400_000).toISOString();
    mockGetDashboardStatus.mockResolvedValue(
      makeStatus({
        recommendation: { status: "completed", updatedAt: staleTime },
      })
    );

    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));

    await waitFor(() => expect(result.current.status).not.toBeNull());

    expect(result.current.isRecommendationTabStale).toBe(false);
  });

  it("returns false for isRecommendationTabStale when status=not_applicable regardless of updatedAt age", async () => {
    const staleTime = new Date(Date.now() - 400_000).toISOString();
    mockGetDashboardStatus.mockResolvedValue(
      makeStatus({
        recommendation: { status: "not_applicable", updatedAt: staleTime },
      })
    );

    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));

    await waitFor(() => expect(result.current.status).not.toBeNull());

    expect(result.current.isRecommendationTabStale).toBe(false);
  });

  it("returns true independently for isWorkforceTabStale and isIndustryTabStale with stale+pending values", async () => {
    const staleTime = new Date(Date.now() - 400_000).toISOString();
    mockGetDashboardStatus.mockResolvedValue(
      makeStatus({
        workforce: { status: "pending", updatedAt: staleTime },
        industry: { status: "pending", updatedAt: staleTime },
      })
    );

    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));

    await waitFor(() => expect(result.current.status).not.toBeNull());

    expect(result.current.isRecommendationTabStale).toBe(false); // null updatedAt
    expect(result.current.isWorkforceTabStale).toBe(true);
    expect(result.current.isIndustryTabStale).toBe(true);
  });
});

describe("useDashboardStatusPolling — isAutomatedProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns false when not enabled (no status)", () => {
    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: false }));
    expect(result.current.isAutomatedProvider).toBe(false);
  });

  it("returns false when providerType is null", async () => {
    mockGetDashboardStatus.mockResolvedValue(makeStatus({ providerType: null }));
    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));
    await waitFor(() => expect(result.current.status).not.toBeNull());
    expect(result.current.isAutomatedProvider).toBe(false);
  });

  it("returns false when providerType is 'assisted'", async () => {
    mockGetDashboardStatus.mockResolvedValue(makeStatus({ providerType: "assisted" }));
    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));
    await waitFor(() => expect(result.current.status).not.toBeNull());
    expect(result.current.isAutomatedProvider).toBe(false);
  });

  it("returns true when providerType is 'automated'", async () => {
    mockGetDashboardStatus.mockResolvedValue(makeStatus({ providerType: "automated" }));
    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));
    await waitFor(() => expect(result.current.status).not.toBeNull());
    expect(result.current.isAutomatedProvider).toBe(true);
  });
});

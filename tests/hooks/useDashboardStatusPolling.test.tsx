import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDashboardStatusPolling } from "@/hooks/useDashboardStatusPolling";

const { mockGetDashboardStatus } = vi.hoisted(() => ({
  mockGetDashboardStatus: vi.fn(),
}));

vi.mock("@/services/api/dashboardApi", () => ({
  getDashboardStatus: () => mockGetDashboardStatus(),
}));

const baseResponse = {
  recommendation: { status: "completed" as const, updatedAt: "2026-04-27T10:52:52.098Z" },
  workforce: { status: "not_applicable" as const, updatedAt: null },
  industry: { status: "pending" as const, updatedAt: "2026-04-28T04:06:52.487Z" },
  allSettled: false,
  suggestPollMs: 3000,
  updatedAt: "2026-04-28T04:06:52.487Z",
  createdAt: "2026-04-27T10:52:52.098Z",
  source: "stored_state",
  providerType: "automated" as const,
};

const makeError = (status: number, message: string) => {
  const error = new Error(message) as Error & { response?: { status: number } };
  error.response = { status };
  return error;
};

describe("useDashboardStatusPolling", () => {
  const flushPromises = async () => {
    await act(async () => {
      await Promise.resolve();
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts polling when enabled is true", async () => {
    mockGetDashboardStatus.mockResolvedValueOnce({ ...baseResponse, allSettled: true });

    renderHook(() => useDashboardStatusPolling({ enabled: true }));

    await flushPromises();
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(1);
  });

  it("uses suggestPollMs for the next polling cycle", async () => {
    mockGetDashboardStatus
      .mockResolvedValueOnce({ ...baseResponse, suggestPollMs: 3000, allSettled: false })
      .mockResolvedValueOnce({ ...baseResponse, allSettled: true });

    renderHook(() => useDashboardStatusPolling({ enabled: true }));

    await flushPromises();
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(2999);
    });
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    await flushPromises();
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(2);
  });

  it("supports long suggestPollMs intervals without capping", async () => {
    mockGetDashboardStatus
      .mockResolvedValueOnce({ ...baseResponse, suggestPollMs: 3600000, allSettled: false })
      .mockResolvedValueOnce({ ...baseResponse, allSettled: true });

    renderHook(() => useDashboardStatusPolling({ enabled: true }));

    await flushPromises();
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(3599999);
    });
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    await flushPromises();
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(2);
  });

  it("uses minimum 1000ms when suggestPollMs is non-positive", async () => {
    mockGetDashboardStatus
      .mockResolvedValueOnce({ ...baseResponse, suggestPollMs: 0, allSettled: false })
      .mockResolvedValueOnce({ ...baseResponse, allSettled: true });

    renderHook(() => useDashboardStatusPolling({ enabled: true }));

    await flushPromises();
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(999);
    });
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    await flushPromises();
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(2);
  });

  it("stops polling once allSettled is true", async () => {
    mockGetDashboardStatus.mockResolvedValueOnce({ ...baseResponse, allSettled: true });

    renderHook(() => useDashboardStatusPolling({ enabled: true }));

    await flushPromises();
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(20000);
    });

    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(1);
  });

  it("retries non-429 failures with 1000/2000/4000 then stops with error", async () => {
    mockGetDashboardStatus
      .mockRejectedValueOnce(makeError(500, "failure-1"))
      .mockRejectedValueOnce(makeError(500, "failure-2"))
      .mockRejectedValueOnce(makeError(500, "failure-3"))
      .mockRejectedValueOnce(makeError(500, "failure-4"));

    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));

    await flushPromises();
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    await flushPromises();
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(2);

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    await flushPromises();
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(3);

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });
    await flushPromises();
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(4);

    expect(result.current.error).toBe("failure-4");
    expect(result.current.isPolling).toBe(false);
  });

  it("resets retry counter after a successful poll", async () => {
    mockGetDashboardStatus
      .mockRejectedValueOnce(makeError(500, "first-failure"))
      .mockResolvedValueOnce({ ...baseResponse, suggestPollMs: 3000, allSettled: false })
      .mockRejectedValueOnce(makeError(500, "second-failure"))
      .mockResolvedValueOnce({ ...baseResponse, allSettled: true });

    renderHook(() => useDashboardStatusPolling({ enabled: true }));

    await flushPromises();
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    await flushPromises();
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(2);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    await flushPromises();
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(3);

    await act(async () => {
      vi.advanceTimersByTime(999);
    });
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(3);

    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    await flushPromises();
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(4);
  });

  it("handles HTTP 429 with normal polling cadence", async () => {
    mockGetDashboardStatus
      .mockResolvedValueOnce({ ...baseResponse, suggestPollMs: 3000, allSettled: false })
      .mockRejectedValueOnce(makeError(429, "rate-limited"))
      .mockResolvedValueOnce({ ...baseResponse, allSettled: true });

    renderHook(() => useDashboardStatusPolling({ enabled: true }));

    await flushPromises();
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    await flushPromises();
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(2);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    await flushPromises();
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(3);
  });

  it("cleans up pending timers on unmount", async () => {
    mockGetDashboardStatus.mockResolvedValueOnce({ ...baseResponse, suggestPollMs: 3000 });

    const { unmount } = renderHook(() => useDashboardStatusPolling({ enabled: true }));

    await flushPromises();
    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(1);

    unmount();

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(mockGetDashboardStatus).toHaveBeenCalledTimes(1);
  });
});

/**
 * useFinchStatus Hook Tests
 *
 * TDD: Written BEFORE hook implementation (T012).
 * Tests cover: dispatch-on-mount, isConnected derivation, polling lifecycle.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import finchStatusReducer from "@/store/slices/finchStatusSlice";
import type { FinchStatusState } from "@/types/finchStatusTypes";

// ── Mock fetchFinchStatus thunk ────────────────────────────────────────────

const mockDispatch = vi.fn();

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: object) => unknown) => selector(mockStoreState),
}));

// Shared mutable state for selector mock
let mockStoreState = {
  finchStatus: {
    connection: null as FinchStatusState["connection"],
    latestSyncJob: null as FinchStatusState["latestSyncJob"],
    loading: false,
    error: null,
  },
};

vi.mock("@/store/slices/finchStatusSlice", async importOriginal => {
  const actual = await importOriginal<typeof import("@/store/slices/finchStatusSlice")>();
  return {
    ...actual,
    fetchFinchStatus: Object.assign(
      vi.fn(() => ({ type: "finchStatus/fetchFinchStatus/pending" })),
      {
        pending: actual.fetchFinchStatus.pending,
        fulfilled: actual.fetchFinchStatus.fulfilled,
        rejected: actual.fetchFinchStatus.rejected,
        typePrefix: actual.fetchFinchStatus.typePrefix,
      }
    ),
  };
});

// ── Import hook after mocks ────────────────────────────────────────────────
const { useFinchStatus } = await import("@/hooks/useFinchStatus");
const { fetchFinchStatus } = await import("@/store/slices/finchStatusSlice");

// ── Helpers ────────────────────────────────────────────────────────────────

function buildStore(finchStatus: Partial<FinchStatusState> = {}) {
  return configureStore({
    reducer: { finchStatus: finchStatusReducer },
    preloadedState: {
      finchStatus: {
        connection: null,
        latestSyncJob: null,
        loading: false,
        error: null,
        ...finchStatus,
      },
    },
  });
}

type WrapperProps = { children: React.ReactNode };
function wrapper({ children }: WrapperProps) {
  const store = buildStore();
  return React.createElement(Provider, { store }, children);
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("useFinchStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatch.mockImplementation(action => action);
    mockStoreState = {
      finchStatus: {
        connection: null,
        latestSyncJob: null,
        loading: false,
        error: null,
      },
    };
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  // ── Dispatch-on-mount ────────────────────────────────────────────────────

  it("dispatches fetchFinchStatus immediately on mount", () => {
    renderHook(() => useFinchStatus(), { wrapper });
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(fetchFinchStatus());
  });

  // ── isConnected derivation ───────────────────────────────────────────────

  it("isConnected is true when connection.status is 'connected'", () => {
    mockStoreState.finchStatus.connection = {
      id: "conn-uuid",
      status: "connected",
      providerId: "gusto",
      lastSyncedAt: null,
      createdAt: "2026-04-01T10:00:00Z",
    };
    const { result } = renderHook(() => useFinchStatus(), { wrapper });
    expect(result.current.isConnected).toBe(true);
    expect(result.current.connectionStatus).toBe("connected");
  });

  it("isConnected is false when connection.status is 'disconnected'", () => {
    mockStoreState.finchStatus.connection = {
      id: "conn-uuid",
      status: "disconnected",
      providerId: "gusto",
      lastSyncedAt: null,
      createdAt: "2026-04-01T10:00:00Z",
    };
    const { result } = renderHook(() => useFinchStatus(), { wrapper });
    expect(result.current.isConnected).toBe(false);
  });

  it("isConnected is false when connection.status is 'reauth_required'", () => {
    mockStoreState.finchStatus.connection = {
      id: "conn-uuid",
      status: "reauth_required",
      providerId: "gusto",
      lastSyncedAt: null,
      createdAt: "2026-04-01T10:00:00Z",
    };
    const { result } = renderHook(() => useFinchStatus(), { wrapper });
    expect(result.current.isConnected).toBe(false);
  });

  it("isConnected is false when connection is null (initial state)", () => {
    const { result } = renderHook(() => useFinchStatus(), { wrapper });
    expect(result.current.isConnected).toBe(false);
    expect(result.current.connectionStatus).toBeNull();
  });

  it("exposes syncJobStatus from latestSyncJob", () => {
    mockStoreState.finchStatus.latestSyncJob = {
      id: "sync-uuid",
      status: "pending",
      errorMessage: null,
      startedAt: null,
      completedAt: null,
      createdAt: "2026-04-01T10:00:00Z",
    };
    const { result } = renderHook(() => useFinchStatus(), { wrapper });
    expect(result.current.syncJobStatus).toBe("pending");
  });

  it("syncJobStatus is null when latestSyncJob is null", () => {
    const { result } = renderHook(() => useFinchStatus(), { wrapper });
    expect(result.current.syncJobStatus).toBeNull();
  });

  it("exposes isLoading from store", () => {
    mockStoreState.finchStatus.loading = true;
    const { result } = renderHook(() => useFinchStatus(), { wrapper });
    expect(result.current.isLoading).toBe(true);
  });

  it("exposes error from store", () => {
    mockStoreState.finchStatus.error = "Failed to fetch Finch status";
    const { result } = renderHook(() => useFinchStatus(), { wrapper });
    expect(result.current.error).toBe("Failed to fetch Finch status");
  });

  // ── Polling lifecycle ───────────────────────────────────────────────────

  it("polls every 15 seconds (3 dispatches: mount + 2 intervals)", () => {
    vi.useFakeTimers();
    renderHook(() => useFinchStatus(), { wrapper });
    expect(mockDispatch).toHaveBeenCalledTimes(1); // mount
    vi.advanceTimersByTime(15_000);
    expect(mockDispatch).toHaveBeenCalledTimes(2); // +1 poll
    vi.advanceTimersByTime(15_000);
    expect(mockDispatch).toHaveBeenCalledTimes(3); // +1 poll
  });

  it("clears interval on unmount — no dispatch after unmount", () => {
    vi.useFakeTimers();
    const { unmount } = renderHook(() => useFinchStatus(), { wrapper });
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    unmount();
    vi.advanceTimersByTime(30_000);
    // Should still be 1 — no additional dispatches after unmount
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
});

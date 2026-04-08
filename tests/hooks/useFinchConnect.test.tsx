/**
 * Tests for useFinchConnect hook
 *
 * TDD: Written BEFORE implementation (T009–T016).
 * Tests cover: happy path, loading states, error paths, onError, onClose, concurrent guard.
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import React from "react";

// ── Mocks (set up before any imports of the module under test) ──────────────

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async importOriginal => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockOpen = vi.fn();
type OnSuccessFn = (e: { code: string; state?: string }) => void;
type OnErrorFn = (e: { errorMessage: string; errorType?: string }) => void;
type OnCloseFn = () => void;

let capturedOnSuccess: OnSuccessFn | null = null;
let capturedOnError: OnErrorFn | null = null;
let capturedOnClose: OnCloseFn | null = null;

vi.mock("@tryfinch/react-connect", () => ({
  useFinchConnect: (args: { onSuccess: OnSuccessFn; onError: OnErrorFn; onClose: OnCloseFn }) => {
    capturedOnSuccess = args.onSuccess;
    capturedOnError = args.onError;
    capturedOnClose = args.onClose;
    return { open: mockOpen };
  },
}));

const mockGetFinchSessionId = vi.fn();
const mockExchangeFinchCode = vi.fn();
vi.mock("@/services/api/finchApi", () => ({
  getFinchSessionId: () => mockGetFinchSessionId(),
  exchangeFinchCode: (code: string) => mockExchangeFinchCode(code),
}));

// ── Import hook after all mocks ─────────────────────────────────────────────
const { useFinchConnect } = await import("@/hooks/useFinchConnect");

// ── Wrapper (provides Router context for useNavigate) ──────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

// ── Tests ──────────────────────────────────────────────────────────────────

describe("useFinchConnect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedOnSuccess = null;
    capturedOnError = null;
    capturedOnClose = null;
    mockGetFinchSessionId.mockResolvedValue({
      sessionId: "sess_abc123",
      connectUrl: "https://connect.tryfinch.com/authorize/sess_abc123",
    });
    mockExchangeFinchCode.mockResolvedValue({
      connectionId: "conn-uuid-123",
      connectionStatus: "connected",
      providerId: "gusto",
      syncJobId: "sync-uuid-456",
      syncJobStatus: "pending",
    });
  });

  // T010 — isLoading starts false
  it("isLoading is false on initial render", () => {
    const { result } = renderHook(() => useFinchConnect(), { wrapper });
    expect(result.current.isLoading).toBe(false);
  });

  // T010 — isLoading becomes true during fetching-session
  it("isLoading is true immediately after connectWithFinch is called", async () => {
    // Never resolve to hold the loading state open
    mockGetFinchSessionId.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useFinchConnect(), { wrapper });

    act(() => {
      void result.current.connectWithFinch();
    });

    expect(result.current.isLoading).toBe(true);
  });

  // T009 — happy path
  it("happy path: calls getFinchSessionId, opens SDK, exchanges code, navigates", async () => {
    const { result } = renderHook(() => useFinchConnect(), { wrapper });

    await act(async () => {
      await result.current.connectWithFinch();
    });

    expect(mockGetFinchSessionId).toHaveBeenCalledTimes(1);
    expect(mockOpen).toHaveBeenCalledWith({ sessionId: "sess_abc123" });

    // Simulate SDK onSuccess callback
    await act(async () => {
      capturedOnSuccess!({ code: "test-auth-code" });
    });

    await waitFor(() => {
      expect(mockExchangeFinchCode).toHaveBeenCalledWith("test-auth-code");
      expect(mockNavigate).toHaveBeenCalledWith("/additional-questions");
    });
  });

  // T011 — session ID fetch failure
  it("session ID fetch failure: sets error and resets to idle", async () => {
    mockGetFinchSessionId.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useFinchConnect(), { wrapper });

    await act(async () => {
      await result.current.connectWithFinch();
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Network error");
      expect(result.current.isLoading).toBe(false);
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // T012 — Finch onError callback
  it("onError callback: sets error and resets to idle", async () => {
    const { result } = renderHook(() => useFinchConnect(), { wrapper });

    await act(async () => {
      await result.current.connectWithFinch();
    });

    act(() => {
      capturedOnError!({
        errorMessage: "employer_connection_error",
        errorType: "employer_connection_error",
      });
    });

    await waitFor(() => {
      expect(result.current.error).toBe("employer_connection_error");
      expect(result.current.isLoading).toBe(false);
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // T013 — Finch onClose callback
  it("onClose callback: resets to idle without setting error", async () => {
    const { result } = renderHook(() => useFinchConnect(), { wrapper });

    await act(async () => {
      await result.current.connectWithFinch();
    });

    act(() => {
      capturedOnClose!();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.error).toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // T014 — code exchange failure
  it("code exchange failure: sets error and resets to idle without navigating", async () => {
    mockExchangeFinchCode.mockRejectedValue(new Error("Exchange failed"));
    const { result } = renderHook(() => useFinchConnect(), { wrapper });

    await act(async () => {
      await result.current.connectWithFinch();
    });

    await act(async () => {
      capturedOnSuccess!({ code: "test-code" });
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Exchange failed");
      expect(result.current.isLoading).toBe(false);
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // T015 — empty code in onSuccess
  it("empty code in onSuccess: sets error, does not call exchangeFinchCode", async () => {
    const { result } = renderHook(() => useFinchConnect(), { wrapper });

    await act(async () => {
      await result.current.connectWithFinch();
    });

    await act(async () => {
      capturedOnSuccess!({ code: "" });
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Failed to complete Finch connection. Please try again.");
      expect(result.current.isLoading).toBe(false);
    });
    expect(mockExchangeFinchCode).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // T016 — concurrent call guard
  it("calling connectWithFinch while loading is a no-op", async () => {
    mockGetFinchSessionId.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useFinchConnect(), { wrapper });

    act(() => {
      void result.current.connectWithFinch();
    });

    expect(result.current.isLoading).toBe(true);

    // Second call should be ignored
    await act(async () => {
      await result.current.connectWithFinch();
    });

    expect(mockGetFinchSessionId).toHaveBeenCalledTimes(1);
  });

  // clearError — resets error to null
  it("clearError() resets error to null", async () => {
    mockGetFinchSessionId.mockRejectedValue(new Error("Some error"));
    const { result } = renderHook(() => useFinchConnect(), { wrapper });

    await act(async () => {
      await result.current.connectWithFinch();
    });
    await waitFor(() => expect(result.current.error).toBe("Some error"));

    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });

  // auto-clear — error is cleared when a new connectWithFinch call begins
  it("error is cleared when a new connectWithFinch call begins", async () => {
    mockGetFinchSessionId.mockRejectedValueOnce(new Error("First failure"));
    const { result } = renderHook(() => useFinchConnect(), { wrapper });

    // First attempt sets error
    await act(async () => {
      await result.current.connectWithFinch();
    });
    await waitFor(() => expect(result.current.error).toBe("First failure"));

    // Second attempt clears error immediately
    mockGetFinchSessionId.mockReturnValue(new Promise(() => {})); // hold open
    act(() => {
      void result.current.connectWithFinch();
    });
    expect(result.current.error).toBeNull();
  });
});

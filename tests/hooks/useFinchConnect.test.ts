/**
 * useFinchConnect Hook Tests
 *
 * Covers: initial state, connectWithFinch flow (success + errors),
 * onSuccess / onError / onClose SDK callbacks, isLoading / isPageLoading
 * derivation, clearError, and guard when already loading.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFinchConnect } from "@/hooks/useFinchConnect";
import * as finchApi from "@/services/api/finchApi";
import * as dashboardApi from "@/services/api/dashboardApi";

// ── Mock navigate ──────────────────────────────────────────────────────────
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async importOriginal => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

// ── Mock Finch SDK — capture callbacks each render ─────────────────────────
const mockOpen = vi.fn();

type OnSuccessArgs = { code: string; state?: string };
type OnErrorArgs = { errorMessage: string };

let capturedOnSuccess: ((args: OnSuccessArgs) => Promise<void>) | undefined;
let capturedOnError: ((args: OnErrorArgs) => void) | undefined;
let capturedOnClose: (() => void) | undefined;

vi.mock("@tryfinch/react-connect", () => ({
  useFinchConnect: vi.fn(({ onSuccess, onError, onClose }) => {
    capturedOnSuccess = onSuccess;
    capturedOnError = onError;
    capturedOnClose = onClose;
    return { open: mockOpen };
  }),
}));

// ── Mock finchApi ──────────────────────────────────────────────────────────
vi.mock("@/services/api/finchApi", () => ({
  getFinchSessionId: vi.fn(),
  exchangeFinchCode: vi.fn(),
}));

// ── Mock dashboardApi ──────────────────────────────────────────────────────────
vi.mock("@/services/api/dashboardApi", () => ({
  getDashboardStatus: vi.fn(),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

/** Render the hook and return the result reference. */
function render() {
  return renderHook(() => useFinchConnect());
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("useFinchConnect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedOnSuccess = undefined;
    capturedOnError = undefined;
    capturedOnClose = undefined;
    vi.mocked(dashboardApi.getDashboardStatus).mockResolvedValue({} as any);
  });

  // ── Initial state ──────────────────────────────────────────────────────

  it("returns initial state: isLoading=false, isPageLoading=false, error=null", () => {
    const { result } = render();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isPageLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.connectWithFinch).toBe("function");
    expect(typeof result.current.clearError).toBe("function");
  });

  // ── connectWithFinch success flow ──────────────────────────────────────

  it("calls getFinchSessionId and then open() with the returned sessionId", async () => {
    vi.mocked(finchApi.getFinchSessionId).mockResolvedValue({ sessionId: "sess-abc" });

    const { result } = render();

    await act(async () => {
      await result.current.connectWithFinch();
    });

    expect(finchApi.getFinchSessionId).toHaveBeenCalledTimes(1);
    expect(mockOpen).toHaveBeenCalledWith({ sessionId: "sess-abc" });
    expect(result.current.error).toBeNull();
  });

  it("is in isPageLoading state (fetching-session) before getFinchSessionId resolves", async () => {
    let resolveSession!: (value: { sessionId: string }) => void;
    vi.mocked(finchApi.getFinchSessionId).mockReturnValue(new Promise(r => (resolveSession = r)));

    const { result } = render();

    // Start but don't await — promise is still pending
    act(() => {
      void result.current.connectWithFinch();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isPageLoading).toBe(true);

    // Clean up
    await act(async () => {
      resolveSession({ sessionId: "sess-xyz" });
    });
  });

  it("transitions to connecting (isPageLoading=false) after open() is called", async () => {
    let resolveSession!: (value: { sessionId: string }) => void;
    vi.mocked(finchApi.getFinchSessionId).mockReturnValue(new Promise(r => (resolveSession = r)));

    const { result } = render();

    act(() => {
      void result.current.connectWithFinch();
    });

    // Resolve session → status becomes "connecting"
    await act(async () => {
      resolveSession({ sessionId: "sess-xyz" });
    });

    // "connecting" → isLoading=true but isPageLoading=false
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isPageLoading).toBe(false);
    expect(mockOpen).toHaveBeenCalledWith({ sessionId: "sess-xyz" });
  });

  it("does nothing if connectWithFinch is called while already loading", async () => {
    let resolveSession!: (value: { sessionId: string }) => void;
    vi.mocked(finchApi.getFinchSessionId).mockReturnValue(new Promise(r => (resolveSession = r)));

    const { result } = render();

    // First call — leaves status pending (fetching-session)
    act(() => {
      void result.current.connectWithFinch();
    });

    expect(result.current.isLoading).toBe(true);

    // Second call while loading — should be a no-op (no second getFinchSessionId call)
    act(() => {
      void result.current.connectWithFinch();
    });

    expect(finchApi.getFinchSessionId).toHaveBeenCalledTimes(1);

    // Clean up — resolve the pending session so the hook is in a stable state
    await act(async () => {
      resolveSession({ sessionId: "sess-xyz" });
    });

    // Now in "connecting" state — isLoading is still true (modal is open)
    expect(result.current.isLoading).toBe(true);
  });

  // ── connectWithFinch error handling ────────────────────────────────────

  it("sets error and resets to idle when getFinchSessionId throws an Error", async () => {
    vi.mocked(finchApi.getFinchSessionId).mockRejectedValue(new Error("Network failure"));

    const { result } = render();

    await act(async () => {
      await result.current.connectWithFinch();
    });

    expect(result.current.error).toBe("Network failure");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isPageLoading).toBe(false);
  });

  it("sets fallback error when getFinchSessionId throws a non-Error value", async () => {
    vi.mocked(finchApi.getFinchSessionId).mockRejectedValue("string-error");

    const { result } = render();

    await act(async () => {
      await result.current.connectWithFinch();
    });

    expect(result.current.error).toBe("Failed to start Finch Connect. Please try again.");
    expect(result.current.isLoading).toBe(false);
  });

  it("clears existing error before a new connectWithFinch call", async () => {
    // First call fails
    vi.mocked(finchApi.getFinchSessionId).mockRejectedValueOnce(new Error("First error"));
    const { result } = render();

    await act(async () => {
      await result.current.connectWithFinch();
    });

    expect(result.current.error).toBe("First error");

    // Second call succeeds — error should be cleared immediately
    vi.mocked(finchApi.getFinchSessionId).mockResolvedValueOnce({ sessionId: "sess-ok" });
    await act(async () => {
      await result.current.connectWithFinch();
    });

    expect(result.current.error).toBeNull();
  });

  // ── onSuccess callback ─────────────────────────────────────────────────

  it("onSuccess: exchanges code and navigates to /additional-questions", async () => {
    vi.mocked(finchApi.getFinchSessionId).mockResolvedValue({ sessionId: "sess-abc" });
    vi.mocked(finchApi.exchangeFinchCode).mockResolvedValue(undefined);

    const { result } = render();

    // Trigger connectWithFinch so open() is called (and capturedOnSuccess is set)
    await act(async () => {
      await result.current.connectWithFinch();
    });

    expect(capturedOnSuccess).toBeDefined();

    await act(async () => {
      await capturedOnSuccess!({ code: "auth-code-123" });
    });

    expect(finchApi.exchangeFinchCode).toHaveBeenCalledWith("auth-code-123");
    expect(mockNavigate).toHaveBeenCalledWith("/additional-questions");
    expect(result.current.error).toBeNull();
  });

  it("onSuccess: isPageLoading=true during exchangeFinchCode (exchanging-code status)", async () => {
    vi.mocked(finchApi.getFinchSessionId).mockResolvedValue({ sessionId: "sess-abc" });

    let resolveExchange!: (value: undefined) => void;
    vi.mocked(finchApi.exchangeFinchCode).mockReturnValue(new Promise(r => (resolveExchange = r)));

    const { result } = render();

    await act(async () => {
      await result.current.connectWithFinch();
    });

    // Start onSuccess without resolving exchange
    act(() => {
      void capturedOnSuccess!({ code: "auth-code" });
    });

    expect(result.current.isPageLoading).toBe(true); // "exchanging-code"

    // Clean up
    await act(async () => {
      resolveExchange(undefined);
    });
  });

  it("onSuccess: sets error and resets to idle when code is empty string", async () => {
    vi.mocked(finchApi.getFinchSessionId).mockResolvedValue({ sessionId: "sess-abc" });

    const { result } = render();

    await act(async () => {
      await result.current.connectWithFinch();
    });

    await act(async () => {
      await capturedOnSuccess!({ code: "" });
    });

    expect(finchApi.exchangeFinchCode).not.toHaveBeenCalled();
    expect(result.current.error).toBe("Failed to complete Finch connection. Please try again.");
    expect(result.current.isLoading).toBe(false);
  });

  it("onSuccess: sets error.message when exchangeFinchCode throws an Error", async () => {
    vi.mocked(finchApi.getFinchSessionId).mockResolvedValue({ sessionId: "sess-abc" });
    vi.mocked(finchApi.exchangeFinchCode).mockRejectedValue(new Error("Exchange failed"));

    const { result } = render();

    await act(async () => {
      await result.current.connectWithFinch();
    });

    await act(async () => {
      await capturedOnSuccess!({ code: "auth-code" });
    });

    expect(result.current.error).toBe("Exchange failed");
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it("onSuccess: sets fallback error when exchangeFinchCode throws non-Error", async () => {
    vi.mocked(finchApi.getFinchSessionId).mockResolvedValue({ sessionId: "sess-abc" });
    vi.mocked(finchApi.exchangeFinchCode).mockRejectedValue(42);

    const { result } = render();

    await act(async () => {
      await result.current.connectWithFinch();
    });

    await act(async () => {
      await capturedOnSuccess!({ code: "auth-code" });
    });

    expect(result.current.error).toBe("Failed to complete Finch connection. Please try again.");
  });

  // ── onError callback ───────────────────────────────────────────────────

  it("onError: sets error from errorMessage and resets to idle", async () => {
    vi.mocked(finchApi.getFinchSessionId).mockResolvedValue({ sessionId: "sess-abc" });

    const { result } = render();

    await act(async () => {
      await result.current.connectWithFinch();
    });

    act(() => {
      capturedOnError!({ errorMessage: "User cancelled" });
    });

    expect(result.current.error).toBe("User cancelled");
    expect(result.current.isLoading).toBe(false);
  });

  it("onError: sets fallback message when errorMessage is empty", async () => {
    vi.mocked(finchApi.getFinchSessionId).mockResolvedValue({ sessionId: "sess-abc" });

    const { result } = render();

    await act(async () => {
      await result.current.connectWithFinch();
    });

    act(() => {
      capturedOnError!({ errorMessage: "" });
    });

    expect(result.current.error).toBe("Failed to complete Finch connection. Please try again.");
  });

  // ── onClose callback ───────────────────────────────────────────────────

  it("onClose: resets status to idle (isLoading=false)", async () => {
    vi.mocked(finchApi.getFinchSessionId).mockResolvedValue({ sessionId: "sess-abc" });

    const { result } = render();

    await act(async () => {
      await result.current.connectWithFinch();
    });

    // In "connecting" state — isLoading is true
    expect(result.current.isLoading).toBe(true);

    act(() => {
      capturedOnClose!();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  // ── clearError ─────────────────────────────────────────────────────────

  it("clearError resets error to null", async () => {
    vi.mocked(finchApi.getFinchSessionId).mockRejectedValue(new Error("boom"));

    const { result } = render();

    await act(async () => {
      await result.current.connectWithFinch();
    });

    expect(result.current.error).toBe("boom");

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});

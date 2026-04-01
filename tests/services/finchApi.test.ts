/**
 * Finch API Service Tests
 *
 * Unit tests for real finchApi service layer.
 * Mocks apiClient (from authApi) to assert correct endpoints, payloads, and response handling.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { getFinchSessionId, exchangeFinchCode } from "@/services/api/finchApi";
import type { FinchSessionResponse, FinchConnectResponse } from "@/services/api/finchApi";

// ── Mock apiClient ─────────────────────────────────────────────────────────

const mockPost = vi.fn();

vi.mock("@/services/api/authApi", () => ({
  default: {
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

// ── Helpers ────────────────────────────────────────────────────────────────

const successSessionResponse = {
  data: {
    status: true,
    data: {
      sessionId: "sess_abc123",
      connectUrl: "https://connect.tryfinch.com/authorize/sess_abc123",
    },
  },
};

const successCallbackResponse = {
  data: {
    status: true,
    message: "Payroll provider connected successfully",
    data: {
      connectionId: "conn-uuid-123",
      connectionStatus: "connected",
      providerId: "gusto",
      syncJobId: "sync-uuid-456",
      syncJobStatus: "pending",
    },
  },
};

// ── getFinchSessionId ──────────────────────────────────────────────────────

describe("getFinchSessionId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls POST /finch/connect-session with no body", async () => {
    mockPost.mockResolvedValue(successSessionResponse);
    await getFinchSessionId();
    expect(mockPost).toHaveBeenCalledWith("/finch/connect-session");
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it("resolves with sessionId and connectUrl on success", async () => {
    mockPost.mockResolvedValue(successSessionResponse);
    const result: FinchSessionResponse = await getFinchSessionId();
    expect(result.sessionId).toBe("sess_abc123");
    expect(result.connectUrl).toBe("https://connect.tryfinch.com/authorize/sess_abc123");
  });

  it("throws with backend message when status is false", async () => {
    mockPost.mockResolvedValue({
      data: { status: false, message: "Session creation failed" },
    });
    await expect(getFinchSessionId()).rejects.toThrow("Session creation failed");
  });

  it("throws fallback message when status is false and no backend message", async () => {
    mockPost.mockResolvedValue({ data: { status: false } });
    await expect(getFinchSessionId()).rejects.toThrow(
      "Failed to start Finch Connect. Please try again."
    );
  });

  it("throws fallback message when sessionId is missing from data", async () => {
    mockPost.mockResolvedValue({
      data: { status: true, data: { connectUrl: "https://..." } },
    });
    await expect(getFinchSessionId()).rejects.toThrow(
      "Failed to start Finch Connect. Please try again."
    );
  });

  it("throws when apiClient.post rejects (network error)", async () => {
    mockPost.mockRejectedValue(new Error("Network error"));
    await expect(getFinchSessionId()).rejects.toThrow("Network error");
  });
});

// ── exchangeFinchCode ──────────────────────────────────────────────────────

describe("exchangeFinchCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls POST /finch/callback with { code } payload", async () => {
    mockPost.mockResolvedValue(successCallbackResponse);
    await exchangeFinchCode("auth_code_abc123");
    expect(mockPost).toHaveBeenCalledWith("/finch/callback", { code: "auth_code_abc123" });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it("resolves with full connection data on success", async () => {
    mockPost.mockResolvedValue(successCallbackResponse);
    const result: FinchConnectResponse = await exchangeFinchCode("auth_code_abc123");
    expect(result.connectionId).toBe("conn-uuid-123");
    expect(result.connectionStatus).toBe("connected");
    expect(result.providerId).toBe("gusto");
    expect(result.syncJobId).toBe("sync-uuid-456");
    expect(result.syncJobStatus).toBe("pending");
  });

  it("throws with backend message when status is false", async () => {
    mockPost.mockResolvedValue({
      data: {
        status: false,
        message: "Invalid or expired authorization code",
        data: {},
      },
    });
    await expect(exchangeFinchCode("bad-code")).rejects.toThrow(
      "Invalid or expired authorization code"
    );
  });

  it("throws fallback message when status is false and no backend message", async () => {
    mockPost.mockResolvedValue({ data: { status: false, message: "" } });
    await expect(exchangeFinchCode("any-code")).rejects.toThrow(
      "Failed to complete Finch connection. Please try again."
    );
  });

  it("throws when apiClient.post rejects (network error)", async () => {
    mockPost.mockRejectedValue(new Error("Timeout"));
    await expect(exchangeFinchCode("test-code")).rejects.toThrow("Timeout");
  });

  it("forwards the authorization code string argument correctly", async () => {
    mockPost.mockResolvedValue(successCallbackResponse);
    const authCode = "finch-auth-code-xyz-12345";
    await exchangeFinchCode(authCode);
    expect(mockPost).toHaveBeenCalledWith("/finch/callback", { code: authCode });
  });
});

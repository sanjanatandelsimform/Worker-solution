/**
 * useAssessmentStatus hook tests (Finch connectivity behavior).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
const mockGetAssessment = vi.fn();
vi.mock("@/services/api/assessmentApi", () => ({
  getAssessment: () => mockGetAssessment(),
}));

// Mock the cache module to pass through to getAssessment
vi.mock("@/hooks/assessmentCache", () => ({
  fetchAssessmentWithCache: () => mockGetAssessment(),
  getCachedAssessment: vi.fn(() => null),
  invalidateAssessmentCache: vi.fn(),
  updateAssessmentCache: vi.fn(),
}));

// ── Import hook after mocks ────────────────────────────────────────────────
const { useAssessmentStatus } = await import("@/hooks/useAssessmentStatus");

// ── Helpers ────────────────────────────────────────────────────────────────

function buildStore() {
  return configureStore({ reducer: { noop: (state = {}) => state } });
}

type WrapperProps = { children: React.ReactNode };
function wrapper({ children }: WrapperProps) {
  const store = buildStore();
  return React.createElement(Provider, { store }, children);
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("useAssessmentStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAssessment.mockResolvedValue({ success: false, data: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("sets isConnected true when assessmentType is finch", async () => {
    mockGetAssessment.mockResolvedValue({
      success: true,
      data: { assessmentType: "finch", data: { status: "completed", sections: {} } },
    });
    const { result } = renderHook(() => useAssessmentStatus(), { wrapper });
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
      expect(result.current.isFinchCompleted).toBe(true);
    });
  });

  it("sets isConnected false when assessmentType is manual", async () => {
    mockGetAssessment.mockResolvedValue({
      success: true,
      data: { assessmentType: "manual", data: { status: "completed", sections: {} } },
    });
    const { result } = renderHook(() => useAssessmentStatus(), { wrapper });
    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
      expect(result.current.isFinchCompleted).toBe(false);
    });
  });

  it("sets isFinchAssessmentIncomplete for incomplete finch status", async () => {
    mockGetAssessment.mockResolvedValue({
      success: true,
      data: { assessmentType: "finch", data: { status: "in_progress", sections: {} } },
    });
    const { result } = renderHook(() => useAssessmentStatus(), { wrapper });
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
      expect(result.current.isFinchAssessmentIncomplete).toBe(true);
    });
  });

  it("does not fetch when enabled=false", () => {
    const { result } = renderHook(() => useAssessmentStatus({ enabled: false }), { wrapper });
    expect(mockGetAssessment).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });
});

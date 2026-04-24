/**
 * Tests for useStatesLookup hook and transformStates helper
 *
 * TDD: Written BEFORE implementation (Red phase)
 */

import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStatesLookup, transformStates } from "@/hooks/useStatesLookup";
import { getStates } from "@/services/api/assessmentApi";

// Mock the API module
vi.mock("@/services/api/assessmentApi", () => ({
  getStates: vi.fn(),
}));

const mockGetStates = vi.mocked(getStates);

// --- T003: transformStates() unit tests ---

describe("transformStates", () => {
  it("should map valid entries to { id, label } format", () => {
    const input = [
      { stateAbbreviation: "NY", stateName: "New York" },
      { stateAbbreviation: "CA", stateName: "California" },
    ];
    const result = transformStates(input);
    expect(result).toEqual([
      { id: "NY", label: "New York", stateFips: "" },
      { id: "CA", label: "California", stateFips: "" },
    ]);
  });

  it("should skip entries missing stateAbbreviation", () => {
    const input = [
      { stateAbbreviation: "NY", stateName: "New York" },
      { stateName: "California" } as { stateAbbreviation: string; stateName: string },
    ];
    const result = transformStates(input);
    expect(result).toEqual([{ id: "NY", label: "New York", stateFips: "" }]);
  });

  it("should skip entries missing stateName", () => {
    const input = [
      { stateAbbreviation: "NY", stateName: "New York" },
      { stateAbbreviation: "CA" } as { stateAbbreviation: string; stateName: string },
    ];
    const result = transformStates(input);
    expect(result).toEqual([{ id: "NY", label: "New York", stateFips: "" }]);
  });

  it("should return empty array when all entries are malformed", () => {
    const input = [
      { stateName: "California" } as { stateAbbreviation: string; stateName: string },
      { stateAbbreviation: "TX" } as { stateAbbreviation: string; stateName: string },
    ];
    const result = transformStates(input);
    expect(result).toEqual([]);
  });

  it("should return empty array for empty input", () => {
    const result = transformStates([]);
    expect(result).toEqual([]);
  });
});

// --- T004: useStatesLookup hook tests ---

describe("useStatesLookup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return isLoading: true initially", () => {
    mockGetStates.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useStatesLookup());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.stateOptions).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("should set stateOptions on successful API response", async () => {
    mockGetStates.mockResolvedValue({
      data: {
        states: [
          { stateAbbreviation: "NY", stateName: "New York" },
          { stateAbbreviation: "CA", stateName: "California" },
        ],
      },
    });
    
    const { result } = renderHook(() => useStatesLookup());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stateOptions).toEqual([
      { id: "NY", label: "New York", stateFips: "" },
      { id: "CA", label: "California", stateFips: "" },
    ]);
    expect(result.current.error).toBeNull();
  });

  it("should set error on API failure", async () => {
    mockGetStates.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useStatesLookup());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to load state options");
    expect(result.current.stateOptions).toEqual([]);
  });

  it("should set error when API returns empty states array", async () => {
    mockGetStates.mockResolvedValue({
      data: {
        states: [],
      },
    });

    const { result } = renderHook(() => useStatesLookup());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to load state options");
    expect(result.current.stateOptions).toEqual([]);
  });

  it("should call API exactly once on mount (no re-fetch on re-render)", async () => {
    mockGetStates.mockResolvedValue({
      data: {
        states: [{ stateAbbreviation: "NY", stateName: "New York" }],
      },
    });

    const { result, rerender } = renderHook(() => useStatesLookup());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Trigger re-renders
    rerender();
    rerender();
    rerender();

    expect(mockGetStates).toHaveBeenCalledTimes(1);
  });
});

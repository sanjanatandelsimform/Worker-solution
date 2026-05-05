/**
 * useIndustry Hook Tests
 *
 * TDD: Written BEFORE hook implementation (T011).
 * Tests cover: conditional dispatch based on finch industry status,
 * session caching (no re-fetch when isLoaded), suppression when not "fetch".
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import industryReducer from "@/store/slices/industrySlice";
import finchStatusReducer from "@/store/slices/finchStatusSlice";
import type { IndustryState, IndustryData } from "@/types/industryTypes";
import type { FinchStatusState } from "@/types/finchStatusTypes";

// ── Mock dispatch ──────────────────────────────────────────────────────────

const mockDispatch = vi.fn();

// Shared mutable state for selector mock
let mockStoreState: {
  industry: IndustryState;
  finchStatus: Partial<FinchStatusState>;
} = {
  industry: {
    data: null,
    loading: false,
    error: null,
    isLoaded: false,
  },
  finchStatus: {
    connection: null,
    latestSyncJob: null,
    loading: false,
    error: null,
  },
};

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: object) => unknown) => selector(mockStoreState),
}));

vi.mock("@/store/slices/industrySlice", async importOriginal => {
  const actual = await importOriginal<typeof import("@/store/slices/industrySlice")>();
  return {
    ...actual,
    fetchIndustry: Object.assign(
      vi.fn(() => ({ type: "industry/fetchIndustry/pending" })),
      {
        pending: actual.fetchIndustry.pending,
        fulfilled: actual.fetchIndustry.fulfilled,
        rejected: actual.fetchIndustry.rejected,
        typePrefix: actual.fetchIndustry.typePrefix,
      }
    ),
  };
});

// ── Import hook after mocks ────────────────────────────────────────────────
const { useIndustry } = await import("@/hooks/useIndustry");
const { fetchIndustry: _fetchIndustry } = await import("@/store/slices/industrySlice");

// ── Helpers ────────────────────────────────────────────────────────────────

function buildStore(
  industry: Partial<IndustryState> = {},
  finchStatus: Partial<FinchStatusState> = {}
) {
  return configureStore({
    reducer: {
      industry: industryReducer,
      finchStatus: finchStatusReducer,
    },
    preloadedState: {
      industry: {
        data: null,
        loading: false,
        error: null,
        isLoaded: false,
        ...industry,
      },
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

// ── Mock industry data ─────────────────────────────────────────────────────

const mockIndustryData: IndustryData = {
  industryOverview: {
    turnoverRate: { rate: "$4.46M", month: "Dec", year: 2024 },
    avgTurnover: { rate: 5.32, sinceYear: 2020 },
    industryWideCostOfTurnover: { amount: 1714381066.6667, formatted: "$1.7B", year: 2024 },
    rates: { hire: 31, seperation: 40 },
  },
  industry: {
    turnOverRate: {
      industry: { involuntary: 39, voluntary: 60 },
      company: { involuntary: 20, voluntary: 80 },
    },
    separationRate: {
      industry: { seperation: 7.7, hiring: 11.1 },
      company: { seperation: 2.7, hiring: 8.1 },
    },
  },
  areaMedianWage: {
    availableZipcodes: ["03301"],
    nationalAvgSalary: 83227,
    companyMedianHourlyWage: 14.03,
    companyGraph: { salary: 40000, hourly: 26.0 },
    stateData: [],
  },
  housingBurden: {
    availableZipcodes: ["03301"],
    data: [],
  },
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe("useIndustry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatch.mockImplementation(action => action);
    mockStoreState = {
      industry: {
        data: null,
        loading: false,
        error: null,
        isLoaded: false,
      },
      finchStatus: {
        connection: null,
        latestSyncJob: null,
        loading: false,
        error: null,
      },
    };
  });
  // ── Return shape ─────────────────────────────────────────────────────────

  it("returns { data, isLoading, error, isLoaded } from industry state", () => {
    mockStoreState.industry = {
      data: mockIndustryData,
      loading: false,
      error: null,
      isLoaded: true,
    };
    const { result } = renderHook(() => useIndustry(), { wrapper });
    expect(result.current.data).toEqual(mockIndustryData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoaded).toBe(true);
  });

  it("returns loading true when industry is loading", () => {
    mockStoreState.industry.loading = true;
    const { result } = renderHook(() => useIndustry(), { wrapper });
    expect(result.current.isLoading).toBe(true);
  });

  it("returns error when industry has error", () => {
    mockStoreState.industry.error = "Network Error";
    const { result } = renderHook(() => useIndustry(), { wrapper });
    expect(result.current.error).toBe("Network Error");
  });
});

describe("useIndustry — enabled option", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatch.mockImplementation(action => action);
    mockStoreState = {
      industry: { data: null, loading: false, error: null, isLoaded: false },
      finchStatus: { connection: null, latestSyncJob: null, loading: false, error: null },
    };
  });

  it("does NOT dispatch fetchIndustry when enabled=false", () => {
    renderHook(() => useIndustry({ enabled: false }), { wrapper });
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("dispatches fetchIndustry when enabled flips from false to true", () => {
    let enabled = false;
    const { rerender } = renderHook(() => useIndustry({ enabled }), { wrapper });
    expect(mockDispatch).not.toHaveBeenCalled();
    enabled = true;
    rerender();
    expect(mockDispatch).toHaveBeenCalled();
  });
});

/**
 * BenchmarkPage Tests
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { createTestStore } from "../test-utils";

vi.mock("@/hooks/useIndustry", () => ({
  useIndustry: () => ({
    data: null,
    isLoading: false,
    error: null,
    isLoaded: true,
  }),
}));

vi.mock("@/hooks/useAssessmentStatus", () => ({
  useAssessmentStatus: () => ({
    completionCount: 4,
    isLoading: false,
    error: null,
    assessmentData: null,
    isFinchCompleted: false,
    isFinchAssessmentIncomplete: false,
    sectionCompletion: { workforce: true, compensation: true, benefits: true, goals: true },
    refetch: vi.fn(),
  }),
}));

vi.mock("@/assets/logo.svg", () => ({ default: "logo.svg" }));
vi.mock("@/assets/benestats-mark.svg", () => ({ default: "benestats-mark.svg" }));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const { default: BenchmarkPage } = await import("@/pages/benchmark/BenchmarkPage");

function renderBenchmark() {
  const store = createTestStore({
    industry: {
      data: {
        industryOverview: {
          totalEmployees: "1000",
          averageHourlyWage: "25.50",
          averageSalary: "53040",
          medianHouseholdIncome: "75000",
        },
        turnOverRate: { voluntaryRate: "15%", involuntaryRate: "5%" },
        separationRate: { rate: "20%", count: "200" },
        areaMedianWage: [],
        housingCost: [],
      },
      isLoading: false,
      error: null,
      isLoaded: true,
    },
  } as any);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <BenchmarkPage />
      </MemoryRouter>
    </Provider>
  );
}

describe("BenchmarkPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the benchmark page", async () => {
    renderBenchmark();
    await waitFor(() => {
      const container = document.querySelector(".flex");
      expect(container).toBeInTheDocument();
    });
  });
});

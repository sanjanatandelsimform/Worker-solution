/**
 * WorkforcePage Tests (Page-level integration)
 *
 * Covers: heading, error banner, loading delegation to child sections, and
 * the "Declarations" footer rendered when data is available.
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { createTestStore } from "../test-utils";
import type { WorkforceApiResponse } from "@/types/workforceTypes";
import WorkforcePage from "@/pages/workforce/WorkforcePage";

// ── Asset mocks ──────────────────────────────────────────────────────────────
vi.mock("@/assets/employees-reported.jpg", () => ({ default: "employees-reported.jpg" }));
vi.mock("@/assets/placeholder.svg", () => ({ default: "placeholder.svg" }));

// ── Child component mocks ────────────────────────────────────────────────────
vi.mock("@/pages/workforce/WorkforceOverview", () => ({
  default: ({ isLoading }: { isLoading: boolean }) => (
    <div data-testid="workforce-overview" data-loading={String(isLoading)} />
  ),
}));

vi.mock("@/pages/workforce/WorkforceParticipation", () => ({
  default: ({ isLoading }: { isLoading: boolean }) => (
    <div data-testid="workforce-participation" data-loading={String(isLoading)} />
  ),
}));

vi.mock("@/pages/workforce/WorkforceDemographics", () => ({
  default: ({ isLoading }: { isLoading: boolean }) => (
    <div data-testid="workforce-demographics" data-loading={String(isLoading)} />
  ),
}));

vi.mock("@/pages/workforce/WorkforceCompensation", () => ({
  default: ({ isLoading }: { isLoading: boolean }) => (
    <div data-testid="workforce-compensation" data-loading={String(isLoading)} />
  ),
}));

vi.mock("@/components/common/Declarations", () => ({
  default: () => <div data-testid="declarations" />,
}));

vi.mock("@/components/common/ErrorMessage", () => ({
  default: ({ errorMessage }: { errorMessage: string }) => (
    <div data-testid="error-message">{errorMessage}</div>
  ),
}));

vi.mock("@/components/modals/GetInTouchModal", () => ({
  GetInTouchModal: () => null,
}));

// ── Mock all workforce config hooks ──────────────────────────────────────────
vi.mock("@/hooks/useWorkforceOverviewConfig", () => ({
  useWorkforceOverviewConfig: () => ({
    overviewCardsConfig: [],
    employeeCardsConfig: [],
  }),
}));

vi.mock("@/hooks/useWorkforceParticipationConfig", () => ({
  useWorkforceParticipationConfig: () => ({
    participationCardsConfig: [],
    benefitsItems: [],
    retirementItems: [],
    insuranceItems: [],
  }),
}));

vi.mock("@/hooks/useWorkforceDemographicsConfig", () => ({
  useWorkforceDemographicsConfig: () => ({
    departmentItems: [],
    demographicsCardsConfig: [],
    donutChartsConfig: [],
    ageBreakdownConfig: [],
  }),
}));

vi.mock("@/hooks/useWorkforceCompensationConfig", () => ({
  useWorkforceCompensationConfig: () => ({
    workforceDepartmentItems: [],
    columns: [],
    users: [],
    columnsOne: [],
    salary: [],
    compensationCardsConfig: [],
    salaryBreakdownCardsConfig: [],
    salaryChartData: [],
  }),
}));

// ── Mock workforce API data ──────────────────────────────────────────────────
const mockWorkforceData: WorkforceApiResponse = {
  assessmentType: "finch",
  workforce: {
    dataStatus: "available",
    workforce: {
      totalWorkforce: 3120,
      enrolledBenefits: 2800,
      avgEmployeeCost: 450,
      employerCostPerEmployee: 5400,
    },
    participation: {
      totalWorkforce: 3120,
      enrolledBenefits: 2800,
      retirementEnrollment: "75%",
      healthcareEnrollment: "89%",
      benefits: [],
      retirement: [],
      insurance: [],
    },
    demographics: {
      employmentType: [],
      gender: { men: "55%", women: "45%" },
      employmentBreakdownByAge: [],
    },
    compensation: {
      salaryBreakdown: { medianSalary: 75000, avgSalary: 80000, avgHourlyRate: 38.46 },
      workforceBreakdown: { departments: [] },
      benefitsCost: {
        employeeContribution: 250,
        employerCost: 11240,
        graph: [],
        table: [],
      },
    },
  },
};

function renderPage(workforceOverride: object = {}) {
  const store = createTestStore({
    workforce: {
      data: mockWorkforceData,
      loading: false,
      error: null,
      lastFetched: Date.now(),
      isLoaded: true,
      ...workforceOverride,
    } as any,
  });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <WorkforcePage />
      </MemoryRouter>
    </Provider>
  );
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("WorkforcePage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the main heading", () => {
    renderPage();
    expect(screen.getByText("Workforce Information")).toBeInTheDocument();
  });

  it("renders the 'Breakdown Overview' sub-heading", () => {
    renderPage();
    expect(screen.getByText("Breakdown Overview")).toBeInTheDocument();
  });

  it("renders all four section components", () => {
    renderPage();
    expect(screen.getByTestId("workforce-overview")).toBeInTheDocument();
    expect(screen.getByTestId("workforce-participation")).toBeInTheDocument();
    expect(screen.getByTestId("workforce-demographics")).toBeInTheDocument();
    expect(screen.getByTestId("workforce-compensation")).toBeInTheDocument();
  });

  it("does NOT show error banner when there is no error", () => {
    renderPage();
    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it("shows the error banner when workforceError is set", () => {
    renderPage({ error: "Failed to load workforce data" });
    expect(screen.getByTestId("error-message")).toHaveTextContent("Failed to load workforce data");
  });

  it("passes isLoading=false to child sections when not loading", () => {
    renderPage({ loading: false });
    expect(screen.getByTestId("workforce-overview")).toHaveAttribute("data-loading", "false");
    expect(screen.getByTestId("workforce-participation")).toHaveAttribute("data-loading", "false");
    expect(screen.getByTestId("workforce-demographics")).toHaveAttribute("data-loading", "false");
    expect(screen.getByTestId("workforce-compensation")).toHaveAttribute("data-loading", "false");
  });

  it("passes isLoading=true to child sections when loading", () => {
    renderPage({ loading: true });
    expect(screen.getByTestId("workforce-overview")).toHaveAttribute("data-loading", "true");
    expect(screen.getByTestId("workforce-participation")).toHaveAttribute("data-loading", "true");
    expect(screen.getByTestId("workforce-demographics")).toHaveAttribute("data-loading", "true");
    expect(screen.getByTestId("workforce-compensation")).toHaveAttribute("data-loading", "true");
  });
});

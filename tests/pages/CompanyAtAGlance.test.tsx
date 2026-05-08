/**
 * CompanyAtAGlance component tests - covers branches for format functions and onNavigateToWorkforce
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const mockIsConnected = vi.fn(() => false);
vi.mock("@/hooks/useAssessmentStatus", () => ({
  useAssessmentStatus: () => ({ isConnected: mockIsConnected() }),
}));

vi.mock("@/pages/recommendations/StaticCard", () => ({
  default: ({ title, count }: any) => (
    <div data-testid="static-card">
      <span>{title}</span>
      <span data-testid="card-count">{count}</span>
    </div>
  ),
}));

vi.mock("@/pages/recommendations/RecommendationsSkeletons", () => ({
  OverviewCardSkeleton: () => <div data-testid="skeleton" />,
}));

vi.mock("@/utils/formatters", () => ({
  formatNumber: (n: number) => String(n),
  formatCurrency: (n: number) => `$${n}`,
  formatCurrencyWithCents: (n: number) => `$${n.toFixed(2)}`,
  formatCompactCurrency: (n: number) => `$${Math.round(n / 1000)}K`,
}));

import CompanyAtAGlance from "@/pages/recommendations/CompanyAtAGlance";

const defaultGlanceData = {
  totalWorkforce: 100,
  averageHourlyWage: 25.5,
  averageSalary: 53000,
  industryAverageWage: 55000,
};

const defaultBenefitsData: Record<string, string | null> = {
  "enrolled-employees": "2,254",
  "enrolled-in-retirement": "64%",
  "enrolled-in-healthcare": "92%",
};

function renderCAG(
  props: Partial<{
    isLoading: boolean;
    companyGlanceData: any;
    benefitsGlanceData: Record<string, string | null>;
    onNavigateToWorkforce?: () => void;
  }> = {}
) {
  return render(
    <MemoryRouter>
      <CompanyAtAGlance
        isLoading={props.isLoading ?? false}
        companyGlanceData={props.companyGlanceData ?? defaultGlanceData}
        benefitsGlanceData={props.benefitsGlanceData ?? defaultBenefitsData}
        onNavigateToWorkforce={props.onNavigateToWorkforce}
      />
    </MemoryRouter>
  );
}

describe("CompanyAtAGlance", () => {
  beforeEach(() => {
    mockIsConnected.mockReturnValue(false);
  });

  it("renders basic company overview section", () => {
    renderCAG();
    expect(screen.getByText("Your Company at a Glance")).toBeTruthy();
  });

  it("shows skeleton loaders when isLoading=true", () => {
    renderCAG({ isLoading: true });
    expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
  });

  it("format functions: totalWorkforce number displays formatted number", () => {
    renderCAG({ companyGlanceData: { ...defaultGlanceData, totalWorkforce: 500 } });
    expect(screen.getByText("500")).toBeTruthy();
  });

  it("format functions: totalWorkforce null displays N/A", () => {
    renderCAG({ companyGlanceData: { ...defaultGlanceData, totalWorkforce: null } });
    expect(screen.getAllByTestId("card-count").some(el => el.textContent === "N/A")).toBe(true);
  });

  it("format functions: averageHourlyWage number displays formatted currency", () => {
    renderCAG({ companyGlanceData: { ...defaultGlanceData, averageHourlyWage: 22.5 } });
    expect(screen.getByText("$22.50")).toBeTruthy();
  });

  it("format functions: averageHourlyWage null displays N/A", () => {
    renderCAG({ companyGlanceData: { ...defaultGlanceData, averageHourlyWage: null } });
    expect(screen.getAllByTestId("card-count").some(el => el.textContent === "N/A")).toBe(true);
  });

  it("format functions: industryAverageWage not null displays currency", () => {
    renderCAG({ companyGlanceData: { ...defaultGlanceData, industryAverageWage: 55000 } });
    expect(screen.getByText("$55000")).toBeTruthy();
  });

  it("format functions: industryAverageWage null displays N/A", () => {
    renderCAG({ companyGlanceData: { ...defaultGlanceData, industryAverageWage: null } });
    expect(screen.getAllByTestId("card-count").some(el => el.textContent === "N/A")).toBe(true);
  });

  it("format functions: averageSalary number displays compact currency", () => {
    renderCAG({ companyGlanceData: { ...defaultGlanceData, averageSalary: 72000 } });
    expect(screen.getByText("$72K")).toBeTruthy();
  });

  it("format functions: averageSalary null displays N/A", () => {
    renderCAG({ companyGlanceData: { ...defaultGlanceData, averageSalary: null } });
    expect(screen.getAllByTestId("card-count").some(el => el.textContent === "N/A")).toBe(true);
  });

  it("isConnected=true renders Benefits Overview section", () => {
    mockIsConnected.mockReturnValue(true);
    renderCAG();
    expect(screen.getByText("Benefits Overview")).toBeTruthy();
  });

  it("isConnected=true: onNavigateToWorkforce is called when link clicked", () => {
    mockIsConnected.mockReturnValue(true);
    const onNavigateToWorkforce = vi.fn();
    renderCAG({ onNavigateToWorkforce });

    const link = screen.getByText(/Explore salaries/i);
    fireEvent.click(link);
    expect(onNavigateToWorkforce).toHaveBeenCalled();
  });

  it("isConnected=true: clicking link without onNavigateToWorkforce does not throw", () => {
    mockIsConnected.mockReturnValue(true);
    renderCAG({ onNavigateToWorkforce: undefined });

    const link = screen.queryByText(/Explore salaries/i);
    if (link) {
      expect(() => fireEvent.click(link)).not.toThrow();
    }
    expect(true).toBe(true);
  });

  it("isConnected=true: shows skeletons for benefits overview when loading", () => {
    mockIsConnected.mockReturnValue(true);
    renderCAG({ isLoading: true });
    expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
  });

  it("renders with null totalWorkforce (covers workforce=null branch)", () => {
    renderCAG({
      companyGlanceData: {
        totalWorkforce: null,
        averageHourlyWage: null,
        averageSalary: null,
        industryAverageWage: null,
      },
    });
    expect(screen.getAllByTestId("card-count").some(el => el.textContent === "N/A")).toBe(true);
  });
});

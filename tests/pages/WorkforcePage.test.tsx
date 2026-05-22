import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import WorkforcePage from "../../src/pages/workforce/WorkforcePage";

// ─── Mock all hook and selector dependencies ───────────────────────────────

vi.mock("@/store/hooks", () => ({
  useAppSelector: vi.fn(() => null),
}));

vi.mock("@/store/selectors/workforceSelectors", () => ({
  selectWorkforceLoading: vi.fn(() => false),
  selectWorkforceError: vi.fn(() => null),
}));

vi.mock("@/hooks/useWorkforceOverviewConfig", () => ({
  useWorkforceOverviewConfig: vi.fn(() => ({ overviewCardsConfig: [], employeeCardsConfig: [] })),
}));

vi.mock("@/hooks/useWorkforceParticipationConfig", () => ({
  useWorkforceParticipationConfig: vi.fn(() => ({
    participationCardsConfig: [],
    benefitsItems: [],
    retirementItems: [],
    insuranceItems: [],
  })),
}));

vi.mock("@/hooks/useWorkforceDemographicsConfig", () => ({
  useWorkforceDemographicsConfig: vi.fn(() => ({
    departmentItems: [],
    demographicsCardsConfig: [],
    donutChartsConfig: [],
    ageBreakdownConfig: [],
  })),
}));

vi.mock("@/hooks/useWorkforceCompensationConfig", () => ({
  useWorkforceCompensationConfig: vi.fn(() => ({
    workforceDepartmentItems: [],
    columns: [],
    users: [],
    columnsOne: [],
    salary: [],
    compensationCardsConfig: [],
    salaryBreakdownCardsConfig: [],
    salaryChartData: [],
  })),
}));

vi.mock("@/pages/workforce/WorkforceOverview", () => ({
  default: () => <div data-testid="workforce-overview">WorkforceOverview</div>,
}));
vi.mock("@/pages/workforce/WorkforceParticipation", () => ({
  default: () => <div data-testid="workforce-participation">WorkforceParticipation</div>,
}));
vi.mock("@/pages/workforce/WorkforceDemographics", () => ({
  default: () => <div data-testid="workforce-demographics">WorkforceDemographics</div>,
}));
vi.mock("@/pages/workforce/WorkforceCompensation", () => ({
  default: () => <div data-testid="workforce-compensation">WorkforceCompensation</div>,
}));
vi.mock("@/components/common/ErrorMessage", () => ({
  default: () => <div>error-message</div>,
}));
vi.mock("@/components/common/DidYouKnowBanner", () => ({
  default: () => <div data-testid="did-you-know-banner">DidYouKnowBanner</div>,
}));
vi.mock("@/assets/preparingData.svg", () => ({ default: "preparingData.svg" }));
vi.mock("@/assets/employees-reported.jpg", () => ({ default: "employees-reported.jpg" }));

// ─── Smoke Test ────────────────────────────────────────────────────────────

describe("WorkforcePage — smoke test", () => {
  it("renders without crashing with defaults", () => {
    render(<WorkforcePage />);
    expect(screen.getByText("Workforce Information")).toBeInTheDocument();
  });
});

// ─── T009: isStale guard ───────────────────────────────────────────────────

describe("WorkforcePage — isStale prop", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders PreparingDashboard when isStale is true", () => {
    render(<WorkforcePage isStale={true} />);
    expect(screen.getByText(/Preparing your dashboard/i)).toBeInTheDocument();
  });

  it("does not render PreparingDashboard when isStale is false (default)", () => {
    render(<WorkforcePage />);
    expect(screen.queryByText(/Preparing your dashboard/i)).not.toBeInTheDocument();
  });

  it("does not render PreparingDashboard when isStale is explicitly false", () => {
    render(<WorkforcePage isStale={false} />);
    expect(screen.queryByText(/Preparing your dashboard/i)).not.toBeInTheDocument();
  });

  it("does not render PreparingDashboard when isStale is false — skeleton shown instead", () => {
    render(<WorkforcePage isStale={false} isReady={false} />);
    expect(screen.queryByText(/Preparing your dashboard/i)).not.toBeInTheDocument();
    // Full content still rendered (workforce sections visible)
    expect(screen.getByText("Workforce Information")).toBeInTheDocument();
  });

  it("renders DidYouKnowBanner alongside PreparingDashboard when isStale is true", () => {
    render(<WorkforcePage isStale={true} />);
    expect(screen.getByTestId("did-you-know-banner")).toBeInTheDocument();
  });
});

// ─── T015: message selection based on isAutomatedProvider ─────────────────

describe("WorkforcePage — isAutomatedProvider message selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows automated message when isStale=true and isAutomatedProvider=true", () => {
    render(<WorkforcePage isStale={true} isAutomatedProvider={true} />);
    expect(screen.getByText(/24-36 hours/i)).toBeInTheDocument();
    expect(screen.queryByText(/up to 2 weeks/i)).not.toBeInTheDocument();
  });

  it("shows non-automated message when isStale=true and isAutomatedProvider=false", () => {
    render(<WorkforcePage isStale={true} isAutomatedProvider={false} />);
    expect(screen.getByText(/up to 2 weeks/i)).toBeInTheDocument();
    expect(screen.queryByText(/24-36 hours/i)).not.toBeInTheDocument();
  });

  it("shows non-automated message when isStale=true and isAutomatedProvider is not provided", () => {
    render(<WorkforcePage isStale={true} />);
    expect(screen.getByText(/up to 2 weeks/i)).toBeInTheDocument();
    expect(screen.queryByText(/24-36 hours/i)).not.toBeInTheDocument();
  });
});

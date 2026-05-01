/**
 * Tests for components with 0% coverage
 * Covers: EmployTypeChart (DonutChart), WorkforceSkeletons, RateOfSeparation (CostCard),
 * SalaryHourlyFinchChart (ComparisonChart)
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock canvas APIs globally
const ctx = {
  scale: vi.fn(),
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  fillText: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  stroke: vi.fn(),
  fillStyle: "",
  strokeStyle: "",
  lineWidth: 1,
  font: "",
  textAlign: "left" as CanvasTextAlign,
  textBaseline: "alphabetic" as CanvasTextBaseline,
  globalAlpha: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ctx as unknown as CanvasRenderingContext2D);
});

// ── Tooltip mock ────────────────────────────────────────────────────────────
vi.mock("@/components/base/tooltip/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// ── EmployTypeChart (DonutChart) ─────────────────────────────────────────────
const { default: DonutChart } = await import("@/pages/workforce/EmployTypeChart");

describe("DonutChart (EmployTypeChart)", () => {
  it("renders a canvas element", () => {
    const { container } = render(
      <DonutChart percentage={75} label="75%" progressColor="color-ws-progress-primary" />
    );
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  it("handles percentage 0", () => {
    const { container } = render(
      <DonutChart percentage={0} label="0%" progressColor="color-ws-progress-secondary" />
    );
    expect(container.querySelector("canvas")).toBeTruthy();
    expect(ctx.arc).toHaveBeenCalled();
  });

  it("handles percentage 100", () => {
    const { container } = render(
      <DonutChart percentage={100} label="100%" progressColor="color-ws-progress-turnery" />
    );
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  it("clamps percentage above 100", () => {
    const { container } = render(
      <DonutChart percentage={150} label="150%" progressColor="color-ws-progress-primary" />
    );
    // normalizedPercentage should be clamped to 100
    expect(ctx.fillText).toHaveBeenCalledWith("100%", expect.any(Number), expect.any(Number));
  });

  it("clamps percentage below 0", () => {
    const { container } = render(
      <DonutChart percentage={-10} label="-10%" progressColor="color-ws-progress-primary" />
    );
    expect(ctx.fillText).toHaveBeenCalledWith("0%", expect.any(Number), expect.any(Number));
  });

  it("uses custom width and height", () => {
    const { container } = render(
      <DonutChart
        percentage={50}
        label="50%"
        progressColor="color-ws-progress-primary"
        width={150}
        height={150}
      />
    );
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  it("maps bg-ws-progress-primary background color", () => {
    render(
      <DonutChart
        percentage={50}
        label="50%"
        progressColor="color-ws-progress-primary"
        backgroundColor="bg-ws-progress-primary"
      />
    );
    expect(ctx.arc).toHaveBeenCalled();
  });

  it("passes unknown color class directly", () => {
    render(
      <DonutChart
        percentage={50}
        label="50%"
        progressColor="#custom-color"
        backgroundColor="#bg-custom"
      />
    );
    expect(ctx.arc).toHaveBeenCalled();
  });

  it("renders with custom className", () => {
    const { container } = render(
      <DonutChart
        percentage={50}
        label="50%"
        progressColor="color-ws-progress-primary"
        className="my-custom-class"
      />
    );
    const wrapper = container.querySelector(".my-custom-class");
    expect(wrapper).toBeTruthy();
  });
});

// ── WorkforceSkeletons ────────────────────────────────────────────────────────
const {
  OverviewCardSkeleton,
  WagesCardSkeleton,
  ProgressCardSkeleton,
  ProgressCardSkeletonOne,
  ProgressCardSkeletonFour,
  DonutChartSkeleton,
  BreakDownCardSkeleton,
  BreakDownChartSkeleton,
} = await import("@/pages/workforce/WorkforceSkeletons");

describe("WorkforceSkeletons", () => {
  it("renders OverviewCardSkeleton", () => {
    const { container } = render(<OverviewCardSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders WagesCardSkeleton", () => {
    const { container } = render(<WagesCardSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders ProgressCardSkeleton", () => {
    const { container } = render(<ProgressCardSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders ProgressCardSkeletonOne", () => {
    const { container } = render(<ProgressCardSkeletonOne />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders ProgressCardSkeletonFour", () => {
    const { container } = render(<ProgressCardSkeletonFour />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders DonutChartSkeleton", () => {
    const { container } = render(<DonutChartSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders BreakDownCardSkeleton", () => {
    const { container } = render(<BreakDownCardSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders BreakDownChartSkeleton", () => {
    const { container } = render(<BreakDownChartSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });
});

// ── RateOfSeparation (CostCard) ───────────────────────────────────────────────
const { default: CostCard } = await import("@/pages/benchmark/RateOfSeparation");

describe("CostCard (RateOfSeparation)", () => {
  it("renders 'No data available' when voluntaryScore is missing", () => {
    render(<CostCard title="Test Card" />);
    expect(screen.getByText("No data available")).toBeTruthy();
  });

  it("renders 'No data available' when involuntaryScore is missing", () => {
    render(<CostCard title="Test Card" voluntaryScore="5%" />);
    expect(screen.getByText("No data available")).toBeTruthy();
  });

  it("renders 'No data available' when voluntaryScore starts with N/A", () => {
    render(<CostCard title="Test Card" voluntaryScore="N/A" involuntaryScore="10%" />);
    expect(screen.getByText("No data available")).toBeTruthy();
  });

  it("renders 'No data available' when involuntaryScore starts with N/A", () => {
    render(<CostCard title="Test Card" voluntaryScore="5%" involuntaryScore="N/A" />);
    expect(screen.getByText("No data available")).toBeTruthy();
  });

  it("renders scores when both are valid", () => {
    render(
      <CostCard
        title="Rate of Separation"
        year="2023"
        voluntaryScore="5%"
        involuntaryScore="3%"
        industryText="Industry:"
        industryCostText=" $1000"
        industryTradeText="Trade: 2%"
      />
    );
    expect(screen.getByText("Rate of Separation")).toBeTruthy();
    expect(screen.getByText("5%")).toBeTruthy();
    expect(screen.getByText("3%")).toBeTruthy();
    expect(screen.getByText("2023")).toBeTruthy();
  });

  it("renders with custom classess", () => {
    const { container } = render(
      <CostCard title="Card" voluntaryScore="N/A" involuntaryScore="N/A" classess="my-class" />
    );
    const wrapper = container.querySelector(".my-class");
    expect(wrapper).toBeTruthy();
  });
});

// ── SalaryHourlyFinchChart ────────────────────────────────────────────────────
vi.mock("@/pages/benchmark/SalaryHourlyCharts/SalaryHourlyChartsFinch/HourlyChart", () => ({
  default: () => <div data-testid="hourly-chart" />,
}));
vi.mock("@/pages/benchmark/SalaryHourlyCharts/SalaryHourlyChartsFinch/SalaryChart", () => ({
  default: () => <div data-testid="salary-chart" />,
}));

const { default: SalaryHourlyFinchChart } =
  await import("@/pages/benchmark/SalaryHourlyCharts/SalaryHourlyChartsFinch/SalaryHourlyComparisonChart");

describe("SalaryHourlyFinchChart", () => {
  const defaultProps = {
    salaryData: { industryAverage: 50000, yourCompanyAverage: 55000, nationalAverage: 52000 },
    hourlyData: { industryAverage: 25, yourCompanyAverage: 27, nationalAverage: 26 },
  };

  it("renders the chart title", () => {
    render(<SalaryHourlyFinchChart {...defaultProps} />);
    expect(screen.getByText("Annual Salary & Hourly Comparison")).toBeTruthy();
  });

  it("renders Salary and Hourly sub-charts", () => {
    render(<SalaryHourlyFinchChart {...defaultProps} />);
    expect(screen.getByText("Salary")).toBeTruthy();
    expect(screen.getByText("Hourly")).toBeTruthy();
    expect(screen.getByTestId("salary-chart")).toBeTruthy();
    expect(screen.getByTestId("hourly-chart")).toBeTruthy();
  });

  it("renders legend items", () => {
    render(<SalaryHourlyFinchChart {...defaultProps} />);
    expect(screen.getByText("State average")).toBeTruthy();
    expect(screen.getByText("Your company")).toBeTruthy();
    expect(screen.getByText("National average")).toBeTruthy();
  });

  it("renders default source attribution", () => {
    render(<SalaryHourlyFinchChart {...defaultProps} />);
    expect(screen.getByText("Source: BLS, 2023")).toBeTruthy();
  });

  it("renders custom source attribution", () => {
    render(<SalaryHourlyFinchChart {...defaultProps} sourceAttribution="Custom Source" />);
    expect(screen.getByText("Custom Source")).toBeTruthy();
  });
});

// ── StrategiesCard (recommendations) ─────────────────────────────────────────
const { default: StrategiesCard } = await import("@/pages/recommendations/StrategiesCard");

describe("StrategiesCard", () => {
  it("renders without crashing", () => {
    const { container } = render(<StrategiesCard />);
    expect(container.firstChild).toBeTruthy();
  });
});

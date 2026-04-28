/**
 * WorkforceDemographics Component Tests
 *
 * Covers: skeleton state, heading, demographics cards, donut charts,
 * age breakdown bars, and department / employment-type dropdown interactions.
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import WorkforceDemographics from "@/pages/workforce/WorkforceDemographics";

// ── Child component mocks ────────────────────────────────────────────────────
vi.mock("@/pages/recommendations/StaticCard", () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="static-card">
      <span data-testid="card-title">{title}</span>
    </div>
  ),
}));

vi.mock("@/pages/workforce/EmployTypeChart", () => ({
  default: ({ label, percentage }: { label: string; percentage: number }) => (
    <div data-testid="donut-chart" data-label={label} data-percentage={percentage} />
  ),
}));

vi.mock("@/components/base/progress-indicators/InlineProgressBar", () => ({
  default: ({ percentage }: { percentage: number }) => (
    <div data-testid="inline-progress-bar" data-percentage={percentage} />
  ),
}));

// Lightweight Select mock: renders a native <select> with the same items
vi.mock("@/components/base/select/select", () => ({
  Select: ({
    items,
    value,
    onSelectionChange,
    placeholder,
  }: {
    items: { id: string; label: string }[];
    value: string;
    onSelectionChange: (key: string) => void;
    placeholder?: string;
  }) => (
    <select
      data-testid="select"
      aria-label={placeholder}
      value={value}
      onChange={e => onSelectionChange(e.target.value)}
    >
      {items.map(item => (
        <option key={item.id} value={item.id}>
          {item.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("@/components/base/input/label", () => ({
  Label: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
}));

vi.mock("@/pages/workforce/WorkforceSkeletons", () => ({
  OverviewCardSkeleton: () => <div data-testid="overview-card-skeleton" />,
  DonutChartSkeleton: () => <div data-testid="donut-chart-skeleton" />,
  BreakDownCardSkeleton: () => <div data-testid="break-down-card-skeleton" />,
}));

vi.mock("@/assets/icons/ArrowDown", () => ({
  ArrowDown: () => null,
}));

// ── Fixtures ─────────────────────────────────────────────────────────────────
const COUNT_CLASS = "mt-2 text-3xl font-semibold text-ws-text-primary";

const departmentItems = [
  { id: "all", label: "All" },
  { id: "engineering", label: "Engineering" },
  { id: "hr", label: "Hr" },
];

const demographicsCards = [
  { id: "women", title: "Women", count: "45%", getCountClass: () => COUNT_CLASS },
  { id: "men", title: "Men", count: "55%", getCountClass: () => COUNT_CLASS },
];

const donutCharts = [
  {
    id: "full-time",
    label: "Full Time",
    percentage: 80,
    progressColor: "color-ws-progress-primary",
    backgroundColor: "bg-ws-progress-primary",
  },
  {
    id: "part-time",
    label: "Part Time",
    percentage: 15,
    progressColor: "color-ws-progress-secondary",
    backgroundColor: "bg-ws-progress-secondary",
  },
  {
    id: "seasonal",
    label: "Seasonal",
    percentage: 5,
    progressColor: "color-ws-progress-turnery",
    backgroundColor: "bg-ws-progress-turnery",
  },
];

const ageBreakdown = [
  { id: "age-0", label: "Age: > 30", value: 20, customColor: "bg-ws-light-teal-400 rounded-none" },
  {
    id: "age-1",
    label: "Age: 30 - 40",
    value: 35,
    customColor: "bg-ws-light-teal-700 rounded-none",
  },
];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("WorkforceDemographics", () => {
  const defaultProps = {
    isLoading: false,
    selectedDepartment: "all",
    setSelectedDepartment: vi.fn(),
    selectedEmploymentType: "fullTime" as const,
    setSelectedEmploymentType: vi.fn(),
    demographicsCardsConfig: demographicsCards,
    donutChartsConfig: donutCharts,
    ageBreakdownConfig: ageBreakdown,
    departmentItems,
  };

  describe("loading state", () => {
    it("renders overview card skeletons when isLoading is true", () => {
      render(<WorkforceDemographics {...defaultProps} isLoading={true} />);
      expect(screen.getAllByTestId("overview-card-skeleton").length).toBeGreaterThanOrEqual(1);
    });

    it("renders donut chart skeletons when isLoading is true", () => {
      render(<WorkforceDemographics {...defaultProps} isLoading={true} />);
      expect(screen.getAllByTestId("donut-chart-skeleton").length).toBeGreaterThanOrEqual(1);
    });

    it("renders age breakdown skeleton when isLoading is true", () => {
      render(<WorkforceDemographics {...defaultProps} isLoading={true} />);
      expect(screen.getByTestId("break-down-card-skeleton")).toBeInTheDocument();
    });

    it("does not render demographics cards or donut charts when loading", () => {
      render(<WorkforceDemographics {...defaultProps} isLoading={true} />);
      expect(screen.queryByTestId("static-card")).not.toBeInTheDocument();
      expect(screen.queryByTestId("donut-chart")).not.toBeInTheDocument();
    });
  });

  describe("loaded state", () => {
    it("renders the Demographics heading", () => {
      render(<WorkforceDemographics {...defaultProps} />);
      expect(screen.getByText("Demographics")).toBeInTheDocument();
    });

    it("renders the descriptive sub-text", () => {
      render(<WorkforceDemographics {...defaultProps} />);
      expect(screen.getByText(/snapshot of your workforce by gender/i)).toBeInTheDocument();
    });

    it("renders demographics cards with correct titles", () => {
      render(<WorkforceDemographics {...defaultProps} />);
      const titles = screen.getAllByTestId("card-title").map(el => el.textContent);
      expect(titles).toContain("Women");
      expect(titles).toContain("Men");
    });

    it("renders the Employment Type section heading", () => {
      render(<WorkforceDemographics {...defaultProps} />);
      // Both the <h2> section title and the dropdown label contain this text
      expect(screen.getAllByText("Employment Type").length).toBeGreaterThanOrEqual(1);
      expect(
        screen.getAllByRole("heading").some(h => h.textContent?.includes("Employment Type"))
      ).toBe(true);
    });

    it("renders all donut charts", () => {
      render(<WorkforceDemographics {...defaultProps} />);
      const charts = screen.getAllByTestId("donut-chart");
      expect(charts).toHaveLength(3);
    });

    it("renders each donut chart with the correct data attributes", () => {
      render(<WorkforceDemographics {...defaultProps} />);
      const charts = screen.getAllByTestId("donut-chart");
      expect(charts[0]).toHaveAttribute("data-label", "Full Time");
      expect(charts[0]).toHaveAttribute("data-percentage", "80");
      expect(charts[1]).toHaveAttribute("data-label", "Part Time");
      expect(charts[2]).toHaveAttribute("data-label", "Seasonal");
    });

    it("renders Employment Breakdown by Age heading", () => {
      render(<WorkforceDemographics {...defaultProps} />);
      expect(screen.getByText("Employment Breakdown by Age")).toBeInTheDocument();
    });

    it("renders age breakdown labels", () => {
      render(<WorkforceDemographics {...defaultProps} />);
      expect(screen.getByText("Age: > 30")).toBeInTheDocument();
      expect(screen.getByText("Age: 30 - 40")).toBeInTheDocument();
    });

    it("renders inline progress bars for each age group", () => {
      render(<WorkforceDemographics {...defaultProps} />);
      expect(screen.getAllByTestId("inline-progress-bar")).toHaveLength(ageBreakdown.length);
    });

    it("does not render skeletons when loaded", () => {
      render(<WorkforceDemographics {...defaultProps} />);
      expect(screen.queryByTestId("overview-card-skeleton")).not.toBeInTheDocument();
      expect(screen.queryByTestId("donut-chart-skeleton")).not.toBeInTheDocument();
      expect(screen.queryByTestId("break-down-card-skeleton")).not.toBeInTheDocument();
    });
  });

  describe("department dropdown", () => {
    it("renders the Department label", () => {
      render(<WorkforceDemographics {...defaultProps} />);
      expect(screen.getByText("Department")).toBeInTheDocument();
    });

    it("calls setSelectedDepartment when department is changed", () => {
      const setSelectedDepartment = vi.fn();
      render(
        <WorkforceDemographics {...defaultProps} setSelectedDepartment={setSelectedDepartment} />
      );
      const selects = screen.getAllByTestId("select");
      // First select is the department dropdown
      fireEvent.change(selects[0], { target: { value: "engineering" } });
      expect(setSelectedDepartment).toHaveBeenCalledWith("engineering");
    });

    it("renders department items in the dropdown", () => {
      render(<WorkforceDemographics {...defaultProps} />);
      const selects = screen.getAllByTestId("select");
      expect(selects[0]).toBeInTheDocument();
      expect(selects[0]).toHaveValue("all");
    });
  });

  describe("employment type dropdown", () => {
    it("renders the Employment Type label for the dropdown", () => {
      render(<WorkforceDemographics {...defaultProps} />);
      // The label wrapping the employment-type dropdown contains "Employment Type"
      const labels = screen.getAllByText(/Employment Type/);
      expect(labels.length).toBeGreaterThanOrEqual(1);
    });

    it("calls setSelectedEmploymentType when employment type is changed", () => {
      const setSelectedEmploymentType = vi.fn();
      render(
        <WorkforceDemographics
          {...defaultProps}
          setSelectedEmploymentType={setSelectedEmploymentType}
        />
      );
      const selects = screen.getAllByTestId("select");
      // Second select is the employment type dropdown
      fireEvent.change(selects[1], { target: { value: "partTime" } });
      expect(setSelectedEmploymentType).toHaveBeenCalledWith("partTime");
    });

    it("reflects the current selectedEmploymentType value", () => {
      render(<WorkforceDemographics {...defaultProps} selectedEmploymentType="partTime" />);
      const selects = screen.getAllByTestId("select");
      expect(selects[1]).toHaveValue("partTime");
    });
  });
});

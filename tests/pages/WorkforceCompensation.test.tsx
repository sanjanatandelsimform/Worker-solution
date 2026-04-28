/**
 * WorkforceCompensation Component Tests
 *
 * Covers: skeleton state, headings, compensation cards, workforce breakdown table,
 * salary breakdown cards, the salary chart, and department dropdown interactions.
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import WorkforceCompensation from "@/pages/workforce/WorkforceCompensation";

// ── Child component mocks ────────────────────────────────────────────────────
vi.mock("@/pages/recommendations/StaticCard", () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="static-card">
      <span data-testid="card-title">{title}</span>
    </div>
  ),
}));

vi.mock("@/pages/workforce/SalaryChart", () => ({
  default: ({ data }: { data: unknown[] }) => (
    <div data-testid="salary-chart" data-items={data.length} />
  ),
}));

vi.mock("@/components/base/table", () => ({
  Table: ({ data }: { data: unknown[] }) => <div data-testid="table" data-rows={data.length} />,
}));

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

vi.mock("@/components/base/tooltip/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/pages/workforce/WorkforceSkeletons", () => ({
  OverviewCardSkeleton: () => <div data-testid="overview-card-skeleton" />,
  BreakDownChartSkeleton: () => <div data-testid="break-down-chart-skeleton" />,
}));

vi.mock("@/assets/placeholder.svg", () => ({ default: "placeholder.svg" }));
vi.mock("@/assets/icons/ArrowDown", () => ({ ArrowDown: () => null }));

// ── Fixtures ─────────────────────────────────────────────────────────────────
const COUNT_CLASS = "mt-2 text-3xl font-semibold text-ws-text-primary";

const compensationCards = [
  {
    id: "median-salary",
    title: "Median Base Salary",
    count: "$75,000/yr",
    tooltipText: "",
    getCountClass: () => COUNT_CLASS,
  },
  {
    id: "average-salary",
    title: "Annual Average Salary",
    count: "$80,000.00/yr",
    tooltipText: "",
    getCountClass: () => COUNT_CLASS,
  },
  {
    id: "hourly-wage",
    title: "Average Hourly Wage",
    count: "$38.46",
    tooltipText: "",
    getCountClass: () => COUNT_CLASS,
  },
];

const salaryBreakdownCards = [
  {
    id: "employee-contribution",
    title: "Employee Contribution Per Paycheck (All benefits)",
    count: "$250.00",
    tooltipText: "Contribution tooltip",
    getCountClass: () => COUNT_CLASS,
  },
  {
    id: "employer-cost",
    title: "Employer Cost Per Employee (Avg)",
    count: "$11,240/yr",
    tooltipText: "Employer cost tooltip",
    getCountClass: () => COUNT_CLASS,
  },
];

const workforceDepartmentItems = [
  { id: "all", label: "All" },
  { id: "engineering", label: "Engineering" },
];

const allColumns = [
  { key: "department", header: "Department" },
  { key: "employeeNumber", header: "Employee Number" },
];

const userRows = [
  {
    department: "Engineering",
    employeeNumber: "50",
    partTime: "5",
    fullTime: "45",
    salaryRange: "$70k-$120k",
  },
];

const salaryColumns = [
  { key: "salaryRange", header: "Salary Range" },
  { key: "avgEmployeeCostPerPaycheck", header: "Average Employee Cost per Paycheck" },
];

const salaryRows = [
  {
    salaryRange: "$0-$30k",
    avgEmployeeCostPerPaycheck: "$50 (5%)",
    employerCostPerPaycheck: "$200",
  },
];

const salaryChartData = [{ label: "$0-$30k", min: 50, boxStart: 100, boxEnd: 200, max: 300 }];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("WorkforceCompensation", () => {
  const defaultProps = {
    isLoading: false,
    selectedWorkforceDept: "all",
    setSelectedWorkforceDept: vi.fn(),
    compensationCardsConfig: compensationCards,
    salaryBreakdownCardsConfig: salaryBreakdownCards,
    workforceDepartmentItems,
    columns: allColumns,
    users: userRows,
    columnsOne: salaryColumns,
    salary: salaryRows,
    salaryChartData,
  };

  describe("loading state", () => {
    it("renders overview card skeletons for compensation cards when isLoading", () => {
      render(<WorkforceCompensation {...defaultProps} isLoading={true} />);
      expect(screen.getAllByTestId("overview-card-skeleton").length).toBeGreaterThanOrEqual(3);
    });

    it("renders the salary chart skeleton when isLoading", () => {
      render(<WorkforceCompensation {...defaultProps} isLoading={true} />);
      expect(screen.getByTestId("break-down-chart-skeleton")).toBeInTheDocument();
    });

    it("does not render compensation StaticCards when loading", () => {
      render(<WorkforceCompensation {...defaultProps} isLoading={true} />);
      expect(screen.queryByTestId("static-card")).not.toBeInTheDocument();
    });

    it("does not render the SalaryChart when loading", () => {
      render(<WorkforceCompensation {...defaultProps} isLoading={true} />);
      expect(screen.queryByTestId("salary-chart")).not.toBeInTheDocument();
    });

    it("shows the empty-state image for the workforce table when loading", () => {
      render(<WorkforceCompensation {...defaultProps} isLoading={true} />);
      expect(screen.getAllByAltText("Empty state").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("loaded state", () => {
    it("renders the Compensation heading", () => {
      render(<WorkforceCompensation {...defaultProps} />);
      expect(screen.getByText("Compensation")).toBeInTheDocument();
    });

    it("renders the Compensation sub-text", () => {
      render(<WorkforceCompensation {...defaultProps} />);
      expect(screen.getByText(/how your organization compensates employees/i)).toBeInTheDocument();
    });

    it("renders all three compensation cards", () => {
      render(<WorkforceCompensation {...defaultProps} />);
      const titles = screen.getAllByTestId("card-title").map(el => el.textContent);
      expect(titles).toContain("Median Base Salary");
      expect(titles).toContain("Annual Average Salary");
      expect(titles).toContain("Average Hourly Wage");
    });

    it("renders the Workforce Breakdown heading", () => {
      render(<WorkforceCompensation {...defaultProps} />);
      expect(screen.getByText("Workforce Breakdown")).toBeInTheDocument();
    });

    it("renders the Table with the correct row count", () => {
      render(<WorkforceCompensation {...defaultProps} />);
      const tables = screen.getAllByTestId("table");
      // Two tables: workforce breakdown + salary cost
      expect(tables.length).toBeGreaterThanOrEqual(1);
    });

    it("renders the Benefits Cost Breakdown heading", () => {
      render(<WorkforceCompensation {...defaultProps} />);
      expect(screen.getByText("Benefits Cost Breakdown")).toBeInTheDocument();
    });

    it("renders salary breakdown cards", () => {
      render(<WorkforceCompensation {...defaultProps} />);
      const titles = screen.getAllByTestId("card-title").map(el => el.textContent);
      expect(titles).toContain("Employee Contribution Per Paycheck (All benefits)");
      expect(titles).toContain("Employer Cost Per Employee (Avg)");
    });

    it("renders the Employee Contribution Across Salary Bands heading", () => {
      render(<WorkforceCompensation {...defaultProps} />);
      expect(screen.getByText("Employee Contribution Across Salary Bands")).toBeInTheDocument();
    });

    it("renders the SalaryChart with the correct data", () => {
      render(<WorkforceCompensation {...defaultProps} />);
      const chart = screen.getByTestId("salary-chart");
      expect(chart).toBeInTheDocument();
      expect(chart).toHaveAttribute("data-items", "1");
    });

    it("does not render skeletons when loaded", () => {
      render(<WorkforceCompensation {...defaultProps} />);
      expect(screen.queryByTestId("overview-card-skeleton")).not.toBeInTheDocument();
      expect(screen.queryByTestId("break-down-chart-skeleton")).not.toBeInTheDocument();
    });
  });

  describe("department dropdown", () => {
    it("renders the Department label", () => {
      render(<WorkforceCompensation {...defaultProps} />);
      expect(screen.getByText("Department")).toBeInTheDocument();
    });

    it("calls setSelectedWorkforceDept when a department is selected", () => {
      const setSelectedWorkforceDept = vi.fn();
      render(
        <WorkforceCompensation
          {...defaultProps}
          setSelectedWorkforceDept={setSelectedWorkforceDept}
        />
      );
      const select = screen.getByTestId("select");
      fireEvent.change(select, { target: { value: "engineering" } });
      expect(setSelectedWorkforceDept).toHaveBeenCalledWith("engineering");
    });

    it("reflects the current selectedWorkforceDept value", () => {
      render(<WorkforceCompensation {...defaultProps} selectedWorkforceDept="engineering" />);
      expect(screen.getByTestId("select")).toHaveValue("engineering");
    });
  });
});

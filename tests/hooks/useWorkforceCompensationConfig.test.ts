/**
 * useWorkforceCompensationConfig Hook Tests
 *
 * Covers: null/fallback state, department filter (all vs specific dept),
 * columns switching, compensationCardsConfig formatting, salaryBreakdownCardsConfig,
 * salary table rows, salaryChartData, and getCountClass.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type { Compensation } from "@/types/workforceTypes";

// ── Shared mutable mock state ──────────────────────────────────────────────

let mockStoreState: object = { workforce: { data: null } };

vi.mock("@/store/hooks", () => ({
  useAppSelector: (selector: (state: object) => unknown) => selector(mockStoreState),
}));

// ── Dynamic import after mocks ─────────────────────────────────────────────

const { useWorkforceCompensationConfig } = await import("@/hooks/useWorkforceCompensationConfig");

// ── Helpers ────────────────────────────────────────────────────────────────

function buildStoreState(compensation: Compensation | null) {
  if (compensation === null) {
    return { workforce: { data: null } };
  }
  return {
    workforce: {
      data: {
        assessmentType: "finch",
        workforce: {
          dataStatus: "complete",
          workforce: null,
          participation: null,
          demographics: null,
          compensation,
        },
      },
    },
  };
}

const COUNT_CLASS = "mt-2 text-3xl font-semibold text-ws-text-primary";

const sampleCompensation: Compensation = {
  salaryBreakdown: {
    medianSalary: 60000,
    avgSalary: 65000.5,
    avgHourlyRate: 31.25,
  },
  workforceBreakdown: {
    departments: [
      {
        id: "engineering",
        label: "Engineering",
        empNumber: 50,
        partTime: 5,
        fullTime: 45,
        salaryRange: "$60k-$120k",
        jobTitles: [
          {
            jobTitle: "Engineer I",
            totalInRole: 20,
            partTime: 2,
            fullTime: 18,
            salaryRange: "$60k-$80k",
          },
          {
            jobTitle: "Engineer II",
            totalInRole: 30,
            partTime: 3,
            fullTime: 27,
            salaryRange: "$80k-$120k",
          },
        ],
      },
      {
        id: "sales",
        label: "Sales",
        empNumber: 30,
        partTime: 10,
        fullTime: 20,
        salaryRange: "$40k-$80k",
        jobTitles: [],
      },
    ],
  },
  benefitsCost: {
    employeeContribution: 250.5,
    employerCost: 11240,
    graph: [
      { salaryRange: "$0-$40k", min: 100, max: 500 },
      { salaryRange: "$40k-$80k", min: 200, max: 800 },
    ],
    table: [
      {
        salaryRange: "$0-$40k",
        avgEmployeeCostPerPaycheck: 120,
        avgEmployeeCostPercentage: 5,
        employerCostPerPaycheck: 300,
      },
      {
        salaryRange: "$40k-$80k",
        avgEmployeeCostPerPaycheck: 200,
        avgEmployeeCostPercentage: 8,
        employerCostPerPaycheck: null,
      },
    ],
  },
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe("useWorkforceCompensationConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState = buildStoreState(null);
  });

  // ── Null / fallback state ───────────────────────────────────────────────

  it("returns '--' for all card counts when compensationSection is null", () => {
    const { result } = renderHook(() => useWorkforceCompensationConfig("all"));
    result.current.compensationCardsConfig.forEach(card => {
      expect(card.count).toBe("--");
    });
    // employer cost card uses formatEmployerCostPerYear(undefined) → "--"
    result.current.salaryBreakdownCardsConfig.forEach(card => {
      expect(card.count).toBe("--");
    });
  });

  it("returns empty users and salary arrays when compensationSection is null", () => {
    const { result } = renderHook(() => useWorkforceCompensationConfig("all"));
    expect(result.current.users).toEqual([]);
    expect(result.current.salary).toEqual([]);
    expect(result.current.salaryChartData).toEqual([]);
  });

  it("workforceDepartmentItems always has 'All' as the first item", () => {
    const { result } = renderHook(() => useWorkforceCompensationConfig("all"));
    expect(result.current.workforceDepartmentItems[0]).toEqual({ id: "all", label: "All" });
  });

  // ── workforceDepartmentItems ────────────────────────────────────────────

  it("workforceDepartmentItems includes departments from compensation data", () => {
    mockStoreState = buildStoreState(sampleCompensation);
    const { result } = renderHook(() => useWorkforceCompensationConfig("all"));
    const items = result.current.workforceDepartmentItems;
    expect(items).toHaveLength(3); // "All" + engineering + sales
    expect(items[1]).toEqual({ id: "engineering", label: "Engineering" });
    expect(items[2]).toEqual({ id: "sales", label: "Sales" });
  });

  // ── columns switching ──────────────────────────────────────────────────

  it("uses WORKFORCE_COLUMNS_ALL when selectedWorkforceDept is 'all'", () => {
    mockStoreState = buildStoreState(sampleCompensation);
    const { result } = renderHook(() => useWorkforceCompensationConfig("all"));
    const colKeys = result.current.columns.map(c => c.key);
    expect(colKeys).toContain("department");
    expect(colKeys).toContain("employeeNumber");
  });

  it("uses WORKFORCE_COLUMNS_BY_DEPT when selectedWorkforceDept is a specific dept", () => {
    mockStoreState = buildStoreState(sampleCompensation);
    const { result } = renderHook(() => useWorkforceCompensationConfig("engineering"));
    const colKeys = result.current.columns.map(c => c.key);
    expect(colKeys).toContain("jobTitle");
    expect(colKeys).toContain("totalInRole");
    expect(colKeys).not.toContain("department");
  });

  // ── users (table rows) ─────────────────────────────────────────────────

  it("users shows all departments when dept is 'all'", () => {
    mockStoreState = buildStoreState(sampleCompensation);
    const { result } = renderHook(() => useWorkforceCompensationConfig("all"));
    const users = result.current.users;
    expect(users).toHaveLength(2);
    expect(users[0]).toMatchObject({
      department: "Engineering",
      employeeNumber: "50",
      partTime: "5",
      fullTime: "45",
      salaryRange: "$60k-$120k",
    });
    expect(users[1]).toMatchObject({
      department: "Sales",
      employeeNumber: "30",
    });
  });

  it("users shows jobTitle rows when a specific department is selected", () => {
    mockStoreState = buildStoreState(sampleCompensation);
    const { result } = renderHook(() => useWorkforceCompensationConfig("engineering"));
    const users = result.current.users;
    expect(users).toHaveLength(2); // 2 job titles in engineering
    expect(users[0]).toMatchObject({
      jobTitle: "Engineer I",
      totalInRole: "20",
      partTime: "2",
      fullTime: "18",
      salaryRange: "$60k-$80k",
    });
  });

  it("users is empty array when selected dept has no job titles", () => {
    mockStoreState = buildStoreState(sampleCompensation);
    const { result } = renderHook(() => useWorkforceCompensationConfig("sales"));
    expect(result.current.users).toEqual([]);
  });

  it("users is empty array when selected dept does not exist", () => {
    mockStoreState = buildStoreState(sampleCompensation);
    const { result } = renderHook(() => useWorkforceCompensationConfig("hr"));
    expect(result.current.users).toEqual([]);
  });

  // ── compensationCardsConfig ─────────────────────────────────────────────

  it("compensationCardsConfig has correct ids and titles", () => {
    mockStoreState = buildStoreState(sampleCompensation);
    const { result } = renderHook(() => useWorkforceCompensationConfig("all"));
    const [median, avg, hourly] = result.current.compensationCardsConfig;
    expect(median.id).toBe("median-salary");
    expect(median.title).toBe("Median Base Salary");
    expect(avg.id).toBe("average-salary");
    expect(avg.title).toBe("Annual Average Salary");
    expect(hourly.id).toBe("hourly-wage");
    expect(hourly.title).toBe("Average Hourly Wage");
  });

  it("medianSalary is formatted as '$60,000/yr'", () => {
    mockStoreState = buildStoreState(sampleCompensation);
    const { result } = renderHook(() => useWorkforceCompensationConfig("all"));
    expect(result.current.compensationCardsConfig[0].count).toBe(`$${(60000).toLocaleString()}/yr`);
  });

  it("avgSalary is formatted with 2 decimal places and '/yr'", () => {
    mockStoreState = buildStoreState(sampleCompensation);
    const { result } = renderHook(() => useWorkforceCompensationConfig("all"));
    expect(result.current.compensationCardsConfig[1].count).toBe(
      `$${(65000.5).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/yr`
    );
  });

  it("avgHourlyRate is formatted with 2 decimal places", () => {
    mockStoreState = buildStoreState(sampleCompensation);
    const { result } = renderHook(() => useWorkforceCompensationConfig("all"));
    expect(result.current.compensationCardsConfig[2].count).toBe(`$${(31.25).toFixed(2)}`);
  });

  it("compensationCardsConfig getCountClass returns correct CSS string", () => {
    mockStoreState = buildStoreState(sampleCompensation);
    const { result } = renderHook(() => useWorkforceCompensationConfig("all"));
    result.current.compensationCardsConfig.forEach(card => {
      expect(card.getCountClass()).toBe(COUNT_CLASS);
    });
  });

  // ── salaryBreakdownCardsConfig ─────────────────────────────────────────

  it("employee contribution is formatted with 2 decimal places", () => {
    mockStoreState = buildStoreState(sampleCompensation);
    const { result } = renderHook(() => useWorkforceCompensationConfig("all"));
    const [empCard] = result.current.salaryBreakdownCardsConfig;
    expect(empCard.count).toBe(
      `$${(250.5).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    );
  });

  it("employer cost uses formatEmployerCostPerYear for non-null value", () => {
    mockStoreState = buildStoreState(sampleCompensation);
    const { result } = renderHook(() => useWorkforceCompensationConfig("all"));
    const [, employerCard] = result.current.salaryBreakdownCardsConfig;
    expect(employerCard.count).toBe("$11,240/yr");
  });

  it("employer cost shows '--' when employerCost is null", () => {
    mockStoreState = buildStoreState({
      ...sampleCompensation,
      benefitsCost: { ...sampleCompensation.benefitsCost, employerCost: null },
    });
    const { result } = renderHook(() => useWorkforceCompensationConfig("all"));
    const [, employerCard] = result.current.salaryBreakdownCardsConfig;
    expect(employerCard.count).toBe("--");
  });

  // ── salary table rows ──────────────────────────────────────────────────

  it("salary table rows are formatted correctly", () => {
    mockStoreState = buildStoreState(sampleCompensation);
    const { result } = renderHook(() => useWorkforceCompensationConfig("all"));
    const salary = result.current.salary;
    expect(salary).toHaveLength(2);
    expect(salary[0]).toEqual({
      salaryRange: "$0-$40k",
      avgEmployeeCostPerPaycheck: "120 (5%)",
      employerCostPerPaycheck: "300",
    });
  });

  it("salary table shows '$xx.xx' when employerCostPerPaycheck is null", () => {
    mockStoreState = buildStoreState(sampleCompensation);
    const { result } = renderHook(() => useWorkforceCompensationConfig("all"));
    const salary = result.current.salary;
    expect(salary[1].employerCostPerPaycheck).toBe("$xx.xx");
  });

  // ── salaryChartData ────────────────────────────────────────────────────

  it("salaryChartData maps graph entries with min/max padding", () => {
    mockStoreState = buildStoreState(sampleCompensation);
    const { result } = renderHook(() => useWorkforceCompensationConfig("all"));
    const chart = result.current.salaryChartData;
    expect(chart).toHaveLength(2);
    expect(chart[0]).toEqual({
      label: "$0-$40k",
      min: Math.max(0, 100 - 40), // 60
      boxStart: 100,
      boxEnd: 500,
      max: Math.max(0, 500 + 40), // 540
    });
  });

  it("salaryChartData clamps min to 0 when min - 40 < 0", () => {
    mockStoreState = buildStoreState({
      ...sampleCompensation,
      benefitsCost: {
        ...sampleCompensation.benefitsCost,
        graph: [{ salaryRange: "low", min: 20, max: 100 }],
      },
    });
    const { result } = renderHook(() => useWorkforceCompensationConfig("all"));
    // min - 40 = -20 → clamped to 0
    expect(result.current.salaryChartData[0].min).toBe(0);
  });

  // ── columnsOne (SALARY_COST_COLUMNS) ──────────────────────────────────

  it("columnsOne contains expected salary cost column keys", () => {
    const { result } = renderHook(() => useWorkforceCompensationConfig("all"));
    const keys = result.current.columnsOne.map(c => c.key);
    expect(keys).toContain("salaryRange");
    expect(keys).toContain("avgEmployeeCostPerPaycheck");
    expect(keys).toContain("employerCostPerPaycheck");
  });
});

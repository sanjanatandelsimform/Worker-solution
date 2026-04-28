/**
 * workforceUtils Unit Tests
 *
 * Covers: parsePercentage, getWorkforceRowsByDept, and column constant shapes.
 */

import { describe, it, expect } from "vitest";
import {
  parsePercentage,
  getWorkforceRowsByDept,
  WORKFORCE_COLUMNS_ALL,
  WORKFORCE_COLUMNS_BY_DEPT,
  SALARY_COST_COLUMNS,
  AGE_COLORS,
} from "@/pages/workforce/workforceUtils";
import type { Department } from "@/types/workforceTypes";

// ── parsePercentage ──────────────────────────────────────────────────────────

describe("parsePercentage", () => {
  it("parses a valid percentage string", () => {
    expect(parsePercentage("45%")).toBe(45);
  });

  it("parses 100%", () => {
    expect(parsePercentage("100%")).toBe(100);
  });

  it("parses 0%", () => {
    expect(parsePercentage("0%")).toBe(0);
  });

  it("parses a decimal percentage", () => {
    expect(parsePercentage("33.5%")).toBeCloseTo(33.5);
  });

  it("returns 0 for 'N/A'", () => {
    expect(parsePercentage("N/A")).toBe(0);
  });

  it("returns 0 for an empty string", () => {
    expect(parsePercentage("")).toBe(0);
  });

  it("returns 0 for non-numeric strings", () => {
    expect(parsePercentage("unavailable")).toBe(0);
  });
});

// ── getWorkforceRowsByDept ───────────────────────────────────────────────────

const mockDepartments: Department[] = [
  {
    id: "engineering",
    label: "Engineering",
    empNumber: 50,
    partTime: 5,
    fullTime: 45,
    salaryRange: "$70k-$120k",
    jobTitles: [
      {
        jobTitle: "Software Engineer",
        totalInRole: 30,
        partTime: 3,
        fullTime: 27,
        salaryRange: "$80k-$120k",
      },
      {
        jobTitle: "QA Engineer",
        totalInRole: 10,
        partTime: 1,
        fullTime: 9,
        salaryRange: "$70k-$100k",
      },
    ],
  },
  {
    id: "hr",
    label: "HR",
    empNumber: 10,
    partTime: 2,
    fullTime: 8,
    salaryRange: "$50k-$80k",
    jobTitles: [],
  },
];

describe("getWorkforceRowsByDept", () => {
  it("returns mapped job-title rows for a matching department", () => {
    const rows = getWorkforceRowsByDept(mockDepartments, "engineering");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      jobTitle: "Software Engineer",
      totalInRole: "30",
      partTime: "3",
      fullTime: "27",
      salaryRange: "$80k-$120k",
    });
    expect(rows[1]).toEqual({
      jobTitle: "QA Engineer",
      totalInRole: "10",
      partTime: "1",
      fullTime: "9",
      salaryRange: "$70k-$100k",
    });
  });

  it("returns an empty array for a department with no job titles", () => {
    const rows = getWorkforceRowsByDept(mockDepartments, "hr");
    expect(rows).toHaveLength(0);
  });

  it("returns an empty array when the department id is not found", () => {
    const rows = getWorkforceRowsByDept(mockDepartments, "finance");
    expect(rows).toHaveLength(0);
  });

  it("returns an empty array when the departments list is empty", () => {
    const rows = getWorkforceRowsByDept([], "engineering");
    expect(rows).toHaveLength(0);
  });

  it("converts numeric fields to strings", () => {
    const rows = getWorkforceRowsByDept(mockDepartments, "engineering");
    expect(typeof rows[0].totalInRole).toBe("string");
    expect(typeof rows[0].partTime).toBe("string");
    expect(typeof rows[0].fullTime).toBe("string");
  });
});

// ── Column constant shapes ───────────────────────────────────────────────────

describe("WORKFORCE_COLUMNS_ALL", () => {
  it("has the correct number of columns", () => {
    expect(WORKFORCE_COLUMNS_ALL).toHaveLength(5);
  });

  it("includes the Department column", () => {
    expect(WORKFORCE_COLUMNS_ALL.some(c => c.key === "department")).toBe(true);
  });

  it("includes the Salary Range column", () => {
    expect(WORKFORCE_COLUMNS_ALL.some(c => c.key === "salaryRange")).toBe(true);
  });
});

describe("WORKFORCE_COLUMNS_BY_DEPT", () => {
  it("has the correct number of columns", () => {
    expect(WORKFORCE_COLUMNS_BY_DEPT).toHaveLength(5);
  });

  it("includes the Job Title column", () => {
    expect(WORKFORCE_COLUMNS_BY_DEPT.some(c => c.key === "jobTitle")).toBe(true);
  });
});

describe("SALARY_COST_COLUMNS", () => {
  it("has 3 columns", () => {
    expect(SALARY_COST_COLUMNS).toHaveLength(3);
  });

  it("includes the Salary Range column", () => {
    expect(SALARY_COST_COLUMNS.some(c => c.key === "salaryRange")).toBe(true);
  });
});

describe("AGE_COLORS", () => {
  it("contains 5 Tailwind color class strings", () => {
    expect(AGE_COLORS).toHaveLength(5);
    AGE_COLORS.forEach(c => {
      expect(typeof c).toBe("string");
      expect(c.startsWith("bg-")).toBe(true);
    });
  });
});

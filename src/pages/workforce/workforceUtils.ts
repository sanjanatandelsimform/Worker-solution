import type { TableColumn } from "@/components/base/table";
import type { Department } from "@/types/workforceTypes";

/**
 * Parses a percentage string from the workforce API.
 * Strips "%" and returns a number. Returns 0 for "N/A" or any invalid input.
 *
 * @example parsePercentage("45%") // 45
 * @example parsePercentage("N/A") // 0
 */
export const parsePercentage = (value: string): number => {
  const num = parseFloat(value.replace("%", ""));
  return isNaN(num) ? 0 : num;
};

export const AGE_COLORS = [
  "bg-ws-light-teal-400",
  "bg-ws-light-teal-700",
  "bg-ws-light-teal-100",
  "bg-ws-light-teal-300",
  "bg-ws-light-teal-950",
] as const;

export const WORKFORCE_COLUMNS_ALL: TableColumn[] = [
  { key: "department", header: "Department" },
  { key: "employeeNumber", header: "Employee number" },
  { key: "partTime", header: "Part time" },
  { key: "fullTime", header: "Full time" },
  { key: "salaryRange", header: "Salary range" },
];

export const WORKFORCE_COLUMNS_BY_DEPT: TableColumn[] = [
  { key: "jobTitle", header: "Job Title" },
  { key: "totalInRole", header: "Total in role" },
  { key: "partTime", header: "Part time" },
  { key: "fullTime", header: "Full time" },
  { key: "salaryRange", header: "Salary range" },
];

export const SALARY_COST_COLUMNS: TableColumn[] = [
  { key: "salaryRange", header: "Salary Range" },
  { key: "avgEmployeeCostPerPaycheck", header: "Average Employee Cost per Paycheck" },
  { key: "employerCostPerPaycheck", header: "Employer Cost per Paycheck" },
];

export function getWorkforceRowsByDept(
  departments: Department[],
  selectedDeptId: string
): Record<string, string>[] {
  const dept = departments.find(d => d.id === selectedDeptId);
  return (dept?.jobTitles ?? []).map(jt => ({
    jobTitle: jt.jobTitle,
    totalInRole: String(jt.totalInRole),
    partTime: String(jt.partTime),
    fullTime: String(jt.fullTime),
    salaryRange: jt.salaryRange,
  }));
}

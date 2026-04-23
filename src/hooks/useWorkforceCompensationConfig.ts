import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectCompensationSection } from "@/store/selectors/workforceSelectors";
import { formatEmployerCostPerYear } from "@/utils/formatters";
import type { TableColumn } from "@/components/base/table";
import {
  WORKFORCE_COLUMNS_ALL,
  WORKFORCE_COLUMNS_BY_DEPT,
  SALARY_COST_COLUMNS,
  getWorkforceRowsByDept,
} from "@/pages/workforce/workforceUtils";

const COUNT_CLASS = "mt-2 text-3xl font-semibold text-ws-text-primary";

export function useWorkforceCompensationConfig(selectedWorkforceDept: string) {
  const compensationSection = useAppSelector(selectCompensationSection);

  const workforceDepartmentItems = useMemo(
    () => [
      { id: "all", label: "All" },
      ...(compensationSection?.workforceBreakdown.departments ?? []).map(d => ({
        id: d.id,
        label: d.label,
      })),
    ],
    [compensationSection]
  );

  const columns: TableColumn[] =
    selectedWorkforceDept === "all" ? WORKFORCE_COLUMNS_ALL : WORKFORCE_COLUMNS_BY_DEPT;

  const users: Record<string, string>[] = useMemo(
    () =>
      selectedWorkforceDept === "all"
        ? (compensationSection?.workforceBreakdown.departments ?? []).map(d => ({
            department: d.label,
            employeeNumber: String(d.empNumber),
            partTime: String(d.partTime),
            fullTime: String(d.fullTime),
            salaryRange: d.salaryRange,
          }))
        : getWorkforceRowsByDept(
            compensationSection?.workforceBreakdown.departments ?? [],
            selectedWorkforceDept
          ),
    [compensationSection, selectedWorkforceDept]
  );

  const compensationCardsConfig = useMemo(
    () => [
      {
        id: "median-salary",
        title: "Median Base Salary",
        count: compensationSection
          ? `$${compensationSection.salaryBreakdown.medianSalary.toLocaleString()}/yr`
          : "--",
        tooltipText: "Home Ownership Rate",
        getCountClass: () => COUNT_CLASS,
      },
      {
        id: "average-salary",
        title: "Annual Average Salary",
        count: compensationSection
          ? `$${compensationSection.salaryBreakdown.avgSalary.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/yr`
          : "--",
        tooltipText: "Median Home Value",
        getCountClass: () => COUNT_CLASS,
      },
      {
        id: "hourly-wage",
        title: "Average Hourly Wage",
        count: compensationSection
          ? `$${compensationSection.salaryBreakdown.avgHourlyRate.toFixed(2)}`
          : "--",
        tooltipText: "Median Rent",
        getCountClass: () => COUNT_CLASS,
      },
    ],
    [compensationSection]
  );

  const salaryBreakdownCardsConfig = useMemo(
    () => [
      {
        id: "employee-contribution",
        title: "Employee Contribution Per Paycheck (All benefits)",
        count: compensationSection
          ? `$${compensationSection.benefitsCost.employeeContribution.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : "--",
        tooltipText: "The average amount your employees contribute per paycheck across benefits",
        getCountClass: () => COUNT_CLASS,
      },
      {
        id: "employer-cost",
        title: "Employer Cost Per Employee (Avg)",
        count: formatEmployerCostPerYear(compensationSection?.benefitsCost.employerCost),
        tooltipText: "The average amount each employee costs the company across benefits",
        getCountClass: () => COUNT_CLASS,
      },
    ],
    [compensationSection]
  );

  const salary = useMemo(
    () =>
      (compensationSection?.benefitsCost.table ?? []).map(row => ({
        salaryRange: row.salaryRange,
        avgEmployeeCostPerPaycheck: `${row.avgEmployeeCostPerPaycheck} (${row.avgEmployeeCostPercentage}%)`,
        employerCostPerPaycheck:
          row.employerCostPerPaycheck !== null && row.employerCostPerPaycheck !== undefined
            ? String(row.employerCostPerPaycheck)
            : "$xx.xx",
      })),
    [compensationSection]
  );

  const salaryChartData = useMemo(
    () =>
      (compensationSection?.benefitsCost.graph ?? []).map(g => ({
        label: g.salaryRange,
        min: Math.max(0, g.min - 40),
        boxStart: g.min,
        boxEnd: g.max,
        max: Math.max(0, g.max + 40),
      })),
    [compensationSection]
  );

  const columnsOne: TableColumn[] = SALARY_COST_COLUMNS;

  return {
    workforceDepartmentItems,
    columns,
    users,
    columnsOne,
    salary,
    compensationCardsConfig,
    salaryBreakdownCardsConfig,
    salaryChartData,
  };
}

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectWorkforceSection } from "@/store/selectors/workforceSelectors";

const COUNT_CLASS = "mt-2 text-3xl font-semibold text-ws-text-primary";

export function useWorkforceOverviewConfig() {
  const workforceSection = useAppSelector(selectWorkforceSection);

  const overviewCardsConfig = useMemo(
    () => [
      {
        id: "total-workforce",
        title: "Total Workforce",
        count: workforceSection?.totalWorkforce?.toLocaleString() ?? "--",
        tooltipText: "Turnover Rate",
        getDescriptionText: () =>
          "Industry specific turnover metrics are calculated from US Census Bureau QWI data sources",
        getCountClass: () => COUNT_CLASS,
      },
      {
        id: "enrolled-benefits",
        title: "Enrolled in Benefits",
        count: workforceSection?.enrolledBenefits?.toLocaleString() ?? "--",
        tooltipText: "Average Turnover",
        getDescriptionText: () =>
          "Average turnover metrics are calculated from US Census Bureau QWI data sources",
        getCountClass: () => COUNT_CLASS,
      },
      {
        id: "avg-employee-cost",
        title: "Avg. Employee Cost Per Pay Period",
        count: workforceSection ? `$${workforceSection.avgEmployeeCost.toLocaleString()}` : "--",
        tooltipText: "Average Cost of Turnover",
        getDescriptionText: () =>
          "Industry specific cost of turnover is calculated from US Census Bureau QWI data sources",
        getCountClass: () => COUNT_CLASS,
      },
      {
        id: "employer-cost",
        title: "Employer Cost Per Employee",
        count: workforceSection
          ? `$${workforceSection.employerCostPerEmployee.toLocaleString()}/yr`
          : "--",
        tooltipText: "Turnover Rate",
        getDescriptionText: () =>
          "Industry specific turnover metrics are calculated from US Census Bureau QWI data sources",
        getCountClass: () => COUNT_CLASS,
      },
    ],
    [workforceSection]
  );

  const employeeCardsConfig = useMemo(
    () => [] as typeof overviewCardsConfig,
    [overviewCardsConfig]
  );

  return { overviewCardsConfig, employeeCardsConfig };
}

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
        getCountClass: (): string => COUNT_CLASS,
      },
      {
        id: "enrolled-benefits",
        title: "Enrolled in Benefits",
        count: workforceSection?.enrolledBenefits?.toLocaleString() ?? "--",
        getCountClass: (): string => COUNT_CLASS,
      },
      {
        id: "avg-employee-cost",
        title: "Avg. Employee Cost Per Pay Period",
        count: workforceSection ? `$${workforceSection.avgEmployeeCost.toLocaleString()}` : "--",
        getCountClass: (): string => COUNT_CLASS,
      },
      {
        id: "employer-cost",
        title: "Employer Cost Per Employee",
        count: workforceSection
          ? `$${workforceSection.employerCostPerEmployee.toLocaleString()}/yr`
          : "--",
        getDescriptionText: (): string =>
          "The average amount each employee costs the company across benefits",
        getCountClass: (): string => COUNT_CLASS,
      },
    ],
    [workforceSection]
  );

  const employeeCardsConfig = useMemo(
    () => [] as typeof overviewCardsConfig,

    []
  );

  return { overviewCardsConfig, employeeCardsConfig };
}

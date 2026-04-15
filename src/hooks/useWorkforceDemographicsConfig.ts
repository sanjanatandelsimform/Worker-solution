import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectDemographicsSection } from "@/store/selectors/workforceSelectors";
import { parsePercentage, AGE_COLORS } from "@/pages/workforce/workforceUtils";

const COUNT_CLASS = "mt-2 text-3xl font-semibold text-ws-text-primary";

export function useWorkforceDemographicsConfig(
  selectedDepartment: string,
  selectedEmploymentType: "fullTime" | "partTime" | "seasonal"
) {
  const demographicsSection = useAppSelector(selectDemographicsSection);

  const departmentItems = useMemo(
    () =>
      demographicsSection?.employementType.map(entry => ({
        id: entry.department,
        label:
          entry.department === "all"
            ? "All"
            : entry.department.charAt(0).toUpperCase() + entry.department.slice(1),
      })) ?? [],
    [demographicsSection]
  );

  const demographicsCardsConfig = useMemo(
    () => [
      {
        id: "women",
        title: "Women",
        count: demographicsSection?.gender.women ?? "--",
        tooltipText: "Turnover Rate",
        getCountClass: () => COUNT_CLASS,
      },
      {
        id: "men",
        title: "Men",
        count: demographicsSection?.gender.men ?? "--",
        tooltipText: "Average Turnover",
        getCountClass: () => COUNT_CLASS,
      },
    ],
    [demographicsSection]
  );

  const donutChartsConfig = useMemo(() => {
    const selectedDeptData =
      demographicsSection?.employementType.find(e => e.department === selectedDepartment) ??
      demographicsSection?.employementType[0];

    if (!selectedDeptData) return [];

    return [
      {
        id: "full-time",
        label: "Full Time",
        percentage: parsePercentage(selectedDeptData.fullTime),
        progressColor: "color-ws-progress-primary",
        backgroundColor: "bg-ws-progress-primary",
      },
      {
        id: "part-time",
        label: "Part Time",
        percentage: parsePercentage(selectedDeptData.partTime),
        progressColor: "color-ws-progress-secondary",
        backgroundColor: "bg-ws-progress-secondary",
      },
      {
        id: "seasonal",
        label: "Seasonal",
        percentage: parsePercentage(selectedDeptData.seasonal),
        progressColor: "color-ws-progress-turnery",
        backgroundColor: "bg-ws-progress-turnery",
      },
    ];
  }, [demographicsSection, selectedDepartment]);

  const ageBreakdownConfig = useMemo(
    () =>
      (demographicsSection?.employmentBreakdownByAge ?? []).map((entry, i) => ({
        id: `age-${i}`,
        label: `Age: ${entry.ageGroup}`,
        value: entry[selectedEmploymentType],
        customColor: `${AGE_COLORS[i % AGE_COLORS.length]} rounded-none`,
      })),
    [demographicsSection, selectedEmploymentType]
  );

  return { departmentItems, demographicsCardsConfig, donutChartsConfig, ageBreakdownConfig };
}

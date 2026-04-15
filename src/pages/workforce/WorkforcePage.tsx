"use client";
import { useState } from "react";
import StaticCard from "../recommendations/StaticCard";
import { Select } from "@/components/base/select/select";
import { GetInTouchModal } from "@/components/modals/GetInTouchModal";
import { useAppSelector } from "@/store/hooks";
import {
  selectWorkforceLoading,
  selectWorkforceError,
  selectWorkforceSection,
  selectParticipationSection,
  selectDemographicsSection,
  selectCompensationSection,
} from "@/store/selectors/workforceSelectors";
import ErrorMessage from "@/components/common/ErrorMessage";
import { Label } from "@/components/base/input/label";

import { GlobeIcon } from "@/assets/icons/Globe";
import ProgressCard from "../benchmark/ProgressCard";
import didHeroImg from "@/assets/employees-reported.jpg";
import { EnrolledIcon } from "@/assets/icons/EnrolledIcon";
import { SavingIcon } from "@/assets/icons/SavingIcon";
import { HeartLineIcon } from "@/assets/icons/HeartLineIcon";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import DonutChart from "./EmployTypeChart";
import { Table, TableColumn } from "@/components/base/table";
import SalaryChart from "./SalaryChart";
import { Link } from "react-router-dom";
import emptyStateWorkforce from "@/assets/placeholder.svg";

const OverviewCardSkeleton = () => (
  <div className="border border-ws-border-secondary rounded-lg p-4 bg-ws-base-white animate-pulse shadow-sm">
    <div className="flex items-end justify-between">
      <div className="h-4 bg-ws-gray-200 rounded w-3/4 mb-4"></div>
      <div className="w-4 h-4 bg-ws-gray-200 rounded-full mb-4"></div>
    </div>
    <div className="h-10 bg-ws-gray-200 rounded w-1/3"></div>
  </div>
);

const WagesCardSkeleton = () => (
  <div className="border border-ws-border-secondary rounded-lg p-4 bg-ws-base-white animate-pulse shadow-sm">
    <div className="h-4 bg-ws-gray-200 rounded w-3/4 mb-3"></div>
    <div className="flex items-end justify-between">
      <div className="h-12 bg-ws-gray-200 rounded w-3/4"></div>
      <div className="w-8 h-8 bg-ws-gray-200 rounded-full"></div>
    </div>
  </div>
);

const ProgressCardSkeleton = () => (
  <div className="border border-ws-border-secondary rounded-lg p-4 bg-ws-base-white animate-pulse shadow-sm">
    <div className="w-full space-y-3">
      <div className="h-4 bg-ws-gray-200 rounded w-1/6 mb-3"></div>
      <div className="flex items-center justify-between gap-4">
        <div className="h-3 bg-ws-gray-200 rounded w-1/6"></div>
        <div className="h-8 bg-ws-gray-200 rounded w-5/6"></div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="h-3 bg-ws-gray-200 rounded w-1/6"></div>
        <div className="h-8 bg-ws-gray-200 rounded w-5/6"></div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="h-3 bg-ws-gray-200 rounded w-1/6"></div>
        <div className="h-8 bg-ws-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);

const ProgressCardSkeletonOne = () => (
  <div className="border border-ws-border-secondary rounded-lg p-4 bg-ws-base-white animate-pulse shadow-sm">
    <div className="w-full">
      <div className="h-4 bg-ws-gray-200 rounded w-1/6 mb-3"></div>
      <div className="flex items-center justify-between gap-4">
        <div className="h-3 bg-ws-gray-200 rounded w-1/6"></div>
        <div className="h-8 bg-ws-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);

const ProgressCardSkeletonFour = () => (
  <div className="border border-ws-border-secondary rounded-lg p-4 bg-ws-base-white animate-pulse shadow-sm">
    <div className="w-full space-y-3">
      <div className="h-4 bg-ws-gray-200 rounded w-1/6 mb-3"></div>
      <div className="flex items-center justify-between gap-4">
        <div className="h-3 bg-ws-gray-200 rounded w-1/6"></div>
        <div className="h-8 bg-ws-gray-200 rounded w-5/6"></div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="h-3 bg-ws-gray-200 rounded w-1/6"></div>
        <div className="h-8 bg-ws-gray-200 rounded w-5/6"></div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="h-3 bg-ws-gray-200 rounded w-1/6"></div>
        <div className="h-8 bg-ws-gray-200 rounded w-5/6"></div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="h-3 bg-ws-gray-200 rounded w-1/6"></div>
        <div className="h-8 bg-ws-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);

const DonutChartSkeleton = () => (
  <div className="rounded-lg p-4 bg-ws-base-white">
    <div className="flex items-center justify-center animate-pulse">
      <div className="h-48 w-48 rounded-full border-20 border-ws-gray-200"></div>
      <div className="flex items-center justify-center absolute flex-col space-y-3">
        <div className="h-4 bg-ws-gray-200 w-15"></div>
        <div className="h-3 bg-ws-gray-200 w-18"></div>
      </div>
    </div>
  </div>
);

const BreakDownCardSkeleton = () => (
  <div className="border border-ws-border-secondary rounded-lg p-4 bg-ws-base-white animate-pulse shadow-sm">
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="h-3 bg-ws-gray-200 rounded w-32"></div>
        <div className="h-8 bg-ws-gray-200 rounded w-full"></div>
        <div className="h-3 bg-ws-gray-200 rounded w-24"></div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="h-3 bg-ws-gray-200 rounded w-32"></div>
        <div className="h-8 bg-ws-gray-200 rounded w-full"></div>
        <div className="h-3 bg-ws-gray-200 rounded w-24"></div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="h-3 bg-ws-gray-200 rounded w-32"></div>
        <div className="h-8 bg-ws-gray-200 rounded w-full"></div>
        <div className="h-3 bg-ws-gray-200 rounded w-24"></div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="h-3 bg-ws-gray-200 rounded w-32"></div>
        <div className="h-8 bg-ws-gray-200 rounded w-full"></div>
        <div className="h-3 bg-ws-gray-200 rounded w-24"></div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="h-3 bg-ws-gray-200 rounded w-32"></div>
        <div className="h-8 bg-ws-gray-200 rounded w-full"></div>
        <div className="h-3 bg-ws-gray-200 rounded w-24"></div>
      </div>
    </div>
  </div>
);

const BreakDownChartSkeleton = () => (
  <div className="border border-ws-border-secondary rounded-lg p-5 bg-ws-base-white animate-pulse shadow-sm">
    <div className="flex items-end w-full gap-4">
      <div className="w-full h-80 flex items-center justify-center flex-col gap-4">
        <div className="flex items-end justify-center gap-4">
          <div className="w-10 h-40 bg-ws-gray-200"></div>
        </div>
      </div>
      <div className="w-full h-80 flex items-center justify-center flex-col gap-4">
        <div className="flex items-end justify-center gap-4">
          <div className="w-10 h-25 bg-ws-gray-200"></div>
        </div>
      </div>
      <div className="w-full h-80 flex items-center justify-center flex-col gap-4">
        <div className="flex items-end justify-center gap-4">
          <div className="w-10 h-15 bg-ws-gray-200"></div>
        </div>
      </div>
      <div className="w-full h-80 flex items-center justify-center flex-col gap-4">
        <div className="flex items-end justify-center gap-4">
          <div className="w-10 h-10 bg-ws-gray-200"></div>
        </div>
      </div>
      <div className="w-full h-80 flex items-center justify-center flex-col gap-4">
        <div className="flex items-end justify-center gap-4">
          <div className="w-10 h-30 bg-ws-gray-200"></div>
        </div>
      </div>
    </div>
    <div className="flex items-center justify-around w-full gap-8">
      <div className="h-2 w-30 bg-ws-gray-200 rounded"></div>
      <div className="h-2 w-30 bg-ws-gray-200 rounded"></div>
      <div className="h-2 w-30 bg-ws-gray-200 rounded"></div>
      <div className="h-2 w-30 bg-ws-gray-200 rounded"></div>
      <div className="h-2 w-30 bg-ws-gray-200 rounded"></div>
    </div>
  </div>
);

export default function WorkforcePage() {
  const [isGetInTouchModalOpen, setIsGetInTouchModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<
    "fullTime" | "partTime" | "seasonal"
  >("fullTime");

  const employmentTypeItems = [
    { id: "fullTime", label: "Full Time" },
    { id: "partTime", label: "Part Time" },
    { id: "seasonal", label: "Seasonal" },
  ];

  // Helper: strip "%" and return a number; returns 0 for "N/A" or invalid strings
  const parsePercentage = (value: string): number => {
    const num = parseFloat(value.replace("%", ""));
    return isNaN(num) ? 0 : num;
  };

  // Redux state
  const isLoadingCards = useAppSelector(selectWorkforceLoading);
  const workforceError = useAppSelector(selectWorkforceError);
  const workforceSection = useAppSelector(selectWorkforceSection);
  const participationSection = useAppSelector(selectParticipationSection);
  const demographicsSection = useAppSelector(selectDemographicsSection);
  const compensationSection = useAppSelector(selectCompensationSection);

  // Department dropdown items derived from API
  const departmentItems =
    demographicsSection?.employementType.map(entry => ({
      id: entry.department,
      label:
        entry.department === "all"
          ? "All"
          : entry.department.charAt(0).toUpperCase() + entry.department.slice(1),
    })) ?? [];

  const columns: TableColumn[] = [
    { key: "department", header: "Department" },
    { key: "employeeNumber", header: "Employee number" },
    { key: "partTime", header: "Part time" },
    { key: "fullTime", header: "Full time" },
    { key: "salaryRange", header: "Salary range" },
  ];
  const users = (compensationSection?.workforceBreakdown.departments ?? []).map(d => ({
    department: d.label,
    employeeNumber: String(d.empNumber),
    partTime: String(d.partTime),
    fullTime: String(d.fullTime),
    salaryRange: d.salaryRange,
  }));

  const columnsOne: TableColumn[] = [
    { key: "salaryRange", header: "Salary range" },
    { key: "avgEmployeeCostPerPaycheck", header: "Avg. Employee cost per paycheck" },
    { key: "employerCostPerPaycheck", header: "Employer cost per paycheck" },
  ];
  const salary = (compensationSection?.benefitsCost.table ?? []).map(row => ({
    salaryRange: row.salaryRange,
    avgEmployeeCostPerPaycheck: `${row.avgEmployeeCostPerPaycheck} (${row.avgEmployeeCostPercentage}%)`,
    employerCostPerPaycheck:
      row.employerCostPerPaycheck != null ? String(row.employerCostPerPaycheck) : "$xx.xx",
  }));

  interface StaticCardOverviewConfig {
    id: string;
    title: string;
    count: string;
    tooltipText: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getDescriptionText: (industryOverview?: any) => string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getCountClass: (industryOverview?: any) => string;
  }

  const overviewCardsConfig: StaticCardOverviewConfig[] = [
    {
      id: "total-workforce",
      title: "Total Workforce",
      count: workforceSection?.totalWorkforce?.toLocaleString() ?? "--",
      tooltipText: "Turnover Rate",
      getDescriptionText: () =>
        "Industry specific turnover metrics are calculated from US Census Bureau QWI data sources",
      getCountClass: () => "mt-2 text-3xl font-semibold text-ws-text-primary",
    },
    {
      id: "enrolled-benefits",
      title: "Enrolled in Benefits",
      count: workforceSection?.enrolledBenefits?.toLocaleString() ?? "--",
      tooltipText: "Average Turnover",
      getDescriptionText: () =>
        "Average turnover metrics are calculated from US Census Bureau QWI data sources",
      getCountClass: () => "mt-2 text-3xl font-semibold text-ws-text-primary",
    },
    {
      id: "avg-employee-cost",
      title: "Avg. Employee Cost Per Pay Period",
      count: workforceSection ? `$${workforceSection.avgEmployeeCost.toLocaleString()}` : "--",
      tooltipText: "Average Cost of Turnover",
      getDescriptionText: () =>
        "Industry specific cost of turnover is calculated from US Census Bureau QWI data sources",
      getCountClass: () => "mt-2 text-3xl font-semibold text-ws-text-primary",
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
      getCountClass: () => "mt-2 text-3xl font-semibold text-ws-text-primary",
    },
  ];

  const employeeCardsConfig: StaticCardOverviewConfig[] = [
    //   {
    //     id: "employer-cost",
    //     title: "Employer Cost Per Employee",
    //     count: workforceSection
    //       ? `$${workforceSection.employerCostPerEmployee.toLocaleString()}/yr`
    //       : "--",
    //     tooltipText: "Turnover Rate",
    //     getDescriptionText: () =>
    //       "Industry specific turnover metrics are calculated from US Census Bureau QWI data sources",
    //     getCountClass: () => "mt-2 text-3xl font-semibold text-ws-text-primary",
    //   },
  ];

  interface ParticipationCardConfig {
    id: string;
    title: string;
    count: string;
    countIcon: React.ReactNode;
  }

  const participationCardsConfig: ParticipationCardConfig[] = [
    {
      id: "eligible-employees",
      title: "Eligible Employees",
      count: participationSection?.totalWorkforce?.toLocaleString() ?? "--",
      countIcon: <GlobeIcon className="size-5 text-ws-gray-300" />,
    },
    {
      id: "enrolled-employees",
      title: "Enrolled Employees",
      count: participationSection?.enrolledBenefits?.toLocaleString() ?? "--",
      countIcon: <EnrolledIcon className="size-5 text-ws-gray-300" />,
    },
    {
      id: "enrolled-retirement",
      title: "Enrolled in retirement",
      count: participationSection?.retirementEnrollment ?? "--",
      countIcon: <SavingIcon className="size-5 text-ws-gray-300" />,
    },
    {
      id: "enrolled-healthcare",
      title: "Enrolled in healthcare",
      count: participationSection?.healthcareEnrollment ?? "--",
      countIcon: <HeartLineIcon className="size-5 text-ws-gray-300" />,
    },
  ];

  interface DemographicsCardConfig {
    id: string;
    title: string;
    count: string;
    tooltipText: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getCountClass: (industryOverview?: any) => string;
  }

  const demographicsCardsConfig: DemographicsCardConfig[] = [
    {
      id: "women",
      title: "Women",
      count: demographicsSection?.gender.women ?? "--",
      tooltipText: "Turnover Rate",
      getCountClass: () => "mt-2 text-3xl font-semibold text-ws-text-primary",
    },
    {
      id: "men",
      title: "Men",
      count: demographicsSection?.gender.men ?? "--",
      tooltipText: "Average Turnover",
      getCountClass: () => "mt-2 text-3xl font-semibold text-ws-text-primary",
    },
  ];

  interface DonutChartConfig {
    id: string;
    label: string;
    percentage: number;
    progressColor: string;
    backgroundColor: string;
  }

  const selectedDeptData =
    demographicsSection?.employementType.find(e => e.department === selectedDepartment) ??
    demographicsSection?.employementType[0];

  const donutChartsConfig: DonutChartConfig[] = selectedDeptData
    ? [
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
      ]
    : [];

  interface AgeBreakdownConfig {
    id: string;
    label: string;
    value: number;
    customColor: string;
  }

  const ageColors = [
    "bg-ws-light-teal-400",
    "bg-ws-light-teal-700",
    "bg-ws-light-teal-100",
    "bg-ws-light-teal-300",
    "bg-ws-light-teal-950",
  ];

  const ageBreakdownConfig: AgeBreakdownConfig[] = (
    demographicsSection?.employmentBreakdownByAge ?? []
  ).map((entry, i) => ({
    id: `age-${i}`,
    label: `Age: ${entry.ageGroup}`,
    value: entry[selectedEmploymentType],
    customColor: `${ageColors[i % ageColors.length]} rounded-none`,
  }));

  interface SalaryBreakdownCardConfig {
    id: string;
    title: string;
    count: string;
    tooltipText: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getCountClass: (selectedHousingData?: any) => string;
  }

  const salaryBreakdownCardsConfig: SalaryBreakdownCardConfig[] = [
    {
      id: "employee-contribution",
      title: "Employee Contribution Per Paycheck (All benefits)",
      count: compensationSection
        ? `$${compensationSection.benefitsCost.employeeContribution.toLocaleString()}`
        : "--",
      tooltipText: "Home Ownership Rate",
      getCountClass: () => "mt-2 text-3xl font-semibold text-ws-text-primary",
    },
    {
      id: "employer-cost",
      title: "Employer Cost Per Employee (Avg)",
      count: compensationSection?.benefitsCost.employerCost ?? "--",
      tooltipText: "Median Home Value",
      getCountClass: () => "mt-2 text-3xl font-semibold text-ws-text-primary",
    },
  ];

  interface CompensationCardConfig {
    id: string;
    title: string;
    count: string;
    tooltipText: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getCountClass: (selectedHousingData?: any) => string;
  }

  const compensationCardsConfig: CompensationCardConfig[] = [
    {
      id: "median-salary",
      title: "Median Base Salary",
      count: compensationSection
        ? `$${compensationSection.salaryBreakdown.medianSalary.toLocaleString()}/yr`
        : "--",
      tooltipText: "Home Ownership Rate",
      getCountClass: () => "mt-2 text-3xl font-semibold text-ws-text-primary",
    },
    {
      id: "average-salary",
      title: "Average Salary",
      count: compensationSection
        ? `$${compensationSection.salaryBreakdown.avgSalary.toLocaleString()}/yr`
        : "--",
      tooltipText: "Median Home Value",
      getCountClass: () => "mt-2 text-3xl font-semibold text-ws-text-primary",
    },
    {
      id: "hourly-wage",
      title: "Average Hourly Wage",
      count: compensationSection
        ? `$${compensationSection.salaryBreakdown.avgHourlyRate.toFixed(2)}`
        : "--",
      tooltipText: "Median Rent",
      getCountClass: () => "mt-2 text-3xl font-semibold text-ws-text-primary",
    },
  ];

  return (
    <div className="bg-ws-base-white py-10 px-6 space-y-6 shadow-xl rounded-b-xl">
      <div className="w-full flex items-start flex-col gap-4">
        <h2 className="text-2xl lg:text-4xl font-medium text-ws-text-primary leading-10">
          Workforce Information
        </h2>
        <p className="text-2xl text-ws-text-primary">Breakdown Overview</p>
      </div>

      {/* Error banner */}
      {workforceError && <ErrorMessage errorMessage={workforceError} errorType="danger" />}

      {/* ── Industry Overview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full">
        {isLoadingCards ? (
          <>
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
          </>
        ) : (
          <>
            {overviewCardsConfig.map(card => (
              <StaticCard
                key={card.id}
                title={card.title}
                titleClass="text-sm font-medium text-ws-text-tertiary"
                itemAlign="between"
                count={card.count}
                countClass={card.getCountClass()}
                infoIcon={true}
                infoCircleClass="text-ws-gray-400 size-5"
                tooltipText={card.tooltipText}
                descriptionText={card.getDescriptionText()}
                placements="top"
              />
            ))}
          </>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {isLoadingCards ? (
          <>
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
          </>
        ) : (
          <>
            {employeeCardsConfig.map(card => (
              <StaticCard
                key={card.id}
                title={card.title}
                titleClass="text-sm font-medium text-ws-text-tertiary"
                itemAlign="between"
                count={card.count}
                countClass={card.getCountClass()}
                infoIcon={true}
                infoCircleClass="text-ws-gray-400 size-5"
                tooltipText={card.tooltipText}
                descriptionText={card.getDescriptionText()}
                placements="top"
              />
            ))}
          </>
        )}
      </div>

      <div className="w-full mt-6">
        <div className="bg-ws-light-teal-50 flex gape-4 rounded-xl xl:max-h-33 ring-1 ring-ws-border-primary">
          <div className="flex w-100 xl:w-auto">
            <img
              src={didHeroImg}
              alt="Workforce hero"
              className="w-full xl:w-42 rounded-tl-xl rounded-bl-xl h-full object-cover"
            />
          </div>
          <div className="p-4 overflow-auto">
            <h4 className="text-base font-semibold mb-2 text-ws-light-teal-950">Did you know?</h4>
            <p className="text-lg text-ws-light-teal-950">
              <span className="font-semibold">78%</span> of employees reported they’re more likely
              to stay with an employer because of their benefits program.
            </p>
          </div>
        </div>
      </div>

      {/* ── Industry Turnover ── */}
      <div className="w-full flex flex-col items-center bg-ws-light-teal-25 border border-ws-border-primary rounded-xl py-8 px-6">
        <div className="w-full flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl lg:text-4xl font-medium text-ws-text-primary">
              Participation Breakdown
            </h3>
            <p className="text-base text-ws-text-primary w-full mt-2">
              Your highest participation rate is health insurance. 89% of your employees are using
              this benefit. Your lowest participation rate is wellness program.{" "}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 w-full mt-4">
          {isLoadingCards ? (
            <>
              <WagesCardSkeleton />
              <WagesCardSkeleton />
              <WagesCardSkeleton />
              <WagesCardSkeleton />
            </>
          ) : (
            <>
              {participationCardsConfig.map(card => (
                <StaticCard
                  key={card.id}
                  classess="border-ws-border-secondary"
                  title={card.title}
                  titleClass="text-ws-text-tertiary text-sm"
                  countIcon={card.countIcon}
                  count={card.count}
                  countClass="text-ws-light-teal-900  text-3xl xl:text-4xl font-medium mt-6"
                />
              ))}
            </>
          )}
        </div>
        <div className="w-full space-y-4 mt-4">
          <div className="grid grid-cols- gap-4 w-full">
            {isLoadingCards ? (
              <>
                <ProgressCardSkeleton />
              </>
            ) : (
              <ProgressCard
                title="Benefits"
                showInfoIcon={false}
                tooltipText="Households spending 30% or more of gross income on housing costs"
                sections={[
                  {
                    columnsCount: 1,
                    items: [
                      {
                        label: "FSA",
                        percentage: parsePercentage(participationSection?.benefits.FSA ?? "0"),
                        progressColor: "bg-ws-navy-300",
                      },
                      {
                        label: "Wellness",
                        percentage: parsePercentage(participationSection?.benefits.wellness ?? "0"),
                        progressColor: "bg-ws-navy-300",
                      },
                      {
                        label: "Employee Assist",
                        percentage: parsePercentage(participationSection?.benefits.EAP ?? "0"),
                        progressColor: "bg-ws-navy-300",
                      },
                    ],
                  },
                ]}
              />
            )}
          </div>
          <div className="grid grid-cols- gap-4 w-full">
            {isLoadingCards ? (
              <>
                <ProgressCardSkeletonOne />
              </>
            ) : (
              <ProgressCard
                title="Retirement"
                showInfoIcon={false}
                tooltipText="Households spending 30% or more of gross income on housing costs"
                sections={[
                  {
                    columnsCount: 1,
                    items: [
                      {
                        label: "401k",
                        percentage: parsePercentage(
                          participationSection?.retirement["401k"] ?? "0"
                        ),
                        progressColor: "bg-ws-light-teal-400",
                      },
                    ],
                  },
                ]}
              />
            )}
          </div>
          <div className="grid grid-cols- gap-4 w-full">
            {isLoadingCards ? (
              <>
                <ProgressCardSkeletonFour />
              </>
            ) : (
              <ProgressCard
                title="Insurance"
                showInfoIcon={false}
                tooltipText="Households spending 30% or more of gross income on housing costs"
                sections={[
                  {
                    columnsCount: 1,
                    items: [
                      {
                        label: "Health",
                        percentage: parsePercentage(participationSection?.insurance.health ?? "0"),
                        progressColor: "bg-ws-light-teal-300",
                      },
                      {
                        label: "Dental",
                        percentage: parsePercentage(participationSection?.insurance.dental ?? "0"),
                        progressColor: "bg-ws-light-teal-300",
                      },
                      {
                        label: "Vision",
                        percentage: parsePercentage(participationSection?.insurance.vision ?? "0"),
                        progressColor: "bg-ws-light-teal-300",
                      },
                      {
                        label: "Life",
                        percentage: parsePercentage(participationSection?.insurance.life ?? "0"),
                        progressColor: "bg-ws-light-teal-300",
                      },
                    ],
                  },
                ]}
              />
            )}
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col bg-ws-light-teal-25 border border-ws-border-primary rounded-xl py-8 px-6 space-y-4">
        <div className="w-full flex items-start justify-between flex-col xl:flex-row">
          <div className="space-y-1">
            <h3 className="text-2xl lg:text-4xl font-medium text-ws-text-primary">Demographics</h3>
            <p className="text-base text-ws-text-primary max-w-2xl mt-4">
              Demographics lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          <div className="flex flex-col items-start w-full lg:w-auto shrink-0 my-3 xl:my-0">
            <Label className="text-sm font-medium text-ws-text-secondary flex mb-1.5 mt-6">
              Department
            </Label>
            <Select
              className="w-full flex items-start min-w-50 md:min-w-full lg:min-w-50"
              isRequired
              size="md"
              placeholder="All"
              items={departmentItems}
              value={selectedDepartment}
              onSelectionChange={key => {
                if (key) {
                  setSelectedDepartment(String(key));
                }
              }}
            >
              {item => <Select.Item id={item.id}>{item.label}</Select.Item>}
            </Select>
          </div>
        </div>
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            {isLoadingCards ? (
              <>
                <OverviewCardSkeleton />
                <OverviewCardSkeleton />
              </>
            ) : (
              <>
                {demographicsCardsConfig.map(card => (
                  <StaticCard
                    key={card.id}
                    title={card.title}
                    titleClass="text-sm font-medium text-ws-text-tertiary"
                    itemAlign="between"
                    count={card.count}
                    countClass={card.getCountClass()}
                    infoIcon={true}
                    infoCircleClass="text-ws-gray-70 size-5"
                    tooltipText={card.tooltipText}
                    descriptionText="Industry specific turnover metrics are calculated from US Census Bureau QWI data sources"
                    placements="top"
                  />
                ))}
              </>
            )}
          </div>
        </div>
        <div className="bg-ws-base-white p-5 border border-ws-border-primary rounded-xl w-full flex flex-col relative">
          <h2 className="text-2xl font-medium text-ws-text-primary">Employment type</h2>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full my-6 space-y-6 xl:space-y-0">
            {isLoadingCards ? (
              <>
                <DonutChartSkeleton />
                <DonutChartSkeleton />
                <DonutChartSkeleton />
              </>
            ) : (
              <>
                {donutChartsConfig.map(chart => (
                  <DonutChart
                    key={chart.id}
                    percentage={chart.percentage}
                    label={chart.label}
                    progressColor={chart.progressColor}
                    backgroundColor={chart.backgroundColor}
                    width={200}
                    strokeWidth={25}
                  />
                ))}
              </>
            )}
          </div>
        </div>
        <div className="bg-ws-base-white p-5 border border-ws-border-primary rounded-xl w-full flex flex-col relative">
          <div className="w-full flex items-start justify-between flex-col xl:flex-row">
            <div className="space-y-1 ">
              <h3 className="text-2xl font-medium text-ws-text-primary">
                Employment Breakdown by Age
              </h3>
            </div>
            <div className="flex flex-col items-start w-full lg:w-auto shrink-0 mt-4 xl:mt-0">
              <Label className="text-sm font-medium text-ws-text-secondary flex mb-1.5">
                Employment type <span className="text-ws-error-600">*</span>
              </Label>
              <Select
                className="w-full flex items-start min-w-xl md:min-w-full lg:min-w-50"
                isRequired
                size="md"
                placeholder="Full Time"
                items={employmentTypeItems}
                value={selectedEmploymentType}
                onSelectionChange={key => {
                  if (key) {
                    setSelectedEmploymentType(key as "fullTime" | "partTime" | "seasonal");
                  }
                }}
              >
                {item => <Select.Item id={item.id}>{item.label}</Select.Item>}
              </Select>
            </div>
          </div>
          <div className="space-y-2 mt-6">
            {isLoadingCards ? (
              <BreakDownCardSkeleton />
            ) : (
              <>
                {ageBreakdownConfig.map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    <div className="min-w-30">{item.label}</div>
                    <ProgressBar
                      value={item.value}
                      max={100}
                      className="h-6 rounded-none"
                      customColor={item.customColor}
                    />
                    <div className="flex min-w-8">{item.value}%</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col bg-ws-light-teal-25 border border-ws-border-primary rounded-xl py-8 px-6">
        <div className="w-full flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl xl:text-4xl font-medium text-ws-text-primary">Compensation</h3>
            <p className="text-base text-ws-text-tertiary">
              Compensation lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>
        <div className="grid xl:grid-cols-3 gap-4 mt-6 flex-col lg:flex-row">
          {isLoadingCards ? (
            <>
              <OverviewCardSkeleton />
              <OverviewCardSkeleton />
              <OverviewCardSkeleton />
            </>
          ) : (
            <>
              {compensationCardsConfig.map(card => (
                <StaticCard
                  key={card.id}
                  title={card.title}
                  titleClass="text-sm font-medium text-ws-text-tertiary"
                  itemAlign="between"
                  count={card.count}
                  countClass={card.getCountClass()}
                  infoIcon={true}
                  infoCircleClass="text-ws-gray-70"
                  tooltipText={card.tooltipText}
                  descriptionText="U.S. Census Bureau, 5-Year American Community Survey"
                  placements="top"
                />
              ))}
            </>
          )}
        </div>

        <div className="w-full border-t border-ws-border-primary mt-8">
          <div className="w-full flex items-start justify-between mt-8 flex-col xl:flex-row">
            <div className="space-y-1 w-full">
              <h3 className="text-2xl font-medium text-ws-text-primary">Workforce Breakdown</h3>
              <p className="max-w-3xl text-base text-ws-text-secondary">
                Here you can find how your workforce is broken down by job types.{" "}
              </p>
            </div>
            <div className="flex flex-col items-start w-full lg:w-auto shrink-0 mt-4 xl:mt-0">
              <Label className="text-ws-text-secondary flex mb-1.5">
                Department <span className="text-ws-error-600">*</span>
              </Label>
              <Select
                className="w-full flex items-start min-w-70 md:min-w-full lg:min-w-50"
                isRequired
                size="md"
                placeholder="All"
                items={departmentItems}
                value={selectedDepartment}
                onSelectionChange={key => {
                  if (key) {
                    setSelectedDepartment(String(key));
                  }
                }}
              >
                {item => <Select.Item id={item.id}>{item.label}</Select.Item>}
              </Select>
              <p className="text-xs text-ws-text-tertiary mt-1">
                This is a hint text to help user.
              </p>
            </div>
          </div>
          {isLoadingCards ? (
            <div className="bg-ws-base-white border border-ws-border-primary rounded-xl w-full mt-4">
              <div className="w-lg flex items-center justify-center flex-col p-15 mx-auto">
                <img src={emptyStateWorkforce} alt="Empty state" className="mb-4" />
                <h2 className="text-2xl/8 font-medium text-ws-text-tertiary mb-1">
                  We’re still collecting data
                </h2>
                <p className="text-base/6 text-ws-text-tertiary">
                  We’re getting things ready for you. Your dashboard will populate once data is
                  collected. Check back soon.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-ws-base-white border border-ws-border-primary rounded-xl w-full mt-4">
              <Table data={users} columns={columns} variant="striped" size="md" />
            </div>
          )}
          <div className="w-full border-t border-ws-border-primary mt-8">
            <div className="w-full flex items-center justify-between mt-8">
              <div className="space-y-1 w-full">
                <h3 className="text-2xl font-medium text-ws-text-primary">Salary Breakdown</h3>
                <p className="max-w-3xl text-base text-ws-text-secondary">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            </div>
          </div>
          <div className="grid xl:grid-cols-2 gap-4 mt-6 flex-col lg:flex-row">
            {isLoadingCards ? (
              <>
                <OverviewCardSkeleton />
                <OverviewCardSkeleton />
              </>
            ) : (
              <>
                {salaryBreakdownCardsConfig.map(card => (
                  <StaticCard
                    key={card.id}
                    title={card.title}
                    titleClass="text-sm font-medium text-ws-text-tertiary mb-14"
                    itemAlign="between"
                    count={card.count}
                    countClass={card.getCountClass()}
                    infoIcon={true}
                    infoCircleClass="text-ws-gray-70"
                    tooltipText={card.tooltipText}
                    descriptionText="U.S. Census Bureau, 5-Year American Community Survey"
                    placements="top"
                  />
                ))}
              </>
            )}
          </div>
          {/* Chart */}
          <div className="bg-ws-base-white border border-ws-border-primary flex-1 w-full overflow-x-auto mt-6 rounded-xl">
            {isLoadingCards ? (
              <BreakDownChartSkeleton />
            ) : (
              <SalaryChart
                data={(compensationSection?.benefitsCost.graph ?? []).map(g => ({
                  label: g.salaryRange,
                  min: g.min,
                  boxStart: g.min,
                  boxEnd: g.max,
                  max: g.max,
                }))}
              />
            )}
          </div>
          {isLoadingCards ? (
            <div className="bg-ws-base-white border border-ws-border-primary rounded-xl w-full mt-4">
              <div className="w-lg flex items-center justify-center flex-col p-15 mx-auto">
                <img src={emptyStateWorkforce} alt="Empty state" className="mb-4" />
                <h2 className="text-2xl/8 font-medium text-ws-text-tertiary mb-1">
                  We’re still collecting data
                </h2>
                <p className="text-base/6 text-ws-text-tertiary">
                  We’re getting things ready for you. Your dashboard will populate once data is
                  collected. Check back soon.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-ws-base-white border border-ws-border-primary rounded-xl w-full mt-4">
              <Table data={salary} columns={columnsOne} variant="striped" size="md" />
            </div>
          )}
        </div>
      </div>
      <div className="w-full">
        <p className="text-ws-text-secondary text-sm mb-4">
          All data metrics provided through Finch are based on the most current information
          accessible at the time of reporting, as of September 2025.
        </p>
        <p className="text-xs/5 text-ws-text-primary">
          This product provides informational insights and recommendations based on the data you
          share and industry benchmarks. It does not provide legal, financial, tax, or benefits
          advice, and recommendations are not guarantees of outcomes or results. Actual results may
          vary, and you are responsible for evaluating and implementing any recommendations based on
          your organization’s specific circumstances. Read our{" "}
          <Link to="/terms-page" className="text-ws-light-teal-850 underline">
            Terms & Conditions{" "}
          </Link>
          and{" "}
          <Link to="/privacy-policy" className="text-ws-light-teal-850 underline">
            Privacy Policy
          </Link>
        </p>
      </div>
      {/* Get In Touch Modal */}
      <GetInTouchModal
        isOpen={isGetInTouchModalOpen}
        onClose={() => setIsGetInTouchModalOpen(false)}
      />
    </div>
  );
}

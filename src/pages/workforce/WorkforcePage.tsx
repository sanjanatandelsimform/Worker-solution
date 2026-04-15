import { useState } from "react";
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
import { GlobeIcon } from "@/assets/icons/Globe";
import { EnrolledIcon } from "@/assets/icons/EnrolledIcon";
import { SavingIcon } from "@/assets/icons/SavingIcon";
import { HeartLineIcon } from "@/assets/icons/HeartLineIcon";
import type { TableColumn } from "@/components/base/table";
import { Link } from "react-router-dom";
import {
  parsePercentage,
  AGE_COLORS,
  WORKFORCE_COLUMNS_ALL,
  WORKFORCE_COLUMNS_BY_DEPT,
  getWorkforceRowsByDept,
  SALARY_COST_COLUMNS,
} from "@/pages/workforce/workforceUtils";
import WorkforceOverview from "@/pages/workforce/WorkforceOverview";
import WorkforceParticipation from "@/pages/workforce/WorkforceParticipation";
import WorkforceDemographics from "@/pages/workforce/WorkforceDemographics";
import WorkforceCompensation from "@/pages/workforce/WorkforceCompensation";

export default function WorkforcePage() {
  const [isGetInTouchModalOpen, setIsGetInTouchModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedWorkforceDept, setSelectedWorkforceDept] = useState<string>("all");
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<
    "fullTime" | "partTime" | "seasonal"
  >("fullTime");

  // Redux state
  const isLoadingCards = useAppSelector(selectWorkforceLoading);
  const workforceError = useAppSelector(selectWorkforceError);
  const workforceSection = useAppSelector(selectWorkforceSection);
  const participationSection = useAppSelector(selectParticipationSection);
  const demographicsSection = useAppSelector(selectDemographicsSection);
  const compensationSection = useAppSelector(selectCompensationSection);

  // -- Overview config ----------------------------------------------------------
  const overviewCardsConfig = [
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

  const employeeCardsConfig: typeof overviewCardsConfig = [];

  // -- Participation config -----------------------------------------------------
  const participationCardsConfig = [
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
      title: "Enrolled in Retirement",
      count: participationSection?.retirementEnrollment ?? "--",
      countIcon: <SavingIcon className="size-5 text-ws-gray-300" />,
    },
    {
      id: "enrolled-healthcare",
      title: "Enrolled in Healthcare",
      count: participationSection?.healthcareEnrollment ?? "--",
      countIcon: <HeartLineIcon className="size-5 text-ws-gray-300" />,
    },
  ];

  const benefitsItems = [
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
  ];

  const retirementItems = [
    {
      label: "401k",
      percentage: parsePercentage(participationSection?.retirement["401k"] ?? "0"),
      progressColor: "bg-ws-light-teal-400",
    },
  ];

  const insuranceItems = [
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
  ];

  // -- Demographics config ------------------------------------------------------
  const departmentItems =
    demographicsSection?.employementType.map(entry => ({
      id: entry.department,
      label:
        entry.department === "all"
          ? "All"
          : entry.department.charAt(0).toUpperCase() + entry.department.slice(1),
    })) ?? [];

  const demographicsCardsConfig = [
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

  const selectedDeptData =
    demographicsSection?.employementType.find(e => e.department === selectedDepartment) ??
    demographicsSection?.employementType[0];

  const donutChartsConfig = selectedDeptData
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

  const ageBreakdownConfig = (demographicsSection?.employmentBreakdownByAge ?? []).map(
    (entry, i) => ({
      id: `age-${i}`,
      label: `Age: ${entry.ageGroup}`,
      value: entry[selectedEmploymentType],
      customColor: `${AGE_COLORS[i % AGE_COLORS.length]} rounded-none`,
    })
  );

  // -- Compensation config ------------------------------------------------------
  const workforceDepartmentItems = [
    { id: "all", label: "All" },
    ...(compensationSection?.workforceBreakdown.departments ?? []).map(d => ({
      id: d.id,
      label: d.label,
    })),
  ];

  const columns: TableColumn[] =
    selectedWorkforceDept === "all" ? WORKFORCE_COLUMNS_ALL : WORKFORCE_COLUMNS_BY_DEPT;

  const users: Record<string, string>[] =
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
        );

  const columnsOne: TableColumn[] = SALARY_COST_COLUMNS;

  const salary = (compensationSection?.benefitsCost.table ?? []).map(row => ({
    salaryRange: row.salaryRange,
    avgEmployeeCostPerPaycheck: `${row.avgEmployeeCostPerPaycheck} (${row.avgEmployeeCostPercentage}%)`,
    employerCostPerPaycheck:
      row.employerCostPerPaycheck !== null && row.employerCostPerPaycheck !== undefined
        ? String(row.employerCostPerPaycheck)
        : "$xx.xx",
  }));

  const compensationCardsConfig = [
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

  const salaryBreakdownCardsConfig = [
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

  const salaryChartData = (compensationSection?.benefitsCost.graph ?? []).map(g => ({
    label: g.salaryRange,
    min: g.min,
    boxStart: g.min,
    boxEnd: g.max,
    max: g.max,
  }));

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

      <WorkforceOverview
        isLoading={isLoadingCards}
        overviewCardsConfig={overviewCardsConfig}
        employeeCardsConfig={employeeCardsConfig}
      />

      <WorkforceParticipation
        isLoading={isLoadingCards}
        participationCardsConfig={participationCardsConfig}
        benefitsItems={benefitsItems}
        retirementItems={retirementItems}
        insuranceItems={insuranceItems}
      />

      <WorkforceDemographics
        isLoading={isLoadingCards}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        selectedEmploymentType={selectedEmploymentType}
        setSelectedEmploymentType={setSelectedEmploymentType}
        demographicsCardsConfig={demographicsCardsConfig}
        donutChartsConfig={donutChartsConfig}
        ageBreakdownConfig={ageBreakdownConfig}
        departmentItems={departmentItems}
      />

      <WorkforceCompensation
        isLoading={isLoadingCards}
        selectedWorkforceDept={selectedWorkforceDept}
        setSelectedWorkforceDept={setSelectedWorkforceDept}
        compensationCardsConfig={compensationCardsConfig}
        salaryBreakdownCardsConfig={salaryBreakdownCardsConfig}
        workforceDepartmentItems={workforceDepartmentItems}
        columns={columns}
        users={users}
        columnsOne={columnsOne}
        salary={salary}
        salaryChartData={salaryChartData}
      />

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
          your organization's specific circumstances. Read our{" "}
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

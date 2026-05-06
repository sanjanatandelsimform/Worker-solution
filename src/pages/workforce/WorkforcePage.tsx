import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectWorkforceLoading, selectWorkforceError } from "@/store/selectors/workforceSelectors";
import ErrorMessage from "@/components/common/ErrorMessage";
import WorkforceOverview from "@/pages/workforce/WorkforceOverview";
import WorkforceParticipation from "@/pages/workforce/WorkforceParticipation";
import WorkforceDemographics from "@/pages/workforce/WorkforceDemographics";
import WorkforceCompensation from "@/pages/workforce/WorkforceCompensation";
import { useWorkforceOverviewConfig } from "@/hooks/useWorkforceOverviewConfig";
import { useWorkforceParticipationConfig } from "@/hooks/useWorkforceParticipationConfig";
import { useWorkforceDemographicsConfig } from "@/hooks/useWorkforceDemographicsConfig";
import { useWorkforceCompensationConfig } from "@/hooks/useWorkforceCompensationConfig";
import PreparingDashboard from "@/pages/recommendations/PreparingDashboard";
import DidYouKnowBanner from "@/components/common/DidYouKnowBanner";
import didHeroImg from "@/assets/employees-reported.jpg";
import {
  PREPARING_MSG_AUTOMATED,
  PREPARING_MSG_NON_AUTOMATED,
} from "@/constants/preparingDashboardMessages";

export default function WorkforcePage({
  isReady = true,
  isStale = false,
  isAutomatedProvider = false,
}: {
  readonly isReady?: boolean;
  readonly isStale?: boolean;
  readonly isAutomatedProvider?: boolean;
} = {}) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedWorkforceDept, setSelectedWorkforceDept] = useState<string>("all");
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<
    "fullTime" | "partTime" | "seasonal"
  >("fullTime");

  // Redux state
  const isLoadingRedux = useAppSelector(selectWorkforceLoading);
  const isLoadingCards = !isReady || isLoadingRedux;
  const workforceError = useAppSelector(selectWorkforceError);

  // -- Overview config ----------------------------------------------------------
  const { overviewCardsConfig, employeeCardsConfig } = useWorkforceOverviewConfig();

  // -- Participation config -----------------------------------------------------
  const { participationCardsConfig, benefitsItems, retirementItems, insuranceItems } =
    useWorkforceParticipationConfig();

  // -- Demographics config ----------------------------------------------------------
  const { departmentItems, demographicsCardsConfig, donutChartsConfig, ageBreakdownConfig } =
    useWorkforceDemographicsConfig(selectedDepartment, selectedEmploymentType);

  // -- Compensation config ----------------------------------------------------------
  const {
    workforceDepartmentItems,
    columns,
    users,
    columnsOne,
    salary,
    compensationCardsConfig,
    salaryBreakdownCardsConfig,
    salaryChartData,
  } = useWorkforceCompensationConfig(selectedWorkforceDept);

  if (isStale) {
    const description = isAutomatedProvider ? PREPARING_MSG_AUTOMATED : PREPARING_MSG_NON_AUTOMATED;
    return (
      <div className="bg-ws-base-white py-10 px-6 space-y-6 shadow-xl rounded-b-xl">
        <PreparingDashboard description={description} />
        <DidYouKnowBanner
          imageSrc={didHeroImg}
          imageAlt="Workforce hero"
          stat="78%"
          text="of employees reported they're more likely to stay with an employer because of their benefits program."
          note="Source: Gallup"
        />
      </div>
    );
  }

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
    </div>
  );
}

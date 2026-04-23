import { useState } from "react";
import { GetInTouchModal } from "@/components/modals/GetInTouchModal";
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
import Declarations from "@/components/common/Declarations";

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

      {/* <div className="w-full">
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
      </div> */}
      <Declarations className="mt-4" />

      {/* Get In Touch Modal */}
      <GetInTouchModal
        isOpen={isGetInTouchModalOpen}
        onClose={() => setIsGetInTouchModalOpen(false)}
      />
    </div>
  );
}

// import { Badge } from "@/components/base/badges/badges";
import CarouselSection from "./Carousel";
import { useAppSelector } from "@/store/hooks";
import {
  selectWorkforceSection,
  selectCompensationSection,
  selectParticipationSection,
  selectWorkforceLoading,
} from "@/store/selectors/workforceSelectors";
import {
  selectRecommStrategicRecommendations,
  selectProvenStrategiesFlags,
  selectRecommendationsLoading,
  selectRecommCompanyOverview,
} from "@/store/selectors/recommendationsSelectors";
import { selectWorkforceHealthcareAffordabilityFlag } from "@/store/selectors/workforceSelectors";
import { useAssessmentStatus } from "@/hooks/useAssessmentStatus";
import CompanyAtAGlance from "./CompanyAtAGlance";
import CoreBenefitsEnhancement from "./CoreBenefitsEnhancement";
import StrategicSolutions from "./StrategicSolutions";
import { useIndustry } from "@/hooks/useIndustry";
import PreparingDashboard from "./PreparingDashboard";
import {
  PREPARING_MSG_AUTOMATED,
  PREPARING_MSG_NON_AUTOMATED,
} from "@/constants/preparingDashboardMessages";

export default function RecommendationsFinchPage({
  onNavigateToWorkforce,
  isReady = true,
  isStale = false,
  isAutomatedProvider = false,
}: {
  readonly onNavigateToWorkforce?: () => void;
  readonly isReady?: boolean;
  readonly isStale?: boolean;
  readonly isAutomatedProvider?: boolean;
}) {
  const { isFinchAssessmentIncomplete, isConnected } = useAssessmentStatus();

  // Workforce slice — Company Overview & Benefits Overview
  const workforceSection = useAppSelector(selectWorkforceSection);
  const compensationSection = useAppSelector(selectCompensationSection);
  const participationSection = useAppSelector(selectParticipationSection);
  const workforceIsLoading = useAppSelector(selectWorkforceLoading);

  // Recommendations slice — Proven Strategies & Strategic Solutions
  const strategicRecommendations = useAppSelector(selectRecommStrategicRecommendations);
  const recommProvenFlags = useAppSelector(selectProvenStrategiesFlags);
  const recommendationsIsLoading = useAppSelector(selectRecommendationsLoading);
  const workforceHealthcareFlag = useAppSelector(selectWorkforceHealthcareAffordabilityFlag);
  const recommCompanyOverview = useAppSelector(selectRecommCompanyOverview);
  const { isLoading: isIndustryLoading, data: industryData } = useIndustry();
  const industryAverageWage = industryData?.industryOverview?.industryAverageWage;

  // Compose proven strategy flags based on assessment flow
  // Finch flow: healthcareAffordability comes from Workforce API; manual flow: all from Recommendations API
  const provenStrategyFlags = {
    autoEnroll: recommProvenFlags.autoEnroll,
    nonElectiveMatch: recommProvenFlags.nonElectiveMatch,
    healthcareAffordability: isConnected
      ? workforceHealthcareFlag
      : recommProvenFlags.healthcareAffordability,
  };

  // Synthetic Company Overview shape — source depends on connection state:
  // Finch-connected: workforce API (workforceSection + compensationSection)
  // Non-connected:   recommendations API (recommendation.companyOverview)
  const companyGlanceData = {
    totalWorkforce: isConnected
      ? (workforceSection?.totalWorkforce ?? null)
      : (recommCompanyOverview?.totalWorkforce ?? null),
    averageHourlyWage: isConnected
      ? (compensationSection?.salaryBreakdown?.avgHourlyRate ?? null)
      : (recommCompanyOverview?.avgHourlyRate ?? null),
    averageSalary: isConnected
      ? (compensationSection?.salaryBreakdown?.avgSalary ?? null)
      : (recommCompanyOverview?.avgSalary ?? null),
    industryAverageWage: industryAverageWage ?? null,
  };

  // Synthetic Benefits Overview shape (maps participation fields to card counts)
  const benefitsGlanceData: Record<string, string | null> = {
    "eligible-employees":
      participationSection === null ? null : String(participationSection.totalWorkforce),
    "enrolled-employees":
      participationSection === null ? null : String(participationSection.enrolledBenefits),
    "enrolled-in-retirement": participationSection?.retirementEnrollment ?? null,
    "enrolled-in-healthcare": participationSection?.healthcareEnrollment ?? null,
  };

  // Proven Strategies computed values
  const flagValues = Object.values(provenStrategyFlags);
  const provenStrategiesCount = flagValues.filter(f => f === "green").length;
  const visibleFlagsTotal = flagValues.filter(f => f !== "hidden").length;
  const provenStrategiesPercent =
    visibleFlagsTotal > 0 ? Math.round((provenStrategiesCount / visibleFlagsTotal) * 100) : 0;

  // Combined loading guard
  const isLoading = !isReady || workforceIsLoading || recommendationsIsLoading || isIndustryLoading;

  if (isStale) {
    const description = isAutomatedProvider ? PREPARING_MSG_AUTOMATED : PREPARING_MSG_NON_AUTOMATED;
    return (
      <div className="bg-ws-base-white space-y-6 py-10 px-6 shadow-xl rounded-b-xl">
        <PreparingDashboard description={description} />
        <CarouselSection />
      </div>
    );
  }

  return (
    <div className="bg-ws-base-white space-y-6 py-10 px-6 shadow-xl rounded-b-xl">
      <CompanyAtAGlance
        isLoading={isLoading}
        companyGlanceData={companyGlanceData}
        benefitsGlanceData={benefitsGlanceData}
        onNavigateToWorkforce={onNavigateToWorkforce}
      />

      {/* Carousel Section */}
      <CarouselSection />

      {!isFinchAssessmentIncomplete && (
        <CoreBenefitsEnhancement
          isLoading={isLoading}
          provenStrategiesCount={provenStrategiesCount}
          provenStrategiesPercent={provenStrategiesPercent}
          provenStrategyFlags={provenStrategyFlags}
          visibleFlagsTotal={visibleFlagsTotal}
        />
      )}

      {!isFinchAssessmentIncomplete && (
        <StrategicSolutions
          isLoading={isLoading}
          strategicRecommendations={strategicRecommendations}
        />
      )}
    </div>
  );
}

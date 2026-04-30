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
} from "@/store/selectors/recommendationsSelectors";
import { useAssessmentStatus } from "@/hooks/useAssessmentStatus";
import CompanyAtAGlance from "./CompanyAtAGlance";
import CoreBenefitsEnhancement from "./CoreBenefitsEnhancement";
import StrategicSolutions from "./StrategicSolutions";
import { useIndustry } from "@/hooks/useIndustry";

export default function RecommendationsFinchPage({
  onNavigateToWorkforce,
}: {
  readonly onNavigateToWorkforce?: () => void;
}) {
  const { isFinchAssessmentIncomplete } = useAssessmentStatus();

  // Workforce slice — Company Overview & Benefits Overview
  const workforceSection = useAppSelector(selectWorkforceSection);
  const compensationSection = useAppSelector(selectCompensationSection);
  const participationSection = useAppSelector(selectParticipationSection);
  const workforceIsLoading = useAppSelector(selectWorkforceLoading);
  

  // Recommendations slice — Proven Strategies & Strategic Solutions
  const strategicRecommendations = useAppSelector(selectRecommStrategicRecommendations);
  const provenStrategyFlags = useAppSelector(selectProvenStrategiesFlags);
  const recommendationsIsLoading = useAppSelector(selectRecommendationsLoading);
  const { isLoading: isIndustryLoading, data: industryData } = useIndustry();
  const industryAverageWage = industryData?.industryOverview?.industryAverageWage;

  // Synthetic Company Overview shape (maps workforce fields to existing format fn expectations)
  const companyGlanceData = {
    totalWorkforce: workforceSection?.totalWorkforce ?? null,
    averageHourlyWage: compensationSection?.salaryBreakdown?.avgHourlyRate ?? null,
    averageSalary: compensationSection?.salaryBreakdown?.avgSalary ?? null,
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
  const provenStrategiesCount = [
    provenStrategyFlags.nonElectiveMatch,
    provenStrategyFlags.autoEnroll,
    provenStrategyFlags.healthcareAffordability,
  ].filter(Boolean).length;
  const provenStrategiesPercent = Math.round((provenStrategiesCount / 3) * 100);

  // Combined loading guard
  const isLoading = workforceIsLoading || recommendationsIsLoading || isIndustryLoading;

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

import type { ComponentType } from "react";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import ProvenStrategiesCard from "./ProvenStrategiesCard";
import { LikeIcon } from "@/assets/icons/likeIcon";
import { UserGroupIcon } from "@/assets/icons/UserGroupIcon";
import {
  ProvenStrategiesSkeleton,
  ProvenStrategiesCardsSkeleton,
} from "./RecommendationsSkeletons";

interface ProvenCardConfig {
  id: string;
  title: string;
  titleIcon: ComponentType<{ className?: string }>;
  descriptionText?: string;
}

const provenStrategiesCardsConfig: ProvenCardConfig[] = [
  {
    id: "nonElectiveMatch",
    title: "Non-elective match",
    titleIcon: LikeIcon,
    descriptionText:
      "Employer contributions are often skewed due to high earners's contribution capacity. Separate the employee contribution from employer contribution.",
  },
  {
    id: "autoEnroll",
    title: "Auto Enrollment",
    titleIcon: LikeIcon,
    descriptionText:
      "80% of employees automatically enrolled in a 3% 401K match stay within the retirement plan.",
  },
  {
    id: "healthcareAffordability",
    title: "Healthcare affordability",
    titleIcon: UserGroupIcon,
    descriptionText:
      "Consider adjusting employee premiums to income level. QSEHRA and ICHRA plans can offer more flexibility and savings for employers and employees.",
  },
];

interface ProvenStrategyFlags {
  nonElectiveMatch: boolean;
  autoEnroll: boolean;
  healthcareAffordability: boolean;
}

interface CoreBenefitsEnhancementProps {
  readonly isLoading: boolean;
  readonly provenStrategiesCount: number;
  readonly provenStrategiesPercent: number;
  readonly provenStrategyFlags: ProvenStrategyFlags;
}

export default function CoreBenefitsEnhancement({
  isLoading,
  provenStrategiesCount,
  provenStrategiesPercent,
  provenStrategyFlags,
}: CoreBenefitsEnhancementProps) {
  return (
    <div className="bg-ws-light-teal-25 py-8 px-6 border border-ws-border-primary rounded-2xl">
      <div className="flex items-stretch gap-6 flex-col xl:flex-row">
        <div className="w-full flex flex-col">
          <h2 className="text-2xl lg:text-4xl font-medium text-ws-text-primary mb-3">
            Core Benefits Enhancement
          </h2>
          <p className="text-base text-ws-text-primary mb-3">
            Your comprehensive plan to enhance worker financial health and retirement.
          </p>
          <p className="text-base text-ws-text-primary mb-3"></p>
          <p className="text-base text-ws-text-primary mb-3">
            Here are some impactful ways to start uplifting your workforce with proven strategies.
            Consider strengthening core benefits by modifying policies to increase access and
            participation with these options:
          </p>
          <h4 className="text-2xl font-medium text-ws-text-primary my-6">Proven strategies</h4>
          <div className="bg-ws-navy-25 border border-ws-border-primary rounded-lg p-3.5">
            <h4 className="text-lg font-medium text-ws-text-primary">
              Strategies Impemented: {provenStrategiesCount}/3
            </h4>
            <p className="my-4 text-base text-ws-text-primary">
              You have already implemented {provenStrategiesCount} of 3 proven strategies! Keep
              going to see lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua.{" "}
            </p>
            {isLoading ? (
              <ProvenStrategiesSkeleton />
            ) : (
              <ProgressBar
                value={provenStrategiesPercent}
                labelPosition="none"
                className="mt-4 h-6 rounded-none"
                progressClassName="bg-ws-light-teal-600 rounded-none"
              />
            )}
          </div>
          <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
            {isLoading ? (
              <>
                <ProvenStrategiesCardsSkeleton />
                <ProvenStrategiesCardsSkeleton />
                <ProvenStrategiesCardsSkeleton />
              </>
            ) : (
              <>
                {provenStrategiesCardsConfig.map(card => (
                  <ProvenStrategiesCard
                    key={card.id}
                    title={card.title}
                    titleIcon={<card.titleIcon />}
                    descriptionText={card.descriptionText}
                    className={
                      provenStrategyFlags[card.id as keyof typeof provenStrategyFlags]
                        ? "bg-ws-success-25"
                        : "bg-ws-warning-50"
                    }
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

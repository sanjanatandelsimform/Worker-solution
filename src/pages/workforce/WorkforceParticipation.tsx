import StaticCard from "@/pages/recommendations/StaticCard";
import ProgressCard from "@/pages/benchmark/ProgressCard";
import type { ProgressItem } from "@/pages/benchmark/ProgressCard";
import {
  WagesCardSkeleton,
  ProgressCardSkeleton,
  ProgressCardSkeletonOne,
  ProgressCardSkeletonFour,
} from "@/pages/workforce/WorkforceSkeletons";

import type { ReactNode } from "react";

interface ParticipationCardConfig {
  id: string;
  title: string;
  count: string;
  countIcon: ReactNode;
}

interface WorkforceParticipationProps {
  readonly isLoading: boolean;
  readonly participationCardsConfig: ParticipationCardConfig[];
  readonly benefitsItems: ProgressItem[];
  readonly retirementItems: ProgressItem[];
  readonly insuranceItems: ProgressItem[];
}

/** Renders the Participation Breakdown section including enrollment counts and benefit participation rates. */
export default function WorkforceParticipation({
  isLoading,
  participationCardsConfig,
  benefitsItems,
  retirementItems,
  insuranceItems,
}: WorkforceParticipationProps) {
  return (
    <div className="w-full flex flex-col items-center bg-ws-light-teal-25 border border-ws-border-primary rounded-xl py-8 px-6">
      <div className="w-full flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl lg:text-4xl font-medium text-ws-text-primary">
            Participation Breakdown
          </h3>
          <p className="text-base text-ws-text-primary w-full mt-2">
            Your highest participation rate is health insurance. 89% of your employees are using
            this benefit. Your lowest participation rate is Employee Assist Program.{" "}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 w-full mt-4">
        {isLoading ? (
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
          {isLoading ? (
            <ProgressCardSkeleton />
          ) : (
            <ProgressCard
              title="Benefits"
              showInfoIcon={false}
              tooltipText="Households spending 30% or more of gross income on housing costs"
              sections={[{ columnsCount: 1, items: benefitsItems }]}
            />
          )}
        </div>
        <div className="grid grid-cols- gap-4 w-full">
          {isLoading ? (
            <ProgressCardSkeletonOne />
          ) : (
            <ProgressCard
              title="Retirement"
              showInfoIcon={false}
              tooltipText="Households spending 30% or more of gross income on housing costs"
              sections={[{ columnsCount: 1, items: retirementItems }]}
            />
          )}
        </div>
        <div className="grid grid-cols- gap-4 w-full">
          {isLoading ? (
            <ProgressCardSkeletonFour />
          ) : (
            <ProgressCard
              title="Insurance"
              showInfoIcon={false}
              tooltipText="Households spending 30% or more of gross income on housing costs"
              sections={[{ columnsCount: 1, items: insuranceItems }]}
            />
          )}
        </div>
      </div>
    </div>
  );
}

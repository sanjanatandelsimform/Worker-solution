import StaticCard from "@/pages/recommendations/StaticCard";
import { OverviewCardSkeleton } from "@/pages/workforce/WorkforceSkeletons";
import DidYouKnowBanner from "@/components/common/DidYouKnowBanner";
import didHeroImg from "@/assets/employees-reported.jpg";

interface OverviewCardConfig {
  id: string;
  title: string;
  count: string;
  tooltipText?: string;
  getDescriptionText?: () => string;
  getCountClass: () => string;
}

interface WorkforceOverviewProps {
  readonly isLoading: boolean;
  readonly overviewCardsConfig: OverviewCardConfig[];
  readonly employeeCardsConfig: OverviewCardConfig[];
}

/** Renders the Workforce Information overview stat cards and "Did you know?" banner. */
export default function WorkforceOverview({
  isLoading,
  overviewCardsConfig,
  employeeCardsConfig,
}: Readonly<WorkforceOverviewProps>) {
  return (
    <>
      {/* ── Industry Overview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 w-full">
        {isLoading ? (
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
                classess="border-ws-border-secondary flex flex-col justify-between"
                title={card.title}
                titleClass="text-sm font-medium text-ws-text-tertiary"
                itemAlign="between"
                count={card.count}
                countClass={card.getCountClass()}
                infoIcon={!!(card.tooltipText || card.getDescriptionText?.())}
                infoCircleClass="text-ws-gray-400 size-5"
                tooltipText={card.tooltipText}
                descriptionText={card.getDescriptionText?.()}
                placements="top"
                countWrap="text-3xl font-semibold text-ws-text-primary"
                staticCountClass="flex items-center justify-between mt-6"
              />
            ))}
          </>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {isLoading ? (
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
                infoIcon={!!(card.tooltipText || card.getDescriptionText?.())}
                infoCircleClass="text-ws-gray-400 size-5"
                tooltipText={card.tooltipText}
                descriptionText={card.getDescriptionText?.()}
                placements="top"
              />
            ))}
          </>
        )}
      </div>

      <DidYouKnowBanner
        imageSrc={didHeroImg}
        imageAlt="Workforce hero"
        stat="78%"
        text="of employees reported they're more likely to stay with an employer because of their benefits program."
      />
    </>
  );
}

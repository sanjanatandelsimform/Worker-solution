import StaticCard from "@/pages/recommendations/StaticCard";
import { OverviewCardSkeleton } from "@/pages/workforce/WorkforceSkeletons";
import didHeroImg from "@/assets/employees-reported.jpg";

interface OverviewCardConfig {
  id: string;
  title: string;
  count: string;
  tooltipText: string;
  getDescriptionText: () => string;
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full">
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
                classess="flex flex-col justify-between"
                title={card.title}
                titleClass="text-sm font-medium text-ws-text-tertiary"
                itemAlign="between"
                count={card.count}
                countClass={card.getCountClass()}
                infoIcon={false}
                infoCircleClass="text-ws-gray-400 size-5"
                tooltipText={card.tooltipText}
                descriptionText={card.getDescriptionText()}
                placements="top"
                countWrap="text-3xl font-semibold text-ws-text-primary"
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
              <span className="font-semibold">78%</span> of employees reported they're more likely
              to stay with an employer because of their benefits program.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

import CarouselSection from "./Carousel";
import StaticCard from "./StaticCard";
import didHeroImg from "@/assets/did-hero.jpg";
import BenefitCard from "./BenefitCard";
import { CircleCheckIcon } from "@/assets/icons/CircleCheckIcon";
import { useAppSelector } from "@/store/hooks";
import {
  selectCompanyAtGlance,
  selectStrategicRecommendations,
} from "@/store/selectors/dashboardSelectors";
import { formatNumber, formatCurrency, formatCurrencyWithCents } from "@/utils/formatters";
import { GlobeIcon } from "@/assets/icons/Globe";
import { ClockIcon } from "@/assets/icons/ClockIcon";
import { BriefcaseIcon } from "@/assets/icons/BriefcaseIcon";
import { DollarIcon } from "@/assets/icons/DollarIcon";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import ProvenStrategiesCard from "./ProvenStrategiesCard";
import { LikeIcon } from "@/assets/icons/likeIcon";
import { UserGroupIcon } from "@/assets/icons/UserGroupIcon";
import { useEffect, useState } from "react";

const OverviewCardSkeleton = () => (
  <div className="border border-ws-border-secondary rounded-lg p-4 bg-ws-base-white animate-pulse shadow-sm">
    <div className="h-4 bg-ws-gray-200 rounded w-3/4 mb-3"></div>
    <div className="flex items-end justify-between">
      <div className="h-12 bg-ws-gray-200 rounded w-3/4"></div>
      <div className="w-8 h-8 bg-ws-gray-200 rounded-full"></div>
    </div>
  </div>
);

const ProvenStrategiesSkeleton = () => (
  <div className="border border-ws-border-secondary rounded-lg p-4 bg-ws-base-white animate-pulse shadow-sm">
    <div className="h-4 bg-ws-gray-200 rounded w-1/2 mb-4"></div>
    <div className="h-10 bg-ws-gray-200 rounded w-full mb-3"></div>
    <div className="h-6 bg-ws-gray-200 rounded w-full"></div>
  </div>
);

const ProvenStrategiesCardsSkeleton = () => (
  <div className="border border-ws-border-secondary rounded-lg p-4 bg-ws-base-white animate-pulse shadow-sm">
    <div className="flex items-center justify-between">
      <div className="h-6 bg-ws-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-6 w-6 bg-ws-gray-200 rounded-full mb-4"></div>
    </div>

    <div className="h-4 bg-ws-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-ws-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-ws-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-ws-gray-200 rounded w-full mb-2"></div>
  </div>
);

const StrategicSolutionsCardsSkeleton = () => (
  <div className="border border-ws-border-secondary rounded-lg p-4 bg-ws-base-white animate-pulse shadow-sm">
    <div className="h-6 bg-ws-gray-200 rounded w-1/3 mb-6"></div>
    <div className="h-6 bg-ws-gray-200 rounded w-full mb-4"></div>
    <div className="h-4 bg-ws-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-ws-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-ws-gray-200 rounded w-full mb-5"></div>
    <div className="h-6 bg-ws-gray-200 rounded w-1/2 mb-4"></div>
    <div className="flex items-center justify-between">
      <div className="h-2 w-2 bg-ws-gray-200 rounded-full mr-2 mb-2"></div>
      <div className="h-4 bg-ws-gray-200 rounded w-full mb-2"></div>
    </div>
    <div className="flex items-center justify-between">
      <div className="h-2 w-2 bg-ws-gray-200 rounded-full mr-2 mb-2"></div>
      <div className="h-4 bg-ws-gray-200 rounded w-full mb-2"></div>
    </div>
  </div>
);
interface CardConfig {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  format: (data: unknown) => string;
  infoIcon?: boolean;
  tooltipText?: string;
  descriptionText?: string;
  placements?: "top" | "bottom" | "left" | "right";
}
interface ProvenCardConfig {
  id: string;
  title: string;
  titleIcon: React.ComponentType<{ className?: string }>;
  descriptionText?: string;
}

const overviewCardsConfig: CardConfig[] = [
  {
    id: "total-workforce",
    title: "Total Workforce",
    icon: GlobeIcon,
    format: (data: unknown) => {
      const typedData = data as Record<string, unknown>;
      const workforce = typedData?.totalWorkforce;
      if (typeof workforce === "number") {
        return formatNumber(workforce);
      }
      if (typeof workforce === "string") {
        return workforce;
      }
      return "N/A";
    },
  },
  {
    id: "average-hourly-wage",
    title: "Average Hourly Wage",
    icon: ClockIcon,
    format: (data: unknown) => {
      const typedData = data as Record<string, unknown>;
      const wage = typedData?.averageHourlyWage;
      if (typeof wage === "number") {
        return formatCurrencyWithCents(wage);
      }
      if (typeof wage === "string") {
        return wage;
      }
      return "N/A";
    },
  },
  {
    id: "average-salary",
    title: "Average Salary",
    icon: BriefcaseIcon,
    format: () => String("$72k"),
  },
  {
    id: "industry-avg-wage",
    title: "National Industry Average Wage",
    icon: DollarIcon,
    format: (data: unknown) => {
      const typedData = data as Record<string, unknown>;
      return typedData?.industryAverageWage
        ? formatCurrency(Number(typedData.industryAverageWage))
        : "N/A";
    },
    infoIcon: true,
    tooltipText: "How is this calculated",
    descriptionText: "This is calculated based on LMI.",
    placements: "top",
  },
];

const provenStrategiesCardsConfig: ProvenCardConfig[] = [
  {
    id: "non-elective-match",
    title: "Non-elective match",
    titleIcon: LikeIcon,
    descriptionText:
      "Employer contributions are often skewed due to high earners’s contribution capacity. Separate the employee contribution from employer contribution.",
  },
  {
    id: "auto-enrollment",
    title: "Auto Enrollment",
    titleIcon: LikeIcon,
    descriptionText:
      "80% of employees automatically enrolled in a 3% 401K match stay within the retirement plan.",
  },
  {
    id: "healthcare-affordability",
    title: "Healthcare affordability",
    titleIcon: UserGroupIcon,
    descriptionText:
      "Consider adjusting employee premiums to income level. QSERA and ICRA plans can offer more flexibility and savings for employers and employees.",
  },
];

export default function RecommendationsPage() {
  const companyAtGlance = useAppSelector(selectCompanyAtGlance);
  const strategicRecommendations = useAppSelector(selectStrategicRecommendations);
  const [isLoadingCards, setIsLoadingCards] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingCards(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="bg-ws-base-white py-10 px-6 space-y-6 shadow-xl rounded-b-xl">
      <h2 className="text-2xl lg:text-4xl font-medium text-ws-text-primary leading-10">
        Your Company at a Glance
      </h2>
      <h4 className="text-2xl font-medium text-ws-text-primary">Company Overview</h4>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 w-full">
        {isLoadingCards ? (
          <>
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
          </>
        ) : (
          <>
            {overviewCardsConfig.map(card => {
              const Icon = card.icon;
              return (
                <StaticCard
                  key={card.id}
                  classess="border-ws-border-secondary"
                  title={card.title}
                  titleClass="text-ws-text-tertiary text-sm"
                  countIcon={<Icon className="size-5 text-ws-gray-500" />}
                  count={String(card.format(companyAtGlance))}
                  countClass="text-ws-light-teal-900 text-3xl xl:text-4xl font-medium mt-6"
                  infoIcon={card.infoIcon}
                  infoCircleClass={card.infoIcon ? "text-ws-text-secondary0 size-4" : undefined}
                  tooltipText={card.tooltipText}
                  descriptionText={card.descriptionText}
                  placements={card.placements}
                />
              );
            })}
          </>
        )}
      </div>

      {/* Carousel Section */}
      <CarouselSection />

      <div className="bg-ws-light-teal-25 py-8 px-6 border border-ws-border-primary rounded-2xl">
        <div className="flex items-stretch gap-6 flex-col xl:flex-row">
          <div className="w-full flex flex-col">
            <h2 className="text-2xl lg:text-4xl font-medium text-ws-text-primary mb-3">
              Core Benefits Enhancement
            </h2>
            <p className="text-base text-ws-text-primary mb-3">
              Here are some impactful ways to start uplifting your workforce with proven strategies.
              Consider strengthening core benefits by modifying policies to increase access and
              participation with these options:
            </p>
            <h4 className="text-2xl font-medium text-ws-text-primary my-6">Proven strategies</h4>
            <div className="bg-ws-navy-25 border border-ws-border-primary rounded-lg p-3.5">
              <h4 className="text-lg font-medium text-ws-text-primary">
                Strategies Implemented: 2/3
              </h4>
              <p className="my-4 text-base text-ws-text-primary">
                You have already implemented 2 of 3 proven strategies! Keep going to see lorem ipsum
                dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                labore et dolore magna aliqua.{" "}
              </p>
              {isLoadingCards ? (
                <ProvenStrategiesSkeleton />
              ) : (
                <ProgressBar
                  value={66}
                  labelPosition="none"
                  className="mt-4 h-6 rounded-none"
                  progressClassName="bg-ws-light-teal-600 rounded-none"
                />
              )}
            </div>
            <div className="mt-6 grid xl:grid-cols-3 gap-6 w-full">
              {isLoadingCards ? (
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
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-ws-light-teal-25 py-8 px-6 border border-ws-border-primary rounded-2xl">
        <div className="flex mt-2 gap-6 flex-col xl:flex-row">
          <div className="w-full">
            <h1 className="text-2xl lg:text-4xl text-ws-text-primary font-medium">
              Strategic Solutions
            </h1>
            <p className="text-base mt-4 text-ws-text-primary">
              Here are some top benefit solutions that address your company goals and employee needs
              based on the information provided.
            </p>
          </div>
        </div>
        <div className="mt-6">
          {strategicRecommendations.length > 0 ? (
            <div className="grid xl:grid-cols-3 gap-5 w-full mt-6">
              {isLoadingCards ? (
                <>
                  <StrategicSolutionsCardsSkeleton />
                  <StrategicSolutionsCardsSkeleton />
                  <StrategicSolutionsCardsSkeleton />
                </>
              ) : (
                <>
                  {strategicRecommendations.map(recommendation => (
                    <BenefitCard
                      key={recommendation.order}
                      badgeText={recommendation.category}
                      badgeClassess="bg-ws-light-teal-25 text-xs font-normal ring-1 ring-ws-light-teal-800 px-2 py-1 text-ws-light-teal-900"
                      title={recommendation.title}
                      descriptionText={recommendation.description}
                      listTitle="Key Benefits"
                      listIcon={<CircleCheckIcon />}
                      listTexts={
                        Array.isArray(recommendation.keyFeatures)
                          ? recommendation.keyFeatures
                          : [recommendation.keyFeatures]
                      }
                    />
                  ))}
                </>
              )}
            </div>
          ) : (
            <div className="mt-6 p-6 bg-ws-light-teal-25 rounded-lg text-center">
              <p className="text-ws-gray-300">No recommendations available at this time.</p>
            </div>
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
                The cost of replacing an individual employee can range from one-half to two times
                the employee's annual salary.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

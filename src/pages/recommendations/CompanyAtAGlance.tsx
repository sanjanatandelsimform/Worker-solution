import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import StaticCard from "./StaticCard";
import { OverviewCardSkeleton } from "./RecommendationsSkeletons";
import { GlobeIcon } from "@/assets/icons/Globe";
import { ClockIcon } from "@/assets/icons/ClockIcon";
import { BriefcaseIcon } from "@/assets/icons/BriefcaseIcon";
import { DollarIcon } from "@/assets/icons/DollarIcon";
import { UserIcon } from "@/assets/icons/UserIcon";
import { EnrolledIcon } from "@/assets/icons/EnrolledIcon";
import { SavingIcon } from "@/assets/icons/SavingIcon";
import { HeartLineIcon } from "@/assets/icons/HeartLineIcon";
import { formatNumber, formatCurrency, formatCurrencyWithCents } from "@/utils/formatters";

interface CardConfig {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  format: (data: unknown) => string;
  infoIcon?: boolean;
  count?: string;
  tooltipText?: string;
  descriptionText?: string;
  placements?: "top" | "bottom" | "left" | "right";
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

const overviewCardsConfigR2: CardConfig[] = [
  {
    id: "enrolled-employees",
    title: "Enrolled Employees",
    icon: EnrolledIcon,
    format: (data: unknown) => {
      const typedData = data as Record<string, unknown>;
      return typedData?.industryAverageWage
        ? formatCurrency(Number(typedData.industryAverageWage))
        : "N/A";
    },
    infoIcon: true,
    count: "2,254",
    tooltipText: "How is this calculated",
    descriptionText: "This is calculated based on LMI.",
    placements: "top",
  },
  {
    id: "enrolled-in-retirement",
    title: "Enrolled in Retirement",
    icon: SavingIcon,
    format: (data: unknown) => {
      const typedData = data as Record<string, unknown>;
      return typedData?.industryAverageWage
        ? formatCurrency(Number(typedData.industryAverageWage))
        : "N/A";
    },
    infoIcon: true,
    count: "64%",
    tooltipText: "How is this calculated",
    descriptionText: "This is calculated based on LMI.",
    placements: "top",
  },
  {
    id: "enrolled-in-healthcare",
    title: "Enrolled in Healthcare",
    icon: HeartLineIcon,
    format: (data: unknown) => {
      const typedData = data as Record<string, unknown>;
      return typedData?.industryAverageWage
        ? formatCurrency(Number(typedData.industryAverageWage))
        : "N/A";
    },
    infoIcon: true,
    count: "92%",
    tooltipText: "How is this calculated",
    descriptionText: "This is calculated based on LMI.",
    placements: "top",
  },
];

interface CompanyGlanceData {
  totalWorkforce: number | null;
  averageHourlyWage: number | null;
  averageSalary: number | null;
  industryAverageWage: null;
}

interface CompanyAtAGlanceProps {
  readonly isLoading: boolean;
  readonly companyGlanceData: CompanyGlanceData;
  readonly benefitsGlanceData: Record<string, string | null>;
}

export default function CompanyAtAGlance({
  isLoading,
  companyGlanceData,
  benefitsGlanceData,
}: CompanyAtAGlanceProps) {
  return (
    <div className="space-y-6 mb-6">
      <h2 className="text-2xl lg:text-4xl font-medium text-ws-text-primary leading-10">
        Your Company at a Glance
      </h2>
      <h4 className="text-2xl font-medium text-ws-text-primary">Company Overview</h4>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 w-full">
        {isLoading ? (
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
                  count={String(card.format(companyGlanceData))}
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
      <h4 className="text-2xl font-medium text-ws-text-primary">Benefits Overview</h4>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-8 w-full">
        {isLoading ? (
          <>
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
          </>
        ) : (
          <>
            {overviewCardsConfigR2.map(card => {
              const Icon = card.icon;
              return (
                <StaticCard
                  key={card.id}
                  classess="border-ws-border-secondary"
                  title={card.title}
                  titleClass="text-ws-text-tertiary text-sm"
                  countIcon={<Icon className="size-5 text-ws-gray-500" />}
                  count={benefitsGlanceData[card.id] ?? card.count}
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
      <p className="text-base text-ws-text-primary inline-block">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore.{" "}
        <Link to="#" className="text-base underline text-ws-light-teal-850 font-bold">
          Learn more about your workforce
        </Link>
      </p>
    </div>
  );
}

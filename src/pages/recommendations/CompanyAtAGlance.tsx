import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import StaticCard from "./StaticCard";
import { OverviewCardSkeleton } from "./RecommendationsSkeletons";
import { GlobeIcon } from "@/assets/icons/Globe";
import { ClockIcon } from "@/assets/icons/ClockIcon";
import { BriefcaseIcon } from "@/assets/icons/BriefcaseIcon";
import { DollarIcon } from "@/assets/icons/DollarIcon";
import { EnrolledIcon } from "@/assets/icons/EnrolledIcon";
import { SavingIcon } from "@/assets/icons/SavingIcon";
import { HeartLineIcon } from "@/assets/icons/HeartLineIcon";
import {
  formatNumber,
  formatCurrency,
  formatCurrencyWithCents,
  formatCompactCurrency,
} from "@/utils/formatters";
import { useAssessmentStatus } from "@/hooks/useAssessmentStatus";
import { ArrowRight } from "@untitledui/icons";

interface CompanyGlanceData {
  totalWorkforce: number | null;
  averageHourlyWage: number | null;
  averageSalary: number | null;
  industryAverageWage: number | null;
}

interface CardConfig<TData> {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  format: (data: TData) => string;
  infoIcon?: boolean;
  count?: string;
  tooltipText?: string;
  descriptionText?: string;
  placements?: "top" | "bottom" | "left" | "right";
}

const overviewCardsConfig: CardConfig<CompanyGlanceData>[] = [
  {
    id: "total-workforce",
    title: "Total Workforce",
    icon: GlobeIcon,
    format: data => {
      const workforce = data.totalWorkforce;
      if (typeof workforce === "number") {
        return formatNumber(workforce);
      }
      return "N/A";
    },
  },
  {
    id: "average-hourly-wage",
    title: "Average Hourly Wages",
    icon: ClockIcon,
    format: data => {
      const wage = data.averageHourlyWage;
      if (typeof wage === "number") {
        return formatCurrencyWithCents(wage);
      }
      return "N/A";
    },
  },
  {
    id: "average-salary",
    title: "Average Annual Salary",
    icon: BriefcaseIcon,
    format: data => {
      const salary = data.averageSalary;
      if (typeof salary === "number") {
        return formatCompactCurrency(salary);
      }
      return "N/A";
    },
  },
  {
    id: "industry-avg-wage",
    title: "National Industry Median Wage",
    icon: DollarIcon,
    format: data =>
      data.industryAverageWage === null ? "N/A" : formatCurrency(Number(data.industryAverageWage)),
    infoIcon: false,
    tooltipText: "",
    descriptionText: "",
    placements: "top",
  },
];

const overviewCardsConfigR2: CardConfig<Record<string, string | null>>[] = [
  {
    id: "enrolled-employees",
    title: "Enrolled Employees",
    icon: EnrolledIcon,
    format: data =>
      data.industryAverageWage == null ? "N/A" : formatCurrency(Number(data.industryAverageWage)),
    infoIcon: false,
    count: "2,254",
    tooltipText: "How is this calculated",
    descriptionText: "This is calculated based on LMI.",
    placements: "top",
  },
  {
    id: "enrolled-in-retirement",
    title: "Enrolled in Retirement",
    icon: SavingIcon,
    format: data =>
      data.industryAverageWage == null ? "N/A" : formatCurrency(Number(data.industryAverageWage)),
    infoIcon: false,
    count: "64%",
    tooltipText: "How is this calculated",
    descriptionText: "This is calculated based on LMI.",
    placements: "top",
  },
  {
    id: "enrolled-in-healthcare",
    title: "Enrolled in Healthcare",
    icon: HeartLineIcon,
    format: data =>
      data.industryAverageWage == null ? "N/A" : formatCurrency(Number(data.industryAverageWage)),
    infoIcon: false,
    count: "92%",
    tooltipText: "How is this calculated",
    descriptionText: "This is calculated based on LMI.",
    placements: "top",
  },
];

interface CompanyAtAGlanceProps {
  readonly isLoading: boolean;
  readonly companyGlanceData: CompanyGlanceData;
  readonly benefitsGlanceData: Record<string, string | null>;
  readonly onNavigateToWorkforce?: () => void;
}

export default function CompanyAtAGlance({
  isLoading,
  companyGlanceData,
  benefitsGlanceData,
  onNavigateToWorkforce,
}: CompanyAtAGlanceProps) {
  const { isConnected } = useAssessmentStatus();

  return (
    <div className="space-y-6 mb-6">
      <h2 className="text-2xl lg:text-4xl font-medium text-ws-text-primary leading-10">
        Your Company At A Glance
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
                  classess="border-ws-border-secondary flex flex-col justify-between"
                  title={card.title}
                  titleClass="text-ws-text-tertiary text-sm font-normal"
                  countIcon={<Icon className="size-5 text-ws-gray-500" />}
                  count={String(card.format(companyGlanceData))}
                  countClass="text-ws-light-teal-900 text-3xl font-medium mt-6"
                  infoIcon={card.infoIcon}
                  infoCircleClass={card.infoIcon ? "text-ws-text-secondary size-4" : undefined}
                  tooltipText={card.tooltipText}
                  descriptionText={card.descriptionText}
                  placements={card.placements}
                  staticCountClass="flex items-center justify-between"
                />
              );
            })}
          </>
        )}
      </div>

      {isConnected && (
        <>
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

          <p className="text-base text-ws-text-primary flex items-center gap-1 mt-4">
            Your workforce data is connected via Finch.{" "}
            <Link
              to="#"
              className="text-base underline text-ws-light-teal-850 font-bold"
              onClick={e => {
                e.preventDefault();
                onNavigateToWorkforce?.();
              }}
            >
              <span className="flex items-center gap-1">
                Explore salaries, benefits, and more in the Workforce tab
                <ArrowRight className="size-5" />
              </span>
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

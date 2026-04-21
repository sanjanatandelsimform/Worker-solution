"use client";
import { useState } from "react";
import StaticCard from "../recommendations/StaticCard";
import { Select } from "@/components/base/select/select";
import { IncomeDistributionChart } from "./CostBurdenBarChart";
import { GetInTouchModal } from "@/components/modals/GetInTouchModal";
import { useAppSelector } from "@/store/hooks";
import {
  selectIndustryOverviewData,
  selectIndustryData,
  selectIndustryHousingData,
  selectIndustryAreaMedianWage,
  selectIndustryTurnOverRate,
  selectIndustrySeparationRate
} from "@/store/selectors/industrySelectors";
import { useIndustry } from "@/hooks/useIndustry";
import { formatCurrency, formatCurrencyWithCents, formatPercentage } from "@/utils/formatters";
import { Label } from "@/components/base/input/label";
import { GlobeIcon } from "@/assets/icons/Globe";
import { DollarIcon } from "@/assets/icons/DollarIcon";
import { CurrencyStackIcon } from "@/assets/icons/CurrencyStackIcon";
import TurnoverRateCard from "./TurnoverRateCard";
import SalaryHourlyComparisonChart from "./SalaryHourlyCharts/SalaryHourlyChartsView/SalaryHourlyComparisonChart";
import ProgressCard from "./ProgressCard";
// import { SalaryCard } from "./SalaryCard";

// ── Skeleton Components ──

const OverviewCardSkeleton = () => (
  <div className="border border-ws-border-secondary rounded-lg p-4 bg-ws-base-white animate-pulse shadow-sm">
    <div className="h-4 bg-ws-gray-200 rounded w-3/4 mb-3"></div>
    <div className="h-8 bg-ws-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-ws-gray-200 rounded w-full"></div>
  </div>
);

const TurnoverRateCardSkeleton = () => (
  <div className="border border-ws-border-secondary rounded-lg p-4 bg-ws-base-white animate-pulse shadow-sm">
    <div className="flex items-center justify-between">
      <div className="h-4 bg-ws-gray-200 rounded w-1/2 mb-6"></div>
      <div className="h-3 bg-ws-gray-200 w-15 mb-6"></div>
    </div>
    <div className="h-4 bg-ws-gray-200 rounded w-1/2 mb-2"></div>
    <div className="flex gap-4">
      <div className="border border-ws-border-secondary rounded-lg p-4 bg-ws-base-white animate-pulse shadow-sm w-full">
        <div className="h-3 bg-ws-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-6 bg-ws-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-2 bg-ws-gray-200 rounded w-full"></div>
      </div>
      <div className="border border-ws-border-secondary rounded-lg p-4 bg-ws-base-white animate-pulse shadow-sm w-full">
        <div className="h-3 bg-ws-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-6 bg-ws-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-2 bg-ws-gray-200 rounded w-full"></div>
      </div>
    </div>
    <div className="h-4 bg-ws-gray-200 rounded w-1/2 mb-2 mt-5"></div>
    <div className="flex gap-4">
      <div className="border border-ws-border-secondary rounded-lg p-4 bg-ws-base-white animate-pulse shadow-sm w-full">
        <div className="h-3 bg-ws-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-6 bg-ws-gray-200 rounded w-1/2 mb-2"></div>
      </div>
      <div className="border border-ws-border-secondary rounded-lg p-4 bg-ws-base-white animate-pulse shadow-sm w-full">
        <div className="h-3 bg-ws-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-6 bg-ws-gray-200 rounded w-1/2 mb-2"></div>
      </div>
    </div>
  </div>
);

const SalaryHourlySkeleton = () => (
  <div className="border border-ws-border-secondary rounded-lg p-5 bg-ws-base-white animate-pulse shadow-sm">
    <div className="h-8 bg-ws-gray-200 rounded w-1/3 my-4"></div>
    <div className="flex w-full gap-4">
      <div className="w-full h-80 flex items-center justify-center flex-col gap-4">
        <div className="flex w-15 h-4 bg-ws-gray-200 mb-4"></div>
        <div className="flex items-end justify-center gap-4">
          <div className="w-10 h-30 bg-ws-gray-200"></div>
          <div className="w-10 h-50 bg-ws-gray-200"></div>
        </div>
      </div>
      <div className="w-full h-80 flex items-center justify-center flex-col gap-4">
        <div className="flex w-15 h-4 bg-ws-gray-200 mb-4"></div>
        <div className="flex items-end justify-center gap-4">
          <div className="w-10 h-30 bg-ws-gray-200"></div>
          <div className="w-10 h-50 bg-ws-gray-200"></div>
        </div>
      </div>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 mt-6">
        <div className="h-4 bg-ws-gray-200 w-30"></div>
        <div className="h-4 bg-ws-gray-200 w-30"></div>
      </div>
      <div className="h-3 bg-ws-gray-200 w-15"></div>
    </div>
  </div>
);

const WagesCardSkeleton = () => (
  <div className="border border-ws-border-secondary rounded-lg p-4 bg-ws-base-white animate-pulse shadow-sm">
    <div className="h-4 bg-ws-gray-200 rounded w-3/4 mb-3"></div>
    <div className="flex items-end justify-between">
      <div className="h-12 bg-ws-gray-200 rounded w-3/4"></div>
      <div className="w-8 h-8 bg-ws-gray-200 rounded-full"></div>
    </div>
  </div>
);

const ProgressCardSkeleton = () => (
  <div className="border border-ws-border-secondary rounded-lg p-4 bg-ws-base-white animate-pulse shadow-sm">
    <div className="flex w-full gap-4">
      <div className="w-full">
        <div className="w-1/3 h-6 bg-ws-gray-200 mb-4 rounded"></div>
        <div className="flex items-center justify-between gap-4">
          <div className="w-1/3 h-2 bg-ws-gray-200 rounded"></div>
          <div className="w-2/3 h-8 bg-ws-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

const CostBurdenChartSkeleton = () => (
  <div className="border border-ws-border-secondary rounded-lg p-5 bg-ws-base-white animate-pulse shadow-sm">
    <div className="flex items-end w-full gap-4">
      <div className="w-full h-80 flex items-center justify-end flex-col gap-4">
        <div className="flex items-end justify-center gap-4">
          <div className="w-15 h-40 bg-ws-gray-200"></div>
        </div>
        <div className="h-2 w-30 bg-ws-gray-200 rounded"></div>
        <div className="h-2 w-30 bg-ws-gray-200 rounded"></div>
      </div>
      <div className="w-full h-80 flex items-center justify-end flex-col gap-4">
        <div className="flex items-end justify-center gap-4">
          <div className="w-15 h-25 bg-ws-gray-200"></div>
        </div>
        <div className="h-2 w-30 bg-ws-gray-200 rounded"></div>
        <div className="h-2 w-30 bg-ws-gray-200 rounded"></div>
      </div>
      <div className="w-full h-80 flex items-center justify-end flex-col gap-4">
        <div className="flex items-end justify-center gap-4">
          <div className="w-15 h-15 bg-ws-gray-200"></div>
        </div>
        <div className="h-2 w-30 bg-ws-gray-200 rounded"></div>
        <div className="h-2 w-30 bg-ws-gray-200 rounded"></div>
      </div>
      <div className="w-full h-80 flex items-center justify-end flex-col gap-4">
        <div className="flex items-end justify-center gap-4">
          <div className="w-15 h-10 bg-ws-gray-200"></div>
        </div>
        <div className="h-2 w-30 bg-ws-gray-200 rounded"></div>
        <div className="h-2 w-30 bg-ws-gray-200 rounded"></div>
      </div>
    </div>
    <div className="flex items-center justify-center gap-4 mt-8">
      <div className="h-4 bg-ws-gray-200 w-30"></div>
      <div className="h-4 bg-ws-gray-200 w-30"></div>
    </div>
  </div>
);

// ── Config interfaces ──

interface BenchmarkCardConfig {
  id: string;
  title: (industryOverview: unknown) => string;
  count: (industryOverview: unknown) => string;
  tooltipText: string;
  descriptionText: (industryOverview: unknown) => string;
  countClass: (industryOverview: unknown) => string;
}

const benchmarkCardsConfig: BenchmarkCardConfig[] = [
  {
    id: "turnover-rate",
    title: (data: unknown) => {
      const d = data as Record<string, unknown> | null;
      const tr = d?.turnoverRate as Record<string, unknown> | null;
      return !tr?.month || !tr?.year
        ? "Turnover Rate"
        : `Turnover Rate since ${tr.month} ${tr.year}`;
    },
    count: (data: unknown) => {
      const d = data as Record<string, unknown> | null;
      const tr = d?.turnoverRate as Record<string, unknown> | null;
      const value = tr?.rate;
      return typeof value === "number" ? formatCurrency(value) : (value as string) || "No data";
    },
    tooltipText: "Turnover Rate",
    descriptionText: () =>
      "Industry specific turnover metrics are calculated from US Census Bureau QWI data sources",
    countClass: (data: unknown) => {
      const d = data as Record<string, unknown> | null;
      const tr = d?.turnoverRate as Record<string, unknown> | null;
      return tr?.rate == null
        ? "mt-2 text-sm font-medium text-ws-text-primary"
        : "mt-2 text-3xl font-semibold text-ws-text-primary";
    },
  },
  {
    id: "avg-turnover",
    title: () => "Industry-wide Cost of Turnover",
    count: (data: unknown) => {
      const d = data as Record<string, unknown> | null;
      const icot = d?.avgCostOfTurnover as Record<string, unknown> | null;
      const value = icot?.formatted;
      return typeof value === "number" ? formatPercentage(value) : (value as string) || "No data";
    },
    tooltipText: "Average Turnover",
    descriptionText: () =>
      "Average turnover metrics are calculated from US Census Bureau QWI data sources",
    countClass: (data: unknown) => {
      const d = data as Record<string, unknown> | null;
      const icot = d?.avgCostOfTurnover as Record<string, unknown> | null;
      return icot?.formatted == null
        ? "mt-2 text-sm font-medium text-ws-text-primary"
        : "mt-2 text-3xl font-semibold text-ws-text-primary";
    },
  },
  {
    id: "avg-cost-turnover",
    title: () => "Average Cost of Turnover",
    count: (data: unknown) => {
      const d = data as Record<string, unknown> | null;
      const at = d?.avgTurnover as Record<string, unknown> | null;
      const value = at?.rate;
      return typeof value === "number"
        ? `${formatCurrency(value)}%`
        : value !== undefined
          ? `${value}%`
          : "No data";
    },
    tooltipText: "Average Cost of Turnover",
    descriptionText: (data: unknown) => {
      const d = data as Record<string, unknown> | null;
      const at = d?.avgTurnover as Record<string, unknown> | null;
      return `Industry specific cost of turnover is calculated from ${at?.year || " "}`;
    },
    countClass: (data: unknown) => {
      const d = data as Record<string, unknown> | null;
      const at = d?.avgTurnover as Record<string, unknown> | null;
      return at?.rate == null
        ? "mt-2 text-sm font-medium text-ws-text-primary"
        : "mt-2 text-3xl font-semibold text-ws-text-primary";
    },
  },
];

interface TurnoverCardConfig {
  id: string;
  title: string;
  titleQatar: string;
  sections: Array<{
    sectionTitle: string;
    columnsCount: 1 | 2 | 3 | 4;
    cardsData: Array<{
      title: string;
      statics: string;
      progressValue: number;
      customBarColor: string;
    }>;
  }>;
}

interface SalaryCardConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  count: string;
}

interface ProgressCardConfig {
  id: string;
  title: string;
  showInfoIcon: boolean;
  tooltipText: string;
  progressLabel: string;
  percentage: number;
  progressColor: string;
}

interface CostBurdenCardConfig {
  id: string;
  title: string;
  count: string;
  tooltipText: string;
  descriptionText: string;
  countClass: string;
}

export default function BenchmarkPage() {
  const [isGetInTouchModalOpen, setIsGetInTouchModalOpen] = useState(false);
  const [selectedGraphType, setSelectedGraphType] = useState<"owners" | "renters">("renters");
  const [selectedWageZip, setSelectedWageZip] = useState<string | null>(null);
  const [selectedHousingZipState, setSelectedHousingZipState] = useState<string | null>(null);

  // Use industry hook for conditional API fetch and loading state
  const { isLoading: isLoadingCards, error: industryError } = useIndustry();

  // Get industry data from Redux store
  const industryOverview = useAppSelector(selectIndustryOverviewData);
  const industry = useAppSelector(selectIndustryData);
  const housingCostData = useAppSelector(selectIndustryHousingData);
  const areaMedianWage = useAppSelector(selectIndustryAreaMedianWage);
  const industryTurnOverRate = useAppSelector(selectIndustryTurnOverRate);
  const industrySeparationRate = useAppSelector(selectIndustrySeparationRate);

  // ── Turnover cards (dynamic from new industryTurnover structure) ──
  const turnoverCardsConfig = (
    turnover: typeof industryTurnOverRate,
    rateOfSeparation: typeof industrySeparationRate,
  ): TurnoverCardConfig[] => [
    {
      id: "turnover-rate",
      title: "Industry Turnover Rate",
      titleQatar: `${turnover?.quarter ?? ""} ${turnover?.year ?? ""}`,
      sections: [
        {
          sectionTitle: "INDUSTRY AVERAGE",
          columnsCount: 2 as const,
          cardsData: [
            {
              title: "Involuntary",
              statics: turnover?.involuntary ? formatPercentage(
                turnover?.involuntary
              ): "No data",
              progressValue:
              turnover?.involuntary ?? 0,
              customBarColor: "bg-ws-light-teal-400",
            },
            {
              title: "Voluntary",
              statics: turnover?.voluntary ? formatPercentage(
                turnover?.voluntary
              ): "No data",
              progressValue:
                turnover?.voluntary ?? 0,
              customBarColor: "bg-ws-navy-600",
            },
          ],
        },
      ],
    },
    {
      id: "separation-rate",
      title: "Industry Separation Rate",
      titleQatar: `${rateOfSeparation?.quarter ?? ""} ${rateOfSeparation?.year ?? ""}`,
      sections: [
        {
          sectionTitle: "INDUSTRY AVERAGE",
          columnsCount: 2 as const,
          cardsData: [
            {
              title: "Separation",
              statics: rateOfSeparation?.separationRate ? formatPercentage(
                rateOfSeparation.separationRate
              ): "No data",
              progressValue:
                rateOfSeparation?.separationRate ?? 0,
              customBarColor: "bg-ws-light-teal-400",
            },
            {
              title: "Hiring Rate",
              statics: rateOfSeparation?.hiringRate ? formatPercentage(
                rateOfSeparation.hiringRate
              ): "No data",
              progressValue:
                rateOfSeparation?.hiringRate ?? 0,
              customBarColor: "bg-ws-navy-600",
            },
          ],
        },
      ],
    },
  ];

  // ── Area Median Wage: zip items and selection (new flat array) ──
  const wageZipItems = (areaMedianWage ?? []).map((w: { state: string; zipcode: string }) => ({
    // label: `${w.state} (${w.zipcode})`,
    label: `${w.zipcode}`,
    id: w.zipcode,
  }));

  const activeWageZip = selectedWageZip ?? areaMedianWage?.[0]?.zipcode ?? null;

  const selectedWageState =
    areaMedianWage?.find((w: { zipcode: string }) => w.zipcode === activeWageZip) ??
    areaMedianWage?.[0] ??
    null;

  // Salary and Hourly comparison data (new graph structure)
  const salaryData = {
    industryAverage: selectedWageState?.graph?.stateAverage?.salary ?? 0,
    nationalAverage: selectedWageState?.graph?.nationalAverage?.salary ?? 0,
  };
  const hourlyData = {
    industryAverage: selectedWageState?.graph?.stateAverage?.hourly ?? 0,
    nationalAverage: selectedWageState?.graph?.nationalAverage?.hourly ?? 0,
  };

  // Dynamic salary cards
  const dynamicSalaryCardsConfig: SalaryCardConfig[] = [
    {
      id: "median-living-wage",
      title: selectedWageState
        ? `${selectedWageState.state} Median Living Wage`
        : "Median Living Wage",
      icon: <DollarIcon className="size-5 text-ws-gray-500" />,
      count: selectedWageState ? formatCurrencyWithCents(selectedWageState.medianLivingWage) : "--",
    },
    {
      id: "average-salary",
      title: selectedWageState
        ? `${selectedWageState.state} Average Salary, ${selectedWageState.year ?? ""}`
        : "Average Salary",
      icon: <CurrencyStackIcon className="size-5 text-ws-gray-500" />,
      count: selectedWageState?.graph?.stateAverage?.salary
        ? formatCurrency(selectedWageState.graph.stateAverage.salary)
        : "--",
    },
    {
      id: "national-average",
      title: "National Average Salary",
      icon: <GlobeIcon className="size-5 text-ws-gray-500" />,
      count: selectedWageState?.nationalAverage
        ? formatCurrency(selectedWageState.nationalAverage)
        : "--",
    },
  ];

  // ── Housing Cost: zip items, selection, and derived data (new structure) ──
  const housingZipItems = (housingCostData ?? []).map((h: { zipcode: string }) => ({
    label: h.zipcode,
    id: h.zipcode,
  }));

  const activeHousingZip = selectedHousingZipState ?? housingCostData?.[0]?.zipcode ?? null;

  const selectedHousingData =
    housingCostData?.find((h: { zipcode: string }) => h.zipcode === activeHousingZip) ??
    housingCostData?.[0] ??
    null;

  // Get latest year's burden data
  const latestOwnersBurden = selectedHousingData?.housingCostBurdenedOwners?.[0] ?? null;
  const latestRentersBurden = selectedHousingData?.housingCostBurdenedRenters?.[0] ?? null;

  // Dynamic owners progress cards
  const dynamicHousingBurdenOwnersConfig: ProgressCardConfig[] = [
    {
      id: "burdened-owners",
      title: "Burdened Owners",
      showInfoIcon: true,
      tooltipText:
        "Spend 30% or more of its gross income on rent and utilities.",
      progressLabel: "Metro Area",
      percentage: latestOwnersBurden?.burdened ?? 0,
      progressColor: "bg-ws-navy-600",
    },
    {
      id: "severely-burdened-owners",
      title: "Severely Burdened Owners",
      showInfoIcon: true,
      tooltipText:
        "Spend 50% or more of its gross income on rent and utilities.",
      progressLabel: "Metro Area",
      percentage: latestOwnersBurden?.severelyBurdened ?? 0,
      progressColor: "bg-ws-navy-600",
    },
  ];

  // Dynamic renters progress cards
  const dynamicHousingBurdenRentersConfig: ProgressCardConfig[] = [
    {
      id: "burdened-renters",
      title: "Burdened Renters",
      showInfoIcon: true,
      tooltipText:
        "Spend 30% or more of its gross income on rent and utilities",
      progressLabel: "Metro Area",
      percentage: latestRentersBurden?.burdened ?? 0,
      progressColor: "bg-ws-light-teal-600",
    },
    {
      id: "severely-burdened-renters",
      title: "Severely Burdened Renters",
      showInfoIcon: true,
      tooltipText:
        "Spend 50% or more of its gross income on rent and utilities.",
      progressLabel: "Metro Area",
      percentage: latestRentersBurden?.severelyBurdened ?? 0,
      progressColor: "bg-ws-light-teal-600",
    },
  ];

  // Dynamic cost burden cards (working class data)
  const wcb = selectedHousingData?.workingClassHousingCostBurden;
  const dynamicCostBurdenCardsConfig: CostBurdenCardConfig[] = [
    {
      id: "home-ownership-rate",
      title: "Home Ownership Rate",
      count: wcb?.homeOwnershipRate != null ? `${wcb.homeOwnershipRate}%` : "No data available",
      tooltipText: "Home Ownership Rate",
      descriptionText: "U.S. Census Bureau, 5-Year American Community Survey",
      countClass: "mt-2 text-3xl font-semibold text-ws-text-primary",
    },
    {
      id: "median-home-value",
      title: "Median Home Value",
      count:
        wcb?.medianHomeValue != null
          ? formatCurrency(Number(wcb.medianHomeValue))
          : "No data available",
      tooltipText: "Median Home Value",
      descriptionText: "U.S. Census Bureau, 5-Year American Community Survey",
      countClass: "mt-2 text-3xl font-semibold text-ws-text-primary",
    },
    {
      id: "median-rent",
      title: "Median Rent",
      count: wcb?.medianRent != null ? formatCurrency(Number(wcb.medianRent)) : "No data available",
      tooltipText: "Median Rent",
      descriptionText: "U.S. Census Bureau, 5-Year American Community Survey",
      countClass: "mt-2 text-3xl font-semibold text-ws-text-primary",
    },
  ];

  // Transform working class graph data for IncomeDistributionChart
  const workingClassHousingGraph = (() => {
    try {
      const graphData = selectedHousingData?.workingClassHousingGraph;
      if (!graphData) return [];

      const tenureType = selectedGraphType === "owners" ? graphData.owners : graphData.renters;
      if (!tenureType) return [];

      const incomeLabels: Array<{
        key: keyof typeof tenureType;
        category: string;
        label: string;
        range: string;
      }> = [
        { key: "lowIncome", category: "lowIncome", label: "Low income", range: "$55,250 or less" },
        {
          key: "moderateIncome",
          category: "moderateIncome",
          label: "Moderate income",
          range: "$55,250 - $88,400",
        },
        {
          key: "medianIncome",
          category: "medianIncome",
          label: "Median income",
          range: "$88,400 - $132,600",
        },
        {
          key: "upperIncome",
          category: "upperIncome",
          label: "Upper income",
          range: "$132,600 or more",
        },
      ];

      return incomeLabels.map(({ key, category, label, range }) => {
        const levelData = tenureType[key] as {
          burdened: number;
          severelyBurdened: number;
        };
        return {
          incomeCategory: category,
          label,
          range: range,
          burdened: typeof levelData?.burdened === "number" ? levelData.burdened : 0,
          severelyBurdened:
            typeof levelData?.severelyBurdened === "number" ? levelData.severelyBurdened : 0,
        };
      });
    } catch {
      return [];
    }
  })();

  {/* This is require if client want to add year */}
  // const ownersPeriodLabel = latestOwnersBurden?.year
  //   ? `${latestOwnersBurden.year}`
  //   : "";
  // const rentersPeriodLabel = latestRentersBurden?.year
  //   ? `${latestRentersBurden.year}`
  //   : "";

  return (
    <div className="bg-ws-base-white py-10 px-6 space-y-6 shadow-xl rounded-b-xl">
      <div className="w-full flex items-center justify-between">
        <h2 className="text-2xl lg:text-4xl font-medium text-ws-text-primary leading-10">
          {`Current Trends for ${industry?.name ?? ""}`}
        </h2>
      </div>

      {/* ── Industry Error ── */}
      {industryError && (
        <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{industryError}</p>
        </div>
      )}

      {/* ── Industry Overview ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
        {isLoadingCards ? (
          <>
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
          </>
        ) : (
          <>
            {benchmarkCardsConfig.map(card => (
              <StaticCard
                key={card.id}
                title={card.title(industryOverview)}
                titleClass="text-sm font-medium text-ws-text-tertiary"
                itemAlign="between"
                count={card.count(industryOverview)}
                countClass={card.countClass(industryOverview)}
                infoIcon={false}
                infoCircleClass="text-ws-gray-400 size-4"
                tooltipText={""}
                descriptionText={card.descriptionText(industryOverview)}
                placements="top"
              />
            ))}
          </>
        )}
      </div>

      {/* ── Industry Turnover ── */}
      <div className="w-full flex flex-col items-center bg-ws-light-teal-25 border border-ws-border-primary rounded-xl py-8 px-6">
        <div className="w-full flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl lg:text-4xl font-medium text-ws-text-primary">
              Industry Turnover
            </h3>
            <p className="text-base text-ws-text-primary w-full xl:w-3/4 mt-2">
              Industry-level turnover and separation trends to help you measure retention risk.
            </p>
          </div>
        </div>
        <div className="w-full flex mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            {isLoadingCards ? (
              <>
                <TurnoverRateCardSkeleton />
                <TurnoverRateCardSkeleton />
              </>
            ) : (
              <>
                {turnoverCardsConfig(industryTurnOverRate, industrySeparationRate).map(card => (
                  <TurnoverRateCard
                    key={card.id}
                    title={card.title}
                    titleQatar={card.titleQatar}
                    sections={card.sections}
                  />
                ))}
              </>
            )}
          </div>
        </div>
        <div className="text-xs w-full flex items-start mt-8 text-ws-text-tertiary">
          <span className="text-ws-text-primary mr-1">Source:</span> Bureau of Labor Statistics Job
          Openings and Labor Turnover Survey
        </div>
      </div>

      {/* ── Area Median Wage ── */}
      <div className="w-full flex flex-col bg-ws-light-teal-25 border border-ws-border-primary rounded-xl py-8 px-6">
        <div className="w-full flex items-start flex-col lg:flex-row justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl lg:text-4xl font-medium text-ws-text-primary">
              {selectedWageState
                ? `Area Median Wage: ${selectedWageState.state}`
                : "Area Median Wage"}
            </h3>
            <p className="text-base text-ws-text-primary w-full mt-2">
              Compare your wages with median wages for salaried and hourly employees for the
              selected geography.
            </p>
          </div>
          <div className="flex flex-col items-start w-full lg:w-auto shrink-0 mt-4 lg:mt-0">
            <Label className="text-sm font-medium text-ws-text-secondary flex mb-1.5">
              Zip Code
            </Label>
            <Select
              className="w-full flex items-start min-w-50 md:min-w-full lg:min-w-50"
              isRequired
              size="md"
              placeholder="Select Area"
              items={wageZipItems}
              value={activeWageZip}
              onSelectionChange={key => {
                if (key) {
                  setSelectedWageZip(key as string);
                }
              }}
            >
              {item => <Select.Item id={item.id}>{item.label}</Select.Item>}
            </Select>
          </div>
        </div>
        <div className="w-full mt-8">
          {isLoadingCards ? (
            <SalaryHourlySkeleton />
          ) : (
            <SalaryHourlyComparisonChart
              salaryData={salaryData}
              hourlyData={hourlyData}
              sourceAttribution={`Source: BLS, ${selectedWageState?.year ? selectedWageState?.year : ""}`}
            />
          )}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full mt-4">
            {isLoadingCards ? (
              <>
                <WagesCardSkeleton />
                <WagesCardSkeleton />
                <WagesCardSkeleton />
              </>
            ) : (
              <>
                {dynamicSalaryCardsConfig.map(card => (
                  <StaticCard
                    key={card.id}
                    title={card.title}
                    titleClass="text-sm font-medium text-ws-text-tertiary"
                    itemAlign="between"
                    count={card.count}
                    countClass="mt-2 text-3xl font-semibold text-ws-text-primary"
                    infoIcon={false}
                    placements="top"
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Housing Cost Burden ── */}
      <div className="w-full flex flex-col bg-ws-light-teal-25 border border-ws-border-primary rounded-xl py-8 px-6">
        <div className="w-full flex items-start flex-col lg:flex-row justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl lg:text-4xl font-medium text-ws-text-primary">
              {/* Housing Cost Burden: {selectedHousingData?.zipcode ?? ""} */}
              Housing Burden
            </h3>
          </div>
          <div className="flex flex-col items-start w-full lg:w-auto shrink-0 mt-4 lg:mt-0">
            <Label className="text-sm font-medium text-ws-text-secondary flex mb-1.5">
              Zip Code
            </Label>
            <Select
              className="w-full flex items-start min-w-50 md:min-w-full lg:min-w-50"
              isRequired
              size="md"
              placeholder="Select Area"
              items={housingZipItems}
              value={activeHousingZip}
              onSelectionChange={key => {
                if (key) {
                  setSelectedHousingZipState(key as string);
                }
              }}
            >
              {item => <Select.Item id={item.id}>{item.label}</Select.Item>}
            </Select>
          </div>
        </div>
        <div className="w-full mt-8">
          <h3 className="text-base font-bold text-ws-text-primary">
            {selectedHousingData
              ? "Your workers residing in Manchester, New Hampshire are likely financially burdened - meaning workers likely spend a large portion of their wages on housing and transportation"
              : "No housing data available for the selected area"}
          </h3>
          <p className="text-base mt-4 text-ws-text-primary">
            The concept of housing cost burden applies to both renters and homeowners, but it’s calculated differently for each. Both 
            renters and homeowners can be housing-cost burdened; the main difference is what expenses are counted, not the income 
            thresholds.
          </p>
        </div>
        <div className="my-4">
          <h2 className="text-xl font-semibold text-ws-text-primary mb-1">
            Housing Cost Burdened Owners
          </h2>
          {/* This is require if client want to add year */}
          {/* <p className="text-sm font-medium text-ws-text-primary">
            {ownersPeriodLabel}
          </p> */}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full">
          {isLoadingCards ? (
            <>
              <ProgressCardSkeleton />
              <ProgressCardSkeleton />
            </>
          ) : (
            <>
              {dynamicHousingBurdenOwnersConfig.map(card => (
                <ProgressCard
                  key={card.id}
                  title={card.title}
                  showInfoIcon={card.showInfoIcon}
                  tooltipText={card.tooltipText}
                  progressLabel={card.progressLabel}
                  percentage={card.percentage}
                  progressColor={card.progressColor}
                />
              ))}
            </>
          )}
        </div>
        <div className="my-4">
          <h2 className="text-xl font-semibold text-ws-text-primary mb-1">
            Housing Cost Burdened Renters
          </h2>
          {/* This is require if client want to add year */}
          {/* <p className="text-sm font-medium text-ws-text-primary">
            {rentersPeriodLabel}
          </p> */}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full">
          {isLoadingCards ? (
            <>
              <ProgressCardSkeleton />
              <ProgressCardSkeleton />
            </>
          ) : (
            <>
              {dynamicHousingBurdenRentersConfig.map(card => (
                <ProgressCard
                  key={card.id}
                  title={card.title}
                  showInfoIcon={card.showInfoIcon}
                  tooltipText={card.tooltipText}
                  progressLabel={card.progressLabel}
                  percentage={card.percentage}
                  progressColor={card.progressColor}
                />
              ))}
            </>
          )}
        </div>
        <div>
          <p className="text-xs text-ws-text-tertiary mt-4 border-b border-ws-border-primary pb-8">
            Source: U.S. Census Bureau, 5-Year American Community Survey
          </p>

          {/* ── Working Class Housing Cost Burden ── */}
          <div className="w-full flex items-start flex-col lg:flex-row justify-between mt-8">
            <div className="space-y-1 w-full">
              <h3 className="text-2xl font-medium text-ws-text-primary">
                Working Class Housing Cost Burden
              </h3>
              <p className="max-w-3xl text-base text-ws-text-secondary mt-2">
                In Manchester, New Hampshire, working class residents are increasingly stretched 
                by rising rents that have outpaced wage growth, with many households spending 
                well above the recommended 30 percent of their income just to keep a roof over 
                their heads.
              </p>
              <p className="text-xs text-ws-text-tertiary mt-4">
                <span className="font-semibold">Source:</span> U.S. Census Bureau, 5-Year American
                Community Survey
              </p>
            </div>
            <div className="flex flex-col items-start w-full lg:w-auto shrink-0 mt-4 lg:mt-0">
              <Label className="text-ws-text-secondary flex mb-1.5">
                Household type
              </Label>
              <Select
                className="w-full flex items-start min-w-50 md:min-w-full lg:min-w-50"
                isRequired
                size="md"
                placeholder="Select Household Type"
                items={[
                  { label: "Owners", id: "owners" },
                  { label: "Renters", id: "renters" },
                ]}
                value={selectedGraphType}
                onSelectionChange={key => {
                  if (key) {
                    setSelectedGraphType(key as "owners" | "renters");
                  }
                }}
              >
                {item => <Select.Item id={item.id}>{item.label}</Select.Item>}
              </Select>
            </div>
          </div>

          {/* Cost burden stat cards */}
          <div className="grid xl:grid-cols-3 gap-4 mt-6 flex-col lg:flex-row">
            {isLoadingCards ? (
              <>
                <OverviewCardSkeleton />
                <OverviewCardSkeleton />
                <OverviewCardSkeleton />
              </>
            ) : (
              <>
                {dynamicCostBurdenCardsConfig.map(card => (
                  <StaticCard
                    key={card.id}
                    title={card.title}
                    titleClass="text-sm font-medium text-ws-text-tertiary"
                    itemAlign="between"
                    count={card.count}
                    countClass="mt-2 text-3xl font-semibold text-ws-text-primary"
                    infoIcon={false}
                    infoCircleClass="text-ws-gray-400 size-4"
                    tooltipText={""}
                    descriptionText={""}
                    placements="top"
                  />
                ))}
              </>
            )}
          </div>

          <div className="flex-1 w-full overflow-x-auto mt-6 bg-ws-base-white p-4 rounded-xl border border-ws-border-primary">
            {isLoadingCards ? (
              <CostBurdenChartSkeleton />
            ) : (
              <IncomeDistributionChart
                data={Array.isArray(workingClassHousingGraph) ? workingClassHousingGraph : []}
              />
            )}
          </div>
        </div>
        <p className="text-xs text-ws-text-tertiary mt-6">
          <span className="font-semibold">Source:</span> U.S. Census Bureau, 5-Year American
          Community Survey
        </p>
      </div>

      <div className="w-full">
        <p className="text-xs text-ws-text-primary">
          This product provides informational insights and recommendations based on the data you
          share and industry benchmarks. It does not provide legal, financial, tax, or benefits
          advice, and recommendations are not guarantees of outcomes or results. Actual results may
          vary based on your unique business circumstances. Always consult qualified professionals
          for specific legal, tax, or financial advice.
        </p>
      </div>

      <GetInTouchModal
        isOpen={isGetInTouchModalOpen}
        onClose={() => setIsGetInTouchModalOpen(false)}
      />
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import StaticCard from "../recommendations/StaticCard";
import { Select } from "@/components/base/select/select";
import { IncomeDistributionChart } from "./CostBurdenBarChart";
import { GetInTouchModal } from "@/components/modals/GetInTouchModal";
import { useAppSelector } from "@/store/hooks";
import {
  selectIndustryOverview,
  selectZipCodes,
  selectIndustry,
  selectDashboardData,
} from "@/store/selectors/dashboardSelectors";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import { Label } from "@/components/base/input/label";
import { GlobeIcon } from "@/assets/icons/Globe";
import { DollarIcon } from "@/assets/icons/DollarIcon";
import { CurrencyStackIcon } from "@/assets/icons/CurrencyStackIcon";
import TurnoverRateCard from "./TurnoverRateCard";
import SalaryHourlyComparisonChart from "./SalaryHourlyCharts/SalaryHourlyChartsView/SalaryHourlyComparisonChart";
import ProgressCard from "./ProgressCard";
import { Link } from "react-router-dom";

const OverviewCardSkeleton = () => (
  <div className="border border-ws-border-secondary rounded-lg p-4 bg-ws-base-white animate-pulse shadow-sm">
    <div className="flex items-end justify-between">
      <div className="h-4 bg-ws-gray-200 rounded w-3/4 mb-4"></div>
      <div className="w-4 h-4 bg-ws-gray-200 rounded-full mb-4"></div>
    </div>
    <div className="h-10 bg-ws-gray-200 rounded w-1/3"></div>
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
    <div className="flex flex-col items-start mt-4 gap-2">
      <div className="h-1 bg-ws-gray-200 rounded w-1/2"></div>
      <div className="h-1 bg-ws-gray-200 rounded w-1/2"></div>
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
    title: (data: any) =>
      !data?.turnoverRate?.month || !data?.turnoverRate?.year
        ? "Turnover rate"
        : `Turnover rate since ${data?.turnoverRate?.month} ${data?.turnoverRate?.year}`,
    count: (data: any) => formatPercentage(data?.turnoverRate?.rate),
    tooltipText: "Turnover Rate",
    descriptionText: () =>
      "Industry specific turnover metrics are calculated from US Census Bureau QWI data sources",
    countClass: (data: any) =>
      data?.turnoverRate?.rate == null
        ? "mt-2 text-sm font-medium text-ws-text-primary"
        : "mt-2 text-3xl font-semibold text-ws-text-primary",
  },
  {
    id: "avg-turnover",
    title: (data: any) =>
      !data?.avgTurnover?.sinceYear
        ? "Avg Turnover"
        : `Avg Turnover since  ${data?.avgTurnover?.sinceYear}`,
    count: (data: any) => formatPercentage(data?.avgTurnover?.rate),
    tooltipText: "Average Turnover",
    descriptionText: () =>
      "Average turnover metrics are calculated from US Census Bureau QWI data sources",
    countClass: (data: any) =>
      data?.avgTurnover?.rate == null
        ? "mt-2 text-sm font-medium text-ws-text-primary"
        : "mt-2 text-3xl font-semibold text-ws-text-primary",
  },
  {
    id: "avg-cost-turnover",
    title: () => "Avg. Cost of Turnover",
    count: (data: any) =>
      data?.avgCostOfTurnover?.formatted || formatCurrency(data?.avgCostOfTurnover?.amount),
    tooltipText: "Average Cost of Turnover",
    descriptionText: (data: any) =>
      `Industry specific cost of turnover is calculated from ${data?.avgCostOfTurnover?.year || " "}`,
    countClass: (data: any) =>
      data?.avgCostOfTurnover?.amount == null
        ? "mt-2 text-sm font-medium text-ws-text-primary"
        : "mt-2 text-3xl font-semibold text-ws-text-primary",
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
  industryText: (industryOverview: unknown) => string | undefined;
  industryBoldText: string;
  sourceText: string;
  sourceBoldText: string;
  className: string;
  sourceClass: string;
}

const turnoverCardsConfig: TurnoverCardConfig[] = [
  {
    id: "turnover-rate",
    title: "Industry Turnover Rate",
    titleQatar: "Q2 2024",
    sections: [
      {
        sectionTitle: "INDUSTRY AVERAGE",
        columnsCount: 2 as const,
        cardsData: [
          {
            title: "Involuntary",
            statics: formatPercentage(39.8),
            progressValue: 39.8,
            customBarColor: "bg-ws-light-teal-400",
          },
          {
            title: "Voluntary",
            statics: formatPercentage(60.1),
            progressValue: 60.1,
            customBarColor: "bg-ws-navy-600",
          },
        ],
      },
    ],
    industryText: (data: unknown) =>
      (data as any)?.turnoverRate?.rate ? "Industry-wide cost of turnover:" : undefined,
    industryBoldText: "$4,149.2M",
    sourceText: "Source:",
    sourceBoldText: "Lorem ipsum sit amet dolor",
    className: "col-span-1",
    sourceClass: "mt-0",
  },
  {
    id: "separation-rate",
    title: "Industry Separation Rate",
    titleQatar: "Q2 2024",
    sections: [
      {
        sectionTitle: "INDUSTRY AVERAGE",
        columnsCount: 2 as const,
        cardsData: [
          {
            title: "Involuntary",
            statics: formatPercentage(39.8),
            progressValue: 39.8,
            customBarColor: "bg-ws-light-teal-400",
          },
          {
            title: "Voluntary",
            statics: formatPercentage(60.1),
            progressValue: 60.1,
            customBarColor: "bg-ws-navy-600",
          },
        ],
      },
    ],
    industryText: (data: unknown) =>
      (data as any)?.turnoverRate?.rate ? "Industry-wide cost of turnover:" : undefined,
    industryBoldText: "$4,149.2M",
    sourceText: "Source:",
    sourceBoldText: "Lorem ipsum sit amet dolor",
    className: "col-span-1",
    sourceClass: "mt-0",
  },
];

interface SalaryCardConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  count: string;
}

const salaryCardsConfig: SalaryCardConfig[] = [
  {
    id: "median-living-wage",
    title: "[State] Median Living Wage",
    icon: <DollarIcon className="size-5 text-ws-gray-500" />,
    count: "$24.03",
  },
  {
    id: "average-salary",
    title: "[State} Average Salary, 2023",
    icon: <CurrencyStackIcon className="size-5 text-ws-gray-500" />,
    count: "$92,377",
  },
  {
    id: "national-average",
    title: "National Average Salary",
    icon: <GlobeIcon className="size-5 text-ws-gray-500" />,
    count: "$83,227",
  },
];

interface ProgressCardConfig {
  id: string;
  title: string;
  showInfoIcon: boolean;
  tooltipText: string;
  progressLabel: string;
  percentage: number;
  progressColor: string;
}

const housingBurdenOwnersConfig: ProgressCardConfig[] = [
  {
    id: "burdened-owners",
    title: "Burdened Owners",
    showInfoIcon: true,
    tooltipText: "Households spending 30% or more of gross income on housing costs",
    progressLabel: "Metro Area",
    percentage: 18.2,
    progressColor: "bg-ws-navy-600",
  },
  {
    id: "severely-burdened-owners",
    title: "Severely Burdened Owners",
    showInfoIcon: true,
    tooltipText: "spends 50% or more of its gross income on rent and utilities.",
    progressLabel: "Metro Area",
    percentage: 14.3,
    progressColor: "bg-ws-navy-600",
  },
];

const housingBurdenRentersConfig: ProgressCardConfig[] = [
  {
    id: "burdened-renters",
    title: "Burdened Renters",
    showInfoIcon: true,
    tooltipText: "Households spending 30% or more of gross income on housing costs",
    progressLabel: "Metro Area",
    percentage: 18.2,
    progressColor: "bg-ws-light-teal-600",
  },
  {
    id: "severely-burdened-renters",
    title: "Severely Burdened Renters",
    showInfoIcon: true,
    tooltipText: "spends 50% or more of its gross income on rent and utilities.",
    progressLabel: "Metro Area",
    percentage: 16.3,
    progressColor: "bg-ws-light-teal-600",
  },
];

interface CostBurdenCardConfig {
  id: string;
  title: string;
  count: string;
  tooltipText: string;
  descriptionText: string;
  countClass: string;
}

const costBurdenCardsConfig: CostBurdenCardConfig[] = [
  {
    id: "home-ownership-rate",
    title: "Home Ownership Rate",
    count: "72%",
    tooltipText: "Turnover Rate",
    descriptionText:
      "Industry specific turnover metrics are calculated from US Census Bureau QWI data sources",
    countClass: "mt-2 text-sm font-medium text-ws-text-primary",
  },
  {
    id: "median-home-value",
    title: "Median Home Value",
    count: "$367,000",
    tooltipText: "Median Home Value",
    descriptionText:
      "Industry specific turnover metrics are calculated from US Census Bureau QWI data sources",
    countClass: "mt-2 text-sm font-medium text-ws-text-primary",
  },
  {
    id: "median-rent",
    title: "Median Rent",
    count: "$1,423",
    tooltipText: "Median Rent",
    descriptionText:
      "Industry specific turnover metrics are calculated from US Census Bureau QWI data sources",
    countClass: "mt-2 text-sm font-medium text-ws-text-primary",
  },
];

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

export default function BenchmarkPage() {
  const [isGetInTouchModalOpen, setIsGetInTouchModalOpen] = useState(false);
  const [selectedGraphType, setSelectedGraphType] = useState<"owners" | "renters">("renters");

  const [isLoadingCards, setIsLoadingCards] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingCards(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Get dashboard benchmark data from Redux store
  const industryOverview = useAppSelector(selectIndustryOverview);
  const zipCodes = useAppSelector(selectZipCodes);
  const industry = useAppSelector(selectIndustry);
  const dashboardData = useAppSelector(selectDashboardData);

  const initialZip =
    (zipCodes && zipCodes.length > 0 && zipCodes[0]) ||
    dashboardData?.areaMedianWage?.[0]?.zipcode ||
    dashboardData?.housingCost?.[0]?.zipcode ||
    null;

  const selectedHousingZip = initialZip;

  // Derive housing data for selected housing zip
  const selectedHousingData = selectedHousingZip
    ? dashboardData?.housingCost?.find(h => h.zipcode === selectedHousingZip)
    : dashboardData?.housingCost?.[0];

  // Transform graph data based on selected zip + household type (Owners/Renters)
  // Always returns a valid array — never throws on zip change or missing data
  const workingClassHousingGraph = (() => {
    try {
      const graphData = selectedHousingData?.workingClassHousingGraph;
      if (!graphData) return [];

      const selectedData = selectedGraphType === "owners" ? graphData.owners : graphData.renters;
      if (!selectedData) return [];

      const safeNum = (v: unknown): number => (typeof v === "number" && isFinite(v) ? v : 0);

      return [
        {
          incomeCategory: "lowIncome",
          label: "Low income",
          range: "$50,000 or less",
          burdened: safeNum(selectedData.lowIncome?.burdened),
          severelyBurdened: safeNum(selectedData.lowIncome?.severelyBurdened),
        },
        {
          incomeCategory: "moderateIncome",
          label: "Moderate income",
          range: "$50,000 - $74,999",
          burdened: safeNum(selectedData.moderateIncome?.burdened),
          severelyBurdened: safeNum(selectedData.moderateIncome?.severelyBurdened),
        },
        {
          incomeCategory: "medianIncome",
          label: "Median income",
          range: "$75,000 - $99,999",
          burdened: safeNum(selectedData.medianIncome?.burdened),
          severelyBurdened: safeNum(selectedData.medianIncome?.severelyBurdened),
        },
        {
          incomeCategory: "upperIncome",
          label: "Upper income",
          range: "$100,000 or more",
          burdened: safeNum(selectedData.upperIncome?.burdened),
          severelyBurdened: safeNum(selectedData.upperIncome?.severelyBurdened),
        },
      ];
    } catch {
      return [];
    }
  })();

  // Salary and Hourly comparison data
  const salaryData = { industryAverage: 31000, nationalAverage: 78000 };
  const hourlyData = { industryAverage: 13.5, nationalAverage: 24.0 };

  return (
    <div className="bg-ws-base-white py-10 px-6 space-y-6 shadow-xl rounded-b-xl">
      <div className="w-full flex items-center justify-between">
        <h2 className="text-2xl lg:text-4xl font-medium text-ws-text-primary leading-10">
          {`Current Trends for  ${industry?.name}`}
        </h2>
      </div>

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
                infoIcon={true}
                infoCircleClass="text-ws-gray-400 size-4"
                tooltipText={card.tooltipText}
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
            <p className="text-base text-ws-text-primary w-full xl:w-3/4 mt-2">Lorem Ipsum</p>
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
                {turnoverCardsConfig.map(card => (
                  <TurnoverRateCard
                    key={card.id}
                    title={card.title}
                    titleQatar={card.titleQatar}
                    sections={card.sections}
                    industryText={card.industryText(industryOverview)}
                    industryBoldText={card.industryBoldText}
                    sourceText={card.sourceText}
                    sourceBoldText={card.sourceBoldText}
                    className={card.className}
                    sourceClass={card.sourceClass}
                  />
                ))}
              </>
            )}
          </div>
        </div>
        <div className="text-xs w-full flex items-start mt-8 text-ws-text-tertiary">
          <span className="text-ws-text-primary mr-1">Source:</span> Lorem Ipsum dolor
        </div>
      </div>

      <div className="w-full flex flex-col bg-ws-light-teal-25 border border-ws-border-primary rounded-xl py-8 px-6">
        <div className="w-full flex items-center flex-col lg:flex-row justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl lg:text-4xl font-medium text-ws-text-primary">
              Area Median Wage: Manchester, NH
            </h3>
            <p className="text-base text-ws-text-primary w-full  mt-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce quis felis venenatis.
            </p>
          </div>
          <div className="flex flex-col items-start w-full lg:w-auto shrink-0 mt-4 lg:mt-0">
            <Label className="text-sm font-medium text-ws-text-secondary flex mb-1.5">
              Metropolitan Area <span className="text-ws-error-600">*</span>
            </Label>
            <Select
              className="w-full flex items-start min-w-50 md:min-w-full lg:min-w-50"
              isRequired
              size="md"
              placeholder="Select Area"
              items={[
                { label: "Manchester, NH", id: "manchester-nh" },
                { label: "Manchester, NH", id: "manchester-nh" },
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
            <p className="text-xs text-ws-text-tertiary mt-1">This is a hint text to help user.</p>
          </div>
        </div>
        <div className="w-full mt-8">
          {isLoadingCards ? (
            <SalaryHourlySkeleton />
          ) : (
            <SalaryHourlyComparisonChart salaryData={salaryData} hourlyData={hourlyData} />
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
                {salaryCardsConfig.map(card => (
                  <StaticCard
                    key={card.id}
                    classess="border-ws-border-secondary"
                    title={card.title}
                    titleClass="text-ws-text-tertiary text-sm"
                    countIcon={card.icon}
                    count={card.count}
                    countClass="text-ws-light-teal-900 text-3xl xl:text-4xl font-medium mt-6"
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col bg-ws-light-teal-25 border border-ws-border-primary rounded-xl py-8 px-6">
        <div className="w-full flex items-start flex-col lg:flex-row justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl lg:text-4xl font-medium text-ws-text-primary">
              Housing Burden
            </h3>
          </div>
          <div className="flex flex-col items-start w-full lg:w-auto shrink-0 mt-4 lg:mt-0">
            <Label className="text-sm font-medium text-ws-text-secondary flex mb-1.5">
              Metropolitan Area <span className="text-ws-error-600">*</span>
            </Label>
            <Select
              className="w-full flex items-start min-w-50 md:min-w-full lg:min-w-50"
              isRequired
              size="md"
              placeholder="Select Area"
              items={[
                { label: "Manchester, NH", id: "manchester-nh" },
                { label: "Manchester, NH", id: "manchester-nh" },
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
            <p className="text-xs text-ws-text-tertiary mt-1">This is a hint text to help user.</p>
          </div>
        </div>
        <div className="w-full mt-8">
          <h3 className="text-base font-bold text-ws-text-primary">
            Your workers residing in Manchester, New Hampshire are likely financially burdened -
            meaning workers likely spend a large portion of their wages on housing and
            transportation
          </h3>
          <p className="text-base mt-4 text-ws-text-primary">
            The concept of rent (or housing cost) burden applies to both renters and homeowners, but
            it’s calculated a bit differently for each. Both renters and homeowners can be
            housing-cost burdened; the main difference is what expenses are counted, not the income
            thresholds.
          </p>
        </div>
        <div className="my-4">
          <h2 className="text-xl font-semibold text-ws-text-primary mb-1">
            Housing Cost Burdened Owners
          </h2>
          <p className="text-sm font-medium text-ws-text-primary">Q4 2023</p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full">
          {isLoadingCards ? (
            <>
              <ProgressCardSkeleton />
              <ProgressCardSkeleton />
            </>
          ) : (
            <>
              {housingBurdenOwnersConfig.map(card => (
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
          <p className="text-sm font-medium text-ws-text-primary">Q4 2023</p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full">
          {isLoadingCards ? (
            <>
              <ProgressCardSkeleton />
              <ProgressCardSkeleton />
            </>
          ) : (
            <>
              {housingBurdenRentersConfig.map(card => (
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
            Source: US Census Bureau, 2023
          </p>
          <div className="w-full flex items-start flex-col lg:flex-row justify-between mt-8">
            <div className="space-y-1 w-full">
              <h3 className="text-2xl font-medium text-ws-text-primary">
                Working Class Housing Cost Burden
              </h3>
              <p className="max-w-3xl text-base text-ws-text-secondary mt-2">
                In Manchester, New Hampshire, working class residents are increasingly stretched by
                rising rents that have outpaced wage growth, with many households spending well
                above the recommended 30 percent of their income just to keep a roof over their
                heads.{" "}
              </p>
              <p className="text-xs text-ws-text-tertiary mt-4 border-b border-ws-border-primary pb-8">
                Source: US Census Bureau, 2023
              </p>
            </div>
            <div className="flex flex-col items-start w-full lg:w-auto shrink-0">
              <Label className="text-ws-text-secondary flex mb-1.5">
                Household type <span className="text-ws-error-600">*</span>
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
              <p className="text-xs text-ws-text-tertiary mt-1">
                This is a hint text to help user.
              </p>
            </div>
          </div>
          <div className="grid xl:grid-cols-3 gap-4 mt-6 flex-col lg:flex-row">
            {isLoadingCards ? (
              <>
                <OverviewCardSkeleton />
                <OverviewCardSkeleton />
                <OverviewCardSkeleton />
              </>
            ) : (
              <>
                {costBurdenCardsConfig.map(card => (
                  <StaticCard
                    key={card.id}
                    title={card.title}
                    titleClass="text-sm font-medium text-ws-text-tertiary"
                    itemAlign="between"
                    count={card.count}
                    countClass="mt-2 text-3xl font-semibold text-ws-text-primary"
                    infoIcon={true}
                    infoCircleClass="text-ws-gray-400 size-4"
                    tooltipText={card.tooltipText}
                    descriptionText={card.descriptionText}
                    placements="top"
                  />
                ))}
              </>
            )}
          </div>
          {/* Chart */}
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
          <span className="font-semibold">Source:</span> Lorem Ipsum dolor
        </p>
      </div>
      <div className="w-full">
        <p className="text-xs text-ws-text-primary">
          This product provides informational insights and recommendations based on the data you
          share and industry benchmarks. It does not provide legal, financial, tax, or benefits
          advice, and recommendations are not guarantees of outcomes or results. Actual results may
          vary, and you are responsible for evaluating and implementing any recommendations based on
          your organization’s specific circumstances. Read our{" "}
          <Link to="/terms-page" className="text-ws-light-teal-850 underline">
            Terms & Conditions{" "}
          </Link>
          and{" "}
          <Link to="/privacy-policy" className="text-ws-light-teal-850 underline">
            Privacy Policy
          </Link>
        </p>
      </div>

      {/* Get In Touch Modal */}
      <GetInTouchModal
        isOpen={isGetInTouchModalOpen}
        onClose={() => setIsGetInTouchModalOpen(false)}
      />
    </div>
  );
}

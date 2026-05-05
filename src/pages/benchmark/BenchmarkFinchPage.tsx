"use client";
import { useState } from "react";
import StaticCard from "../recommendations/StaticCard";
import { Select } from "@/components/base/select/select";
import { IncomeDistributionChart } from "./CostBurdenBarChart";
import { GetInTouchModal } from "@/components/modals/GetInTouchModal";
import { useAppSelector } from "@/store/hooks";
import {
  selectIndustryOverviewData,
  // selectIndustryZipCodes,
  selectIndustryData,
  selectIndustryHousingData,
  selectIndustryAreaMedianWage,
  selectIndustryTurnover,
} from "@/store/selectors/industrySelectors";
import { useIndustry } from "@/hooks/useIndustry";
import {
  formatCurrency,
  formatCurrencyWithCents,
  formatPercentage,
  formatToTwoDecimalPlaces,
} from "@/utils/formatters";
import { Label } from "@/components/base/input/label";
import TurnoverRateCard from "./TurnoverRateCard";
import { GlobeIcon } from "@/assets/icons/Globe";
import { DollarIcon } from "@/assets/icons/DollarIcon";
import { CurrencyStackIcon } from "@/assets/icons/CurrencyStackIcon";
import ProgressCard from "./ProgressCard";
import SalaryHourlyFinchChart from "./SalaryHourlyCharts/SalaryHourlyChartsFinch/SalaryHourlyComparisonChart";
import { TimerIcon } from "@/assets/icons/TimerIcon";
import PreparingDashboard from "@/pages/recommendations/PreparingDashboard";
import didHeroImg from "@/assets/employees-reported.jpg";
import DidYouKnowBanner from "@/components/common/DidYouKnowBanner";
import {
  PREPARING_MSG_AUTOMATED,
  PREPARING_MSG_NON_AUTOMATED,
} from "@/constants/preparingDashboardMessages";

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
    <div className="h-4 bg-ws-gray-200 rounded w-1/2 mb-2 mt-5"></div>
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
          <div className="w-10 h-65 bg-ws-gray-200"></div>
        </div>
      </div>
      <div className="w-full h-80 flex items-center justify-center flex-col gap-4">
        <div className="flex w-15 h-4 bg-ws-gray-200 mb-4"></div>
        <div className="flex items-end justify-center gap-4">
          <div className="w-10 h-30 bg-ws-gray-200"></div>
          <div className="w-10 h-50 bg-ws-gray-200"></div>
          <div className="w-10 h-65 bg-ws-gray-200"></div>
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
        <div className="flex items-center justify-between gap-4 mt-2">
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

// ── Static config interfaces ──

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
        : `Turnover Rate Since ${tr.month} ${tr.year}`;
    },
    count: (data: unknown) => {
      const d = data as Record<string, unknown> | null;
      const tr = d?.turnoverRate as Record<string, unknown> | null;
      const value = tr?.rate;
      return typeof value === "number"
        ? `${formatToTwoDecimalPlaces(value)}M`
        : (value as string) || "N/A";
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
      const icot = d?.industryWideCostOfTurnover as Record<string, unknown> | null;
      const value = icot?.formatted;
      return typeof value === "number" ? formatPercentage(value) : (value as string) || "N/A";
    },
    tooltipText: "Average Turnover",
    descriptionText: () =>
      "Average turnover metrics are calculated from US Census Bureau QWI data sources",
    countClass: (data: unknown) => {
      const d = data as Record<string, unknown> | null;
      const icot = d?.industryWideCostOfTurnover as Record<string, unknown> | null;
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
      return typeof value === "number" && value !== undefined
        ? `${formatToTwoDecimalPlaces(value)}%`
        : value != null
          ? `${value}%`
          : "N/A";
    },
    tooltipText: "Average Cost of Turnover",
    descriptionText: (data: unknown) => {
      const d = data as Record<string, unknown> | null;
      const at = d?.avgTurnover as Record<string, unknown> | null;
      return `Industry specific cost of turnover is calculated from ${at?.sinceYear || " "}`;
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

const benchmarkCardsConfigR2: BenchmarkCardConfig[] = [
  {
    id: "hire-rate-y-o-y",
    title: () => "Hire Rate Year-over-Year",
    count: (data: unknown) => {
      const d = data as Record<string, unknown> | null;
      const rates = d?.rates as Record<string, unknown> | null;
      const hire = rates?.hire;
      return hire != null ? formatPercentage(hire as number) : "N/A";
    },
    tooltipText: "Hire Rate",
    descriptionText: () =>
      "Industry specific hire rate metrics are calculated from US Census Bureau QWI data sources",
    countClass: (data: unknown) => {
      const d = data as Record<string, unknown> | null;
      const rates = d?.rates as Record<string, unknown> | null;
      return rates?.hire == null
        ? "mt-2 text-sm font-medium text-ws-text-primary"
        : "mt-2 text-3xl font-semibold text-ws-text-primary";
    },
  },
  {
    id: "separation-rate-y-o-y",
    title: () => "Separation Rate Year-over-Year",
    count: (data: unknown) => {
      const d = data as Record<string, unknown> | null;
      const rates = d?.rates as Record<string, unknown> | null;
      const sep = rates?.separation;
      return sep != null ? formatPercentage(sep as number) : "N/A";
    },
    tooltipText: "Separation Rate",
    descriptionText: () =>
      "Industry specific separation rate metrics are calculated from US Census Bureau QWI data sources",
    countClass: (data: unknown) => {
      const d = data as Record<string, unknown> | null;
      const rates = d?.rates as Record<string, unknown> | null;
      return rates?.separation == null
        ? "mt-2 text-sm font-medium text-ws-text-primary"
        : "mt-2 text-3xl font-semibold text-ws-text-primary";
    },
  },
];

interface SalaryCardConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  count: string;
}

interface CostBurdenCardConfig {
  id: string;
  title: string;
  count: string;
  tooltipText: string;
  descriptionText: string;
  countClass: string;
}

interface TurnoverRateCardConfig {
  id: string;
  title: string;
  titleQatar: string;
  sections: Array<{
    sectionTitle: string;
    columnsCount: 1 | 2 | 3 | 4;
    cardsData: Array<{
      title: string;
      statics: string;
      staticsPoints?: string;
      staticsPointsState?: boolean;
      progressValue: number;
      customBarColor: string;
    }>;
  }>;
  industryText: string | undefined;
  industryBoldText: string;
  sourceText: string;
  sourceBoldText: string;
  className: string;
  sourceClass: string;
}

interface ProgressCardFinchConfig {
  id: string;
  title: string;
  showInfoIcon: boolean;
  tooltipText: string;
  sections: Array<{
    columnsCount: 1;
    items: Array<{
      label: string;
      percentage: number;
      progressColor: string;
    }>;
  }>;
}

export default function BenchmarkFinchPage({
  isReady = true,
  isStale = false,
  isAutomatedProvider = false,
}: {
  readonly isReady?: boolean;
  readonly isStale?: boolean;
  readonly isAutomatedProvider?: boolean;
} = {}) {
  const [isGetInTouchModalOpen, setIsGetInTouchModalOpen] = useState(false);
  const [selectedGraphType, setSelectedGraphType] = useState<"owners" | "renters">("renters");
  const [selectedWageZip, setSelectedWageZip] = useState<string | null>(null);
  const [selectedHousingZipState, setSelectedHousingZipState] = useState<string | null>(null);

  // Use industry hook for conditional API fetch and loading state
  const { isLoading: isLoadingIndustry, error: industryError } = useIndustry({ enabled: isReady });
  const isLoadingCards = !isReady || isLoadingIndustry;
  // Get industry data from Redux store via industry selectors
  const industryOverview = useAppSelector(selectIndustryOverviewData);
  // const zipCodes = useAppSelector(selectIndustryZipCodes);
  const industry = useAppSelector(selectIndustryData);
  const housingCostData = useAppSelector(selectIndustryHousingData);
  const areaMedianWage = useAppSelector(selectIndustryAreaMedianWage);
  const industryTurnOver = useAppSelector(selectIndustryTurnover);

  // areaMedianWage is a flat array from the industry API
  const wageZipItems = (areaMedianWage ?? []).map((w: { zipcode: string; state: string }) => ({
    label: w.zipcode,
    id: w.zipcode,
  }));

  console.log(setSelectedGraphType, "selectedGraphType in finch page");

  const activeWageZip = selectedWageZip ?? areaMedianWage?.[0]?.zipcode ?? null;

  const selectedWageState =
    areaMedianWage?.find((w: { zipcode: string }) => w.zipcode === activeWageZip) ??
    areaMedianWage?.[0] ??
    null;

  // Salary and Hourly comparison data (Finch page includes yourCompanyAverage)
  const salaryData = {
    industryAverage: selectedWageState?.graph?.stateAverage?.salary ?? 0,
    yourCompanyAverage: selectedWageState?.graph?.yourCompany?.salary ?? 0,
    nationalAverage: selectedWageState?.graph?.nationalAverage?.salary ?? 0,
  };
  const hourlyData = {
    industryAverage: selectedWageState?.graph?.stateAverage?.hourly ?? 0,
    yourCompanyAverage: selectedWageState?.graph?.yourCompany?.hourly ?? 0,
    nationalAverage: selectedWageState?.graph?.nationalAverage?.hourly ?? 0,
  };

  // Dynamic salary cards config based on selected state (Finch page has 4 cards including company median)
  const dynamicSalaryCardsConfig: SalaryCardConfig[] = [
    {
      id: "company-median-hourly-wages",
      title: "Company's Median Hourly Wages",
      icon: <TimerIcon className="size-5 text-ws-gray-500" />,
      count:
        selectedWageState?.medianHourlyWages != null
          ? formatCurrencyWithCents(selectedWageState.medianHourlyWages)
          : "N/A",
    },
    {
      id: "median-living-wage",
      title: selectedWageState
        ? `${selectedWageState.state} Median Living Wage`
        : "Median Living Wage",
      icon: <DollarIcon className="size-5 text-ws-gray-500" />,
      count: selectedWageState
        ? formatCurrencyWithCents(selectedWageState.medianLivingWage)
        : "N/A",
    },
    {
      id: "average-salary",
      title: selectedWageState
        ? `${selectedWageState.state} Average Salary, ${selectedWageState.year ?? ""}`
        : "Average Salary",
      icon: <CurrencyStackIcon className="size-5 text-ws-gray-500" />,
      count: selectedWageState?.graph?.stateAverage?.salary
        ? formatCurrency(selectedWageState.graph.stateAverage.salary)
        : "N/A",
    },
    {
      id: "national-average",
      title: "National Average Salary",
      icon: <GlobeIcon className="size-5 text-ws-gray-500" />,
      count: selectedWageState?.nationalAverage
        ? formatCurrency(selectedWageState.nationalAverage)
        : "N/A",
    },
  ];

  // ── Turnover cards config (dynamic from industry API) ──
  const turnoverCardsConfigFinch: TurnoverRateCardConfig[] = [
    {
      id: "turnover-rate",
      title: "Industry Turnover Rate",
      titleQatar: `${industryTurnOver?.turnOverRate?.industryAvg?.quarter ?? "Q4"} ${industryTurnOver?.turnOverRate?.industryAvg?.year ?? ""}`,
      sections: [
        {
          sectionTitle: "INDUSTRY AVERAGE",
          columnsCount: 2 as const,
          cardsData: [
            {
              title: "Involuntary",
              statics: industryTurnOver?.turnOverRate?.industryAvg?.involuntary
                ? formatPercentage(industryTurnOver?.turnOverRate?.industryAvg?.involuntary)
                : "No data",
              progressValue: industryTurnOver?.turnOverRate?.industryAvg?.involuntary ?? 0,
              customBarColor: "bg-ws-light-teal-400",
            },
            {
              title: "Voluntary",
              statics: industryTurnOver?.turnOverRate?.industryAvg?.voluntary
                ? formatPercentage(industryTurnOver?.turnOverRate?.industryAvg?.voluntary)
                : "No data",
              progressValue: industryTurnOver?.turnOverRate?.industryAvg?.voluntary ?? 0,
              customBarColor: "bg-ws-navy-600",
            },
          ],
        },
        {
          sectionTitle: `TURNOVER FOR ${industryTurnOver?.turnOverRate?.company?.year ?? ""}`,
          columnsCount: 2 as const,
          cardsData: [
            {
              title: "Industry",
              statics: industryTurnOver?.turnOverRate?.company?.industry
                ? formatPercentage(industryTurnOver?.turnOverRate?.company?.industry)
                : "No data",
              staticsPointsState: true,
              progressValue: industryTurnOver?.turnOverRate?.company?.industry ?? 0,
              customBarColor: "bg-ws-light-teal-400",
            },
            {
              title: "Company",
              statics: industryTurnOver?.turnOverRate?.company?.company
                ? formatPercentage(industryTurnOver?.turnOverRate?.company?.company)
                : "No data",
              staticsPointsState: true,
              progressValue: industryTurnOver?.turnOverRate?.company?.company ?? 0,
              customBarColor: "bg-ws-navy-600",
            },
          ],
        },
      ],
      industryText: undefined,
      industryBoldText: industryOverview?.industryWideCostOfTurnover?.formatted ?? "$4,149.2M",
      sourceText: "",
      sourceBoldText: "",
      className: "col-span-1",
      sourceClass: "mt-0",
    },
    {
      id: "separation-rate",
      title: "Industry Separation Rate",
      titleQatar: `${industryTurnOver?.separationRate?.industryAvg?.quarter ?? ""} ${industryTurnOver?.separationRate?.industryAvg?.year ?? ""}`,
      sections: [
        {
          sectionTitle: "INDUSTRY AVERAGE",
          columnsCount: 2 as const,
          cardsData: [
            {
              title: "Separation",
              statics: industryTurnOver?.separationRate?.industryAvg?.separation
                ? formatPercentage(industryTurnOver?.separationRate?.industryAvg?.separation)
                : "No data",
              progressValue: industryTurnOver?.separationRate?.industryAvg?.separation ?? 0,
              customBarColor: "bg-ws-light-teal-400",
            },
            {
              title: "Hiring Rate",
              statics: industryTurnOver?.separationRate?.industryAvg?.hiring
                ? formatPercentage(industryTurnOver?.separationRate?.industryAvg?.hiring)
                : "No data",
              progressValue: industryTurnOver?.separationRate?.industryAvg?.hiring ?? 0,
              customBarColor: "bg-ws-navy-600",
            },
          ],
        },
        {
          sectionTitle: "YOUR COMPANY",
          columnsCount: 2 as const,
          cardsData: [
            {
              title: "Separation",
              statics: industryTurnOver?.separationRate?.company?.separation
                ? formatPercentage(industryTurnOver?.separationRate?.company?.separation)
                : "No data",
              staticsPoints: (() => {
                const ind = industryTurnOver?.separationRate?.industryAvg?.separation;
                const comp = industryTurnOver?.separationRate?.company?.separation;
                if (ind == null || comp == null) {
                  return "";
                }
                const diff = comp - ind;
                return diff >= 0
                  ? `+${Math.abs(Math.round(diff))}pts`
                  : `-${Math.abs(Math.round(diff))}pts`;
              })(),
              staticsPointsState: true,
              progressValue: industryTurnOver?.separationRate?.company?.separation ?? 0,
              customBarColor: "bg-ws-light-teal-400",
            },
            {
              title: "Hiring Rate",
              statics: industryTurnOver?.separationRate?.company?.hiring
                ? formatPercentage(industryTurnOver?.separationRate?.company?.hiring)
                : "No data",
              staticsPoints: (() => {
                const ind = industryTurnOver?.separationRate?.industryAvg?.hiring;
                const comp = industryTurnOver?.separationRate?.company?.hiring;
                if (ind == null || comp == null) {
                  return "";
                }
                const diff = comp - ind;
                return diff >= 0
                  ? `+${Math.abs(Math.round(diff))}pts`
                  : `-${Math.abs(Math.round(diff))}pts`;
              })(),
              staticsPointsState: true,
              progressValue: industryTurnOver?.separationRate?.company?.hiring ?? 0,
              customBarColor: "bg-ws-navy-600",
            },
          ],
        },
      ],
      industryText: undefined,
      industryBoldText: industryOverview?.industryWideCostOfTurnover?.formatted ?? "$4,149.2M",
      sourceText: "",
      sourceBoldText: "",
      className: "col-span-1",
      sourceClass: "mt-0",
    },
  ];

  // ── Housing Cost: zip items, selection, and derived data ──
  const housingZipItems = (housingCostData ?? []).map((h: { zipcode: string }) => ({
    label: h.zipcode,
    id: h.zipcode,
  }));

  const activeHousingZip = selectedHousingZipState ?? housingCostData?.[0]?.zipcode ?? null;

  const selectedHousingData =
    housingCostData?.find((h: { zipcode: string }) => h.zipcode === activeHousingZip) ??
    housingCostData?.[0] ??
    null;

  const latestOwnersBurden = selectedHousingData?.owners ?? null;
  const latestRentersBurden = selectedHousingData?.renters ?? null;

  // Dynamic owners progress cards (Finch page has Metro Area + Your employees)
  const dynamicHousingBurdenOwnersConfig: ProgressCardFinchConfig[] = [
    {
      id: "burdened-owners",
      title: "Burdened Owners",
      showInfoIcon: true,
      tooltipText: "Spend 30% or more of its gross income on rent and utilities",
      sections: [
        {
          columnsCount: 1 as const,
          items: [
            {
              label: "Metro Area",
              percentage: latestOwnersBurden?.burdened?.metroArea ?? 0,
              progressColor: "bg-ws-navy-600",
            },
          ],
        },
        {
          columnsCount: 1 as const,
          items: [
            {
              label: "Your Employees",
              percentage: latestOwnersBurden?.burdened?.yourEmployees ?? 0,
              progressColor: "bg-ws-navy-200",
            },
          ],
        },
      ],
    },
    {
      id: "severely-burdened-owners",
      title: "Severely Burdened Owners",
      showInfoIcon: true,
      tooltipText: "Spend 50% or more of its gross income on rent and utilities.",
      sections: [
        {
          columnsCount: 1 as const,
          items: [
            {
              label: "Metro Area",
              percentage: latestOwnersBurden?.severelyBurdened?.metroArea ?? 0,
              progressColor: "bg-ws-navy-600",
            },
          ],
        },
        {
          columnsCount: 1 as const,
          items: [
            {
              label: "Your Employees",
              percentage: latestOwnersBurden?.severelyBurdened?.yourEmployees ?? 0,
              progressColor: "bg-ws-navy-200",
            },
          ],
        },
      ],
    },
  ];

  // Dynamic renters progress cards
  const dynamicHousingBurdenRentersConfig: ProgressCardFinchConfig[] = [
    {
      id: "burdened-renters",
      title: "Burdened Renters",
      showInfoIcon: true,
      tooltipText: "Spend 30% or more of its gross income on rent and utilities",
      sections: [
        {
          columnsCount: 1 as const,
          items: [
            {
              label: "Metro Area",
              percentage: latestRentersBurden?.burdened?.metroArea ?? 0,
              progressColor: "bg-ws-light-teal-600",
            },
          ],
        },
        {
          columnsCount: 1 as const,
          items: [
            {
              label: "Your Employees",
              percentage: latestRentersBurden?.burdened?.yourEmployees ?? 0,
              progressColor: "bg-ws-navy-200",
            },
          ],
        },
      ],
    },
    {
      id: "severely-burdened-renters",
      title: "Severely Burdened Renters",
      showInfoIcon: true,
      tooltipText: "Spend 50% or more of its gross income on rent and utilities.",
      sections: [
        {
          columnsCount: 1 as const,
          items: [
            {
              label: "Metro Area",
              percentage: latestRentersBurden?.severelyBurdened?.metroArea ?? 0,
              progressColor: "bg-ws-light-teal-600",
            },
          ],
        },
        {
          columnsCount: 1 as const,
          items: [
            {
              label: "Your Employees",
              percentage: latestRentersBurden?.severelyBurdened?.yourEmployees ?? 0,
              progressColor: "bg-ws-navy-200",
            },
          ],
        },
      ],
    },
  ];

  // Dynamic cost burden cards (working class data)
  const wcb = selectedHousingData?.workingClassHousingCostBurden;
  const dynamicCostBurdenCardsConfig: CostBurdenCardConfig[] = [
    {
      id: "home-ownership-rate",
      title: "Home Ownership Rate",
      count: wcb?.homeOwnershipRate != null ? `${wcb.homeOwnershipRate}%` : "N/A",
      tooltipText: "Home Ownership Rate",
      descriptionText: "U.S. Census Bureau, 5-Year American Community Survey",
      countClass: "mt-2 text-3xl font-semibold text-ws-text-primary",
    },
    {
      id: "median-home-value",
      title: "Median Home Value",
      count: wcb?.medianHomeValue != null ? formatCurrency(Number(wcb.medianHomeValue)) : "N/A",
      tooltipText: "Median Home Value",
      descriptionText: "U.S. Census Bureau, 5-Year American Community Survey",
      countClass: "mt-2 text-3xl font-semibold text-ws-text-primary",
    },
    {
      id: "median-rent",
      title: "Median Rent",
      count: wcb?.medianRent != null ? formatCurrency(Number(wcb.medianRent)) : "N/A",
      tooltipText: "Median Rent",
      descriptionText: "U.S. Census Bureau, 5-Year American Community Survey",
      countClass: "mt-2 text-3xl font-semibold text-ws-text-primary",
    },
  ];

  // Transform working class graph data for IncomeDistributionChart
  // API returns workingClassHousingGraph as Record<string, { burdened, severelyBurdened }>
  const workingClassHousingGraph = (() => {
    try {
      const graphData = selectedHousingData?.workingClassHousingGraph;
      if (!graphData) return [];

      const graphType = selectedGraphType; // "owners" or "renters"
      const typeData = graphData[graphType];
      if (!typeData || typeof typeData !== "object") return [];

      const labelMap: Record<string, { label: string; range: string }> = {
        lowIncome: { label: "Low income", range: "$55,250 or less" },
        moderateIncome: { label: "Moderate income", range: "$55,250 - $88,400" },
        medianIncome: { label: "Median income", range: "$88,400 - $132,600" },
        upperIncome: { label: "Upper income", range: "$132,600 or more" },
      };

      return Object.entries(typeData).map(([key, value]) => ({
        incomeCategory: key,
        label: labelMap[key]?.label ?? key,
        range: labelMap[key]?.range ?? key,
        burdened: typeof value.burdened === "number" ? value.burdened : 0,
        severelyBurdened: typeof value.severelyBurdened === "number" ? value.severelyBurdened : 0,
      }));
    } catch {
      return [];
    }
  })();

  // Derive period labels from housing data
  {
    /* This is require if client want to add quarter and year */
  }
  // const ownersBurdenYear = latestOwnersBurden?.period?.year;
  // const rentersBurdenYear = latestRentersBurden?.period?.year;
  // const ownersBurdenQuarter = latestOwnersBurden?.period?.quarter;
  // const rentersBurdenQuarter = latestRentersBurden?.period?.quarter;
  // const ownersPeriodLabel = ownersBurdenYear ? `Q${ownersBurdenQuarter} ${ownersBurdenYear}` : "";
  // const rentersPeriodLabel = rentersBurdenYear ? `Q${rentersBurdenQuarter} ${rentersBurdenYear}` : "";

  if (isStale) {
    const description = isAutomatedProvider ? PREPARING_MSG_AUTOMATED : PREPARING_MSG_NON_AUTOMATED;
    return (
      <div className="bg-ws-base-white py-10 px-6 space-y-6 shadow-xl rounded-b-xl">
        <PreparingDashboard description={description} />
        <DidYouKnowBanner
          imageSrc={didHeroImg}
          imageAlt="Workforce hero"
          stat="78%"
          text="of employees reported they're more likely to stay with an employer because of their benefits program."
          note="Source: Gallup"
        />
      </div>
    );
  }

  return (
    <div className="bg-ws-base-white py-10 px-6 space-y-6 shadow-xl rounded-b-xl">
      <div className="w-full flex items-center justify-between">
        <h2 className="text-2xl lg:text-4xl font-medium text-ws-text-primary leading-10">
          {`Current Trends for ${industry?.name ?? "Wholesale Trade"}`}
        </h2>
      </div>

      {/* ── Industry Error ── */}
      {industryError && (
        <div className="w-full p-4 bg-ws-error-50 border border-ws-error-200 rounded-lg">
          <p className="text-sm text-ws-error-700">{industryError}</p>
        </div>
      )}

      {/* ── Industry Overview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
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
                infoCircleClass=""
                tooltipText={card.tooltipText}
                descriptionText={card.descriptionText(industryOverview)}
                placements="top"
              />
            ))}
          </>
        )}
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-2 gap-6 w-full">
        {isLoadingCards ? (
          <>
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
          </>
        ) : (
          <>
            {benchmarkCardsConfigR2.map(card => (
              <StaticCard
                key={card.id}
                title={card.title(industryOverview)}
                titleClass="text-sm font-medium text-ws-text-tertiary"
                itemAlign="between"
                count={card.count(industryOverview)}
                countClass={card.countClass(industryOverview)}
                infoIcon={false}
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
            <p className="text-base text-ws-text-primary w-full mt-2">
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
                {turnoverCardsConfigFinch.map(card => (
                  <TurnoverRateCard
                    key={card.id}
                    title={card.title}
                    titleQatar={card.titleQatar}
                    sections={card.sections}
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
          <span className="text-ws-text-primary mr-1">Source:</span> Bureau of Labor Statistics Job
          Openings and Labor Turnover Survey
        </div>
      </div>

      {/* ── Area Median Wage ── */}
      <div className="w-full flex flex-col bg-ws-light-teal-25 border border-ws-border-primary rounded-xl py-8 px-6">
        <div className="w-full flex items-start xl:items-center justify-between flex-col xl:flex-row">
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
          <div className="flex flex-col items-start w-full lg:w-auto shrink-0 mt-4 xl:mt-0 lg:min-w-71">
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
            <>
              <SalaryHourlySkeleton />
            </>
          ) : (
            <SalaryHourlyFinchChart
              salaryData={salaryData}
              hourlyData={hourlyData}
              sourceAttribution={`Source: BLS, ${selectedWageState?.year}`}
            />
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 w-full mt-4">
            {isLoadingCards ? (
              <>
                <WagesCardSkeleton />
                <WagesCardSkeleton />
                <WagesCardSkeleton />
                <WagesCardSkeleton />
              </>
            ) : (
              <>
                {dynamicSalaryCardsConfig.map(card => (
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

      {/* ── Housing Burden ── */}
      <div className="w-full flex flex-col bg-ws-light-teal-25 border border-ws-border-primary rounded-xl py-8 px-6">
        <div className="w-full flex items-start xl:items-center justify-between flex-col xl:flex-row">
          <div className="space-y-1">
            <h3 className="text-2xl lg:text-4xl font-medium text-ws-text-primary">
              Housing Burden
            </h3>
          </div>
          <div className="flex flex-col items-start w-full lg:w-auto shrink-0 mt-4 xl:mt-0 lg:min-w-71">
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
          <h3 className="text-base font-semibold text-ws-text-primary">
            Your workers residing in Manchester, New Hampshire are likely financially burdened -
            meaning workers likely spend a large portion of their wages on housing and
            transportation
          </h3>
          <p className="text-base mt-4 text-ws-text-primary">
            The concept of rent (or housing cost) burden applies to both renters and homeowners, but
            it's calculated a bit differently for each. Both renters and homeowners can be
            housing-cost burdened; the main difference is what expenses are counted, not the income
            thresholds.
          </p>
        </div>
        <div className="my-4">
          <h2 className="text-xl font-semibold text-ws-text-primary mb-1">
            Housing Cost Burdened Owners
          </h2>
          {/* This is require if client want to add quarter and year */}
          {/* <p className="text-sm font-medium text-ws-text-primary">{ownersPeriodLabel}</p> */}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
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
                  sections={card.sections}
                />
              ))}
            </>
          )}
        </div>
        <div className="my-4">
          <h2 className="text-xl font-semibold text-ws-text-primary mb-1">
            Housing Cost Burdened Renters
          </h2>
          {/* This is require if client want to add quarter and year */}
          {/* <p className="text-sm font-medium text-ws-text-primary">{rentersPeriodLabel}</p> */}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
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
                  sections={card.sections}
                />
              ))}
            </>
          )}
          <p className="text-xs text-ws-text-tertiary mt-2">
            <span className="font-semibold">Source:</span> U.S. Census Bureau, 5-Year American
            Community Survey
          </p>
        </div>
        <div className="w-full">
          <div className="w-full flex items-start xl:items-center justify-between mt-8 flex-col xl:flex-row border-t border-ws-border-primary pt-8">
            <div className="space-y-1 w-full">
              <h3 className="text-2xl font-medium text-ws-text-primary">
                Working Class Housing Cost Burden
              </h3>
              <p className="max-w-3xl text-base text-ws-text-secondary mt-2">
                In Manchester, New Hampshire, working class residents are increasingly stretched by
                rising rents that have outpaced wage growth, with many households spending well
                above the recommended 30 percent of their income just to keep a roof over their
                heads.
              </p>
              <p className="text-xs text-ws-text-tertiary mt-2">
                <span className="font-semibold">Source:</span> U.S. Census Bureau, 5-Year American
                Community Survey
              </p>
            </div>
            <div className="flex flex-col items-start w-full lg:w-auto shrink-0 mt-4 xl:mt-0 lg:min-w-71">
              <Label className="text-ws-text-secondary flex mb-1.5">Zip Code</Label>
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
          <span className="font-semibold">Source:</span> U.S. Census Bureau, 5-Year American
          Community Survey
        </p>
      </div>
      <GetInTouchModal
        isOpen={isGetInTouchModalOpen}
        onClose={() => setIsGetInTouchModalOpen(false)}
      />
    </div>
  );
}

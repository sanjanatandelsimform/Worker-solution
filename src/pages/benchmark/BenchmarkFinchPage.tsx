"use client";
import { useState } from "react";
import StaticCard from "../recommendations/StaticCard";
import { Select } from "@/components/base/select/select";
import { IncomeDistributionChart } from "./CostBurdenBarChart";
import { GetInTouchModal } from "@/components/modals/GetInTouchModal";
import { useAppSelector } from "@/store/hooks";
import {
  selectIndustryOverviewData,
  selectIndustryZipCodes,
  selectIndustryData,
  selectIndustryHousingData,
  selectIndustryAreaMedianWage,
  selectIndustryTurnOverRate,
} from "@/store/selectors/industrySelectors";
import {
  selectDashboardData,
} from "@/store/selectors/dashboardSelectors";
import { useIndustry } from "@/hooks/useIndustry";
import {
  formatCurrency,
  formatCurrencyWithCents,
  formatPercentage,
} from "@/utils/formatters";
import { Label } from "@/components/base/input/label";
import TurnoverRateCard from "./TurnoverRateCard";
import { GlobeIcon } from "@/assets/icons/Globe";
import { DollarIcon } from "@/assets/icons/DollarIcon";
import { CurrencyStackIcon } from "@/assets/icons/CurrencyStackIcon";
import ProgressCard from "./ProgressCard";
import SalaryHourlyFinchChart from "./SalaryHourlyCharts/SalaryHourlyChartsFinch/SalaryHourlyComparisonChart";
import { TimerIcon } from "@/assets/icons/TimerIcon";
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
    title: (_io: unknown) => "Turnover Rate",
    count: (io: unknown) => {
      const overview = io as Record<string, unknown> | null;
      const rate = (overview?.turnoverRate as Record<string, unknown>)?.rate;
      // return rate != null ? formatPercentage(rate as number) : "N/A";
    },
    tooltipText: "Industry average employee turnover rate",
    descriptionText: (_io: unknown) => "Industry Average",
    countClass: (_io: unknown) => "text-3xl font-semibold text-ws-text-primary",
  },
  {
    id: "avg-turnover",
    title: (_io: unknown) => "Average Turnover",
    count: (io: unknown) => {
      const overview = io as Record<string, unknown> | null;
      const avg = overview?.avgTurnover;
      return avg != null ? String(avg) : "N/A";
    },
    tooltipText: "Average number of employees who leave annually",
    descriptionText: (_io: unknown) => "Industry Average",
    countClass: (_io: unknown) => "text-3xl font-semibold text-ws-text-primary",
  },
  {
    id: "avg-cost-of-turnover",
    title: (_io: unknown) => "Avg. Cost of Turnover",
    count: (io: unknown) => {
      const overview = io as Record<string, unknown> | null;
      const cost = overview?.avgCostOfTurnover;
      return cost != null ? formatCurrency(cost as number) : "N/A";
    },
    tooltipText: "Average cost per employee turnover event",
    descriptionText: (_io: unknown) => "Industry Average",
    countClass: (_io: unknown) => "text-3xl font-semibold text-ws-text-primary",
  },
];

const benchmarkCardsConfigR2: BenchmarkCardConfig[] = [
  {
    id: "hire-rate-y-o-y",
    title: (data: unknown) => {
      const d = data as Record<string, unknown> | null;
      const rates = d?.rates as Record<string, unknown> | null;
      return rates?.hire != null ? "Hire Rate y-o-y" : "Hire Rate y-o-y";
    },
    count: (data: unknown) => {
      const d = data as Record<string, unknown> | null;
      const rates = d?.rates as Record<string, unknown> | null;
      const hire = rates?.hire;
      // return hire != null ? formatPercentage(hire as number) : "N/A";
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
    title: (data: unknown) => {
      const d = data as Record<string, unknown> | null;
      const rates = d?.rates as Record<string, unknown> | null;
      return rates?.seperation != null ? "Separation Rate y-o-y" : "Separation Rate y-o-y";
    },
    count: (data: unknown) => {
      const d = data as Record<string, unknown> | null;
      const rates = d?.rates as Record<string, unknown> | null;
      const sep = rates?.seperation;
      // return sep != null ? formatPercentage(sep as number) : "N/A";
    },
    tooltipText: "Separation Rate",
    descriptionText: () =>
      "Industry specific separation rate metrics are calculated from US Census Bureau QWI data sources",
    countClass: (data: unknown) => {
      const d = data as Record<string, unknown> | null;
      const rates = d?.rates as Record<string, unknown> | null;
      return rates?.seperation == null
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

const turnoverCardsConfigFinch: TurnoverRateCardConfig[] = [
  {
    id: "turnover-rate",
    title: "Industry Turnover Rate",
    titleQatar: "Q4 2023",
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
      {
        sectionTitle: "YOUR COMPANY",
        columnsCount: 2 as const,
        cardsData: [
          {
            title: "Voluntary",
            statics: formatPercentage(16.8),
            staticsPoints: "+23pts",
            staticsPointsState: true,
            progressValue: 16.8,
            customBarColor: "bg-ws-light-teal-400",
          },
          {
            title: "Company Average",
            statics: formatPercentage(83.2),
            staticsPoints: "-23pts",
            staticsPointsState: true,
            progressValue: 83.2,
            customBarColor: "bg-ws-navy-600",
          },
        ],
      },
    ],
    industryText: undefined,
    industryBoldText: "$4,149.2M",
    sourceText: "Source: ",
    sourceBoldText: "Lorem ipsum sit amet dolor",
    className: "col-span-1",
    sourceClass: "mt-0",
  },
  {
    id: "separation-rate",
    title: "Industry Separation Rate",
    titleQatar: "Q4 2023",
    sections: [
      {
        sectionTitle: "INDUSTRY AVERAGE",
        columnsCount: 2 as const,
        cardsData: [
          {
            title: "Separation",
            statics: formatPercentage(7.7),
            progressValue: 7.7,
            customBarColor: "bg-ws-light-teal-400",
          },
          {
            title: "Hiring Rate",
            statics: formatPercentage(11.1),
            progressValue: 11.1,
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
            statics: formatPercentage(2.7),
            staticsPoints: "+5pts",
            staticsPointsState: true,
            progressValue: 2.7,
            customBarColor: "bg-ws-light-teal-400",
          },
          {
            title: "Hiring Rate",
            statics: formatPercentage(8.1),
            staticsPoints: "-3pts",
            staticsPointsState: true,
            progressValue: 8.1,
            customBarColor: "bg-ws-navy-600",
          },
        ],
      },
    ],
    industryText: undefined,
    industryBoldText: "$4,149.2M",
    sourceText: "Source: ",
    sourceBoldText: "Lorem ipsum sit amet dolor",
    className: "col-span-1",
    sourceClass: "mt-0",
  },
];

const housingBurdenOwnersConfigFinch: ProgressCardFinchConfig[] = [
  {
    id: "burdened-owners",
    title: "Burdened Owners",
    showInfoIcon: true,
    tooltipText: "Households spending 30% or more of gross income on housing costs",
    sections: [
      {
        columnsCount: 1 as const,
        items: [
          {
            label: "Metro Area",
            percentage: 16.2,
            progressColor: "bg-ws-navy-600",
          },
          {
            label: "Your employees",
            percentage: 19.5,
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
    tooltipText: "Households spending 30% or more of gross income on housing costs",
    sections: [
      {
        columnsCount: 1 as const,
        items: [
          {
            label: "Metro Area",
            percentage: 16.2,
            progressColor: "bg-ws-navy-600",
          },
          {
            label: "Your employees",
            percentage: 19.5,
            progressColor: "bg-ws-navy-200",
          },
        ],
      },
    ],
  },
];

const housingBurdenRentersConfigFinch: ProgressCardFinchConfig[] = [
  {
    id: "burdened-renters",
    title: "Burdened Renters",
    showInfoIcon: true,
    tooltipText: "Households spending 30% or more of gross income on housing costs",
    sections: [
      {
        columnsCount: 1 as const,
        items: [
          {
            label: "Metro Area",
            percentage: 16.2,
            progressColor: "bg-ws-light-teal-600",
          },
          {
            label: "Your employees",
            percentage: 19.5,
            progressColor: "bg-ws-light-teal-400",
          },
        ],
      },
    ],
  },
  {
    id: "severely-burdened-renters",
    title: "Severely Burdened Renters",
    showInfoIcon: true,
    tooltipText: "Households spending 30% or more of gross income on housing costs",
    sections: [
      {
        columnsCount: 1 as const,
        items: [
          {
            label: "Metro Area",
            percentage: 16.2,
            progressColor: "bg-ws-light-teal-600",
          },
          {
            label: "Your employees",
            percentage: 19.5,
            progressColor: "bg-ws-light-teal-400",
          },
        ],
      },
    ],
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

export default function BenchmarkFinchPage() {
  const [isGetInTouchModalOpen, setIsGetInTouchModalOpen] = useState(false);
  const [selectedGraphType, setSelectedGraphType] = useState<"owners" | "renters">("renters");
  const [selectedWageZip, setSelectedWageZip] = useState<string | null>(null);
  const [selectedHousingZipState, setSelectedHousingZipState] = useState<string | null>(null);

  // Use industry hook for conditional API fetch and loading state
  const { isLoading: isLoadingCards, error: industryError } = useIndustry();

  // Get industry data from Redux store via industry selectors
  const industryOverview = useAppSelector(selectIndustryOverviewData);
  const zipCodes = useAppSelector(selectIndustryZipCodes);
  const industry = useAppSelector(selectIndustryData);
  const housingBurdenData = useAppSelector(selectIndustryHousingData);
  const areaMedianWage = useAppSelector(selectIndustryAreaMedianWage);
  const industryTurnOverRate = useAppSelector(selectIndustryTurnOverRate);

  // Get company-specific data from dashboard store (Finch page shows company comparison)
  const dashboardData = useAppSelector(selectDashboardData);

  // ── Area Median Wage: derive zip select items and selected state data ──
  const wageZipItems = (areaMedianWage?.stateData ?? []).map(s => ({
    label: s.city,
    id: s.zipcode,
  }));

  const activeWageZip = selectedWageZip ?? areaMedianWage?.stateData?.[0]?.zipcode ?? null;

  const selectedWageState =
    areaMedianWage?.stateData?.find(s => s.zipcode === activeWageZip) ??
    areaMedianWage?.stateData?.[0] ??
    null;

  // Salary and Hourly comparison data (Finch page includes yourCompanyAverage from dashboard)
  const salaryData = {
    industryAverage: selectedWageState?.graph?.state?.salary ?? 0,
    yourCompanyAverage: areaMedianWage?.companyGraph?.salary ?? 0,
    nationalAverage: selectedWageState?.graph?.national?.salary ?? 0,
  };
  const hourlyData = {
    industryAverage: selectedWageState?.graph?.state?.hourly ?? 0,
    yourCompanyAverage: areaMedianWage?.companyGraph?.hourly ?? 0,
    nationalAverage: selectedWageState?.graph?.national?.hourly ?? 0,
  };

  // Dynamic salary cards config based on selected state (Finch page has 4 cards including company median)
  const dynamicSalaryCardsConfig: SalaryCardConfig[] = [
    {
      id: "company-median-hourly-wages",
      title: "Company's Median Hourly Wages",
      icon: <TimerIcon className="size-5 text-ws-gray-500" />,
      count: areaMedianWage?.companyMedianHourlyWage != null
        ? formatCurrencyWithCents(areaMedianWage.companyMedianHourlyWage)
        : "N/A",
    },
    {
      id: "median-living-wage",
      title: selectedWageState
        ? `${selectedWageState.city} Median Living Wage`
        : "Median Living Wage",
      icon: <DollarIcon className="size-5 text-ws-gray-500" />,
      count: selectedWageState
        ? formatCurrencyWithCents(selectedWageState.medianLivingWage)
        : "N/A",
    },
    {
      id: "average-salary",
      title: selectedWageState
        ? `${selectedWageState.city} Average Salary, ${selectedWageState.avgSalary?.year ?? ""}`
        : "Average Salary",
      icon: <CurrencyStackIcon className="size-5 text-ws-gray-500" />,
      count: selectedWageState?.avgSalary?.salary
        ? formatCurrency(selectedWageState.avgSalary.salary)
        : "N/A",
    },
    {
      id: "national-average",
      title: "National Average Salary",
      icon: <GlobeIcon className="size-5 text-ws-gray-500" />,
      count: areaMedianWage?.nationalAvgSalary
        ? formatCurrency(areaMedianWage.nationalAvgSalary)
        : "N/A",
    },
  ];

  // ── Turnover cards config (dynamic from industry API) ──
  const turnoverCardsConfigFinch: TurnoverRateCardConfig[] = [
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
              statics: formatPercentage(industryTurnOverRate?.turnOverRate?.industry?.involuntary ?? 0),
              progressValue: industryTurnOverRate?.turnOverRate?.industry?.involuntary ?? 0,
              customBarColor: "bg-ws-light-teal-400",
            },
            {
              title: "Voluntary",
              statics: formatPercentage(industryTurnOverRate?.turnOverRate?.industry?.voluntary ?? 0),
              progressValue: industryTurnOverRate?.turnOverRate?.industry?.voluntary ?? 0,
              customBarColor: "bg-ws-navy-600",
            },
          ],
        },
        {
          sectionTitle: "YOUR COMPANY",
          columnsCount: 2 as const,
          cardsData: [
            {
              title: "Voluntary",
              statics: formatPercentage(industryTurnOverRate?.turnOverRate?.company?.voluntary ?? 0),
              staticsPoints: (() => {
                const ind = industryTurnOverRate?.turnOverRate?.industry?.voluntary ?? 0;
                const comp = industryTurnOverRate?.turnOverRate?.company?.voluntary ?? 0;
                const diff = comp - ind;
                return diff >= 0 ? `+${Math.abs(Math.round(diff))}pts` : `-${Math.abs(Math.round(diff))}pts`;
              })(),
              staticsPointsState: true,
              progressValue: industryTurnOverRate?.turnOverRate?.company?.voluntary ?? 0,
              customBarColor: "bg-ws-light-teal-400",
            },
            {
              title: "Company Average",
              statics: formatPercentage(industryTurnOverRate?.turnOverRate?.company?.involuntary ?? 0),
              staticsPoints: (() => {
                const ind = industryTurnOverRate?.turnOverRate?.industry?.involuntary ?? 0;
                const comp = industryTurnOverRate?.turnOverRate?.company?.involuntary ?? 0;
                const diff = comp - ind;
                return diff >= 0 ? `+${Math.abs(Math.round(diff))}pts` : `-${Math.abs(Math.round(diff))}pts`;
              })(),
              staticsPointsState: true,
              progressValue: industryTurnOverRate?.turnOverRate?.company?.involuntary ?? 0,
              customBarColor: "bg-ws-navy-600",
            },
          ],
        },
      ],
      industryText: undefined,
      industryBoldText: "$4,149.2M",
      sourceText: "Source: ",
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
              title: "Separation",
              statics: formatPercentage(industryTurnOverRate?.seperationRate?.industry?.seperation ?? 0),
              progressValue: industryTurnOverRate?.seperationRate?.industry?.seperation ?? 0,
              customBarColor: "bg-ws-light-teal-400",
            },
            {
              title: "Hiring Rate",
              statics: formatPercentage(industryTurnOverRate?.seperationRate?.industry?.hiring ?? 0),
              progressValue: industryTurnOverRate?.seperationRate?.industry?.hiring ?? 0,
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
              statics: formatPercentage(industryTurnOverRate?.seperationRate?.company?.seperation ?? 0),
              staticsPoints: (() => {
                const ind = industryTurnOverRate?.seperationRate?.industry?.seperation ?? 0;
                const comp = industryTurnOverRate?.seperationRate?.company?.seperation ?? 0;
                const diff = comp - ind;
                return diff >= 0 ? `+${Math.abs(Math.round(diff))}pts` : `-${Math.abs(Math.round(diff))}pts`;
              })(),
              staticsPointsState: true,
              progressValue: industryTurnOverRate?.seperationRate?.company?.seperation ?? 0,
              customBarColor: "bg-ws-light-teal-400",
            },
            {
              title: "Hiring Rate",
              statics: formatPercentage(industryTurnOverRate?.seperationRate?.company?.hiring ?? 0),
              staticsPoints: (() => {
                const ind = industryTurnOverRate?.seperationRate?.industry?.hiring ?? 0;
                const comp = industryTurnOverRate?.seperationRate?.company?.hiring ?? 0;
                const diff = comp - ind;
                return diff >= 0 ? `+${Math.abs(Math.round(diff))}pts` : `-${Math.abs(Math.round(diff))}pts`;
              })(),
              staticsPointsState: true,
              progressValue: industryTurnOverRate?.seperationRate?.company?.hiring ?? 0,
              customBarColor: "bg-ws-navy-600",
            },
          ],
        },
      ],
      industryText: undefined,
      industryBoldText: "$4,149.2M",
      sourceText: "Source: ",
      sourceBoldText: "Lorem ipsum sit amet dolor",
      className: "col-span-1",
      sourceClass: "mt-0",
    },
  ];

  // ── Housing Burden: zip items, selection, and derived data ──
  const housingZipItems = (housingBurdenData ?? []).map(h => ({
    label: h.city,
    id: h.zipcode,
  }));

  const activeHousingZip = selectedHousingZipState ?? housingBurdenData?.[0]?.zipcode ?? null;

  const selectedHousingData =
    housingBurdenData?.find(h => h.zipcode === activeHousingZip) ??
    housingBurdenData?.[0] ??
    null;

  // Dynamic owners progress cards (Finch page has Metro Area + Your employees)
  const dynamicHousingBurdenOwnersConfig: ProgressCardFinchConfig[] = [
    {
      id: "burdened-owners",
      title: "Burdened Owners",
      showInfoIcon: true,
      tooltipText: "Households spending 30% or more of gross income on housing costs",
      sections: [
        {
          columnsCount: 1 as const,
          items: [
            {
              label: "Metro Area",
              percentage: selectedHousingData?.owners?.burdened?.metroArea ?? 0,
              progressColor: "bg-ws-navy-600",
            },
            {
              label: "Your employees",
              percentage: selectedHousingData?.owners?.burdened?.yourEmployees ?? 0,
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
      tooltipText: "Spends 50% or more of its gross income on rent and utilities.",
      sections: [
        {
          columnsCount: 1 as const,
          items: [
            {
              label: "Metro Area",
              percentage: selectedHousingData?.owners?.severelyBurdened?.metroArea ?? 0,
              progressColor: "bg-ws-navy-600",
            },
            {
              label: "Your employees",
              percentage: selectedHousingData?.owners?.severelyBurdened?.yourEmployees ?? 0,
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
      tooltipText: "Households spending 30% or more of gross income on housing costs",
      sections: [
        {
          columnsCount: 1 as const,
          items: [
            {
              label: "Metro Area",
              percentage: selectedHousingData?.renters?.burdened?.metroArea ?? 0,
              progressColor: "bg-ws-light-teal-600",
            },
            {
              label: "Your employees",
              percentage: selectedHousingData?.renters?.burdened?.yourEmployees ?? 0,
              progressColor: "bg-ws-light-teal-400",
            },
          ],
        },
      ],
    },
    {
      id: "severely-burdened-renters",
      title: "Severely Burdened Renters",
      showInfoIcon: true,
      tooltipText: "Spends 50% or more of its gross income on rent and utilities.",
      sections: [
        {
          columnsCount: 1 as const,
          items: [
            {
              label: "Metro Area",
              percentage: selectedHousingData?.renters?.severelyBurdened?.metroArea ?? 0,
              progressColor: "bg-ws-light-teal-600",
            },
            {
              label: "Your employees",
              percentage: selectedHousingData?.renters?.severelyBurdened?.yourEmployees ?? 0,
              progressColor: "bg-ws-light-teal-400",
            },
          ],
        },
      ],
    },
  ];

  // Dynamic cost burden cards (working class data)
  const dynamicCostBurdenCardsConfig: CostBurdenCardConfig[] = [
    {
      id: "home-ownership-rate",
      title: "Home Ownership Rate",
      count:
        selectedHousingData?.workingClass?.homeOwnershipRate != null
          ? `${selectedHousingData.workingClass.homeOwnershipRate}%`
          : "N/A",
      tooltipText: "Home Ownership Rate",
      descriptionText: "U.S. Census Bureau, 5-Year American Community Survey",
      countClass: "mt-2 text-3xl font-semibold text-ws-text-primary",
    },
    {
      id: "median-home-value",
      title: "Median Home Value",
      count:
        selectedHousingData?.workingClass?.medianHomeValue != null
          ? formatCurrency(selectedHousingData.workingClass.medianHomeValue)
          : "N/A",
      tooltipText: "Median Home Value",
      descriptionText: "U.S. Census Bureau, 5-Year American Community Survey",
      countClass: "mt-2 text-3xl font-semibold text-ws-text-primary",
    },
    {
      id: "median-rent",
      title: "Median Rent",
      count:
        selectedHousingData?.workingClass?.medianRent != null
          ? formatCurrency(selectedHousingData.workingClass.medianRent)
          : "N/A",
      tooltipText: "Median Rent",
      descriptionText: "U.S. Census Bureau, 5-Year American Community Survey",
      countClass: "mt-2 text-3xl font-semibold text-ws-text-primary",
    },
  ];

  // Transform working class graph data for IncomeDistributionChart
  const workingClassHousingGraph = (() => {
    try {
      const graphData = selectedHousingData?.workingClass?.graph;
      if (!graphData || !Array.isArray(graphData)) return [];

      return graphData.map(item => ({
        incomeCategory: item.incomeCategory,
        label: item.label,
        range: item.range,
        burdened: typeof item.burdened === "number" ? item.burdened : 0,
        severelyBurdened: typeof item.severelyBurdened === "number" ? item.severelyBurdened : 0,
      }));
    } catch {
      return [];
    }
  })();

  // Derive period string from housing data
  const ownersPeriod = selectedHousingData?.owners?.period;
  const rentersPeriod = selectedHousingData?.renters?.period;
  const ownersPeriodLabel = ownersPeriod
    ? `Q${ownersPeriod.quarter} ${ownersPeriod.year}`
    : "Q4 2023";
  const rentersPeriodLabel = rentersPeriod
    ? `Q${rentersPeriod.quarter} ${rentersPeriod.year}`
    : "Q4 2023";

  return (
    <div className="bg-ws-base-white py-10 px-6 space-y-6 shadow-xl rounded-b-xl">
      <div className="w-full flex items-center justify-between">
        <h2 className="text-2xl lg:text-4xl font-medium text-ws-text-primary leading-10">
          {`Current Trends for ${industry?.name ?? "Wholesale Trade"}`}
        </h2>
      </div>

      {/* ── Industry Error ── */}
      {industryError && (
        <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{industryError}</p>
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
                    industryText={
                      industryOverview?.turnoverRate?.rate
                        ? "Industry-wide cost of turnover:"
                        : undefined
                    }
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
        <div className="w-full flex items-center justify-between flex-col xl:flex-row">
          <div className="space-y-1">
            <h3 className="text-2xl lg:text-4xl font-medium text-ws-text-primary">
              {selectedWageState
                ? `Area Median Wage: ${selectedWageState.city}`
                : "Area Median Wage"}
            </h3>
            <p className="text-base text-ws-text-primary w-full mt-2">
              Compare your wages with median wages for salaried and hourly employees for the selected
              geography.
            </p>
          </div>
          <div className="flex flex-col items-start w-full lg:w-auto shrink-0 mt-4 xl:mt-0">
            <Label className="text-sm font-medium text-ws-text-secondary flex mb-1.5">
              Metropolitan Area <span className="text-ws-error-600">*</span>
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
            <p className="text-xs text-ws-text-tertiary mt-1">This is a hint text to help user.</p>
          </div>
        </div>
        <div className="w-full mt-8">
          {isLoadingCards ? (
            <>
              <SalaryHourlySkeleton />
            </>
          ) : (
            <SalaryHourlyFinchChart salaryData={salaryData} hourlyData={hourlyData} />
          )}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 w-full mt-4">
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
        <div className="w-full flex items-start justify-between flex-col xl:flex-row">
          <div className="space-y-1">
            <h3 className="text-2xl lg:text-4xl font-medium text-ws-text-primary">
              Housing Burden
            </h3>
          </div>
          <div className="flex flex-col items-start w-full lg:w-auto shrink-0 mt-4 xl:mt-0">
            <Label className="text-sm font-medium text-ws-text-secondary flex mb-1.5">
              Metropolitan Area <span className="text-ws-error-600">*</span>
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
            <p className="text-xs text-ws-text-tertiary mt-1">This is a hint text to help user.</p>
          </div>
        </div>
        <div className="w-full mt-8">
          <h3 className="text-base font-bold text-ws-text-primary">
            {selectedHousingData
              ? `Your workers residing in ${selectedHousingData.city} are likely financially burdened - meaning workers likely spend a large portion of their wages on housing and transportation`
              : "Your workers are likely financially burdened - meaning workers likely spend a large portion of their wages on housing and transportation"}
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
          <p className="text-sm font-medium text-ws-text-primary">{ownersPeriodLabel}</p>
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
          <p className="text-sm font-medium text-ws-text-primary">{rentersPeriodLabel}</p>
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
        </div>
        <div>
          <p className="text-xs text-ws-text-tertiary mt-6">
            <span className="font-semibold">Source:</span> Lorem Ipsum dolor
          </p>
          <div className="w-full flex items-center justify-between mt-8 flex-col xl:flex-row">
            <div className="space-y-1 w-full">
              <h3 className="text-2xl font-medium text-ws-text-primary">
                Working Class Housing Cost Burden
              </h3>
              <p className="max-w-3xl text-base text-ws-text-secondary mt-2">
                {selectedHousingData
                  ? `In ${selectedHousingData.city}, working class residents are increasingly stretched by rising rents that have outpaced wage growth, with many households spending well above the recommended 30 percent of their income just to keep a roof over their heads.`
                  : "Working class residents are increasingly stretched by rising rents that have outpaced wage growth, with many households spending well above the recommended 30 percent of their income just to keep a roof over their heads."}
              </p>
              <p className="text-xs text-ws-text-tertiary mt-6">
                <span className="font-semibold">Source:</span> Lorem Ipsum dolor
              </p>
            </div>
            <div className="flex flex-col items-start w-full lg:w-auto shrink-0 mt-4 xl:mt-0">
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
                {dynamicCostBurdenCardsConfig.map(card => (
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
          <span className="font-semibold">Source:</span> U.S. Census Bureau, 5-Year American
          Community Survey
        </p>
      </div>
      <div className="w-full">
        <p className="text-xs text-ws-text-primary">
          This product provides informational insights and recommendations based on the data you
          share and industry benchmarks. It does not provide legal, financial, tax, or benefits
          advice, and recommendations are not guarantees of outcomes or results. Actual results may
          vary, and you are responsible for evaluating and implementing any recommendations based on
          your organization's specific circumstances. Read our{" "}
          <Link to="/terms-page" className="text-ws-light-teal-850 underline">
            Terms & Conditions{" "}
          </Link>
          and{" "}
          <Link to="/privacy-policy" className="text-ws-light-teal-850 underline">
            Privacy Policy
          </Link>
        </p>
      </div>
      <GetInTouchModal
        isOpen={isGetInTouchModalOpen}
        onClose={() => setIsGetInTouchModalOpen(false)}
      />
    </div>
  );
}

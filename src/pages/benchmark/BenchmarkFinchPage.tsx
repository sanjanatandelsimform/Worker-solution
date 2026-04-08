"use client";
import { useState } from "react";
// import { Button } from "@/components/base/buttons/button";
import StaticCard from "../recommendations/StaticCard";
import { Select } from "@/components/base/select/select";
import { IncomeDistributionChart } from "./CostBurdenBarChart";
// import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
// import { InfoCircle } from "@untitledui/icons";
import { GetInTouchModal } from "@/components/modals/GetInTouchModal";
import { useAppSelector } from "@/store/hooks";
import {
  selectIndustryOverview,
  selectZipCodes,
  selectDashboardData,
} from "@/store/selectors/dashboardSelectors";
import { formatPercentage } from "@/utils/formatters";
import { Label } from "@/components/base/input/label";
import TurnoverRateCard from "./TurnoverRateCard";
import { GlobeIcon } from "@/assets/icons/Globe";
import { DollarIcon } from "@/assets/icons/DollarIcon";
import { CurrencyStackIcon } from "@/assets/icons/CurrencyStackIcon";
import ProgressCard from "./ProgressCard";
import SalaryHourlyFinchChart from "./SalaryHourlyCharts/SalaryHourlyChartsFinch/SalaryHourlyComparisonChart";
import { TimerIcon } from "@/assets/icons/TimerIcon";
import { Link } from "react-router-dom";

export default function BenchmarkFinchPage() {
  const [isGetInTouchModalOpen, setIsGetInTouchModalOpen] = useState(false);
  const [selectedGraphType, setSelectedGraphType] = useState<"owners" | "renters">("renters");

  // Get dashboard benchmark data from Redux store
  const industryOverview = useAppSelector(selectIndustryOverview);
  const zipCodes = useAppSelector(selectZipCodes);
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
  const salaryData = { industryAverage: 31000, yourCompanyAverage: 45000, nationalAverage: 78000 };
  const hourlyData = { industryAverage: 13.5, yourCompanyAverage: 18.0, nationalAverage: 24.0 };

  return (
    <div className="bg-ws-base-white py-10 px-6 space-y-6 shadow-xl rounded-b-xl">
      <div className="w-full flex items-center justify-between">
        <h2 className="text-2xl lg:text-4xl font-medium text-ws-text-primary leading-10">
          Current Trends for Wholesale Trade
        </h2>
        {/* <Button color="secondary" onClick={() => setIsGetInTouchModalOpen(true)}>
          Share feedback
        </Button> */}
      </div>

      {/* ── Industry Overview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <StaticCard
          title="Turnover rate since Jan 2024"
          titleClass="text-sm font-medium text-ws-text-tertiary"
          itemAlign="between"
          count="2.1M"
          countClass={
            industryOverview?.turnoverRate?.rate == null
              ? "mt-2 text-sm font-medium text-ws-text-primary"
              : "mt-2 text-3xl font-semibold text-ws-text-primary"
          }
          infoIcon={true}
          infoCircleClass="text-ws-gray-400 size-5"
          tooltipText="Turnover Rate"
          descriptionText="Industry specific turnover metrics are calculated from US Census Bureau QWI data sources"
          placements="top"
        />
        <StaticCard
          //  title={`Avg Turnover since  ${industryOverview?.avgTurnover?.sinceYear}`}
          title="Avg Turnover since 2020"
          titleClass="text-sm font-medium text-ws-text-tertiary"
          itemAlign="between"
          count="40%"
          countClass={
            industryOverview?.avgTurnover?.rate == null
              ? "mt-2 text-sm font-medium text-ws-text-primary"
              : "mt-2 text-3xl font-semibold text-ws-text-primary"
          }
          infoIcon={true}
          infoCircleClass="text-ws-gray-400 size-5"
          tooltipText="Average Turnover"
          descriptionText="Average turnover metrics are calculated from US Census Bureau QWI data sources"
          placements="top"
        />
        <StaticCard
          title="Avg. Cost of Turnover"
          titleClass="text-sm font-medium text-ws-text-tertiary"
          itemAlign="between"
          count="30%"
          countClass={
            industryOverview?.avgCostOfTurnover?.amount == null
              ? "mt-2 text-sm font-medium text-ws-text-primary"
              : "mt-2 text-3xl font-semibold text-ws-text-primary"
          }
          infoIcon={true}
          infoCircleClass="text-ws-gray-400 size-5"
          tooltipText="Average Cost of Turnover"
          descriptionText={`Industry specific cost of turnover is calculated from ${industryOverview?.avgCostOfTurnover?.year || " "}`}
          placements="top"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <StaticCard
          title="Hire Rate y-o-y "
          titleClass="text-sm font-medium text-ws-text-tertiary"
          itemAlign="between"
          count="31%"
          countClass={
            industryOverview?.turnoverRate?.rate == null
              ? "mt-2 text-sm font-medium text-ws-text-primary"
              : "mt-2 text-3xl font-semibold text-ws-text-primary"
          }
          infoIcon={true}
          infoCircleClass="text-ws-gray-400 size-5"
          tooltipText="Turnover Rate"
          descriptionText="Industry specific turnover metrics are calculated from US Census Bureau QWI data sources"
          placements="top"
        />
        <StaticCard
          title="Separation Rate y-o-y"
          titleClass="text-sm font-medium text-ws-text-tertiary"
          itemAlign="between"
          count="40%"
          countClass={
            industryOverview?.turnoverRate?.rate == null
              ? "mt-2 text-sm font-medium text-ws-text-primary"
              : "mt-2 text-3xl font-semibold text-ws-text-primary"
          }
          infoIcon={true}
          infoCircleClass="text-ws-gray-400 size-5"
          tooltipText="Turnover Rate"
          descriptionText="Industry specific turnover metrics are calculated from US Census Bureau QWI data sources"
          placements="top"
        />
      </div>
      {/* ── Industry Turnover ── */}
      <div className="w-full flex flex-col items-center bg-ws-light-teal-25 border border-ws-border-primary rounded-xl py-8 px-6">
        <div className="w-full flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-4xl font-medium text-ws-text-primary">Industry Turnover</h3>
            <p className="text-base text-ws-text-primary w-full mt-2">Lorem Ipsum</p>
          </div>
        </div>
        <div className="w-full flex mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            <TurnoverRateCard
              title="Industry Turnover Rate"
              titleQatar="Q4 2023"
              sections={[
                {
                  sectionTitle: "INDUSTRY AVERAGE",
                  columnsCount: 2,
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
                  columnsCount: 2,
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
              ]}
              industryText={
                industryOverview?.turnoverRate?.rate ? "Industry-wide cost of turnover:" : undefined
              }
              industryBoldText="$4,149.2M"
              sourceText="Source: "
              sourceBoldText="Lorem ipsum sit amet dolor"
              className="col-span-1"
              sourceClass="mt-0"
            />
            <TurnoverRateCard
              title="Industry Separation Rate"
              titleQatar="Q4 2023"
              sections={[
                {
                  sectionTitle: "INDUSTRY AVERAGE",
                  columnsCount: 2,
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
                  columnsCount: 2,
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
              ]}
              industryText={
                industryOverview?.turnoverRate?.rate ? "Industry-wide cost of turnover:" : undefined
              }
              industryBoldText="$4,149.2M"
              sourceText="Source: "
              sourceBoldText="Lorem ipsum sit amet dolor"
              className="col-span-1"
              sourceClass="mt-0"
            />
          </div>
        </div>
        <div className="text-xs w-full flex items-start mt-8 text-ws-text-tertiary"><span className="text-ws-text-primary mr-1">Source:</span> Lorem Ipsum dolor</div>
      </div>

      <div className="w-full flex flex-col bg-ws-light-teal-25 border border-ws-border-primary rounded-xl py-8 px-6">
        <div className="w-full flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-4xl font-medium text-ws-text-primary">
              Area Median Wage: Manchester, NH
            </h3>
            <p className="text-base text-ws-text-primary w-full  mt-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce quis felis venenatis.
            </p>
          </div>
          <div className="flex flex-col items-start w-full lg:w-auto shrink-0">
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
          <SalaryHourlyFinchChart salaryData={salaryData} hourlyData={hourlyData} />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full mt-4">
            <StaticCard
              classess="border-ws-border-secondary"
              title="Company's Median Hourly Wages"
              titleClass="text-ws-text-tertiary text-sm"
              countIcon={<TimerIcon className="size-5 text-ws-gray-400" />}
              count="$14.03"
              countClass="text-ws-light-teal-900 text-3xl xl:text-4xl font-medium mt-6"
            />
            <StaticCard
              classess="border-ws-gray-40"
              title="[State] Median Living Wage"
              titleClass="text-ws-text-tertiary text-sm"
              countIcon={<DollarIcon className="size-5 text-ws-gray-300" />}
              count="$24.03"
              countClass="text-ws-light-teal-900  text-3xl xl:text-4xl font-medium mt-6"
            />
            <StaticCard
              classess="border-ws-gray-40"
              title="[State} Average Salary, 2023"
              titleClass="text-ws-text-tertiary text-sm"
              countIcon={<CurrencyStackIcon className="size-5 text-ws-gray-300" />}
              count="$92,377"
              countClass="text-ws-light-teal-900  text-3xl xl:text-4xl font-medium mt-6"
            />
            <StaticCard
              classess="border-ws-gray-40"
              title="National Average Salary"
              titleClass="text-ws-text-tertiary text-sm"
              countIcon={<GlobeIcon className="size-5 text-ws-gray-300" />}
              count="$120,000"
              countClass="text-ws-light-teal-900  text-3xl xl:text-4xl font-medium mt-6"
            />
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col bg-ws-light-teal-25 border border-ws-border-primary rounded-xl py-8 px-6">
        <div className="w-full flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-4xl font-medium text-ws-text-primary">Housing Burden</h3>
          </div>
          <div className="flex flex-col items-start w-full lg:w-auto shrink-0">
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
        <div className="flex items-center justify-between gap-4">
          <ProgressCard
            title="Burdened Owners"
            showInfoIcon={true}
            tooltipText="Households spending 30% or more of gross income on housing costs"
            sections={[
              {
                columnsCount: 1,
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
            ]}
          />
          <ProgressCard
            title="Severely Burdened Owners"
            showInfoIcon={true}
            tooltipText="Households spending 30% or more of gross income on housing costs"
            sections={[
              {
                columnsCount: 1,
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
            ]}
          />
        </div>
        <div className="my-4">
          <h2 className="text-xl font-semibold text-ws-text-primary mb-1">
            Housing Cost Burdened Renters
          </h2>
          <p className="text-sm font-medium text-ws-text-primary">Q4 2023</p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <ProgressCard
            title="Burdened Renters"
            showInfoIcon={true}
            tooltipText="Households spending 30% or more of gross income on housing costs"
            sections={[
              {
                columnsCount: 1,
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
            ]}
          />
          <ProgressCard
            title="Severely Burdened Renters"
            showInfoIcon={true}
            tooltipText="Households spending 30% or more of gross income on housing costs"
            sections={[
              {
                columnsCount: 1,
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
            ]}
          />
        </div>
        <div>
          <p className="text-xs text-ws-text-tertiary mt-6"><span className="font-semibold">Source:</span> Lorem Ipsum dolor</p>
          <div className="w-full flex items-center justify-between mt-8">
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
              <p className="text-xs text-ws-text-tertiary mt-6"><span className="font-semibold">Source:</span> Lorem Ipsum dolor</p>
            </div>
            <div className="flex flex-col items-start w-full lg:w-auto shrink-0">
              <Label className="text-ws-text-secondary flex mb-1.5">Household type <span className="text-ws-error-600">*</span></Label>
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
               <p className="text-xs text-ws-text-tertiary mt-1">This is a hint text to help user.</p>
            </div>
          </div>
          <div className="grid xl:grid-cols-3 gap-4 mt-6 flex-col lg:flex-row">
            <StaticCard
              title="Home Ownership Rate"
              titleClass="text-sm font-medium text-ws-text-tertiary"
              itemAlign="between"
              count="72%"
              countClass={
                selectedHousingData?.workingClassHousingCostBurden?.homeOwnershipRate == null
                  ? "mt-2 text-sm font-medium text-ws-text-tertiary"
                  : "mt-2 text-3xl font-semibold text-ws-text-primary"
              }
              infoIcon={true}
              infoCircleClass="text-ws-gray-70"
              tooltipText="Home Ownership Rate"
              descriptionText="U.S. Census Bureau, 5-Year American Community Survey"
              placements="top"
              classess="flex-1 bg-ws-gray-10! ring-ws-gray-40!"
            />
            <StaticCard
              title="Median Home Value"
              itemAlign="between"
              titleClass="text-sm font-medium text-ws-text-tertiary"
              count="$367,000"
              countClass={
                selectedHousingData?.workingClassHousingCostBurden?.medianHomeValue == null
                  ? "mt-2 text-sm font-medium text-ws-text-tertiary"
                  : "mt-2 text-3xl font-semibold text-ws-text-primary"
              }
              infoIcon={true}
              infoCircleClass="text-ws-gray-70"
              tooltipText="Median Home Value"
              descriptionText="U.S. Census Bureau, 5-Year American Community Survey"
              placements="top"
              classess="flex-1 bg-ws-gray-10! ring-ws-gray-40!"
            />
            <StaticCard
              title="Median Rent"
              itemAlign="between"
              titleClass="text-sm font-medium text-ws-text-tertiary"
              count="$1,423"
              countClass={
                selectedHousingData?.workingClassHousingCostBurden?.medianRent == null
                  ? "mt-2 text-sm font-medium text-ws-text-tertiary"
                  : "mt-2 text-3xl font-semibold text-ws-text-primary"
              }
              infoIcon={true}
              infoCircleClass="text-ws-gray-70"
              tooltipText="Median Rent"
              descriptionText="U.S. Census Bureau, 5-Year American Community Survey"
              placements="top"
              classess="flex-1 bg-ws-gray-10! ring-ws-gray-40!"
            />
          </div>
          {/* Chart */}
          <div className="flex-1 w-full overflow-x-auto mt-6 bg-ws-base-white p-4 rounded-xl border border-ws-border-primary">
            <IncomeDistributionChart
              data={Array.isArray(workingClassHousingGraph) ? workingClassHousingGraph : []}
            />
          </div>
        </div>
        <p className="text-xs text-ws-text-tertiary mt-6"><span className="font-semibold">Source:</span> Lorem Ipsum dolor</p>
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

"use client";
import { useState } from "react";
// import { Button } from "@/components/base/buttons/button";
import StaticCard from "../recommendations/StaticCard";
import CostCard from "./CostCard";
import { Select } from "@/components/base/select/select";
import { IncomeDistributionChart } from "./CostBurdenBarChart";
// import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
// import { InfoCircle } from "@untitledui/icons";
import { GetInTouchModal } from "@/components/modals/GetInTouchModal";
import type { Key } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  selectIndustryOverview,
  selectTurnoverMetrics,
  selectSeparationMetrics,
  selectZipCodes,
  selectIndustry,
  selectDashboardData,
  selectPrimaryAreaMedianWage,
} from "@/store/selectors/dashboardSelectors";
import { formatCurrency, formatPercentage, formatCurrencyWithCents } from "@/utils/formatters";
import { SmileFace } from "@/assets/icons/SmileFace";
import { Label } from "@/components/base/input/label";
import TurnoverRateCard from "./TurnoverRateCard";
import SalaryHourlyComparisonChart from "./SalaryHourlyComparisonChart";

export default function BenchmarkPage() {
  const [isGetInTouchModalOpen, setIsGetInTouchModalOpen] = useState(false);
  const [selectedGraphType, setSelectedGraphType] = useState<"owners" | "renters">("renters");

  // Get dashboard benchmark data from Redux store
  const industryOverview = useAppSelector(selectIndustryOverview);
  const turnoverMetrics = useAppSelector(selectTurnoverMetrics);
  const separationMetrics = useAppSelector(selectSeparationMetrics);
  const areaMedianWage = useAppSelector(selectPrimaryAreaMedianWage);
  const zipCodes = useAppSelector(selectZipCodes);
  const industry = useAppSelector(selectIndustry);
  const dashboardData = useAppSelector(selectDashboardData);

  const initialZip =
    (zipCodes && zipCodes.length > 0 && zipCodes[0]) ||
    dashboardData?.areaMedianWage?.[0]?.zipcode ||
    dashboardData?.housingCost?.[0]?.zipcode ||
    null;

  const [selectedZip, setSelectedZip] = useState<string | null>(initialZip);
  const [selectedHousingZip, setSelectedHousingZip] = useState<string | null>(initialZip);

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

  return (
    <div className="bg-ws-white py-10 px-6 space-y-6 shadow-xl rounded-b-xl">
      <div className="w-full flex items-center justify-between">
        <h2 className="text-2xl lg:text-4xl font-medium text-ws-black-60 leading-10">
          {`Current Trends for  ${industry?.name}`}
        </h2>
        {/* <Button color="secondary" onClick={() => setIsGetInTouchModalOpen(true)}>
          Share feedback
        </Button> */}
      </div>

      {/* ── Industry Overview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <StaticCard
          title={
            !industryOverview?.turnoverRate?.month || !industryOverview?.turnoverRate?.year
              ? "Turnover rate"
              : `Turnover rate since ${industryOverview?.turnoverRate?.month} ${industryOverview?.turnoverRate?.year}`
          }
          titleClass="text-sm font-medium text-ws-black-10"
          itemAlign="between"
          count={formatPercentage(industryOverview?.turnoverRate?.rate)}
          countClass={
            industryOverview?.turnoverRate?.rate == null
              ? "mt-2 text-sm font-medium text-ws-black-10"
              : "mt-2 text-3xl xl:text-5xl font-medium text-ws-black-90"
          }
          infoIcon={true}
          infoCircleClass="text-ws-gray-70"
          tooltipText="Turnover Rate"
          descriptionText="Industry specific turnover metrics are calculated from US Census Bureau QWI data sources"
          placements="top"
        />
        <StaticCard
          //  title={`Avg Turnover since  ${industryOverview?.avgTurnover?.sinceYear}`}
          title={
            !industryOverview?.avgTurnover?.sinceYear
              ? "Avg Turnover"
              : `Avg Turnover since  ${industryOverview?.avgTurnover?.sinceYear}`
          }
          titleClass="text-sm font-medium text-ws-black-10"
          itemAlign="between"
          count={formatPercentage(industryOverview?.avgTurnover?.rate)}
          countClass={
            industryOverview?.avgTurnover?.rate == null
              ? "mt-2 text-sm font-medium text-ws-black-10"
              : "mt-2 text-3xl xl:text-5xl font-medium text-ws-black-90"
          }
          infoIcon={true}
          infoCircleClass="text-ws-gray-70"
          tooltipText="Average Turnover"
          descriptionText="Average turnover metrics are calculated from US Census Bureau QWI data sources"
          placements="top"
        />
        <StaticCard
          title="Avg. Cost of Turnover"
          titleClass="text-sm font-medium text-ws-black-10"
          itemAlign="between"
          count={
            industryOverview?.avgCostOfTurnover?.formatted ||
            formatCurrency(industryOverview?.avgCostOfTurnover?.amount)
          }
          countClass={
            industryOverview?.avgCostOfTurnover?.amount == null
              ? "mt-2 text-sm font-medium text-ws-black-10"
              : "mt-2 text-3xl xl:text-5xl font-medium text-ws-black-90"
          }
          infoIcon={true}
          infoCircleClass="text-ws-gray-70"
          tooltipText="Average Cost of Turnover"
          descriptionText={`Industry specific cost of turnover is calculated from ${industryOverview?.avgCostOfTurnover?.year || " "}`}
          placements="top"
        />
      </div>
      {/* <div className="w-full xl:w-2/3">
            <div
              className={`w-full space-y-6 ${showMoreContent ? "max-h-100 overflow-y-auto pr-4" : "max-h-100 overflow-hidden pr-4"}`}
            >
              <p className="text-base text-ws-black-40">
                The Wholesale Trade sector comprises establishments engaged in wholesaling
                merchandise, generally without transformation, and rendering services incidental to
                the sale of merchandise. The merchandise described in this sector includes the
                outputs of agriculture, mining, manufacturing, and certain information industries,
                such as publishing.
              </p>
              <p className="text-base text-ws-black-40">
                The wholesaling process is an intermediate step in the distribution of merchandise.
                Wholesalers are organized to sell or arrange the purchase or sale of (a) goods for
                resale (i.e., goods sold to other wholesalers or retailers), (b) capital or durable
                nonconsumer goods, and (c) raw and intermediate materials and supplies used in
                production. Wholesalers sell merchandise to other businesses and normally operate
                from a warehouse or office. These warehouses and offices are characterized by having
                little or no display of merchandise. In addition, neither the design nor the
                location of the premises is intended to solicit walk-in traffic. Wholesalers do not
                normally use advertising directed to the general public.
              </p>
              {showMoreContent && (
                <>
                  <p className="text-base text-ws-black-40">
                    The wholesaling process is an intermediate step in the distribution of
                    merchandise. Wholesalers are organized to sell or arrange the purchase or sale
                    of (a) goods for resale (i.e., goods sold to other wholesalers or retailers),
                    (b) capital or durable nonconsumer goods, and (c) raw and intermediate materials
                    and supplies used in production. Wholesalers sell merchandise to other
                    businesses and normally operate from a warehouse or office. These warehouses and
                    offices are characterized by having little or no display of merchandise. In
                    addition, neither the design nor the location of the premises is intended to
                    solicit walk-in traffic. Wholesalers do not normally use advertising directed to
                    the general public.
                  </p>
                  <p className="text-base text-ws-black-40">
                    The wholesaling process is an intermediate step in the distribution of
                    merchandise. Wholesalers are organized to sell or arrange the purchase or sale
                    of (a) goods for resale (i.e., goods sold to other wholesalers or retailers),
                    (b) capital or durable nonconsumer goods, and (c) raw and intermediate materials
                    and supplies used in production. Wholesalers sell merchandise to other
                    businesses and normally operate from a warehouse or office. These warehouses and
                    offices are characterized by having little or no display of merchandise. In
                    addition, neither the design nor the location of the premises is intended to
                    solicit walk-in traffic. Wholesalers do not normally use advertising directed to
                    the general public.
                  </p>
                </>
              )}
            </div>
            <button
              onClick={() => setShowMoreContent(!showMoreContent)}
              className="text-ws-purple-50 text-base underline mt-2 hover:cursor-pointer"
            >
              {showMoreContent ? "Read less" : "Read more"}
            </button>
          </div> */}

      {/* ── Industry Turnover ── */}
      <div className="w-full flex flex-col items-center bg-ws-gray-30 border border-ws-primary-100 rounded-xl py-8 px-6">
        <div className="w-full flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-4xl font-medium text-ws-black-90">Industry Turnover</h3>
            <p className="text-base text-ws-black-90 w-full xl:w-3/4 mt-2">Lorem Ipsum</p>
          </div>
          <div className="flex flex-col items-start w-full lg:w-auto shrink-0">
            <Label className="text-sm font-medium text-ws-black-20 flex mb-1.5">
              Metropolitan Area
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
          </div>
        </div>
        <div className="w-full flex mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            <TurnoverRateCard
              title="Turnover Rate"
              titleQatar="Q2 2024"
              sections={[
                {
                  sectionTitle: "INDUSTRY AVERAGE",
                  columnsCount: 2,
                  cardsData: [
                    {
                      title: "Involuntary",
                      statics: formatPercentage(39.8),
                      progressValue: 39.8,
                      customBarColor: "bg-ws-progress-primary",
                    },
                    {
                      title: "Voluntary",
                      statics: formatPercentage(60.1),
                      progressValue: 60.1,
                      customBarColor: "bg-ws-progress-secondary",
                    },
                  ],
                },
                // {
                //   sectionTitle: "YOUR COMPANY",
                //   columnsCount: 2,
                //   cardsData: [
                //     {
                //       title: "Voluntary",
                //       statics: formatPercentage(60.1),
                //       staticsPoints: "-23pts",
                //staticsPointsState: true,
                //       progressValue: 60.1,
                //       customBarColor: "bg-utility-success-500",
                //     },
                //     {
                //       title: "Company Average",
                //       statics: formatPercentage(45.5),
                //       staticsPoints: "-8pts",
                //       progressValue: 45.5,
                //       customBarColor: "bg-utility-warning-500",
                //     },
                //   ],
                // },
              ]}
              industryText={
                industryOverview?.turnoverRate?.rate ? "Industry-wide cost of turnover:" : undefined
              }
              industryBoldText="$4,149.2M"
              sourceText="Source: Lorem ipsum sit amet dolor"
              className="col-span-1"
            />
            <TurnoverRateCard
              title="Turnover Rate"
              titleQatar="Q2 2024"
              sections={[
                {
                  sectionTitle: "INDUSTRY AVERAGE",
                  columnsCount: 2,
                  cardsData: [
                    {
                      title: "Involuntary",
                      statics: formatPercentage(39.8),
                      progressValue: 39.8,
                      customBarColor: "bg-ws-progress-primary",
                    },
                    {
                      title: "Voluntary",
                      statics: formatPercentage(60.1),
                      progressValue: 60.1,
                      customBarColor: "bg-ws-progress-secondary",
                    },
                  ],
                },
                // {
                //   sectionTitle: "YOUR COMPANY",
                //   columnsCount: 2,
                //   cardsData: [
                //     {
                //       title: "Voluntary",
                //       statics: formatPercentage(60.1),
                //       staticsPoints: "-23pts",
                //staticsPointsState: true,
                //       progressValue: 60.1,
                //       customBarColor: "bg-utility-success-500",
                //     },
                //     {
                //       title: "Company Average",
                //       statics: formatPercentage(45.5),
                //       staticsPoints: "-8pts",
                //       progressValue: 45.5,
                //       customBarColor: "bg-utility-warning-500",
                //     },
                //   ],
                // },
              ]}
              industryText={
                industryOverview?.turnoverRate?.rate ? "Industry-wide cost of turnover:" : undefined
              }
              industryBoldText="$4,149.2M"
              sourceText="Source: Lorem ipsum sit amet dolor"
              className="col-span-1"
            />
          </div>
        </div>
        <div className="w-full flex items-start mt-8">Source: Lorem Ipsum dolor</div>
      </div>

      <div className="w-full flex flex-col items-center bg-ws-gray-30 border border-ws-primary-100 rounded-xl py-8 px-6">
        <div className="w-full flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-4xl font-medium text-ws-black-90">
              Area Median Wage: Manchester, NH
            </h3>
            <p className="text-base text-ws-black-90 w-full  mt-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce quis felis venenatis.
            </p>
          </div>
          <div className="flex flex-col items-start w-full lg:w-auto shrink-0">
            <Label className="text-sm font-medium text-ws-black-20 flex mb-1.5">
              Metropolitan Area
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
          </div>
        </div>
      </div>

      <div className="bg-ws-purple-10 border border-ws-primary-100 rounded-xl p-4">
        <div className="flex items-center gap-2 text-lg text-ws-black-70 font-medium mb-2">
          <SmileFace />
          <h3 className="text-base font-medium leading-7 text-ws-black-70">Did you know?</h3>
        </div>
        <p className="text-base font-normal text-ws-black leading-6">
          The cost of replacing an individual employee can range from one-half to two times the
          employee's annual salary.
        </p>
      </div>
      <div className="grid xl:grid-cols-2 gap-6">
        <CostCard
          classess="border-ws-gray-40!"
          title="Turnover Voluntary vs Involuntary"
          year={
            !turnoverMetrics?.quarter || !turnoverMetrics?.year
              ? "No data available"
              : `${turnoverMetrics?.quarter} ${turnoverMetrics?.year}`
          }
          primaryScore={`${formatPercentage(turnoverMetrics?.voluntary)} Voluntary`}
          secondaryScore={`${formatPercentage(turnoverMetrics?.involuntary)} Involuntary`}
          primaryValue={turnoverMetrics?.voluntary}
          secondaryValue={turnoverMetrics?.involuntary}
          industryTradeText={
            industry?.name ? `Industry: ${industry?.name}` : "Industry: No data available"
          }
        />
        <CostCard
          classess="border-ws-gray-40!"
          title="Rate of Separation"
          year={
            !separationMetrics?.quarter || !separationMetrics?.year
              ? "No data available"
              : `${separationMetrics?.quarter} ${separationMetrics?.year}`
          }
          primaryScore={`${formatPercentage(separationMetrics?.hiringRate)} Hiring Rate`}
          secondaryScore={`${formatPercentage(separationMetrics?.separationRate)} Separation`}
          primaryValue={separationMetrics?.hiringRate}
          secondaryValue={separationMetrics?.separationRate}
          industryTradeText={
            industry?.name ? `Industry: ${industry?.name}` : "Industry: No data available"
          }
        />
      </div>

      {/* ── Area Median Wage ── */}
      <div className="bg-ws-white border border-ws-primary-100 rounded-xl px-6 py-8">
        <div className="flex items-center justify-between md:items-start flex-col xl:flex-row">
          <div className="space-y-1">
            <h3 className="text-2xl font-medium text-ws-black-60">
              Area Median Wage:{" "}
              {selectedZip && dashboardData?.areaMedianWage
                ? dashboardData.areaMedianWage.find(a => a.zipcode === selectedZip)?.state
                : dashboardData?.areaMedianWage[0]?.state}
            </h3>
            <p className="text-base text-ws-black">
              Understand how your wages compare against with industry and US wages.
            </p>
          </div>
          <div className="w-full md:w-full md:mt-4 lg:w-auto">
            {zipCodes && zipCodes.length > 0 ? (
              <Select
                className="w-full flex items-start min-w-50 md:min-w-full lg:min-w-70"
                isRequired
                size="md"
                placeholder="Select Zip Code"
                items={zipCodes.map(z => ({ label: z, id: `@${z}` }))}
                value={selectedZip ? `@${selectedZip}` : undefined}
                onSelectionChange={(key: Key | null) => {
                  if (key !== null) {
                    setSelectedZip(String(key).replace(/^@/, ""));
                  }
                }}
              >
                {item => <Select.Item id={item.id}>{item.label}</Select.Item>}
              </Select>
            ) : (
              <div className="text-sm text-ws-black-40">No ZIP codes available</div>
            )}
          </div>
        </div>
        <div className="mt-6">
          <div className="w-full overflow-x-auto">
            <div className="w-full">
              {/* <WageBarChart
                data={(() => {
                  if (selectedZip && dashboardData?.areaMedianWage) {
                    const found = dashboardData.areaMedianWage.find(a => a.zipcode === selectedZip);
                    if (found && found.graph) {
                      return [
                        {
                          name: "Salary",
                          industryAverage: found.graph.stateAverage.salary,
                          yourCompany: found.graph.yourCompany.salary,
                          nationalAverage: found.graph.nationalAverage.salary,
                        },
                        {
                          name: "Hourly",
                          industryAverage: found.graph.stateAverage.hourly,
                          yourCompany: found.graph.yourCompany.hourly,
                          nationalAverage: found.graph.nationalAverage.hourly,
                        },
                      ];
                    }
                  }
                  return wageChartData || [];
                })()}
                height={397}
              /> */}
              <SalaryHourlyComparisonChart
                salaryData={{ industryAverage: 31000, nationalAverage: 78000 }}
                hourlyData={{ industryAverage: 13.5, nationalAverage: 24.0 }}
                sourceAttribution="Source: BLS, 2023"
              />
            </div>
          </div>
          <div className="space-y-4 w-full">
            <StaticCard
              title="Median Hourly Wages"
              titleClass="text-ws-black-300 text-base"
              itemAlign="between"
              count={
                selectedZip && dashboardData?.areaMedianWage
                  ? formatCurrencyWithCents(
                      dashboardData.areaMedianWage.find(a => a.zipcode === selectedZip)
                        ?.medianHourlyWages
                    )
                  : formatCurrencyWithCents(areaMedianWage?.medianHourlyWages)
              }
              countClass="mt-10 text-3xl xl:text-5xl font-medium text-ws-black-90"
              infoIcon={false}
              classess="bg-ws-gray-10! w-full"
            />
            <StaticCard
              title="Median Living Wage"
              titleClass="text-ws-black-300 text-base"
              itemAlign="between"
              count={
                selectedZip && dashboardData?.areaMedianWage
                  ? formatCurrencyWithCents(
                      dashboardData.areaMedianWage.find(a => a.zipcode === selectedZip)
                        ?.medianLivingWage
                    )
                  : formatCurrencyWithCents(areaMedianWage?.medianLivingWage)
              }
              infoIcon={false}
              countClass="mt-10 text-3xl xl:text-5xl font-medium text-ws-black-90"
              classess="bg-ws-gray-10! w-full"
            />
            <StaticCard
              title="National Average"
              titleClass="text-ws-black-300 text-base"
              itemAlign="between"
              count={
                selectedZip && dashboardData?.areaMedianWage
                  ? formatCurrency(
                      dashboardData.areaMedianWage.find(a => a.zipcode === selectedZip)
                        ?.nationalAverage
                    )
                  : formatCurrency(areaMedianWage?.nationalAverage)
              }
              infoIcon={false}
              countClass="mt-10 text-3xl xl:text-5xl font-medium text-ws-black-90"
              classess="bg-ws-gray-10! w-full"
            />
          </div>
        </div>
      </div>

      {/* ── The Cost of Housing ── */}
      <div className="bg-ws-white border border-ws-primary-100 rounded-xl px-6 py-8">
        <div className="flex items-center">
          <div className="space-y-4">
            <h3 className="text-2xl font-medium text-ws-black">The Cost of Housing</h3>
            <p className="text-base text-ws-black-90">
              The concept of rent (or housing cost) burden applies to both renters and homeowners,
              but it's calculated a bit differently for each. Both renters and homeowners can
              experience housing burdened costs; the main difference is what expenses are counted,
              not the income thresholds.
            </p>
            <div className="flex items-center justify-between gap-4 flex-col lg:flex-row">
              <p className="text-base text-ws-black-90">
                Rent Burdened: A household is considered rent burdened when it{" "}
                <strong>spends 30% or more of its gross income on rent and utilities.</strong> At
                this level, housing costs can start to limit spending on essentials like food,
                healthcare, and savings.
              </p>
              <p className="text-base text-ws-black-90">
                Severely Rent Burdened: A household is severely rent burdened when it{" "}
                <strong>spends 50% or more of its gross income on rent and utilities.</strong> This
                indicates a high risk of financial instability, leaving very little income for other
                basic needs.
              </p>
            </div>
          </div>
        </div>

        <hr className="border-t border-gray-200 mt-5 mb-6" />
        {/* ── Housing Cost Burdened Owners ── */}
        <div className="flex items-center justify-between md:items-start flex-col lg:flex-row mb-4">
          <div className="space-y-1">
            <h3 className="text-xl font-medium text-ws-black flex items-center gap-2">
              Housing Cost Burdened Owners
              {/* <Tooltip title="This is a tooltip" arrow={true}>
                  <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                    <InfoCircle className="size-5 text-ws-gray-70" />
                  </TooltipTrigger>
                </Tooltip> */}
            </h3>
            <p className="text-xs text-ws-black">
              {selectedHousingData?.housingCostBurdenedOwners?.[0]?.year
                ? `${selectedHousingData.housingCostBurdenedOwners[0].year}`
                : "—"}
            </p>
          </div>

          {/* Zip Code selector — shown once on the Owners row, controls both sections */}
          {zipCodes && zipCodes.length > 0 ? (
            <div className="flex flex-col items-start w-full lg:w-auto">
              <Label htmlFor="housing-zip-select" className="text-ws-black-20 flex mb-1.5">
                Zip Code
              </Label>
              <Select
                className="w-full flex items-start min-w-50 md:min-w-full lg:min-w-60"
                isRequired
                size="md"
                placeholder="Select Zip Code"
                items={zipCodes.map(z => ({ label: z, id: `@${z}` }))}
                value={selectedHousingZip ? `@${selectedHousingZip}` : undefined}
                onSelectionChange={(key: Key | null) => {
                  if (key !== null) {
                    setSelectedHousingZip(String(key).replace(/^@/, ""));
                  }
                }}
              >
                {item => <Select.Item id={item.id}>{item.label}</Select.Item>}
              </Select>
            </div>
          ) : null}
        </div>

        {/* Owners stat cards */}
        <div className="grid xl:grid-cols-2 gap-4 mb-6">
          <StaticCard
            title="Burdened Owners"
            titleClass="text-sm font-medium text-ws-black-10 uppercase"
            itemAlign="between"
            count={formatPercentage(selectedHousingData?.housingCostBurdenedOwners?.[0]?.burdened)}
            countClass={
              selectedHousingData?.housingCostBurdenedOwners?.[0]?.burdened == null
                ? "mt-2 text-sm font-medium text-ws-black-10"
                : "text-3xl xl:text-5xl font-medium text-ws-black-90 mt-2"
            }
            infoIcon={true}
            infoCircleClass="text-ws-gray-70"
            tooltipText="Burdened Owners"
            descriptionText="U.S. Census Bureau, 5-Year American Community Survey"
            placements="top"
            classess="flex-1 bg-ws-gray-10! ring-ws-gray-40!"
          />
          <StaticCard
            title="Severely Burdened Owners"
            titleClass="text-sm font-medium text-ws-black-10 uppercase"
            itemAlign="between"
            count={formatPercentage(
              selectedHousingData?.housingCostBurdenedOwners?.[0]?.severelyBurdened
            )}
            countClass={
              selectedHousingData?.housingCostBurdenedOwners?.[0]?.severelyBurdened == null
                ? "mt-2 text-sm font-medium text-ws-black-10"
                : "text-3xl xl:text-5xl font-medium text-ws-black-90 mt-2"
            }
            infoIcon={true}
            infoCircleClass="text-ws-gray-70"
            tooltipText="Severely Burdened Owners"
            descriptionText="U.S. Census Bureau, 5-Year American Community Survey"
            placements="top"
            classess="flex-1 bg-ws-gray-10! ring-ws-gray-40!"
          />
        </div>

        {/* ── Housing Cost Burdened Renters ── */}
        <div className="flex items-center justify-between md:items-start flex-col lg:flex-row mb-4">
          <div className="space-y-1">
            <h3 className="text-xl font-medium text-ws-black flex items-center gap-2">
              Housing Cost Burdened Renters
              {/* <Tooltip title="This is a tooltip" arrow={true}>
                  <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                    <InfoCircle className="size-5 text-ws-gray-70" />
                  </TooltipTrigger>
                </Tooltip> */}
            </h3>
            <p className="text-xs text-ws-black">
              {selectedHousingData?.housingCostBurdenedRenters?.[0]?.year
                ? `${selectedHousingData.housingCostBurdenedRenters[0].year}`
                : "—"}
            </p>
          </div>
        </div>

        {/* Renters stat cards */}
        <div className="grid xl:grid-cols-2 gap-4 flex-col lg:flex-row">
          <StaticCard
            title="Burdened Renters"
            titleClass="text-sm font-medium text-ws-black-10 uppercase"
            itemAlign="between"
            count={formatPercentage(selectedHousingData?.housingCostBurdenedRenters?.[0]?.burdened)}
            countClass={
              selectedHousingData?.housingCostBurdenedRenters?.[0]?.burdened == null
                ? "mt-2 text-sm font-medium text-ws-black-10"
                : "text-3xl xl:text-5xl font-medium text-ws-black-90 mt-2"
            }
            infoIcon={true}
            infoCircleClass="text-ws-gray-70"
            tooltipText="Burdened Renters"
            descriptionText="U.S. Census Bureau, 5-Year American Community Survey"
            placements="top"
            classess="flex-1 bg-ws-gray-10! ring-ws-gray-40!"
          />
          <StaticCard
            title="Severely Burdened Renters"
            titleClass="text-sm font-medium text-ws-black-10 uppercase"
            itemAlign="between"
            count={formatPercentage(
              selectedHousingData?.housingCostBurdenedRenters?.[0]?.severelyBurdened
            )}
            countClass={
              selectedHousingData?.housingCostBurdenedRenters?.[0]?.severelyBurdened == null
                ? "mt-2 text-sm font-medium text-ws-black-10"
                : "text-3xl xl:text-5xl font-medium text-ws-black-90 mt-2"
            }
            infoIcon={true}
            infoCircleClass="text-ws-gray-70"
            tooltipText="Severely Burdened Renters"
            descriptionText="U.S. Census Bureau, 5-Year American Community Survey"
            placements="top"
            classess="flex-1 bg-ws-gray-10! ring-ws-gray-40!"
          />
        </div>

        {/* ── Working Class Housing Cost Burden ── */}
        <div className="bg-ws-white border border-ws-primary-100 rounded-xl px-6 py-8 mt-6">
          {/* Header row: title + Household type selector only */}
          <div className="flex items-start justify-between flex-col lg:flex-row gap-4 mb-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-medium text-ws-black">
                Working Class Housing Cost Burden
              </h3>
              <p className="text-base text-ws-black-10 w-full xl:w-3/4 mt-2">
                The data below outlines the housing cost burden for your employees in{" "}
                {selectedHousingZip} across income levels for that area.
              </p>
            </div>

            {/* Household type selector only */}
            <div className="flex flex-col items-start w-full lg:w-auto shrink-0">
              <Label className="text-ws-black-20 flex mb-1.5">Household type</Label>
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

          {/* Stat cards */}
          <div className="grid xl:grid-cols-3 gap-4 mt-6 flex-col lg:flex-row">
            <StaticCard
              title="Home Ownership Rate"
              titleClass="uppercase text-sm font-medium text-ws-black-10"
              itemAlign="between"
              count={formatPercentage(
                selectedHousingData?.workingClassHousingCostBurden?.homeOwnershipRate,
                0
              )}
              countClass={
                selectedHousingData?.workingClassHousingCostBurden?.homeOwnershipRate == null
                  ? "mt-2 text-sm font-medium text-ws-black-10"
                  : "text-3xl xl:text-5xl font-medium text-ws-black-90 mt-2"
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
              titleClass="uppercase text-sm font-medium text-ws-black-10"
              count={formatCurrency(
                selectedHousingData?.workingClassHousingCostBurden?.medianHomeValue
              )}
              countClass={
                selectedHousingData?.workingClassHousingCostBurden?.medianHomeValue == null
                  ? "mt-2 text-sm font-medium text-ws-black-10"
                  : "text-3xl xl:text-5xl font-medium text-ws-black-90 mt-2"
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
              titleClass="uppercase text-sm font-medium text-ws-black-10"
              count={formatCurrency(selectedHousingData?.workingClassHousingCostBurden?.medianRent)}
              countClass={
                selectedHousingData?.workingClassHousingCostBurden?.medianRent == null
                  ? "mt-2 text-sm font-medium text-ws-black-10"
                  : "text-3xl xl:text-5xl font-medium text-ws-black-90 mt-2"
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
          <div className="flex-1 w-full overflow-x-auto mt-6">
            <div className="min-w-[700px]">
              <IncomeDistributionChart
                data={Array.isArray(workingClassHousingGraph) ? workingClassHousingGraph : []}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <p className="text-xs color-base-black">
          This product provides informational insights and recommendations based on the data you
          share and industry benchmarks. It does not provide legal, financial, tax, or benefits
          advice, and recommendations are not guarantees of outcomes or results. Actual results may
          vary, and you are responsible for evaluating and implementing any recommendations based on
          your organization's specific circumstances.
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

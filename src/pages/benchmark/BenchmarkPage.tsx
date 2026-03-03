"use client";
import { useState } from "react";
// import { Button } from "@/components/base/buttons/button";
import StaticCard from "../recommendations/StaticCard";
import CostCard from "./CostCard";
import { Select } from "@/components/base/select/select";
import { IncomeDistributionChart } from "./CostBurdenBarChart";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { InfoCircle } from "@untitledui/icons";
import { GetInTouchModal } from "@/components/modals/GetInTouchModal";
import WageBarChart from "./WageBarChart";
import type { Key } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  selectIndustryOverview,
  selectTurnoverMetrics,
  selectSeparationMetrics,
  selectAreaMedianWageChartData,
  selectZipCodes,
  selectDashboardData,
  selectPrimaryAreaMedianWage,
} from "@/store/selectors/dashboardSelectors";
import { formatCurrency, formatPercentage, formatCurrencyWithCents } from "@/utils/formatters";
import { SmileFace } from "@/assets/icons/SmileFace";

export default function BenchmarkPage() {
  const [isGetInTouchModalOpen, setIsGetInTouchModalOpen] = useState(false);
  const [showMoreContent, setShowMoreContent] = useState(false);
  const [selectedGraphType, setSelectedGraphType] = useState<"owners" | "renters">("renters");

  // Get dashboard benchmark data from Redux store
  const industryOverview = useAppSelector(selectIndustryOverview);
  const turnoverMetrics = useAppSelector(selectTurnoverMetrics);
  const separationMetrics = useAppSelector(selectSeparationMetrics);
  const areaMedianWage = useAppSelector(selectPrimaryAreaMedianWage);
  const wageChartData = useAppSelector(selectAreaMedianWageChartData);
  const zipCodes = useAppSelector(selectZipCodes);
  const dashboardData = useAppSelector(selectDashboardData);

  // Initialize selected ZIP from available data without using an effect to avoid cascading renders
  const initialZip =
    (zipCodes && zipCodes.length > 0 && zipCodes[0]) ||
    dashboardData?.areaMedianWage?.[0]?.zipcode ||
    dashboardData?.housingCost?.[0]?.zipcode ||
    null;

  const [selectedZip, setSelectedZip] = useState<string | null>(initialZip);

  // Derive housing data for selected zip (kept in sync with selectedZip)
  const selectedHousingData = selectedZip
    ? dashboardData?.housingCost?.find(h => h.zipcode === selectedZip)
    : dashboardData?.housingCost?.[0];

  // Transform graph data based on selected type (Owners/Renters)
  const workingClassHousingGraph = (() => {
    const graphData = selectedHousingData?.workingClassHousingGraph;
    if (!graphData) return [];

    const selectedData = selectedGraphType === "owners" ? graphData.owners : graphData.renters;

    // Sum all burdened values to calculate percentages from raw counts
    const allValues = [
      selectedData.lowIncome,
      selectedData.moderateIncome,
      selectedData.medianIncome,
      selectedData.upperIncome,
    ];
    const totalBurdened = allValues.reduce((sum, d) => sum + (d.burdened ?? 0), 0);
    const totalSeverely = allValues.reduce((sum, d) => sum + (d.severelyBurdened ?? 0), 0);

    const toPercent = (value: number, total: number) =>
      total > 0 ? parseFloat(((value / total) * 100).toFixed(1)) : 0;

    return [
      {
        incomeCategory: "lowIncome",
        label: "Low income",
        range: "$50,000 or less",
        burdened: toPercent(selectedData.lowIncome.burdened, totalBurdened),
        severelyBurdened: toPercent(selectedData.lowIncome.severelyBurdened, totalSeverely),
      },
      {
        incomeCategory: "moderateIncome",
        label: "Moderate income",
        range: "$50,000 - $74,999",
        burdened: toPercent(selectedData.moderateIncome.burdened, totalBurdened),
        severelyBurdened: toPercent(selectedData.moderateIncome.severelyBurdened, totalSeverely),
      },
      {
        incomeCategory: "medianIncome",
        label: "Median income",
        range: "$75,000 - $99,999",
        burdened: toPercent(selectedData.medianIncome.burdened, totalBurdened),
        severelyBurdened: toPercent(selectedData.medianIncome.severelyBurdened, totalSeverely),
      },
      {
        incomeCategory: "upperIncome",
        label: "Upper income",
        range: "$100,000 or more",
        burdened: toPercent(selectedData.upperIncome.burdened, totalBurdened),
        severelyBurdened: toPercent(selectedData.upperIncome.severelyBurdened, totalSeverely),
      },
    ];
  })();

  return (
    <div className="bg-ws-gray-20 border border-ws-gray-50 rounded-xl p-6 space-y-6">
      <div className="w-full flex items-center justify-between">
        <h2 className="text-2xl lg:text-4xl font-medium text-ws-black-60 leading-10">
          Current Trends for Wholesale Trade
        </h2>
        {/* <Button color="secondary" onClick={() => setIsGetInTouchModalOpen(true)}>
          Share feedback
        </Button> */}
      </div>

      {/* ── Industry Overview ── */}
      <div className="bg-ws-white py-8 px-6 border border-ws-gray-50 rounded-xl space-y-6">
        <h3 className="text-3xl font-medium text-ws-black">Industry Overview</h3>
        <div className="flex justify-between gap-10 flex-col lg:flex-row">
          <div className="space-y-5 w-full xl:w-1/3">
            <StaticCard
              title="Turnover rate since Jan 2024"
              titleClass="text-sm font-medium text-ws-black-10"
              itemAlign="between"
              count={formatPercentage(industryOverview?.turnoverRate?.rate)}
              countClass="mt-2 text-3xl xl:text-5xl font-medium text-ws-black-90"
              infoIcon={true}
              infoCircleClass="text-ws-gray-70"
              tooltipText="Turnover Rate"
              descriptionText="Industry specific turnover metrics are calculated from US Census Bureau QWI data sources"
              placements="top"
            />
            <StaticCard
              title="Avg Turnover since 2020"
              titleClass="text-sm font-medium text-ws-black-10"
              itemAlign="between"
              count={formatPercentage(industryOverview?.avgTurnover?.rate)}
              countClass="mt-2 text-3xl xl:text-5xl font-medium text-ws-black-90"
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
              countClass="mt-2 text-3xl xl:text-5xl font-medium text-ws-black-90"
              infoIcon={true}
              infoCircleClass="text-ws-gray-70"
              tooltipText="Average Cost of Turnover"
              descriptionText="Industry specific cost of turnover is calculated from ......"
              placements="top"
            />
          </div>
          <div className="w-full xl:w-2/3">
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
          </div>
        </div>
        <div className="bg-ws-purple-10 border border-ws-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-lg text-ws-black-70 font-medium mb-2">
            <SmileFace />
            <h3 className="text-base font-medium leading-7 text-ws-black-70">Did you know?</h3>
          </div>
          <p className="text-base font-normal text-ws-black leading-6">
            The cost of replacing an individual employee can range from one-half to two times the
            employee's annual salary.
          </p>
        </div>

        {/* ── Turnover / Separation Cards ── */}
        <div className="grid xl:grid-cols-2 gap-6">
          <CostCard
            classess="border-ws-gray-40!"
            title="Turnover Voluntary vs Involuntary"
            year={`Q${turnoverMetrics?.quarter || 2} ${turnoverMetrics?.year || 2024}`}
            voluntaryScore={`${formatPercentage(turnoverMetrics?.voluntary)} Voluntary`}
            involuntaryScore={`${formatPercentage(turnoverMetrics?.involuntary)} Involuntary`}
            industryTradeText="Industry: Whole Trade"
          />
          <CostCard
            classess="border-ws-gray-40!"
            title="Rate of Separation"
            year={`Q${separationMetrics?.quarter || 2} ${separationMetrics?.year || 2023}`}
            voluntaryScore={`${formatPercentage(separationMetrics?.hiringRate)} Hiring Rate`}
            involuntaryScore={`${formatPercentage(separationMetrics?.separationRate)} Separation`}
            industryTradeText="Industry: Whole Trade"
          />
        </div>

        {/* ── Area Median Wage ── */}
        <div className="bg-ws-white border border-ws-gray-50 rounded-xl px-6 py-8">
          <div className="flex items-center justify-between md:items-start flex-col xl:flex-row">
            <div className="space-y-1">
              <h3 className="text-2xl font-medium text-ws-black-60">
                Area Median Wage: [State Name]
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
          <div className="grid items-stretch xl:grid-cols-[3fr_2fr] gap-6 flex-col lg:flex-row mt-6">
            <div className="w-full overflow-x-auto">
              <div className="w-full">
                <WageBarChart
                  data={(() => {
                    if (selectedZip && dashboardData?.areaMedianWage) {
                      const found = dashboardData.areaMedianWage.find(
                        a => a.zipcode === selectedZip
                      );
                      if (found && found.graph) {
                        const nationalSalary = found.graph.nationalAverage.salary || 1;
                        const nationalHourly = found.graph.nationalAverage.hourly || 1;
                        return [
                          {
                            name: "Salary",
                            industryAverage:
                              (found.graph.stateAverage.salary / nationalSalary) * 100,
                            yourCompany: (found.graph.yourCompany.salary / nationalSalary) * 100,
                            nationalAverage: 100,
                          },
                          {
                            name: "Hourly",
                            industryAverage:
                              (found.graph.stateAverage.hourly / nationalHourly) * 100,
                            yourCompany: (found.graph.yourCompany.hourly / nationalHourly) * 100,
                            nationalAverage: 100,
                          },
                        ];
                      }
                    }
                    return (
                      wageChartData || [
                        {
                          name: "Salary",
                          industryAverage: 33.75,
                          yourCompany: 54.38,
                          nationalAverage: 100,
                        },
                        {
                          name: "Hourly",
                          industryAverage: 33.75,
                          yourCompany: 54.38,
                          nationalAverage: 100,
                        },
                      ]
                    );
                  })()}
                  height={397}
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
                    : areaMedianWage
                      ? formatCurrencyWithCents(areaMedianWage.medianHourlyWages)
                      : "N/A"
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
                    : areaMedianWage
                      ? formatCurrencyWithCents(areaMedianWage.medianLivingWage)
                      : "N/A"
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
                    : areaMedianWage
                      ? formatCurrency(areaMedianWage.nationalAverage)
                      : "N/A"
                }
                infoIcon={false}
                countClass="mt-10 text-3xl xl:text-5xl font-medium text-ws-black-90"
                classess="bg-ws-gray-10! w-full"
              />
            </div>
          </div>
        </div>

        {/* ── The Cost of Housing ── */}
        <div className="bg-ws-white border border-ws-gray-50 rounded-xl px-6 py-8">
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
                  <strong>spends 50% or more of its gross income on rent and utilities.</strong>{" "}
                  This indicates a high risk of financial instability, leaving very little income
                  for other basic needs.
                </p>
              </div>
            </div>
          </div>

          <hr className="border-t border-gray-200 mt-5 mb-6" />

          {/* Housing Cost Burdened Owners header + graph type selector */}
          <div className="flex items-center justify-between md:items-start flex-col lg:flex-row mb-6">
            <div className="space-y-1">
              <h3 className="text-xl font-medium text-ws-black flex items-center gap-2">
                Housing Cost Burdened Owners
                <Tooltip title="This is a tooltip" arrow={true}>
                  <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                    <InfoCircle className="size-5 text-ws-gray-70" />
                  </TooltipTrigger>
                </Tooltip>
              </h3>
              <p className="text-xs text-ws-black">
                {selectedHousingData?.housingCostBurdenedOwners
                  ? `${selectedHousingData.housingCostBurdenedOwners.year}`
                  : "—"}
              </p>
            </div>

            {/* Graph Type Selector (Owners/Renters) */}
            <div className="w-full md:w-full lg:w-auto">
              <Select
                className="w-full flex items-start min-w-50 md:min-w-full lg:min-w-60"
                isRequired
                size="md"
                placeholder="Select Graph Type"
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

          {/* Burdened Owners cards */}
          <div className="grid xl:grid-cols-2 gap-4 flex-col lg:flex-row">
            <StaticCard
              title="Burdened Owners"
              titleClass="text-sm font-medium text-ws-black-10 uppercase"
              itemAlign="between"
              count={formatPercentage(selectedHousingData?.housingCostBurdenedOwners?.burdened)}
              countClass="text-3xl xl:text-5xl font-medium text-ws-black-90 mt-2"
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
                selectedHousingData?.housingCostBurdenedOwners?.severelyBurdened
              )}
              countClass="text-3xl xl:text-5xl font-medium text-ws-black-90 mt-2"
              infoIcon={true}
              infoCircleClass="text-ws-gray-70"
              tooltipText="Severely Burdened Owners"
              descriptionText="U.S. Census Bureau, 5-Year American Community Survey"
              placements="top"
              classess="flex-1 bg-ws-gray-10! ring-ws-gray-40!"
            />
          </div>

          {/* Renters section header */}
          <div className="flex items-center justify-between mt-6">
            <div className="space-y-1">
              <h3 className="text-xl font-medium text-ws-black">Housing Cost Burdened Renters</h3>
              <p className="text-xs text-ws-black">
                {selectedHousingData?.housingCostBurdenedRenters
                  ? `${selectedHousingData.housingCostBurdenedRenters.year}`
                  : "—"}
              </p>
            </div>
          </div>

          {/* Burdened Renters cards */}
          <div className="grid xl:grid-cols-2 gap-4 flex-col lg:flex-row mt-4">
            <StaticCard
              title="Burdened Renters"
              titleClass="text-sm font-medium text-ws-black-10 uppercase"
              itemAlign="between"
              count={formatPercentage(selectedHousingData?.housingCostBurdenedRenters?.burdened)}
              countClass="text-3xl xl:text-5xl font-medium text-ws-black-90 mt-2"
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
                selectedHousingData?.housingCostBurdenedRenters?.severelyBurdened
              )}
              countClass="text-3xl xl:text-5xl font-medium text-ws-black-90 mt-2"
              infoIcon={true}
              infoCircleClass="text-ws-gray-70"
              tooltipText="Severely Burdened Renters"
              descriptionText="U.S. Census Bureau, 5-Year American Community Survey"
              placements="top"
              classess="flex-1 bg-ws-gray-10! ring-ws-gray-40!"
            />
          </div>

          {/* Working Class Housing Cost Burden */}
          <div className="bg-ws-white border border-ws-gray-50 rounded-xl px-6 py-8 mt-6">
            <h3 className="text-2xl font-medium text-ws-black">
              Working Class Housing Cost Burden
            </h3>
            <p className="text-base text-ws-black-10 w-full xl:w-1/2 mt-2">
              The data below outlines the housing cost burden for your employees in [{selectedZip}]
              across income levels for that area.
            </p>
            <div className="grid xl:grid-cols-3 gap-4 mt-6 flex-col lg:flex-row">
              <StaticCard
                title="Home Ownership Rate"
                titleClass="uppercase text-sm font-medium text-ws-black-10"
                itemAlign="between"
                count={
                  selectedHousingData?.workingClassHousingCostBurden
                    ? formatPercentage(
                        selectedHousingData.workingClassHousingCostBurden.homeOwnershipRate,
                        0
                      )
                    : "N/A"
                }
                countClass="text-3xl xl:text-5xl font-medium text-ws-black-90 mt-2"
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
                count={
                  selectedHousingData?.workingClassHousingCostBurden
                    ? formatCurrency(
                        selectedHousingData.workingClassHousingCostBurden.medianHomeValue
                      )
                    : "N/A"
                }
                countClass="text-3xl xl:text-5xl font-medium text-ws-black-90 mt-2"
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
                count={
                  selectedHousingData?.workingClassHousingCostBurden
                    ? formatCurrency(selectedHousingData.workingClassHousingCostBurden.medianRent)
                    : "N/A"
                }
                countClass="text-3xl xl:text-5xl font-medium text-ws-black-90 mt-2"
                infoIcon={true}
                infoCircleClass="text-ws-gray-70"
                tooltipText="Median Rent"
                descriptionText="U.S. Census Bureau, 5-Year American Community Survey"
                placements="top"
                classess="flex-1 bg-ws-gray-10! ring-ws-gray-40!"
              />
            </div>
            <div className="flex-1 w-full overflow-x-auto">
              <div className="min-w-[700px]">
                <IncomeDistributionChart data={workingClassHousingGraph} />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <p className="text-xs color-base-black">
            This product provides informational insights and recommendations based on the data you
            share and industry benchmarks. It does not provide legal, financial, tax, or benefits
            advice, and recommendations are not guarantees of outcomes or results. Actual results
            may vary, and you are responsible for evaluating and implementing any recommendations
            based on your organization's specific circumstances.
          </p>
        </div>

        {/* Get In Touch Modal */}
        <GetInTouchModal
          isOpen={isGetInTouchModalOpen}
          onClose={() => setIsGetInTouchModalOpen(false)}
        />
      </div>
    </div>
  );
}

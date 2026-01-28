"use client";
import { useState } from "react";
import { Button } from "@/components/base/buttons/button";
import StaticCard from "../recommendations/StaticCard";
import { Link } from "react-router-dom";
import insightHero from "@/assets/insight-hero.png";
import CostCard from "./CostCard";
import { Select } from "@/components/base/select/select";
import { WageBarChart } from "./WageBarChart";
import CostBurdenBarChart from "./CostBurdenBarChart";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { InfoCircle } from "@untitledui/icons";
import { GetInTouchModal } from "@/components/modals/GetInTouchModal";

const items = [
  { label: "03301", id: "@03301" },
  { label: "03743", id: "@03743" },
];

export default function BenchmarkPage() {
  const [isGetInTouchModalOpen, setIsGetInTouchModalOpen] = useState(false);
  return (
    <div className="bg-gray-card border border-gray-300 rounded-xl p-6 space-y-6">
      <div className="w-full flex items-center justify-between flex-col lg:flex-row">
        <h2 className="text-2xl lg:text-4xl font-medium text-primary">
          Current Trends for Wholesale Trade
        </h2>

        <Button color="secondary" onClick={() => setIsGetInTouchModalOpen(true)}>
          Share feedback
        </Button>
      </div>
      <div className="bg-white py-8 px-6 border border-gray-300 rounded-2xl space-y-6">
        <div className="prose">
          <h3>Industry Overview</h3>
        </div>
        <div className="flex justify-between gap-10 flex-col lg:flex-row">
          <div className="space-y-5">
            <StaticCard
              title="Turnover Rate 2024"
              itemAlign="between"
              count="31%"
              infoIcon={true}
              tooltipText="How is this calculated"
              descriptionText="This is calculated based on LMI. Low-to-Moderate Income (LMI) consists of income less than 80% of the broader area's median income. "
              placements="top"
            />
            <StaticCard
              title="Avg Turnover since 2020"
              itemAlign="between"
              count="40%"
              infoIcon={true}
              tooltipText="How is this calculated"
              descriptionText="This is calculated based on LMI. Low-to-Moderate Income (LMI) consists of income less than 80% of the broader area's median income. "
              placements="top"
            />
            <StaticCard
              title="Avg. Cost of Turnover"
              itemAlign="between"
              count="$4,149M"
              infoIcon={true}
              tooltipText="How is this calculated"
              descriptionText="This is calculated based on LMI. Low-to-Moderate Income (LMI) consists of income less than 80% of the broader area's median income. "
              placements="top"
            />
          </div>
          <div className="flex-1">
            <div className="w-full space-y-6">
              <p className="text-base color-text-600">
                The Wholesale Trade sector comprises establishments engaged in wholesaling
                merchandise, generally without transformation, and rendering services incidental to
                the sale of merchandise. The merchandise described in this sector includes the
                outputs of agriculture, mining, manufacturing, and certain information industries,
                such as publishing.
              </p>
              <p className="text-base color-text-600">
                The wholesaling process is an intermediate step in the distribution of merchandise.
                Wholesalers are organized to sell or arrange the purchase or sale of (a) goods for
                resale (i.e., goods sold to other wholesalers or retailers), (b) capital or durable
                nonconsumer goods, and (c) raw and intermediate materials and supplies used in
                production. Wholesalers sell merchandise to other businesses and normally operate
                from a warehouse or office. These warehouses and offices are characterized by having
                little or no display of merchandise. In addition, neither the design nor the
                location of the premises is intended to solicit walk-in traffic. Wholesalers do not
                normally use advertising directed to the general public.{" "}
              </p>
              <p className="text-base color-text-600">
                The wholesaling process is an intermediate step in the distribution of merchandise.
                Wholesalers are organized to sell or arrange the purchase or sale of (a) goods for
                resale (i.e., goods sold to other wholesalers or retailers), (b) capital or durable
                nonconsumer goods, and (c) raw and intermediate materials and supplies used in
                production. Wholesalers sell merchandise to other businesses and normally operate
                from a warehouse or office. These warehouses and offices are characterized by having
                little or no display of merchandise. In addition, neither the design nor the
                location of the premises is intended to solicit walk-in traffic. Wholesalers do not
                normally use advertising directed to the general public.{" "}
              </p>
              <p className="text-base color-text-600">
                The wholesaling process is an intermediate step in the distribution of merchandise.
                Wholesalers are organized to sell or arrange the purchase or sale of (a) goods for
                resale (i.e., goods sold to other wholesalers or retailers), (b) capital or durable
                nonconsumer goods, and (c) raw and intermediate materials and supplies used in
                production. Wholesalers sell merchandise to other businesses and normally operate
                from a warehouse or office. These warehouses and offices are characterized by having
                little or no display of merchandise. In addition, neither the design nor the
                location of the premises is intended to solicit walk-in traffic. Wholesalers do not
                normally use advertising directed to the general public.{" "}
              </p>
              <Link to="" className="text-purple-700 text-base underline">
                Read more
              </Link>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 border border-gray-300 rounded-2xl space-y-6">
          <div className="flex justify-between gap-6 flex-col lg:flex-row">
            <div className="flex-1">
              <div className="prose">
                <h4>Insight:</h4>
              </div>
              <p className="mt-4 text-base">
                Wholesale trade plays a critical middleman role in distribution, relying on
                long-term B2B relationships rather than consumer outreach. Its workforce is heavily
                concentrated in transportation and sales, with transportation roles growing and
                sales roles shrinking, though both continue to have large replacement-driven hiring
                needs.
              </p>
            </div>
            <div className="flex">
              <img src={insightHero} alt="Insight hero" className="w-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 flex-col lg:flex-row">
        <CostCard
          title="Turnover Voluntary vs Involuntary "
          year="Q4 2023"
          voluntaryScore="60.2% Voluntary"
          involuntaryScore="39.8% Involuntary"
          industryText="Industry-wide cost of turnover:"
          industryCostText="$4.149.2M"
          industryTradeText="Industry: Whole Trade"
        />
        <CostCard
          title="Rate of Separation"
          year="Q2 2023"
          voluntaryScore="11.1% Hiring Rate"
          involuntaryScore="7.7% Separation"
          industryTradeText="Industry: Whole Trade"
        />
      </div>
      <div className="bg-white border border-gray-300 rounded-xl px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-medium">Area Median Wage: [State Name]</h3>
            <p className="text-base">Select an area to examine the median wage</p>
          </div>
          <div>
            <Select
              className="w-full flex items-start min-w-50"
              isRequired
              size="md"
              placeholder="Select Zip Code"
              items={items}
            >
              {item => (
                <Select.Item
                  id={item.id}
                  supportingText={item.supportingText}
                  isDisabled={item.isDisabled}
                  icon={item.icon}
                  avatarUrl={item.avatarUrl}
                >
                  {item.label}
                </Select.Item>
              )}
            </Select>
          </div>
        </div>
        <div className="flex justify-between gap-4 mt-6 flex-col lg:flex-row">
          <div className="flex-1">
            <WageBarChart />
          </div>
          <div className="space-y-4">
            <StaticCard
              title="Median Hourly Wages"
              itemAlign="between"
              count="$14.03"
              infoIcon={false}
              countClass="mt-9"
              classess="bg-secondary"
            />
            <StaticCard
              title="Median Living Wage"
              itemAlign="between"
              count="$24.03"
              infoIcon={false}
              countClass="mt-9"
              classess="bg-secondary"
            />
            <StaticCard
              title="National Average"
              itemAlign="between"
              count="$83,245"
              infoIcon={false}
              countClass="mt-9"
              classess="bg-secondary"
            />
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-300 rounded-xl px-6 py-8">
        <div className="flex items-center">
          <div className="space-y-4">
            <h3 className="text-2xl font-medium">Housing Burden</h3>
            <p className="text-base text-primary">
              Your workers residing in New Hampshire are likely financially burdened - meaning
              workers likely spend a large portion of their wages on housing and transportation
            </p>
            <p className="text-base text-primary">
              The concept of rent (or housing cost) burden applies to both renters and homeowners,
              but it’s calculated a bit differently for each. Both renters and homeowners can be
              housing-cost burdened; the main difference is what expenses are counted, not the
              income thresholds.
            </p>
            <div className="flex items-center justify-between gap-4 flex-col lg:flex-row">
              <p className="text-base text-primary">
                Rent Burdened: A household is considered rent burdened when it{" "}
                <strong>spends 30% or more of its gross income on rent and utilities.</strong> At
                this level, housing costs can start to limit spending on essentials like food,
                healthcare, and savings.
              </p>
              <p className="text-base text-primary">
                Severely Rent Burdened: A household is severely rent burdened when it{" "}
                <strong>spends 50% or more of its gross income on rent and utilities.</strong> This
                indicates a high risk of financial instability, leaving very little income for other
                basic needs.
              </p>
            </div>
          </div>
        </div>
        <hr className="border-t border-gray-200 mt-5 mb-6" />
        <div className="flex items-center justify-between flex-col lg:flex-row">
          <div className="space-y-1">
            <h3 className="text-xl font-medium flex items-center gap-2">
              Housing Cost Burdened Owners{" "}
              <Tooltip title="This is a tooltip">
                <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                  <InfoCircle className="size-5 text-gray-400" />
                </TooltipTrigger>
              </Tooltip>
            </h3>
            <p className="text-xs">Q4 2023</p>
          </div>
          <div>
            <Select
              className="w-full flex items-start min-w-50"
              isRequired
              size="md"
              placeholder="Select Zip Code"
              items={items}
            >
              {item => (
                <Select.Item
                  id={item.id}
                  supportingText={item.supportingText}
                  isDisabled={item.isDisabled}
                  icon={item.icon}
                  avatarUrl={item.avatarUrl}
                >
                  {item.label}
                </Select.Item>
              )}
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between w-full gap-4 mt-4 flex-col lg:flex-row">
          <StaticCard
            title="Burdened Owners"
            itemAlign="between"
            count="51.8%"
            infoIcon={true}
            tooltipText="How is this calculated"
            descriptionText="This is calculated based on LMI. Low-to-Moderate Income (LMI) consists of income less than 80% of the broader area's median income. "
            placements="top"
            classess="flex-1 bg-secondary"
          />
          <StaticCard
            title="Severely burdened Owners"
            itemAlign="between"
            count="39.8%"
            infoIcon={true}
            tooltipText="How is this calculated"
            descriptionText="This is calculated based on LMI. Low-to-Moderate Income (LMI) consists of income less than 80% of the broader area's median income. "
            placements="top"
            classess="flex-1 bg-secondary"
          />
        </div>
        <div className="flex items-center justify-between mt-6">
          <div className="space-y-1">
            <h3 className="text-xl font-medium">Housing Cost Burdened Renters</h3>
            <p className="text-xs">Q2 2023</p>
          </div>
        </div>
        <div className="flex items-center justify-between w-full gap-4 mt-4 flex-col lg:flex-row">
          <StaticCard
            title="Burdened Renters"
            itemAlign="between"
            count="11.1%"
            infoIcon={true}
            tooltipText="How is this calculated"
            descriptionText="This is calculated based on LMI. Low-to-Moderate Income (LMI) consists of income less than 80% of the broader area's median income. "
            placements="top"
            classess="flex-1 bg-secondary"
          />
          <StaticCard
            title="Severely burdened Renters"
            itemAlign="between"
            count="7.7%"
            infoIcon={true}
            tooltipText="How is this calculated"
            descriptionText="This is calculated based on LMI. Low-to-Moderate Income (LMI) consists of income less than 80% of the broader area's median income. "
            placements="top"
            classess="flex-1 bg-secondary"
          />
        </div>
        <div className="bg-white border border-gray-300 rounded-xl px-6 py-8 mt-6">
          <h3 className="text-2xl font-medium">Working Class Housing Cost Burden</h3>
          <p className="text-base text-primary w-full lg:w-2xl mt-2">
            Your highest participation rate is health insurance. 89% of your employees are using
            this benefit. Your lowest partitication rate is wellness program.{" "}
          </p>
          <div className="flex flex-wrap gap-5 my-6">
            <StaticCard
              title="Home Ownership Rate"
              itemAlign="between"
              titleClass="uppercase"
              count="72%"
              infoIcon={true}
              tooltipText="How is this calculated"
              descriptionText="This is calculated based on LMI. Low-to-Moderate Income (LMI) consists of income less than 80% of the broader area's median income. "
              placements="top"
              classess="flex-1 bg-secondary"
            />
            <StaticCard
              title="Median Home Value"
              itemAlign="between"
              titleClass="uppercase"
              count="$367,200"
              infoIcon={true}
              tooltipText="How is this calculated"
              descriptionText="This is calculated based on LMI. Low-to-Moderate Income (LMI) consists of income less than 80% of the broader area's median income. "
              placements="top"
              classess="flex-1 bg-secondary"
            />
            <StaticCard
              title="Median Rent"
              itemAlign="between"
              titleClass="uppercase"
              count="$1,423"
              infoIcon={true}
              tooltipText="How is this calculated"
              descriptionText="This is calculated based on LMI. Low-to-Moderate Income (LMI) consists of income less than 80% of the broader area's median income. "
              placements="top"
              classess="flex-1 bg-secondary"
            />
          </div>
          <div className="flex-1">
            <CostBurdenBarChart />
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

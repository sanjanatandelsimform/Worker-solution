"use client";
import { useState } from "react";
// import { Button } from "@/components/base/buttons/button";
import StaticCard from "../recommendations/StaticCard";
import { Select } from "@/components/base/select/select";
// import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
// import { InfoCircle } from "@untitledui/icons";
import { GetInTouchModal } from "@/components/modals/GetInTouchModal";
import { useAppSelector } from "@/store/hooks";
import {
  selectIndustryOverview,
  selectZipCodes,
  selectDashboardData,
} from "@/store/selectors/dashboardSelectors";
import { Label } from "@/components/base/input/label";

import { GlobeIcon } from "@/assets/icons/Globe";
import ProgressCard from "../benchmark/ProgressCard";
import didHeroImg from "@/assets/employees-reported.jpg";
import { EnrolledIcon } from "@/assets/icons/EnrolledIcon";
import { SavingIcon } from "@/assets/icons/SavingIcon";
import { HeartLineIcon } from "@/assets/icons/HeartLineIcon";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import DonutChart from "./EmployTypeChart";
import { Table, TableColumn } from "@/components/base/table";
import SalaryChart from "./SalaryChart";
import { Link } from "react-router-dom";

export default function WorkforcePage() {
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

  const columns: TableColumn[] = [
    { key: "department", header: "Department" },
    { key: "employeeNumber", header: "Employee number" },
    { key: "partTime", header: "Part time" },
    { key: "fullTime", header: "Full time" },
    { key: "salaryRange", header: "Salary range" },
  ];
  const users = [
    {
      department: "Design",
      employeeNumber: "8",
      partTime: "2",
      fullTime: "6",
      salaryRange: "$79,000-120,000",
    },
    {
      department: "Engineering",
      employeeNumber: "15",
      partTime: "4",
      fullTime: "11",
      salaryRange: "$110,000-140,000",
    },
    {
      department: "Human Resources",
      employeeNumber: "25",
      partTime: "5",
      fullTime: "20",
      salaryRange: "$130,000-200,000",
    },
    {
      department: "Product",
      employeeNumber: "5",
      partTime: "1",
      fullTime: "4",
      salaryRange: "$70,000-100,000",
    },
    {
      department: "Sales",
      employeeNumber: "5",
      partTime: "1",
      fullTime: "4",
      salaryRange: "$70,000-100,000",
    },
  ];

  const columnsOne: TableColumn[] = [
    { key: "salaryRange", header: "Salary range" },
    { key: "avgEmployeeCostPerPaycheck", header: "Avg. Employee cost per paycheck" },
    { key: "employerCostPerPaycheck", header: "Employer cost per paycheck" },
  ];
  const salary = [
    {
      salaryRange: "30k - 50k",
      avgEmployeeCostPerPaycheck: "120.22 (30%)",
      employerCostPerPaycheck: "$xx.xx",
    },
    {
      salaryRange: "50k - 70k",
      avgEmployeeCostPerPaycheck: "220.22 (60%)",
      employerCostPerPaycheck: "$xx.xx",
    },
    {
      salaryRange: "70k - 90k",
      avgEmployeeCostPerPaycheck: "330.22 (23%)",
      employerCostPerPaycheck: "$xx.xx",
    },
    {
      salaryRange: "90k - 110k",
      avgEmployeeCostPerPaycheck: "440.22 (40%)",
      employerCostPerPaycheck: "$xx.xx",
    },
    {
      salaryRange: "110k +",
      avgEmployeeCostPerPaycheck: "600.22 (60%)",
      employerCostPerPaycheck: "$xx.xx",
    },
  ];

  return (
    <div className="bg-ws-base-white py-10 px-6 space-y-6 shadow-xl rounded-b-xl">
      <div className="w-full flex items-start flex-col gap-4">
        <h2 className="text-2xl lg:text-4xl font-medium text-ws-text-primary leading-10">
          Workforce Information
        </h2>
        <p className="text-2xl text-ws-text-primary">Breakdown Overview</p>
      </div>

      {/* ── Industry Overview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <StaticCard
          title="Total Workforce"
          titleClass="text-sm font-medium text-ws-text-tertiary"
          itemAlign="between"
          count="3,120"
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
          title="Enrolled in Benefits"
          titleClass="text-sm font-medium text-ws-text-tertiary"
          itemAlign="between"
          count="2,450"
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
          title="Avg. Employee Cost Per Pay Period"
          titleClass="text-sm font-medium text-ws-text-tertiary"
          itemAlign="between"
          count="$2,254"
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <StaticCard
          title="Employer Cost Per Employee"
          titleClass="text-sm font-medium text-ws-text-tertiary"
          itemAlign="between"
          count="$11,240/yr"
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
          title="Avg. PTO Taken"
          titleClass="text-sm font-medium text-ws-text-tertiary"
          itemAlign="between"
          count="13"
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
          title="Avg. Sick Days Taken"
          titleClass="text-sm font-medium text-ws-text-tertiary"
          itemAlign="between"
          count="4"
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

      <div className="w-full mt-6">
          <div className="bg-ws-light-teal-50 flex gape-4 rounded-xl max-h-33 ring-1 ring-ws-border-primary">
            <div className="flex">
              <img
                src={didHeroImg}
                alt="Workforce hero"
                className="w-38 rounded-tl-xl rounded-bl-xl h-full object-cover"
              />
            </div>
            <div className="p-4 overflow-auto">
              <h4 className="text-base font-semibold mb-2 text-ws-light-teal-950">
                Did you know?
              </h4>
              <p className="text-lg text-ws-light-teal-950">
                <span className="font-semibold">78%</span> of employees reported they’re more likely to stay with an employer because of
              their benefits program.
              </p>
            </div>
          </div>
        </div>

      {/* ── Industry Turnover ── */}
      <div className="w-full flex flex-col items-center bg-ws-light-teal-25 border border-ws-border-primary rounded-xl py-8 px-6">
        <div className="w-full flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-4xl font-medium text-ws-text-primary">Participation Breakdown</h3>
            <p className="text-base text-ws-text-primary w-full mt-2">
              Your highest participation rate is health insurance. 89% of your employees are using
              this benefit. Your lowest partitication rate is wellness program.{" "}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full mt-4">
          <StaticCard
            classess="border-ws-border-secondary"
            title="Eligible Employees"
            titleClass="text-ws-text-tertiary text-sm"
            countIcon={<GlobeIcon className="size-5 text-ws-gray-300" />}
            count="2,450"
            countClass="text-ws-light-teal-900  text-3xl xl:text-4xl font-medium mt-6"
          />
          <StaticCard
            classess="border-ws-border-secondary"
            title="Enrolled Employees"
            titleClass="text-ws-text-tertiary text-sm"
            countIcon={<EnrolledIcon className="size-5 text-ws-gray-300" />}
            count="2,254"
            countClass="text-ws-light-teal-900  text-3xl xl:text-4xl font-medium mt-6"
          />
          <StaticCard
            classess="border-ws-border-secondary"
            title="Enrolled in retirement"
            titleClass="text-ws-text-tertiary text-sm"
            countIcon={<SavingIcon className="size-5 text-ws-gray-300" />}
            count="64%"
            countClass="text-ws-light-teal-900  text-3xl xl:text-4xl font-medium mt-6"
          />
          <StaticCard
            classess="border-ws-border-secondary"
            title="Enrolled in healthcare"
            titleClass="text-ws-text-tertiary text-sm"
            countIcon={<HeartLineIcon className="size-5 text-ws-gray-300" />}
            count="92%"
            countClass="text-ws-light-teal-900  text-3xl xl:text-4xl font-medium mt-6"
          />
        </div>
        <div className="w-full space-y-4 mt-4">
          <div className="flex items-center justify-between gap-4">
            <ProgressCard
              title="Benefits"
              showInfoIcon={false}
              tooltipText="Households spending 30% or more of gross income on housing costs"
              sections={[
                {
                  columnsCount: 1,
                  items: [
                    {
                      label: "FSA",
                      percentage: 16.2,
                      progressColor: "bg-ws-navy-300",
                    },
                    {
                      label: "Wellness",
                      percentage: 19.5,
                      progressColor: "bg-ws-navy-300",
                    },
                    {
                      label: "Employee Assist",
                      percentage: 19.5,
                      progressColor: "bg-ws-navy-300",
                    },
                  ],
                },
              ]}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <ProgressCard
              title="Retirement"
              showInfoIcon={false}
              tooltipText="Households spending 30% or more of gross income on housing costs"
              sections={[
                {
                  columnsCount: 1,
                  items: [
                    {
                      label: "401k",
                      percentage: 70.4,
                      progressColor: "bg-ws-light-teal-400",
                    },
                  ],
                },
              ]}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <ProgressCard
              title="Insurance"
              showInfoIcon={false}
              tooltipText="Households spending 30% or more of gross income on housing costs"
              sections={[
                {
                  columnsCount: 1,
                  items: [
                    {
                      label: "Health",
                      percentage: 16.2,
                      progressColor: "bg-ws-light-teal-300",
                    },
                    {
                      label: "Dental",
                      percentage: 19.5,
                      progressColor: "bg-ws-light-teal-300",
                    },
                    {
                      label: "Vision",
                      percentage: 19.5,
                      progressColor: "bg-ws-light-teal-300",
                    },
                    {
                      label: "Life",
                      percentage: 19.5,
                      progressColor: "bg-ws-light-teal-300",
                    },
                  ],
                },
              ]}
            />
          </div>
          {/* <div className="bg-ws-base-white p-5 border border-ws-border-primary rounded-xl w-full flex flex-col relative">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-ws-text-primary">Employees with dependents</h2>
              <p className="text-sm text-ws-text-primary flex items-center gap-3">
                <span className="flex w-4 h-4 bg-ws-primary-300"></span>With dependents 68%
              </p>
            </div>
            <ProgressBar
              value={70.4}
              max={100}
              className="h-4 rounded-none mt-4"
              customColor="bg-ws-primary-300 rounded-none"
            />
          </div> */}
        </div>
      </div>

      <div className="w-full flex flex-col bg-ws-light-teal-25 border border-ws-border-primary rounded-xl py-8 px-6 space-y-4">
        <div className="w-full flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-4xl font-medium text-ws-text-primary">Demographics</h3>
            <p className="text-base text-ws-text-primary max-w-2xl mt-4">
              Demographics lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          <div className="flex flex-col items-start w-full lg:w-auto shrink-0">
            <Label className="text-sm font-medium text-ws-text-secondary flex mb-1.5 mt-6">
              Department
            </Label>
            <Select
              className="w-full flex items-start min-w-50 md:min-w-full lg:min-w-50"
              isRequired
              size="md"
              placeholder="All"
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
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            <StaticCard
              title="Women"
              titleClass="text-sm font-medium text-ws-text-tertiary"
              itemAlign="between"
              count="32%"
              countClass={
                industryOverview?.turnoverRate?.rate == null
                  ? "mt-2 text-sm font-medium text-ws-text-tertiary"
                  : "mt-2 text-3xl font-semibold text-ws-text-primary"
              }
              infoIcon={true}
              infoCircleClass="text-ws-gray-70 size-5"
              tooltipText="Turnover Rate"
              descriptionText="Industry specific turnover metrics are calculated from US Census Bureau QWI data sources"
              placements="top"
            />
            <StaticCard
              title="Men"
              titleClass="text-sm font-medium text-ws-text-tertiary"
              itemAlign="between"
              count="68%"
              countClass={
                industryOverview?.avgTurnover?.rate == null
                  ? "mt-2 text-sm font-medium text-ws-text-tertiary"
                  : "mt-2 text-3xl font-semibold text-ws-text-primary"
              }
              infoIcon={true}
              infoCircleClass="text-ws-gray-70 size-5"
              tooltipText="Average Turnover"
              descriptionText="Average turnover metrics are calculated from US Census Bureau QWI data sources"
              placements="top"
            />
          </div>
        </div>
        <div className="bg-ws-base-white p-5 border border-ws-border-primary rounded-xl w-full flex flex-col relative">
          <h2 className="text-2xl font-medium text-ws-text-primary">Employment type</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full my-6">
            <DonutChart
              percentage={60}
              label="Full Time"
              progressColor="color-ws-progress-primary"
              backgroundColor="bg-ws-progress-primary"
              width={200}
              strokeWidth={25}
            />
            <DonutChart
              percentage={23}
              label="Part Time"
              progressColor="color-ws-progress-secondary"
              backgroundColor="bg-ws-progress-secondary"
              width={200}
              strokeWidth={25}
            />
            <DonutChart
              percentage={7}
              label="Seasonal"
              progressColor="color-ws-progress-turnery"
              backgroundColor="bg-ws-progress-turnery"
              width={200}
              strokeWidth={25}
            />
          </div>
        </div>
        <div className="bg-ws-base-white p-5 border border-ws-border-primary rounded-xl w-full flex flex-col relative">
          <div className="w-full flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-2xl font-medium text-ws-text-primary">Employment Breakdown by Age</h3>
            </div>
            <div className="flex flex-col items-start w-full lg:w-auto shrink-0">
              <Label className="text-sm font-medium text-ws-text-secondary flex mb-1.5">
                Employment type <span className="text-ws-error-600">*</span>
              </Label>
              <Select
                className="w-full flex items-start min-w-xl md:min-w-full lg:min-w-50"
                isRequired
                size="md"
                placeholder="All"
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
          <div className="space-y-2 mt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-30">Age: &gt; 30</div>
              <ProgressBar
                value={10}
                max={100}
                className="h-6 rounded-none"
                customColor="bg-ws-light-teal-400 rounded-none"
              />
              <div className="flex min-w-8">10%</div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-30">Age: 30 - 40</div>
              <ProgressBar
                value={30}
                max={100}
                className="h-6 rounded-none"
                customColor="bg-ws-light-teal-700 rounded-none"
              />
              <div className="flex min-w-8">30%</div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-30">Age: 40 - 50</div>
              <ProgressBar
                value={45}
                max={100}
                className="h-6 rounded-none"
                customColor="bg-ws-light-teal-100 rounded-none"
              />
              <div className="flex min-w-8">45%</div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-30">Age: 50 - 60</div>
              <ProgressBar
                value={10}
                max={100}
                className="h-6 rounded-none"
                customColor="bg-ws-light-teal-300 rounded-none"
              />
              <div className="flex min-w-8">10%</div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-30">Age: 60 +</div>
              <ProgressBar
                value={5}
                max={100}
                className="h-6 rounded-none"
                customColor="bg-ws-light-teal-950 rounded-none"
              />
              <div className="flex min-w-8">5%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col bg-ws-light-teal-25 border border-ws-border-primary rounded-xl py-8 px-6">
        <div className="w-full flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-4xl font-medium text-ws-text-primary">Compensation</h3>
            <p className="text-base text-ws-text-tertiary">
              Compensation lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>
        <div className="grid xl:grid-cols-3 gap-4 mt-6 flex-col lg:flex-row">
          <StaticCard
            title="Median Base Salary"
            titleClass="text-sm font-medium text-ws-text-tertiary"
            itemAlign="between"
            count="$123,000/yr"
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
          />
          <StaticCard
            title="Average Salary"
            itemAlign="between"
            titleClass="text-sm font-medium text-ws-text-tertiary"
            count="$6,012.33"
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
          />
          <StaticCard
            title="Average Hourly Wage"
            itemAlign="between"
            titleClass="text-sm font-medium text-ws-text-tertiary"
            count="$25.22"
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
          />
        </div>

        <div className="w-full border-t border-ws-border-primary mt-8">
          <div className="w-full flex items-center justify-between mt-8">
            <div className="space-y-1 w-full">
              <h3 className="text-2xl font-medium text-ws-text-primary">Workforce Breakdown</h3>
              <p className="max-w-3xl text-base text-ws-text-secondary">
                Here you can find how your workforce is broken down by job types.{" "}
              </p>
            </div>
            <div className="flex flex-col items-start w-full lg:w-auto shrink-0">
              <Label className="text-ws-text-secondary flex mb-1.5">
                Department <span className="text-ws-error-600">*</span>
              </Label>
              <Select
                className="w-full flex items-start min-w-70 md:min-w-full lg:min-w-50"
                isRequired
                size="md"
                placeholder="All"
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
          <div className="bg-ws-base-white border border-ws-border-primary rounded-xl w-full mt-4">
            <Table data={users} columns={columns} variant="striped" size="md" />
          </div>
          <div className="w-full border-t border-ws-border-primary mt-8">
          <div className="w-full flex items-center justify-between mt-8">
            <div className="space-y-1 w-full">
              <h3 className="text-2xl font-medium text-ws-text-primary">Salary Breakdown</h3>
              <p className="max-w-3xl text-base text-ws-text-secondary">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
          </div>
          </div>
          <div className="grid xl:grid-cols-2 gap-4 mt-6 flex-col lg:flex-row">
            <StaticCard
              title="Employee Contribution Per Paycheck (All benefits)"
              titleClass="text-sm font-medium text-ws-text-tertiary mb-14"
              itemAlign="between"
              count="$468.33"
              countClass={
                selectedHousingData?.workingClassHousingCostBurden?.homeOwnershipRate == null
                  ? "mt-2 text-sm font-medium text-ws-text-primary"
                  : "mt-2 text-3xl font-semibold text-ws-text-primary"
              }
              infoIcon={true}
              infoCircleClass="text-ws-gray-70"
              tooltipText="Home Ownership Rate"
              descriptionText="U.S. Census Bureau, 5-Year American Community Survey"
              placements="top"
            />
            <StaticCard
              title="Employer Cost Per Employee (Avg)"
              itemAlign="between"
              titleClass="text-sm font-medium text-ws-text-tertiary mb-14"
              count="$11,240/yr"
              countClass={
                selectedHousingData?.workingClassHousingCostBurden?.medianHomeValue == null
                  ? "mt-2 text-sm font-medium text-ws-text-primary"
                  : "mt-2 text-3xl font-semibold text-ws-text-primary"
              }
              infoIcon={true}
              infoCircleClass="text-ws-gray-70"
              tooltipText="Median Home Value"
              descriptionText="U.S. Census Bureau, 5-Year American Community Survey"
              placements="top"
            />
          </div>
          {/* Chart */}
          <div className="bg-ws-base-white border border-ws-border-primary flex-1 w-full overflow-x-auto mt-6 rounded-xl">
            <SalaryChart />
          </div>
          <div className="bg-ws-base-white border border-ws-border-primary rounded-xl w-full mt-4">
            <Table data={salary} columns={columnsOne} variant="striped" size="md" />
          </div>
        </div>
      </div>
      <div className="w-full">
        <p className="text-ws-text-secondary text-sm mb-4">All data metrics provided through Finch are based on the most current information accessible at the time of reporting, as of September 2025.</p>
        <p className="text-xs/5 text-ws-text-primary">
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

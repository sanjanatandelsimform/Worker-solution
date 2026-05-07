import StaticCard from "@/pages/recommendations/StaticCard";
import { Select } from "@/components/base/select/select";
import { Label } from "@/components/base/input/label";
import DonutChart from "@/pages/workforce/EmployTypeChart";
import InlineProgressBar from "@/components/base/progress-indicators/InlineProgressBar";
import {
  OverviewCardSkeleton,
  DonutChartSkeleton,
  BreakDownCardSkeleton,
} from "@/pages/workforce/WorkforceSkeletons";
import { ArrowDown } from "@/assets/icons/ArrowDown";

const employmentTypeItems = [
  { id: "fullTime", label: "Full Time" },
  { id: "partTime", label: "Part Time" },
  { id: "seasonal", label: "Seasonal" },
];

interface DemographicsCardConfig {
  id: string;
  title: string;
  count: string;
  tooltipText?: string;
  getCountClass: () => string;
}

interface DonutChartConfig {
  id: string;
  label: string;
  percentage: number;
  progressColor: string;
  backgroundColor: string;
}

interface AgeBreakdownConfig {
  id: string;
  label: string;
  value: number;
  customColor: string;
}

interface DropdownItem {
  id: string;
  label: string;
}

type EmploymentType = "fullTime" | "partTime" | "seasonal";

interface WorkforceDemographicsProps {
  readonly isLoading: boolean;
  readonly selectedDepartment: string;
  readonly setSelectedDepartment: (dept: string) => void;
  readonly selectedEmploymentType: EmploymentType;
  readonly setSelectedEmploymentType: (type: EmploymentType) => void;
  readonly demographicsCardsConfig: DemographicsCardConfig[];
  readonly donutChartsConfig: DonutChartConfig[];
  readonly ageBreakdownConfig: AgeBreakdownConfig[];
  readonly departmentItems: DropdownItem[];
}

/** Renders the Demographics section: gender breakdown, employment type charts, and age breakdown. */
export default function WorkforceDemographics({
  isLoading,
  selectedDepartment,
  setSelectedDepartment,
  selectedEmploymentType,
  setSelectedEmploymentType,
  demographicsCardsConfig,
  donutChartsConfig,
  ageBreakdownConfig,
  departmentItems,
}: Readonly<WorkforceDemographicsProps>) {
  return (
    <div className="w-full flex flex-col bg-ws-light-teal-25 border border-ws-border-primary rounded-xl py-8 px-6 space-y-4">
      <div className="w-full flex items-start justify-between flex-col xl:flex-row">
        <div className="space-y-1">
          <h3 className="text-2xl lg:text-4xl font-medium text-ws-base-black">Demographics</h3>
          <p className="text-base font-normal text-ws-text-tertiary max-w-2xl mt-4">
            A snapshot of your workforce by gender, employment type, and age. This helps you tailor
            benefits to the people behind the numbers.
          </p>
        </div>
        <div className="flex flex-col items-start w-full lg:w-auto shrink-0 my-3 xl:my-0 lg:min-w-71">
          <Label className="text-sm font-medium text-ws-text-secondary flex mb-1.5 mt-6">
            Department
          </Label>
          <Select
            className="w-full flex items-start min-w-50 md:min-w-full lg:min-w-50"
            isRequired
            size="md"
            placeholder="All"
            items={departmentItems}
            value={selectedDepartment}
            onSelectionChange={key => {
              if (key) {
                setSelectedDepartment(String(key));
              }
            }}
          >
            {item => <Select.Item id={item.id}>{item.label}</Select.Item>}
          </Select>
        </div>
      </div>
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {isLoading ? (
            <>
              <OverviewCardSkeleton />
              <OverviewCardSkeleton />
            </>
          ) : (
            <>
              {demographicsCardsConfig.map(card => (
                <StaticCard
                  key={card.id}
                  title={card.title}
                  titleClass="text-sm font-medium text-ws-text-tertiary"
                  itemAlign="between"
                  count={card.count}
                  countClass={card.getCountClass()}
                  infoIcon={!!card.tooltipText}
                  infoCircleClass="text-ws-gray-70 size-5"
                  tooltipText={card.tooltipText}
                  placements="top"
                  countWrap="text-3xl font-semibold text-ws-text-primary"
                />
              ))}
            </>
          )}
        </div>
      </div>
      <div className="bg-ws-base-white p-5 border border-ws-border-primary rounded-xl w-full flex flex-col relative">
        <h2 className="text-2xl font-medium text-ws-text-primary">Employment Type</h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full my-6 space-y-6 xl:space-y-0">
          {isLoading ? (
            <>
              <DonutChartSkeleton />
              <DonutChartSkeleton />
              <DonutChartSkeleton />
            </>
          ) : (
            <>
              {donutChartsConfig.map(chart => (
                <DonutChart
                  key={chart.id}
                  percentage={chart.percentage}
                  label={chart.label}
                  progressColor={chart.progressColor}
                  backgroundColor={chart.backgroundColor}
                  width={200}
                  strokeWidth={25}
                />
              ))}
            </>
          )}
        </div>
      </div>
      <div className="bg-ws-base-white p-5 border border-ws-border-primary rounded-xl w-full flex flex-col relative">
        <div className="w-full flex items-start xl:items-center justify-between flex-col xl:flex-row">
          <div className="space-y-1 ">
            <h3 className="text-2xl font-medium text-ws-text-primary">
              Employment Breakdown by Age
            </h3>
          </div>
          <div className="flex flex-col items-start w-full lg:w-auto shrink-0 mt-4 xl:mt-0 lg:min-w-71">
            <Label className="text-sm font-medium text-ws-text-secondary flex mb-1.5">
              Employment Type{" "}
              <span className="text-ws-error-600">
                <ArrowDown className="inline-block ml-1" />
              </span>
            </Label>
            <Select
              className="w-full flex items-start min-w-xl md:min-w-full lg:min-w-50"
              isRequired
              size="md"
              placeholder="Full Time"
              items={employmentTypeItems}
              value={selectedEmploymentType}
              onSelectionChange={key => {
                if (key) {
                  setSelectedEmploymentType(key as "fullTime" | "partTime" | "seasonal");
                }
              }}
            >
              {item => <Select.Item id={item.id}>{item.label}</Select.Item>}
            </Select>
          </div>
        </div>
        <div className="space-y-2 mt-6">
          {isLoading ? (
            <BreakDownCardSkeleton />
          ) : (
            <>
              {ageBreakdownConfig.map(item => (
                <div key={item.id} className="flex items-center justify-between gap-4">
                  <div className="text-base font-normal text-ws-text-secondary min-w-30">
                    {item.label}
                  </div>
                  <InlineProgressBar
                    percentage={item.value}
                    color={item.customColor}
                    className="h-6"
                  />
                  {/* <div className="flex min-w-8 text-base font-normal text-ws-base-black">
                    {item.value}%
                  </div> */}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

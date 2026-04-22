import StaticCard from "@/pages/recommendations/StaticCard";
import { Select } from "@/components/base/select/select";
import { Label } from "@/components/base/input/label";
import { Table } from "@/components/base/table";
import type { TableColumn } from "@/components/base/table";
import SalaryChart from "@/pages/workforce/SalaryChart";
import emptyStateWorkforce from "@/assets/placeholder.svg";
import { OverviewCardSkeleton, BreakDownChartSkeleton } from "@/pages/workforce/WorkforceSkeletons";
import { ArrowDown } from "@/assets/icons/ArrowDown";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { InfoCircle } from "@untitledui/icons";

interface CompensationCardConfig {
  id: string;
  title: string;
  count: string;
  tooltipText: string;
  getCountClass: () => string;
}

interface SalaryBreakdownCardConfig {
  id: string;
  title: string;
  count: string;
  tooltipText: string;
  getCountClass: () => string;
}

interface DropdownItem {
  id: string;
  label: string;
}

type ChartItem = {
  label: string;
  min: number;
  boxStart: number;
  boxEnd: number;
  max: number;
};

interface WorkforceCompensationProps {
  readonly isLoading: boolean;
  readonly selectedWorkforceDept: string;
  readonly setSelectedWorkforceDept: (dept: string) => void;
  readonly compensationCardsConfig: CompensationCardConfig[];
  readonly salaryBreakdownCardsConfig: SalaryBreakdownCardConfig[];
  readonly workforceDepartmentItems: DropdownItem[];
  readonly columns: TableColumn[];
  readonly users: Record<string, string>[];
  readonly columnsOne: TableColumn[];
  readonly salary: Record<string, string>[];
  readonly salaryChartData: ChartItem[];
}

/** Renders the Compensation section: salary stats, workforce breakdown table, benefits cost breakdown, and salary chart. */
export default function WorkforceCompensation({
  isLoading,
  selectedWorkforceDept,
  setSelectedWorkforceDept,
  compensationCardsConfig,
  salaryBreakdownCardsConfig,
  workforceDepartmentItems,
  columns,
  users,
  columnsOne,
  salary,
  salaryChartData,
}: WorkforceCompensationProps) {
  return (
    <div className="w-full flex flex-col bg-ws-light-teal-25 border border-ws-border-primary rounded-xl py-8 px-6">
      <div className="w-full flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl xl:text-4xl font-medium text-ws-base-black">Compensation</h3>
          <p className="text-base font-normal text-ws-text-secondary">
            A look at how your organization compensates employees, from base salaries to hourly
            wages, so you can benchmark and stay competitive.
          </p>
        </div>
      </div>
      <div className="grid xl:grid-cols-3 gap-4 mt-6 flex-col lg:flex-row">
        {isLoading ? (
          <>
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
          </>
        ) : (
          <>
            {compensationCardsConfig.map(card => (
              <StaticCard
                key={card.id}
                title={card.title}
                titleClass="text-sm font-medium text-ws-text-tertiary"
                itemAlign="between"
                count={card.count}
                countClass={card.getCountClass()}
                infoIcon={false}
                infoCircleClass="text-ws-gray-70"
                tooltipText={card.tooltipText}
                descriptionText=""
                placements="top"
                countWrap="text-3xl font-semibold text-ws-text-primary"
              />
            ))}
          </>
        )}
      </div>

      <div className="w-full border-t border-ws-border-primary mt-8">
        <div className="w-full flex items-start justify-between mt-8 flex-col xl:flex-row">
          <div className="space-y-1 w-full">
            <h3 className="text-2xl font-medium text-ws-text-primary">Workforce Breakdown</h3>
            <p className="max-w-3xl text-base font-normal text-ws-text-secondary">
              Filter your workforce is broken down by job types.
            </p>
          </div>
          <div className="flex flex-col items-start w-full lg:w-auto shrink-0 mt-4 xl:mt-0 lg:min-w-71">
            <Label className="text-ws-text-secondary flex mb-1.5">
              Department{" "}
              <span className="text-ws-error-600">
                * <ArrowDown className="inline-block ml-1" />
              </span>
            </Label>
            <Select
              className="w-full flex items-start min-w-70 md:min-w-full lg:min-w-50"
              isRequired
              size="md"
              placeholder="All"
              items={workforceDepartmentItems}
              value={selectedWorkforceDept}
              onSelectionChange={key => {
                if (key) {
                  setSelectedWorkforceDept(String(key));
                }
              }}
            >
              {item => <Select.Item id={item.id}>{item.label}</Select.Item>}
            </Select>
            {/* <p className="text-xs text-ws-text-tertiary mt-1">
              This is a hint text to help user.
            </p> */}
          </div>
        </div>
        {isLoading ? (
          <div className="bg-ws-base-white border border-ws-border-primary rounded-xl w-full mt-4">
            <div className="w-lg flex items-center justify-center flex-col p-15 mx-auto">
              <img src={emptyStateWorkforce} alt="Empty state" className="mb-4" />
              <h2 className="text-2xl/8 font-medium text-ws-text-tertiary mb-1">
                We're still collecting data
              </h2>
              <p className="text-base/6 text-ws-text-tertiary">
                We're getting things ready for you. Your dashboard will populate once data is
                collected. Check back soon.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-ws-base-white border border-ws-border-primary rounded-xl w-full mt-4">
            <Table data={users} columns={columns} variant="striped" size="md" />
          </div>
        )}
        <div className="w-full border-t border-ws-border-primary mt-8">
          <div className="w-full flex items-center justify-between mt-8">
            <div className="space-y-1 w-full">
              <h3 className="text-2xl font-medium text-ws-text-primary">Benefits Cost Breakdown</h3>
              <p className="max-w-3xl text-base font-normal text-ws-text-primary">
                See how benefits costs are distributed across salary bands, including what employees
                contribute per paycheck and what it costs you as the employer.
              </p>
            </div>
          </div>
        </div>
        <div className="grid xl:grid-cols-2 gap-4 mt-6 flex-col lg:flex-row">
          {isLoading ? (
            <>
              <OverviewCardSkeleton />
              <OverviewCardSkeleton />
            </>
          ) : (
            <>
              {salaryBreakdownCardsConfig.map(card => (
                <StaticCard
                  key={card.id}
                  title={card.title}
                  titleClass="text-sm font-medium text-ws-text-tertiary mb-14"
                  itemAlign="between"
                  count={card.count}
                  countClass={card.getCountClass()}
                  infoIcon={true}
                  infoCircleClass="text-ws-gray-70 w-5"
                  tooltipText={card.tooltipText}
                  placements="top"
                  countWrap="text-3xl font-semibold text-ws-text-primary"
                />
              ))}
            </>
          )}
        </div>
        {/* Chart */}
        <div className="bg-ws-base-white border border-ws-border-primary flex-1 w-full overflow-x-auto mt-6 rounded-xl">
          <h2 className="flex items-center mb-8 text-2xl font-medium text-ws-text-primary py-8 px-6 pb-0 gap-2">Employee Contribution Per Paycheck Across Salary Bands
            <span>
              <Tooltip title={false} description="Each bar indicates highest and lowest contribution across employees within a specific salary band per paycheck" placement="top" arrow={true}>
              <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                <InfoCircle className="text-ws-gray-400 w-5" />
              </TooltipTrigger>
            </Tooltip>
            </span>
          </h2>
          {isLoading ? (
            <BreakDownChartSkeleton />
          ) : (
            <SalaryChart
              data={salaryChartData}
              //title="Employee Contribution Per Paycheck Across Salary Bands"
              //tooltipText="Shows the range of employee contribution across employees within a specific salary band per paycheck"
            />
          )}
        </div>
        {isLoading ? (
          <div className="bg-ws-base-white border border-ws-border-primary rounded-xl w-full mt-4">
            <div className="w-lg flex items-center justify-center flex-col p-15 mx-auto">
              <img src={emptyStateWorkforce} alt="Empty state" className="mb-4" />
              <h2 className="text-2xl/8 font-medium text-ws-text-tertiary mb-1">
                We're still collecting data
              </h2>
              <p className="text-base/6 text-ws-text-tertiary">
                We're getting things ready for you. Your dashboard will populate once data is
                collected. Check back soon.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-ws-base-white border border-ws-border-primary rounded-xl w-full mt-4">
            <Table data={salary} columns={columnsOne} variant="striped" size="md" />
          </div>
        )}
      </div>
    </div>
  );
}

import HourlyChart from "./HourlyChart";
import SalaryChart from "./SalaryChart";

interface ComparisonData {
  industryAverage: number;
  nationalAverage: number;
}

interface SalaryHourlyComparisonChartProps {
  readonly salaryData: ComparisonData;
  readonly hourlyData: ComparisonData;
  readonly sourceAttribution?: string;
}

export const SalaryHourlyComparisonChart = ({
  salaryData,
  hourlyData,
  sourceAttribution = "Source: BLS, 2029",
}: SalaryHourlyComparisonChartProps) => {
  return (
    <div className="w-full rounded-lg border border-ws-border-primary bg-ws-base-white p-6">
      {/* Title */}
      <h2 className="mb-8 text-2xl font-medium text-ws-text-primary">Salary & Hourly Comparison</h2>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Salary Card */}
        <div className="flex flex-col">
          <h3 className="w-full flex items-center justify-center text-lg font-normal text-ws-text-primary">
            Salary
          </h3>
          <SalaryChart data={salaryData} width={500} height={350} />
        </div>

        {/* Hourly Card */}
        <div className="flex flex-col">
          <h3 className="w-full flex items-center justify-center text-lg font-normal text-ws-text-primary">
            Hourly
          </h3>
          <HourlyChart data={hourlyData} width={500} height={350} />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-start gap-8">
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-3.5 bg-ws-light-teal-400" />
          <span className="text-sm font-medium text-ws-text-primary">Industry average</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-3.5 bg-ws-light-teal-800" />
          <span className="text-sm font-medium text-ws-text-primary">National average</span>
        </div>
        <div className="ml-auto text-xs text-ws-gray-700">{sourceAttribution}</div>
      </div>
    </div>
  );
};
export default SalaryHourlyComparisonChart;

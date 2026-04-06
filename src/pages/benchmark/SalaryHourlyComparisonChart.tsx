import SalaryChart from "./SalaryChart";
import HourlyChart from "./HourlyChart";

interface ComparisonData {
  industryAverage: number;
  nationalAverage: number;
}

interface SalaryHourlyComparisonChartProps {
  readonly salaryData: ComparisonData;
  readonly hourlyData: ComparisonData;
  readonly sourceAttribution?: string;
}

export default function SalaryHourlyComparisonChart({
  salaryData,
  hourlyData,
  sourceAttribution = "Source: BLS, 2023",
}: SalaryHourlyComparisonChartProps) {
  return (
    <div className="w-full rounded-lg border border-ws-gray-30 bg-ws-white p-6">
      {/* Title */}
      <h2 className="mb-8 text-2xl font-medium text-ws-black-90">Salary & Hourly Comparison</h2>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-8">
        {/* Salary Card */}
        <div className="flex flex-col">
          <h3 className="w-full flex items-center justify-center text-lg font-medium text-ws-black-90">Salary</h3>
          <SalaryChart data={salaryData} width={500} height={350} />
        </div>

        {/* Hourly Card */}
        <div className="flex flex-col">
          <h3 className="w-full flex items-center justify-center text-lg font-medium text-ws-black-90">Hourly</h3>
          <HourlyChart data={hourlyData} width={500} height={350} />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-start gap-8">
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-3.5 bg-ws-progress-primary" />
          <span className="text-sm font-medium text-ws-black-90">Industry average 44</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-3.5 bg-ws-primary-400" />
          <span className="text-sm font-medium text-ws-black-90">National average 66</span>
        </div>
        <div className="ml-auto text-xs text-ws-gray-90">{sourceAttribution}</div>
      </div>
    </div>
  );
}

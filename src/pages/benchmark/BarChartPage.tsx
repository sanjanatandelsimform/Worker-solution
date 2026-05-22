import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Label,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltipContent } from "@/components/application/charts/charts-base";
import { selectEvenlySpacedItems } from "@/components/application/charts/chart-utils";

export const BarChartPage = () => {
  const colors: Record<string, string> = {
    A: "text-utility-brand-600",
    B: "text-utility-brand-400",
  };

  const data = [
    { A: 633, B: 190, date: "2025-01-01" },
    { A: 443, B: 228, date: "2025-01-08" },
    { A: 506, B: 225, date: "2025-01-15" },
    { A: 316, B: 227, date: "2025-01-22" },
    { A: 760, B: 209, date: "2025-01-29" },
    { A: 950, B: 220, date: "2025-02-05" },
    { A: 760, B: 224, date: "2025-02-12" },
    { A: 570, B: 279, date: "2025-02-19" },
    { A: 253, B: 296, date: "2025-02-26" },
  ];

  return (
    <div className="flex h-60 flex-col gap-2">
      <ResponsiveContainer className="h-full">
        <ComposedChart
          data={data}
          margin={{
            left: 4,
            right: 0,
            top: 12,
            bottom: 18,
          }}
          className="text-ws-text-tertiary [&_.recharts-text]:text-xs"
        >
          <CartesianGrid vertical={false} stroke="currentColor" className="text-utility-gray-100" />

          <XAxis
            fill="currentColor"
            axisLine={false}
            tickLine={false}
            tickMargin={2}
            interval="preserveStartEnd"
            dataKey="date"
            tickFormatter={(value: string | number) =>
              new Date(value).toLocaleDateString(undefined, { month: "short" })
            }
            ticks={selectEvenlySpacedItems(data, 2).map(item => item.date)}
          >
            <Label
              value="Week starting"
              fill="currentColor"
              className="!text-xs font-medium"
              position="bottom"
            />
          </XAxis>

          <YAxis
            fill="currentColor"
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            tickFormatter={(value: string | number) => Number(value).toLocaleString()}
          >
            <Label
              //value="Active users"
              fill="currentColor"
              className="!text-xs font-medium"
              style={{ textAnchor: "middle" }}
              angle={-90}
              position="insideLeft"
            />
          </YAxis>

          <Tooltip
            content={<ChartTooltipContent />}
            formatter={value =>
              value !== undefined && !Array.isArray(value) ? Number(value).toLocaleString() : ""
            }
            // Custom label formatter to show the week range
            labelFormatter={(value: React.ReactNode) => {
              if (!value) return "";
              const date = new Date(String(value));
              const endDate = new Date(date);
              endDate.setDate(date.getDate() + 6); // Set end date to 7 days after start date

              // If the start and end dates are in the same month, shorten the label (Jun 1-7, 2025)
              if (date.getMonth() === endDate.getMonth()) {
                return `${date.toLocaleDateString(undefined, { month: "long" })} ${date.getDate()}-${endDate.getDate()}, ${endDate.getFullYear()}`;
              }

              // Otherwise, show the full month range (May 30 - Jun 5, 2025)
              return `${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
            }}
            cursor={{
              className: "fill-utility-gray-200/20",
            }}
          />

          <Bar
            isAnimationActive={false}
            className={colors["A"]}
            name="Mobile"
            dataKey="A"
            type="monotone"
            stackId="a"
            fill="currentColor"
            maxBarSize={58}
            radius={[0, 0, 0, 0]}
          />
          <Line
            isAnimationActive={false}
            className={colors["B"]}
            dataKey="B"
            name="Desktop"
            type="monotone"
            stroke="currentColor"
            strokeWidth={0}
            strokeDasharray="0.1 8"
            strokeLinecap="round"
            activeDot={false}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

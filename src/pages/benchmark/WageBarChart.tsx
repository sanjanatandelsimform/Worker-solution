/**
 * BarChartPage - Pixel-perfect implementation from Figma design
 * Figma node: 387-6365
 * Shows stacked bar comparison chart with three overlapping bars
 */

// SVG-based stacked bar chart component (no recharts dependency)
const StackedBarChart = ({
  data,
}: {
  data: Array<{ name: string; value: number; color: string; opacity?: number }>;
}) => {
  const width = 173.077;
  const height = 320;
  const barWidth = 57.692;

  return (
    <div className="relative inline-grid" style={{ width: `${width}px`, height: `${height}px` }}>
      {data.map(bar => {
        const barHeight = (bar.value / 100) * height;
        const xPosition = data.indexOf(bar) * barWidth;
        const yPosition = height - barHeight;

        return (
          <div
            key={bar.name}
            className="absolute"
            style={{
              left: `${xPosition}px`,
              top: `${yPosition}px`,
              width: `${barWidth}px`,
              height: `${barHeight}px`,
            }}
          >
            <div
              className="absolute inset-0 rounded-xs border border-gray-300"
              style={{
                backgroundColor: bar.color,
                opacity: bar.opacity ?? 0.8,
                borderColor: data.indexOf(bar) === 2 ? "#000000" : "#D5D7DA",
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export const WageBarChart = () => {
  // Data based on Figma design specifications
  const salaryData = [
    { name: "Industry average", value: 33.75, color: "#00C4C7", opacity: 0.8 }, // Teal - 108px height
    { name: "Your company", value: 54.375, color: "#22CCEE", opacity: 0.8 }, // Cyan - 174px height
    { name: "National average", value: 100, color: "#DBEBEB", opacity: 0.32 }, // Teal lite - 320px height (40% opacity)
  ];

  const hourlyData = [
    { name: "Industry average", value: 33.75, color: "#00C4C7", opacity: 0.8 },
    { name: "Your company", value: 54.375, color: "#22CCEE", opacity: 0.8 },
    { name: "National average", value: 100, color: "#DBEBEB", opacity: 0.32 },
  ];

  return (
    <div className="bg-white border border-gray-300 rounded-xl p-6 flex flex-col gap-5 size-full w-full">
      {/* Charts Container */}
      <div className="flex gap-8 items-center justify-center">
        {/* Salary Chart */}
        <div className="flex flex-col gap-3.25 items-center justify-center">
          <StackedBarChart data={salaryData} />
          <p className="font-normal text-lg leading-7 text-black text-center min-w-full">Salary</p>
        </div>

        {/* Hourly Chart */}
        <div className="flex flex-col gap-3.25 items-center justify-center">
          <StackedBarChart data={hourlyData} />
          <p className="font-normal text-lg leading-7 text-black text-center min-w-full">Hourly</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 items-center justify-center w-full">
        <div className="flex gap-4 items-center">
          <div className="size-4.5 rounded-xs" style={{ backgroundColor: "#00C4C7" }} />
          <p className="font-normal text-lg leading-7 text-black">Industry average</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="size-4.5 rounded-xs" style={{ backgroundColor: "#22CCEE" }} />
          <p className="font-normal text-lg leading-7 text-black">Your company</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="size-4.5 rounded-xs" style={{ backgroundColor: "#DBEBEB" }} />
          <p className="font-normal text-lg leading-7 text-black">National average</p>
        </div>
      </div>
    </div>
  );
};

/**
 * CostBurdenBarChart - Pixel-perfect implementation from Figma design
 * Figma node: 387-6447
 * Shows rent burdened households by income level with percentage grid lines
 */

// Grid line component for percentage markers
const GridLine = ({ percentage }: { percentage: number }) => (
  <div className="flex gap-4 items-center w-full">
    <p className="text-tertiary text-base leading-6 w-12 shrink-0">{percentage}%</p>
    <div className="flex-1 h-px bg-gray-300" />
  </div>
);

// Individual bar component with stacked bars and labels
const IncomeBar = ({
  burdenedHeight,
  severelyBurdenedHeight,
  burdenedLabel,
  severelyBurdenedLabel,
  title,
  subtitle,
}: {
  burdenedHeight: number;
  severelyBurdenedHeight: number;
  burdenedLabel: string;
  severelyBurdenedLabel: string;
  title: string;
  subtitle: string;
}) => {
  return (
    <div className="flex flex-col gap-2 items-center justify-end">
      {/* Bar container with grid layout for positioning percentages */}
      <div className="inline-grid grid-cols-1 grid-rows-1 items-start justify-items-start leading-none relative shrink-0">
        {/* Outer bar (Burdened) - #6dc5d3 */}
        <div
          className="col-start-1 row-start-1 bg-[#6dc5d3]"
          style={{
            width: "127.71px",
            height: `${(burdenedHeight / 100) * 323}px`,
            marginTop: `${323 - (burdenedHeight / 100) * 323}px`,
          }}
        />
        {/* Burdened percentage label */}
        <p
          className="col-start-1 row-start-1 text-sm font-medium leading-5 text-black relative"
          style={{
            marginLeft: "49.36px",
            marginTop: `${323 - (burdenedHeight / 100) * 323 - 20}px`,
          }}
        >
          {burdenedLabel}
        </p>
        {/* Inner bar (Severely Burdened) - #a5f0fc */}
        <div
          className="col-start-1 row-start-1 bg-[#a5f0fc]"
          style={{
            width: "91.566px",
            height: `${(severelyBurdenedHeight / 100) * 323}px`,
            marginLeft: "18.07px",
            marginTop: `${323 - (severelyBurdenedHeight / 100) * 323}px`,
          }}
        />
        {/* Severely Burdened percentage label */}
        {severelyBurdenedHeight > 0 && (
          <p
            className="col-start-1 row-start-1 text-sm font-medium leading-5 text-black relative"
            style={{
              marginLeft: "48.86px",
              marginTop: `${323 - (severelyBurdenedHeight / 100) * 323 - 20}px`,
            }}
          >
            {severelyBurdenedLabel}
          </p>
        )}
      </div>
      {/* Income level labels */}
      <div className="flex flex-col gap-1 items-center text-sm leading-5 text-black">
        <p className="font-medium">{title}</p>
        <p className="font-normal">{subtitle}</p>
      </div>
    </div>
  );
};

export default function CostBurdenBarChart() {
  const incomeData = [
    {
      title: "Low income",
      subtitle: "$55,250 or less",
      burdenedHeight: 74,
      severelyBurdenedHeight: 44,
      burdenedLabel: "74%",
      severelyBurdenedLabel: "44%",
    },
    {
      title: "Moderate income",
      subtitle: "$55,250 - $88,400",
      burdenedHeight: 40,
      severelyBurdenedHeight: 4,
      burdenedLabel: "40%",
      severelyBurdenedLabel: "4%",
    },
    {
      title: "Median income",
      subtitle: "$88,400 - $132,600",
      burdenedHeight: 10,
      severelyBurdenedHeight: 1,
      burdenedLabel: "10%",
      severelyBurdenedLabel: "1%",
    },
    {
      title: "Upper income",
      subtitle: "$132,600 or more",
      burdenedHeight: 1,
      severelyBurdenedHeight: 0,
      burdenedLabel: "1%",
      severelyBurdenedLabel: "0%",
    },
  ];

  return (
    <div className="bg-white border-0 rounded-xl p-6 flex flex-col gap-6 size-full">
      {/* Chart area with grid lines and bars */}
      <div className="relative flex flex-col gap-8">
        {/* Grid lines container - absolute positioning */}
        <div className="absolute left-0 top-0 flex flex-col gap-8 h-[323px] items-start justify-end w-full">
          <GridLine percentage={100} />
          <GridLine percentage={80} />
          <GridLine percentage={60} />
          <GridLine percentage={40} />
          <GridLine percentage={20} />
          <GridLine percentage={0} />
        </div>

        {/* Bars container - positioned over grid lines */}
        <div className="flex h-[362px] items-end justify-between px-15 relative">
          {incomeData.map(data => (
            <IncomeBar key={data.title} {...data} />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 items-center justify-center">
        <div className="flex gap-4 items-center">
          <div className="size-4.5 rounded-xs bg-[#6dc5d3]" />
          <p className="font-normal text-lg leading-7 text-black">Burdened</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="size-4.5 rounded-xs bg-[#a5f0fc]" />
          <p className="font-normal text-lg leading-7 text-black">Severely Burdened</p>
        </div>
      </div>
    </div>
  );
}

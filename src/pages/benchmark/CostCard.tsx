import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { InfoCircle } from "@untitledui/icons";

type CostCardProps = {
  title: string;
  year?: string;
  primaryScore?: string;
  secondaryScore?: string;
  industryText?: string;
  industryCostText?: string;
  industryTradeText?: string;
  classess?: string;
  primaryValue?: number | null;
  secondaryValue?: number | null;
};

export default function CostCard({
  title,
  year,
  primaryScore,
  secondaryScore,
  industryText,
  industryCostText,
  industryTradeText,
  classess,
  primaryValue,
  secondaryValue,
}: Readonly<CostCardProps>) {
  const isNoData =
    !primaryScore ||
    !secondaryScore ||
    primaryScore.startsWith("N/A") ||
    secondaryScore.startsWith("N/A");

  const totalWidth = primaryValue && secondaryValue ? primaryValue + secondaryValue : 100;
  const toWidth = (val: number | null | undefined): string => {
    if (val == null || !isFinite(val) || totalWidth === 0) return "0%";
    // Calculate percentage relative to the total width
    const percentage = (val / totalWidth) * 100;
    const clamped = Math.min(100, Math.max(0, percentage));
    return `${clamped}%`;
  };
  const primaryWidth = toWidth(primaryValue);
  const secondaryWidth = toWidth(secondaryValue);

  return (
    <div
      className={`bg-ws-white p-5 border border-ws-primary-100 rounded-lg w-full flex flex-col relative ${classess}`}
    >
      {/* Tooltip icon — top-right corner */}
      <div className="absolute top-4 right-4">
        <Tooltip
          title="Turnover data"
          description="Turnover metrics are calculated from Bureau of Labor Statistics Job Openings and Labor Turnover Survey"
          placement="top"
          arrow={true}
        >
          <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
            <InfoCircle className="size-5 text-ws-gray-70" />
          </TooltipTrigger>
        </Tooltip>
      </div>

      {/* Title */}
      <h3 className="text-lg font-medium text-ws-black">{title}</h3>

      {/* Middle content */}
      <div className="flex flex-col flex-1 mt-4">
        {isNoData ? (
          <div className="flex items-center h-[110px] text-sm text-ws-black-10">
            No data available
          </div>
        ) : (
          <>
            {/* Year */}
            <p className="text-sm text-ws-black mb-4">{year}</p>

            {/* Cyan bar — dynamic width */}
            <div
              className="flex items-center bg-ws-cyan-60 px-3 py-2 text-ws-white text-base transition-all duration-500 whitespace-nowrap"
              style={{ width: primaryWidth }}
            >
              {primaryScore}
            </div>

            {/* Gray bar — dynamic width, no gap */}
            <div
              className="bg-ws-gray-600 text-ws-black px-3 py-2 text-base transition-all duration-500 whitespace-nowrap"
              style={{ width: secondaryWidth }}
            >
              {secondaryScore}
            </div>
          </>
        )}
      </div>

      {/* Industry text — pinned to bottom */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-ws-black">
          {industryText}
          <span className="text-ws-purple-60">{industryCostText}</span>
        </div>
        <div className="text-sm text-ws-black">{industryTradeText}</div>
      </div>
    </div>
  );
}

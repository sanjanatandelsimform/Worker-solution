import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { InfoCircle } from "@untitledui/icons";

type CostCardProps = {
  title: string;
  year?: string;
  voluntaryScore?: string;
  involuntaryScore?: string;
  industryText?: string;
  industryCostText?: string;
  industryTradeText?: string;
  classess?: string;
};

export default function CostCard({
  title,
  year,
  voluntaryScore,
  involuntaryScore,
  industryText,
  industryCostText,
  industryTradeText,
  classess,
}: Readonly<CostCardProps>) {
  const isNoData =
    !voluntaryScore ||
    !involuntaryScore ||
    voluntaryScore.startsWith("N/A") ||
    involuntaryScore.startsWith("N/A");

  return (
    <div
      className={`bg-ws-base-white p-5 border border-ws-border-primary rounded-lg w-full flex flex-col relative ${classess}`}
    >
      {/* Tooltip icon — top-right corner */}
      <div className="absolute top-4 right-4">
        <Tooltip
          title="Rate of Separation"
          description="Once we get value replace here"
          placement="top"
          arrow={true}
        >
          <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
            <InfoCircle className="size-5 text-ws-gray-70" />
          </TooltipTrigger>
        </Tooltip>
      </div>

      <h3 className="text-lg font-medium text-ws-text-primary">{title}</h3>

      {/* Middle content */}
      <div className="flex flex-col flex-1 mt-4">
        {isNoData ? (
          <div className="flex items-center h-28 text-sm text-ws-text-tertiary">
            No data available
          </div>
        ) : (
          <>
            {/* Year — spaced from title */}
            <p className="text-sm text-ws-text-primary mb-4">{year}</p>

            {/* Cyan bar */}
            <div className="flex items-center bg-ws-cyan-60 px-3 py-2 text-ws-base-white text-base">
              {voluntaryScore}
            </div>

            {/* Gray bar — small gap below cyan */}
            <div className="bg-ws-gray-600 text-ws-text-primary px-3 py-2 w-3/5 text-base">
              {involuntaryScore}
            </div>
          </>
        )}
      </div>

      {/* Industry text — pinned to bottom */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-ws-text-primary">
          {industryText}
          <span className="text-ws-purple-60">{industryCostText}</span>
        </div>
        <div className="text-sm text-ws-text-primary">{industryTradeText}</div>
      </div>
    </div>
  );
}

import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { InfoCircle } from "@untitledui/icons";

export interface StaticCardProps {
  title: string;
  count?: string;
  infoIcon?: boolean;
  classess?: string;
  titleClass?: string;
  infoCircleClass?: string;
  countClass?: string;
  countIcon?: React.ReactNode;
  tooltipText?: string;
  descriptionText?: string;
  itemAlign?: "start" | "between" | "end";
  placements?: "top" | "bottom" | "left" | "right";
}
export default function StaticCard({
  title,
  count,
  infoIcon = false,
  classess,
  titleClass,
  infoCircleClass,
  countClass,
  tooltipText,
  descriptionText,
  itemAlign,
  placements,
  countIcon,
}: Readonly<StaticCardProps>) {
  return (
    <div
      className={`bg-ws-base-white w-full ring ring-ws-border-secondary rounded-xl py-5 px-6 ${classess}`}
    >
      <div className="flex items-center justify-between">
        <p
          className={`text-ws-text-tertiary flex items-center, text-base gap-2 justify-${itemAlign || "start"} ${titleClass}`}
        >
          {title}
        </p>
        <span>
          {infoIcon ? (
            <Tooltip
              title={tooltipText || ""}
              description={descriptionText || ""}
              placement={placements || "top"}
              arrow={true}
            >
              <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                <InfoCircle className={`text-ws-gray-400 ${infoCircleClass}`} />
              </TooltipTrigger>
            </Tooltip>
          ) : (
            ""
          )}
        </span>
      </div>
      <div className="flex items-end gap-2 justify-between">
        <h2 className={`w-full ${countClass}`}>
          {count === "N/A" ? (
            <span className="mt-4 text-base font-medium text-ws-text-tertiary">
              No data available
            </span>
          ) : (
            count
          )}
        </h2>
        {countIcon && <div className="mb-1">{countIcon}</div>}
      </div>
    </div>
  );
}

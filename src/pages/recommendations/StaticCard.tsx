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
    <div className={`bg-ws-white w-full ring ring-ws-primary-100 rounded-xl py-5 px-6 ${classess}`}>
      <p
        className={`flex items-center, text-base gap-2 justify-${itemAlign || "start"} ${titleClass}`}
      >
        {title}
        <span>
          {infoIcon ? (
            <Tooltip
              title={tooltipText || ""}
              description={descriptionText || ""}
              placement={placements || "top"}
              arrow={true}
            >
              <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                <InfoCircle className={`size-5 ${infoCircleClass}`} />
              </TooltipTrigger>
            </Tooltip>
          ) : (
            ""
          )}
        </span>
      </p>
      <div className="flex items-end gap-2 justify-between">
        <h2 className={`w-full ${countClass}`}>
          {count === "N/A" ? (
            <span className="mt-4 text-sm font-medium text-ws-black-10">No data available</span>
          ) : (
            count
          )}
        </h2>
        {countIcon && <div className="mb-1">{countIcon}</div>}
      </div>
    </div>
  );
}

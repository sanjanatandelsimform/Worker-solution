import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { InfoCircle } from "@untitledui/icons";

export interface StaticCardProps {
  title: string;
  count?: string;
  infoIcon?: boolean;
  classess?: string;
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
  tooltipText,
  descriptionText,
  itemAlign,
  placements,
}: Readonly<StaticCardProps>) {
  return (
    <div
      className={`bg-white ring ring-gray-300  rounded-xl py-5 px-6 ${classess}`}
    >
      <p
        className={`flex items-center text-base text-gray-600 gap-2 justify-${itemAlign || "start"}`}
      >
        {title}
        <span>
          {infoIcon ? (
            <Tooltip
              title={tooltipText || ""}
              description={descriptionText || ""}
              placement={placements || "top"}
            >
              <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                <InfoCircle className="size-4 text-gray-400" />
              </TooltipTrigger>
            </Tooltip>
          ) : (
            ""
          )}
        </span>
      </p>
      <h2 className="text-4xl font-semibold mt-6">{count}</h2>
    </div>
  );
}

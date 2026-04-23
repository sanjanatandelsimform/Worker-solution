import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { InfoCircle } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import InlineProgressBar from "@/components/base/progress-indicators/InlineProgressBar";

export interface ProgressItem {
  label: string;
  percentage: number;
  progressColor?: string;
}

export interface ProgressSection {
  items: ProgressItem[];
  columnsCount?: 1 | 2 | 3 | 4;
}

interface ProgressCardProps {
  title: string;
  tooltipText: string;
  tooltipDescription?: string;
  showInfoIcon?: boolean;

  // Legacy single item support
  percentage?: number;
  progressLabel?: string;
  progressColor?: string;

  // New section support
  sections?: ProgressSection[];
  className?: string;
}

export default function ProgressCard({
  title,
  tooltipText,
  tooltipDescription,
  percentage,
  progressLabel,
  progressColor,
  showInfoIcon,
  sections,
  className,
}: Readonly<ProgressCardProps>) {
  // Map column count to grid class
  const gridClassMap = {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  };

  const getGridColsClass = (columnsCount: number | undefined) => {
    return gridClassMap[columnsCount as keyof typeof gridClassMap] || "lg:grid-cols-2";
  };

  // Single progress item renderer
  const renderProgressItem = (item: ProgressItem, index: number) => (
    <div key={`progress-${index}`} className="flex gap-3">
      <div className="text-base font-normal text-ws-text-primary min-w-40">{item.label}</div>
      <InlineProgressBar percentage={item.percentage} color={item.progressColor} />
    </div>
  );
  // Comment code is require
  // const renderProgressItem = (item: ProgressItem, index: number) => (
  // <div key={`progress-${index}`} className="flex gap-3">
  //   <div className="text-base font-normal text-ws-text-primary min-w-40">{item.label}</div>
  //   <div className="w-full bg-ws-light-teal-25 relative flex items-center">
  //     <div
  //       className={`h-7 flex-shrink-0 ${item.progressColor || "bg-ws-light-teal-25"} transition-all duration-300`}
  //       style={{ width: `${item.percentage}%` }}
  //     />
  //     <span className="text-base font-normal text-ws-base-black drop-shadow-md pl-2 whitespace-nowrap">
  //       {item.percentage.toFixed(1)}%
  //     </span>
  //   </div>
  // </div>
  // );

  return (
    <div
      className={cx(
        "bg-ws-base-white p-5 border border-ws-border-primary rounded-xl w-full flex flex-col relative",
        className
      )}
    >
      {/* Title Section */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-medium text-ws-text-primary">{title}</h3>
        {showInfoIcon && (
          <Tooltip
            title={tooltipText}
            description={tooltipDescription}
            placement="top"
            arrow={true}
          >
            <TooltipTrigger
              isDisabled={false}
              className="cursor-pointer text-ws-error-600 transition duration-200 hover:text-ws-error-600 focus:text-ws-error-600"
            >
              <InfoCircle className="size-5 text-ws-gray-400" />
            </TooltipTrigger>
          </Tooltip>
        )}
      </div>

      {/* Render sections or single item */}
      {sections && sections.length > 0 ? (
        // Multiple sections layout
        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={`section-${sectionIndex}`}>
              {/* Progress Items Grid */}
              {section.items && section.items.length > 0 && (
                <div
                  className={cx("grid grid-cols-1 gap-2", getGridColsClass(section.columnsCount))}
                >
                  {section.items.map((item, itemIndex) => renderProgressItem(item, itemIndex))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : percentage !== undefined && progressLabel ? (
        // Single item layout (backward compatibility)
        <div className="flex gap-3">
          <div className="text-base font-normal text-ws-text-primary min-w-40">{progressLabel}</div>
          <div className="w-full bg-ws-light-teal-25 relative flex items-center">
            <div
              className={`h-7 flex-shrink-0 ${progressColor || "bg-ws-light-teal-25"} transition-all duration-300`}
              style={{ width: `${percentage}%` }}
            >
              {percentage >= 12 && (
                <span className="text-base font-normal text-ws-base-black drop-shadow-md flex items-center justify-end w-full h-full pr-2">
                  {percentage}%
                </span>
              )}
            </div>
            {percentage < 12 && (
              <span className="text-base font-normal text-ws-base-black drop-shadow-md pl-2 whitespace-nowrap">
                {percentage}%
              </span>
            )}
          </div>
        </div>
      ) : // Comment code is require
      //   <div className="flex gap-3">
      //   <div className="text-base font-normal text-ws-text-primary min-w-40">{progressLabel}</div>
      //   <div className="w-full bg-ws-light-teal-25 relative flex items-center">
      //     <div
      //       className={`h-7 flex-shrink-0 ${progressColor || "bg-ws-light-teal-25"} transition-all duration-300`}
      //       style={{ width: `${percentage}%` }}
      //     />
      //     <span className="text-base font-normal text-ws-base-black drop-shadow-md pl-2 whitespace-nowrap">
      //       {percentage.toFixed(1)}%
      //     </span>
      //   </div>
      // </div>
      null}
    </div>
  );
}

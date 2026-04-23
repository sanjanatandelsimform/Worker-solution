import { Badge } from "@/components/base/badges/badges";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";

export interface AverageCardProps {
  title: string;
  cardStatics?: string;
  staticsPoints?: string;
  progressValue?: number | null;
  className?: string;
  countWrap?: string;
  customBarColor?: string;
  staticsPointsState?: boolean; // New prop to control badge visibility
}
export default function AverageCard({
  title,
  cardStatics,
  staticsPoints,
  progressValue,
  className,
  customBarColor,
  staticsPointsState = false,
}: Readonly<AverageCardProps>) {
  // Determine badge color based on positive/negative value
  const getBadgeColor = (value?: string): "success" | "error" => {
    if (!value || value.trim() === "") return "success";

    // Check if value starts with "-" (negative/error)
    const trimmedValue = value.trim();
    if (trimmedValue.startsWith("-")) {
      return "error";
    }

    // Default to success for positive values
    return "success";
  };

  // Get the badge color
  const badgeColor = staticsPoints ? getBadgeColor(staticsPoints) : undefined;

  return (
    <div className={`bg-ws-base-white ring ring-ws-border-secondary rounded-lg p-3 ${className}`}>
      <h2 className="text-xs text-ws-text-primary mb-2">{title}</h2>
      <div className="flex items-center justify-between">
        <h3 className="text-ws-text-primary">
          {cardStatics === "No data" ? (
            <span className="mt-4 text-base font-medium">No data available</span>
          ) : (
            <span className="text-2xl font-semibold">{cardStatics}</span>
          )}
        </h3>
        {staticsPointsState && badgeColor && (
          <Badge
            type="pill-color"
            color={badgeColor}
            className={
              badgeColor === "success"
                ? "text-xs bg-ws-bg-positive text-ws-text-positive ring-0 rounded-none py-1"
                : "text-xs bg-ws-bg-negative text-ws-text-negative ring-0 rounded-none py-1"
            }
            size="sm"
          >
            {staticsPoints}
          </Badge>
        )}
      </div>
      <ProgressBar
        value={progressValue ?? 0}
        max={100}
        className="mt-2"
        customColor={customBarColor}
      />
    </div>
  );
}

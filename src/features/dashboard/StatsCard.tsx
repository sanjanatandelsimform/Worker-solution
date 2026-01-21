import type { ReactNode } from "react";

type StatsCardProps = {
  title: string;
  value: ReactNode;
  delta?: string;
  deltaColor?: "green" | "red" | "muted";
  smallText?: ReactNode;
  className?: string;
};

export function StatsCard({
  title,
  value,
  delta,
  deltaColor = "muted",
  smallText,
  className = "p-6",
}: StatsCardProps) {
  const colorClass =
    deltaColor === "green"
      ? "text-green-600"
      : deltaColor === "red"
        ? "text-red-600"
        : "text-muted-foreground";

  return (
    <div
      className={`bg-card text-card-foreground flex flex-col gap-2 rounded-xl border shadow-sm ${className}`}
    >
      <div className="space-y-2 p-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
        {delta ? (
          <p className={`text-xs ${colorClass}`}>{delta}</p>
        ) : smallText ? (
          <p className="text-xs text-muted-foreground">{smallText}</p>
        ) : null}
      </div>
    </div>
  );
}

export default StatsCard;

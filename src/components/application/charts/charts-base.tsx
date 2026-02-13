"use client";
import { cx } from "@/utils/cx";

// Type definitions for recharts components
type LegendContentProps = {
  payload?: Array<{
    value: string;
    type: string;
    color: string;
    dataKey: string;
    payload?: { className?: string };
  }>;
  [key: string]: unknown;
};

type NameType = string | number;
type ValueType = string | number | Array<string | number>;

type DotProps = {
  cx?: number;
  cy?: number;
  [key: string]: unknown;
};

/**
 * Renders the legend content for a chart.
 * @param reversed - Whether to reverse the payload.
 * @param payload - The payload of the legend.
 * @param align - The alignment of the legend.
 * @param layout - The layout of the legend.
 * @param className - The class name of the legend.
 * @returns The legend content.
 */
export const ChartLegendContent = ({
  reversed,
  payload,
  align,
  layout,
  className,
}: LegendContentProps & { reversed?: boolean; className?: string }) => {
  payload = reversed ? [...(payload || [])].reverse() : payload;
  return (
    <ul
      className={cx(
        "flex",
        layout === "vertical"
          ? `flex-col gap-1 pl-4 ${align === "center" ? "items-center" : align === "right" ? "items-start" : "items-start"}`
          : `flex-row gap-3 ${align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start"}`,
        className
      )}
    >
      {payload?.map(
        (
          entry: {
            value: string;
            type: string;
            color: string;
            dataKey: string;
            payload?: { className?: string };
          },
          index: number
        ) => (
          <li className="flex items-center gap-2 text-sm text-tertiary" key={index}>
            <span
              className={cx(
                "h-2 w-2 rounded-full bg-current",
                (entry.payload as { className?: string })?.className
              )}
            />
            {entry.value}
          </li>
        )
      )}
    </ul>
  );
};
interface ChartTooltipContentProps {
  isRadialChart?: boolean;
  isPieChart?: boolean;
  label?: string;
  active?: boolean;
  formatter?: (value: ValueType, name: NameType, item: unknown, index: number) => React.ReactNode;
  labelFormatter?: (label: string, payload: unknown[]) => React.ReactNode;
  // We have to use `any` here because the `payload` prop is not typed correctly in the `recharts` library.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}
export const ChartTooltipContent = ({
  active,
  payload,
  label,
  isRadialChart,
  isPieChart,
  formatter,
  labelFormatter,
}: ChartTooltipContentProps) => {
  const canRender = active && payload && payload.length;
  if (!canRender) {
    return null;
  }
  const isSingleDataPoint = payload.length === 1;
  // If it's a single data point, we use the value as the title and
  // the name as the secondary title.
  let title = isSingleDataPoint
    ? isRadialChart
      ? payload[0].value
      : isPieChart
        ? payload[0].value
        : payload[0].value
    : label;
  let secondaryTitle = isSingleDataPoint
    ? isRadialChart
      ? payload[0].payload.name
      : isPieChart
        ? payload[0].name
        : label
    : payload;
  title =
    isSingleDataPoint && formatter
      ? formatter(title, payload?.[0].name || label, payload[0], 0)
      : labelFormatter
        ? labelFormatter(title, payload)
        : title;
  secondaryTitle =
    isSingleDataPoint && labelFormatter ? labelFormatter(secondaryTitle, payload) : secondaryTitle;
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-black px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-white">{title}</p>
      {!secondaryTitle ? null : Array.isArray(secondaryTitle) ? (
        <div>
          {secondaryTitle.map((entry, index) => (
            <p key={index} className={cx("text-xs text-gray-100")}>
              {`${entry.name}: ${formatter ? formatter(entry.value, entry.name, entry, index) : entry.value}`}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-xs text-tooltip-supporting-text">{secondaryTitle}</p>
      )}
    </div>
  );
};
interface ChartActiveDotProps extends DotProps {
  cx?: number;
  cy?: number;
  // We have to use `any` here because the `payload` prop is not typed correctly in the `recharts` library.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}
export const ChartActiveDot = ({ cx = 0, cy = 0 }: ChartActiveDotProps) => {
  const size = 12;
  return (
    <svg
      x={cx - size / 2}
      y={cy - size / 2}
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
    >
      <rect
        x="2"
        y="2"
        width="8"
        height="8"
        rx="6"
        className="fill-bg-primary stroke-utility-brand-600"
        strokeWidth="2"
      />
    </svg>
  );
};

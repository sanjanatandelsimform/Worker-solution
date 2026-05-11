import { formatPercent } from "../../../utils/formatters";
interface InlineProgressBarProps {
  /** Percentage value (0–100) */
  percentage: number;
  /** Tailwind bg color class for the fill, e.g. "bg-ws-primary-700" */
  color?: string;
  /** Additional class names for the progress bar container */
  className?: string;
}

/**
 * A progress bar that renders the percentage label inside the colored fill
 * for values > 5%, and left-aligned in the grey area for values <= 5%.
 */
export default function InlineProgressBar({
  percentage,
  color = "bg-ws-light-teal-25",
  className = "h-7",
}: Readonly<InlineProgressBarProps>) {
  return (
    <div className={`w-full bg-ws-light-teal-25 relative flex items-center ${className}`}>
      {percentage > 5 ? (
        // > 5%: Label inside the colored fill, left-aligned. Bar expands to fit text.
        <div
          className={`h-full ${color} transition-all duration-300 flex items-center pl-2`}
          style={{ width: `${percentage}%`, minWidth: "fit-content" }}
        >
          <span className="text-base font-normal text-ws-base-black drop-shadow-md whitespace-nowrap">
            {formatPercent(percentage)}
          </span>
        </div>
      ) : (
        // <= 5%: Fill bar + label left-aligned in the grey (unfilled) area
        <>
          <div
            className={`h-full flex-shrink-0 ${color} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
          <span className="text-base font-normal text-ws-base-black drop-shadow-md whitespace-nowrap pl-2 flex items-center h-full">
            {formatPercent(percentage)}
          </span>
        </>
      )}
    </div>
  );
}

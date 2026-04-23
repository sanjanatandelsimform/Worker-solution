interface InlineProgressBarProps {
  /** Percentage value (0–100) */
  percentage: number;
  /** Tailwind bg color class for the fill, e.g. "bg-ws-primary-700" */
  color?: string;
  /** Height class, defaults to "h-7" */
  heightClass?: string;
}

/**
 * A progress bar that renders the percentage label inside the colored fill
 * for values >= 12%, and just outside (after the fill) for smaller values.
 */
export default function InlineProgressBar({
  percentage,
  color = "bg-ws-light-teal-25",
  heightClass = "h-7",
}: Readonly<InlineProgressBarProps>) {
  return (
    <div className={`w-full bg-ws-light-teal-25 relative flex items-center ${heightClass}`}>
      <div
        className={`h-full flex-shrink-0 ${color} transition-all duration-300`}
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
  );
}

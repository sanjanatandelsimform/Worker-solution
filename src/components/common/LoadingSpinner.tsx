import { Oval } from "react-loader-spinner";

interface LoadingSpinnerProps {
  height?: number;
  width?: number;
  bgClass?: string;
  ariaLabel?: string;
}

export function LoadingSpinner({
  height = 48,
  width = 48,
  bgClass = "bg-gray-50",
  ariaLabel = "loading",
}: LoadingSpinnerProps) {
  return (
    <div className={`flex min-h-screen items-center justify-center ${bgClass}`}>
      <Oval
        height={height}
        width={width}
        color="#06b6d4"
        wrapperClass="flex items-center justify-center"
        visible
        ariaLabel={ariaLabel}
        secondaryColor="#0891b2"
        strokeWidth={2}
        strokeWidthSecondary={2}
      />
    </div>
  );
}

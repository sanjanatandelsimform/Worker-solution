export function CircleCheckIcon({
  className,
}: {
  readonly className?: string;
}) {
  return (
    <span className={`custom-icon ${className ?? ""}`}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="20" height="20" rx="10" fill="#34A853" />
        <path d="M5 9.5L8.5 13L14.5 7" stroke="white" stroke-width="2" />
      </svg>
    </span>
  );
}

export function ArrowLeft({ className }: { readonly className?: string }) {
  return (
    <span className={`custom-icon ${className ?? ""}`}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19 12H5"
          stroke="var(--color-ws-purple-30)"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 19L5 12L12 5"
          stroke="var(--color-ws-purple-30)"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

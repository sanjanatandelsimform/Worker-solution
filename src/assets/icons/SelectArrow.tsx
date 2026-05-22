export function SelectArrow({ className }: { readonly className?: string }) {
  return (
    <span className={`custom-icon ${className ?? ""}`}>
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0.666504 0.666992L4.6665 4.66699L8.6665 0.666992"
          stroke="#A4A7AE"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

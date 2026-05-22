export function TabArrow({ className }: { readonly className?: string }) {
  return (
    <span className={`custom-icon ${className ?? ""}`}>
      <svg width="7" height="13" viewBox="0 0 7 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.390137 0.3125L5.39014 6.5525L0.390137 12.3125" stroke="currentColor" />
      </svg>
    </span>
  );
}

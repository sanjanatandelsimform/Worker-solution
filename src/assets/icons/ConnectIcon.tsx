export function ConnectIcon({ className }: { readonly className?: string }) {
  return (
    <span className={`custom-icon ${className ?? ""}`}>
      <svg
        width="26"
        height="14"
        viewBox="0 0 26 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.41667 1H6.83333C3.61167 1 1 3.61167 1 6.83333C1 10.055 3.61167 12.6667 6.83333 12.6667H9.16667C12.3883 12.6667 15 10.055 15 6.83333M17.9167 12.6667H18.5C21.7217 12.6667 24.3333 10.055 24.3333 6.83334C24.3333 3.61167 21.7217 1 18.5 1H16.1667C12.945 1 10.3333 3.61167 10.3333 6.83333"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

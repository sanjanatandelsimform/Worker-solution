export function InputInfo({ className }: { readonly className?: string }) {
  return (
    <span className={`custom-icon ${className ?? ""}`}>
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.33317 4.66663V7.33329M7.33317 9.99996H7.33984M13.9998 7.33329C13.9998 11.0152 11.0151 14 7.33317 14C3.65127 14 0.666504 11.0152 0.666504 7.33329C0.666504 3.65139 3.65127 0.666626 7.33317 0.666626C11.0151 0.666626 13.9998 3.65139 13.9998 7.33329Z"
          stroke="#F04438"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

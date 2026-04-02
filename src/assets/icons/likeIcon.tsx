export function LikeIcon({ className }: { readonly className?: string }) {
  return (
    <span className={`custom-icon ${className ?? ""}`}>
      <svg
        width="25"
        height="25"
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="12.5" cy="12.5" rx="9.5" ry="9.25" fill="#3B8383" />
        <circle opacity="0.2" cx="12.5" cy="12.5" r="12.5" fill="#00EA4A" />
        <g clipPath="url(#clip0_7889_6484)">
          <path
            d="M10 17.5V12M7.5 13V16.5C7.5 17.0523 7.94772 17.5 8.5 17.5H15.2131C15.9535 17.5 16.5831 16.9598 16.6957 16.2281L17.2341 12.7281C17.3739 11.8194 16.6709 11 15.7516 11H14C13.7239 11 13.5 10.7761 13.5 10.5V8.73292C13.5 8.052 12.948 7.5 12.2671 7.5C12.1047 7.5 11.9575 7.59565 11.8915 7.74406L10.132 11.7031C10.0517 11.8836 9.87266 12 9.67506 12H8.5C7.94772 12 7.5 12.4477 7.5 13Z"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_7889_6484">
            <rect width="12" height="12" fill="white" transform="translate(6.5 6.5)" />
          </clipPath>
        </defs>
      </svg>
    </span>
  );
}

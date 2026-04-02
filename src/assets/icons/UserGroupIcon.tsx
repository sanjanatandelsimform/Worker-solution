export function UserGroupIcon({ className }: { readonly className?: string }) {
  return (
    <span className={`custom-icon ${className ?? ""}`}>
      <svg
        width="25"
        height="25"
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="12.5" cy="12.5" rx="9.5" ry="9.25" fill="#FF9F43" />
        <circle opacity="0.3" cx="12.5" cy="12.5" r="12.5" fill="#FF9F43" />
        <path
          d="M14.5 15.5L16 14M16 14L17.5 15.5M16 14V17M14.25 8.14538C14.983 8.44207 15.5 9.16066 15.5 10C15.5 10.8393 14.983 11.5579 14.25 11.8546M12.5 14H10.5C9.56812 14 9.10218 14 8.73463 14.1522C8.24458 14.3552 7.85523 14.7446 7.65224 15.2346C7.5 15.6022 7.5 16.0681 7.5 17M13.25 10C13.25 11.1046 12.3546 12 11.25 12C10.1454 12 9.25 11.1046 9.25 10C9.25 8.89543 10.1454 8 11.25 8C12.3546 8 13.25 8.89543 13.25 10Z"
          stroke="white"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function HeartLineIcon({ className }: { readonly className?: string }) {
  return (
    <span className={`custom-icon ${className ?? ""}`}>
      <svg
        width="22"
        height="20"
        viewBox="0 0 22 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.9932 3.13777C8.9938 0.800353 5.65975 0.171596 3.15469 2.31197C0.649644 4.45234 0.296968 8.03093 2.2642 10.5624C3.89982 12.6671 8.84977 17.1061 10.4721 18.5428C10.6536 18.7035 10.7444 18.7839 10.8502 18.8155C10.9426 18.843 11.0437 18.843 11.1361 18.8155C11.2419 18.7839 11.3327 18.7035 11.5142 18.5428C13.1365 17.1061 18.0865 12.6671 19.7221 10.5624C21.6893 8.03093 21.3797 4.42982 18.8316 2.31197C16.2835 0.19411 12.9925 0.800353 10.9932 3.13777Z"
          stroke="#717680"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

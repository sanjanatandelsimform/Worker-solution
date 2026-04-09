export function AssessmentIcon({ className }: { readonly className?: string }) {
  return (
    <span className={`custom-icon ${className ?? ""}`}>
      <svg
        width="22"
        height="26"
        viewBox="0 0 22 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19.6667 13.25V6.6C19.6667 4.63982 19.6667 3.65972 19.2852 2.91103C18.9496 2.25247 18.4142 1.71703 17.7556 1.38148C17.0069 1 16.0269 1 14.0667 1H6.6C4.63982 1 3.65972 1 2.91103 1.38148C2.25247 1.71703 1.71703 2.25247 1.38148 2.91103C1 3.65972 1 4.63982 1 6.6V18.7333C1 20.6935 1 21.6736 1.38148 22.4223C1.71703 23.0809 2.25247 23.6163 2.91103 23.9519C3.65972 24.3333 4.63982 24.3333 6.6 24.3333H10.3333M12.6667 11.5H5.66667M8 16.1667H5.66667M15 6.83333H5.66667M13.25 20.8333L15.5833 23.1667L20.8333 17.9167"
          stroke="#1F4151"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

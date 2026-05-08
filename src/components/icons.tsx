type IconProps = {
  className?: string;
};

export function BrightnessIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="9.5" stroke="currentColor" strokeWidth="3.2" />
      <path
        d="M24 5.5v5.8M24 36.7v5.8M5.5 24h5.8M36.7 24h5.8M10.9 10.9l4.1 4.1M33 33l4.1 4.1M37.1 10.9 33 15M15 33l-4.1 4.1"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function VolumeIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="49"
      height="49"
      viewBox="0 0 49 49"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9.5 29.8h8.1l13.1 10.6V8.6L17.6 19.2H9.5v10.6Z"
        stroke="currentColor"
        strokeWidth="3.3"
        strokeLinejoin="round"
      />
      <path
        d="M38.1 17.1c2.3 4.7 2.3 10.1 0 14.8"
        stroke="currentColor"
        strokeWidth="3.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

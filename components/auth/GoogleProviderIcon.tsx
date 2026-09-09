import type { ReactElement } from "react";

export function GoogleProviderIcon(): ReactElement {
  return (
    <svg
      className="size-7"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 12h17" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 3.5c2.2 2.1 3.3 4.9 3.3 8.5S14.2 18.4 12 20.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 3.5C9.8 5.6 8.7 8.4 8.7 12s1.1 6.4 3.3 8.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

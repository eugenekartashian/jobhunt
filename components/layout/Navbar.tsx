import Link from "next/link";
import type { ReactElement } from "react";

import { BrandMark } from "@/components/homepage/BrandMark";

const navigationItems: Array<{ href: string; label: string }> = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/find-jobs", label: "Find Jobs" },
  { href: "/profile", label: "Profile" },
];

type NavbarProps = {
  ctaHref?: string;
};

export function Navbar({ ctaHref = "/login" }: NavbarProps): ReactElement {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex min-h-16 w-full max-w-page items-center justify-between gap-4 px-6 py-3 sm:px-8 lg:px-20">
        <Link href="/" className="focus-ring rounded-md">
          <BrandMark size="small" />
        </Link>

        <nav aria-label="Primary navigation" className="hidden sm:block">
          <ul className="flex items-center gap-10">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="focus-ring rounded-md text-sm font-medium leading-5 text-text-dark transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href={ctaHref}
          className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md bg-overlay px-4 py-2 text-sm font-medium leading-5 text-accent-foreground shadow-card transition-colors hover:bg-overlay-dark"
        >
          Start for free
        </Link>
      </div>
    </header>
  );
}

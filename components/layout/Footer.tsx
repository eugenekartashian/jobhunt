import Link from "next/link";
import type { ReactElement } from "react";

import { BrandMark } from "@/components/homepage/BrandMark";

const footerLinks: Array<{ href: string; label: string }> = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Condition" },
];

export function Footer(): ReactElement {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex min-h-32 w-full max-w-page flex-col justify-between gap-8 px-6 py-10 sm:px-8 md:flex-row md:items-center lg:px-20">
        <BrandMark size="medium" />

        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap items-center gap-8">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="focus-ring rounded-md text-sm font-medium leading-5 text-text-dark transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}

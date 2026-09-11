import Link from "next/link";
import type { ReactElement } from "react";
import type { UserSchema } from "@insforge/shared-schemas";

import { SignOutForm } from "@/components/auth/SignOutForm";
import { BrandMark } from "@/components/homepage/BrandMark";
import { UserAvatar } from "@/components/layout/UserAvatar";

const navigationItems: Array<{ href: string; label: string }> = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/find-jobs", label: "Find Jobs" },
  { href: "/profile", label: "Profile" },
];

type NavbarProps = {
  activeHref?: string;
  ctaHref?: string;
  ctaLabel?: string;
  user?: UserSchema;
};

export function Navbar({
  activeHref,
  ctaHref = "/login",
  ctaLabel = "Start for free",
  user,
}: NavbarProps): ReactElement {
  const displayName = user?.profile?.name?.trim() || user?.email || "Profile";
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="border-b border-border bg-surface">
    <div className="mx-auto flex min-h-16 w-full max-w-page items-center justify-between gap-4 px-6 py-3 sm:px-8 lg:px-16">
        <Link href="/" className="focus-ring rounded-md">
          <BrandMark size="small" />
        </Link>

        <nav aria-label="Primary navigation" className="hidden sm:block">
          <ul className="flex items-center gap-10">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`focus-ring rounded-md text-sm font-medium leading-5 transition-colors hover:text-accent ${
                    activeHref === item.href ? "text-accent" : "text-text-dark"
                  }`}
                  aria-current={activeHref === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              aria-label={`Open ${displayName} profile`}
              className="focus-ring inline-flex size-10 items-center justify-center overflow-hidden rounded-full border border-border bg-accent-muted text-xs font-bold text-accent shadow-card transition-transform hover:scale-105"
            >
              <UserAvatar alt="" initials={initials} src={user.profile?.avatar_url} />
            </Link>
            <SignOutForm compact />
          </div>
        ) : (
          <Link
            href={ctaHref}
            className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md bg-overlay px-4 py-2 text-sm font-medium leading-5 text-accent-foreground shadow-card transition-colors hover:bg-overlay-dark"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </header>
  );
}

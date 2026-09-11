"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { Menu, X } from "lucide-react";
import { useState } from "react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const displayName = user?.profile?.name?.trim() || user?.email || "Profile";
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="relative border-b border-border bg-surface">
      <div className="mx-auto flex min-h-16 w-full max-w-page items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-8 lg:px-16">
        <Link href="/" className="focus-ring shrink-0 rounded-md" onClick={() => setIsMenuOpen(false)}>
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

        {!user ? (
          <Link
            href={ctaHref}
            className="focus-ring absolute left-1/2 inline-flex min-h-10 -translate-x-1/2 items-center justify-center rounded-md bg-overlay px-3 py-2 text-sm font-medium leading-5 text-accent-foreground shadow-card transition-colors hover:bg-overlay-dark sm:hidden"
          >
            {ctaLabel}
          </Link>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/profile"
                aria-label={`Open ${displayName} profile`}
                className="focus-ring inline-flex size-10 items-center justify-center overflow-hidden rounded-full border border-border bg-accent-muted text-xs font-bold text-accent shadow-card transition-transform hover:scale-105"
              >
                <UserAvatar alt="" initials={initials} src={user.profile?.avatar_url} />
              </Link>
              <SignOutForm compact />
            </>
          ) : (
            <Link
              href={ctaHref}
              className="focus-ring hidden min-h-11 cursor-pointer items-center justify-center rounded-md bg-overlay px-4 py-2 text-sm font-medium leading-5 text-accent-foreground shadow-card transition-colors hover:bg-overlay-dark sm:inline-flex"
            >
              {ctaLabel}
            </Link>
          )}

          <button
            type="button"
            className="focus-ring inline-flex size-10 cursor-pointer items-center justify-center rounded-md border border-border bg-surface text-text-primary shadow-card transition-colors hover:bg-surface-secondary sm:hidden"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            title={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-border bg-surface px-4 py-3 shadow-card sm:hidden">
          <ul className="mx-auto flex w-full max-w-page flex-col gap-1">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`focus-ring flex min-h-11 items-center rounded-md px-3 text-sm font-medium leading-5 transition-colors hover:bg-surface-secondary hover:text-accent ${
                    activeHref === item.href ? "bg-accent-muted text-accent" : "text-text-dark"
                  }`}
                  aria-current={activeHref === item.href ? "page" : undefined}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

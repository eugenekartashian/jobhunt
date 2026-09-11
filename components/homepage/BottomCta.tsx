import Link from "next/link";
import type { ReactElement } from "react";

import { TrackedLink } from "@/components/analytics/TrackedLink";

function Arrow(): ReactElement {
  return (
    <span
      className="ml-2 h-0 w-0 border-y-[3px] border-l-[5px] border-y-transparent border-l-current"
      aria-hidden="true"
    />
  );
}

type BottomCtaProps = {
  primaryHref: string;
  primaryLabel?: string;
};

export function BottomCta({ primaryHref, primaryLabel = "Get Started" }: BottomCtaProps): ReactElement {
  return (
    <section className="bg-landing-glow border-b border-border px-6 py-20 text-center sm:px-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <h2 className="text-4xl font-bold leading-[1.08] text-text-slate sm:text-section-display">
          Your next job search can feel a<br className="hidden sm:block" />
          lot less overwhelming
        </h2>
        <p className="mt-7 text-base font-medium leading-6 text-text-secondary">
          Set up your profile, upload your CV, and start finding matches in
          minutes.
        </p>
        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row">
          <TrackedLink
            href={primaryHref}
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md bg-overlay px-6 py-2.5 text-sm font-medium leading-5 text-accent-foreground shadow-card transition-colors hover:bg-overlay-dark"
            event="landing_cta_clicked"
            properties={{ placement: "bottom_cta" }}
          >
            {primaryLabel}
            <Arrow />
          </TrackedLink>
          <Link
            href="/find-jobs"
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-6 py-2.5 text-sm font-medium leading-5 text-text-primary shadow-card transition-colors hover:bg-surface-secondary"
          >
            Find Your First Match
          </Link>
        </div>
      </div>
    </section>
  );
}

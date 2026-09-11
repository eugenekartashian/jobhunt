import Link from 'next/link';
import type { ReactElement } from 'react';

import { TrackedLink } from '@/components/analytics/TrackedLink';

function Arrow(): ReactElement {
  return (
    <span
      className="ml-2 h-0 w-0 border-y-[3px] border-l-[5px] border-y-transparent border-l-current"
      aria-hidden="true"
    />
  );
}

type HeroProps = {
  primaryHref: string;
  primaryLabel?: string;
};

export function Hero({ primaryHref, primaryLabel = 'Get Started' }: HeroProps): ReactElement {
  return (
    <section className="bg-landing-glow flex min-h-103.5 items-center justify-center border-b border-border px-6 py-16 text-center sm:px-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] text-text-slate sm:text-hero">
          Job hunting is hard.
          <br />
          Your tools shouldn&apos;t be.
        </h1>
        <p className="mt-7 max-w-2xl text-base font-medium leading-6 text-text-secondary">
          Stop applying blind. Job Hunt finds the jobs, researches the
          companies, and gives you everything you need to stand out.
        </p>
        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row">
          <TrackedLink
            href={primaryHref}
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md bg-overlay px-6 py-2.5 text-sm font-medium leading-5 text-accent-foreground shadow-card transition-colors hover:bg-overlay-dark"
            event="landing_cta_clicked"
            properties={{ placement: 'hero' }}
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

import Link from "next/link";
import type { ReactElement } from "react";
import { ArrowUpRight, Building2 } from "lucide-react";

import type { Job } from "@/types";

type JobHeaderProps = {
  job: Job;
};

export function JobHeader({ job }: JobHeaderProps): ReactElement {
  const applyUrl = job.external_apply_url ?? job.source_url;

  return (
    <section className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-6 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-7">
      <div className="flex min-w-0 items-center gap-4">
        <span aria-hidden="true" className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted text-text-secondary"><Building2 className="size-7" /></span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold leading-8 text-text-primary sm:text-3xl">{job.title}</h1>
          <p className="mt-1 text-sm font-semibold text-text-secondary">{job.company} <span aria-hidden="true">•</span> <span className="text-success-dark">{job.match_score ?? "-"}% Match Score</span></p>
        </div>
      </div>
      <Link href={applyUrl} target="_blank" rel="noreferrer" className="focus-ring inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-surface px-5 text-sm font-bold text-text-primary shadow-card transition-colors hover:bg-surface-secondary">
        <ArrowUpRight className="size-4" aria-hidden="true" />
        View Job Post
      </Link>
    </section>
  );
}

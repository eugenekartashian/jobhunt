import type { ReactElement } from "react";
import { BriefcaseBusiness, CalendarDays, DollarSign, MapPin } from "lucide-react";

import type { Job } from "@/types";

type JobInfoCardsProps = {
  job: Job;
};

function dateLabel(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Recently" : date.toLocaleDateString("en", { month: "short", day: "numeric" });
}

export function JobInfoCards({ job }: JobInfoCardsProps): ReactElement {
  const details = [
    { icon: DollarSign, value: job.salary ?? "Not listed", label: "Salary Est.", tone: "bg-success-lightest text-success-dark" },
    { icon: MapPin, value: job.location ?? "Not specified", label: "Location", tone: "bg-info-lightest text-info-dark" },
    { icon: BriefcaseBusiness, value: job.job_type ?? "Not listed", label: "Job Type", tone: "bg-accent-muted text-accent" },
    { icon: CalendarDays, value: dateLabel(job.found_at), label: "Date Found", tone: "bg-surface-secondary text-text-secondary" },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Job information">
      {details.map((detail) => (
        <div key={detail.label} className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-card">
          <span aria-hidden="true" className={`flex size-11 shrink-0 items-center justify-center rounded-md ${detail.tone}`}><detail.icon className="size-5" /></span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-text-primary">{detail.value}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-text-secondary">{detail.label}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

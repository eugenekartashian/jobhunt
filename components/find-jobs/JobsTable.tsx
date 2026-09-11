import type { ReactElement } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import type { Job } from "@/types";

type JobsTableProps = {
  jobs: Job[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function scoreColor(score: number): string {
  if (score >= 80) return "bg-success";
  if (score >= 60) return "bg-info";
  return "bg-warning";
}

function scoreWidth(score: number): string {
  if (score >= 95) return "w-[96%]";
  if (score >= 90) return "w-[94%]";
  if (score >= 85) return "w-[88%]";
  return "w-[72%]";
}

function foundLabel(value: string): string {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Recently";
  const hours = Math.max(1, Math.floor((Date.now() - timestamp) / 3_600_000));
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

export function JobsTable({ jobs, totalCount, currentPage, totalPages, onPageChange }: JobsTableProps): ReactElement {
  const firstResult = totalCount === 0 ? 0 : (currentPage - 1) * 20 + 1;
  const lastResult = totalCount === 0 ? 0 : firstResult + jobs.length - 1;
  const cellLinkClass = "-mx-6 -my-5 block px-6 py-5 focus-ring";

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-card" aria-labelledby="jobs-list-heading">
      <h2 id="jobs-list-heading" className="sr-only">Job matches</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead className="bg-surface-secondary">
            <tr className="border-b border-border text-xs font-bold uppercase tracking-[0.08em] text-text-secondary">
              <th className="px-6 py-5">Company</th>
              <th className="px-6 py-5">Role</th>
              <th className="px-6 py-5">Match Score</th>
              <th className="px-6 py-5">Salary Est.</th>
              <th className="px-6 py-5">Source</th>
              <th className="px-6 py-5">Date Found</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? <tr>
              <td colSpan={6} className="px-6 py-14 text-center">
                <p className="text-sm font-semibold text-text-secondary">No jobs found yet.</p>
                <p className="mt-1 text-sm text-text-muted">Search by role and location to discover matching opportunities.</p>
              </td>
            </tr> : jobs.map((job) => (
              <tr key={job.id} className="border-b border-border text-sm font-medium text-text-dark last:border-b-0 hover:bg-surface-secondary">
                <td className="px-6 py-5">
                  <Link href={`/find-jobs/${job.id}`} className={`${cellLinkClass} flex items-center gap-4 font-bold text-text-primary`}>
                    <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-md border border-border bg-surface-muted text-text-secondary"><Building2 className="size-5" /></span>
                    {job.company}
                  </Link>
                </td>
                <td className="px-6 py-5">
                  <Link href={`/find-jobs/${job.id}`} className={`${cellLinkClass} transition-colors hover:text-accent`}>{job.title}</Link>
                </td>
                <td className="px-6 py-5">
                  <Link href={`/find-jobs/${job.id}`} className={`${cellLinkClass} flex items-center gap-3`}>
                    <span className="h-1.5 w-24 rounded-full bg-border">
                      <span className={`block h-full rounded-full ${scoreColor(job.match_score ?? 0)} ${scoreWidth(job.match_score ?? 0)}`} />
                    </span>
                    <span className="font-bold text-text-dark">{job.match_score ?? "-"}{job.match_score === null ? "" : "%"}</span>
                  </Link>
                </td>
                <td className="px-6 py-5"><Link href={`/find-jobs/${job.id}`} className={cellLinkClass}>{job.salary ?? "Not listed"}</Link></td>
                <td className="px-6 py-5">
                  <Link href={`/find-jobs/${job.id}`} className={cellLinkClass}>
                    <span className="inline-flex rounded-full bg-surface-secondary px-3 py-1 text-xs font-semibold text-text-secondary">
                      {job.source === "search" ? "Search" : "URL"}
                    </span>
                  </Link>
                </td>
                <td className="px-6 py-5 text-text-secondary"><Link href={`/find-jobs/${job.id}`} className={cellLinkClass}>{foundLabel(job.found_at)}</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-4 border-t border-border px-6 py-5 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
        <p>Showing <strong className="font-bold text-text-primary">{firstResult}</strong> to <strong className="font-bold text-text-primary">{lastResult}</strong> of <strong className="font-bold text-text-primary">{totalCount}</strong> results</p>
        <nav aria-label="Jobs pagination" className="flex items-center gap-2">
          <button type="button" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} className="focus-ring min-h-10 cursor-pointer rounded-md border border-border bg-surface px-4 font-semibold text-text-muted transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button key={page} type="button" aria-current={page === currentPage ? "page" : undefined} onClick={() => onPageChange(page)} className={page === currentPage ? "focus-ring size-10 cursor-pointer rounded-md border border-accent bg-accent-muted font-bold text-accent" : "focus-ring size-10 cursor-pointer rounded-md border border-border bg-surface font-semibold text-text-dark hover:bg-surface-secondary"}>{page}</button>
          ))}
          <button type="button" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} className="focus-ring min-h-10 cursor-pointer rounded-md border border-border bg-surface px-4 font-semibold text-text-dark hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50">Next</button>
        </nav>
      </div>
    </section>
  );
}

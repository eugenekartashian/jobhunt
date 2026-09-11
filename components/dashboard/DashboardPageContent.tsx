import type { ReactElement } from "react";

import { PostHogIdentify } from "@/components/analytics/PostHogIdentify";
import { CompanyResearchChart, JobsFoundChart, MatchScoreChart } from "@/components/dashboard/DashboardCharts";
import type { DashboardActivity, DashboardAnalytics, DashboardStats } from "@/lib/dashboard";
import type { UserSchema } from "@insforge/shared-schemas";

type DashboardPageContentProps = {
  user: UserSchema;
  stats: DashboardStats;
  activity: DashboardActivity[];
  analytics: DashboardAnalytics;
};

function ChartCard({ title, children, className = "" }: { title: string; children: ReactElement; className?: string }): ReactElement {
  return <section className={`rounded-lg border border-border bg-surface p-5 shadow-card sm:p-7 ${className}`}><h2 className="text-base font-bold text-text-primary">{title}</h2><div className="mt-7">{children}</div></section>;
}

function getStatCards(stats: DashboardStats) {
  return [
    { label: "Total Jobs Found", value: String(stats.totalJobsFound), detail: "All saved jobs" },
    { label: "Avg. Match Rate", value: stats.averageMatchRate === null ? "—" : `${stats.averageMatchRate}%`, detail: stats.averageMatchRate === null ? "No scored jobs yet" : "Across all saved jobs" },
    { label: "Companies Researched", value: String(stats.companiesResearched), detail: "Jobs with research" },
    { label: "Jobs This Week", value: String(stats.jobsThisWeek), detail: "Found in the last 7 days" },
  ];
}

function ActivityTimeline({ activity }: { activity: DashboardActivity[] }): ReactElement {
  if (!activity.length) return <p className="px-5 py-12 text-sm text-text-muted sm:px-7">No activity yet.</p>;

  return <ol className="px-5 py-5 sm:px-7">{activity.map((item, index) => <li key={item.id} className="relative flex gap-4 pb-7 last:pb-0"><span className="relative mt-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-surface-muted"><span className={`size-2 rounded-full ${item.tone === "success" ? "bg-success" : "bg-info"}`} /></span>{index < activity.length - 1 && <span aria-hidden="true" className="absolute left-[7px] top-5 h-full w-px bg-border" />}<div><p className="text-sm font-semibold text-text-primary">{item.label}</p><p className="mt-1 text-xs text-text-muted">{item.time}</p></div></li>)}</ol>;
}

export function DashboardPageContent({ user, stats, activity, analytics }: DashboardPageContentProps): ReactElement {
  const statCards = getStatCards(stats);

  return <main className="bg-background px-4 py-8 sm:px-8 lg:px-20 lg:py-12"><PostHogIdentify userId={user.id} email={user.email} /><div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{statCards.map((stat) => <section key={stat.label} className="rounded-lg border border-border bg-surface px-5 py-6 shadow-card sm:px-7"><p className="text-sm font-medium text-text-secondary">{stat.label}</p><p className="mt-2 text-4xl font-semibold leading-none text-text-primary">{stat.value}</p><p className="mt-4 text-xs text-text-muted">{stat.detail}</p></section>)}</div>
    <div className="grid gap-6 lg:grid-cols-2"><section className="rounded-lg border border-border bg-surface shadow-card"><div className="border-b border-border px-5 py-5 sm:px-7"><h2 className="text-base font-bold text-text-primary">Recent Activity</h2></div><ActivityTimeline activity={activity} /></section><ChartCard title="Company Research Activity"><CompanyResearchChart data={analytics.companyResearch} /></ChartCard></div>
    <div className="grid gap-6 lg:grid-cols-3"><ChartCard title="Jobs Found Over Time" className="lg:col-span-2"><JobsFoundChart data={analytics.jobsFound} /></ChartCard><ChartCard title="Match Score Distribution"><MatchScoreChart data={analytics.matchScores} /></ChartCard></div>
  </div></main>;
}

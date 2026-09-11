"use client";

import type { ReactElement } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { DashboardAnalytics, DashboardChartPoint } from "@/lib/dashboard";

const tooltipStyle = {
  backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "8px",
  boxShadow: "var(--shadow-card)", color: "var(--color-text-primary)", fontSize: "12px",
};
const axisStyle = { fill: "var(--color-text-muted)", fontSize: 12 };

function EmptyChartState({ message }: { message: string }): ReactElement {
  return <div className="flex h-64 items-center justify-center rounded-md bg-surface-secondary px-5 text-center text-sm text-text-muted">{message}</div>;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number; name?: string }>; label?: string }): ReactElement | null {
  if (!active || !payload?.length) return null;
  return <div style={tooltipStyle}><p className="font-semibold">{label}</p><p className="mt-1">{payload[0]?.name}: {payload[0]?.value}</p></div>;
}

function ChartFrame({ children, ariaLabel }: { children: ReactElement; ariaLabel: string }): ReactElement {
  return <div className="h-64 w-full" aria-label={ariaLabel}><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div>;
}

export function CompanyResearchChart({ data }: { data: DashboardChartPoint[] }): ReactElement {
  if (!data.length) return <EmptyChartState message="No company research events in the last 7 days." />;
  return <ChartFrame ariaLabel="Company research activity chart"><BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}><CartesianGrid stroke="var(--color-border-light)" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={axisStyle} minTickGap={22} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={axisStyle} tickMargin={8} width={40} /><Tooltip cursor={{ fill: "var(--color-surface-muted)" }} content={<ChartTooltip />} /><Bar dataKey="value" name="Companies researched" fill="var(--color-info)" radius={[5, 5, 0, 0]} /></BarChart></ChartFrame>;
}

export function JobsFoundChart({ data }: { data: DashboardChartPoint[] }): ReactElement {
  if (!data.length) return <EmptyChartState message="No job search events in the last 30 days." />;
  return <ChartFrame ariaLabel="Jobs found over time chart"><LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}><CartesianGrid stroke="var(--color-border-light)" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={axisStyle} minTickGap={28} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={axisStyle} tickMargin={8} width={40} /><Tooltip cursor={{ stroke: "var(--color-border-muted)" }} content={<ChartTooltip />} /><Line type="monotone" dataKey="value" name="Jobs found" stroke="var(--color-accent)" strokeWidth={3} dot={{ r: 3, fill: "var(--color-accent)", strokeWidth: 0 }} activeDot={{ r: 6, fill: "var(--color-accent-dark)" }} /></LineChart></ChartFrame>;
}

export function MatchScoreChart({ data }: { data: DashboardChartPoint[] }): ReactElement {
  if (!data.length) return <EmptyChartState message="No scored jobs in the last 30 days." />;
  return <ChartFrame ariaLabel="Match score distribution chart"><BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}><CartesianGrid stroke="var(--color-border-light)" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={axisStyle} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={axisStyle} tickMargin={8} width={40} /><Tooltip cursor={{ fill: "var(--color-surface-muted)" }} content={<ChartTooltip />} /><Bar dataKey="value" name="Jobs" fill="var(--color-success)" radius={[5, 5, 0, 0]} /></BarChart></ChartFrame>;
}

export function DashboardCharts({ analytics }: { analytics: DashboardAnalytics }): ReactElement {
  return <><CompanyResearchChart data={analytics.companyResearch} /><JobsFoundChart data={analytics.jobsFound} /><MatchScoreChart data={analytics.matchScores} /></>;
}

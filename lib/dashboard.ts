import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";

export type DashboardStats = {
  totalJobsFound: number;
  averageMatchRate: number | null;
  companiesResearched: number;
  jobsThisWeek: number;
};

export type DashboardActivity = {
  id: string;
  label: string;
  time: string;
  tone: "info" | "success";
};

export type DashboardChartPoint = {
  label: string;
  value: number;
};

export type DashboardAnalytics = {
  jobsFound: DashboardChartPoint[];
  matchScores: DashboardChartPoint[];
  companyResearch: DashboardChartPoint[];
};

type DashboardStatsRow = {
  match_score: number | null;
  company_research: unknown;
  found_at: string;
};

type DashboardResearchJobRow = {
  id: string;
  company: string;
  company_research: unknown;
  updated_at: string;
};

type DashboardRunRow = {
  id: string;
  job_title_searched: string;
  jobs_found: number;
  completed_at: string | null;
  created_at: string;
};

const EMPTY_STATS: DashboardStats = {
  totalJobsFound: 0,
  averageMatchRate: null,
  companiesResearched: 0,
  jobsThisWeek: 0,
};

const EMPTY_ANALYTICS: DashboardAnalytics = {
  jobsFound: [],
  matchScores: [],
  companyResearch: [],
};

export async function getDashboardStatsForUser(userId: string): Promise<DashboardStats> {
  const client = createServerClient({ cookies: await cookies() });
  const { data, error } = await client.database
    .from("jobs")
    .select("match_score, company_research, found_at")
    .eq("user_id", userId);

  if (error) {
    console.error("[getDashboardStatsForUser]", error);
    return EMPTY_STATS;
  }

  const jobs = Array.isArray(data) ? data as DashboardStatsRow[] : [];
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const scores = jobs
    .map((job) => job.match_score)
    .filter((score): score is number => typeof score === "number" && Number.isFinite(score));

  return {
    totalJobsFound: jobs.length,
    averageMatchRate: scores.length
      ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
      : null,
    companiesResearched: jobs.filter((job) => job.company_research !== null && job.company_research !== undefined).length,
    jobsThisWeek: jobs.filter((job) => {
      const foundAt = Date.parse(job.found_at);
      return Number.isFinite(foundAt) && foundAt >= weekAgo;
    }).length,
  };
}

function formatTimeAgo(timestamp: string): string {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - Date.parse(timestamp)) / 1000));
  if (elapsedSeconds < 60) return "Just now";
  const minutes = Math.floor(elapsedSeconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export async function getDashboardActivityForUser(userId: string): Promise<DashboardActivity[]> {
  const client = createServerClient({ cookies: await cookies() });
  const [runsResult, jobsResult] = await Promise.all([
    client.database
      .from("agent_runs")
      .select("id, job_title_searched, jobs_found, completed_at, created_at")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(10),
    client.database
      .from("jobs")
      .select("id, company, company_research, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(20),
  ]);

  if (runsResult.error) console.error("[getDashboardActivityForUser:runs]", runsResult.error);
  if (jobsResult.error) console.error("[getDashboardActivityForUser:jobs]", jobsResult.error);

  const runs = Array.isArray(runsResult.data) ? runsResult.data as DashboardRunRow[] : [];
  const researchedJobs = (Array.isArray(jobsResult.data) ? jobsResult.data as DashboardResearchJobRow[] : [])
    .filter((job) => job.company_research !== null && job.company_research !== undefined);

  return [
    ...runs.map((run) => ({
      id: `run-${run.id}`,
      label: `Found ${run.jobs_found} jobs for ${run.job_title_searched}`,
      time: formatTimeAgo(run.completed_at ?? run.created_at),
      tone: "info" as const,
      timestamp: Date.parse(run.completed_at ?? run.created_at),
    })),
    ...researchedJobs.map((job) => ({
      id: `research-${job.id}`,
      label: `Researched ${job.company}`,
      time: formatTimeAgo(job.updated_at),
      tone: "success" as const,
      timestamp: Date.parse(job.updated_at),
    })),
  ]
    .sort((left, right) => right.timestamp - left.timestamp)
    .slice(0, 5)
    .map((item) => ({ id: item.id, label: item.label, time: item.time, tone: item.tone }));
}

type PostHogQueryResponse = {
  results?: unknown[][];
};

function getPostHogQueryConfig(): { url: string; key: string } | null {
  const key = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !projectId || !host) return null;

  const postHogHost = new URL(host);
  postHogHost.hostname = postHogHost.hostname.replace(".i.posthog.com", ".posthog.com");
  return { key, url: `${postHogHost.origin}/api/projects/${projectId}/query/` };
}

function escapeHogQlString(value: string): string {
  return value.replaceAll("'", "''");
}

async function runPostHogQuery(query: string): Promise<unknown[][] | null> {
  const config = getPostHogQueryConfig();
  if (!config) return null;

  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error("[getDashboardAnalyticsForUser:posthog]", response.status, await response.text());
      return null;
    }

    const payload = await response.json() as PostHogQueryResponse;
    return Array.isArray(payload.results) ? payload.results : null;
  } catch (error) {
    console.error("[getDashboardAnalyticsForUser:posthog]", error);
    return null;
  }
}

function formatAnalyticsDate(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function fillDailySeries(rows: DashboardChartPoint[], days: number): DashboardChartPoint[] {
  const valuesByLabel = new Map(rows.map((row) => [row.label, row.value]));
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(Date.now() - (days - index - 1) * 24 * 60 * 60 * 1000);
    const label = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
    return { label, value: valuesByLabel.get(label) ?? 0 };
  });
}

function fillScoreRanges(rows: DashboardChartPoint[]): DashboardChartPoint[] {
  const ranges = ["50-60%", "60-70%", "70-80%", "80-90%", "90-100%"];
  const valuesByRange = new Map(rows.map((row) => [row.label, row.value]));
  return ranges.map((label) => ({ label, value: valuesByRange.get(label) ?? 0 }));
}

export async function getDashboardAnalyticsForUser(userId: string): Promise<DashboardAnalytics> {
  if (!getPostHogQueryConfig()) return EMPTY_ANALYTICS;

  const distinctId = escapeHogQlString(userId);
  const [jobsFoundRows, scoreRows, researchRows] = await Promise.all([
    runPostHogQuery(`
      SELECT toDate(timestamp) AS day, count() AS total
      FROM events
      WHERE distinct_id = '${distinctId}'
        AND event = 'job_found'
        AND timestamp >= now() - INTERVAL 30 DAY
      GROUP BY day
      ORDER BY day
    `),
    runPostHogQuery(`
      SELECT
        multiIf(
          toInt(properties.matchScore) >= 90, '90-100%',
          toInt(properties.matchScore) >= 80, '80-90%',
          toInt(properties.matchScore) >= 70, '70-80%',
          toInt(properties.matchScore) >= 60, '60-70%',
          '50-60%'
        ) AS score_range,
        count() AS total
      FROM events
      WHERE distinct_id = '${distinctId}'
        AND event = 'job_found'
        AND timestamp >= now() - INTERVAL 30 DAY
        AND toInt(properties.matchScore) >= 50
      GROUP BY score_range
      ORDER BY score_range
    `),
    runPostHogQuery(`
      SELECT toDate(timestamp) AS day, count() AS total
      FROM events
      WHERE distinct_id = '${distinctId}'
        AND event = 'company_researched'
        AND timestamp >= now() - INTERVAL 7 DAY
      GROUP BY day
      ORDER BY day
    `),
  ]);

  const jobsFound = (jobsFoundRows ?? []).flatMap(([day, total]) => {
      const label = formatAnalyticsDate(day);
      return label && typeof total === "number" ? [{ label, value: total }] : [];
  });
  const matchScores = (scoreRows ?? []).flatMap(([range, total]) => {
      return typeof range === "string" && typeof total === "number" ? [{ label: range, value: total }] : [];
  });
  const companyResearch = (researchRows ?? []).flatMap(([day, total]) => {
      const label = formatAnalyticsDate(day);
      return label && typeof total === "number" ? [{ label, value: total }] : [];
  });

  return {
    jobsFound: jobsFound.length ? fillDailySeries(jobsFound, 30) : [],
    matchScores: matchScores.length ? fillScoreRanges(matchScores) : [],
    companyResearch: companyResearch.length ? fillDailySeries(companyResearch, 7) : [],
  };
}

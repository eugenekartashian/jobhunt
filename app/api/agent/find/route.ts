import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { matchJobsToProfile } from "@/agent/matcher";
import { searchAdzunaJobs, type AdzunaJob } from "@/lib/adzuna";
import { capturePostHogServerEvent } from "@/lib/posthog-server";
import { getAuthenticatedUser } from "@/lib/insforge-auth";
import { createServerClient } from "@insforge/sdk/ssr";
import type { JobType, Profile } from "@/types";

type FindJobsRequest = {
  jobTitle?: unknown;
  location?: unknown;
};

function asSearchText(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new Error(`${field} must be a string`);
  }
  const text = value.trim();
  if (!text || text.length > 120) {
    throw new Error(`${field} is required and must be shorter than 120 characters`);
  }
  return text;
}

function countryFromLocation(location: string): string {
  const value = location.toLowerCase();
  if (/(spain|españa|espana|barcelona|madrid|valencia|seville|sevilla|malaga|málaga|alicante|bilbao|zaragoza|palma)/u.test(value)) return "es";
  if (/(united states|usa|new york|san francisco|los angeles|chicago|boston|\bus\b)/u.test(value)) return "us";
  if (/(united kingdom|uk|england|london|manchester)/u.test(value)) return "gb";
  if (/(germany|deutschland|berlin|munich|münchen)/u.test(value)) return "de";
  if (/(france|paris|lyon)/u.test(value)) return "fr";
  if (/(italy|italia|rome|milan|milano)/u.test(value)) return "it";
  if (/(canada|toronto|vancouver)/u.test(value)) return "ca";
  if (/(australia|sydney|melbourne)/u.test(value)) return "au";
  return "es";
}

function jobType(value: string | undefined): JobType | null {
  if (value === "part_time") return "parttime";
  if (value === "contract") return "contract";
  if (value === "full_time" || value === "permanent") return "fulltime";
  return null;
}

function formatSalary(job: AdzunaJob, country: string): string | null {
  if (typeof job.salary_min !== "number" && typeof job.salary_max !== "number") return null;
  const symbol = country === "us" || country === "ca" ? "$" : "€";
  const format = (value: number | undefined): string => value === undefined ? "?" : `${symbol}${Math.round(value / 1000)}k`;
  return `${format(job.salary_min)} - ${format(job.salary_max)}`;
}

function text(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

async function writeLog(client: ReturnType<typeof createServerClient>, userId: string, runId: string, message: string, level: "info" | "success" | "error"): Promise<void> {
  const { error } = await client.database.from("agent_logs").insert({ user_id: userId, run_id: runId, message, level });
  if (error) console.warn("[agent/find] log write failed", error);
}

export async function POST(request: Request): Promise<Response> {
  let runId: string | null = null;
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });

    const body = (await request.json()) as FindJobsRequest;
    const jobTitle = asSearchText(body.jobTitle, "jobTitle");
    const location = typeof body.location === "string" ? body.location.trim() : "";
    if (location.length > 120) throw new Error("location must be shorter than 120 characters");

    const client = createServerClient({ cookies: await cookies() });
    const { data: profileData, error: profileError } = await client.database.from("profiles").select("*").eq("id", user.id).single();
    if (profileError || !profileData) return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });

    const profile = profileData as Profile;
    const { data: run, error: runError } = await client.database.from("agent_runs").insert({
      user_id: user.id,
      status: "running",
      job_title_searched: jobTitle,
      location_searched: location || null,
    }).select().single();
    if (runError || !run) throw new Error("Could not start job search");
    runId = String(run.id);
    await writeLog(client, user.id, runId, `Searching Adzuna for ${jobTitle}${location ? ` in ${location}` : ""}.`, "info");
    await capturePostHogServerEvent({ distinctId: user.id, event: "job_search_started", properties: { jobTitle, location } });

    const country = countryFromLocation(location || text(profile.location) || "Spain");
    const sourceJobs = await searchAdzunaJobs(jobTitle, location, country);
    const normalizedJobs = sourceJobs.map((sourceJob) => {
      const company = text(sourceJob.company?.display_name) || "Unknown company";
      const title = text(sourceJob.title) || jobTitle;
      const jobLocation = text(sourceJob.location?.display_name) || location || "Not specified";
      return { sourceJob, company, title, jobLocation };
    });
    const matches = await matchJobsToProfile(normalizedJobs.map(({ title, company, jobLocation, sourceJob }) => ({
      title,
      company,
      location: jobLocation,
      description: text(sourceJob.description),
    })), profile);
    const records = normalizedJobs.map(({ sourceJob, company, title, jobLocation }, index) => {
      const match = matches[index];
      return {
        run_id: runId,
        user_id: user.id,
        source: "search",
        source_url: sourceJob.redirect_url,
        external_apply_url: sourceJob.redirect_url,
        title,
        company,
        location: jobLocation,
        salary: formatSalary(sourceJob, country),
        job_type: jobType(sourceJob.contract_type),
        about_role: text(sourceJob.description),
        responsibilities: [],
        requirements: [],
        nice_to_have: [],
        benefits: [],
        about_company: null,
        match_score: match.matchScore,
        match_reason: match.matchReason,
        matched_skills: match.matchedSkills,
        missing_skills: match.missingSkills,
        found_at: sourceJob.created || new Date().toISOString(),
      };
    });

    const { data: savedJobs, error: jobsError } = records.length > 0
      ? await client.database.from("jobs").upsert(records, { onConflict: "user_id,source_url" }).select()
      : { data: [], error: null };
    if (jobsError) throw new Error("Could not save discovered jobs");

    const jobsFound = savedJobs?.length ?? 0;
    const strongMatches = records.filter((job) => job.match_score >= 70).length;
    const { error: updateError } = await client.database.from("agent_runs").update({ status: "completed", jobs_found: jobsFound, completed_at: new Date().toISOString() }).eq("id", runId).eq("user_id", user.id);
    if (updateError) throw new Error("Could not complete job search");
    await writeLog(client, user.id, runId, `Found ${jobsFound} jobs and ${strongMatches} strong matches.`, "success");
    for (const job of records) {
      await capturePostHogServerEvent({ distinctId: user.id, event: "job_found", properties: { source: "adzuna", matchScore: job.match_score } });
    }

    return NextResponse.json({ success: true, data: { jobs: savedJobs ?? [], jobsFound, strongMatches, runId } });
  } catch (error) {
    console.error("[agent/find]", error);
    if (runId) {
      try {
        const client = createServerClient({ cookies: await cookies() });
        await client.database.from("agent_runs").update({ status: "failed", completed_at: new Date().toISOString() }).eq("id", runId);
        await writeLog(client, String((await getAuthenticatedUser())?.id ?? ""), runId, "Job search failed.", "error");
      } catch (cleanupError) {
        console.error("[agent/find/cleanup]", cleanupError);
      }
    }
    return NextResponse.json({ success: false, error: "We couldn't complete the job search. Please try again." }, { status: 500 });
  }
}

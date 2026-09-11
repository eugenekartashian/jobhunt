import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { synthesizeCompanyResearch } from "@/agent/research";
import { getAuthenticatedUser } from "@/lib/insforge-auth";
import { capturePostHogServerEvent } from "@/lib/posthog-server";
import { createServerClient } from "@insforge/sdk/ssr";
import type { Job, Profile } from "@/types";

type ResearchClient = ReturnType<typeof createServerClient>;

async function writeResearchLog(client: ResearchClient, userId: string, jobId: string, message: string, level: "info" | "success" | "error"): Promise<void> {
  const { error } = await client.database.from("agent_logs").insert({ user_id: userId, job_id: jobId, message, level });
  if (error) console.warn("[agent/research] log write failed", error);
}

export async function POST(request: Request): Promise<Response> {
  let client: ResearchClient | null = null;
  let userId: string | null = null;
  let jobId: string | null = null;
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    userId = user.id;
    const body = await request.json() as { jobId?: unknown };
    if (typeof body.jobId !== "string" || !body.jobId.trim()) return NextResponse.json({ success: false, error: "jobId is required" }, { status: 400 });
    jobId = body.jobId.trim();

    client = createServerClient({ cookies: await cookies() });
    const [{ data: jobData, error: jobError }, { data: profileData, error: profileError }] = await Promise.all([
      client.database.from("jobs").select("*").eq("id", jobId).eq("user_id", user.id).maybeSingle(),
      client.database.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    ]);
    if (jobError || !jobData) return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    if (profileError || !profileData) return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });

    const job = jobData as Job;
    if (job.company_research) return NextResponse.json({ success: true, data: { research: job.company_research } });
    await writeResearchLog(client, user.id, job.id, `Started company research for ${job.company}.`, "info");
    const research = await synthesizeCompanyResearch(job, profileData as Profile);
    const { error: updateError } = await client.database.from("jobs").update({ company_research: research }).eq("id", job.id).eq("user_id", user.id);
    if (updateError) throw new Error("Could not save company research");

    await writeResearchLog(client, user.id, job.id, `Completed company research for ${job.company}.`, "success");
    await capturePostHogServerEvent({ distinctId: user.id, event: "company_researched", properties: { jobId: job.id, company: job.company } });
    revalidatePath(`/find-jobs/${job.id}`);
    return NextResponse.json({ success: true, data: { research } });
  } catch (error) {
    console.error("[agent/research]", error);
    if (client && userId && jobId) await writeResearchLog(client, userId, jobId, "Company research failed.", "error");
    return NextResponse.json({ success: false, error: "Could not research this company. Please try again." }, { status: 500 });
  }
}

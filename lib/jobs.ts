import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";

import type { Job } from "@/types";

export async function getJobsForUser(userId: string): Promise<Job[]> {
  const client = createServerClient({ cookies: await cookies() });
  const { data, error } = await client.database
    .from("jobs")
    .select("*")
    .eq("user_id", userId)
    .order("found_at", { ascending: false });

  if (error) {
    console.error("[getJobsForUser]", error);
    return [];
  }

  return Array.isArray(data) ? data as Job[] : [];
}

export async function getJobForUser(userId: string, jobId: string): Promise<Job | null> {
  const client = createServerClient({ cookies: await cookies() });
  const { data, error } = await client.database
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[getJobForUser]", error);
    return null;
  }

  return data ? data as Job : null;
}

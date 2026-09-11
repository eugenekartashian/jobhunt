import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";

import type { Profile } from "@/types";

export async function getProfileForUser(userId: string): Promise<Profile | null> {
  const client = createServerClient({ cookies: await cookies() });
  const { data, error } = await client.database
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Profile;
}

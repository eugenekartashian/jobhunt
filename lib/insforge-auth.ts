import "server-only";

import type { UserSchema } from "@insforge/shared-schemas";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@insforge/sdk/ssr";

export const OAUTH_PKCE_COOKIE = "jobhunt_oauth_pkce";

const requiredEnvKeys = [
  "NEXT_PUBLIC_INSFORGE_URL",
  "NEXT_PUBLIC_INSFORGE_ANON_KEY",
] as const;

export function hasInsForgeEnv(): boolean {
  return requiredEnvKeys.every((key) => Boolean(process.env[key]));
}

export async function isUserAuthenticated(): Promise<boolean> {
  return Boolean(await getAuthenticatedUser());
}

export async function getAuthenticatedUser(): Promise<UserSchema | null> {
  if (!hasInsForgeEnv()) {
    return null;
  }

  const cookieStore = await cookies();
  const client = createServerClient({ cookies: cookieStore });
  const { data, error } = await client.auth.getCurrentUser();

  if (error) {
    return null;
  }

  return data.user;
}

export async function requireUserAuthenticated(): Promise<UserSchema> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export function getSiteOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedHost) {
    return `${forwardedProto ?? "https"}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
}

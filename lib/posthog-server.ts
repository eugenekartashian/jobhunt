import "server-only";

import { PostHog } from "posthog-node";

export type PostHogServerEvent =
  | "auth_signed_in"
  | "auth_signed_out"
  | "authenticated_placeholder_viewed"
  | "profile_saved"
  | "resume_uploaded"
  | "resume_generated"
  | "job_search_started"
  | "job_found"
  | "company_researched";

type ServerEventPayload = {
  distinctId: string;
  event: PostHogServerEvent;
  properties?: Record<string, string | number | boolean>;
};

type PostHogServerEnv = {
  key: string;
  host: string;
};

function getPostHogServerEnv(): PostHogServerEnv | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) {
    return null;
  }

  return { key, host };
}

export function createPostHogServer(): PostHog | null {
  const env = getPostHogServerEnv();

  if (!env) {
    return null;
  }

  return new PostHog(env.key, {
    host: env.host,
    flushAt: 1,
    flushInterval: 0,
  });
}

export async function capturePostHogServerEvent({
  distinctId,
  event,
  properties,
}: ServerEventPayload): Promise<void> {
  const posthog = createPostHogServer();

  if (!posthog) {
    return;
  }

  try {
    posthog.capture({
      distinctId,
      event,
      properties: { userId: distinctId, ...properties },
    });
  } catch (error) {
    console.error("[posthog-server]", error);
  } finally {
    try {
      await posthog.shutdown();
    } catch (error) {
      console.error("[posthog-server/shutdown]", error);
    }
  }
}

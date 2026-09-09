import posthog from "posthog-js";

export type PostHogClientEvent =
  | "landing_cta_clicked"
  | "oauth_sign_in_started";

type PostHogEnv = {
  key: string;
  host: string;
};

function getPostHogEnv(): PostHogEnv | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) {
    return null;
  }

  return { key, host };
}

export function initPostHog(): void {
  const env = getPostHogEnv();

  if (typeof window === "undefined" || !env) {
    return;
  }

  posthog.init(env.key, {
    api_host: env.host,
    capture_pageview: false,
    defaults: "2026-05-30",
  });
}

export function capturePostHogEvent(
  event: PostHogClientEvent,
  properties?: Record<string, string | number | boolean>,
): void {
  if (!getPostHogEnv()) {
    return;
  }

  posthog.capture(event, properties);
}

export function capturePostHogPageView(currentUrl: string): void {
  if (!getPostHogEnv()) {
    return;
  }

  posthog.capture("$pageview", {
    $current_url: currentUrl,
  });
}

export function identifyPostHogUser(
  userId: string,
  properties?: Record<string, string>,
): void {
  if (!getPostHogEnv()) {
    return;
  }

  posthog.identify(userId, properties);
}

export function resetPostHogUser(): void {
  if (!getPostHogEnv()) {
    return;
  }

  posthog.reset();
}

export function capturePostHogException(error: unknown): void {
  if (!getPostHogEnv()) {
    return;
  }

  posthog.captureException(error);
}

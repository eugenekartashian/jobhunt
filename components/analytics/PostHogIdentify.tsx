"use client";

import { useEffect, type ReactElement } from "react";

import { identifyPostHogUser } from "@/lib/posthog-client";

type PostHogIdentifyProps = {
  userId: string;
  email?: string;
};

export function PostHogIdentify({
  userId,
  email,
}: PostHogIdentifyProps): ReactElement | null {
  useEffect(() => {
    identifyPostHogUser(userId, email ? { email } : undefined);
  }, [email, userId]);

  return null;
}

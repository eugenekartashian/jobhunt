import type { ReactElement } from "react";

import { AuthenticatedPlaceholder } from "@/components/auth/AuthenticatedPlaceholder";
import { Navbar } from "@/components/layout/Navbar";
import { requireUserAuthenticated } from "@/lib/insforge-auth";
import { capturePostHogServerEvent } from "@/lib/posthog-server";

export default async function ProfilePage(): Promise<ReactElement> {
  const user = await requireUserAuthenticated();
  await capturePostHogServerEvent({
    distinctId: user.id,
    event: "authenticated_placeholder_viewed",
    properties: { page: "profile" },
  });

  return (
    <>
      <Navbar ctaHref="/dashboard" />
      <AuthenticatedPlaceholder
        title="Profile"
        description="Profile setup is next after the foundation auth flow is complete."
        user={user}
      />
    </>
  );
}

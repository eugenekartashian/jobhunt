import type { ReactElement } from "react";

import { AuthenticatedPlaceholder } from "@/components/auth/AuthenticatedPlaceholder";
import { Navbar } from "@/components/layout/Navbar";
import { requireUserAuthenticated } from "@/lib/insforge-auth";
import { capturePostHogServerEvent } from "@/lib/posthog-server";

export default async function DashboardPage(): Promise<ReactElement> {
  const user = await requireUserAuthenticated();
  await capturePostHogServerEvent({
    distinctId: user.id,
    event: "authenticated_placeholder_viewed",
    properties: { page: "dashboard" },
  });

  return (
    <>
      <Navbar ctaHref="/dashboard" />
      <AuthenticatedPlaceholder
        title="Dashboard"
        description="Dashboard setup is next after the foundation auth flow is complete."
        user={user}
      />
    </>
  );
}

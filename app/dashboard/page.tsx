import type { ReactElement } from "react";

import { DashboardPageContent } from "@/components/dashboard/DashboardPageContent";
import { Navbar } from "@/components/layout/Navbar";
import { getDashboardActivityForUser, getDashboardAnalyticsForUser, getDashboardStatsForUser } from "@/lib/dashboard";
import { requireUserAuthenticated } from "@/lib/insforge-auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage(): Promise<ReactElement> {
  const user = await requireUserAuthenticated();
  const [stats, activity, analytics] = await Promise.all([
    getDashboardStatsForUser(user.id),
    getDashboardActivityForUser(user.id),
    getDashboardAnalyticsForUser(user.id),
  ]);
  return (
    <>
      <Navbar activeHref="/dashboard" user={user} />
      <DashboardPageContent user={user} stats={stats} activity={activity} analytics={analytics} />
    </>
  );
}

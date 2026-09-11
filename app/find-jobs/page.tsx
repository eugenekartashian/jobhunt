import type { ReactElement } from "react";
import { FindJobsClient } from "@/components/find-jobs/FindJobsClient";
import { Navbar } from "@/components/layout/Navbar";
import { requireUserAuthenticated } from "@/lib/insforge-auth";
import { getJobsForUser } from "@/lib/jobs";

export const dynamic = "force-dynamic";

export default async function FindJobsPage(): Promise<ReactElement> {
  const user = await requireUserAuthenticated();
  const initialJobs = await getJobsForUser(user.id);

  return (
    <>
      <Navbar activeHref="/find-jobs" user={user} />
      <main className="bg-background px-4 py-8 sm:px-8 lg:px-20 lg:py-12">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <FindJobsClient initialJobs={initialJobs} />
        </div>
      </main>
    </>
  );
}

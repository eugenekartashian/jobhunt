import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";

import { CompanyResearch } from "@/components/job-details/CompanyResearch";
import { JobActions } from "@/components/job-details/JobActions";
import { JobDescription } from "@/components/job-details/JobDescription";
import { JobHeader } from "@/components/job-details/JobHeader";
import { JobInfoCards } from "@/components/job-details/JobInfoCards";
import { MatchReasoning } from "@/components/job-details/MatchReasoning";
import { SkillsComparison } from "@/components/job-details/SkillsComparison";
import { Navbar } from "@/components/layout/Navbar";
import { getJobForUser } from "@/lib/jobs";
import { requireUserAuthenticated } from "@/lib/insforge-auth";

export const dynamic = "force-dynamic";

type JobDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function JobDetailsPage({ params }: JobDetailsPageProps): Promise<ReactElement> {
  const user = await requireUserAuthenticated();
  const { id } = await params;
  const job = await getJobForUser(user.id, id);
  if (!job) notFound();

  const applyUrl = job.external_apply_url ?? job.source_url;

  return (
    <>
      <Navbar activeHref="/find-jobs" user={user} />
      <main className="bg-background px-4 py-8 sm:px-8 lg:px-20 lg:py-12">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <Link href="/find-jobs" className="focus-ring inline-flex w-fit items-center gap-2 rounded-md text-sm font-semibold text-text-secondary transition-colors hover:text-accent">
            <span aria-hidden="true">‹</span>
            Back to Jobs
          </Link>
          <JobHeader job={job} />
          <JobInfoCards job={job} />
          <MatchReasoning reason={job.match_reason} />
          <SkillsComparison matchedSkills={job.matched_skills} missingSkills={job.missing_skills} />
          <JobDescription description={job.about_role} sourceUrl={applyUrl} />
          <CompanyResearch company={job.company} jobId={job.id} research={job.company_research} />
          <JobActions company={job.company} applyUrl={applyUrl} />
        </div>
      </main>
    </>
  );
}

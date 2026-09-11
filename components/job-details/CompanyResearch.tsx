"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { Building2, CircleHelp, Lightbulb, ListChecks, MessageSquare, ShieldCheck, Users } from "lucide-react";

import { ResearchCompanyButton } from "@/components/job-details/ResearchCompanyButton";
import type { CompanyResearch as CompanyResearchData } from "@/types";

type CompanyResearchProps = { company: string; jobId: string; research: CompanyResearchData | null };

type DossierCardProps = {
  title: string;
  icon: ReactElement;
  iconClassName: string;
  items: string[];
};

function DossierCard({ title, icon, iconClassName, items }: DossierCardProps): ReactElement | null {
  if (items.length === 0) return null;
  return <article className="rounded-xl border border-border bg-surface px-5 py-5 shadow-card sm:px-6 sm:py-6">
    <h3 className="flex items-center gap-3 text-base font-bold text-text-primary"><span aria-hidden="true" className={`flex size-8 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>{icon}</span>{title}</h3>
    <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-text-secondary marker:text-accent">{items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}</ul>
  </article>;
}

function SourcesSection({ sources }: { sources: string[] }): ReactElement | null {
  if (sources.length === 0) return null;
  return <div className="border-t border-border px-5 py-5 sm:px-7"><h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Sources</h3><ul className="mt-3 flex flex-wrap gap-2">{sources.map((source) => <li key={source}><a href={source} target="_blank" rel="noreferrer" className="inline-flex max-w-full break-all rounded-md bg-surface px-4 py-2 text-xs font-semibold text-text-dark shadow-card transition-colors hover:text-accent">{source}</a></li>)}</ul></div>;
}

function ResearchContent({ research }: { research: CompanyResearchData }): ReactElement {
  return <div className="space-y-5 bg-surface-secondary px-5 py-5 sm:px-7 sm:py-7">
    <div className="rounded-xl border border-border bg-surface px-5 py-5 shadow-card sm:px-6 sm:py-6"><h3 className="text-base font-bold text-text-primary">Company Overview</h3><p className="mt-3 text-sm leading-6 text-text-secondary">{research.companyOverview}</p></div>
    {research.techStack.length > 0 && <div className="rounded-xl border border-border bg-surface px-5 py-5 shadow-card sm:px-6 sm:py-6"><h3 className="text-base font-bold text-text-primary">Tech Stack</h3><div className="mt-3 flex flex-wrap gap-2">{research.techStack.map((item) => <span key={item} className="rounded-full bg-accent-muted px-3 py-1 text-xs font-semibold text-accent">{item}</span>)}</div></div>}
    <div className="grid gap-5 md:grid-cols-2">
      <DossierCard title="Culture" icon={<Users className="size-4" />} iconClassName="bg-info-lightest text-info-dark" items={research.culture} />
      <DossierCard title="Your Edge" icon={<ShieldCheck className="size-4" />} iconClassName="bg-success-lightest text-success-dark" items={research.yourEdge} />
      <DossierCard title="Gaps to Address" icon={<ListChecks className="size-4" />} iconClassName="bg-accent-muted text-accent" items={research.gapsToAddress} />
      <DossierCard title="Smart Questions" icon={<CircleHelp className="size-4" />} iconClassName="bg-info-lightest text-info-dark" items={research.smartQuestions} />
      <DossierCard title="Interview Prep" icon={<MessageSquare className="size-4" />} iconClassName="bg-success-lightest text-success-dark" items={research.interviewPrep} />
    </div>
    <div className="rounded-xl border border-border bg-surface px-5 py-5 shadow-card sm:px-6 sm:py-6"><h3 className="flex items-center gap-3 text-base font-bold text-text-primary"><span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success-lightest text-success-dark"><Lightbulb className="size-4" /></span>Why This Role</h3><p className="mt-4 text-sm leading-6 text-text-secondary">{research.whyThisRole}</p></div>
    <SourcesSection sources={research.sources} />
  </div>;
}

export function CompanyResearch({ company, jobId, research: initialResearch }: CompanyResearchProps): ReactElement {
  const [research, setResearch] = useState(initialResearch);
  const [error, setError] = useState<string | null>(null);

  return <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-card" aria-labelledby="company-research-heading">
    <div className="flex flex-col gap-4 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
      <h2 id="company-research-heading" className="flex items-center gap-3 text-base font-bold text-text-primary"><span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-accent-muted text-accent"><Building2 className="size-4" /></span>Company Research</h2>
      {!research && <ResearchCompanyButton jobId={jobId} onSuccess={setResearch} onError={(message) => setError(message || null)} />}
    </div>
    {error && <p role="alert" className="border-b border-border px-6 py-4 text-sm font-semibold text-error">{error}</p>}
    {research ? <ResearchContent research={research} /> : <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center"><span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-surface-secondary text-text-muted"><Building2 className="size-5" /></span><p className="mt-4 text-sm font-bold text-text-dark">No research yet</p><p className="mt-2 max-w-sm text-sm leading-5 text-text-muted">Research {company} to see a candidate-specific briefing.</p></div>}
  </section>;
}

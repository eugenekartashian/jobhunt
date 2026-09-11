import type { ReactElement } from "react";
import { FileText } from "lucide-react";

type JobDescriptionProps = {
  description: string | null;
  sourceUrl: string;
};

export function JobDescription({ description, sourceUrl }: JobDescriptionProps): ReactElement {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-card sm:p-7" aria-labelledby="job-description-heading">
      <h2 id="job-description-heading" className="flex items-center gap-3 text-base font-bold text-text-primary">
        <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-surface-secondary text-text-secondary"><FileText className="size-4" /></span>
        Job Description
      </h2>
      <p className="mt-5 whitespace-pre-line text-sm font-medium leading-6 text-text-dark">{description ?? "No job description preview is available."}</p>
      <a href={sourceUrl} target="_blank" rel="noreferrer" className="focus-ring mt-5 inline-flex rounded-sm text-sm font-bold text-accent underline underline-offset-4 hover:text-accent-dark">Read full job description</a>
    </section>
  );
}

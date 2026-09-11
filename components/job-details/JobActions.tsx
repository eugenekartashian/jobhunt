import Link from "next/link";
import type { ReactElement } from "react";
import { ArrowUpRight } from "lucide-react";

type JobActionsProps = {
  company: string;
  applyUrl: string;
};

export function JobActions({ company, applyUrl }: JobActionsProps): ReactElement {
  return (
    <Link href={applyUrl} target="_blank" rel="noreferrer" className="focus-ring inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-bold text-accent-foreground shadow-card transition-colors hover:bg-accent-dark">
      <ArrowUpRight className="size-4" aria-hidden="true" />
      Apply Now at {company}
    </Link>
  );
}

import type { ReactElement } from "react";
import { Sparkles } from "lucide-react";

type MatchReasoningProps = {
  reason: string | null;
};

export function MatchReasoning({ reason }: MatchReasoningProps): ReactElement {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-card sm:p-7" aria-labelledby="match-reasoning-heading">
      <h2 id="match-reasoning-heading" className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.08em] text-text-secondary">
        <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-success-lightest text-success"><Sparkles className="size-4" /></span>
        AI Match Reasoning
      </h2>
      <p className="mt-5 text-sm font-medium leading-6 text-text-dark">{reason ?? "No match reasoning is available for this job yet."}</p>
    </section>
  );
}

import type { ReactElement } from "react";
import type { MissingField } from "@/types";

type ProfileAttentionBannerProps = {
  completion: number;
  missingFields: MissingField[];
};

export function ProfileAttentionBanner({
  completion,
  missingFields,
}: ProfileAttentionBannerProps): ReactElement {
  return (
    <section className="flex flex-col gap-6 rounded-lg border border-warning/40 bg-surface px-5 py-5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:px-7">
      <div>
        <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
          <span className="flex size-5 items-center justify-center rounded-full bg-warning text-[11px] font-bold text-warning-foreground" aria-hidden="true">!</span>
          Profile needs attention
        </div>
        <p className="mt-2 max-w-xl text-xs leading-5 text-text-secondary">
          Complete the missing fields to improve your chance of getting tailored matches and generating a quality CV.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {missingFields.map((field) => (
            <span key={field} className="rounded bg-warning px-3 py-1 text-[10px] font-bold text-warning-foreground">{field}</span>
          ))}
        </div>
      </div>
      <div
        className="flex size-24 shrink-0 items-center justify-center rounded-full p-2"
        style={{ background: `conic-gradient(var(--color-accent) ${completion * 3.6}deg, var(--color-border-light) 0deg)` }}
        aria-label={`${completion}% profile complete`}
        role="img"
      >
        <span className="flex size-full items-center justify-center rounded-full bg-surface text-xl font-bold text-text-primary">{completion}%</span>
      </div>
    </section>
  );
}

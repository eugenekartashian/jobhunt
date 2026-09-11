import type { ReactElement } from "react";
import { Check, X } from "lucide-react";

type SkillsComparisonProps = {
  matchedSkills: string[];
  missingSkills: string[];
};

export function SkillsComparison({ matchedSkills, missingSkills }: SkillsComparisonProps): ReactElement {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-card sm:p-7" aria-labelledby="skills-comparison-heading">
      <h2 id="skills-comparison-heading" className="text-xs font-bold uppercase tracking-[0.08em] text-text-secondary">Required Skills vs Your Profile</h2>
      <div className="mt-5">
        <p className="text-xs font-semibold text-text-muted">You have</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {matchedSkills.length > 0 ? matchedSkills.map((skill) => <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-success-lightest px-3 py-1 text-xs font-semibold text-success-foreground"><Check className="size-3.5" aria-hidden="true" />{skill}</span>) : <span className="text-sm text-text-muted">No matched skills listed.</span>}
        </div>
      </div>
      <div className="mt-5">
        <p className="text-xs font-semibold text-text-muted">Gap skills</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {missingSkills.length > 0 ? missingSkills.map((skill) => <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-accent-muted px-3 py-1 text-xs font-semibold text-accent"><X className="size-3.5" aria-hidden="true" />{skill}</span>) : <span className="text-sm text-text-muted">No gaps listed.</span>}
        </div>
      </div>
    </section>
  );
}

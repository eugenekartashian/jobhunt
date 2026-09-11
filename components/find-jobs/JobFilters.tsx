import type { ReactElement } from "react";
import { ChevronDown, Search, X } from "lucide-react";

export type MatchFilter = "all" | "high" | "low";
export type SortOrder = "score" | "newest" | "oldest";

type JobFiltersProps = {
  query: string;
  matchFilter: MatchFilter;
  sortOrder: SortOrder;
  onQueryChange: (value: string) => void;
  onMatchFilterChange: (value: MatchFilter) => void;
  onSortOrderChange: (value: SortOrder) => void;
};

export function JobFilters({
  query,
  matchFilter,
  sortOrder,
  onQueryChange,
  onMatchFilterChange,
  onSortOrderChange,
}: JobFiltersProps): ReactElement {
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5" aria-label="Job filters">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
        <label className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <input className="focus-ring min-h-11 w-full rounded-md border border-border bg-surface px-4 pl-11 pr-11 text-sm font-medium text-text-primary placeholder:text-text-muted" placeholder="Filter by company or role..." aria-label="Filter by company or role" value={query} onChange={(event) => onQueryChange(event.target.value)} />
          {query ? <button type="button" aria-label="Clear company or role filter" className="focus-ring absolute right-3 top-1/2 inline-flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary" onClick={() => onQueryChange("")}><X className="size-4" aria-hidden="true" /></button> : null}
        </label>
        <label className="relative"><select className="focus-ring min-h-11 w-full cursor-pointer appearance-none rounded-md border border-border bg-surface px-4 pr-10 text-sm font-semibold text-text-dark" value={matchFilter} onChange={(event) => onMatchFilterChange(event.target.value as MatchFilter)} aria-label="Match filter">
          <option value="all">All Matches</option>
          <option value="high">High Match</option>
          <option value="low">Low Match</option>
        </select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" aria-hidden="true" /></label>
        <label className="relative"><select className="focus-ring min-h-11 w-full cursor-pointer appearance-none rounded-md border border-border bg-surface px-4 pr-10 text-sm font-semibold text-text-dark" value={sortOrder} onChange={(event) => onSortOrderChange(event.target.value as SortOrder)} aria-label="Sort jobs">
          <option value="score">Match Score</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" aria-hidden="true" /></label>
      </div>
    </section>
  );
}

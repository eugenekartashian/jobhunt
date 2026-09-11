"use client";

import type { ReactElement } from "react";
import { useMemo, useState } from "react";

import { JobFilters, type MatchFilter, type SortOrder } from "@/components/find-jobs/JobFilters";
import { JobsTable } from "@/components/find-jobs/JobsTable";
import { JobSearchPanel } from "@/components/find-jobs/JobSearchPanel";
import type { Job } from "@/types";

type FindJobsClientProps = {
  initialJobs: Job[];
};

type FindJobsResponse = {
  success: boolean;
  data?: { jobs: Job[]; jobsFound: number; strongMatches: number };
  error?: string;
};

const JOBS_PER_PAGE = 20;

function compareDates(left: Job, right: Job): number {
  const foundDifference = new Date(left.found_at).getTime() - new Date(right.found_at).getTime();
  if (foundDifference !== 0) return foundDifference;
  return new Date(left.created_at).getTime() - new Date(right.created_at).getTime();
}

export function FindJobsClient({ initialJobs }: FindJobsClientProps): ReactElement {
  const [jobs, setJobs] = useState(initialJobs);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [matchFilter, setMatchFilter] = useState<MatchFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("score");
  const [page, setPage] = useState(1);

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return jobs
      .filter((job) => {
        if (matchFilter === "high") return (job.match_score ?? 0) >= 70;
        if (matchFilter === "low") return (job.match_score ?? 0) < 70;
        return true;
      })
      .filter((job) => {
        if (!normalizedQuery) return true;
        return `${job.company} ${job.title}`.toLowerCase().includes(normalizedQuery);
      })
      .toSorted((left, right) => {
        if (sortOrder === "newest") return compareDates(right, left);
        if (sortOrder === "oldest") return compareDates(left, right);
        return (right.match_score ?? -1) - (left.match_score ?? -1);
      });
  }, [jobs, matchFilter, query, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / JOBS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visibleJobs = useMemo(
    () => filteredJobs.slice((currentPage - 1) * JOBS_PER_PAGE, currentPage * JOBS_PER_PAGE),
    [currentPage, filteredJobs],
  );

  async function handleSearch(jobTitle: string, location: string): Promise<void> {
    setIsSearching(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/agent/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, location }),
      });
      const result = (await response.json()) as FindJobsResponse;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error ?? "Job search failed");
      }
      setJobs(result.data.jobs);
      setPage(1);
      setMessage(`Found ${result.data.jobsFound} jobs and saved ${result.data.strongMatches} strong matches.`);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Job search failed");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <>
      <JobSearchPanel isSearching={isSearching} message={message} error={error} onSearch={handleSearch} />
      <JobFilters
        query={query}
        matchFilter={matchFilter}
        sortOrder={sortOrder}
        onQueryChange={(value) => { setQuery(value); setPage(1); }}
        onMatchFilterChange={(value) => { setMatchFilter(value); setPage(1); }}
        onSortOrderChange={(value) => { setSortOrder(value); setPage(1); }}
      />
      <JobsTable
        jobs={visibleJobs}
        totalCount={filteredJobs.length}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </>
  );
}

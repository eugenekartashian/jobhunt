"use client";

import type { ReactElement } from "react";
import { FormEvent, useEffect, useState } from "react";
import { LoaderCircle, MapPin, Search, Sparkles } from "lucide-react";

type LocationSuggestion = {
  id: string;
  label: string;
};

type JobSearchPanelProps = {
  isSearching: boolean;
  message: string | null;
  error: string | null;
  onSearch: (jobTitle: string, location: string) => Promise<void>;
};

export function JobSearchPanel({ isSearching, message, error, onSearch }: JobSearchPanelProps): ReactElement {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  useEffect(() => {
    const query = location.trim();
    if (query.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsLoadingLocations(true);
      try {
        const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&countrycode=es&limit=5&lang=en`, { signal: controller.signal });
        if (!response.ok) return;
        const result = await response.json() as { features?: Array<{ properties?: Record<string, unknown>; geometry?: { coordinates?: unknown[] } }> };
        const suggestions = (result.features ?? []).map((feature, index) => {
          const properties = feature.properties ?? {};
          const name = typeof properties.name === "string" ? properties.name : "";
          const city = typeof properties.city === "string" ? properties.city : "";
          const country = typeof properties.country === "string" ? properties.country : "Spain";
          const parts = Array.from(new Set([name || city, city, country].filter(Boolean)));
          return { id: `${parts.join("-")}-${index}`, label: parts.join(", ") };
        }).filter((suggestion) => suggestion.label);
        setLocationSuggestions(Array.from(new Map(suggestions.map((suggestion) => [suggestion.label, suggestion])).values()));
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setLocationSuggestions([]);
      } finally {
        setIsLoadingLocations(false);
      }
    }, 400);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [location]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await onSearch(jobTitle, location);
  }

  return (
    <form className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-7" aria-labelledby="job-search-heading" onSubmit={handleSubmit}>
      <h1 id="job-search-heading" className="sr-only">Find jobs</h1>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.08em] text-text-secondary">
          Job title
          <span className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <input className="focus-ring min-h-13 w-full rounded-md border border-border bg-surface px-4 pl-11 text-base font-medium text-text-primary shadow-card placeholder:text-text-muted" placeholder="Frontend Engineer" aria-label="Job title" value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} required />
          </span>
        </label>
        <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.08em] text-text-secondary">
          Location
          <span className="relative">
            <MapPin aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <input className="focus-ring min-h-13 w-full rounded-md border border-border bg-surface px-4 pl-11 text-base font-medium text-text-primary shadow-card placeholder:text-text-muted" placeholder="Barcelona, Spain" aria-label="Location" value={location} onChange={(event) => { const value = event.target.value; setLocation(value); if (value.trim().length < 2) { setLocationSuggestions([]); setIsLoadingLocations(false); } }} autoComplete="off" required />
            {locationSuggestions.length > 0 || isLoadingLocations ? <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-md border border-border bg-surface p-1 shadow-card" role="listbox" aria-label="Location suggestions">
              {isLoadingLocations ? <div className="flex items-center gap-2 px-3 py-3 text-xs font-semibold text-text-secondary"><LoaderCircle className="size-4 animate-spin" />Searching locations...</div> : locationSuggestions.map((suggestion) => <button type="button" key={suggestion.id} className="focus-ring flex w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-left text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary" onClick={() => { setLocation(suggestion.label); setLocationSuggestions([]); }}><MapPin className="size-4 shrink-0 text-accent" aria-hidden="true" />{suggestion.label}</button>)}
            </div> : null}
          </span>
        </label>
        <button type="submit" disabled={isSearching} className="focus-ring inline-flex min-h-13 cursor-pointer items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-bold text-accent-foreground shadow-card transition-colors hover:bg-accent-dark disabled:cursor-wait disabled:opacity-60">
          {isSearching ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Search className="size-4" aria-hidden="true" />}
          {isSearching ? "Searching..." : "Find Jobs"}
        </button>
      </div>
      {message ? <div className="mt-5 flex items-center gap-3 rounded-md border border-success/30 bg-success-lightest px-4 py-3 text-sm font-semibold text-success-dark" role="status">
        <Sparkles aria-hidden="true" className="size-4" />
        {message}
      </div> : null}
      {error ? <p className="mt-4 rounded-md border border-error/30 bg-surface px-4 py-3 text-sm font-semibold text-error" role="alert">{error}</p> : null}
    </form>
  );
}

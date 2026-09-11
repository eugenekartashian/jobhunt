import "server-only";

export type AdzunaJob = {
  id: string;
  title: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  description?: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  contract_type?: string;
  created: string;
};

type AdzunaResponse = {
  results?: AdzunaJob[];
};

function normalizeWhere(location: string): string {
  return location.split(",")[0]?.trim() || location.trim();
}

export async function searchAdzunaJobs(
  jobTitle: string,
  location: string,
  country = "es",
): Promise<AdzunaJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    throw new Error("Adzuna API is not configured");
  }

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    what: jobTitle,
    category: "it-jobs",
    results_per_page: "10",
    "content-type": "application/json",
  });

  const where = normalizeWhere(location);
  if (where) {
    params.set("where", where);
  }

  const response = await fetch(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`Adzuna API error: ${response.status}`);
  }

  const data = (await response.json()) as AdzunaResponse;
  return Array.isArray(data.results) ? data.results : [];
}

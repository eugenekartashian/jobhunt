"use client";

import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useState } from "react";
import { LoaderCircle, Search } from "lucide-react";

import type { CompanyResearch } from "@/types";

type ResearchCompanyButtonProps = {
  jobId: string;
  onSuccess: (research: CompanyResearch) => void;
  onError: (message: string) => void;
};

export function ResearchCompanyButton({ jobId, onSuccess, onError }: ResearchCompanyButtonProps): ReactElement {
  const router = useRouter();
  const [isResearching, setIsResearching] = useState(false);

  async function handleResearch(): Promise<void> {
    setIsResearching(true);
    onError("");
    try {
      const response = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const payload = await response.json() as { success?: boolean; data?: { research?: CompanyResearch }; error?: string };
      if (!response.ok || !payload.success || !payload.data?.research) throw new Error(payload.error ?? "Research failed");
      onSuccess(payload.data.research);
      router.refresh();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Could not research this company. Please try again.");
    } finally {
      setIsResearching(false);
    }
  }

  return <button type="button" onClick={handleResearch} disabled={isResearching} className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-accent px-5 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-dark disabled:cursor-wait disabled:opacity-60">{isResearching ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Search className="size-4" aria-hidden="true" />}{isResearching ? "Researching..." : "Research Company"}</button>;
}

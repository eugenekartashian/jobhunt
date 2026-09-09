"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, type ReactElement } from "react";

import { capturePostHogPageView } from "@/lib/posthog-client";

export function PostHogPageView(): ReactElement | null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const queryString = searchParams.toString();
    const currentUrl = `${window.location.origin}${pathname}${
      queryString ? `?${queryString}` : ""
    }`;

    capturePostHogPageView(currentUrl);
  }, [pathname, searchParams]);

  return null;
}

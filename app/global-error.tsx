"use client";

import { useEffect } from "react";

import { capturePostHogException } from "@/lib/posthog-client";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    capturePostHogException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <h1>Something went wrong</h1>
        <p>Please try again later.</p>
      </body>
    </html>
  );
}

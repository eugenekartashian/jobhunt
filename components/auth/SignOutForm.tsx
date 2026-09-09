"use client";

import type { ReactElement } from "react";

import { resetPostHogUser } from "@/lib/posthog-client";

export function SignOutForm(): ReactElement {
  return (
    <form
      action="/auth/sign-out"
      method="post"
      className="mt-8"
      onSubmit={() => resetPostHogUser()}
    >
      <button
        type="submit"
        className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-border bg-surface px-6 py-3 text-base font-semibold leading-6 text-text-black shadow-card transition-colors hover:bg-surface-secondary"
      >
        Sign out
      </button>
    </form>
  );
}

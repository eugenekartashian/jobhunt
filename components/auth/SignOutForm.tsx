"use client";

import type { ReactElement } from "react";
import { LogOut } from "lucide-react";

import { resetPostHogUser } from "@/lib/posthog-client";

type SignOutFormProps = {
  compact?: boolean;
};

export function SignOutForm({ compact = false }: SignOutFormProps): ReactElement {
  return (
    <form
      action="/auth/sign-out"
      method="post"
      className={compact ? "m-0" : "mt-8"}
      onSubmit={() => resetPostHogUser()}
    >
      <button
        type="submit"
        className={compact
          ? "focus-ring inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-semibold leading-5 text-text-primary shadow-card transition-colors hover:bg-surface-secondary"
          : "focus-ring inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-surface px-6 py-3 text-base font-semibold leading-6 text-text-black shadow-card transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed"}
      >
        <LogOut className="size-4" aria-hidden="true" />
        <span>Sign out</span>
      </button>
    </form>
  );
}

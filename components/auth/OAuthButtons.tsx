"use client";

import type { ReactElement } from "react";

import { GitHubProviderIcon } from "@/components/auth/GitHubProviderIcon";
import { GoogleProviderIcon } from "@/components/auth/GoogleProviderIcon";
import { capturePostHogEvent } from "@/lib/posthog-client";

const providers = [
  { id: "google", label: "Continue with Google", icon: GoogleProviderIcon },
  { id: "github", label: "Continue with GitHub", icon: GitHubProviderIcon },
] as const;

export function OAuthButtons(): ReactElement {
  return (
    <div className="mt-5 flex flex-col gap-3 sm:mt-7">
      {providers.map((provider) => {
        const Icon = provider.icon;

        return (
          <a
            key={provider.id}
            href={`/oauth?provider=${provider.id}`}
            className="focus-ring inline-flex min-h-15 w-full items-center justify-center gap-4 rounded-md border border-border bg-surface px-4 py-4 text-base font-semibold leading-6 text-text-primary transition-colors hover:bg-surface-secondary"
            onClick={() =>
              capturePostHogEvent("oauth_sign_in_started", {
                provider: provider.id,
              })
            }
          >
            <span className="flex size-7 items-center justify-center text-accent">
              <Icon />
            </span>
            {provider.label}
          </a>
        );
      })}
    </div>
  );
}

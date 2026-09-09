import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

import { BrandMark } from "@/components/homepage/BrandMark";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { Navbar } from "@/components/layout/Navbar";
import { isUserAuthenticated } from "@/lib/insforge-auth";

type LoginPageProps = PageProps<"/login">;

const errorMessages: Record<string, string> = {
  invalid_provider: "This sign-in provider is not available.",
  oauth_start_failed:
    "We could not start that sign-in method. Please try again.",
  oauth_cancelled: "Sign-in was cancelled.",
  missing_code: "OAuth did not return a usable code.",
  missing_verifier: "The sign-in session expired. Start again.",
  oauth_exchange_failed: "Could not finish sign-in. Try again.",
  config_missing: "Authentication is not configured yet.",
};

function ShieldIcon(): ReactElement {
  return (
    <svg
      className="size-5"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 2.8 4.5 5v4.2c0 3.7 2.2 6.8 5.5 8 3.3-1.2 5.5-4.3 5.5-8V5L10 2.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m7.8 9.9 1.4 1.4 3.2-3.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps): Promise<ReactElement> {
  if (await isUserAuthenticated()) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const errorKey = typeof params.error === "string" ? params.error : "";
  const errorMessage = errorMessages[errorKey];

  return (
    <>
      <Navbar ctaHref="/login" />
      <main className="bg-background px-6 py-10 sm:px-8 lg:px-20">
        <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-surface shadow-preview lg:grid-cols-[1fr_0.88fr]">
          <div className="bg-landing-glow flex min-h-112 flex-col justify-between border-b border-border px-8 py-10 sm:px-10 lg:border-b-0 lg:border-r lg:px-12">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold leading-5 text-text-secondary shadow-card">
                <span
                  className="flex size-5 items-center justify-center text-accent"
                  aria-hidden="true"
                >
                  <ShieldIcon />
                </span>
                OAuth secured by InsForge
              </div>

              <h1 className="mt-10 max-w-2xl text-4xl font-bold leading-[1.05] text-text-slate sm:text-5xl">
                Sign in and let the agent prep your next application.
              </h1>

              <p className="mt-6 max-w-xl text-base font-medium leading-7 text-text-secondary">
                Connect with Google or GitHub to start building your profile,
                matching jobs, and creating tailored application materials.
              </p>
            </div>

            <p className="mt-10 text-sm font-semibold leading-6 text-text-secondary">
              New users are routed to profile setup after sign-in.
            </p>
          </div>

          <div className="flex items-center bg-surface px-8 py-10 sm:px-10 lg:px-12">
            <div className="w-full">
              <Link href="/" className="focus-ring mb-10 inline-flex rounded-md">
                <BrandMark size="small" />
              </Link>

              <p className="text-lg font-medium leading-7 text-text-secondary">
                Welcome to
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-text-black">
                Job Hunt
              </h2>
              <p className="mt-5 text-base font-medium leading-7 text-text-secondary">
                Choose your preferred provider to continue.
              </p>

              <div className="mt-8">
                {errorMessage ? (
                  <div
                    className="mb-5 rounded-md border border-error bg-surface px-4 py-3 text-sm font-semibold leading-5 text-error"
                    role="alert"
                  >
                    {errorMessage}
                  </div>
                ) : null}

                <OAuthButtons />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

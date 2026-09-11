import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { ShieldCheck } from "lucide-react";

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

export default async function LoginPage({
  searchParams,
}: LoginPageProps): Promise<ReactElement> {
  if (await isUserAuthenticated()) {
    redirect("/profile");
  }

  const params = await searchParams;
  const errorKey = typeof params.error === "string" ? params.error : "";
  const errorMessage = errorMessages[errorKey];

  return (
    <>
      <Navbar ctaHref="/login" />
      <main className="bg-background px-4 py-6 sm:px-8 sm:py-10 lg:px-20">
        <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-surface shadow-preview lg:grid-cols-[1fr_0.88fr]">
          <div className="bg-landing-glow flex flex-col justify-between border-b border-border px-5 py-6 sm:min-h-112 sm:px-10 sm:py-10 lg:border-b-0 lg:border-r lg:px-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold leading-5 text-text-secondary shadow-card sm:gap-3 sm:px-4 sm:py-2 sm:text-sm">
                <span
                  className="flex size-4 items-center justify-center text-accent sm:size-5"
                  aria-hidden="true"
                >
                  <ShieldCheck className="size-4 sm:size-5" aria-hidden="true" />
                </span>
                OAuth secured by InsForge
              </div>

              <h1 className="mt-6 max-w-2xl text-3xl font-bold leading-tight text-text-slate sm:mt-10 sm:text-5xl sm:leading-[1.05]">
                Sign in and let the agent prep your next application.
              </h1>

              <p className="mt-4 max-w-xl text-sm font-medium leading-6 text-text-secondary sm:mt-6 sm:text-base sm:leading-7">
                Connect with Google or GitHub to start building your profile,
                matching jobs, and creating tailored application materials.
              </p>
            </div>

            <p className="mt-6 text-xs font-semibold leading-5 text-text-secondary sm:mt-10 sm:text-sm sm:leading-6">
              New users are routed to profile setup after sign-in.
            </p>
          </div>

          <div className="flex items-center bg-surface px-5 py-7 sm:px-10 sm:py-10 lg:px-12">
            <div className="w-full">
              <Link href="/" className="focus-ring mb-6 inline-flex rounded-md sm:mb-10">
                <BrandMark size="small" />
              </Link>

              <p className="text-base font-medium leading-6 text-text-secondary sm:text-lg sm:leading-7">
                Welcome to
              </p>
              <h2 className="mt-2 text-2xl font-bold leading-tight text-text-black sm:mt-3 sm:text-3xl">
                Job Hunt
              </h2>
              <p className="mt-3 text-sm font-medium leading-6 text-text-secondary sm:mt-5 sm:text-base sm:leading-7">
                Choose your preferred provider to continue.
              </p>

              <div className="mt-6 sm:mt-8">
                {errorMessage ? (
                  <div
                    className="mb-4 rounded-md border border-error bg-surface px-4 py-3 text-sm font-semibold leading-5 text-error sm:mb-5"
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

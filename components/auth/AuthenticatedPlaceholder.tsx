import type { UserSchema } from "@insforge/shared-schemas";
import type { ReactElement } from "react";

import { PostHogIdentify } from "@/components/analytics/PostHogIdentify";
import { SignOutForm } from "@/components/auth/SignOutForm";

type AuthenticatedPlaceholderProps = {
  title: string;
  description: string;
  user: UserSchema;
};

export function AuthenticatedPlaceholder({
  title,
  description,
  user,
}: AuthenticatedPlaceholderProps): ReactElement {
  return (
    <main className="bg-background px-6 py-12 sm:px-8 lg:px-20">
      <PostHogIdentify userId={user.id} email={user.email} />
      <section className="mx-auto w-full max-w-5xl rounded-lg border border-border bg-surface px-8 py-10 shadow-card sm:px-10 lg:px-12">
        <h1 className="text-3xl font-bold leading-tight text-text-black">
          {title}
        </h1>
        <p className="mt-5 text-xl font-medium leading-8 text-text-secondary">
          {description}
        </p>

        <SignOutForm />
      </section>
    </main>
  );
}

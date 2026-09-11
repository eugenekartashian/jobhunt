import type { FormEvent, ReactElement, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

type ProfileFormProps = {
  saveState: "idle" | "saving" | "saved";
  saveError?: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  children: ReactNode;
};

export function ProfileForm({ saveState, saveError, onSubmit, children }: ProfileFormProps): ReactElement {
  return (
    <form className="rounded-lg border border-border bg-surface px-5 py-7 shadow-card sm:px-7" onSubmit={onSubmit}>
      <div className="border-b border-border pb-5">
        <h1 className="text-base font-bold text-text-primary">Profile Information</h1>
        <p className="mt-1 text-xs text-text-secondary">This context is used to accurately represent you in agent interactions.</p>
      </div>
      <div className="mt-7 space-y-8">{children}</div>
      <div className="mt-8 border-t border-border pt-5">
        <button type="submit" className="focus-ring flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-accent px-5 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60" disabled={saveState === "saving"}>
          {saveState === "saving" ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
          {saveState === "saving" ? "Saving..." : "Save Profile"}
        </button>
        {saveError ? <p className="mt-3 text-center text-xs font-semibold text-error" role="alert">{saveError}</p> : null}
        {saveState === "saved" ? <p className="mt-3 text-center text-xs font-semibold text-success-dark" role="status">Profile saved successfully.</p> : null}
      </div>
    </form>
  );
}

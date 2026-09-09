# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

Feature 04 Database Schema and its follow-up did not add or change UI components.

---

## Components

### BrandMark

- Path: `components/homepage/BrandMark.tsx`
- Purpose: Real Job Hunt logo asset used in navigation and footer.
- Classes: `flex items-center`, `h-8 h-9 w-auto object-contain`

### Navbar

- Path: `components/layout/Navbar.tsx`
- Purpose: Top homepage navigation with centered product links and primary CTA.
- Classes: `border-b border-border bg-surface`, `mx-auto flex min-h-16 w-full max-w-page items-center justify-between gap-4 px-6 py-3 sm:px-8 lg:px-20`, `hidden sm:block`, `flex items-center gap-10`, `text-sm font-medium leading-5 text-text-dark transition-colors hover:text-accent`, `inline-flex min-h-11 items-center justify-center rounded-md bg-overlay px-4 py-2 text-sm font-medium leading-5 text-accent-foreground shadow-card transition-colors hover:bg-overlay-dark`

### Footer

- Path: `components/layout/Footer.tsx`
- Purpose: Bottom brand and utility links.
- Classes: `border-t border-border bg-surface`, `mx-auto flex min-h-32 w-full max-w-page flex-col justify-between gap-8 px-6 py-10 sm:px-8 md:flex-row md:items-center lg:px-20`, `flex flex-wrap items-center gap-8`, `text-sm font-medium leading-5 text-text-dark transition-colors hover:text-accent`

### Hero

- Path: `components/homepage/Hero.tsx`
- Purpose: Gradient lead section with headline, subcopy, and two CTAs.
- Classes: `bg-landing-glow flex min-h-[414px] items-center justify-center border-b border-border px-6 py-16 text-center sm:px-10`, `mx-auto flex max-w-3xl flex-col items-center`, `max-w-3xl text-5xl font-bold leading-[1.05] text-text-slate sm:text-hero`, `mt-7 max-w-2xl text-base font-medium leading-6 text-text-secondary`, `inline-flex min-h-11 items-center justify-center rounded-md bg-overlay px-6 py-2.5 text-sm font-medium leading-5 text-accent-foreground shadow-card transition-colors hover:bg-overlay-dark`, `inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-6 py-2.5 text-sm font-medium leading-5 text-text-primary shadow-card transition-colors hover:bg-surface-secondary`

### DashboardPreview

- Path: `components/homepage/DashboardPreview.tsx`
- Purpose: Hero dashboard screenshot band.
- Classes: `border-b border-border bg-surface-tertiary px-6 py-14 sm:px-10 lg:py-16`, `mx-auto max-w-6xl`, `h-auto w-full rounded-xl shadow-preview`

### FeatureShowcase

- Path: `components/homepage/FeatureShowcase.tsx`
- Purpose: Two column feature sections with explanatory rows and supplied image assets.
- Classes: `grid border-b border-border lg:grid-cols-2`, `flex min-h-[560px] flex-col justify-center bg-surface`, `px-8 py-12 sm:px-14 lg:px-16`, `max-w-md text-4xl font-bold leading-[1.08] text-text-slate sm:text-section-display`, `border-t border-border`, `border-l-2 border-accent border-info border-success border-b border-border px-8 py-7 last:border-b-0 sm:px-14 lg:px-16`, `text-base font-bold leading-6 text-text-slate`, `mt-2 max-w-xl text-sm font-medium leading-6 text-text-secondary`, `flex min-h-[560px] items-center justify-center bg-surface-muted px-8 py-12 sm:px-12`, `h-auto w-full max-w-xl rounded-xl shadow-card`

### Testimonial

- Path: `components/homepage/Testimonial.tsx`
- Purpose: Success story quote with customer avatar.
- Classes: `border-b border-border bg-surface px-6 py-24 text-center sm:px-10`, `mx-auto max-w-4xl`, `text-xs font-bold uppercase tracking-[0.12em] text-accent`, `mt-7 text-2xl font-semibold leading-9 text-text-dark sm:text-quote`, `mt-8 flex items-center justify-center gap-3`, `size-12 rounded-md`, `text-sm font-bold leading-5 text-text-primary`, `text-xs font-medium leading-4 text-text-secondary`

### BottomCta

- Path: `components/homepage/BottomCta.tsx`
- Purpose: Closing gradient CTA with repeated actions.
- Classes: `bg-landing-glow border-b border-border px-6 py-20 text-center sm:px-10`, `mx-auto flex max-w-3xl flex-col items-center`, `text-4xl font-bold leading-[1.08] text-text-slate sm:text-section-display`, `mt-7 text-base font-medium leading-6 text-text-secondary`, shared CTA button classes from Hero

### OAuthButtons

- Path: `components/auth/OAuthButtons.tsx`
- Purpose: Provider sign-in buttons for the login page.
- Classes: `mt-7 flex flex-col gap-3`, `focus-ring inline-flex min-h-15 w-full items-center justify-center gap-4 rounded-md border border-border bg-surface px-4 py-4 text-base font-semibold leading-6 text-text-primary transition-colors hover:bg-surface-secondary`, `flex size-7 items-center justify-center text-accent`

### GoogleProviderIcon

- Path: `components/auth/GoogleProviderIcon.tsx`
- Purpose: Provider icon used by the Google OAuth sign-in button.
- Classes: `size-7`

### GitHubProviderIcon

- Path: `components/auth/GitHubProviderIcon.tsx`
- Purpose: Provider icon used by the GitHub OAuth sign-in button.
- Classes: `size-7`

### LoginPage

- Path: `app/(auth)/login/page.tsx`
- Purpose: Split authentication page with InsForge security badge, sign-in positioning copy, provider choices, and error state.
- Classes: `bg-background px-6 py-10 sm:px-8 lg:px-20`, `mx-auto grid w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-surface shadow-preview lg:grid-cols-[1fr_0.88fr]`, `bg-landing-glow flex min-h-112 flex-col justify-between border-b border-border px-8 py-10 sm:px-10 lg:border-b-0 lg:border-r lg:px-12`, `inline-flex items-center gap-3 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold leading-5 text-text-secondary shadow-card`, `mt-10 max-w-2xl text-4xl font-bold leading-[1.05] text-text-slate sm:text-5xl`, `flex items-center bg-surface px-8 py-10 sm:px-10 lg:px-12`, `mb-5 rounded-md border border-error bg-surface px-4 py-3 text-sm font-semibold leading-5 text-error`

### DashboardPage

- Path: `app/dashboard/page.tsx`
- Purpose: Temporary protected post-login page until the full dashboard feature is built.
- Classes: Uses `AuthenticatedPlaceholder`.

### ProfilePage

- Path: `app/profile/page.tsx`
- Purpose: Temporary protected profile page until profile setup UI is built.
- Classes: Uses `AuthenticatedPlaceholder`.

### AuthenticatedPlaceholder

- Path: `components/auth/AuthenticatedPlaceholder.tsx`
- Purpose: Temporary authenticated page card with title, phase note, and sign-out action.
- Classes: `bg-background px-6 py-12 sm:px-8 lg:px-20`, `mx-auto w-full max-w-5xl rounded-lg border border-border bg-surface px-8 py-10 shadow-card sm:px-10 lg:px-12`, `text-3xl font-bold leading-tight text-text-black`, `mt-5 text-xl font-medium leading-8 text-text-secondary`, `focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-border bg-surface px-6 py-3 text-base font-semibold leading-6 text-text-black shadow-card transition-colors hover:bg-surface-secondary`

### TrackedLink

- Path: `components/analytics/TrackedLink.tsx`
- Purpose: Client-only link wrapper that captures a typed PostHog event before navigating.
- Classes: Provided by caller.

### PostHogIdentify

- Path: `components/analytics/PostHogIdentify.tsx`
- Purpose: Client-only identity bridge that calls PostHog identify after authenticated pages render.
- Classes: None.

### PostHogPageView

- Path: `components/analytics/PostHogPageView.tsx`
- Purpose: Client-only route observer that captures PostHog `$pageview` events for App Router navigation.
- Classes: None.

### SignOutForm

- Path: `components/auth/SignOutForm.tsx`
- Purpose: Client-only sign-out form that resets PostHog client identity before submitting to the server-side logout route.
- Classes: `mt-8`, `focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-border bg-surface px-6 py-3 text-base font-semibold leading-6 text-text-black shadow-card transition-colors hover:bg-surface-secondary`

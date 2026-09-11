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
- Classes: `border-b border-border bg-surface`, `mx-auto flex min-h-16 w-full max-w-page items-center justify-between gap-4 px-6 py-3 sm:px-8 lg:px-20`, `hidden sm:block`, `flex items-center gap-10`, `text-sm font-medium leading-5 text-text-dark transition-colors hover:text-accent`, active links use `text-accent` with `aria-current="page"`, `inline-flex min-h-11 items-center justify-center rounded-md bg-overlay px-4 py-2 text-sm font-medium leading-5 text-accent-foreground shadow-card transition-colors hover:bg-overlay-dark`
- Authenticated state: `size-10 rounded-full border border-border bg-accent-muted`, OAuth avatar with initials fallback, compact `SignOutForm` with `LogOut` icon.

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
- Purpose: Official Google brand mark used by the Google OAuth sign-in button.
- Classes: `size-6`, rendered from `react-icons/fc`

### GitHubProviderIcon

- Path: `components/auth/GitHubProviderIcon.tsx`
- Purpose: Official GitHub brand mark used by the GitHub OAuth sign-in button.
- Classes: `size-6`, rendered from `react-icons/fa6`

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
- Purpose: Protected profile page with the full local profile setup experience.
- Classes: Uses `Navbar activeHref="/profile"` and `ProfilePageClient`.

### ProfilePageClient

- Path: `components/profile/ProfilePageClient.tsx`
- Purpose: Authenticated page composer that hydrates profile state from InsForge and composes the profile feature components.
- Classes: `bg-background px-4 py-8 sm:px-8 lg:px-20 lg:py-12`, `mx-auto flex w-full max-w-5xl flex-col gap-5`
- Interaction patterns: custom accessible checkbox controls use `peer sr-only` with token-based checked/focus/hover states; month and select controls expose `cursor-pointer`; action buttons use visible hover and disabled states.

### ResumeSection

- Path: `components/profile/ResumeSection.tsx`
- Purpose: Resume upload, extraction, and generation controls with consistent project loading feedback.
- Classes: project token borders/backgrounds, `LoaderCircle` with `animate-spin`, `cursor-pointer`, `disabled:cursor-not-allowed`, and `aria-busy` on the section.

### JobSearchPanel

- Path: `components/find-jobs/JobSearchPanel.tsx`
- Purpose: Find Jobs search controls, loading state, and API result/error feedback.
- Classes: `rounded-lg border border-border bg-surface p-5 shadow-card sm:p-7`, `min-h-13 rounded-md border border-border bg-surface px-4 text-base`, `min-h-13 rounded-md bg-accent px-6 text-sm font-bold`, `rounded-md border border-success/30 bg-success-lightest px-4 py-3 text-sm font-semibold text-success-dark`
- Pattern notes: Search inputs and primary action share a single white card. The success state uses a light green token background and stays visually separate from the controls; errors use the existing error token.
- Latest polish: Lucide Search/MapPin/Sparkles icons, clear location suggestions from Photon with a debounced Spain-first lookup, and consistent loading/hover states.
- Search integration note: the selected `City, Country` label is presentation-only; the server normalizes it to the city before querying Adzuna.

### FindJobsClient

- Path: `components/find-jobs/FindJobsClient.tsx`
- Purpose: Client-side orchestration for the Feature 10 search request and replacing the initial server-loaded job list.
- Classes: None; delegates visual styling to `JobSearchPanel`, `JobFilters`, and `JobsTable`.
- Pattern notes: The client wrapper owns only request state and response messages. InsForge access remains server-side through the API route.

### JobFilters

- Path: `components/find-jobs/JobFilters.tsx`
- Purpose: Controlled text search, match filter, and sort controls for the jobs list.
- Classes: `rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5`, `min-h-11 rounded-md border border-border bg-surface px-4 text-sm font-semibold`
- Pattern notes: Filter controls live in a compact white toolbar card above the table and collapse to a single column on small screens. Changes reset pagination to the first page.
- Latest polish: Lucide Search/X/ChevronDown controls, custom select chevrons, and a clear-filter action.

### JobsTable

- Path: `components/find-jobs/JobsTable.tsx`
- Purpose: Real job results table with match scores, salary, source badge, dates, and functional pagination.
- Classes: `overflow-hidden rounded-lg border border-border bg-surface shadow-card`, `border-b border-border`, `bg-surface-secondary`, `size-10 rounded-md border border-border bg-surface-muted`, `min-h-10 rounded-md border border-border bg-surface px-4 text-sm font-semibold`
- Pattern notes: Jobs use white rows separated by borders, a muted header row, token-based score bars, a source badge, and horizontal overflow on narrow screens. Every data cell links to the job detail page. Pagination shows the filtered result count and supports previous, next, and direct page navigation.
- Latest polish: `Building2` fallback company icon and explicit pointer/hover states on pagination controls.

### Job Details Components

- Paths: `components/job-details/JobHeader.tsx`, `JobInfoCards.tsx`, `MatchReasoning.tsx`, `SkillsComparison.tsx`, `JobDescription.tsx`, `CompanyResearch.tsx`, `ResearchCompanyButton.tsx`, `JobActions.tsx`
- Last updated: 2026-09-11
- Purpose: DB-backed job detail layout matching `context/designs/job-details.png`, with real match data, job metadata, description, external apply actions, and a read-only candidate-specific company research dossier.

| Property | Class |
| --- | --- |
| Background | `bg-surface`, page uses `bg-background` |
| Border | `border border-border` |
| Border radius | `rounded-xl` for detail panels, `rounded-md` for actions |
| Text — primary | `text-text-primary` |
| Text — secondary | `text-text-secondary` |
| Text — muted | `text-text-muted` |
| Spacing | `p-6 shadow-card sm:p-7`, `gap-4` between info cards |
| Hover state | `hover:bg-surface-secondary`, `hover:text-accent`, `hover:bg-accent-dark` |
| Shadow | `shadow-card` |
| Accent usage | `bg-accent`, `text-accent`, `bg-accent-muted`, `text-success-dark` |

**Pattern notes:** Detail sections use full-width white panels with compact section headers, token-based status colors, external links opening in a new tab, full available Adzuna previews with an explicit source link, and user-scoped data loaded on the server. Skill badges use pill radius and success/accent token backgrounds; primary actions use the standard purple button pattern. Company research keeps the dedicated action in the header, shows a compact empty state before generation, and renders the saved 9-field dossier read-only after success. Research loading disables the action, errors stay inline below the header, and successful generation refreshes the server-backed details state. Saved dossier content uses a responsive two-column grid of compact white insight cards with token-colored icon badges; overview, tech stack, and role rationale remain full-width, Culture, Your Edge, Gaps, Smart Questions, and Interview Prep stay scannable cards, and Sources is a separated bottom footer with link pills.
- Latest polish: replaced Unicode placeholder glyphs with Lucide `Building2`, `DollarSign`, `MapPin`, `BriefcaseBusiness`, `CalendarDays`, `FileText`, `Sparkles`, `Search`, `ArrowUpRight`, and dossier-specific icons. Actions now expose consistent pointer, hover, and loading states.

### Dashboard

- Path: `components/dashboard/DashboardPageContent.tsx`
- Purpose: Protected dashboard shell matching `context/designs/dashboard.png`, currently using mock values until Features 15–17 connect real data.
- Classes: `bg-background`, `rounded-lg border border-border bg-surface shadow-card`, `p-5 sm:p-7`, responsive `grid` layouts.
- Pattern notes: Dashboard uses four compact stat cards at the top, a two-column activity/chart row, and a two-column lower analytics row. Stat cards receive server-provided user data; charts use Recharts responsive regions with token-based colors, dashed grid lines, hover tooltips, active points, and explicit empty states. Activity uses a server-backed vertical timeline with info/success status dots and relative timestamps. At mobile widths all sections collapse to one column.

### ProfileAttentionBanner

- Path: `components/profile/ProfileAttentionBanner.tsx`
- Purpose: Completion summary with percentage ring and missing field tags.
- Classes: `rounded-lg border border-warning/40 bg-surface px-5 py-5 shadow-card sm:flex-row sm:px-7`, `rounded bg-warning px-3 py-1 text-[10px] font-bold text-warning-foreground`, `size-24 rounded-full` with `text-accent` progress ring

### ResumeSection

- Path: `components/profile/ResumeSection.tsx`
- Purpose: Resume drag and drop area, PDF validation feedback, authenticated upload feedback, current resume access, and AI profile extraction.
- Classes: `rounded-lg border border-border bg-surface px-5 py-6 shadow-card sm:px-7`, `rounded-lg border border-border px-4 py-4 sm:px-5` account row, `min-h-44 rounded-lg border border-dashed`, `focus-ring inline-flex min-h-11 rounded-md bg-accent px-5 text-sm font-bold text-accent-foreground hover:bg-accent-dark`
- Pattern notes: A saved resume is exposed as a text link below the selected filename; selection uploads immediately through the server action and the profile save persists the returned storage key.
- Pattern notes: `Extract Profile` appears only when a saved resume key exists. Extraction has its own loading/error state and fills the draft form without overwriting non-empty fields.
- Pattern notes: The saved filename sits inside the drop zone; upload feedback, AI extraction feedback, and the extraction action occupy separate rows below it. The generation action is a secondary outlined control.
- Pattern notes: Resume generation is a secondary outlined action with a spinner-style glyph and explicit `Generating...`, success, and error states. After generation, the UI exposes an explicit link to open the protected current-resume viewer, avoiding a blank popup while the server is still rendering the PDF.
- Latest polish: user-facing copy uses `CV`, extraction uses `ScanText`, generation uses `FileText`, drag-over uses an animated accent state, and month calendar indicators expose project-style hover feedback.

### UserAvatar

- Path: `components/layout/UserAvatar.tsx`
- Purpose: OAuth avatar with a client-side fallback to initials when the provider image is missing or fails to load.
- Classes: `size-full object-cover` for a successfully loaded provider image; initials render while the image is loading or unavailable, so broken image chrome never appears.
- Pattern notes: Generated PDF headers keep the name and contact details in separate vertical text blocks with explicit line heights and spacing so long email, phone, location, and profile URLs wrap without overlapping.

### ProfileForm

- Path: `components/profile/ProfileForm.tsx`
- Purpose: Profile form shell with section spacing, server save feedback, and an imperative bridge for applying extracted profile drafts.
- Classes: `rounded-lg border border-border bg-surface px-5 py-7 shadow-card sm:px-7`, `border-t border-border pt-7`, `focus-ring flex min-h-12 w-full rounded-md bg-accent px-5 text-sm font-bold text-accent-foreground hover:bg-accent-dark`
- Pattern notes: Use white surface panels with an 8px radius, thin token borders, compact uppercase field labels, 20px to 28px panel padding, and purple accent actions. Keep form sections separated by `border-t border-border` and preserve full width controls on small screens.

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

### Protected Page Shell

- Purpose: Shared content frame for authenticated Profile, Job Details, Dashboard, and Find Jobs screens.
- Classes: `bg-background px-4 py-8 sm:px-8 lg:px-20 lg:py-12`, inner `mx-auto w-full max-w-5xl`, section spacing `gap-5` to `gap-6`.
- Pattern notes: Keep primary authenticated page content at the same readable width across profile, job details, dashboard, and search. The navbar may remain wider so its navigation has room to breathe.

### CV Upload Flow

- Purpose: Upload PDF CVs through the authenticated profile action without blocking the user response on analytics.
- Pattern notes: Keep the Server Action body limit above the 5 MB product limit for multipart overhead. The upload response should only wait for Storage and profile persistence; analytics must not block this interaction.

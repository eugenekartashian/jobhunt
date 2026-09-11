# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 5 — Dashboard (4/4 complete)
**Last completed:** 17 Analytics Charts — PostHog Data
**Next:** Phase 5 review and polish

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [x] 06 Profile Save Logic
- [x] 07 AI Profile Extraction from Resume
- [x] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [x] 09 Find Jobs Page — Full UI
- [x] 10 Adzuna Job Discovery
- [x] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [x] 12 Job Details Page — Full UI
- [x] 13 Company Research Agent

### Phase 5 — Dashboard

- [x] 14 Dashboard Page — Full UI
- [x] 15 Stats Bar — Real Data
- [x] 16 Recent Activity — Real Data
- [x] 17 Analytics Charts — PostHog Data

### Post-Feature 17 Polish

- [x] Authenticated navbar avatar, sign-out action, and profile navigation state
- [x] Profile checkbox/select/button interaction polish
- [x] Resume upload, extraction, generation, and profile-save loading states
- [x] Profile polish follow-up: CV terminology, resilient OAuth avatar fallback, animated drag-over state, improved experience date layout, full-width responsibilities, and calendar indicator hover feedback
- [x] Find Jobs polish: Lucide search/filter/company icons, clear query action, styled selects, pagination pointer states, and debounced Spain location suggestions via Photon
- [x] Find Jobs search fix: normalize selected `City, Country` locations to the city before sending the Adzuna `where` parameter
- [x] Job Details polish: replace placeholder glyphs with Lucide icons and align research/apply/loading interactions with project controls
- [x] Job Details navbar polish: use the authenticated avatar and logout controls instead of the legacy Profile CTA

---

## Decisions Made During Build

- 2026-09-08: Homepage follows `context/designs/landing-page.png` exactly as the visual source. CTA links point to `/login` and `/find-jobs` until Phase 02 adds authenticated redirects.
- 2026-09-08: Header, footer, metadata, and live homepage copy use the canonical `Job Hunt` brand and `public/logo.png`. The supplied screenshot assets still contain `JobPilot` text and are left unchanged.
- 2026-09-08: Auth uses InsForge SSR OAuth for Google and GitHub. `/oauth` starts provider sign-in, `/callback` exchanges the OAuth code and writes InsForge session cookies, `/auth/refresh` exposes SDK session refresh, and `proxy.ts` protects `/dashboard`, `/profile`, and `/find-jobs`.
- 2026-09-08: Homepage primary CTAs are request-dynamic and route authenticated users to `/dashboard`; logged-out users go to `/login`.
- 2026-09-08: Auth recover fix corrected login provider links from `/auth/oauth` to `/oauth`. Local route check confirms Google OAuth start returns a provider redirect and writes the temporary PKCE cookie.
- 2026-09-08: Added a temporary protected `/dashboard` screen so successful OAuth no longer lands on a Next.js 404 before the full Phase 5 dashboard UI exists.
- 2026-09-08: Temporary authenticated placeholders now cover `/dashboard` and `/profile`, both using the project navbar and a working `/auth/sign-out` POST route.
- 2026-09-08: Review fixes added server-side InsForge session validation to protected placeholder pages and route-prefixed error logging for OAuth, callback, and sign-out handlers.
- 2026-09-08: PostHog initialization is wired through `instrumentation-client.ts`, `lib/posthog-client.ts`, and `lib/posthog-server.ts`. Current tracked events include homepage CTA clicks, OAuth provider start, successful OAuth callback, protected placeholder views, sign-out, and global client exceptions.
- 2026-09-09: PostHog review fixes added manual App Router `$pageview` tracking and moved `auth_signed_out` capture to the server logout route so the event is flushed before cookies are cleared.
- 2026-09-09: Feature 04 applied the InsForge schema from `migrations/20260909_feature_04_database_schema.sql`: `profiles`, `agent_runs`, `jobs`, and `agent_logs` now exist with own-user RLS policies, foreign keys, constraints, indexes, and update triggers where needed. The private `resumes` storage bucket also exists.
- 2026-09-09: Feature 04 follow-up added `jobs.is_tailored`, `public.handle_new_user()` with an `auth.users` insert trigger to bootstrap profile rows after OAuth signup, and shared database model types in `types/index.ts`.
- 2026-09-09: Feature 04 storage hardening added four `storage.objects` RLS policies for the private `resumes` bucket. Every operation is restricted to keys whose first path segment is the authenticated user's ID.
- 2026-09-10: Feature 05 replaced the temporary profile placeholder with the full profile UI from `context/designs/profile.png`. It is composed from `ProfileAttentionBanner`, `ConnectedAccounts`, `ResumeSection`, and `ProfileForm`, with completion feedback, resume selection validation, editable profile sections, tag and work experience controls, and responsive styling.
- 2026-09-10: Profile visual corrections now match the tutorial reference more closely: orange attention tags with a purple ring, a separate LinkedIn connected account card, 5 MB resume guidance, and chips for job titles and preferred locations. OAuth callbacks and logged in homepage actions now route to `/profile`.
- 2026-09-10: Feature 06 added server-loaded profile state, `auth.uid()`-scoped profile upsert, tutorial-required field validation, inline save errors/success, and private resume upload on file selection. Resume files use the deterministic `{user_id}/resume.pdf` path and the saved URL/key are persisted to `profiles`.
- 2026-09-10: Feature 06 was aligned with the tutorial structure: shared `calculateCompletion`/`MissingField` utilities, separate `uploadResume` action on file selection, current resume link, and `profile_saved`/`resume_uploaded` PostHog events.
- 2026-09-10: Profile preferences now support multiple work arrangements through checkbox selection. `remote_preference` was migrated from `text` to `text[]`; `Any` remains exclusive and the migration was applied and verified in InsForge.
- 2026-09-10: Feature 07 added `extractProfile` with authenticated resume download, `pdf-parse` v2 text extraction, GPT-4o JSON parsing, and draft-only form population. Existing non-empty profile fields are preserved; the user must still click `Save Profile`.
- 2026-09-10: Feature 07 follow-up fixed PDF parser bundling for Next server runtime, added month/date and education-degree normalization, supports all extracted work positions, preserves the uploaded filename in Storage, and updated the Resume section layout. Known open issue: `Key Responsibilities` remains empty after extraction despite the source resume containing bullet points; company, title, dates, and other profile fields work.
- 2026-09-11: Feature 08 added authenticated `POST /api/resume/generate`: saved profile data is polished by GPT-4o, rendered into a server-side PDF with `@react-pdf/renderer`, uploaded to private InsForge Storage as the active generated resume, and exposed through the existing protected `/api/resume` viewer. The Resume UI now shows generation loading, success, and error states.
- 2026-09-11: Feature 08 follow-up refined the generated PDF header spacing so long contact details no longer overlap the name, and constrained the GPT summary to neutral resume style without names or third-person pronouns. `lint`, production build, and `git diff --check` pass.
- 2026-09-11: Removed the LinkedIn connected-account block and its connect/disconnect UI. The profile's plain LinkedIn URL field remains available as contact information; no LinkedIn account integration or workflow automation is exposed.
- 2026-09-11: Feature 09 added the protected `/find-jobs` UI with local mock jobs, search controls, success state, filter/sort controls, match-score bars, salary/date columns, and visual pagination. Adzuna, GPT scoring, and real filtering remain scoped to Features 10–11.
- 2026-09-11: Feature 10 connected `/find-jobs` to `POST /api/agent/find`: Adzuna search supports Spain (`es`) and several European country hints, GPT-4o scores each result, and authenticated `agent_runs`, `jobs`, and `agent_logs` records are written to InsForge. Real filtering, sorting, and pagination remain Feature 11. End-to-end API testing requires local `ADZUNA_APP_ID` and `ADZUNA_APP_KEY`.
- 2026-09-11: Feature 10 follow-up aligned the implementation with the tutorial: one batch GPT scoring request, dynamic Find Jobs page loading, Spain-first country fallback with explicit country detection, safe API errors, discovery timestamps, source badges, and a server-side jobs query helper. Feature 11 remains intentionally untouched.
- 2026-09-11: Feature 11 started to wire the existing filter controls to real client-side text filtering, match filtering, score/date sorting, and 20-item pagination. Job details links remain out of scope.
- 2026-09-11: Feature 11 completed: filters are controlled by `FindJobsClient`, results are derived with `useMemo`, pagination shows 20 jobs per page with working Previous/Next/page buttons, and result counts reset correctly when filters or a new search change the list.
- 2026-09-11: Feature 11 follow-up fixed Newest/Oldest ordering by preserving Adzuna's publication timestamp in `found_at` and using `created_at` as a tie-breaker for older records.
- 2026-09-11: Feature 12 added the protected dynamic `/find-jobs/[id]` page with user-scoped InsForge data, detail components matching `context/designs/job-details.png`, external View Job Post/Apply actions, match reasoning, skills comparison, job description, and a Company Research empty state. Job titles in the table now link to the detail page; research remains Feature 13.
- 2026-09-11: Feature 12 follow-up made every job table data cell navigate to the detail page and added a direct full-post link below the complete Adzuna description preview. Adzuna still provides the source preview rather than a guaranteed full posting body.
- 2026-09-11: Feature 13 added the authenticated `POST /api/agent/research` flow. It resolves the employer homepage through Browserbase Fetch first, uses one Browserbase/Stagehand session for the homepage plus up to three internal pages, falls back to GPT-4o synthesis when browser research is unavailable, validates the 9-field dossier, saves it to the user-scoped job, logs started/completed/failed progress to `agent_logs`, and records `company_researched` in PostHog. The job details card now uses a dedicated `ResearchCompanyButton` with loading/error states and refreshes after success.
- 2026-09-11: Feature 13 added `@browserbasehq/stagehand`, `@browserbasehq/sdk`, and `zod`; Next server externalization keeps the Stagehand ESM package out of the webpack bundle. Lint, TypeScript, webpack production build, and `git diff --check` pass.
- 2026-09-11: Feature 13 follow-up made GPT dossier parsing tolerant of scalar strings in list fields such as `gapsToAddress`, preventing valid-but-misshaped model output from turning the research request into a 500.
- 2026-09-11: Phase 5 started. Feature 14 will use `context/designs/dashboard.png` as the visual source of truth, with the first slice focused on the protected dashboard UI and empty/loading-safe data boundaries before Features 15–17 wire real statistics, activity, and PostHog charts.
- 2026-09-11: Feature 14 replaced the dashboard placeholder with a protected responsive dashboard matching `context/designs/dashboard.png`: four stat cards, recent activity timeline, company research bar chart, jobs-over-time line chart, and match-score distribution chart. Values are intentionally mock data; Features 15–17 will connect real InsForge and PostHog data.
- 2026-09-11: Feature 15 connected the four dashboard stat cards to user-scoped InsForge `jobs` data: total saved jobs, average match score, jobs with company research, and jobs found in the last seven days. Activity and charts remain mock until Features 16–17.
- 2026-09-11: Feature 16 connected Recent Activity to user-scoped `agent_runs` and researched jobs, merging the latest five completed searches and company research events with relative timestamps.
- 2026-09-11: Dashboard charts now use Recharts with responsive sizing, token-based colors, hover states, active line points, and tooltips. Their series remain the Feature 14 mock series until Feature 17 wires PostHog analytics data.
- 2026-09-11: Feature 17 replaced dashboard chart mock series with user-scoped PostHog HogQL queries for job searches over 30 days, match score ranges over 30 days, and company research over 7 days. Charts show explicit empty states when query credentials or events are unavailable.
- 2026-09-11: Dashboard and Find Jobs layout polish aligned both authenticated screens to the shared `max-w-page` shell, standardized outer spacing, and tightened dashboard section gaps for a more compact data-dense layout.
- 2026-09-11: Dashboard and Find Jobs content now match the Profile and Job Details layout with the shared `max-w-5xl` readable container and the same responsive page spacing.
- 2026-09-11: Fixed OAuth avatar rendering so initials remain visible until the provider image successfully loads, failed image URLs fall back cleanly, and a changed avatar URL resets the loading state.
- 2026-09-11: Optimized production CV uploads by allowing the 5 MB PDF plus multipart overhead through Server Actions and removing the nonessential PostHog upload event from the upload request so analytics cannot delay the response.
- 2026-09-11: Fixed the profile upload client so a thrown Server Action or production 500 always clears the uploading state and displays an actionable error instead of leaving the CV control spinning indefinitely.
- 2026-09-11: Fixed the production CV upload 500 caused by `pdf-parse` loading `@napi-rs/canvas` and `DOMMatrix` at module initialization. PDF parsing is now loaded only when `Extract Profile` is used, so ordinary uploads do not initialize the parser.
- 2026-09-11: Added `@napi-rs/canvas` as a direct production dependency and externalized it with `pdf-parse` so Vercel can provide the `DOMMatrix`, `Path2D`, and `ImageData` globals required by PDF extraction.
- 2026-09-11: PDF extraction now explicitly initializes the `@napi-rs/canvas` globals before importing `pdf-parse`, preventing the parser from evaluating before `DOMMatrix`, `Path2D`, and `ImageData` exist in Vercel's Node runtime.
- 2026-09-11: Fixed the remaining Vercel PDF extraction failure by directly importing `pdfjs-dist`'s worker module and registering it as `globalThis.pdfjsWorker` before `pdf-parse` creates a parser. Added `pdfjs-dist` as a direct dependency and a local declaration for its worker entrypoint.
- 2026-09-11: Added responsive mobile navigation to the shared `Navbar`: a `Menu`/`X` toggle, accessible expanded state, active route styling, and link-close behavior. Desktop navigation remains unchanged at the `sm` breakpoint and above.
- 2026-09-11: Refined the mobile navbar layout so guests see the CTA centered with the menu button at the right edge, while authenticated users keep avatar/sign-out controls before the right-aligned menu button.
- 2026-09-11: Compacted the mobile login page by removing the mobile hero min-height, reducing responsive padding and heading sizes, tightening the provider panel spacing, and preserving full-size OAuth tap targets.

---

## Notes

- Homepage uses supplied public assets: `public/images/dashboard-demo.png`, `public/images/jobs-lists.png`, `public/images/agnet-log.png`, and `public/images/user-icon.png`.
- Auth requires `NEXT_PUBLIC_INSFORGE_URL` and `NEXT_PUBLIC_INSFORGE_ANON_KEY`. `.env.local.example` includes the backend URL; add the anon key locally before end-to-end OAuth testing.
- InsForge metadata showed Google and GitHub providers enabled. If OAuth rejects the callback, add the local and production `/callback` URLs to the backend allowed redirect URLs.
- Database schema is versioned in `migrations/20260909_feature_04_database_schema.sql`. Runtime code should still scope every table query by `user_id` even though RLS is enabled.
- Feature 04 follow-up is versioned in `migrations/20260909_feature_04_follow_up.sql`.
- Feature 04 storage access is versioned in `migrations/20260909_feature_04_storage_rls.sql`.
- Feature 06 persists profile edits through `actions/profile.ts`; a selected resume uploads immediately through `uploadResume`, and its returned key is saved with the profile.
- Feature 07 extraction is server-side only and requires `OPENAI_API_KEY`; it reads the stored resume key and never writes extracted AI data directly to the database.

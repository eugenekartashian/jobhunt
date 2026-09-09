# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 1 — Foundation
**Last completed:** 04 Database Schema
**Next:** 05 Profile Page — Full UI

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [ ] 05 Profile Page — Full UI
- [ ] 06 Profile Save Logic
- [ ] 07 AI Profile Extraction from Resume
- [ ] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [ ] 09 Find Jobs Page — Full UI
- [ ] 10 Adzuna Job Discovery
- [ ] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

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

---

## Notes

- Homepage uses supplied public assets: `public/images/dashboard-demo.png`, `public/images/jobs-lists.png`, `public/images/agnet-log.png`, and `public/images/user-icon.png`.
- Auth requires `NEXT_PUBLIC_INSFORGE_URL` and `NEXT_PUBLIC_INSFORGE_ANON_KEY`. `.env.local.example` includes the backend URL; add the anon key locally before end-to-end OAuth testing.
- InsForge metadata showed Google and GitHub providers enabled. If OAuth rejects the callback, add the local and production `/callback` URLs to the backend allowed redirect URLs.
- Database schema is versioned in `migrations/20260909_feature_04_database_schema.sql`. Runtime code should still scope every table query by `user_id` even though RLS is enabled.
- Feature 04 follow-up is versioned in `migrations/20260909_feature_04_follow_up.sql`.
- Feature 04 storage access is versioned in `migrations/20260909_feature_04_storage_rls.sql`.

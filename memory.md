# Memory — Feature 17 Dashboard Analytics

Last updated: 2026-09-11

## What was built

- Phase 1 foundation, Phase 2 profile/resume Features 05-08, Phase 3 Find Jobs Features 09-11, and Phase 4 Job Details Features 12-13 are complete.
- Feature 13 includes the user-scoped company research API, Browserbase Fetch + Stagehand research, GPT-4o fallback synthesis, 9-field dossier persistence, progress logging, PostHog tracking, and responsive dossier card UI.
- Feature 13 UI now matches the tutorial layout more closely: responsive insight-card grid, full-width role rationale, and separated source pills.
- Feature 14 replaced the dashboard placeholder with `components/dashboard/DashboardPageContent.tsx`: four stats cards, recent activity timeline, company research bar chart, jobs-found line chart, and match-score distribution chart. `app/dashboard/page.tsx` now renders the protected dashboard with the signed-in navbar.
- Feature 15 connected the four stat cards to `lib/dashboard.ts`, which calculates user-scoped totals from InsForge `jobs` data.
- Feature 16 added `getDashboardActivityForUser`, which merges completed user-scoped `agent_runs` with jobs containing `company_research`, sorts them by timestamp, and renders the latest five entries.
- Dashboard charts now use `recharts` with responsive sizing and interactive tooltips, while their data remains mock until Feature 17.
- Feature 17 replaced mock chart series with server-side PostHog HogQL queries scoped by `distinct_id`: job searches and match scores use the last 30 days, company research uses the last 7 days. Missing query credentials or failed queries return empty chart states.

## Decisions made

- The dashboard is built in four planned slices: Feature 14 UI, Feature 15 real stats, Feature 16 recent activity, and Feature 17 PostHog analytics.
- `context/designs/dashboard.png` is the visual source of truth: four stat cards, recent activity timeline, company research bar chart, jobs-over-time line chart, and match-score distribution chart.
- Feature 14 established the protected dashboard layout with mock values. Feature 15 provides real stats, Feature 16 provides real activity, and Feature 17 provides PostHog analytics with empty states.
- Use existing project tokens, navbar, card, spacing, and typography patterns. Do not add LinkedIn integration.

## Problems solved

- Feature 13 GPT dossier parsing now accepts scalar or JSON-string values for list fields such as `gapsToAddress`.
- Stagehand is configured as a Next server external package so the production webpack build succeeds.
- `npm run build` can fail when the environment cannot reach Google Fonts through `next/font`; `next build --webpack` passes.

## Current state

- Feature 13 is complete and reviewed.
- Phase 5 Features 14-17 are complete.
- Local credentials exist but are intentionally not stored in this memory.
- Known older limitation: AI profile extraction can leave Key Responsibilities empty in some runs.

## Next session starts with

- Phase 5 is complete. The next step is a review and polish pass before starting a new phase.

## Open questions

- Features 15-17 still need a decision on whether empty charts should show zeroed axes or a concise empty state when real data is absent.

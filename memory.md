# Memory — Feature 04 database foundation

Last updated: 2026-09-09 15:43 CEST

## What was built

Feature 04 database foundation is implemented and verified in InsForge. The project currently has three migration files: the main schema migration, the follow-up migration, and the storage RLS migration.

- `migrations/20260909_feature_04_database_schema.sql` creates `profiles`, `agent_runs`, `jobs`, and `agent_logs` with constraints, indexes, foreign keys, update triggers, and 16 own-user RLS policies.
- `migrations/20260909_feature_04_follow_up.sql` adds `jobs.is_tailored`, the `public.handle_new_user()` trigger for automatic profile bootstrap after signup, and related schema polish.
- `migrations/20260909_feature_04_storage_rls.sql` enables RLS on `storage.objects` and adds four own-user policies for the private `resumes` bucket.
- `types/index.ts` contains the shared `Profile`, `WorkExperience`, `Education`, `AgentRun`, `Job`, and `AgentLog` interfaces and supporting unions.
- `context/architecture.md` documents the schema and the `{user_id}/...` resume key convention.
- `context/progress-tracker.md` marks Feature 04 complete and points to Feature 05.

## Decisions made

InsForge's storage table uses `bucket` and `key` columns, so the tutorial's Supabase-style `storage.objects` policy was adapted to the actual InsForge schema.

Resume objects must use keys beginning with the authenticated user's UUID, for example `{user_id}/resume.pdf`. Every storage operation checks both the `resumes` bucket and the first path segment.

The four application tables remain protected by own-user RLS. Runtime queries should still include explicit user scoping for clarity and defense in depth.

## Problems solved

The private `resumes` bucket existed, but storage RLS was not enabled and no path-scoped policies were present. This is now applied and verified in the backend.

The tutorial describes five migrations, while this project uses three migration files because the four table definitions are grouped into one migration. The resulting schema and security behavior now match the tutorial; the migration count is intentionally different. A migration is a versioned database change instruction used to reproduce schema, trigger, index, and policy changes consistently.

## Current state

InsForge verification confirms:

- `profiles`, `agent_runs`, `jobs`, and `agent_logs` exist.
- The private `resumes` bucket exists.
- `storage.objects` RLS is enabled with four verified policies.
- The auth user trigger and profile update behavior are present.
- Feature 04 is complete; no known backend blocker remains.

PostHog and the homepage/auth foundation are also implemented. The worktree contains unrelated existing project changes; preserve them.

## Next session starts with

Start Feature 05, Profile Page — Full UI. Read the required context files first, then build the profile form and resume management UI using the existing navbar, tokens, and shared types.

## Open questions

The actual profile persistence actions and resume upload flow are intentionally deferred to Features 06–08.

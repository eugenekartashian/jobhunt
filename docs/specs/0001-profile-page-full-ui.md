**Status**: Proposed

## Summary

Feature 05 builds the complete authenticated profile page from `context/designs/profile.png`.
It gives the user a realistic form for reviewing and editing profile information, but uses local mock data for this feature.
Database writes, file upload, resume extraction, and PDF generation stay in later features.

## Context

This is a new web feature in the existing Next.js application. The project already uses InsForge for authentication and database storage, TypeScript, Tailwind CSS, and a shared top navigation. The page is an authenticated internal surface, so search engine metadata is not required.

The design source is the supplied `context/designs/profile.png`, supported by the Feature 05 section in `context/build-plan.md` and the existing tokens in `app/globals.css`.

## Requirements

- **AC-1**: An authenticated user can open `/profile` and see the project navbar with `Dashboard`, `Find Jobs`, and `Profile`, with `Profile` visually active.
- **AC-2**: The page shows a profile attention banner with a completion percentage ring and missing field tags based on the mock profile.
- **AC-3**: The page shows a resume panel with a drag and drop style upload area, PDF and size guidance, a `Select Resume` button, and a `Generate Resume from Profile` button. These controls are presentational in Feature 05 and do not write to backend storage.
- **AC-4**: The profile form contains Personal Info, Professional Info, Work Experience, Education, and Job Preferences sections matching the supplied design and schema fields.
- **AC-5**: Form controls are interactive locally. Text fields, selects, skill tags, industry tags, work experience rows, education fields, and job preference fields can be edited without a page reload.
- **AC-6**: The user can add and remove skill tags, industry tags, and work experience rows. At least one work experience row remains available for editing.
- **AC-7**: The form has a visible `Save Profile` action. In this feature it gives local success feedback and does not call InsForge.
- **AC-8**: The page provides responsive layouts for narrow and wide screens without clipped labels, overlapping controls, or inaccessible fields.
- **AC-9**: Loading, save success, invalid file type, and oversized file states are represented accessibly. File selection accepts PDF files only and limits validation to 5 MB.

## Decision

Build the page as a server authenticated route that renders a client form component. The server page verifies the current user and passes a mock profile seeded with the authenticated email. The client component owns temporary form state and local validation.

Use the existing `Navbar`, existing design tokens, native form controls, and small feature specific components. Do not add a form library or a new state management package for a mock UI feature.

**Implementation skills**: Tailwind conventions from project context, `architect` at `/Users/eugenekartashian/.agents/skills/architect/`, and the project's existing Next.js rules in `AGENTS.md`.

## Feature design

**Data model sketch**:

The page edits an in memory `Profile` shaped like the existing `types/index.ts` `Profile` type. It has one profile object, an embedded `Education` object, and a one to many `WorkExperience` list. No database migration is needed for this UI feature.

**State transitions**:

Form state moves from `idle` to `saving` to `saved` after the InsForge save action, or returns to `idle` with an inline error. Resume selection moves from `empty` to `selected` or `invalid` based on PDF type and 5 MB size validation.

**API surface**:

No API or Server Action is added in Feature 05. The existing authenticated page guard remains the only server boundary. Features 06 to 08 add persistence and resume operations.

**Value sourcing**:

| Action | Value produced or displayed | Source |
|---|---|---|
| Render profile | User email | Authenticated InsForge user returned by the server guard |
| Render fields | All other initial form values | Feature 05 mock profile fixture |
| Completion banner | Percentage and missing tags | Derived from required mock profile fields in the client component |
| Add or remove tags | Updated skills and industries | Local component state |
| Add or remove experience | Work experience list | Local component state |
| Resume validation | File name, type, size, and error state | Browser File API and the 5 MB rule in this spec |
| Save feedback | Saved status message | Local component state, no backend response |

**Key invariants**:

- The email field is visible and disabled.
- The form always keeps one editable work experience row.
- Resume validation accepts only PDF files at or below 5 MB.
- No Feature 05 action writes profile or storage data to InsForge.
- All fields remain keyboard accessible and have visible labels.

**Security model**:

Only an authenticated user can access `/profile`. The server route continues to use `requireUserAuthenticated`. Mock data is temporary and contains no persistent personal data. Later persistence must scope reads and writes to the authenticated user's profile through existing RLS.

**Configuration required**:

No new environment variables or third party credentials.

**Critical test scenarios**:

- Happy path: authenticated user edits fields, adds a skill, adds an experience row, and receives local save feedback, verifies AC-5, AC-6, and AC-7.
- Failure case: user selects a non PDF or file larger than 5 MB and receives an accessible validation message, verifies AC-3 and AC-9.
- Auth and permission: unauthenticated access redirects to `/login`, verifies AC-1.
- Responsive path: form remains usable at narrow viewport width, verifies AC-8.

## Build plan

1. Replace the temporary profile placeholder with the authenticated page shell and profile fixture, including the existing navbar and completion banner. Satisfies AC-1 and AC-2.
2. Build the resume panel and local file validation states. Satisfies AC-3 and AC-9.
3. Build the reusable profile form sections and controlled local state for all schema fields. Satisfies AC-4 and AC-5.
4. Add tag editing, work experience row management, local save feedback, and responsive styling. Satisfies AC-6, AC-7, and AC-8.
5. Verify lint, production build, keyboard access, and the design at desktop and narrow viewport sizes. Satisfies AC-1 through AC-9.

## Consequences

The page can be reviewed visually without waiting for database actions. The temporary local state is intentionally discarded on reload, so persistence is not claimed until Feature 06. Resume extraction and generation buttons are visible but remain non destructive placeholders until their dedicated features are implemented.

## Follow-up

- Feature 06 must replace the local save action with an authenticated InsForge Server Action and prefill the form from `profiles`.
- Feature 07 must add resume text extraction and the post upload `Extract from Resume` flow.
- Feature 08 must add resume PDF generation and storage upload.

## Rationale

The supplied design and build plan already define the page composition and the profile schema. Keeping Feature 05 presentational makes the page independently reviewable and preserves the planned separation between UI, persistence, extraction, and PDF generation.

## Options considered

1. Build the complete UI with local state and mock data. Recommended because it matches the existing build plan and keeps the feature reviewable.
2. Wire database persistence and storage now. Rejected because it collapses Features 05 through 08 and makes a visual milestone depend on unfinished upload and AI flows.
3. Use a form library and global state. Rejected because the page does not yet need cross route state and the dependency would add complexity to a local mock flow.

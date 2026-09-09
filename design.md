# Design Direction

source: image

## Character

Job Hunt uses a clean product launch page with a white frame, soft pastel glow panels, quiet grid dividers, and embedded product screenshots. The feel is calm, precise, and tool focused.

## Build Mandate

Match `context/designs/landing-page.png` for the homepage composition. Keep the top nav minimal, use the supplied product screenshots from `public/images`, and keep feature sections divided by thin borders and subtle striped bands.

## Tokens

Token values live in `app/globals.css`. Use Tailwind classes generated from those tokens and do not use raw color classes in components.

## Responsive Behavior

Desktop keeps the reference two column feature layout. Small screens stack the same sections in source order, keep all CTAs reachable, and avoid cropping text or images.

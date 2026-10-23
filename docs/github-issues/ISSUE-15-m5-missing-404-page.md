# M5: Redirects target a nonexistent /404 page

**Labels:** `bug`, `frontend`, `priority: medium` · **PR:** #30 (PR-5)

## Problem
`photo/[id].astro` L28 and `artist/[username].astro` L19 call `Astro.redirect('/404')`, but no `react/src/pages/404.astro` exists — visitors get the unstyled platform default.

## Fix
Create `react/src/pages/404.astro` using `ClientLayout`, themed ("This stash is empty"), with links home.

## Acceptance Criteria
- [ ] Bad photo/artist URLs render the styled 404

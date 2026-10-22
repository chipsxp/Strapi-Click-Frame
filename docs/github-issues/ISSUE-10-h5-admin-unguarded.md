# H5: /admin area is unguarded, links to a dead page, shows hardcoded stats

**Labels:** `security`, `bug`, `frontend`, `priority: high` · **PR:** PR-6

## Problem
`react/src/layouts/AdminLayout.astro` performs no role check — any visitor renders `/admin`. Its nav links to `/admin/users`, which doesn't exist (404). Stats (1,636 photos / 12 users / 84 tags) are hardcoded fiction.

## Evidence
- `react/src/layouts/AdminLayout.astro` (no `Astro.locals` check)
- `react/src/pages/admin/index.astro` L11-19 (hardcoded numbers)

## Fix
1. In `AdminLayout` frontmatter: redirect to `/` unless `Astro.locals.user?.role?.type` is `editor`/`admin`.
2. Remove the `/admin/users` link (or build the page in a follow-up).
3. Wire the stat cards to `/api/community-stats`.

## Acceptance Criteria
- [ ] Anonymous/author visit to `/admin` → redirect
- [ ] Editor sees dashboard with real counts
- [ ] No dead nav links

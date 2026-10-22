# H4: No rate limiting on any endpoint

**Labels:** `security`, `performance`, `backend`, `priority: high` · **PR:** PR-2

## Problem
`strapi::ratelimit` is absent from `photorium/config/middlewares.ts`. Login (credential stuffing), registration (spam), comments (spam), uploads (15MB×N to ImageKit = storage abuse), view-increment (count inflation), and community-stats (H1 compute cost) are all unlimited.

## Evidence
- `photorium/config/middlewares.ts` (default stack only)

## Fix
1. Enable `strapi::ratelimit` globally with generous defaults.
2. Per-route stricter limits via route `config.middlewares`: `/api/auth/*`, `/api/comments`, `/api/donations/*`, `/api/upload`, `/api/photos/:id/view`, `/api/community-stats`.

## Acceptance Criteria
- [ ] Repeated rapid login attempts → 429
- [ ] Normal browsing unaffected

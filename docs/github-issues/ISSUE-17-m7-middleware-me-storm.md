# M7: Auth middleware calls Strapi /users/me on every request

**Labels:** `performance`, `frontend`, `priority: medium` · **PR:** #32 (PR-7)

## Problem
`react/src/middleware.ts` performs an uncached `GET /api/users/me?populate=role` on EVERY request (pages, API routes, static assets), adding a backend round-trip to each hit.

## Fix
Skip the fetch for static asset paths (`/_astro/`, `/favicon*`, file extensions); optionally add a 30s in-memory cache keyed by JWT hash.

## Acceptance Criteria
- [ ] Static asset requests do not hit Strapi
- [ ] Session validation still immediate after logout/expiry

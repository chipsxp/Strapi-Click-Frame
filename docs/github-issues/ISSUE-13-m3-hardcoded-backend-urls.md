# M3: Hardcoded localhost/127.0.0.1 Strapi URLs in client-shipped code

**Labels:** `bug`, `frontend`, `priority: medium` · **PR:** PR-5

## Problem
Client-side code hardcodes the dev backend: `Navbar.tsx` (`http://127.0.0.1:1337`), `PhotoGrid.tsx` image fallback (`http://localhost:1337`), `photo/[id].astro` fallback. Non-`PUBLIC_` env vars are undefined in client bundles, so these break in production and leak internal topology.

## Evidence
- `react/src/components/Navbar.tsx` L18
- `react/src/components/PhotoGrid.tsx` L80
- `react/src/pages/photo/[id].astro` L51

## Fix
1. Add `PUBLIC_STRAPI_URL` to `react/.env` + document in new `react/.env.example`.
2. Prefer same-origin Astro API routes for client fetches (e.g. Navbar's new-art check → `/api/notifications`-style route) to remove browser→Strapi CORS dependence.
3. Server-side fallbacks read `import.meta.env.STRAPI_URL` (server only).

## Acceptance Criteria
- [ ] No `localhost`/`127.0.0.1` string ships in client JS
- [ ] New-art indicator and grid images work in production

# H1: /api/community-stats leaks author emails and is an unauthenticated DoS vector

**Labels:** `security`, `performance`, `backend`, `priority: high` · **PR:** PR-2

## Problem
`community-stat.getStats` returns `top_photos_chips/cheddar/clicks` as raw photo documents with `populate: ['author']` — full user objects including `email` are exposed to anonymous callers. It also loads ALL monthly reactions and donations into memory (`findMany` with no limit) on every uncached request — an expensive unauthenticated endpoint.

## Evidence
- `photorium/src/api/community-stat/controllers/community-stat.ts` L40-65, L114-135

## Fix
1. Project explicit photo fields; map author to `{ username, nickname }` only.
2. Replace full-table fetches with `db.query().count()` / filtered aggregations.
3. Add a 60s in-memory cache for the anonymous payload.
4. Rate-limit (ISSUE-09).

## Acceptance Criteria
- [ ] Response contains no `email` or other private user fields
- [ ] Response time stable under repeated anonymous calls (cache hit)
- [ ] Hash Brown Hub page renders unchanged

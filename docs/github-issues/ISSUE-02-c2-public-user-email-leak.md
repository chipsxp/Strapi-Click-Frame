# C2: Public user enumeration leaks email addresses (PII)

**Labels:** `security`, `backend`, `frontend`, `priority: critical` · **PR:** PR-1

## Problem
Bootstrap grants `plugin::users-permissions.user.find` and `user.findOne` to the **public** role. `email` is not marked `"private": true` in the user schema extension, so `GET /api/users` anonymously returns every user's email (and other PII/stats). `react/src/pages/artist/[username].astro` currently depends on this endpoint.

## Evidence
- `photorium/src/index.ts` L80-87 (public grant)
- `photorium/src/extensions/users-permissions/content-types/user/schema.json` L24 (`email` lacks `private: true`)

## Product decision (2026-10-22)
Public artist discovery is a feature: anonymous visitors must be able to find artists and see their work and stats. Public `user.find`/`findOne` therefore **stay granted**. The munch stats (`last_classic_munch_at`, `classic_munch_given_total`, `cheddar_munch_balance`) stay publicly **readable** because the Hash Brown Hub leaderboards depend on them. The protection needed is **write** protection, which is handled in C1.

## Fix
1. Keep public `user.find`/`findOne` in bootstrap.
2. Mark only `email`, `real_name` and `special_date` as `"private": true` in the user schema (`special_date` already was).
3. New `GET /api/user-ext/public-profile/:username` controller returning an explicit allow-list: `{ documentId, username, nickname, bio, avatar, followersCount, followingCount }`.
4. Repoint `artist/[username].astro` to the public-profile endpoint.

## Follow-up
Showing `email`/`real_name` to the owner once logged in and email-verified is already covered by `/api/users/me`, which returns the caller's own private fields.

## Acceptance Criteria
- [ ] Unauthenticated `GET /api/users` still returns artists, with no `email`, `real_name` or `special_date`
- [ ] Hash Brown Hub stats render unchanged
- [ ] Artist profile pages render fully via the public-profile endpoint

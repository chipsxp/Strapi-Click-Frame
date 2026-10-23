# C3: Author spoofing on photo/comment/category create endpoints

**Labels:** `security`, `backend`, `priority: critical` · **PR:** #6 (PR-1) · **Status:** Fix applied (commit c0613c8, PR #6)

## Problem
`photo.create`, `comment.create`, and `category.create` are granted to authenticated users, but no policy forces `author`/`user` to equal the caller. The Astro proxies set authorship correctly, but direct calls to the Strapi API can attribute content to ANY user.

## Evidence
- `photorium/src/index.ts` L105/L110/L116 (grants)
- `photorium/src/api/photo/routes/photo.ts`, `comment/routes/comment.ts`, `category/routes/category.ts` — no policy on `create`

## Fix
1. New global policy `photorium/src/policies/force-author.ts`: rejects unauthenticated; overwrites `ctx.request.body.data.author` (photos, comments) or `data.user` (categories) with the caller's ID/documentId before the controller runs.
2. Attach `global::force-author` to the `create` config of all three core routers.

## Acceptance Criteria
- [ ] POST `/api/photos` with another user's `author` → stored with caller as author
- [ ] Same for comments (`author`) and categories (`user`)
- [ ] Existing dashboard upload/comment flows unaffected

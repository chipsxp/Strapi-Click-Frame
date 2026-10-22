# M8: `any` type regressions vs the zero-any mandate (2026-05-11)

**Labels:** `chore`, `backend`, `frontend`, `priority: medium` · **PR:** PR-7

## Problem
The strict TypeScript refactor mandate is regressing: `as any` in `custom-photo.ts` L15, `err: any` in `custom-reaction.ts` L81 / `comment.ts` L61, `d: any`×6 in `community-stat.ts`, `commentData: any` in `api/comment.ts` L30, `any[]` in `index.astro` L48 and `dashboard.astro` L717.

## Fix
Apply the established local-interface pattern (`CategoryWithUser`-style from the 2026-05-11 refactor) to each site; `astro check` and `strapi build` must pass with zero `any`.

## Acceptance Criteria
- [ ] `grep -rn "as any|: any" photorium/src react/src` → no hits (excluding comments)
- [ ] Both builds green

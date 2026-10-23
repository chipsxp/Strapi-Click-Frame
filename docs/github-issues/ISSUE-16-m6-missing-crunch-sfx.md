# M6: Crunch sound effect missing and referenced at two different paths

**Labels:** `bug`, `frontend`, `priority: medium` · **PR:** #30 (PR-5)

## Problem
`CommentSection.tsx` plays `/crunch.mp3`; `PhotoGrid.tsx` plays `/sfx/crunch.mp3`. `react/public/` contains only `favicon.svg` — both silently fail (`.catch(() => {})` hides it), and the paths are inconsistent.

## Fix
Add the asset at `react/public/sfx/crunch.mp3` and point both components at `/sfx/crunch.mp3`.

## Acceptance Criteria
- [ ] Sound plays on munch + comment in dev and production build

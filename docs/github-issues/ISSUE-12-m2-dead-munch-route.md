# M2: Dead API route api/munch.ts (always 403, superseded by give-chip)

**Labels:** `bug`, `frontend`, `chore`, `priority: medium` · **PR:** PR-5

## Problem
`react/src/pages/api/munch.ts` POSTs to `/api/reactions` (collection create), which the bootstrap never grants to any role — so it always fails with 403. `give-chip.ts` (→ `custom-reaction.give`) is the working path. `munch.ts` has zero callers in app code (only an old planning doc mentions it).

## Fix
Delete `react/src/pages/api/munch.ts`.

## Acceptance Criteria
- [ ] File removed; `astro check` and build pass; no references remain

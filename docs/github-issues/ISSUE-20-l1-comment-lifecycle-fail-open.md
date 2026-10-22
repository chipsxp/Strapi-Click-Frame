# L1: Comment lifecycle fails open on lookup errors

**Labels:** `bug`, `backend`, `priority: low` · **PR:** PR-7

## Problem
`comment/lifecycles.ts` `beforeCreate` catches errors when fetching the parent photo and returns silently, allowing comments on missing/invalid photos. Fail-closed is safer.

## Evidence
- `photorium/src/api/comment/content-types/comment/lifecycles.ts` L26-35

## Fix
Remove the empty catch — let the lifecycle throw; return 500 only when photo not found.

## Acceptance Criteria
- [ ] Comment on deleted/missing photo → error (not accepted)

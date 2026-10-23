# L4: Public/authenticated granted admin-scoped upload action

**Labels:** `security`, `backend`, `priority: low` · **PR:** #32 (PR-7)

## Problem
Bootstrap grants `plugin::upload.api.upload` (an admin-content-manager-style action ID) to authenticated and editor roles. This ID does not correspond to a normal user API route and may bypass upload-provider limits; combined with no size/rate limits, any authenticated user can upload unlimited 15MB files to ImageKit.

## Evidence
- `photorium/src/index.ts` L122, L180

## Fix
1. Remove the wrong upload grant.
2. Rely on `api::photo.photo.create` upload (already guarded by `force-author` from ISSUE-03) + rate limiting (ISSUE-09).
3. Consider a separate upload-policy scope in future if needed.

## Acceptance Criteria
- [ ] `plugin::upload.api.upload` removed from bootstrap
- [ ] Photo upload still works via dashboard

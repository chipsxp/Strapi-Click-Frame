# L5: Notifications endpoint populates all author fields recursively

**Labels:** `security`, `frontend`, `priority: low` · **PR:** #30 (PR-5)

## Problem
`react/src/pages/api/notifications.ts` uses `populate[author][populate]=*` for the "new photos by followed artists" query, pulling in every relation of the author including private fields.

## Evidence
- `react/src/pages/api/notifications.ts` L12-18

## Fix
Project only needed author fields (`username`, `nickname`, `avatar`) and photo summary.

## Acceptance Criteria
- [ ] Notification response has no nested private author fields

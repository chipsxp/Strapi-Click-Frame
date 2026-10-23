# L6: index.astro uses 9999999 sentinel number to mean "no results"

**Labels:** `bug`, `frontend`, `priority: low` · **PR:** #30 (PR-5)

## Problem
When a flavor has no photos, `index.astro` builds `filters: { id: { $in: [9999999] } }` to force an empty list. This is fragile and confusing.

## Evidence
- `react/src/pages/index.astro` L47-52

## Fix
Return early / render empty state when the photo ID list is empty.

## Acceptance Criteria
- [ ] No magic sentinel in filters
- [ ] Empty flavor renders "No munchables yet" state

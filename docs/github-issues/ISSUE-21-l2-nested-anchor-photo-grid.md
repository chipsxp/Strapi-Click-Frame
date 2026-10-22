# L2: PhotoGrid contains nested/interactive `<a>` via `<object>` wrapping `<img>`

**Labels:** `bug`, `frontend`, `a11y`, `priority: low` · **PR:** PR-5

## Problem
`PhotoGrid.tsx` wraps images in `<object>` elements inside `<a>`; `object` can load content and, combined with absolutely-positioned `<a>` overlays, produces invalid nested-interactive HTML and unpredictable keyboard/screen-reader behavior.

## Evidence
- `react/src/components/PhotoGrid.tsx` L73-87

## Fix
Replace `<object>` with `<img>` + explicit `alt`; keep a single semantic `<a>` as card wrapper.

## Acceptance Criteria
- [ ] Valid HTML; Lighthouse a11y score unchanged/green

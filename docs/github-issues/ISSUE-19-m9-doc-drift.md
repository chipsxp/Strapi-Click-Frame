# M9: Documentation drift — .clinerules/key_facts describe the old layout and versions

**Labels:** `documentation`, `chore`, `priority: medium` · **PR:** #32 (PR-7)

## Problem
`.clinerules` claims the Strapi backend is the repo root with a root `package.json` (actually `photorium/`) and Strapi 5.43.0 (actually 5.46.0). ADR-001 says the Astro loader lives in root `node_modules` — it's now in `react/package.json`. `key_facts.md` critical-file map partially stale. Wrong docs cause agents to edit the wrong paths.

## Fix
1. Rewrite `.clinerules` structure/commands for the `photorium/` layout and correct versions.
2. Append ADR-012 marking ADR-001 superseded (loader moved to `react/`). (ADR-011 was used by PR-1.)
3. Sync `docs/project_notes/key_facts.md` critical-file map and versions.

## Acceptance Criteria
- [ ] Docs match `photorium/package.json`, `react/package.json`, and actual paths
